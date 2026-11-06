// Parser for the Census Building Permits Survey county files (www2.census.gov/econ/bps/County/coYYYYa.txt).
// The files have two header rows, then one comma separated row per county. Columns are found by header name,
// so small layout changes don't break it. Shared by the server and tests, so no Node or browser imports.

export interface PermitRow { units1: number; units2to4: number; units5: number; bldgs5: number }

const clean = (s: string) => s.trim().replace(/^"|"$/g, "").toLowerCase()

export function parsePermitFile(text: string, stateFips: string, countyFips: string): PermitRow | null {
  const lines = text.split(/\r?\n/)
  const h1 = (lines[0] || "").split(",").map(clean), h2 = (lines[1] || "").split(",").map(clean)
  // Group headers sit on row 1 (e.g. "1-unit", "2-units", "3-4 units", "5+ units"); the first block is the imputed total.
  const start = (label: RegExp) => h1.findIndex(c => label.test(c))
  const i1 = start(/^1-unit/), i2 = start(/^2-units?/), i34 = start(/^3-4/), i5 = start(/^5\+/)
  if (i5 < 0) return null
  // Inside each group the order is Bldgs, Units, Value. The group label may sit over any of the three, so find "Units" next to it.
  const unitsAt = (i: number) => { if (i < 0) return -1; for (const k of [i, i + 1, i - 1]) if (k >= 0 && /^units$/.test(h2[k] || "")) return k; return i + 1 }
  const bldgsAt = (i: number) => { const u = unitsAt(i); return u < 0 ? -1 : u - 1 }
  const st = String(Number(stateFips)), co = String(Number(countyFips))
  for (const line of lines.slice(2)) {
    const c = line.split(",")
    if (c.length < i5 + 2) continue
    if (String(Number(c[1])) !== st || String(Number(c[2])) !== co) continue
    const n = (k: number) => k < 0 ? 0 : Number(String(c[k]).replace(/"/g, "")) || 0
    return { units1: n(unitsAt(i1)), units2to4: n(unitsAt(i2)) + n(unitsAt(i34)), units5: n(unitsAt(i5)), bldgs5: n(bldgsAt(i5)) }
  }
  return null
}

/** Read the supply picture: permitted 5+ units vs existing apartment stock and renter household growth. */
export function supplyRead(perYear: { year: number; units5: number }[], stock5: number | null, renterGrowthPerYr: number | null) {
  const last3 = perYear.slice(-3).reduce((a, y) => a + y.units5, 0)
  const pctOfStock = stock5 && stock5 > 0 ? last3 / stock5 : null
  const avgPermits = perYear.length ? perYear.slice(-3).reduce((a, y) => a + y.units5, 0) / Math.min(3, perYear.length) : null
  const coverage = renterGrowthPerYr && avgPermits ? renterGrowthPerYr / avgPermits : null
  const level = pctOfStock == null ? "unknown" : pctOfStock >= 0.10 ? "heavy" : pctOfStock >= 0.05 ? "elevated" : "light"
  return { last3, pctOfStock, avgPermits, coverage, level }
}
