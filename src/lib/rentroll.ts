// Unit level rent roll: find the columns, normalize rows, and analyze occupancy, loss to lease and lease expirations.
// Pure functions (no browser APIs) so they can be tested on their own.

export interface RRUnit { unit: string; type: string; sf: number; rent: number; market: number; status: "occupied" | "vacant" | "notice" | "nonrev"; start: string; end: string }
export type RRField = "unit" | "type" | "sf" | "rent" | "market" | "status" | "start" | "end" | "tenant"
export const RR_FIELDS: { k: RRField; label: string; re: RegExp }[] = [
  { k: "unit", label: "Unit", re: /^(unit|apt|apartment|unit ?(no|#|number)|bldg[- ]?unit|#)$/i },
  { k: "type", label: "Unit type / floor plan", re: /(unit ?type|floor ?plan|^plan$|^type$|bed.*bath|^bd\/ba|^beds?$)/i },
  { k: "sf", label: "Square feet", re: /(sq\.? ?f|^sf$|square|size|sqft)/i },
  { k: "rent", label: "In place rent", re: /((lease|actual|current|contract|charged|tenant|in.?place) ?rent|^rent$|rent amount|monthly rent)/i },
  { k: "market", label: "Market rent", re: /(market|asking|scheduled)/i },
  { k: "status", label: "Status", re: /(status|occupan|occ\b|vacan)/i },
  { k: "start", label: "Lease start / move in", re: /(move.?in|lease ?start|start ?date|lease from|^from$)/i },
  { k: "end", label: "Lease end", re: /(lease ?end|expir|exp\.? ?date|end ?date|lease to|^to$)/i },
  { k: "tenant", label: "Resident name", re: /(resident|tenant|name|lessee)/i },
]

/** Find the header row (first row matching 3+ known columns) and map fields to column indexes. */
export function detectColumns(rows: any[][]): { headerRow: number; map: Partial<Record<RRField, number>> } {
  let best = { headerRow: 0, map: {} as Partial<Record<RRField, number>>, score: 0 }
  for (let r = 0; r < Math.min(25, rows.length); r++) {
    const map: Partial<Record<RRField, number>> = {}
    rows[r].forEach((c, i) => {
      const h = String(c ?? "").trim(); if (!h) return
      for (const f of RR_FIELDS) if (map[f.k] === undefined && f.re.test(h)) { map[f.k] = i; break }
    })
    const score = Object.keys(map).length
    if (score > best.score) best = { headerRow: r, map, score }
  }
  return { headerRow: best.headerRow, map: best.map }
}

const money = (v: any) => { if (typeof v === "number") return v; const n = Number(String(v ?? "").replace(/[$,\s]/g, "").replace(/^\((.*)\)$/, "-$1")); return isFinite(n) ? n : 0 }
export function toDate(v: any): string {
  if (v == null || v === "") return ""
  if (v instanceof Date) return isNaN(+v) ? "" : v.toISOString().slice(0, 10)
  if (typeof v === "number" && v > 20000 && v < 80000) return new Date(Date.UTC(1899, 11, 30) + v * 86400000).toISOString().slice(0, 10) // Excel serial
  const t = Date.parse(String(v)); return isNaN(t) ? "" : new Date(t).toISOString().slice(0, 10)
}

export function buildUnits(rows: any[][], headerRow: number, map: Partial<Record<RRField, number>>): RRUnit[] {
  const get = (r: any[], f: RRField) => map[f] === undefined ? "" : r[map[f]!]
  const out: RRUnit[] = []
  for (const r of rows.slice(headerRow + 1)) {
    const unit = String(get(r, "unit") ?? "").trim()
    if (!unit || /total|summary|average/i.test(unit)) continue
    const rent = money(get(r, "rent")), market = money(get(r, "market")), sf = money(get(r, "sf"))
    const st = String(get(r, "status") ?? "").toLowerCase(), tenant = String(get(r, "tenant") ?? "").trim()
    let status: RRUnit["status"] = "occupied"
    if (/model|office|employee|down|admin|non.?rev/.test(st + " " + tenant.toLowerCase())) status = "nonrev"
    else if (/vacant|vac\b|unrented/.test(st) || (/vacant/i.test(tenant))) status = "vacant"
    else if (/notice|ntv|leaving/.test(st)) status = "notice"
    else if (!st && !tenant && rent <= 0) status = "vacant"
    else if (map.status === undefined && rent <= 0) status = "vacant"
    out.push({ unit, type: String(get(r, "type") ?? "").trim() || "Unknown", sf, rent: status === "vacant" ? 0 : rent, market, status, start: toDate(get(r, "start")), end: toDate(get(r, "end")) })
  }
  return out
}

export function analyze(units: RRUnit[], asOf = new Date()) {
  const total = units.length, occ = units.filter(u => u.status === "occupied" || u.status === "notice")
  const byType = new Map<string, RRUnit[]>()
  units.forEach(u => { const k = u.type; byType.set(k, [...(byType.get(k) || []), u]) })
  const avg = (xs: number[]) => { const v = xs.filter(x => x > 0); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0 }
  const types = [...byType].map(([type, us]) => {
    const o = us.filter(u => u.status === "occupied" || u.status === "notice")
    const inPlace = avg(o.map(u => u.rent)), market = avg(us.map(u => u.market)), sf = avg(us.map(u => u.sf))
    return { type, count: us.length, occupied: o.length, vacant: us.filter(u => u.status === "vacant").length, nonrev: us.filter(u => u.status === "nonrev").length,
      sf, inPlace, market, ltl: market > 0 && inPlace > 0 ? market - inPlace : 0, minRent: Math.min(...o.map(u => u.rent).filter(x => x > 0), Infinity), maxRent: Math.max(...o.map(u => u.rent), 0) }
  }).sort((a, b) => b.count - a.count)
  // Expirations: next 12 months by month, plus month to month (lease end passed or blank on an occupied unit).
  const y0 = asOf.getFullYear(), m0 = asOf.getMonth()
  const months = Array.from({ length: 12 }, (_, i) => { const d = new Date(y0, m0 + i, 1); return { key: d.toISOString().slice(0, 7), label: d.toLocaleString("en-US", { month: "short", year: "2-digit" }), count: 0 } })
  let mtm = 0, later = 0
  for (const u of occ) {
    if (!u.end) { mtm++; continue }
    const k = u.end.slice(0, 7)
    if (k < months[0].key) { mtm++; continue }
    const m = months.find(x => x.key === k); if (m) m.count++; else later++
  }
  const below = occ.filter(u => u.market > 0 && u.rent > 0 && u.rent < u.market * 0.9).length
  const marketTotal = units.reduce((a, u) => a + (u.market || 0), 0) * 12
  const inPlaceTotal = occ.reduce((a, u) => a + u.rent, 0) * 12
  return {
    total, occupied: occ.length, vacant: units.filter(u => u.status === "vacant").length, nonrev: units.filter(u => u.status === "nonrev").length,
    notice: units.filter(u => u.status === "notice").length, physicalOcc: total ? occ.length / total : 0,
    types, months, mtm, later, below, maxMonthShare: total ? Math.max(...months.map(m => m.count)) / total : 0,
    marketTotal, inPlaceTotal, economicOcc: marketTotal > 0 ? inPlaceTotal / marketTotal : 0,
    avgSf: avg(units.map(u => u.sf)), avgRent: avg(occ.map(u => u.rent)),
  }
}
