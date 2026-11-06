// Deal School tools and rules. The server runs these against the deal the browser sends,
// so the AI uses exactly the same math as the screen.
import {
  type Deal, type Overrides, type Projection, NUM_FIELDS, TEST_NAMES, type TestKey,
  project, tests, maxPrice, exitCapCheck, waterfall, weighted, scenCases, irr, norm,
} from "./model.js"
import { locationBrief } from "./checks.js"
import { analyze as analyzeRR } from "./rentroll.js"

export type Route = "learner" | "pro"

const r2 = (n: number) => isFinite(n) ? Math.round(n * 100) / 100 : null
const r0 = (n: number) => isFinite(n) ? Math.round(n) : null

function brief(p: Projection) {
  const d = p.d, t = tests(p, d)
  return {
    price: r0(d.price), units: p.units, equity: r0(p.equity), loan: r0(p.loan),
    year1: { noi: r0(p.y1.noi), egi: r0(p.y1.egi), opex: r0(p.y1.opex), cap_rate_pct: r2(p.y1.cap * 100), dscr: r2(p.y1.dscr),
      cash_flow: r0(p.y1.cf), cash_on_cash_pct: r2(p.y1.coc * 100), expense_ratio_pct: r2(p.y1.expRatio * 100), break_even_occupancy_pct: r2(p.y1.beo * 100) },
    hold: { years: d.hold, noi_by_year: p.years.map(y => r0(y.noi)), cash_flow_by_year: p.years.map(y => r0(y.cf)), dscr_by_year: p.years.map(y => r2(y.dscr)),
      exit_noi: r0(p.exitNoi), exit_cap_pct: d.exitCap, sale_price: r0(p.salePrice), loan_payoff: r0(p.payoff), net_sale_proceeds: r0(p.proceeds),
      irr_pct: r2(p.irr * 100), irr_note: isFinite(p.irr) ? undefined : "IRR undefined: cash flows never earn back the equity",
      unlevered_irr_pct: r2(p.unlevIrr * 100), equity_multiple: r2(p.em), avg_cash_on_cash_pct: r2(p.avgCoc * 100), total_profit: r0(p.profit) },
    lender: { noi_before_reserves: r0(p.y1.noiBR), net_cash_flow_after_reserves: r0(p.y1.noi), debt_yield_pct: r2(p.y1.debtYield * 100),
      sizing_mode: p.sizing.mode, max_loan_ltv: r0(p.sizing.ltvLoan), max_loan_dscr: r0(p.sizing.dscrLoan), max_loan_debt_yield: r0(p.sizing.dyLoan), binding_constraint: p.sizing.binding,
      loan_matures_before_sale: p.balloonBeforeSale || undefined },
    revenue: { loss_to_lease: r0(p.y1.ltl), concessions: r0(p.y1.conc), bad_debt: r0(p.y1.bad), non_revenue_units: r0(p.y1.nru), economic_occupancy_pct: r2(p.y1.econOcc * 100) },
    debt: { type: p.d.debt.type, rate_by_year_pct: p.years.map(y => r2(y.rate)), prepayment_penalty_at_sale: r0(p.prepayPenalty) || undefined,
      refinance: p.refi ? { year: p.refi.yr, value: r0(p.refi.value), new_loan: r0(p.refi.newLoan), binding: p.refi.binding, net_cash: r0(p.refi.cashOut) } : undefined },
    value_add: p.d.va.on ? { units: p.va.units, budget: r0(p.va.budget), return_on_cost_pct: r2(p.va.roc * 100), finished_by_year: p.va.finishYr } : undefined,
    investors: p.d.wf.on ? (() => { const w = waterfall(p); return { lp_irr_pct: r2(w.lp.irr * 100), lp_multiple: r2(w.lp.em), gp_irr_pct: r2(w.gp.irr * 100), gp_fees: r0(w.gp.fees), gp_promote: r0(w.gp.promote) } })() : undefined,
    exit_cap_check: (() => { const e = exitCapCheck(p); return { going_in_cap_pct: r2(e.goingIn), exit_cap_pct: e.exit, suggested_min_exit_cap_pct: r2(e.suggested), status: e.level } })(),
    buy_box: Object.fromEntries((Object.entries(t) as [TestKey, boolean][]).map(([k, b]) => [TEST_NAMES[k], b ? "pass" : "fail"])),
  }
}

/** Map the AI's friendly field names to model overrides. */
function ov(o: any = {}): Overrides {
  const map: Record<string, keyof Overrides> = {
    price: "price", vac: "vac", rate: "rate", ltv: "ltv", amort: "amort", io_years: "ioYrs", tax: "tax", ins: "ins", mgmt: "mgmt", res: "res",
    years: "hold", expense_growth_pct: "expG", tax_growth_pct: "taxG", insurance_growth_pct: "insG", exit_cap_pct: "exitCap",
    selling_cost_pct: "sellCost", rent_change_pct: "rentChangePct", expense_change_pct: "expenseChangePct",
  }
  const m: any = {}
  Object.entries(map).forEach(([a, b]) => { if (o[a] !== undefined && o[a] !== null) m[b] = o[a] })
  if (o.rent_growth_pct !== undefined && o.rent_growth_pct !== null) m.rg = o.rent_growth_pct
  return m
}

const OV_PROPS = {
  price: { type: "number" }, vac: { type: "number", description: "vacancy %" }, rate: { type: "number", description: "interest rate %" },
  ltv: { type: "number" }, amort: { type: "number" }, io_years: { type: "number" },
  tax: { type: "number", description: "year 1 property tax $" }, ins: { type: "number", description: "year 1 insurance $" },
  mgmt: { type: "number" }, res: { type: "number" }, years: { type: "number", description: "hold period" },
  rent_growth_pct: { description: "one number for every year, or an array by year starting with year 2" },
  expense_growth_pct: { type: "number" }, tax_growth_pct: { type: "number" }, insurance_growth_pct: { type: "number" },
  exit_cap_pct: { type: "number" }, selling_cost_pct: { type: "number" },
  rent_change_pct: { type: "number", description: "change all current rents by this %" }, expense_change_pct: { type: "number" },
}

export const TOOL_DEFS = [
  { name: "get_deal", description: "Every input in the screener and the full results: year 1, hold period cash flows, sale, IRR, equity multiple, buy box tests, max price and the scenario table.",
    input_schema: { type: "object", properties: {} } },
  { name: "run_case", description: "Rerun the whole model with temporary changes, without changing the screener. Percent fields are whole numbers, e.g. 7 for 7%.",
    input_schema: { type: "object", properties: OV_PROPS } },
  { name: "weighted_scenarios", description: "Run several cases, each with a name, probability and the same fields as run_case. Returns each case and the IRR of the probability weighted cash flows.",
    input_schema: { type: "object", properties: { scenarios: { type: "array", items: { type: "object" } } }, required: ["scenarios"] } },
  { name: "max_bid", description: "Highest purchase price that hits a target IRR and/or year 1 cash on cash, for one case (same fields as run_case) or for weighted scenarios.",
    input_schema: { type: "object", properties: { target_irr_pct: { type: "number" }, target_year1_coc_pct: { type: "number" }, case: { type: "object" }, scenarios: { type: "array", items: { type: "object" } } } } },
  { name: "get_location", description: "The deal's state and what it means for underwriting: property tax level and how taxes reset after a sale, rent regulation and caps, income tax, owner groups, and checks against this deal's inputs with suggested changes.",
    input_schema: { type: "object", properties: {} } },
  { name: "update_inputs", description: "Change inputs in the screener so every tab shows them. Only when the user asks to use a number. Keys: " + NUM_FIELDS.join(", ") + ", rg as one rent growth number for all years, sizeMode ('ltv' or 'lesser' of LTV, DSCR and debt yield), lu: lease up {on, startOcc (% occupied at closing), months to stabilize}, debt: loan options {type: fixed|floating, sofr, sofrChg (bps/yr), spread, capOn, capStrike, capCost, prepay: none|stepdown|ym|exitfee, steps, exitFee, tsy, refiOn, refiYr, refiCap, refiLtv, refiDscr, refiRate, refiAmort, refiIo, refiCost}, va: value add program {on, units, cost, premium, pace, startMo, downMo, upfront}, wf: syndication waterfall {on, gpCo, pref, split1, hurdle2, split2, acqFee, amFee, dispFee} (send only the keys to change), rentComps: FULL list [{name, dist (miles), built, type (must match a unit type name), rent, sf}], saleComps: FULL list [{name, date, built, units, price, cap (%)}], and custom: the FULL list of added lines, each {label, kind: income|expense|capex, basis: year|unitMonth|pctGpr|pctEgi|once, amt, growth, start, end} (read current ones with get_deal first and include them).",
    input_schema: { type: "object", properties: { changes: { type: "object" } }, required: ["changes"] } },
] as const

/** Runs one tool. Returns the result and, for update_inputs, the new deal. */
export function runTool(name: string, input: any, deal: Deal): { result: unknown; deal: Deal } {
  const d = norm(deal)
  switch (name) {
    case "get_deal": {
      const p = project(d), mp = maxPrice(d), W = weighted(d, scenCases(d.scen))
      const { units, scen, rr, ...inputs } = d as any
      if (rr?.length) (inputs as any).rent_roll = (() => { const a = analyzeRR(rr); return { units: a.total, physical_occupancy_pct: r2(a.physicalOcc * 100), month_to_month: a.mtm, below_market_10pct: a.below, by_type: a.types.map(t => ({ type: t.type, count: t.count, occupied: t.occupied, avg_in_place: r0(t.inPlace), avg_market: r0(t.market) })), expirations_next_12_months: a.months.map(m => m.count) } })()
      return { deal: d, result: { inputs, unit_mix: units, results: brief(p), max_price_passing_buy_box: isFinite(mp) ? mp : null,
        scenarios: W.runs.map((r, i) => ({ ...scen[i], irr_pct: r2(r.p.irr * 100), equity_multiple: r2(r.p.em) })), weighted_irr_pct: r2(W.irr * 100) } }
    }
    case "run_case":
      return { deal: d, result: brief(project(d, ov(input))) }
    case "weighted_scenarios": {
      const sc: any[] = input?.scenarios || []
      const W = weighted(d, sc.map(s => ({ name: s.name, prob: Number(s.probability) || 0, o: ov(s) })))
      return { deal: d, result: {
        cases: W.runs.map(r => ({ name: r.name, probability_pct: r2(r.w * 100), ...brief(r.p).hold, year1_cash_on_cash_pct: r2(r.p.y1.coc * 100), min_dscr: r2(r.p.minDscr) })),
        weighted_irr_on_blended_cash_flows_pct: r2(W.irr * 100) } }
    }
    case "max_bid": {
      const q = input || {}
      const evalAt = (price: number) => {
        if (q.scenarios?.length) {
          const W = weighted(d, q.scenarios.map((s: any) => ({ prob: Number(s.probability) || 0, o: { ...ov(s), price } })))
          return { irr: W.irr, coc: W.y1Coc }
        }
        const p = project(d, { ...ov(q.case || {}), price }); return { irr: p.irr, coc: p.y1.coc }
      }
      const ok = (price: number) => {
        const r = evalAt(price)
        if (q.target_irr_pct != null && !(isFinite(r.irr) && r.irr * 100 >= q.target_irr_pct)) return false
        if (q.target_year1_coc_pct != null && !(r.coc * 100 >= q.target_year1_coc_pct)) return false
        return true
      }
      let lo = d.price * 0.2, hi = d.price * 2
      if (!ok(lo)) return { deal: d, result: { max_price: null, note: "No price down to 20% of asking hits the target." } }
      if (ok(hi)) return { deal: d, result: { max_price: Math.round(hi), note: "Target met even at twice asking." } }
      for (let i = 0; i < 50; i++) { const mid = (lo + hi) / 2; if (ok(mid)) lo = mid; else hi = mid }
      const mp = Math.floor(lo / 10000) * 10000
      return { deal: d, result: { max_price: mp, vs_asking_pct: r2((mp / d.price - 1) * 100) } }
    }
    case "update_inputs": {
      const next: any = structuredClone(d), applied: Record<string, number> = {}
      Object.entries(input?.changes || {}).forEach(([k, v]) => {
        if (k === "rg" && isFinite(Number(v))) { next.rg = next.rg.map(() => Number(v)); applied.rg = Number(v) }
        else if ((k === "va" || k === "wf" || k === "debt" || k === "lu") && v && typeof v === "object") { next[k] = { ...next[k], ...(v as object) }; (applied as any)[k] = v }
        else if ((k === "rentComps" || k === "saleComps") && Array.isArray(v)) { next[k] = v; (applied as any)[k] = `${v.length} comps` }
        else if (k === "custom" && Array.isArray(v)) { next.custom = v; (applied as any).custom = `${v.length} lines` }
        else if (k === "sizeMode" && (v === "ltv" || v === "lesser")) { next.sizeMode = v; (applied as any).sizeMode = v }
        else if ((NUM_FIELDS as readonly string[]).includes(k) && isFinite(Number(v))) { next[k] = Number(v); applied[k] = Number(v) }
      })
      return { deal: norm(next), result: { applied } }
    }
    case "get_location":
      return { deal: d, result: locationBrief(d) }
    default:
      return { deal: d, result: { error: "Unknown tool " + name } }
  }
}

export const RULES: Record<Route, string> = {
  learner: `You are Deal School, running inside the user's Multifamily Deal Screener website on the LEARNER route.
Act like a friendly, experienced deal partner, not a teacher. No quizzes, no "great job", no lesson headers.
Explain an idea in one or two plain sentences only when it first matters, then keep moving. Match the user's pace; if they want to move fast, just give results.
If the user says something factually wrong, such as counting the mortgage in NOI or thinking a higher cap rate means a higher price, correct it right away in one friendly line.
If the user makes a judgment call you disagree with, such as 0% vacancy or no management fee, say once in one line what most underwriters use, then use THEIR number. Later show their number next to a typical one so they see the dollar difference.
Go along with whatever the user assumes about the future market. Don't argue forecasts.
When taxes or rent growth come up, call get_location and explain in a line how the property's state changes them.
Keep a beginner's first pass to year 1 numbers unless they ask about IRR or the hold period. Point them to the page that shows what you're talking about, using these names: Overview, Property › Rent & income / Expenses / Value add / Documents, Market › Location / Comps, Financials › Operating statement / Projections / Scenarios, Capital › Debt / Investors, Pipeline.`,
  pro: `You are Deal School, running inside the owner's Multifamily Deal Screener website on the PRO route. Act like a sharp analyst briefing a principal: concise, numbers first. Don't explain concepts unless asked.
Model every variable that matters: rent growth by year, vacancy, expense, tax and insurance growth, tax after reassessment on the purchase price, rate and interest only period, exit cap, hold period.
Build at least a downside, base and upside case with explicit assumptions, ask the owner to adjust them and put a probability on each, then run weighted_scenarios with THEIR weights. If an owner assumption is far outside normal ranges, say so once, then model it their way.
Show breakpoints, such as the exit cap or rent growth where the deal misses target, and give a max bid with max_bid.
Call get_location for the state's tax, reassessment and rent rules and fold them into the cases (for example, cap rent growth where a statewide cap applies and reset taxes on the purchase price). You cannot browse the web here: for comps, supply, and current officials or bills, use figures the owner gives you or point them to Market Check's live data and policy briefing. Label your own assumptions and never invent comps or sources.`,
}
export const COMMON = `Always use the tools for numbers; never do arithmetic in your head. Call get_deal first in a conversation.
Formatting: short paragraphs and simple lists with "- ". Use **bold** sparingly. No markdown tables; for comparisons use short lines like "Base: IRR 12.1%, CoC 6.2%".
On politics, stay neutral: describe what laws and proposals do and what owners and tenant advocates each say, never which side is right or how to vote.
This is decision support, not investment advice.`

export { irr }
