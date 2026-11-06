// Deal Screener model: the one source of truth for every number on the site and in the AI tools.

export interface UnitType {
  type: string; count: number; rent: number
  /** Current market rent for this unit type. 0 or blank means in place rent is at market (no loss to lease). */
  market?: number
  /** Average square feet, for rent per square foot. */
  sf?: number
}
export interface OtherItem { label: string; amt: number }
/** A user added line: income, operating expense, or capital item below NOI. */
export type CustomKind = "income" | "expense" | "capex"
/** year = $ per year, unitMonth = $ per unit per month, pctGpr / pctEgi = % of gross potential rent / effective gross income, once = one time $ in the start year. */
export type CustomBasis = "year" | "unitMonth" | "pctGpr" | "pctEgi" | "once"
export interface CustomLine { label: string; kind: CustomKind; basis: CustomBasis; amt: number; growth: number; start: number; end: number }
export const BASIS_LABEL: Record<CustomBasis, string> = { year: "$ per year", unitMonth: "$ / unit / month", pctGpr: "% of GPR", pctEgi: "% of EGI", once: "one time $" }
/** A statement column (seller T12 or T3 annualized): annual dollars by line. */
export type StatementCol = Partial<Record<StatementKey, number>>
export const STATEMENT_KEYS = ["gpr","ltl","vac","conc","bad","nru","other","tax","ins","util","rm","pay","adm","contract","turn","mkt","mgmt","res"] as const
export type StatementKey = typeof STATEMENT_KEYS[number]
export type SizeMode = "ltv" | "lesser"
/** Value add renovation program. */
export interface ValueAdd {
  on: boolean
  /** Units to renovate, cost per unit, and rent premium per renovated unit per month (today's dollars). */
  units: number; cost: number; premium: number
  /** Units started per month, month the program starts (1 = first month after closing), months a unit is offline. */
  pace: number; startMo: number; downMo: number
  /** true: budget raised as equity at closing. false: paid out of cash flow as it's spent. */
  upfront: boolean
}
/** Lease up: occupancy starts low and rises in a straight line to stabilized (100% − vacancy) over some months. */
export interface LeaseUp { on: boolean; startOcc: number; months: number }
export const LU_DEFAULT: LeaseUp = { on: false, startOcc: 60, months: 12 }
export const VA_DEFAULT: ValueAdd = { on: false, units: 0, cost: 10000, premium: 150, pace: 4, startMo: 2, downMo: 1, upfront: true }
/** Sponsor (GP) and investor (LP) split with IRR hurdles. */
export interface Waterfall {
  on: boolean
  /** Share of equity the GP co-invests, %. */
  gpCo: number
  /** Preferred return to all equity, %/yr (pari passu). */
  pref: number
  /** After the pref: LP share until the LP IRR hits hurdle2, then LP share above it, %. */
  split1: number; hurdle2: number; split2: number
  /** Fees to the GP: acquisition % of price (funded with equity), asset management % of EGI, disposition % of sale. */
  acqFee: number; amFee: number; dispFee: number
}
/** Loan type, rate cap, prepayment and refinance. */
export interface DebtOpts {
  /** fixed = the Financing tab's rate; floating = SOFR + spread, interest only (typical bridge loan). */
  type: "fixed" | "floating"
  sofr: number; sofrChg: number; spread: number
  capOn: boolean; capStrike: number; capCost: number
  /** Prepayment penalty on payoff before the loan term ends. */
  prepay: "none" | "stepdown" | "ym" | "exitfee"
  steps: string; exitFee: number; tsy: number
  /** Refinance at the end of refiYr into a new fixed loan sized on value and DSCR. */
  refiOn: boolean; refiYr: number; refiCap: number; refiLtv: number; refiDscr: number; refiRate: number; refiAmort: number; refiIo: number; refiCost: number
}
export const DEBT_DEFAULT: DebtOpts = { type: "fixed", sofr: 4, sofrChg: 0, spread: 3, capOn: true, capStrike: 4.5, capCost: 0,
  prepay: "none", steps: "5,4,3,2,1", exitFee: 1, tsy: 4.25,
  refiOn: false, refiYr: 3, refiCap: 6, refiLtv: 70, refiDscr: 1.25, refiRate: 6, refiAmort: 30, refiIo: 0, refiCost: 1.5 }
export interface RentComp { name: string; dist: number; built: number; type: string; rent: number; sf: number }
export interface SaleComp { name: string; date: string; built: number; units: number; price: number; cap: number }
export const STATUSES = ["Screening", "Underwriting", "LOI sent", "Under contract", "Closed", "Passed"] as const
export type DealStatus = typeof STATUSES[number]
export const WF_DEFAULT: Waterfall = { on: false, gpCo: 10, pref: 8, split1: 70, hurdle2: 15, split2: 50, acqFee: 2, amFee: 2, dispFee: 1 }
export interface Scenario { name: string; prob: number; rg: number; vac: number; expG: number; exitCap: number }

export interface Deal {
  name: string
  /** Location, used by Market check. Optional so old saved deals still load. */
  state?: string; zip?: string; address?: string
  price: number; cc: number; other: number; vac: number
  /** Revenue deductions, % of gross potential rent, and units that earn no rent (model, office, employee, down). */
  conc: number; bad: number; nru: number
  /** Years for loss to lease to burn off as leases roll to market (0 = it stays). */
  ltlBurn: number
  /** Other income broken out ($ per unit per month). When present, other = their sum. */
  otherItems: OtherItem[]
  tax: number; ins: number; util: number; rm: number; pay: number; adm: number; mgmt: number; res: number
  /** Contract services, turnover / make ready, marketing ($ per year). */
  contract: number; turn: number; mkt: number
  /** Property tax after reassessment ($/yr) and the hold year it takes effect (0 = no reset). */
  taxNew: number; taxResetYr: number
  /** Up front capital (renovations, immediate repairs) funded with equity at closing. */
  capexUp: number
  ltv: number; rate: number; amort: number; ioYrs: number; loanFee: number
  /** Loan term in years (balloon), and how the loan is sized: LTV only, or the lesser of LTV, DSCR and debt yield. */
  term: number; sizeMode: SizeMode; sizeDscr: number; sizeDy: number
  hold: number; expG: number; taxG: number; insG: number; exitCap: number; sellCost: number
  minCap: number; minDscr: number; minCoc: number; minIrr: number; minEm: number
  rg: number[]
  units: UnitType[]
  scen: Scenario[]
  /** User added income, expense and capital lines. */
  custom: CustomLine[]
  va: ValueAdd
  lu: LeaseUp
  wf: Waterfall
  debt: DebtOpts
  rentComps: RentComp[]; saleComps: SaleComp[]
  /** Unit level rent roll, if uploaded (see lib/rentroll). */
  rr: { unit: string; type: string; sf: number; rent: number; market: number; status: "occupied" | "vacant" | "notice" | "nonrev"; start: string; end: string }[]
  rrName: string
  /** Pipeline tracking. */
  status: DealStatus; bidDue: string; notes: string
  /** Seller's trailing 12 months and trailing 3 months annualized, for the operating statement. */
  t12?: StatementCol; t3?: StatementCol
}

export const NUM_FIELDS = [
  "price","cc","other","vac","conc","bad","nru","ltlBurn","tax","ins","util","rm","pay","adm","contract","turn","mkt","mgmt","res",
  "taxNew","taxResetYr","capexUp",
  "ltv","rate","amort","ioYrs","loanFee","term","sizeDscr","sizeDy","hold","expG","taxG","insG","exitCap","sellCost",
  "minCap","minDscr","minCoc","minIrr","minEm",
] as const
export type NumField = typeof NUM_FIELDS[number]

export const DEFAULTS: Deal = {
  name: "", price: 0, cc: 2.5, other: 0, vac: 7, conc: 0, bad: 0, nru: 0, ltlBurn: 0, otherItems: [],
  tax: 0, ins: 0, util: 0, rm: 0, pay: 0, adm: 0, contract: 0, turn: 0, mkt: 0, mgmt: 5, res: 300,
  taxNew: 0, taxResetYr: 0, capexUp: 0,
  custom: [], va: { ...VA_DEFAULT }, lu: { ...LU_DEFAULT }, wf: { ...WF_DEFAULT }, debt: { ...DEBT_DEFAULT }, rentComps: [], saleComps: [], rr: [], rrName: "", status: "Screening", bidDue: "", notes: "",
  ltv: 70, rate: 6.5, amort: 30, ioYrs: 0, loanFee: 1, term: 10, sizeMode: "ltv", sizeDscr: 1.25, sizeDy: 8, hold: 7, expG: 3, taxG: 3, insG: 5, exitCap: 6.5, sellCost: 2,
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
  d.units = d.units.map((u: any) => ({ type: String(u.type ?? ""), count: Number(u.count) || 0, rent: Number(u.rent) || 0, market: Number(u.market) || 0, sf: Number(u.sf) || 0 }))
  d.lu = { ...LU_DEFAULT, ...(d.lu || {}) }; d.lu.on = !!d.lu.on
  d.lu.startOcc = Math.min(100, Math.max(0, Number(d.lu.startOcc) || 0)); d.lu.months = Math.max(1, Math.round(Number(d.lu.months) || 1))
  d.va = { ...VA_DEFAULT, ...(d.va || {}) }; d.wf = { ...WF_DEFAULT, ...(d.wf || {}) }
  for (const k of Object.keys(VA_DEFAULT)) if (k !== "on" && k !== "upfront") d.va[k] = Math.max(0, Number(d.va[k]) || 0)
  for (const k of Object.keys(WF_DEFAULT)) if (k !== "on") d.wf[k] = Math.max(0, Number(d.wf[k]) || 0)
  d.rr = Array.isArray(d.rr) ? d.rr.slice(0, 2000) : []; d.rrName = String(d.rrName ?? "")
  d.rentComps = (Array.isArray(d.rentComps) ? d.rentComps : []).map((c: any) => ({ name: String(c.name ?? ""), dist: Number(c.dist) || 0, built: Number(c.built) || 0, type: String(c.type ?? ""), rent: Number(c.rent) || 0, sf: Number(c.sf) || 0 }))
  d.saleComps = (Array.isArray(d.saleComps) ? d.saleComps : []).map((c: any) => ({ name: String(c.name ?? ""), date: String(c.date ?? ""), built: Number(c.built) || 0, units: Number(c.units) || 0, price: Number(c.price) || 0, cap: Number(c.cap) || 0 }))
  if (!(STATUSES as readonly string[]).includes(d.status)) d.status = "Screening"
  d.bidDue = String(d.bidDue ?? ""); d.notes = String(d.notes ?? "")
  d.debt = { ...DEBT_DEFAULT, ...(d.debt || {}) }
  for (const k of Object.keys(DEBT_DEFAULT)) if (typeof (DEBT_DEFAULT as any)[k] === "number") d.debt[k] = Math.max(k === "sofrChg" ? -1000 : 0, Number(d.debt[k]) || 0)
  d.debt.type = d.debt.type === "floating" ? "floating" : "fixed"
  if (!["none", "stepdown", "ym", "exitfee"].includes(d.debt.prepay)) d.debt.prepay = "none"
  d.debt.capOn = d.debt.capOn !== false; d.debt.refiOn = !!d.debt.refiOn; d.debt.steps = String(d.debt.steps ?? "")
  d.debt.refiYr = Math.max(1, Math.round(d.debt.refiYr))
  d.va.on = !!d.va.on; d.va.upfront = d.va.upfront !== false; d.wf.on = !!d.wf.on
  d.va.startMo = Math.max(1, Math.round(d.va.startMo)); d.va.downMo = Math.round(d.va.downMo); d.va.pace = Math.max(0.1, d.va.pace)
  if (!Array.isArray(d.custom)) d.custom = []
  d.custom = d.custom.map((c: any) => ({
    label: String(c.label ?? ""), kind: ["income", "expense", "capex"].includes(c.kind) ? c.kind : "expense",
    basis: ["year", "unitMonth", "pctGpr", "pctEgi", "once"].includes(c.basis) ? c.basis : "year",
    amt: Number(c.amt) || 0, growth: isFinite(Number(c.growth)) ? Number(c.growth) : 3, start: Math.max(1, Math.round(Number(c.start) || 1)), end: Math.max(0, Math.round(Number(c.end) || 0)) }))
  if (!Array.isArray(d.otherItems)) d.otherItems = []
  d.otherItems = d.otherItems.map((o: any) => ({ label: String(o.label ?? ""), amt: Number(o.amt) || 0 }))
  if (d.otherItems.length) d.other = round2(d.otherItems.reduce((a: number, o: OtherItem) => a + o.amt, 0))
  d.sizeMode = d.sizeMode === "lesser" ? "lesser" : "ltv"
  if (!d.term) d.term = 10
  if (!d.sizeDscr) d.sizeDscr = 1.25
  if (!d.sizeDy) d.sizeDy = 8
  d.taxResetYr = Math.max(0, Math.round(d.taxResetYr))
  for (const k of ["t12", "t3"]) {
    if (d[k] && typeof d[k] === "object") { const o: any = {}; for (const [kk, v] of Object.entries(d[k])) if (v !== "" && v !== null && isFinite(Number(v))) o[kk] = Number(v); d[k] = o }
    else delete d[k]
  }
  if (!Array.isArray(d.scen) || !d.scen.length) d.scen = defaultScen(d)
  for (const k of ["state", "zip", "address"]) d[k] = typeof d[k] === "string" ? d[k] : ""
  d.state = d.state.toUpperCase().slice(0, 2)
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
  contract?: number; turn?: number; mkt?: number; conc?: number; bad?: number; nru?: number; taxNew?: number; capexUp?: number
  hold?: number; expG?: number; taxG?: number; insG?: number; exitCap?: number; sellCost?: number
  rg?: number | number[]; rentChangePct?: number; expenseChangePct?: number
}
const OVERRIDE_KEYS = ["price","vac","rate","ltv","amort","ioYrs","loanFee","cc","tax","ins","util","rm","pay","adm","mgmt","res","other","hold","expG","taxG","insG","exitCap","sellCost",
  "contract","turn","mkt","conc","bad","nru","taxNew","capexUp"] as const

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
  if (o.expenseChangePct) ["tax","ins","util","rm","pay","adm","contract","turn","mkt","taxNew"].forEach(k => { e[k] *= 1 + o.expenseChangePct! / 100 })
  return e as Deal
}

export interface YearRow {
  t: number; gpr: number; vacLoss: number; oth: number; egi: number
  /** Revenue deductions: loss to lease, concessions, bad debt, non-revenue units. */
  ltl: number; conc: number; bad: number; nru: number
  /** Custom lines: total income, total operating expense, capital below NOI, and each line's value in d.custom order. */
  custInc: number; custExp: number; capex: number; cust: number[]
  /** Interest rate paid this year (%), and net cash from a refinance in this year. */
  rate: number; refiCash: number
  /** Value add: renovation premium (net of vacancy), rent lost to downtime, renovations finished by year end, budget spent this year. */
  vaPrem: number; vaDown: number; vaDone: number; vaSpend: number
  tax: number; ins: number; fixed: number; res: number; mgmt: number; opex: number
  /** noi is after replacement reserves (= lender net cash flow); noiBR is before reserves. */
  noi: number; noiBR: number
  ds: number; interest: number; principal: number; endBal: number; cf: number; dscr: number; coc: number
}
export interface RefiResult { yr: number; value: number; newLoan: number; oldBal: number; penalty: number; cost: number; cashOut: number; binding: "LTV" | "DSCR"; ltv: number }
export interface VaSummary { units: number; budget: number; upfront: number; roc: number; finishYr: number; annualPremium: number }
export interface LoanSizing { mode: SizeMode; ltvLoan: number; dscrLoan: number; dyLoan: number; binding: "LTV" | "DSCR" | "Debt yield"; maxLoan: number }
export interface Projection {
  d: Deal; units: number; loan: number; closing: number; fee: number; equity: number; sizing: LoanSizing
  monthly: { prem: number[]; down: number[]; spend: number[]; lu: number[]; vaPremium: number; avgRentMo: number }
  va: VaSummary; refi: RefiResult | null; prepayPenalty: number; capCost: number
  /** True if the loan matures before the planned sale. */
  balloonBeforeSale: boolean
  years: YearRow[]; exitYear: YearRow; exitNoi: number; salePrice: number; sellCosts: number; payoff: number; proceeds: number
  cfs: number[]; irr: number; unlevIrr: number; em: number; profit: number; avgCoc: number; minDscr: number
  y1: { gpr: number; egi: number; opex: number; noi: number; noiBR: number; ds: number; cf: number; vacLoss: number; oth: number; mgmt: number; res: number
        ltl: number; conc: number; bad: number; nru: number; inPlace: number; econOcc: number
        cap: number; dscr: number; coc: number; debtYield: number; expRatio: number; beo: number; ppu: number; grm: number }
}

export function project(d0: Deal, o: Overrides = {}): Projection {
  const d = applyOverrides(d0, o)
  const N = d.hold
  const units = d.units.reduce((s, u) => s + (u.count || 0), 0)
  // Revenue: gross potential rent is at MARKET; loss to lease is the gap to in-place rent.
  const inPlace1 = d.units.reduce((s, u) => s + (u.count || 0) * (u.rent || 0), 0) * 12
  const gpr1 = d.units.reduce((s, u) => s + (u.count || 0) * ((u.market || 0) > 0 ? u.market! : (u.rent || 0)), 0) * 12
  const ltl1 = Math.max(0, gpr1 - inPlace1)
  const avgMkt = units > 0 ? gpr1 / units : 0
  const other1 = d.other * units * 12
  const fixed1 = d.util + d.rm + d.pay + d.adm + (d.contract || 0) + (d.turn || 0) + (d.mkt || 0)
  const closing = d.price * d.cc / 100
  const capexUp = d.capexUp || 0

  // Value add: build a monthly renovation schedule, then roll it up by year.
  const va = d.va, vaOn = !!va?.on && va.units > 0
  const vaUnits = vaOn ? Math.min(va.units, units) : 0
  const Y = N + 1, premMo = Array(Y + 1).fill(0), downMo = Array(Y + 1).fill(0), spend = Array(Y + 1).fill(0), done = Array(Y + 1).fill(0)
  // Month by month (index 1..Y*12) for the monthly view.
  const mPrem = Array(Y * 12 + 1).fill(0), mDown = Array(Y * 12 + 1).fill(0), mSpend = Array(Y * 12 + 1).fill(0)
  if (vaOn) {
    let started = 0
    const starts: { m: number; n: number }[] = []
    for (let m = va.startMo; started < vaUnits - 1e-9 && m <= Y * 12; m++) { const n = Math.min(va.pace, vaUnits - started); starts.push({ m, n }); started += n }
    for (const { m, n } of starts) {
      const yr0 = Math.ceil(m / 12); spend[yr0] += n * va.cost; mSpend[m] += n * va.cost
      for (let k = m; k <= Y * 12; k++) {
        const yr = Math.ceil(k / 12)
        if (k < m + va.downMo) { downMo[yr] += n; mDown[k] += n }
        else { premMo[yr] += n; mPrem[k] += n; if (k === m + va.downMo) done[yr] += n }
      }
    }
    for (let t = 1; t <= Y; t++) done[t] += done[t - 1]
  }
  const vaBudget = vaUnits * (va?.cost || 0)
  // Lease up: extra vacancy (share of GPR) each month on top of stabilized vacancy.
  const stab = 100 - d.vac, luOn = !!d.lu?.on && d.lu.startOcc < stab
  const mLu = Array(Y * 12 + 1).fill(0), luYr = Array(Y + 1).fill(0)
  if (luOn) for (let k = 1; k <= Y * 12; k++) {
    const occ = Math.min(stab, d.lu.startOcc + (stab - d.lu.startOcc) * (k - 1) / d.lu.months)
    mLu[k] = (stab - occ) / 100; luYr[Math.ceil(k / 12)] += mLu[k] / 12
  }
  const vaUpfront = vaOn && va.upfront ? vaBudget : 0

  // Operating years first (no debt), so the loan can be sized off year 1 NOI.
  type Ops = Omit<YearRow, "ds" | "interest" | "principal" | "endBal" | "cf" | "dscr" | "coc" | "rate" | "refiCash">
  const ops: Ops[] = []
  let growth = 1
  for (let t = 1; t <= N + 1; t++) {
    if (t > 1) growth *= 1 + (d.rg[Math.min(t - 2, d.rg.length - 1)] || 0) / 100
    const gpr = gpr1 * growth, oth = other1 * growth
    const burn = d.ltlBurn > 0 ? Math.max(0, 1 - (t - 1) / d.ltlBurn) : 1
    const ltl = ltl1 * growth * burn
    const vacLoss = gpr * (d.vac / 100 + luYr[t]), conc = gpr * (d.conc || 0) / 100, bad = gpr * (d.bad || 0) / 100
    const nru = (d.nru || 0) * avgMkt * growth
    const cust = d.custom.map(() => 0)
    const lineVal = (c: CustomLine, i: number, egiNow: number) => {
      if (t < c.start || (c.end > 0 && t > c.end)) return 0
      if (c.basis === "once") return t === c.start ? c.amt : 0
      const g = Math.pow(1 + c.growth / 100, t - c.start)
      const v = c.basis === "year" ? c.amt * g : c.basis === "unitMonth" ? c.amt * units * 12 * g
        : c.basis === "pctGpr" ? gpr * c.amt / 100 : egiNow * c.amt / 100
      return (cust[i] = v)
    }
    let custInc = 0
    d.custom.forEach((c, i) => { if (c.kind === "income" && c.basis !== "pctEgi") { const v = lineVal(c, i, 0); cust[i] = v; custInc += v } })
    const vaPrem = vaOn ? premMo[t] * va.premium * growth * (1 - d.vac / 100) : 0
    const vaDown = vaOn ? downMo[t] * (avgMkt / 12) * growth : 0
    const egi = gpr - ltl - vacLoss - conc - bad - nru + oth + custInc + vaPrem - vaDown
    let custExp = 0, capex = 0
    d.custom.forEach((c, i) => { if (c.kind !== "income") { const v = lineVal(c, i, egi); cust[i] = v; if (c.kind === "expense") custExp += v; else capex += v } })
    const vaSpend = vaOn ? spend[t] : 0
    if (vaOn && !va.upfront) capex += vaSpend
    const reset = d.taxResetYr > 0 && d.taxNew > 0 && t >= d.taxResetYr
    const tax = reset ? d.taxNew * Math.pow(1 + d.taxG / 100, t - d.taxResetYr) : d.tax * Math.pow(1 + d.taxG / 100, t - 1)
    const ins = d.ins * Math.pow(1 + d.insG / 100, t - 1)
    const fixed = fixed1 * Math.pow(1 + d.expG / 100, t - 1), res = d.res * units * Math.pow(1 + d.expG / 100, t - 1)
    const mgmt = egi * d.mgmt / 100
    const opex = tax + ins + fixed + res + mgmt + custExp, noi = egi - opex
    ops.push({ t, gpr, ltl, vacLoss, conc, bad, nru, oth, custInc, custExp, capex, cust, vaPrem, vaDown, vaDone: done[t] || 0, vaSpend, egi, tax, ins, fixed, res, mgmt, opex, noi, noiBR: noi + res })
  }

  // Loan sizing: LTV, or the lesser of LTV, DSCR and debt yield (how agency and bank lenders actually size).
  const noi1 = ops[0].noi
  const ltvLoan = d.price * d.ltv / 100
  const D = d.debt, floating = D.type === "floating"
  const floatRate = (t: number) => { const sofr = Math.max(0, D.sofr + D.sofrChg / 100 * (t - 1)); return (D.capOn ? Math.min(sofr, D.capStrike) : sofr) + D.spread }
  const constant = floating ? floatRate(1) / 100 : d.amort > 0 ? monthlyPmt(1, d.rate, d.amort) * 12 : d.rate / 100
  const dscrLoan = d.sizeDscr > 0 && constant > 0 ? Math.max(0, noi1 / d.sizeDscr / constant) : Infinity
  const dyLoan = d.sizeDy > 0 ? Math.max(0, noi1 / (d.sizeDy / 100)) : Infinity
  const maxLoan = Math.min(ltvLoan, dscrLoan, dyLoan)
  const binding = maxLoan === ltvLoan ? "LTV" : maxLoan === dscrLoan ? "DSCR" : "Debt yield"
  const loan = d.sizeMode === "lesser" ? maxLoan : ltvLoan
  const sizing: LoanSizing = { mode: d.sizeMode, ltvLoan, dscrLoan, dyLoan, binding, maxLoan }
  const fee = loan * d.loanFee / 100
  const capCost = floating && D.capOn ? D.capCost : 0
  const equity = d.price - loan + closing + fee + capexUp + vaUpfront + capCost

  // Prepayment penalty on a balance paid off in loan year k (1 based) of a loan with the given rate and term.
  const penalty = (bal: number, k: number, ratePct: number, term: number) => {
    if (bal <= 0 || (term > 0 && k > term)) return 0
    if (D.prepay === "stepdown") { const st = D.steps.split(/[,\s]+/).map(Number).filter(isFinite); return bal * (st[k - 1] || 0) / 100 }
    if (D.prepay === "exitfee") return bal * D.exitFee / 100
    if (D.prepay === "ym") {
      const left = Math.max(0, (term || 10) - k + 1), diff = Math.max(0, ratePct - D.tsy) / 100, tr = D.tsy / 100
      let pv = 0; for (let j = 1; j <= left; j++) pv += bal * diff / Math.pow(1 + tr, j)
      return Math.max(pv, bal * 0.01)
    }
    return 0
  }

  // Refinance: value on next year's NOI at the refi cap; new loan is the lesser of LTV and DSCR sizing.
  let refi: RefiResult | null = null
  const refiYr = D.refiOn && D.refiYr < N ? D.refiYr : 0
  const refiDeal = { ...d, rate: D.refiRate, amort: D.refiAmort, ioYrs: D.refiIo } as Deal
  const years: YearRow[] = []
  let refiLoan = 0
  for (const y of ops) {
    let ds: number, interest: number, principal: number, endBal: number, rate: number, refiCash = 0
    if (refiYr && y.t > refiYr) {
      const dy = debtYear(refiLoan, refiDeal, y.t - refiYr); ({ ds, interest, principal, endBal } = dy); rate = D.refiRate
    } else if (floating) {
      rate = floatRate(y.t); interest = loan * rate / 100; ds = interest; principal = 0; endBal = loan
    } else {
      const dy = debtYear(loan, d, y.t); ({ ds, interest, principal, endBal } = dy); rate = d.rate
    }
    if (refiYr && y.t === refiYr) {
      const value = D.refiCap > 0 ? ops[refiYr].noi / (D.refiCap / 100) : 0
      const ltvL = value * D.refiLtv / 100
      const k = D.refiAmort > 0 && D.refiIo === 0 ? monthlyPmt(1, D.refiRate, D.refiAmort) * 12 : D.refiRate / 100
      const dscrL = D.refiDscr > 0 && k > 0 ? Math.max(0, ops[refiYr].noi / D.refiDscr / k) : Infinity
      refiLoan = Math.max(0, Math.min(ltvL, dscrL))
      const pen = penalty(endBal, y.t, rate, floating ? 0 : d.term), cost = refiLoan * D.refiCost / 100
      refiCash = refiLoan - endBal - pen - cost
      refi = { yr: refiYr, value, newLoan: refiLoan, oldBal: endBal, penalty: pen, cost, cashOut: refiCash, binding: refiLoan === ltvL ? "LTV" : "DSCR", ltv: value > 0 ? refiLoan / value : NaN }
      endBal = refiLoan
    }
    const cf = y.noi - ds - y.capex
    years.push({ ...y, ds, interest, principal, endBal, rate, refiCash, cf, dscr: ds > 0 ? y.noi / ds : NaN, coc: equity > 0 ? cf / equity : NaN })
  }
  const hold = years.slice(0, N), exitYear = years[N], exitNoi = exitYear.noi
  const salePrice = d.exitCap > 0 ? exitNoi / (d.exitCap / 100) : NaN
  const endBalN = hold[N - 1].endBal
  const prepayPenalty = refiYr ? 0 : penalty(endBalN, N, floating ? floatRate(N) : d.rate, floating ? 0 : d.term)
  const sellCosts = salePrice * d.sellCost / 100, payoff = endBalN + prepayPenalty
  const proceeds = salePrice - sellCosts - payoff
  const cfs = [-equity, ...hold.map(y => y.cf + y.refiCash)]; cfs[N] += proceeds
  const ucfs = [-(d.price + closing + capexUp + vaUpfront + capCost), ...hold.map(y => y.noi - y.capex)]; ucfs[N] += salePrice - sellCosts
  const totalCf = hold.reduce((s, y) => s + y.cf + y.refiCash, 0), totalBack = totalCf + proceeds
  const y1 = years[0]
  const potential = y1.gpr + y1.oth
  return {
    refi, prepayPenalty, capCost,
    monthly: { prem: mPrem, down: mDown, spend: mSpend, lu: mLu, vaPremium: vaOn ? va.premium : 0, avgRentMo: avgMkt / 12 },
    va: { units: vaUnits, budget: vaBudget, upfront: vaUpfront, roc: vaOn && va.cost > 0 ? va.premium * 12 * (1 - d.vac / 100) / va.cost : NaN,
      finishYr: vaOn ? (i => i > 0 ? i : NaN)(done.findIndex((x, i) => i > 0 && x >= vaUnits - 1e-9)) : NaN, annualPremium: vaUnits * va.premium * 12 },
    d, units, loan, closing, fee, equity, sizing, balloonBeforeSale: d.term > 0 && d.term < N && !(refiYr && refiYr < d.term),
    years: hold, exitYear, exitNoi, salePrice, sellCosts, payoff, proceeds, cfs,
    irr: irr(cfs), unlevIrr: irr(ucfs), em: equity > 0 ? totalBack / equity : NaN, profit: totalBack - equity,
    avgCoc: equity > 0 ? hold.reduce((s, y) => s + y.cf, 0) / N / equity : NaN, minDscr: Math.min(...hold.map(y => y.dscr)),
    y1: {
      gpr: y1.gpr, egi: y1.egi, opex: y1.opex, noi: y1.noi, noiBR: y1.noiBR, ds: y1.ds, cf: y1.cf, vacLoss: y1.vacLoss, oth: y1.oth, mgmt: y1.mgmt, res: y1.res,
      ltl: y1.ltl, conc: y1.conc, bad: y1.bad, nru: y1.nru, inPlace: inPlace1,
      econOcc: y1.gpr > 0 ? (y1.gpr - y1.ltl - y1.vacLoss - y1.conc - y1.bad - y1.nru) / y1.gpr : NaN,
      cap: d.price > 0 ? y1.noi / d.price : NaN, dscr: y1.dscr, coc: y1.coc, debtYield: loan > 0 ? y1.noi / loan : NaN,
      expRatio: y1.egi > 0 ? y1.opex / y1.egi : NaN, beo: potential > 0 ? (y1.opex + y1.ds) / potential : NaN,
      ppu: units > 0 ? d.price / units : NaN, grm: y1.gpr > 0 ? d.price / y1.gpr : NaN,
    },
  }
}

/* ---------- Monthly view ---------- */
export interface MonthRow { m: number; yr: number; occ: number; gpr: number; vacancy: number; reno: number; other: number; egi: number; opex: number; noi: number; ds: number; capex: number; cf: number; cum: number }
/** Month by month for the first `months` months. Steady items are the year's total ÷ 12; lease up and renovation items
 *  follow the actual monthly schedule, so each year's months add back to the annual model. */
export function monthlyView(p: Projection, months = 24): MonthRow[] {
  const out: MonthRow[] = [], M = p.monthly, d = p.d, vac = d.vac / 100
  let cum = -p.equity
  for (let k = 1; k <= Math.min(months, p.years.length * 12); k++) {
    const y = p.years[Math.ceil(k / 12) - 1]
    const g = y.gpr / 12
    const g1 = y.gpr / p.years[0].gpr || 1
    // Lease up loss this month; annual vacLoss already includes the year's lease up total.
    const luYr = p.years[Math.ceil(k / 12) - 1].vacLoss - y.gpr * vac
    const luShares = M.lu.slice((Math.ceil(k / 12) - 1) * 12 + 1, Math.ceil(k / 12) * 12 + 1).reduce((a, b) => a + b, 0)
    const lu = luShares > 0 ? luYr * M.lu[k] / luShares : 0
    const vacancy = g * vac + lu + (y.ltl + y.conc + y.bad + y.nru) / 12
    const yrPremUnits = M.prem.slice((Math.ceil(k / 12) - 1) * 12 + 1, Math.ceil(k / 12) * 12 + 1).reduce((a, b) => a + b, 0)
    const yrDownUnits = M.down.slice((Math.ceil(k / 12) - 1) * 12 + 1, Math.ceil(k / 12) * 12 + 1).reduce((a, b) => a + b, 0)
    const reno = (yrPremUnits ? y.vaPrem * M.prem[k] / yrPremUnits : 0) - (yrDownUnits ? y.vaDown * M.down[k] / yrDownUnits : 0)
    const other = (y.oth + y.custInc) / 12
    const egi = g - vacancy + reno + other
    // Management follows EGI; other expenses spread evenly.
    const opex = (y.opex - y.mgmt) / 12 + egi * d.mgmt / 100
    const noi = egi - opex
    const capexSpend = (y.capex - (d.va.on && !d.va.upfront ? y.vaSpend : 0)) / 12 + (d.va.on && !d.va.upfront ? M.spend[k] : 0)
    const ds = y.ds / 12, cf = noi - ds - capexSpend + (k % 12 === 0 ? y.refiCash : 0)
    cum += cf
    void g1
    out.push({ m: k, yr: y.t, occ: 1 - vac - (g > 0 ? lu / g : 0) - (p.units > 0 ? M.down[k] / p.units : 0), gpr: g, vacancy, reno, other, egi, opex, noi, ds, capex: capexSpend, cf, cum })
  }
  return out
}

/* ---------- GP / LP waterfall ---------- */
export interface WaterfallResult {
  totalEquity: number; lpEquity: number; gpEquity: number; acqFee: number
  years: { t: number; cash: number; amFee: number; toLp: number; toGp: number; promote: number }[]
  lpCfs: number[]; gpCfs: number[]
  lp: { irr: number; em: number; profit: number }; gp: { irr: number; em: number; profit: number; promote: number; fees: number }
  dealIrr: number
}
/**
 * Standard IRR hurdle waterfall, run each year on cash after debt service (and sale proceeds in the final year):
 * 1) all equity pari passu until the LP earns the pref IRR (return of capital included);
 * 2) split1 to LP / rest to GP until the LP IRR reaches hurdle2;
 * 3) split2 to LP / rest to GP after that.
 * Fees to the GP come first: acquisition fee at closing (funded with equity), asset management from operating cash, disposition from sale.
 */
export function waterfall(p: Projection): WaterfallResult {
  const w = p.d.wf, N = p.d.hold
  const acqFee = p.d.price * w.acqFee / 100
  const totalEquity = p.equity + acqFee
  const gpShare = Math.min(100, w.gpCo) / 100, lpShare = 1 - gpShare
  const lpEquity = totalEquity * lpShare, gpEquity = totalEquity * gpShare
  let b1 = lpEquity, b2 = lpEquity // LP balances compounding at the pref and at hurdle2
  const r1 = w.pref / 100, r2 = w.hurdle2 / 100, s1 = w.split1 / 100, s2 = w.split2 / 100
  const lpCfs = [-lpEquity], gpCfs = [-gpEquity], years: WaterfallResult["years"] = []
  let feeSum = acqFee, promoteSum = 0
  gpCfs[0] += acqFee // the GP is paid the acquisition fee out of the equity raise
  for (let t = 1; t <= N; t++) {
    const y = p.years[t - 1]
    b1 *= 1 + r1; b2 *= 1 + r2
    const amFee = Math.max(0, y.egi * w.amFee / 100)
    let cash = y.cf + y.refiCash - amFee
    let dispFee = 0
    if (t === N) { dispFee = p.salePrice * w.dispFee / 100; cash += p.proceeds - dispFee }
    let toLp = 0, toGp = 0, promote = 0
    if (cash > 0) {
      // tier 1: pari passu until LP reaches the pref
      const need1 = lpShare > 0 ? Math.max(0, b1) / lpShare : 0
      const c1 = Math.min(cash, need1); toLp += c1 * lpShare; toGp += c1 * gpShare; cash -= c1
      // tier 2: split1 until LP IRR reaches hurdle2
      const lpNow = toLp, b2after = b2 - lpNow
      const need2 = s1 > 0 ? Math.max(0, b2after) / s1 : 0
      const c2 = Math.min(cash, need2); toLp += c2 * s1; toGp += c2 * (1 - s1); cash -= c2
      // tier 3: split2
      toLp += cash * s2; toGp += cash * (1 - s2)
      // GP promote = GP cash above its pro rata share of what was distributed
      const dist = toLp + toGp; promote = toGp - dist * gpShare; if (Math.abs(promote) < 0.5) promote = 0
    } else { toLp = cash * lpShare; toGp = cash * gpShare } // shortfalls shared pro rata
    b1 -= toLp; b2 -= toLp
    feeSum += amFee + dispFee; promoteSum += promote
    lpCfs.push(toLp); gpCfs.push(toGp + amFee + dispFee)
    years.push({ t, cash: toLp + toGp, amFee: amFee + dispFee, toLp, toGp, promote })
  }
  const stats = (cfs: number[], eq: number) => { const back = cfs.slice(1).reduce((a, b) => a + b, 0); return { irr: irr(cfs), em: eq > 0 ? back / eq : NaN, profit: back - eq } }
  const gpOut = gpEquity - acqFee // GP's net cash in at closing after receiving the acquisition fee
  const gpStats = stats(gpCfs, gpEquity)
  return { totalEquity, lpEquity, gpEquity, acqFee, years, lpCfs, gpCfs,
    lp: stats(lpCfs, lpEquity),
    gp: { ...gpStats, irr: gpOut > 0 ? gpStats.irr : NaN, promote: promoteSum, fees: feeSum },
    dealIrr: irr(lpCfs.map((c, i) => c + gpCfs[i])) }
}

/* ---------- professional checks ---------- */
/** Exit cap discipline: exit should sit at or above going in, about +5 bps per hold year (25 to 75 bps). */
export function exitCapCheck(p: Projection) {
  const goingIn = p.y1.cap * 100, exit = p.d.exitCap
  const suggested = goingIn + Math.min(0.75, Math.max(0.25, p.d.hold * 0.05))
  const level = !isFinite(goingIn) || !exit ? "na" : exit < goingIn ? "bad" : exit < suggested - 0.05 ? "warn" : "ok"
  return { goingIn, exit, suggested, level }
}
/** Exit cap stress: IRR and equity multiple with exit cap 50 bps lower and higher. */
export function exitStress(d: Deal) {
  return [-0.5, 0, 0.5].map(bp => { const p = project(d, { exitCap: d.exitCap + bp }); return { exitCap: d.exitCap + bp, irr: p.irr, em: p.em, price: p.salePrice } })
}

/** Expense benchmarks, $ per unit per year (market rate garden / mid rise, 2025-26). */
export const BENCH: Record<string, { label: string; lo: number; hi: number; note: string }> = {
  ins: { label: "Insurance", lo: 400, hi: 1200, note: "Coastal FL, TX Gulf and hail zones often run 1,200 to 2,500." },
  util: { label: "Utilities (owner paid)", lo: 600, hi: 1600, note: "Lower with RUBS or individually metered units." },
  rm: { label: "Repairs & maintenance", lo: 500, hi: 1600, note: "Older vintage runs high." },
  pay: { label: "Payroll", lo: 1000, hi: 2300, note: "Under about 50 units, often third party instead of on site staff." },
  adm: { label: "General & admin", lo: 150, hi: 600, note: "Software, legal, accounting, office." },
  contract: { label: "Contract services", lo: 150, hi: 600, note: "Landscaping, pest, trash, pool, security." },
  turn: { label: "Turnover / make ready", lo: 150, hi: 500, note: "Paint, clean, carpet between tenants." },
  mkt: { label: "Marketing", lo: 50, hi: 350, note: "Listing sites, signage; higher in lease up." },
  res: { label: "Replacement reserves", lo: 250, hi: 500, note: "Lenders require 250 to 350; older assets 400+." },
  total: { label: "Total operating expenses", lo: 5000, hi: 10000, note: "Varies most with taxes, insurance and who pays utilities." },
}
/** Insurance varies more by state than any other line: wind, hail and wildfire exposure drive it. Rough 2025-26
 *  ranges for garden and mid rise apartments, $ per unit per year. Always get a real quote. */
const INS_HIGH = ["FL", "LA"], INS_ELEVATED = ["TX", "OK", "MS", "AL", "SC", "GA", "NC", "CO", "KS", "NE", "CA", "HI"]
export function insTier(state?: string): { tier: "high" | "elevated" | "standard"; lo: number; hi: number; why: string } {
  const s = (state || "").toUpperCase()
  if (INS_HIGH.includes(s)) return { tier: "high", lo: 1200, hi: 3000, why: "Hurricane exposure, a stressed property insurance market and high named storm deductibles." }
  if (INS_ELEVATED.includes(s)) return { tier: "elevated", lo: 800, hi: 1800, why: s === "CA" ? "Wildfire exposure and insurers leaving the state." : s === "CO" ? "Hail and wildfire losses." : "Hail, wind and tornado losses; premiums rose sharply in 2023 to 2025." }
  return { tier: "standard", lo: 400, hi: 1100, why: "Lower catastrophe exposure; older buildings and frame construction still run higher." }
}
export function benchRange(key: string, state?: string) {
  const b = BENCH[key]; if (!b) return null
  if (key === "ins" && state) { const t = insTier(state); return { ...b, lo: t.lo, hi: t.hi, note: t.why } }
  return b
}
export function benchFlag(key: string, perUnit: number, units: number, state?: string): "low" | "high" | "ok" | "na" {
  const b = benchRange(key, state); if (!b || !(units > 0) || !isFinite(perUnit)) return "na"
  if (key === "pay" && units < 50 && perUnit === 0) return "ok"
  if (perUnit === 0 && ["contract", "turn", "mkt"].includes(key)) return "na"
  return perUnit < b.lo ? "low" : perUnit > b.hi ? "high" : "ok"
}

/** Underwritten statement column built from the model, keyed like the seller T12. */
export function underwrittenCol(p: Projection): Record<StatementKey, number> {
  const d = p.d, y = p.years[0]
  return { gpr: y.gpr, ltl: y.ltl, vac: y.vacLoss, conc: y.conc, bad: y.bad, nru: y.nru, other: y.oth, tax: y.tax, ins: y.ins,
    util: d.util, rm: d.rm, pay: d.pay, adm: d.adm, contract: d.contract || 0, turn: d.turn || 0, mkt: d.mkt || 0, mgmt: y.mgmt, res: y.res }
}
/** Totals for any statement column (seller columns may be partial). */
export function colTotals(c: Partial<Record<StatementKey, number>>) {
  const g = (k: StatementKey) => Number(c[k]) || 0
  const egi = g("gpr") - g("ltl") - g("vac") - g("conc") - g("bad") - g("nru") + g("other")
  const opexBR = ["tax","ins","util","rm","pay","adm","contract","turn","mkt","mgmt"].reduce((a, k) => a + g(k as StatementKey), 0)
  const noi = egi - opexBR
  return { egi, opexBR, noi, ncf: noi - g("res") }
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

/** Learner practice deal (Maple Court). Lines add up to about $6,400 per unit including reserves. */
export const PRACTICE: Deal = {
  ...DEFAULTS,
  name: "Practice: Maple Court Apartments", price: 3100000, cc: 2, other: 50, vac: 6,
  tax: 38000, ins: 19000, util: 26000, rm: 24000, pay: 18000, adm: 11000, mgmt: 5, res: 300,
  ltv: 70, rate: 6.5, amort: 30, ioYrs: 0, loanFee: 0, hold: 7, expG: 3, taxG: 3, insG: 5, exitCap: 6.5, sellCost: 2,
  minCap: 6, minDscr: 1.25, minCoc: 6, minIrr: 12, minEm: 1.6,
  rg: [3, 3, 3, 3, 3, 3, 3],
  units: [{ type: "1 bed / 1 bath", count: 12, rent: 1050 }, { type: "2 bed / 1 bath", count: 12, rent: 1350 }],
}
