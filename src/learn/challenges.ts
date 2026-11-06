// Challenges: "Spot the seller's trick" puzzles and "Deal Duels".
// Every number in a duel's reveal is computed with the site's model, so the answers always match the screener.
import { type Deal, DEFAULTS, project, norm } from "../lib/model"

/* ======================================================================
   Spot the seller's trick
   ====================================================================== */
export interface TrickRow { cells: string[]; trap?: string; note?: string; total?: boolean }
export interface TrickPuzzle {
  id: string; title: string; doc: "T12" | "Rent roll" | "Offering memo"; level: 1 | 2 | 3
  setup: string; columns: string[]; rows: TrickRow[]
  /** What fixing the traps does to the deal, shown after checking. */
  impact: [string, string, boolean?][]
  lesson: string
}

export const TRICKS: TrickPuzzle[] = [
  {
    id: "t1", title: "Cedar Ridge Apartments", doc: "T12", level: 1,
    setup: "A broker sends the trailing 12 month statement for a 24 unit building in Fayetteville, Arkansas. Asking price $3,100,000. The seller has owned it since 2009 and manages it himself. Click every line you wouldn't put in your model as is.",
    columns: ["Line", "Last 12 months"],
    rows: [
      { cells: ["Gross potential rent", "$345,600"], note: "12 units at $1,050 and 12 at $1,350 a month. Matches the rent roll." },
      { cells: ["Vacancy and credit loss", "$0"], trap: "The building is full today, but people move out and some don't pay. Underwrite at least 5% to 7% even on a full building." },
      { cells: ["Other income (laundry, fees)", "$14,400"], note: "$50 per unit per month is normal." },
      { cells: ["Effective gross income", "$360,000"], total: true },
      { cells: ["Property taxes", "$14,200"], trap: "This is the seller's bill on a value set years ago. Arkansas counties move toward the sale price, so on $3.1M expect about $32,600." },
      { cells: ["Insurance", "$19,000"], note: "About $790 a unit, reasonable for Northwest Arkansas." },
      { cells: ["Utilities (water, trash, common electric)", "$26,000"], note: "Owner pays water and trash. Normal." },
      { cells: ["Repairs and maintenance", "$24,000"], note: "$1,000 a unit, a healthy number." },
      { cells: ["Payroll", "$18,000"], note: "Part time maintenance tech. Fine for 24 units." },
      { cells: ["Admin, legal, marketing", "$11,000"], note: "Normal." },
      { cells: ["Management fee", "$0"], trap: "The seller manages it himself for free. You'll pay a manager about 5% of collections, and a lender will underwrite one either way." },
      { cells: ["Total operating expenses", "$112,200"], total: true },
      { cells: ["Net operating income", "$247,800"], total: true },
    ],
    impact: [["Seller's NOI", "$247,800"], ["Add 6% vacancy", "−$20,736"], ["Taxes reset on your price", "−$18,400"], ["5% management fee", "−$16,963"], ["NOI you can count on", "$191,701", true], ["Value lost at a 6.5% cap", "about $863,000", true]],
    lesson: "Three lines, $56,000 of NOI, about $863,000 of value. Vacancy, management and taxes are the three most common seller traps.",
  },
  {
    id: "t2", title: "Oak Hollow, 10 units", doc: "Rent roll", level: 2,
    setup: "Here's the rent roll for a 10 unit building. The seller says it's '100% occupied with $11,875 a month in rent.' Click the units that make that claim wrong.",
    columns: ["Unit", "Type", "Status", "Lease ends", "Rent", "Balance due"],
    rows: [
      { cells: ["101", "1 bed", "Occupied", "Mar 2027", "$925", "$0"], note: "Normal." },
      { cells: ["102", "1 bed", "Occupied", "Dec 2026", "$925", "$0"], note: "Normal." },
      { cells: ["103", "1 bed", "Vacant", "—", "$925", "$0"], trap: "Vacant, but its rent is counted in the total. A vacant unit collects nothing until it's leased." },
      { cells: ["104", "1 bed", "Occupied", "Month to month", "$875", "$0"], note: "Month to month is common and fine; it can even let you raise rent sooner." },
      { cells: ["201", "2 bed", "Occupied", "Jun 2027", "$1,150", "$3,450"], trap: "Three months behind. Occupied isn't the same as paying. Ask about the eviction status and don't count this rent." },
      { cells: ["202", "2 bed", "Occupied", "Jan 2027", "$1,150", "$0"], note: "Normal." },
      { cells: ["202", "2 bed", "Occupied", "Jan 2027", "$1,150", "$0"], trap: "Unit 202 is listed twice. Duplicates inflate both unit count and rent. Always check the count against the actual buildings." },
      { cells: ["203", "2 bed", "Occupied", "Feb 2027", "$1,600", "$0"], trap: "$450 above every other 2 bed. Ask for the lease: it may be furnished, short term or a related party, and it likely won't renew at that rate." },
      { cells: ["204", "2 bed", "Occupied", "Nov 2026", "$1,150", "$0"], note: "Lease ends this month. Normal turnover, nothing hidden." },
      { cells: ["301", "2 bed", "Occupied", "Apr 2027", "$1,125", "$0"], note: "$25 lower than the others: normal variation, maybe an older lease." },
      { cells: ["Total", "", "100% occupied", "", "$11,875", ""], total: true },
    ],
    impact: [["Seller's monthly rent", "$11,875"], ["Remove vacant 103", "−$925"], ["Remove duplicate 202", "−$1,150"], ["Remove nonpaying 201", "−$1,150"], ["203 at a normal $1,150", "−$450"], ["Rent actually being collected", "$8,200", true], ["Real occupancy", "8 of 9 real units leased, 7 paying", true]],
    lesson: "The real building has 9 units and collects $8,200 a month, 31% less than the seller's total. Always tie the rent roll to bank deposits.",
  },
  {
    id: "t3", title: "Sunbelt Station, Dallas", doc: "Offering memo", level: 2,
    setup: "The offering memo summary for a 60 unit Dallas property listed at $9,600,000. Click the numbers you'd challenge before you trust the price.",
    columns: ["Item", "Broker's number"],
    rows: [
      { cells: ["Occupancy", "94%"], note: "A normal, healthy occupancy." },
      { cells: ["In place average rent", "$1,180"], note: "What tenants pay today. This is what you underwrite year 1 on." },
      { cells: ["Pro forma rent after renovations", "$1,395"], note: "Fine as an upside plan, as long as the price isn't based on it." },
      { cells: ["Going in cap rate", "6.25% (on pro forma NOI)"], trap: "The cap rate uses NOI after renovations that haven't happened. On today's rents it's closer to 4.5%. You'd be paying the seller for your own future work." },
      { cells: ["Expense ratio", "31%"], trap: "Too low for Texas, where property tax alone is often 2% of value. Expect 40% to 50% for a 1990s building." },
      { cells: ["Property taxes", "$96,000 (2025 actual)"], trap: "Texas appraises at market every year; at $9.6M and about 2%, expect around $192,000." },
      { cells: ["Year built", "1998"], note: "Fine. Older buildings need a bigger capital budget, which the memo mentions." },
      { cells: ["Renovation budget", "$8,000 a unit on 30 units"], note: "A reasonable light value add budget." },
      { cells: ["Exit cap rate in year 5", "5.75%"], trap: "Lower than the going in cap, so the model assumes the market pays more for an older building later. Use an exit cap at or above the going in cap." },
    ],
    impact: [["Taxes alone", "+$96,000 a year in expenses"], ["Value of that tax gap at a 6% cap", "about $1.6 million", true], ["Cap rate on in place rents", "about 4.5%", true]],
    lesson: "Offering memos are sales documents. Price on in place income, your own expenses, and an exit cap no lower than today's.",
  },
  {
    id: "t4", title: "Riverbend Flats", doc: "T12", level: 3,
    setup: "A 32 unit property with a great looking T12. The NOI is up 18% from last year. Find out why before you celebrate.",
    columns: ["Line", "Last 12 months", "Per unit"],
    rows: [
      { cells: ["Gross potential rent", "$422,400", "$13,200"], note: "$1,100 a month average, matches the rent roll." },
      { cells: ["Vacancy and credit loss (5%)", "−$21,120", "−$660"], note: "Reasonable." },
      { cells: ["Other income", "$58,000", "$1,813"], trap: "Includes a $41,000 insurance claim payout from a hail storm. That's one time money, not income you'll get again. Recurring other income is about $17,000." },
      { cells: ["Effective gross income", "$459,280", ""], total: true },
      { cells: ["Property taxes", "$41,000", "$1,281"], note: "In line with the purchase price for this county." },
      { cells: ["Insurance", "$9,600", "$300"], trap: "About a third of what similar buildings pay now, and the policy renews next month. Get a real quote; expect $700 to $900 a unit." },
      { cells: ["Utilities", "$0", "$0"], note: "Separately metered; tenants pay electric, water and gas directly. Legit." },
      { cells: ["Repairs and maintenance", "$6,400", "$200"], trap: "Far below a normal $600 to $900 a unit. The seller is deferring maintenance to boost NOI before selling; you'll pay for it after closing." },
      { cells: ["Payroll", "$28,000", "$875"], note: "Normal." },
      { cells: ["Management (4%)", "$18,371", "$574"], note: "4% is on the low end but common for a third party manager at this size." },
      { cells: ["Admin and marketing", "$9,000", "$281"], note: "Normal." },
      { cells: ["Net operating income", "$346,909", ""], total: true },
    ],
    impact: [["Seller's NOI", "$346,909"], ["Remove the insurance claim", "−$41,000"], ["Insurance at $800 a unit", "−$16,000"], ["R&M at $700 a unit", "−$16,000"], ["Management on lower income", "+$1,640"], ["Recurring NOI", "$275,549", true], ["Value lost at a 6.5% cap", "about $1.1 million", true]],
    lesson: "When NOI jumps right before a sale, look for one time income and expenses that were cut, not grown.",
  },
]

/* ======================================================================
   Deal Duels
   ====================================================================== */
export type DuelField = "vac" | "tax" | "ins" | "rm" | "mgmt" | "res"
export const DUEL_FIELDS: { k: DuelField; label: string; step: number; pct?: boolean }[] = [
  { k: "vac", label: "Vacancy and credit loss (%)", step: 0.5, pct: true },
  { k: "tax", label: "Property taxes ($/yr)", step: 500 },
  { k: "ins", label: "Insurance ($/yr)", step: 500 },
  { k: "rm", label: "Repairs and maintenance ($/yr)", step: 500 },
  { k: "mgmt", label: "Management (% of income)", step: 0.5, pct: true },
  { k: "res", label: "Reserves ($ per unit per yr)", step: 25 },
]

export interface Duel {
  id: string; title: string; state: string; level: 1 | 2 | 3; minutes: number
  pitch: string
  clues: string[]
  /** The deal exactly as the seller presents it. */
  seller: Deal
  /** What turns out to be true. Only the fields that differ from the seller. */
  truth: Partial<Pick<Deal, DuelField>>
  marketCap: number
  outcome: string
}

const D = (o: Partial<Deal>): Deal => norm({ ...DEFAULTS, cc: 2, loanFee: 0, ltv: 70, rate: 6.5, amort: 30, hold: 5, exitCap: 6.75, ...o })

export const DUELS: Duel[] = [
  {
    id: "d1", title: "The long time owner", state: "AR", level: 1, minutes: 8,
    pitch: "\"Pristine 24 unit asset in Fayetteville, 100% occupied for three years straight. Owner has managed it personally since 2009 and is retiring. Priced to sell at $3,100,000, an 8% cap on actual numbers. Best and final offers due Friday.\"",
    clues: ["The seller's T12 shows $0 vacancy and $0 management fee.", "Property taxes on the T12: $14,200. The county assessor last revalued it in 2021.", "No replacement reserves in the seller's numbers."],
    seller: D({ name: "Cedar Ridge Apartments", state: "AR", price: 3100000, other: 50, vac: 0, tax: 14200, ins: 19000, util: 26000, rm: 24000, pay: 18000, adm: 11000, mgmt: 0, res: 0,
      units: [{ type: "1 bed", count: 12, rent: 1050 }, { type: "2 bed", count: 12, rent: 1350 }] }),
    truth: { vac: 6, tax: 32600, mgmt: 5, res: 300 },
    marketCap: 6.5,
    outcome: "You'd have won the bid at asking and found out at the first tax bill. The county reassessed at the sale price and taxes more than doubled. With a manager, normal turnover and reserves, the real NOI is about $185,000, not $248,000.",
  },
  {
    id: "d2", title: "The Sun Belt darling", state: "TX", level: 2, minutes: 10,
    pitch: "\"Sunbelt Station: 60 units in a booming Dallas suburb, 94% occupied. Huge rent upside: in place $1,180 vs $1,395 renovated comps. Expense ratio just 31%. Asking $9,600,000.\"",
    clues: ["The T12 shows taxes of $96,000, from 2025 when it was appraised at about $4.8M.", "Insurance renewal quote just came in at $78,000, up from $54,000.", "The building is 1998 vintage; R&M on the T12 is $500 a unit."],
    seller: D({ name: "Sunbelt Station", state: "TX", price: 9600000, other: 45, vac: 6, tax: 96000, ins: 54000, util: 66000, rm: 30000, pay: 72000, adm: 24000, mgmt: 3.5, res: 250,
      units: [{ type: "1 bed", count: 30, rent: 1050 }, { type: "2 bed", count: 30, rent: 1310 }] }),
    truth: { tax: 192000, ins: 78000, rm: 45000, mgmt: 4 },
    marketCap: 5.75,
    outcome: "Once Texas taxes reset on the purchase price and the real insurance quote landed, NOI fell by nearly a third. The deal only works at a price far below asking. Two other buyers walked too; it sold eight months later for about 30% less.",
  },
  {
    id: "d3", title: "The boring eight-plex", state: "OH", level: 1, minutes: 6,
    pitch: "\"Eight 2 bed units in Dayton, Ohio. Long term tenants, newer roof, owner's numbers prepared by a CPA. Asking $550,000.\"",
    clues: ["Vacancy on the T12 is 6% and the seller includes an 8% management fee.", "Taxes are $9,000, based on a 2024 county reappraisal near today's value.", "Insurance was just rebid at $4,800."],
    seller: D({ name: "Elm Street Eight", state: "OH", price: 550000, other: 25, vac: 6, tax: 9000, ins: 4800, util: 7200, rm: 6400, pay: 0, adm: 2000, mgmt: 8, res: 300,
      units: [{ type: "2 bed", count: 8, rent: 850 }] }),
    truth: {},
    marketCap: 7.25,
    outcome: "Sometimes the seller's numbers are honest. Taxes, insurance, vacancy and management were already realistic, and the deal covered its loan with room to spare. Buyers who kept hunting for a problem lost it to someone who closed in 30 days.",
  },
  {
    id: "d4", title: "Waterfront and water risk", state: "FL", level: 3, minutes: 10,
    pitch: "\"Harbor Point: 40 units minutes from Tampa Bay. 96% occupied, strong in place rents. Seller has insured it for just $48,000 a year. Asking $6,400,000.\"",
    clues: ["FEMA's map puts the property in flood zone AE; the lender will require flood insurance.", "A real quote for wind and property plus flood came in at $112,000 a year.", "Taxes on the T12 are $61,000; the seller has owned since 2014.", "Florida's 10% cap on non homestead assessments resets at sale."],
    seller: D({ name: "Harbor Point", state: "FL", price: 6400000, other: 60, vac: 5, tax: 61000, ins: 48000, util: 38000, rm: 32000, pay: 52000, adm: 16000, mgmt: 4, res: 300,
      units: [{ type: "1 bed", count: 20, rent: 1500 }, { type: "2 bed", count: 20, rent: 1850 }] }),
    truth: { tax: 115200, ins: 112000 },
    marketCap: 5.75,
    outcome: "Insurance and taxes added about $118,000 a year in costs, and at asking the loan no longer met a 1.25 DSCR. The seller refused to believe the insurance quote until every buyer's quote came in the same; it sold to the buyer who had offered a price that worked with the real costs.",
  },
]

/* ---------- scoring ---------- */
export type Call = "pursue" | "renegotiate" | "pass"

/** Highest price that reaches a 1.25 DSCR and 6% cash on cash in year 1 (same rule as the Learn walkthrough). */
export function fairPrice(d: Deal) {
  const ok = (pr: number) => { const q = project(d, { price: pr }); return q.y1.dscr >= 1.25 && q.y1.coc >= 0.06 }
  let lo = d.price * 0.3, hi = d.price * 1.5
  if (!ok(lo)) return NaN
  if (ok(hi)) return hi
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (ok(m)) lo = m; else hi = m }
  return Math.floor(lo / 10000) * 10000
}

export function trueDeal(x: Duel): Deal { return norm({ ...x.seller, ...x.truth }) }

export function rightCall(x: Duel): { call: Call; fair: number } {
  const t = trueDeal(x), fair = fairPrice(t)
  if (isFinite(fair) && fair >= t.price) return { call: "pursue", fair }
  if (isFinite(fair) && fair >= t.price * 0.75) return { call: "renegotiate", fair }
  return { call: "pass", fair }
}

export interface DuelScore { total: number; assumptions: number; decision: number; offer: number; fieldHits: Record<string, boolean> }

const close = (k: DuelField, yours: number, truth: number) =>
  k === "vac" || k === "mgmt" ? Math.abs(yours - truth) <= 1.5 : k === "res" ? Math.abs(yours - truth) <= 75 : Math.abs(yours / truth - 1) <= 0.12

export function scoreDuel(x: Duel, yours: Deal, call: Call, offer: number): DuelScore {
  const t = trueDeal(x), right = rightCall(x)
  // Assumptions: every field that was a trap, plus a check that you didn't break honest numbers.
  const fields = DUEL_FIELDS.map(f => f.k)
  const traps = fields.filter(k => x.truth[k] !== undefined)
  const checked = traps.length ? traps : fields
  const fieldHits: Record<string, boolean> = {}
  checked.forEach(k => { fieldHits[k] = close(k, yours[k] as number, t[k] as number) })
  const assumptions = Math.round(50 * checked.filter(k => fieldHits[k]).length / checked.length)
  const decision = call === right.call ? 30 : (call === "renegotiate" && right.call !== "renegotiate") || (right.call === "renegotiate" && call !== "renegotiate") ? 10 : 0
  let offerPts = 0
  if (call === right.call && call !== "renegotiate") offerPts = 20
  else if (call === "renegotiate" && isFinite(right.fair) && offer > 0) {
    const miss = Math.abs(offer / right.fair - 1)
    offerPts = miss <= 0.05 ? 20 : miss <= 0.1 ? 14 : miss <= 0.2 ? 7 : 0
  }
  return { total: assumptions + decision + offerPts, assumptions, decision, offer: offerPts, fieldHits }
}

export const DUEL_LEVEL = ["", "Starter", "Intermediate", "Advanced"]
