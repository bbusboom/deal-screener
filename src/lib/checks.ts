// Pure checks that turn a state's rules and live market data into concrete changes to a deal.
// Shared by the browser (Market tab) and the server (the AI's get_location tool), so no browser imports here.
import { type Deal, avgGrowth, project, usd, pct } from "./model.js"
import { stateBy, taxEstimate, DEFAULT_REASSESS, RENT_LABEL, type StateInfo } from "./states.js"

/* ---------- live data ---------- */
export interface AreaGrowth {
  name: string; year: number; compareYear: number | null
  population: number | null; households: number | null; renterHouseholds: number | null; housingUnits: number | null; apartmentUnits5plus: number | null; medianRent: number | null
  popGrowth5y: number | null; householdGrowth5y: number | null; renterGrowth5y: number | null; rentGrowth5y: number | null
  newResidentsPerYear: number | null; newRenterHouseholdsPerYear: number | null
}
export interface MarketData {
  fetchedAt: string
  location?: { matched: string; lat: number; lon: number; countyFips?: string; countyName?: string; tract?: string; placeFips?: string; placeName?: string } | null
  supply?: {
    county: AreaGrowth | null; city: AreaGrowth | null
    permits: { source: string; perYear: { year: number; units5: number; units2to4: number; units1: number }[]; ytd: { through: string; units5: number } | null } | null
    read: { last3: number; pctOfStock: number | null; avgPermits: number | null; coverage: number | null; level: "heavy" | "elevated" | "light" | "unknown" } | null
  }
  census?: {
    source: string; year: number; population: number | null; medianIncome: number | null; medianRent: number | null; medianHomeValue: number | null
    medianRealEstateTaxes: number | null; renterShare: number | null; rentalVacancy: number | null; effectiveTaxRate: number | null; medianYearBuilt: number | null
    popGrowth5y: number | null; rentGrowth5y: number | null; incomeGrowth5y: number | null; compareYear: number | null
  }
  flood?: { source: string; zone: string | null; subtype?: string | null; sfha: boolean | null; baseFloodElevation?: number | null; note?: string }
  hud?: { source: string; area?: string; smallArea: boolean; studio: number | null; oneBed: number | null; twoBed: number | null; threeBed: number | null; fourBed: number | null } | null
  rates?: { source: string; treasury10: { value: number; date: string } | null; sofr: { value: number; date: string } | null; mortgage30: { value: number; date: string } | null } | null
  jobs?: { source: string; unemployment: number; period: string; yearAgo: number | null } | null
  notes: string[]
}

/* ---------- checks: what the state and market mean for this deal ---------- */
export type Level = "ok" | "watch" | "flag" | "info"
export interface Check { level: Level; title: string; detail: string; fix?: { label: string; patch: Partial<Deal> } }

export function avgRent(d: Deal) {
  const n = d.units.reduce((s, u) => s + u.count, 0)
  return n ? d.units.reduce((s, u) => s + u.count * u.rent, 0) / n : 0
}

export function marketChecks(d: Deal, st: StateInfo | undefined, m: MarketData | null): Check[] {
  const out: Check[] = []
  if (!st) return [{ level: "info", title: "Pick the property's state", detail: "Taxes, rent rules and policy all depend on where the property is." }]
  const valid = d.price > 0 && d.units.some(u => u.count > 0)

  // Property tax after the sale
  const zipRate = m?.census?.effectiveTaxRate
  const est = valid ? taxEstimate(d.price, st, zipRate) : NaN
  if (valid && isFinite(est)) {
    const r = Math.round(est / 100) * 100
    const gap = d.tax > 0 ? d.tax / est - 1 : -1
    const basis = `about ${pct(est / d.price, 2)} of your price, from ${zipRate ? "the ZIP's owner occupied rate and " : ""}${st.name}'s typical rate for rentals`
    if (st.abbr === "OR")
      out.push({ level: "info", title: "Property tax: the seller's bill is a fair guide here", detail: st.reassess! })
    else if (gap < -0.2)
      out.push({ level: "flag", title: `Property tax looks low: ${usd(d.tax)} vs about ${usd(r)}`, detail: `${st.reassess || DEFAULT_REASSESS} Rough estimate: ${basis}. Confirm with the county assessor before you offer.`, fix: { label: `Use ${usd(r)}`, patch: { tax: r } } })
    else if (gap > 0.35)
      out.push({ level: "info", title: `Property tax is above a rough estimate (${usd(r)})`, detail: `That's conservative, which is fine if it came from the assessor or a tax consultant. ${st.reassess || DEFAULT_REASSESS}` })
    else
      out.push({ level: "ok", title: `Property tax is close to an estimate on your price (${usd(r)})`, detail: st.reassess || DEFAULT_REASSESS })
  }

  // Rent growth vs regulation
  const g = Math.max(...(d.rg.length ? d.rg : [avgGrowth(d)]))
  if (st.rent === "statewide" && st.capPct) {
    out.push({ level: g > st.capPct ? "flag" : "watch", title: g > st.capPct ? `Rent growth of ${g}% is above the ${st.name} cap` : `${st.name} caps rent increases`, detail: st.rentCap!,
      fix: g > st.capPct ? { label: `Cap growth at ${st.capPct}%`, patch: { rg: d.rg.map(v => Math.min(v, st.capPct!)) } } : undefined })
  } else if (st.rent === "statewide" || st.rent === "local") {
    out.push({ level: "watch", title: "Check local rent rules before you trust rent growth", detail: (st.rentCap || st.rentNote || "") + " Stabilized units grow with the official allowed increase, not the market." })
  } else if (st.rent === "preempted") {
    out.push({ level: "ok", title: "No rent control: rents can move with the market", detail: (st.rentNote ? st.rentNote + " " : "") + "Your rent growth is limited by the market, not by law. State law can change; the policy briefing shows what's moving." })
  } else {
    out.push({ level: "info", title: "No rent control today, but cities could adopt it", detail: (st.rentNote ? st.rentNote + " " : "") + "Watch city councils in the property's market." })
  }

  if (m?.flood?.zone) {
    out.push(m.flood.sfha
      ? { level: "flag", title: `In a FEMA flood zone (${m.flood.zone})`, detail: "Lenders require flood insurance on federally backed loans in this zone. Get a quote and add it to insurance; it can also limit buyers at exit. This is a screening result, not a certified flood determination." }
      : { level: "ok", title: `Flood zone ${m.flood.zone}: outside the 100 year floodplain`, detail: "Lower flood risk on FEMA's map. Zone X doesn't mean zero risk; ask about past water damage." })
  }

  const ar = avgRent(d)
  if (valid && m?.census?.medianRent && ar > 0) {
    const r = ar / m.census.medianRent - 1
    out.push({ level: r > 0.25 ? "watch" : "ok", title: `Average rent ${usd(ar)} vs ZIP median ${usd(m.census.medianRent)} (${r >= 0 ? "+" : ""}${pct(r, 0)})`,
      detail: r > 0.25 ? "Well above what renters in this ZIP pay. Fine for a newer or nicer property, but confirm with rent comps for similar units." : "Census median gross rent includes older and smaller units and lags the market by a year or two, so use it as a sanity check, not a comp." })
  }
  if (valid && m?.census?.medianIncome && ar > 0) {
    const burden = ar * 12 / m.census.medianIncome
    out.push({ level: burden > 0.35 ? "watch" : "ok", title: `Rent is ${pct(burden, 0)} of the ZIP's median household income`,
      detail: burden > 0.35 ? "Above about 30% to 35%, renters get stretched, which can limit future increases and raise turnover and bad debt." : "Room for rents to grow with incomes." })
  }
  if (m?.census?.rentalVacancy != null) {
    const v = m.census.rentalVacancy * 100
    if (v > d.vac + 2) out.push({ level: "watch", title: `ZIP rental vacancy about ${v.toFixed(1)}% vs your ${d.vac}%`, detail: "Census vacancy is a multi year average, but if it's well above yours, be ready to defend your vacancy assumption.", fix: { label: `Use ${Math.round(v)}%`, patch: { vac: Math.round(v) } } })
  }
  if (m?.census?.popGrowth5y != null) {
    const gr = m.census.popGrowth5y
    out.push({ level: gr < 0 ? "watch" : "ok", title: `Population ${gr >= 0 ? "grew" : "fell"} ${pct(Math.abs(gr), 1)} in this ZIP since ${m.census.compareYear}`, detail: gr < 0 ? "Shrinking areas make rent growth and the exit harder." : "Growth supports demand for rentals." })
  }
  if (m?.jobs) {
    const ch = m.jobs.yearAgo != null ? m.jobs.unemployment - m.jobs.yearAgo : null
    out.push({ level: ch != null && ch > 0.5 ? "watch" : "ok", title: `County unemployment ${m.jobs.unemployment}% (${m.jobs.period})`, detail: ch != null ? `${ch >= 0 ? "Up" : "Down"} ${Math.abs(ch).toFixed(1)} points from a year ago.` : "" })
  }
  if (m?.rates?.treasury10 && d.rate > 0) {
    const spread = d.rate - m.rates.treasury10.value
    out.push({ level: spread < 1.2 ? "watch" : "ok", title: `Your rate ${d.rate}% is ${spread.toFixed(2)} points over the 10 year Treasury (${m.rates.treasury10.value}%)`,
      detail: spread < 1.2 ? "Agency multifamily loans usually price well above the 10 year Treasury. Get a lender quote before trusting this rate." : "In the normal range for a fixed rate multifamily loan; confirm with a lender quote." })
  }
  if (valid) {
    const p = project(d)
    if (p.y1.dscr < 1.25 && st.rent !== "preempted") out.push({ level: "info", title: "Thin coverage plus rent rules", detail: "With DSCR under 1.25 and limits on rent increases, there is less room to grow out of a tight year." })
  }
  return out
}

/** Everything the AI needs about a deal's location, without live data. */
export function locationBrief(d: Deal) {
  const st = stateBy(d.state)
  if (!st) return { state: null, note: "No state set on this deal. Ask the user which state the property is in, or point them to Market › Location." }
  return {
    state: st.name, zip: d.zip || null, address: d.address || null,
    property_tax_owner_homes_pct: st.propTax, top_income_tax_pct: st.incomeTax,
    rent_regulation: RENT_LABEL[st.rent], rent_cap: st.rentCap || null, rent_notes: st.rentNote || null,
    taxes_after_purchase: st.reassess || DEFAULT_REASSESS,
    owner_groups: (st.groups || []).map(g => g.name),
    checks: marketChecks(d, st, null).map(c => ({ level: c.level, title: c.title, detail: c.detail, suggested_change: c.fix?.patch })),
    live_data_note: "Neighborhood, flood, HUD rent, jobs and interest rate data are under Market › Location; current officials and bills are in its policy briefing.",
  }
}
