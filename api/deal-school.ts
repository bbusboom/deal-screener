// Vercel serverless function: runs Deal School with the Anthropic API.
// The API key stays on the server. Set ANTHROPIC_API_KEY in Vercel's environment variables.
import Anthropic from "@anthropic-ai/sdk"
import { authorize } from "./_auth.js"
import { TOOL_DEFS, RULES, COMMON, runTool, type Route } from "../src/lib/agent.js"
import { norm } from "../src/lib/model.js"

const MAX_TOOL_ROUNDS = 8
const MAX_MESSAGES = 30
const MAX_CHARS = 4000

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" })
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: "Deal School AI isn't set up yet: add ANTHROPIC_API_KEY in the hosting settings." })

  const auth = await authorize(req)
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {}
  const route: Route = body.route === "pro" ? "pro" : "learner"
  const history: { role: "user" | "assistant"; content: string }[] = Array.isArray(body.messages) ? body.messages.slice(-MAX_MESSAGES) : []
  if (!history.length || history[history.length - 1].role !== "user") return res.status(400).json({ error: "Last message must be from the user." })
  if (history.some(m => typeof m.content !== "string" || m.content.length > MAX_CHARS)) return res.status(400).json({ error: "Message too long." })

  const lesson = typeof body.context === "string" && body.context.trim()
    ? `\n\nThe user is studying this lesson in the Deal School course right now. Answer questions in its context, at its level, and use its Oak Ridge example when it helps. Only use the deal tools if they ask about the deal in the screener.\n---\n${body.context.slice(0, 4000)}\n---`
    : ""
  let deal = norm(body.deal || {})
  let changed = false
  const client = new Anthropic()
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5"
  const messages: any[] = history.map(m => ({ role: m.role, content: m.content }))

  try {
    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
      const resp = await client.messages.create({
        model, max_tokens: 2000,
        system: `${RULES[route]}\n\n${COMMON}${lesson}`,
        tools: TOOL_DEFS as any,
        messages,
      })
      if (resp.stop_reason !== "tool_use" || round === MAX_TOOL_ROUNDS) {
        const text = resp.content.filter((b: any) => b.type === "text").map((b: any) => b.text).join("\n").trim()
        return res.status(200).json({ text: text || "(no answer)", deal: changed ? deal : undefined })
      }
      messages.push({ role: "assistant", content: resp.content })
      const results = resp.content.filter((b: any) => b.type === "tool_use").map((b: any) => {
        try {
          const out = runTool(b.name, b.input, deal)
          if (b.name === "update_inputs") { deal = out.deal; changed = true }
          return { type: "tool_result", tool_use_id: b.id, content: JSON.stringify(out.result) }
        } catch (e: any) {
          return { type: "tool_result", tool_use_id: b.id, content: "Error: " + (e?.message || String(e)), is_error: true }
        }
      })
      messages.push({ role: "user", content: results })
    }
  } catch (e: any) {
    const status = e?.status === 429 ? 429 : 500
    return res.status(status).json({ error: status === 429 ? "rate_limited" : "Deal School hit an error: " + (e?.message || "unknown") })
  }
}
