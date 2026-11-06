// Client side of Market check: home state, live market data, the policy briefing, and the checks that turn
// state rules and market data into concrete changes to a deal.
import { useEffect, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import { supabase, apiHeaders } from "./store"
import type { Deal } from "./model"
import type { MarketData } from "./checks"
export * from "./checks"

/* ---------- home state ---------- */
const HOME = "dealSchool.homeState"
export const getHomeState = () => { try { return localStorage.getItem(HOME) || "" } catch { return "" } }
export async function setHomeState(session: Session | null, abbr: string) {
  try { localStorage.setItem(HOME, abbr) } catch {}
  dispatchEvent(new Event("homestate"))
  if (supabase && session) await supabase.auth.updateUser({ data: { home_state: abbr } }).catch(() => {})
}
/** Pull the saved home state from the account onto this device. */
export function syncHomeState(session: Session | null) {
  const v = session?.user.user_metadata?.home_state
  if (typeof v === "string" && v && v !== getHomeState()) { try { localStorage.setItem(HOME, v) } catch {} dispatchEvent(new Event("homestate")) }
}
export function useHomeState() {
  const [v, setV] = useState(getHomeState)
  useEffect(() => { const f = () => setV(getHomeState()); addEventListener("homestate", f); return () => removeEventListener("homestate", f) }, [])
  return v
}

async function post(url: string, body: unknown) {
  const r = await fetch(url, { method: "POST", headers: await apiHeaders(), body: JSON.stringify(body) })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j.error === "signin" ? "Sign in again to use live data." : j.error === "access_code" ? "Enter the access code on the Deal School AI tab first." : j.error === "rate_limited" ? "Busy right now, try again in a minute." : j.error || `Error ${r.status}`)
  return j
}

const MKEY = "dealSchool.market."
export function cachedMarket(d: Deal): MarketData | null {
  try { const v = localStorage.getItem(MKEY + (d.address || "") + "|" + (d.zip || "")); return v ? JSON.parse(v) : null } catch { return null }
}
export async function fetchMarket(d: Deal): Promise<MarketData> {
  const m = await post("/api/market", { address: d.address, zip: d.zip, state: d.state }) as MarketData
  try { localStorage.setItem(MKEY + (d.address || "") + "|" + (d.zip || ""), JSON.stringify(m)) } catch {}
  return m
}

export interface Briefing { state: string; city: string; asOf: string; text: string; sources: { url: string; title: string }[] }
const PKEY = "dealSchool.policy."
const WEEK = 7 * 24 * 3600 * 1000
export function cachedBriefing(state: string, city: string, route: string): Briefing | null {
  try {
    const v = localStorage.getItem(PKEY + [state, city.toLowerCase(), route].join("|"))
    if (!v) return null
    const b = JSON.parse(v) as Briefing & { at: number }
    return Date.now() - b.at < WEEK ? b : null
  } catch { return null }
}
export async function fetchBriefing(state: string, city: string, route: "learner" | "pro"): Promise<Briefing> {
  const b = await post("/api/policy", { state, city, route }) as Briefing
  try { localStorage.setItem(PKEY + [state, city.toLowerCase(), route].join("|"), JSON.stringify({ ...b, at: Date.now() })) } catch {}
  return b
}


/* ---------- competition scan (AI with web search) ---------- */
export interface CompProperty { name: string; address: string; distanceMi: number; yearBuilt: number; units: number; status: "stabilized" | "lease-up" | "under construction" | "planned"; delivery: string; rents: { type: string; rent: number }[]; concession: string; concessionWeeks: number; source: string }
export interface CompetitionScan {
  summary: string; properties: CompProperty[]; pipeline: string; concessions: string
  suggestions: { marketRentNote?: string; concessionPct?: number; vacancyPct?: number; rentGrowthYear1Pct?: number; rentGrowthYear2Pct?: number; notes?: string[] }
  asOf: string; where: string; sources: { url: string; title: string }[]
}
const CKEY = "dealSchool.competition."
const compKey = (d: Deal) => CKEY + (d.address || "") + "|" + (d.zip || "")
export function cachedCompetition(d: Deal): CompetitionScan | null {
  try { const v = localStorage.getItem(compKey(d)); if (!v) return null; const c = JSON.parse(v); return Date.now() - c.at < WEEK ? c : null } catch { return null }
}
export async function fetchCompetition(d: Deal, city: string): Promise<CompetitionScan> {
  const c = await post("/api/competition", { address: d.address, zip: d.zip, state: d.state, city, units: d.units.map(u => ({ type: u.type, count: u.count, rent: u.rent, sf: u.sf })) }) as CompetitionScan
  try { localStorage.setItem(compKey(d), JSON.stringify({ ...c, at: Date.now() })) } catch {}
  return c
}
