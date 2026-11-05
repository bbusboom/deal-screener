// Deal Screener model: the one source of truth for every number on the site and in the AI tools.

export interface UnitType { type: string; count: number; rent: number }
export interface Scenario { name: string; prob: number; rg: number; vac: number; expG: number; exitCap: number }

export interface Deal {
  name: string
  price: number; cc: number; other: number; vac: number
  tax: number; ins: number; util: number; rm: number; pay: number; adm: number; mgmt: number; res: number
  ltv: number; rate: number; amort: number; ioYrs: number; loanFee: number
  hold: number; expG: number; taxG: number; insG: number; exitCap: number; sellCost: number
  minCap: number; minDscr: number; minCoc: number; minIrr: number; minEm: number
  rg: number[]
  units: UnitType[]
  scen: Scenario[]
}

export const NUM_FIELDS = [
  "price","cc","other","vac","tax","ins","util","rm","pay","adm","mgmt","res",
  "ltv","rate","amort","ioYrs","loanFee","hold","expG","taxG","insG","exitCap","sellCost",
  "minCap","minDscr","minCoc","minIrr","minEm",
] as const
export type NumField = typeof NUM_FIELDS[number]

export const DEFAULTS: Deal = {
  name: "", price: 0, cc: 2.5, other: 0, vac: 7, tax: 0, ins: 0, util: 0, rm: 0, pay: 0, adm: 0, mgmt: 5, res: 300,
  ltv: 70, rate: 6.5, amort: 30, ioYrs: 0, loanFee: 1, hold: 7, expG: 3, taxG: 3, insG: 5, exitCap: 6.5, sellCost: 2,
  minCap: 6, minDscr: 1.25, minCoc: 6, minIrr: 12, minEm: 1.6,
  rg: [], units: [{ type: "1 bed", count: 0, rent: 0 }], scen: [],
}

export const SAMPLE: Deal = {
  ...DEFAULTS,
  name: "Sample: 48 unit garden (fictional)", price: 4800000, cc: 2.5, other: 35, vac: 7,
  tax: 62000, ins: 38000, util: 54000, rm: 36000, pay: 48000, adm: 22000, mgmt: 5, res: 300,
  ltv: 70, rate: 6.5, amort: 30, ioYrs: 2, loanFee: 1, hold: 7, expG: 3, taxG: 3, insG: 5, exitCap: 6.25, sellCost: 2,
  rg: [3, 3, 3, 3, 3, 3, 3],
  units: [
    { type: "1 bed / 1 bath", count: 24, rent: 875 },
    { type: "2 bed / 1 bath", count: 18, rent: 1050 },
    { type: "2 bed / 2 bath", count: 6, rent: 1175 },
  ],
}

const round2 = (v: number) => Math.round(v * 100) / 100

/** Fill defaults, clamp the hold, size the rent growth array, add scenarios. Accepts old saved deals. */
export function norm(input: Partial<Deal> & { io?: string } = {}): Deal {
  const d: any = { ...DEFAULTS, ...structuredClone(input) }
  if (input.io === "io" && input.ioYrs === undefined) d.ioYrs = d.hold
  NUM_FIELDS.forEach(k => { d[k] = Number(d[k]) || 0 })
  d.hold = Math.max(1, Math.min(15, Math.round(d.hold) || 7))
  if (!Array.isArray(d.rg)) d.rg = []
  const last = d.rg.length ? Number(d.rg[d.rg.length - 1]) : 3
  while (d.rg.length < d.hold) d.rg.push(last)
  d.rg = d.rg.slice(0, d.hold).map((v: any) => Number(v) || 0)
  if (!Array.isArray(d.units) || !d.units.length) d.units = [{ type: "", count: 0, rent: 0 }]
  d.units = d.units.map((u: any) => ({ type: String(u.type ?? ""), count: Number(u.count) || 0, rent: Number(u.rent) || 0 }))
  if (!Array.isArray(d.scen) || !d.scen.length) d.scen = defaultScen(d)
  return d as Deal
}

export function avgGrowth(d: Deal) { return d.rg.length ? d.rg.reduce((s, v) => s + v, 0) / d.rg.length : 3 }

export function defaultScen(d: Deal): Scenario[] {
  const base = avgGrowth(d)
  return [
    { name: "Downside", prob: 25, rg: round2(base - 2), vac: round2(d.vac + 3), expG: round2(d.expG + 1), exitCap: round2(d.exitCap + 0.75) },
    { name: "Base", prob: 50, rg: round2(base), vac: round2(d.vac), expG: round2(d.expG), exitCap: round2(d.exitCap) },
    { name: "Upside", prob: 25, rg: round2(base + 1), vac: round2(Math.max(0, d.vac - 1)), expG: round2(d.expG), exitCap: round2(d.exitCap - 0.25) },
  ]
}

/* ---------- debt ---------- */
export function monthlyPmt(loan: number, ratePct: number, years: number) {
  const m = ratePct / 100 / 12, n = years * 12
  if (loan <= 0 || n <= 0) return 0
  return m === 0 ? loan / n : loan * m / (1 - Math.pow(1 + m, -n))
}
export function balanceAfter(loan: number, ratePct: number, years: number, months: number) {
  if (months <= 0) return loan
  const m = ratePct / 100 / 12, p = monthlyPmt(loan, ratePct, years)
  if (m === 0) return Math.max(0, loan - p * months)
  return Math.max(0, loan * Math.pow(1 + m, months) - p * (Math.pow(1 + m, months) - 1) / m)
}
function debtYear(loan: number, d: Deal, t: number) {
  const r = d.rate / 100
  if (t <= d.ioYrs) return { ds: loan * r, interest: loan * r, principal: 0, endBal: loan }
  const k = t - d.ioYrs
  const startBal = balanceAfter(loan, d.rate, d.amort, (k - 1) * 12)
  const endBal = balanceAfter(loan, d.rate, d.amort, k * 12)
  const ds = monthlyPmt(loan, d.rate, d.amort) * 12
  return { ds, principal: startBal - endBal, interest: ds - (startBal - endBal), endBal }
}

export function irr(cfs: number[]) {
  const npv = (r: number) => cfs.reduce((s, c, t) => s + c / Math.pow(1 + r, t), 0)
  let lo = -0.99, hi = 10
  if (!(npv(lo) * npv(hi) < 0)) return NaN
  for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (npv(lo) * npv(mid) <= 0) hi = mid; else lo = mid }
  return (lo + hi) / 2
}

/* ---------- overrides used by scenarios, sensitivity grids and the AI ---------- */
export interface Overrides {
  price?: number; vac?: number; rate?: number; ltv?: number; amort?: number; ioYrs?: number; loanFee?: number; cc?: number
  tax?: number; ins?: number; util?: number; rm?: number; pay?: number; adm?: number; mgmt?: number; res?: number; other?: number
  hold?: number; expG?: number; taxG?: number; insG?: number; exitCap?: number; sellCost?: number
  rg?: number | number[]; rentChangePct?: number; expenseChangePct?: number
}
const OVERRIDE_KEYS = ["price","vac","rate","ltv","amort","ioYrs","loanFee","cc","tax","ins","util","rm","pay","adm","mgmt","res","other","hold","expG","taxG","insG","exitCap","sellCost"] as const

export function applyOverrides(d0: Deal, o: Overrides = {}): Deal {
  const e: any = structuredClone(d0)
  OVERRIDE_KEYS.forEach(k => { const v = (o as any)[k]; if (v !== undefined && v !== null && v !== "") e[k] = Number(v) })
  e.hold = Math.max(1, Math.min(15, Math.round(e.hold)))
  if (o.rg !== undefined && o.rg !== null) {
    if (Array.isArray(o.rg)) {
      const a = o.rg.map(Number), last = a.length ? a[a.length - 1] : 3
      e.rg = Array.from({ length: e.hold }, (_, i) => i < a.length ? a[i] : last)
    } else e.rg = Array(e.hold).fill(Number(o.rg))
  } else {
    const last = e.rg.length ? e.rg[e.rg.length - 1] : 3
    while (e.rg.length < e.hold) e.rg.push(last)
    e.rg = e.rg.slice(0, e.hold)
  }
  if (o.rentChangePct) e.units = e.units.map((u: UnitType) => ({ ...u, rent: u.rent * (1 + o.rentChangePct! / 100) }))
  if (o.expenseChangePct) ["tax","ins","util","rm","pay","adm"].forEach(k => { e[k] *= 1 + o.expenseChangePct! / 100 })
  return e as Deal
}

export interface YearRow {
  t: number; gpr: number; vacLoss: number; oth: number; egi: number
  tax: number; ins: number; fixed: number; res: number; mgmt: number; opex: number; noi: number
  ds: number; interest: number; principal: number; endBal: number; cf: number; dscr: number; coc: number
}
export interface Projection {
  d: Deal; units: number; loan: number; closing: number; fee: number; equity: number
  years: YearRow[]; exitYear: YearRow; exitNoi: number; salePrice: number; sellCosts: number; payoff: number; proceeds: number
  cfs: number[]; irr: number; unlevIrr: number; em: number; profit: number; avgCoc: number; minDscr: number
  y1: { gpr: number; egi: number; opex: number; noi: number; ds: number; cf: number; vacLoss: number; oth: number; mgmt: number; res: number
        cap: number; dscr: number; coc: number; debtYield: number; expRatio: number; beo: number; ppu: number; grm: number }
}

export function project(d0: Deal, o: Overrides = {}): Projection {
  const d = applyOverrides(d0, o)
  const N = d.hold
  const units = d.units.reduce((s, u) => s + (u.count || 0), 0)
  const gpr1 = d.units.reduce((s, u) => s + (u.count || 0) * (u.rent || 0), 0) * 12
  const other1 = d.other * units * 12
  const loan = d.price * d.ltv / 100, closing = d.price * d.cc / 100, fee = loan * d.loanFee / 100
  const equity = d.price - loan + closing + fee
  const fixed1 = d.util + d.rm + d.pay + d.adm
  const years: YearRow[] = []
  let growth = 1
  for (let t = 1; t <= N + 1; t++) {
    if (t > 1) growth *= 1 + (d.rg[Math.min(t - 2, d.rg.length - 1)] || 0) / 100
    const gpr = gpr1 * growth, oth = other1 * growth, vacLoss = gpr * d.vac / 100, egi = gpr - vacLoss + oth
    const tax = d.tax * Math.pow(1 + d.taxG / 100, t - 1), ins = d.ins * Math.pow(1 + d.insG / 100, t - 1)
    const fixed = fixed1 * Math.pow(1 + d.expG / 100, t - 1), res = d.res * units * Math.pow(1 + d.expG / 100, t - 1)
    const mgmt = egi * d.mgmt / 100
    const opex = tax + ins + fixed + res + mgmt, noi = egi - opex
    const dy = debtYear(loan, d, t)
    years.push({ t, gpr, vacLoss, oth, egi, tax, ins, fixed, res, mgmt, opex, noi, ds: dy.ds, interest: dy.interest, principal: dy.principal,
      endBal: dy.endBal, cf: noi - dy.ds, dscr: dy.ds > 0 ? noi / dy.ds : NaN, coc: equity > 0 ? (noi - dy.ds) / equity : NaN })
  }
  const hold = years.slice(0, N), exitYear = years[N], exitNoi = exitYear.noi
  const salePrice = d.exitCap > 0 ? exitNoi / (d.exitCap / 100) : NaN
  const sellCosts = salePrice * d.sellCost / 100, payoff = hold[N - 1].endBal
  const proceeds = salePrice - sellCosts - payoff
  const cfs = [-equity, ...hold.map(y => y.cf)]; cfs[N] += proceeds
  const ucfs = [-(d.price + closing), ...hold.map(y => y.noi)]; ucfs[N] += salePrice - sellCosts
  const totalCf = hold.reduce((s, y) => s + y.cf, 0), totalBack = totalCf + proceeds
  const y1 = years[0]
  return {
    d, units, loan, closing, fee, equity, years: hold, exitYear, exitNoi, salePrice, sellCosts, payoff, proceeds, cfs,
    irr: irr(cfs), unlevIrr: irr(ucfs), em: equity > 0 ? totalBack / equity : NaN, profit: totalBack - equity,
    avgCoc: equity > 0 ? totalCf / N / equity : NaN, minDscr: Math.min(...hold.map(y => y.dscr)),
    y1: {
      gpr: y1.gpr, egi: y1.egi, opex: y1.opex, noi: y1.noi, ds: y1.ds, cf: y1.cf, vacLoss: y1.vacLoss, oth: y1.oth, mgmt: y1.mgmt, res: y1.res,
      cap: d.price > 0 ? y1.noi / d.price : NaN, dscr: y1.dscr, coc: y1.coc, debtYield: loan > 0 ? y1.noi / loan : NaN,
      expRatio: y1.egi > 0 ? y1.opex / y1.egi : NaN, beo: (y1.gpr + y1.oth) > 0 ? (y1.opex + y1.ds) / (y1.gpr + y1.oth) : NaN,
      ppu: units > 0 ? d.price / units : NaN, grm: y1.gpr > 0 ? d.price / y1.gpr : NaN,
    },
  }
}

/* ---------- buy box ---------- */
export type TestKey = "cap" | "dscr" | "coc" | "irr" | "em"
export const TEST_NAMES: Record<TestKey, string> = { cap: "cap rate", dscr: "DSCR", coc: "cash on cash", irr: "IRR", em: "equity multiple" }
export function tests(p: Projection, d: Deal): Partial<Record<TestKey, boolean>> {
  const t: Partial<Record<TestKey, boolean>> = {}
  if (d.minCap > 0) t.cap = p.y1.cap >= d.minCap / 100
  if (d.minDscr > 0) t.dscr = p.y1.dscr >= d.minDscr
  if (d.minCoc > 0) t.coc = p.y1.coc >= d.minCoc / 100
  if (d.minIrr > 0) t.irr = isFinite(p.irr) && p.irr >= d.minIrr / 100
  if (d.minEm > 0) t.em = p.em >= d.minEm
  return t
}
export const allPass = (t: Partial<Record<TestKey, boolean>>) => Object.values(t).every(Boolean)

export function maxPrice(d: Deal) {
  const ok = (price: number) => allPass(tests(project(d, { price }), d))
  let lo = Math.max(1, d.price * 0.2), hi = Math.max(d.price, 1)
  if (!ok(lo)) return NaN
  let g = 0; while (ok(hi) && g++ < 20) hi *= 2
  for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (ok(mid)) lo = mid; else hi = mid }
  return Math.floor(lo / 1000) * 1000
}

/** Run probability weighted cases. Weighted IRR is the IRR of the blended cash flows. */
export function weighted(d: Deal, cases: { name?: string; prob: number; o: Overrides }[]) {
  const tot = cases.reduce((s, c) => s + (Number(c.prob) || 0), 0) || 1
  const runs = cases.map(c => ({ name: c.name, w: (Number(c.prob) || 0) / tot, p: project(d, c.o) }))
  const n = Math.max(...runs.map(r => r.p.cfs.length))
  const blend = Array.from({ length: n }, (_, t) => runs.reduce((a, r) => a + r.w * (r.p.cfs[t] || 0), 0))
  return {
    runs, irr: irr(blend),
    em: runs.reduce((a, r) => a + r.w * r.p.em, 0),
    avgCoc: runs.reduce((a, r) => a + r.w * r.p.avgCoc, 0),
    y1Coc: runs.reduce((a, r) => a + r.w * r.p.y1.coc, 0),
  }
}
export const scenCases = (s: Scenario[]) => s.map(x => ({ name: x.name, prob: x.prob, o: { rg: x.rg, vac: x.vac, expG: x.expG, exitCap: x.exitCap } as Overrides }))

/* ---------- formatting ---------- */
export const usd = (n: number) => !isFinite(n) ? "n/a" : (n < 0 ? "−$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US")
export const usdK = (n: number) => !isFinite(n) ? "n/a" : (n < 0 ? "−$" : "$") + Math.round(Math.abs(n) / 1000).toLocaleString("en-US") + "k"
export const pct = (n: number, dp = 2) => isFinite(n) ? (n * 100).toFixed(dp) + "%" : "n/a"
export const xx = (n: number) => isFinite(n) ? n.toFixed(2) + "x" : "n/a"

export function memo(d: Deal, p: Projection, mp: number) {
  const t = tests(p, d), ok = allPass(t), L: string[] = []
  L.push(`DEAL SCREEN: ${d.name || "Untitled deal"}`)
  L.push(`Asking ${usd(d.price)} for ${p.units} units (${usd(p.y1.ppu)}/unit, GRM ${p.y1.grm.toFixed(2)}).`, "")
  L.push("YEAR 1")
  L.push(`NOI ${usd(p.y1.noi)} on EGI of ${usd(p.y1.egi)} (expense ratio ${pct(p.y1.expRatio, 1)}). Going in cap rate ${pct(p.y1.cap)}.`)
  L.push(`${d.ltv}% LTV loan of ${usd(p.loan)} at ${d.rate}%${d.ioYrs > 0 ? `, ${d.ioYrs} yr interest only` : ""}, ${d.amort} yr amortization. Year 1 debt service ${usd(p.y1.ds)}, DSCR ${xx(p.y1.dscr)}.`)
  L.push(`Equity ${usd(p.equity)}; year 1 cash flow ${usd(p.y1.cf)}; cash on cash ${pct(p.y1.coc)}. Break even occupancy ${pct(p.y1.beo, 1)}.`, "")
  L.push(`${d.hold} YEAR HOLD`)
  L.push(`Rent growth averages ${avgGrowth(d).toFixed(2)}%/yr; expenses ${d.expG}%, taxes ${d.taxG}%, insurance ${d.insG}%.`)
  L.push(`Sale at a ${d.exitCap}% exit cap on ${usd(p.exitNoi)} NOI = ${usd(p.salePrice)}; net proceeds ${usd(p.proceeds)} after selling costs and a ${usd(p.payoff)} payoff.`)
  L.push(`Levered IRR ${pct(p.irr)}, equity multiple ${xx(p.em)}, average cash on cash ${pct(p.avgCoc)}, lowest DSCR ${xx(p.minDscr)}.`, "")
  L.push("BUY BOX")
  ;(Object.entries(t) as [TestKey, boolean][]).forEach(([k, b]) => L.push(`${TEST_NAMES[k]}: ${b ? "PASS" : "FAIL"}`))
  L.push("", ok ? "Verdict: clears the buy box at asking." : "Verdict: does not clear the buy box at asking.")
  L.push(isFinite(mp) ? `Highest price that clears every test: ${usd(mp)} (${pct(mp / d.price - 1, 1)} vs asking).` : "No purchase price clears every test with these assumptions.")
  L.push("", "Screen only. Verify rent roll, T12, taxes after sale and insurance quotes before relying on these numbers.")
  return L.join("\n")
}
