// Vercel serverless function: reads an uploaded document with Claude and returns structured deal data.
import Anthropic from "@anthropic-ai/sdk"
import { authorize } from "./_auth.js"
import { EXTRACTION_TOOL, EXTRACTION_PROMPT } from "../src/lib/extract.js"

const MAX_B64 = 4_000_000   // Vercel request bodies top out around 4.5 MB
const MAX_TEXT = 200_000
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"]

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" })
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: "Document import isn't set up yet: add ANTHROPIC_API_KEY in the hosting settings." })
  const auth = await authorize(req)
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {}
  const { filename = "document", mediaType = "", data, text } = body
  let docBlock: any
  if (typeof text === "string" && text.trim()) {
    docBlock = { type: "text", text: `File: ${filename}\n\n${text.slice(0, MAX_TEXT)}` }
  } else if (typeof data === "string" && data.length) {
    if (data.length > MAX_B64) return res.status(413).json({ error: "File is too large. Keep uploads under about 3 MB, or split the PDF." })
    if (mediaType === "application/pdf") docBlock = { type: "document", source: { type: "base64", media_type: "application/pdf", data } }
    else if (IMAGE_TYPES.includes(mediaType)) docBlock = { type: "image", source: { type: "base64", media_type: mediaType, data } }
    else return res.status(415).json({ error: "Unsupported file type. Use PDF, image, Excel or CSV." })
  } else return res.status(400).json({ error: "No file content received." })

  try {
    const client = new Anthropic()
    const resp = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
      max_tokens: 4000,
      system: EXTRACTION_PROMPT,
      tools: [EXTRACTION_TOOL as any],
      tool_choice: { type: "tool", name: EXTRACTION_TOOL.name },
      messages: [{ role: "user", content: [docBlock, { type: "text", text: `Extract the underwriting data from ${filename}.` }] }],
    })
    const call: any = resp.content.find((b: any) => b.type === "tool_use")
    if (!call) return res.status(502).json({ error: "Couldn't read data from this document." })
    return res.status(200).json({ extraction: call.input })
  } catch (e: any) {
    const status = e?.status === 429 ? 429 : 500
    return res.status(status).json({ error: status === 429 ? "rate_limited" : "Import hit an error: " + (e?.message || "unknown") })
  }
}
