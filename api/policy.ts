// State policy briefing: who governs, which laws and proposals affect rental owners, and what to change in the model.
// Uses Claude's web search tool so it reflects current officials and bills. Cost: about $0.01 per search plus tokens,
// capped at MAX_SEARCHES per briefing. The browser caches each state's briefing for a week.
// Web search must be enabled for the organization in the Claude Console.
import Anthropic from "@anthropic-ai/sdk"
import { authorize } from "./_auth.js"
import { stateBy, RENT_LABEL } from "../src/lib/states.js"

const MAX_SEARCHES = 5

const NEUTRAL = `Stay strictly neutral on politics. Describe officials, parties and proposals factually: what they have said and done, and what the bill or measure would do. Report the main arguments from rental owners and from tenant advocates side by side, each in their own words where possible. Do not say whether a politician, party or proposal is good or bad, do not predict elections, and do not tell the reader how to vote.`

const FORMAT = `Formatting: short sections with a bold label on its own line, then "- " bullet points. No markdown tables. Plain words. Give dates for anything that can change (who holds an office, bill status). If you could not confirm something, say so instead of guessing.`

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" })
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: "Desk AI isn't set up yet: add ANTHROPIC_API_KEY in the hosting settings." })
  const auth = await authorize(req)
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {}
  const st = stateBy(body.state)
  if (!st) return res.status(400).json({ error: "Pick a state first." })
  const city = String(body.city || "").slice(0, 80).trim()
  const learner = body.route === "learner"
  const today = new Date().toISOString().slice(0, 10)

  const known = [
    `Effective property tax on owner occupied homes: about ${st.propTax}%`,
    `Top income tax rate: ${st.incomeTax}%`,
    `Rent regulation: ${RENT_LABEL[st.rent]}. ${st.rentCap || ""} ${st.rentNote || ""}`,
    st.reassess ? `Property tax after a sale: ${st.reassess}` : "",
  ].filter(Boolean).join("\n")

  const system = `You are Underwriting Desk's policy researcher. Today is ${today}. Write a briefing on how ${st.name}${city ? ` (focus on ${city})` : ""} state and local policy affects people who own rental apartments, so an owner can adjust their underwriting.
Search the web for current information; prefer official government sites, the state legislature, the state apartment or multifamily association, tenant advocacy groups and established news outlets. Elections were held on November 3, 2026, so check whether results change who holds office or what passed.

Baseline facts already shown to the user (verify, and correct them if you find they changed):
${known}

${learner
  ? `The reader is learning underwriting. Keep it to about 250 words, explain any term in a few words, and end with the two or three numbers in a deal this most likely changes.`
  : `The reader is a serious owner. Keep it to about 450 words, dense and specific.`}

Cover, in this order:
**Who's in charge** governor and party control of the legislature, with dates, and anyone newly elected.
**Rules in force now** rent regulation, eviction timeline and notice rules, security deposit limits, source of income or screening rules, property tax caps or reassessment rules.
**What's moving** bills, ballot measures, court cases or local ordinances on rent, evictions, property tax or insurance, with status and what each would do.
**Who's involved** the state apartment or multifamily association and other owner groups, and the main tenant advocacy groups, with their positions.
**Underwriting impact** concrete adjustments: rent growth limits, tax growth after purchase, insurance, eviction and bad debt allowance, exit cap risk from regulation.

${NEUTRAL}
${FORMAT}
This is general information, not legal advice; say so in one short line at the end.`

  const client = new Anthropic()
  const model = process.env.POLICY_MODEL || process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5"
  const messages: any[] = [{ role: "user", content: `Write the ${st.name} rental owner policy briefing${city ? ` for ${city}` : ""}.` }]
  const sources = new Map<string, string>(), seen = new Map<string, string>()
  let text = ""

  try {
    for (let turn = 0; turn < 3; turn++) {
      const resp: any = await client.messages.create({
        model, max_tokens: 2500, system, messages,
        tools: [{ type: "web_search_20250305", name: "web_search", max_uses: MAX_SEARCHES, user_location: { type: "approximate", country: "US", region: st.name } }] as any,
      })
      for (const b of resp.content) {
        if (b.type === "text") {
          text += b.text
          for (const c of b.citations || []) if (c.url) sources.set(c.url, c.title || c.url)
        }
        if (b.type === "web_search_tool_result" && Array.isArray(b.content)) for (const r of b.content) if (r.url) seen.set(r.url, r.title || r.url)
      }
      if (resp.stop_reason !== "pause_turn") break
      messages.push({ role: "assistant", content: resp.content })
    }
  } catch (e: any) {
    const status = e?.status === 429 ? 429 : 500
    const msg = String(e?.message || "")
    return res.status(status).json({ error: status === 429 ? "rate_limited" : /web_search|tool/i.test(msg) ? "Web search isn't enabled for this API key. Turn it on in the Claude Console under Settings → Privacy." : "Policy briefing hit an error: " + msg })
  }

  return res.status(200).json({
    state: st.abbr, city, asOf: today,
    text: text.trim() || "No briefing came back. Try again.",
    sources: [...(sources.size ? sources : seen)].slice(0, 12).map(([url, title]) => ({ url, title })),
  })
}
