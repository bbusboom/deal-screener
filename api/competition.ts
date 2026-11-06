// Competition scan: Claude with web search finds competing apartment properties near a deal, their asking rents
// and current concessions, and new buildings under construction or leasing up. Returns structured JSON plus sources.
// Cost: about $0.01 per search (capped at MAX_SEARCHES) plus tokens. The browser caches each scan for a week.
import Anthropic from "@anthropic-ai/sdk"
import { authorize } from "./_auth.js"

const MAX_SEARCHES = 8

const SCHEMA = `{
  "summary": "3 to 5 sentences: how competitive the submarket is right now, how much new supply is coming, and what it means for this deal",
  "properties": [
    { "name": "", "address": "", "distanceMi": 0, "yearBuilt": 0, "units": 0,
      "status": "stabilized | lease-up | under construction | planned",
      "delivery": "e.g. Q2 2027, or empty",
      "rents": [ { "type": "studio | 1 bed | 2 bed | 3 bed", "rent": 0 } ],
      "concession": "exact offer as advertised, e.g. 6 weeks free on 12 month leases, or empty",
      "concessionWeeks": 0,
      "source": "url" } ],
  "pipeline": "2 to 4 sentences on projects under construction or planned nearby, total units and expected delivery",
  "concessions": "1 to 3 sentences on how common concessions are and how large",
  "suggestions": { "marketRentNote": "", "concessionPct": 0, "vacancyPct": 0, "rentGrowthYear1Pct": 0, "rentGrowthYear2Pct": 0, "notes": [""] }
}`

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" })
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: "Deal School AI isn't set up yet: add ANTHROPIC_API_KEY in the hosting settings." })
  const auth = await authorize(req)
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

  const b = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {}
  const clip = (v: any, n = 120) => String(v ?? "").slice(0, n).trim()
  const address = clip(b.address, 200), city = clip(b.city, 80), state = clip(b.state, 2), zip = clip(b.zip, 5)
  if (!address && !city && !zip) return res.status(400).json({ error: "Add the property's address or ZIP first." })
  const mix = Array.isArray(b.units) ? b.units.slice(0, 12).map((u: any) => `${clip(u.type, 40)}: ${Number(u.count) || 0} units at $${Number(u.rent) || 0}${u.sf ? `, ${Number(u.sf)} SF` : ""}`).join("; ") : ""
  const built = Number(b.yearBuilt) || 0
  const today = new Date().toISOString().slice(0, 10)
  const where = [address, city, state, zip].filter(Boolean).join(", ")

  const system = `You are Deal School's market analyst. Today is ${today}. Research the apartment competition around ${where} for a buyer underwriting a multifamily property.
Subject property: ${mix || "unit mix not given"}${built ? `; built about ${built}` : ""}.

Use web search. Good sources: apartment listing sites (Apartments.com, Zillow rentals, Rent.com, the property's own website), local news and business journals, city planning or permit records, and developer announcements. Find:
1. Five to ten competing apartment properties within about 3 miles, similar in age and quality where possible, with current asking rents by bedroom type and any advertised concession or special.
2. New supply: buildings under construction, in lease up, or approved or planned nearby, with unit counts and expected delivery dates. Lease up properties matter most because they compete with concessions.
3. How common and how large concessions are in the submarket right now.

Then return ONLY a JSON object, no other text, in exactly this shape:
${SCHEMA}
Rules: numbers are plain numbers (no $ or commas); rents are monthly asking rents; use 0 or empty string when unknown, never guess a number you did not see; every property needs a source URL you actually used. concessionWeeks converts the offer to weeks free on a 12 month lease (one month free = 4.3). suggestions are your recommended underwriting inputs for year 1 and 2 given the competition and supply (concessionPct as % of gross potential rent). Be factual and specific.`

  const client = new Anthropic()
  const model = process.env.MARKET_MODEL || process.env.POLICY_MODEL || process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5"
  const messages: any[] = [{ role: "user", content: `Scan the competition for the apartment property at ${where}.` }]
  const seen = new Map<string, string>()
  let text = ""
  try {
    for (let turn = 0; turn < 4; turn++) {
      const resp: any = await client.messages.create({
        model, max_tokens: 4000, system, messages,
        tools: [{ type: "web_search_20250305", name: "web_search", max_uses: MAX_SEARCHES, user_location: { type: "approximate", country: "US", ...(city ? { city } : {}) } }] as any,
      })
      for (const blk of resp.content) {
        if (blk.type === "text") text += blk.text
        if (blk.type === "web_search_tool_result" && Array.isArray(blk.content)) for (const r of blk.content) if (r.url) seen.set(r.url, r.title || r.url)
      }
      if (resp.stop_reason !== "pause_turn") break
      messages.push({ role: "assistant", content: resp.content })
    }
  } catch (e: any) {
    const status = e?.status === 429 ? 429 : 500, msg = String(e?.message || "")
    return res.status(status).json({ error: status === 429 ? "rate_limited" : /web_search|tool/i.test(msg) ? "Web search isn't enabled for this API key. Turn it on in the Claude Console." : "Competition scan hit an error: " + msg })
  }

  const m = text.match(/\{[\s\S]*\}/)
  let data: any = null
  try { data = m ? JSON.parse(m[0]) : null } catch { /* fall through */ }
  if (!data) return res.status(502).json({ error: "The scan came back in an unexpected format. Try again." })
  const n = (v: any) => { const x = Number(v); return isFinite(x) && x > 0 ? x : 0 }
  data.properties = (Array.isArray(data.properties) ? data.properties : []).slice(0, 15).map((p: any) => ({
    name: clip(p.name, 80), address: clip(p.address, 120), distanceMi: n(p.distanceMi), yearBuilt: n(p.yearBuilt), units: n(p.units),
    status: ["stabilized", "lease-up", "under construction", "planned"].includes(p.status) ? p.status : "stabilized",
    delivery: clip(p.delivery, 40), concession: clip(p.concession, 160), concessionWeeks: n(p.concessionWeeks), source: clip(p.source, 300),
    rents: (Array.isArray(p.rents) ? p.rents : []).slice(0, 6).map((r: any) => ({ type: clip(r.type, 20), rent: n(r.rent) })).filter((r: any) => r.rent > 0),
  }))
  return res.status(200).json({ ...data, asOf: today, where, sources: [...seen].slice(0, 20).map(([url, title]) => ({ url, title })) })
}
