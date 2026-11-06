// Assumption templates (a user's standard underwriting defaults) and read only share links.
import type { Session } from "@supabase/supabase-js"
import { supabase } from "./store"
import { type Deal, norm, DEFAULTS } from "./model"

/** Fields that are assumptions, not facts about one property. Expense lines are stored per unit and scaled on apply. */
const KEYS = ["cc", "vac", "conc", "bad", "mgmt", "res", "ltv", "rate", "amort", "ioYrs", "loanFee", "term", "sizeMode", "sizeDscr", "sizeDy",
  "hold", "expG", "taxG", "insG", "exitCap", "sellCost", "minCap", "minDscr", "minCoc", "minIrr", "minEm", "rg", "scen", "debt", "wf", "tx"] as const
const PER_UNIT = ["ins", "util", "rm", "pay", "adm", "contract", "turn", "mkt"] as const
export interface Template { name: string; savedAt: string; data: Record<string, any>; perUnit: Record<string, number> }

const LKEY = "dealScreener.templates", DKEY = "dealScreener.defaultTemplate"
export function listTemplates(): Template[] { try { return JSON.parse(localStorage.getItem(LKEY) || "[]") } catch { return [] } }
export const defaultTemplateName = () => { try { return localStorage.getItem(DKEY) || "" } catch { return "" } }
async function persist(session: Session | null, list: Template[], def: string) {
  try { localStorage.setItem(LKEY, JSON.stringify(list)); localStorage.setItem(DKEY, def) } catch {}
  if (supabase && session) await supabase.auth.updateUser({ data: { templates: list, default_template: def } }).catch(() => {})
}
/** Pull templates saved to the account onto this device. */
export function syncTemplates(session: Session | null) {
  const m = session?.user.user_metadata
  if (Array.isArray(m?.templates)) { try { localStorage.setItem(LKEY, JSON.stringify(m.templates)); localStorage.setItem(DKEY, String(m.default_template || "")) } catch {} }
}
export function templateFrom(d: Deal, name: string): Template {
  const units = d.units.reduce((a, u) => a + u.count, 0) || 1
  const data: Record<string, any> = {}; for (const k of KEYS) data[k] = structuredClone((d as any)[k])
  const perUnit: Record<string, number> = {}; for (const k of PER_UNIT) perUnit[k] = Math.round((d as any)[k] / units)
  return { name, savedAt: new Date().toISOString(), data, perUnit }
}
export async function saveTemplate(session: Session | null, d: Deal, name: string, makeDefault: boolean) {
  const list = listTemplates().filter(t => t.name !== name); list.unshift(templateFrom(d, name))
  await persist(session, list.slice(0, 20), makeDefault ? name : defaultTemplateName())
}
export async function deleteTemplate(session: Session | null, name: string) {
  await persist(session, listTemplates().filter(t => t.name !== name), defaultTemplateName() === name ? "" : defaultTemplateName())
}
export async function setDefaultTemplate(session: Session | null, name: string) { await persist(session, listTemplates(), name) }
/** Apply a template's assumptions to a deal; per unit expenses scale to this deal's unit count. */
export function applyTemplate(d: Deal, t: Template, withExpenses = true): Deal {
  const units = d.units.reduce((a, u) => a + u.count, 0)
  const patch: any = { ...structuredClone(t.data) }
  if (withExpenses && units > 0) for (const [k, v] of Object.entries(t.perUnit)) patch[k] = v * units
  return norm({ ...d, ...patch })
}
export function newDealFromDefault(state: string): Deal {
  const name = defaultTemplateName(), t = listTemplates().find(x => x.name === name)
  const base = norm({ ...DEFAULTS, state })
  return t ? applyTemplate(base, t, false) : base
}

/* ---------- share links: the deal is compressed into the URL, nothing is stored on a server ---------- */
const b64url = (b: Uint8Array) => { let s = ""; b.forEach(x => { s += String.fromCharCode(x) }); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") }
const unb64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0))
async function pipe(data: Uint8Array, stream: CompressionStream | DecompressionStream) {
  return new Uint8Array(await new Response(new Blob([data as BlobPart]).stream().pipeThrough(stream)).arrayBuffer())
}
export async function shareLink(d: Deal) {
  const { rr, notes, why, ic, dd, ...rest } = d as any
  void rr; void notes; void why; void ic; void dd // the unit list, private notes, adjustment reasons, thesis and diligence stay out of shared links
  const z = await pipe(new TextEncoder().encode(JSON.stringify(rest)), new CompressionStream("deflate-raw"))
  return `${location.origin}/#share=${b64url(z)}`
}
export async function readShare(hash: string): Promise<Deal | null> {
  const m = hash.match(/^#share=([\w-]+)$/); if (!m) return null
  try { return norm(JSON.parse(new TextDecoder().decode(await pipe(unb64url(m[1]), new DecompressionStream("deflate-raw"))))) } catch { return null }
}
