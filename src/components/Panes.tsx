import { useState } from "react"
import { stateBy, rentalTaxRate, DEFAULT_REASSESS } from "../lib/states"
import {
  benchFlag, benchRange, insTier, STATUSES, type Deal, type NumField, type Projection, type Scenario, type TestKey,
  usd, pct, xx, project, waterfall, weighted, scenCases, defaultScen, avgGrowth, memo, tests, allPass, TEST_NAMES,
} from "../lib/model"
import { Card, Field, NumInput, Row } from "./ui"
import type { SavedDeal } from "../lib/store"
import CashFlowChart from "./CashFlowChart"
import { CustomLinesCard } from "./CustomLines"
import { DebtOptions } from "./DebtOptions"
import { MemoView } from "./Memo"
import { exportXlsx } from "../lib/exportXlsx"

export interface PaneProps { d: Deal; p: Projection; set: (patch: Partial<Deal>) => void; mp: number }

function Num({ d, set, k, label, step = 1, hint }: { d: Deal; set: PaneProps["set"]; k: NumField; label: string; step?: number; hint?: string }) {
  return <Field label={label} hint={hint}><NumInput value={d[k]} step={step} onChange={v => set({ [k]: v } as Partial<Deal>)} /></Field>
}

/* ---------- Summary ---------- */
export function SummaryPane({ d, p, mp }: PaneProps) {
  const [memoOpen, setMemoOpen] = useState(false), [busy, setBusy] = useState(false)
  return (
    <div className="space-y-4">
      {memoOpen && <MemoView d={d} p={p} mp={mp} onClose={() => setMemoOpen(false)} />}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3">
        <span className="mr-auto text-sm text-brand-700"><b>Share this deal:</b> an investment memo for your partners or lender, or the full model in Excel.</span>
        <button className="btn btn-primary" onClick={() => setMemoOpen(true)}>Investment memo (PDF)</button>
        <button className="btn" disabled={busy} onClick={async () => { setBusy(true); try { await exportXlsx(d, p) } finally { setBusy(false) } }}>{busy ? "Building…" : "Download Excel"}</button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Sources & uses">
          <table className="tbl"><tbody>
            <tr className="head"><td>Uses</td><td /></tr>
            <Row label="Purchase price" value={usd(d.price)} />
            <Row label={`Closing costs (${d.cc}%)`} value={usd(p.closing)} />
            <Row label={`Loan fees (${d.loanFee}%)`} value={usd(p.fee)} />
            {d.capexUp > 0 && <Row label="Up front capex" value={usd(d.capexUp)} />}
            {p.va.upfront > 0 && <Row label="Renovation budget" value={usd(p.va.upfront)} />}
            {p.capCost > 0 && <Row label="Interest rate cap" value={usd(p.capCost)} />}
            <Row label="Total uses" value={usd(d.price + p.closing + p.fee + (d.capexUp || 0) + p.va.upfront + p.capCost)} cls="total" />
            <tr className="head"><td>Sources</td><td /></tr>
            <Row label={`Loan (${d.price > 0 ? (p.loan / d.price * 100).toFixed(1) : d.ltv}% LTV${d.sizeMode === "lesser" ? `, ${p.sizing.binding} binds` : ""})`} value={usd(p.loan)} />
            <Row label="Equity" value={usd(p.equity)} />
            <Row label="Total sources" value={usd(p.loan + p.equity)} cls="total" />
          </tbody></table>
        </Card>
        <Card title="Returns over the hold">
          <table className="tbl"><tbody>
            <Row label="Levered IRR" value={pct(p.irr)} />
            <Row label="Unlevered IRR" value={pct(p.unlevIrr)} />
            {d.wf.on && (() => { const w = waterfall(p); return <><Row label="Investor (LP) IRR after fees and promote" value={pct(w.lp.irr)} /><Row label="Sponsor (GP) IRR incl. fees" value={pct(w.gp.irr)} cls="sub" /></> })()}
            <Row label="Equity multiple" value={xx(p.em)} />
            <Row label="Average cash on cash" value={pct(p.avgCoc)} />
            <Row label="Total profit" value={usd(p.profit)} />
            <Row label={`Net sale proceeds, year ${d.hold}`} value={usd(p.proceeds)} />
            <Row label="Lowest DSCR during hold" value={xx(p.minDscr)} />
          </tbody></table>
        </Card>
      </div>
      <Card title="Cash flow to equity by year">
        <CashFlowChart p={p} />
        <p className="note mt-2">Bars are annual cash flow after debt service. The last bar adds net sale proceeds.</p>
      </Card>
      <Card title="Deal memo" right={<button className="btn" onClick={() => navigator.clipboard?.writeText(memo(d, p, mp)).catch(() => {})}>Copy memo</button>}>
        <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50 p-3 font-sans text-[13px]">{memo(d, p, mp)}</pre>
      </Card>
    </div>
  )
}

/* ---------- Property & Income ---------- */
export function IncomePane({ d, p, set }: PaneProps) {
  const units = d.units
  const setUnit = (i: number, patch: Partial<Deal["units"][number]>) => set({ units: units.map((u, j) => j === i ? { ...u, ...patch } : u) })
  const items = d.otherItems || []
  const setItems = (next: Deal["otherItems"]) => set({ otherItems: next, other: Math.round(next.reduce((a, o) => a + (o.amt || 0), 0) * 100) / 100 })
  const y = p.y1, sf = units.reduce((a, u) => a + u.count * (u.sf || 0), 0)
  const grid = "grid grid-cols-[minmax(0,1.3fr)_64px_minmax(0,1fr)_minmax(0,1fr)_64px_20px] gap-2"
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <Card title="Property">
          <div className="grid grid-cols-2 gap-3">
            <Num d={d} set={set} k="price" label="Purchase price ($)" step={1000} />
            <Num d={d} set={set} k="cc" label="Closing costs (% of price)" step={0.1} />
            <Num d={d} set={set} k="capexUp" label="Up front capex ($)" step={5000} hint="Renovations and immediate repairs funded at closing. Added to equity." />
          </div>
        </Card>
        <Card title="Unit mix (monthly)">
          <div className={`mb-1 text-xs text-slate-500 ${grid}`}><span>Unit type</span><span>Count</span><span>In place rent</span><span>Market rent</span><span>Avg SF</span><span /></div>
          {units.map((u, i) => (
            <div key={i} className={`mb-2 items-center ${grid}`}>
              <input value={u.type} onChange={e => setUnit(i, { type: e.target.value })} />
              <NumInput value={u.count} min={0} onChange={v => setUnit(i, { count: v })} />
              <NumInput value={u.rent} min={0} step={5} onChange={v => setUnit(i, { rent: v })} />
              <NumInput value={u.market || 0} min={0} step={5} onChange={v => setUnit(i, { market: v })} />
              <NumInput value={u.sf || 0} min={0} step={10} onChange={v => setUnit(i, { sf: v })} />
              <button className="text-slate-400 hover:text-fail-600" title="Remove" onClick={() => set({ units: units.length > 1 ? units.filter((_, j) => j !== i) : [{ type: "", count: 0, rent: 0 }] })}>✕</button>
            </div>
          ))}
          <button className="btn mt-1" onClick={() => set({ units: [...units, { type: "", count: 0, rent: 0 }] })}>+ Add unit type</button>
          <p className="note mt-2">Leave market rent at 0 if in place rents are at market. When market is higher, gross potential rent is booked at market and the gap shows as loss to lease, the way a rent roll and T12 report it.</p>
        </Card>
        <Card title="Revenue deductions">
          <div className="grid grid-cols-2 gap-3">
            <Num d={d} set={set} k="vac" label="Physical vacancy (% of GPR)" step={0.5} />
            <Num d={d} set={set} k="conc" label="Concessions (% of GPR)" step={0.25} />
            <Num d={d} set={set} k="bad" label="Bad debt (% of GPR)" step={0.25} />
            <Num d={d} set={set} k="nru" label="Non revenue units (count)" hint="Model, office, employee or down units." />
            <Num d={d} set={set} k="ltlBurn" label="Years to burn off loss to lease" hint="0 keeps the gap. 2 to 3 is typical as leases roll." />
          </div>
          <p className="note mt-2">Lenders underwrite economic vacancy (vacancy + concessions + bad debt + non revenue) of at least 5 to 7%, even when the building is full.</p>
        </Card>
        <Card title="Other income ($/unit/mo)">
          {items.length === 0 && <div className="grid grid-cols-2 gap-3"><Num d={d} set={set} k="other" label="Other income total ($/unit/mo)" step={5} /></div>}
          {items.map((o, i) => (
            <div key={i} className="mb-2 grid grid-cols-[1.6fr_1fr_24px] items-center gap-2">
              <input value={o.label} placeholder="RUBS, parking, pet, fees, laundry…" onChange={e => setItems(items.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
              <NumInput value={o.amt} step={1} onChange={v => setItems(items.map((x, j) => j === i ? { ...x, amt: v } : x))} />
              <button className="text-slate-400 hover:text-fail-600" onClick={() => setItems(items.filter((_, j) => j !== i))}>✕</button>
            </div>
          ))}
          <button className="btn mt-2" onClick={() => setItems(items.length ? [...items, { label: "", amt: 0 }] : [{ label: "Utility reimbursement (RUBS)", amt: 0 }, { label: "Fees (late, app, admin)", amt: 0 }, { label: "Parking, storage, pet", amt: 0 }, { label: "Laundry, other", amt: d.other || 0 }])}>
            {items.length ? "+ Add line" : "Break other income into lines"}</button>
          {items.length > 0 && <p className="note mt-2">Total {usd(d.other)}/unit/mo. Underwrite only what the T12 actually collected; new RUBS or fees need a ramp.</p>}
        </Card>
        <CustomLinesCard d={d} p={p} set={set} mp={0} kinds={["income"]} title="Added income lines" />
      </div>
      <Card title="Year 1 revenue">
        <table className="tbl"><tbody>
          <Row label="Gross potential rent at market" value={usd(y.gpr)} />
          {y.ltl > 0 && <Row label="Loss to lease" value={usd(-y.ltl)} />}
          <Row label={`Physical vacancy (${d.vac}%)`} value={usd(-y.vacLoss)} />
          {y.conc > 0 && <Row label={`Concessions (${d.conc}%)`} value={usd(-y.conc)} />}
          {y.bad > 0 && <Row label={`Bad debt (${d.bad}%)`} value={usd(-y.bad)} />}
          {y.nru > 0 && <Row label={`Non revenue units (${d.nru})`} value={usd(-y.nru)} />}
          <Row label="Net rental income" value={usd(y.gpr - y.ltl - y.vacLoss - y.conc - y.bad - y.nru)} cls="sub" />
          <Row label="Other income" value={usd(y.oth)} />
          {d.custom.map((c, i) => c.kind === "income" && p.years[0].cust[i] ? <Row key={i} label={c.label || "Added income"} value={usd(p.years[0].cust[i])} /> : null)}
          {d.va.on && <Row label="Renovation premium, net" value={usd(p.years[0].vaPrem)} />}
          {d.va.on && <Row label="Renovation downtime" value={usd(-p.years[0].vaDown)} />}
          <Row label="Effective gross income" value={usd(y.egi)} cls="total" />
          <Row label="Economic occupancy" value={pct(y.econOcc, 1)} />
          <Row label="Gross rent multiplier" value={isFinite(y.grm) ? y.grm.toFixed(2) : "n/a"} />
        </tbody></table>
        <h3 className="card-title mt-6">Rent roll summary</h3>
        <div className="overflow-x-auto"><table className="tbl">
          <thead><tr><th>Type</th><th>Units</th><th>In place</th><th>Market</th><th>Gap</th>{sf > 0 && <th>$/SF</th>}<th>Mix</th></tr></thead>
          <tbody>
            {units.map((u, i) => { const m = (u.market || 0) > 0 ? u.market! : u.rent; return (
              <tr key={i}><td>{u.type || "Unit"}</td><td className="num">{u.count}</td><td className="num">{usd(u.rent)}</td><td className="num">{usd(m)}</td>
                <td className={`num ${m > u.rent ? "text-pass-600" : ""}`}>{m > u.rent ? usd(m - u.rent) : "-"}</td>
                {sf > 0 && <td className="num">{u.sf ? "$" + (u.rent / u.sf).toFixed(2) : ""}</td>}<td className="num">{pct(u.count / p.units, 0)}</td></tr>) })}
            <tr className="total"><td>Total / avg</td><td className="num">{p.units}</td><td className="num">{usd(y.inPlace / 12 / p.units)}</td><td className="num">{usd(y.gpr / 12 / p.units)}</td>
              <td className="num">{y.gpr > y.inPlace ? pct(1 - y.inPlace / y.gpr, 1) : "-"}</td>{sf > 0 && <td className="num">{"$" + (y.inPlace / 12 / sf).toFixed(2)}</td>}<td /></tr>
          </tbody>
        </table></div>
      </Card>
    </div>
  )
}

/* ---------- Expenses ---------- */
const EXP_INPUTS: [NumField, string, string][] = [
  ["ins", "Insurance", "ins"], ["util", "Utilities (owner paid)", "util"], ["rm", "Repairs & maintenance", "rm"], ["turn", "Turnover / make ready", "turn"],
  ["contract", "Contract services", "contract"], ["pay", "Payroll", "pay"], ["adm", "General & admin", "adm"], ["mkt", "Marketing", "mkt"],
]
function Flag({ f }: { f: string }) {
  if (f === "na" || f === "ok") return f === "ok" ? <span className="text-xs text-pass-600">in range</span> : null
  return <span className={`rounded px-1.5 py-0.5 text-xs ${f === "low" ? "bg-amber-50 text-amber-800" : "bg-fail-50 text-fail-600"}`}>{f === "low" ? "low" : "high"}</span>
}
export function ExpensesPane({ d, p, set }: PaneProps) {
  const y = p.years[0], u = p.units || 1
  const st = stateBy(d.state)
  const [ratio, setRatio] = useState(100)
  const [mills, setMills] = useState(() => { const r = rentalTaxRate(st); return isFinite(r) ? Math.round(r * 1000 * 100) / 100 : 20 })
  const calcTax = Math.round(d.price * ratio / 100 * mills / 1000)
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Operating expenses (year 1, $ per year)">
          <table className="tbl">
            <thead><tr><th>Line</th><th className="w-36">Annual</th><th>$/unit</th><th>Typical $/unit</th><th /></tr></thead>
            <tbody>
              <tr><td>Real estate taxes</td><td><NumInput value={d.tax} step={500} onChange={v => set({ tax: v })} /></td><td className="num">{usd(d.tax / u)}</td><td className="text-xs text-slate-500">see calculator</td><td /></tr>
              {EXP_INPUTS.map(([k, label, b]) => { const v = d[k] as number; return (
                <tr key={k}><td>{label}</td><td><NumInput value={v} step={500} onChange={n => set({ [k]: n } as Partial<Deal>)} /></td>
                  <td className="num">{usd(v / u)}</td><td className="text-xs text-slate-500" title={benchRange(b, d.state)!.note}>{usd(benchRange(b, d.state)!.lo)} to {usd(benchRange(b, d.state)!.hi)}{b === "ins" && d.state ? ` (${d.state})` : ""}</td><td><Flag f={benchFlag(b, v / u, p.units, d.state)} /></td></tr>) })}
              <tr><td>Management (% of EGI)</td><td><NumInput value={d.mgmt} step={0.25} onChange={v => set({ mgmt: v })} /></td><td className="num">{usd(y.mgmt / u)}</td><td className="text-xs text-slate-500">3% to 8%</td>
                <td>{d.mgmt < 3 ? <Flag f="low" /> : d.mgmt > 8 ? <Flag f="high" /> : <Flag f="ok" />}</td></tr>
              <tr><td>Reserves ($/unit/yr)</td><td><NumInput value={d.res} step={25} onChange={v => set({ res: v })} /></td><td className="num">{usd(d.res)}</td><td className="text-xs text-slate-500">$250 to $500</td><td><Flag f={benchFlag("res", d.res, p.units)} /></td></tr>
            </tbody>
          </table>
          <p className="note mt-2">Ranges are rough national figures for market rate apartments. Hover a range for context. A low flag is usually the bigger risk: sellers under report repairs, payroll and insurance.</p>
        </Card>
        <Card title="Year 1 pro forma">
          <table className="tbl"><tbody>
            <Row label="Effective gross income" value={usd(y.egi)} cls="total" />
            <Row label="Real estate taxes" value={usd(-y.tax)} /><Row label="Insurance" value={usd(-y.ins)} />
            <Row label="Utilities" value={usd(-d.util)} /><Row label="Repairs & maintenance" value={usd(-d.rm)} />
            {d.turn > 0 && <Row label="Turnover" value={usd(-d.turn)} />}{d.contract > 0 && <Row label="Contract services" value={usd(-d.contract)} />}
            <Row label="Payroll" value={usd(-d.pay)} /><Row label="General & admin" value={usd(-d.adm)} />
            {d.mkt > 0 && <Row label="Marketing" value={usd(-d.mkt)} />}
            <Row label={`Management (${d.mgmt}% of EGI)`} value={usd(-y.mgmt)} />
            {d.custom.map((c, i) => c.kind === "expense" && y.cust[i] ? <Row key={i} label={c.label || "Added expense"} value={usd(-y.cust[i])} /> : null)}
            <Row label="NOI before reserves" value={usd(y.noiBR)} cls="sub" />
            <Row label="Replacement reserves" value={usd(-y.res)} />
            <Row label="Net cash flow (NOI after reserves)" value={usd(y.noi)} cls="total" />
            <Row label="Total expenses incl. reserves, per unit" value={<span>{usd(y.opex / u)} <Flag f={benchFlag("total", y.opex / u, p.units)} /></span>} />
            <Row label="Expense ratio" value={<span>{pct(p.y1.expRatio, 1)} {p.y1.expRatio < 0.35 ? <Flag f="low" /> : p.y1.expRatio > 0.6 ? <Flag f="high" /> : null}</span>} />
          </tbody></table>
        </Card>
      </div>
      <CustomLinesCard d={d} p={p} set={set} mp={0} kinds={["expense", "capex"]} title="Added expense and capital lines" />
      <InsuranceCard d={d} p={p} />
      <Card title="Property tax: underwrite the bill after you buy">
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Price ($)"><NumInput value={d.price} disabled onChange={() => {}} /></Field>
              <Field label="Assessment ratio (%)" hint="Share of value that is taxed."><NumInput value={ratio} step={1} onChange={setRatio} /></Field>
              <Field label="Millage (per $1,000)" hint={st ? `Starting point from ${st.name} rentals.` : "Set your state under Market › Location."}><NumInput value={mills} step={0.5} onChange={setMills} /></Field>
            </div>
            <p className="mt-3 text-sm">Estimated tax on your price: <b>{usd(calcTax)}</b> ({usd(calcTax / u)}/unit) vs. the {usd(d.tax)} in your model{d.tax > 0 && calcTax > d.tax * 1.1 ? <span className="text-fail-600">, {pct(calcTax / d.tax - 1, 0)} higher</span> : ""}.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="btn" onClick={() => set({ tax: calcTax, taxNew: 0, taxResetYr: 0 })}>Use as year 1 tax</button>
              <button className="btn" onClick={() => set({ taxNew: calcTax, taxResetYr: d.taxResetYr || 2 })}>Reassess to this in year {d.taxResetYr || 2}</button>
            </div>
          </div>
          <div>
            <div className="grid grid-cols-2 gap-3">
              <Num d={d} set={set} k="taxNew" label="Tax after reassessment ($/yr)" step={500} />
              <Num d={d} set={set} k="taxResetYr" label="Reassessment takes effect in year" hint="0 = no reset." />
            </div>
            <p className="note mt-2">{st?.reassess || DEFAULT_REASSESS} Many counties bill a year in arrears, so the jump often lands in year 2. Ask the county assessor or a local tax consultant for the real millage.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* ---------- Financing ---------- */
export function FinancingPane({ d, p, set }: PaneProps) {
  const sz = p.sizing, lesser = d.sizeMode === "lesser"
  const cap = (v: number) => isFinite(v) ? usd(v) : "no limit"
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Loan terms">
          <div className="grid grid-cols-2 gap-3">
            <Field label="How the loan is sized">
              <select value={d.sizeMode} onChange={e => set({ sizeMode: e.target.value as Deal["sizeMode"] })}>
                <option value="ltv">LTV only</option><option value="lesser">Lesser of LTV, DSCR, debt yield</option>
              </select>
            </Field>
            <Num d={d} set={set} k="ltv" label="Max loan to value (%)" />
            {lesser && <Num d={d} set={set} k="sizeDscr" label="Min DSCR for sizing (x)" step={0.05} hint="Agency 1.25x; banks 1.20 to 1.35x." />}
            {lesser && <Num d={d} set={set} k="sizeDy" label="Min debt yield (%)" step={0.25} hint="Banks and CMBS 8 to 10%." />}
            <Num d={d} set={set} k="rate" label="Interest rate (%)" step={0.05} />
            <Num d={d} set={set} k="amort" label="Amortization (years)" />
            <Num d={d} set={set} k="ioYrs" label="Interest only period (years)" />
            <Num d={d} set={set} k="term" label="Loan term (years)" hint="When the balloon is due." />
            <Num d={d} set={set} k="loanFee" label="Loan fees and points (% of loan)" step={0.25} />
          </div>
          {p.balloonBeforeSale && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">The loan matures in year {d.term}, before your year {d.hold} sale. You'd have to refinance at whatever rates and values exist then. Shorten the hold or plan the refi.</p>}
          <p className="note mt-3">Lenders size the loan to the lowest of three limits. In a high rate market DSCR usually binds, not LTV, so the loan you get is smaller than the LTV you were quoted.</p>
        </Card>
        <Card title="Loan sizing">
          <table className="tbl">
            <thead><tr><th>Constraint</th><th>Max loan</th><th>LTV</th></tr></thead>
            <tbody>
              {([["LTV", `${d.ltv}% of price`, sz.ltvLoan], ["DSCR", `NCF ÷ ${d.sizeDscr}x ÷ loan constant`, sz.dscrLoan], ["Debt yield", `NCF ÷ ${d.sizeDy}%`, sz.dyLoan]] as const).map(([k, how, v]) =>
                <tr key={k} className={sz.binding === k ? "font-semibold" : ""}><td>{k}{sz.binding === k ? " (binds)" : ""}<div className="text-xs font-normal text-slate-500">{how}</div></td><td className="num">{cap(v)}</td><td className="num">{d.price > 0 && isFinite(v) ? pct(v / d.price, 1) : ""}</td></tr>)}
              <tr className="total"><td>Loan used</td><td className="num">{usd(p.loan)}</td><td className="num">{d.price > 0 ? pct(p.loan / d.price, 1) : ""}</td></tr>
            </tbody>
          </table>
          {!lesser && sz.binding !== "LTV" && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">At these terms a lender would cap the loan at {usd(sz.maxLoan)} ({sz.binding} binds), {usd(sz.ltvLoan - sz.maxLoan)} less than your LTV loan. Switch sizing to "lesser of" to see the real equity check.</p>}
          <table className="tbl mt-4"><tbody>
            <Row label="Year 1 debt service" value={usd(p.y1.ds)} />
            <Row label="Year 1 DSCR (on NCF)" value={xx(p.y1.dscr)} />
            <Row label="Lowest DSCR during hold" value={xx(p.minDscr)} />
            <Row label="Debt yield" value={pct(p.y1.debtYield)} />
            <Row label="Break even occupancy, yr 1" value={pct(p.y1.beo, 1)} />
            <Row label={`Balance at year ${d.hold}`} value={usd(p.payoff)} cls="total" />
          </tbody></table>
        </Card>
      </div>
      <DebtOptions d={d} p={p} set={set} mp={0} />
      <Card title="Loan schedule">
        <div className="overflow-x-auto"><table className="tbl">
          <thead><tr><th>Year</th>{p.years.map(y => <th key={y.t}>{y.t}{y.principal === 0 && y.ds > 0 ? " IO" : ""}{y.refiCash ? " refi" : ""}</th>)}</tr></thead>
          <tbody>
            <tr><td>Interest rate</td>{p.years.map(y => <td key={y.t} className="num">{y.rate.toFixed(2)}%</td>)}</tr>
            {([["Debt service", "ds"], ["Interest", "interest"], ["Principal", "principal"], ["Ending balance", "endBal"]] as const).map(([l, k]) =>
              <tr key={k}><td>{l}</td>{p.years.map(y => <td key={y.t} className="num">{usd(y[k])}</td>)}</tr>)}
            <tr><td>DSCR</td>{p.years.map(y => <td key={y.t} className={`num ${y.dscr < d.minDscr ? "text-fail-600" : ""}`}>{xx(y.dscr)}</td>)}</tr>
            {p.refi && <tr><td>Refinance net cash</td>{p.years.map(y => <td key={y.t} className="num">{y.refiCash ? usd(y.refiCash) : ""}</td>)}</tr>}
          </tbody>
        </table></div>
        {p.prepayPenalty > 0 && <p className="note mt-2">Loan payoff at sale includes a {usd(p.prepayPenalty)} prepayment penalty.</p>}
      </Card>
    </div>
  )
}

/* ---------- Projections ---------- */
export function ProjectionsPane({ d, p, set }: PaneProps) {
  const Y = [...p.years, p.exitYear], last = Y.length - 1
  const line = (label: string, f: (y: typeof Y[number]) => string, cls = "", skipExit = false) =>
    <tr className={cls}><td>{label}</td>{Y.map((y, i) => <td key={i} className="num">{skipExit && i === last ? "" : f(y)}</td>)}</tr>
  return (
    <div className="space-y-4">
      <Card title="Hold assumptions">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Num d={d} set={set} k="hold" label="Hold period (years)" />
          <Num d={d} set={set} k="expG" label="Expense growth (%/yr)" step={0.25} />
          <Num d={d} set={set} k="taxG" label="Property tax growth (%/yr)" step={0.25} />
          <Num d={d} set={set} k="insG" label="Insurance growth (%/yr)" step={0.25} />
          <Num d={d} set={set} k="exitCap" label="Exit cap rate (%)" step={0.05} />
          <Num d={d} set={set} k="sellCost" label="Selling costs (% of sale)" step={0.25} />
          <Field label="Set all rent growth to (%)"><NumInput value={avgGrowth(d)} step={0.25} onChange={v => set({ rg: d.rg.map(() => v) })} /></Field>
        </div>
        <h3 className="card-title mt-5">Rent and other income growth by year (%)</h3>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(84px,1fr))] gap-2">
          {d.rg.map((v, i) => (
            <Field key={i} label={i === d.hold - 1 ? `Exit yr ${i + 2}` : `Yr ${i + 2}`}>
              <NumInput value={v} step={0.25} onChange={n => set({ rg: d.rg.map((x, j) => j === i ? n : x) })} />
            </Field>
          ))}
        </div>
        <p className="note mt-2">Growth applies from year 2 on. The exit year is the year after the hold; its NOI sets the sale price.</p>
      </Card>
      <Card title="Annual cash flow">
        <div className="overflow-x-auto"><table className="tbl">
          <thead><tr><th /> {Y.map((y, i) => <th key={i}>{i === last ? `Exit yr ${y.t}` : `Year ${y.t}`}</th>)}</tr></thead>
          <tbody>
            {line("Gross potential rent", y => usd(y.gpr))}
            {line("Vacancy & credit loss", y => usd(-y.vacLoss))}
            {line("Other income", y => usd(y.oth))}
            {d.custom.some(c => c.kind === "income") && line("Added income", y => usd(y.custInc))}
            {d.va.on && line("Renovation premium", y => usd(y.vaPrem))}
            {d.va.on && line("Renovation downtime", y => usd(-y.vaDown))}
            {line("Effective gross income", y => usd(y.egi), "total")}
            {line("Property taxes", y => usd(-y.tax))}
            {line("Insurance", y => usd(-y.ins))}
            {line("Other operating", y => usd(-y.fixed))}
            {line("Management", y => usd(-y.mgmt))}
            {d.custom.some(c => c.kind === "expense") && line("Added expenses", y => usd(-y.custExp))}
            {line("Reserves", y => usd(-y.res))}
            {line("Net operating income", y => usd(y.noi), "total")}
            {line("Debt service", y => usd(-y.ds), "", true)}
            {p.refi && line("Refinance net cash", y => y.refiCash ? usd(y.refiCash) : "", "", true)}
            {d.custom.some(c => c.kind === "capex") && line("Capital expenditures", y => usd(-y.capex), "", true)}
            {line("Cash flow after debt", y => usd(y.cf), "total", true)}
            {line("DSCR", y => xx(y.dscr), "sub", true)}
            {line("Cash on cash", y => pct(y.coc), "sub", true)}
          </tbody>
        </table></div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Sale at exit">
          <table className="tbl"><tbody>
            <Row label={`Exit year NOI (year ${d.hold + 1})`} value={usd(p.exitNoi)} />
            <Row label="Exit cap rate" value={`${d.exitCap}%`} />
            <Row label="Sale price" value={usd(p.salePrice)} />
            <Row label="Price per unit" value={usd(p.salePrice / p.units)} cls="sub" />
            <Row label={`Selling costs (${d.sellCost}%)`} value={usd(-p.sellCosts)} />
            <Row label="Loan payoff" value={usd(-p.payoff)} />
            <Row label="Net sale proceeds" value={usd(p.proceeds)} cls="total" />
            <Row label="Going in cap vs exit cap" value={`${pct(p.y1.cap)} → ${d.exitCap}%`} cls="sub" />
          </tbody></table>
        </Card>
        <Card title="Returns">
          <table className="tbl"><tbody>
            <Row label="Equity invested" value={usd(p.equity)} />
            <Row label="Total cash flow during hold" value={usd(p.years.reduce((s, y) => s + y.cf, 0))} />
            <Row label="Net sale proceeds" value={usd(p.proceeds)} />
            <Row label="Total profit" value={usd(p.profit)} cls="total" />
            <Row label="Levered IRR" value={pct(p.irr)} />
            <Row label="Unlevered IRR" value={pct(p.unlevIrr)} />
            <Row label="Equity multiple" value={xx(p.em)} />
            <Row label="Average cash on cash" value={pct(p.avgCoc)} />
          </tbody></table>
        </Card>
      </div>
    </div>
  )
}

/* ---------- Scenarios ---------- */
export function ScenariosPane({ d, set, metric, setMetric }: PaneProps & { metric: string; setMetric: (m: string) => void }) {
  const W = weighted(d, scenCases(d.scen))
  const setS = (i: number, patch: Partial<Scenario>) => set({ scen: d.scen.map((s, j) => j === i ? { ...s, ...patch } : s) })
  const base = avgGrowth(d)
  const caps = [-0.5, -0.25, 0, 0.25, 0.5].map(s => d.exitCap + s), rgs = [-2, -1, 0, 1, 2].map(s => base + s)
  const prices = [-0.1, -0.05, 0, 0.05, 0.1], vacs = [-4, -2, 0, 2, 4].map(s => Math.max(0, d.vac + s))
  const min = metric === "coc" ? d.minCoc / 100 : metric === "dscr" ? d.minDscr : metric === "cap" ? d.minCap / 100 : d.minIrr / 100
  const fmt = metric === "dscr" ? xx : (n: number) => pct(n, 1)
  const cols: [keyof Scenario, string, number][] = [["prob", "Probability %", 5], ["rg", "Rent growth %/yr", 0.25], ["vac", "Vacancy %", 0.5], ["expG", "Expense growth %", 0.25], ["exitCap", "Exit cap %", 0.05]]
  return (
    <div className="space-y-4">
      <Card title="Downside, base and upside" right={<button className="btn" onClick={() => set({ scen: defaultScen(d) })}>Reset from current assumptions</button>}>
        <div className="overflow-x-auto"><table className="tbl">
          <thead><tr><th>Scenario</th>{cols.map(c => <th key={c[0]}>{c[1]}</th>)}<th>IRR</th><th>Equity multiple</th><th>Avg cash on cash</th><th>Min DSCR</th></tr></thead>
          <tbody>
            {d.scen.map((s, i) => { const r = W.runs[i]?.p; return (
              <tr key={i}>
                <td><input className="w-32" value={s.name} onChange={e => setS(i, { name: e.target.value })} /></td>
                {cols.map(([k, , step]) => <td key={k}><NumInput className="w-20 text-right" value={s[k] as number} step={step} onChange={v => setS(i, { [k]: v } as Partial<Scenario>)} /></td>)}
                <td className="num">{r && pct(r.irr)}</td><td className="num">{r && xx(r.em)}</td><td className="num">{r && pct(r.avgCoc)}</td><td className="num">{r && xx(r.minDscr)}</td>
              </tr>) })}
            <tr className="total"><td>Weighted</td><td className="num">{d.scen.reduce((s, r) => s + (r.prob || 0), 0)}%</td><td colSpan={4} /><td className="num">{pct(W.irr)}</td><td className="num">{xx(W.em)}</td><td className="num">{pct(W.avgCoc)}</td><td /></tr>
          </tbody>
        </table></div>
        <p className="note mt-2">Each scenario changes flat rent growth, vacancy, expense growth and exit cap; everything else matches the deal. Weighted IRR is the IRR of the probability weighted cash flows.</p>
      </Card>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="IRR: exit cap vs rent growth">
          <table className="tbl sens">
            <thead><tr><th>Rent growth ↓ / Exit cap →</th>{caps.map(c => <th key={c} className="!text-center">{c.toFixed(2)}%</th>)}</tr></thead>
            <tbody>{rgs.map((g, ri) => <tr key={g}><th>{g.toFixed(2)}%</th>{caps.map((c, ci) => { const pr = project(d, { rg: g, exitCap: c }); const ok = d.minIrr <= 0 || pr.irr >= d.minIrr / 100
              return <td key={c} className={`${ok ? "p" : "f"} ${ri === 2 && ci === 2 ? "base" : ""}`}>{pct(pr.irr, 1)}</td> })}</tr>)}</tbody>
          </table>
          <p className="note mt-2">Rent growth applied flat every year. Green meets the minimum IRR in the buy box.</p>
        </Card>
        <Card title="Price vs vacancy" right={<select value={metric} onChange={e => setMetric(e.target.value)} className="w-auto"><option value="coc">Cash on cash, yr 1</option><option value="dscr">DSCR, yr 1</option><option value="cap">Cap rate</option><option value="irr">IRR</option></select>}>
          <table className="tbl sens">
            <thead><tr><th>Vacancy ↓ / Price →</th>{prices.map(q => <th key={q} className="!text-center">{q === 0 ? "Asking" : `${q > 0 ? "+" : ""}${q * 100}%`}<br /><span className="font-normal text-slate-400">{usd(d.price * (1 + q))}</span></th>)}</tr></thead>
            <tbody>{vacs.map((vv, ri) => <tr key={ri}><th>{vv.toFixed(1)}%</th>{prices.map((q, ci) => { const pr = project(d, { price: d.price * (1 + q), vac: vv }); const val = metric === "irr" ? pr.irr : (pr.y1 as any)[metric]
              return <td key={q} className={`${val >= min ? "p" : "f"} ${ri === 2 && ci === 2 ? "base" : ""}`}>{fmt(val)}</td> })}</tr>)}</tbody>
          </table>
          <p className="note mt-2">Green clears the buy box for that metric. The outlined cell is the deal as entered.</p>
        </Card>
      </div>
    </div>
  )
}

/* ---------- Buy box & deals ---------- */
export function DealsPane({ d, set, saved, cloud, onSave, onOpen, onDelete, onSample, onClear }: PaneProps & {
  saved: SavedDeal[] | null; cloud: boolean; onSave: () => void; onOpen: (i: number) => void; onDelete: (i: number) => void; onSample: () => void; onClear: () => void }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Buy box (screening criteria)">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <Num d={d} set={set} k="minCap" label="Min cap rate (%)" step={0.1} />
            <Num d={d} set={set} k="minDscr" label="Min DSCR, year 1 (x)" step={0.05} />
            <Num d={d} set={set} k="minCoc" label="Min cash on cash, yr 1 (%)" step={0.25} />
            <Num d={d} set={set} k="minIrr" label="Min IRR (%)" step={0.5} />
            <Num d={d} set={set} k="minEm" label="Min equity multiple (x)" step={0.05} />
          </div>
          <p className="note mt-3">Set a minimum to 0 to skip that test.</p>
        </Card>
        <Card title="Deals">
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-primary" onClick={onSave}>Save deal</button>
            <button className="btn" onClick={onSample}>Load sample deal</button>
            <button className="btn" onClick={onClear}>Clear form</button>
          </div>
          {saved === null ? <p className="note mt-3">Couldn't load saved deals.</p> : saved.length === 0 ? <p className="note mt-3">No saved deals yet.</p> : (
            <table className="tbl mt-3">
              <thead><tr><th>Deal</th><th>Cap</th><th>IRR</th><th>Result</th><th>Saved</th><th /></tr></thead>
              <tbody>{saved.map((r, i) => { const s = r.data, p = project(s), ok = allPass(tests(p, s)); return (
                <tr key={r.id}><td>{r.name || "Untitled"}</td><td className="num">{pct(p.y1.cap)}</td><td className="num">{pct(p.irr, 1)}</td>
                  <td className={`font-semibold ${ok ? "text-pass-600" : "text-fail-600"}`}>{ok ? "Pass" : "Fail"}</td><td className="text-xs text-slate-500">{new Date(r.updated_at).toLocaleDateString()}</td>
                  <td className="space-x-1"><button className="btn !px-2 !py-0.5 text-xs" onClick={() => onOpen(i)}>Open</button><button className="btn !px-2 !py-0.5 text-xs" onClick={() => onDelete(i)}>Delete</button></td></tr>) })}</tbody>
            </table>)}
          <p className="note mt-2">{cloud ? "Saved to your account, so they follow you to any device." : "Saved in this browser only. Sign in to keep deals in your account."}</p>
        </Card>
      </div>
      <Pipeline d={d} set={set} saved={saved} onOpen={onOpen} />
      <Card title="How the numbers are calculated">
        <p className="note leading-relaxed">Gross potential rent is booked at market rent. EGI = GPR − loss to lease − vacancy − concessions − bad debt − non revenue units + other income. NOI = EGI − operating expenses; management is a % of EGI and reserves are per unit, so the NOI used for cap rate, DSCR and debt yield is after reserves (lender net cash flow). Property tax can step up to a reassessed amount in a chosen year. Loan amount is the LTV loan, or the lesser of the LTV, DSCR and debt yield loans when that sizing is chosen. Rent and other income grow by the yearly rent growth; taxes, insurance and other expenses grow at their own rates. Fixed debt service is interest only during the interest only period, then a standard amortizing payment; floating loans pay SOFR (capped at the strike if a cap is bought) plus the spread, interest only. A refinance values the property on the next year's NOI at the refinance cap, sizes the new loan on LTV and DSCR, and pays the net cash (or calls for cash) that year. Prepayment penalties are added to the loan payoff. Added lines flow into EGI, operating expenses, or capital below NOI by type. Cash flow = NOI − debt service − capital expenditures. Equity = down payment + closing costs + loan fees + up front capex + renovation budget (if raised up front) + rate cap. Sale price = exit year NOI ÷ exit cap; net proceeds = sale price − selling costs − loan payoff. IRR uses the equity outflow at purchase, each year's cash flow and the net proceeds in the final year. Equity multiple = total cash returned ÷ equity. Max price is the highest price where every buy box test still passes, holding everything else constant.</p>
      </Card>
    </div>
  )
}

export const failNames = (t: Partial<Record<TestKey, boolean>>) => (Object.entries(t) as [TestKey, boolean][]).filter(([, b]) => !b).map(([k]) => TEST_NAMES[k])

/* ---------- Pipeline and compare ---------- */
function Pipeline({ d, set, saved, onOpen }: { d: Deal; set: PaneProps["set"]; saved: SavedDeal[] | null; onOpen: (i: number) => void }) {
  const [pick, setPick] = useState<string[]>([])
  const [filter, setFilter] = useState("All")
  const list = (saved || []).map((r, i) => ({ r, i, d: r.data, p: project(r.data) }))
  const shown = list.filter(x => filter === "All" || (x.d.status || "Screening") === filter)
  const cmp = list.filter(x => pick.includes(x.r.id))
  const toggle = (id: string) => setPick(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id].slice(-4))
  const rows: [string, (x: typeof list[number]) => string][] = [
    ["Status", x => x.d.status || "Screening"], ["Units", x => String(x.p.units)], ["Price", x => usd(x.d.price)], ["Price / unit", x => usd(x.p.y1.ppu)],
    ["Year 1 NOI", x => usd(x.p.y1.noi)], ["Going in cap", x => pct(x.p.y1.cap)], ["Expense ratio", x => pct(x.p.y1.expRatio, 1)],
    ["Loan", x => usd(x.p.loan)], ["DSCR, year 1", x => xx(x.p.y1.dscr)], ["Debt yield", x => pct(x.p.y1.debtYield)], ["Equity", x => usd(x.p.equity)],
    ["Cash on cash, yr 1", x => pct(x.p.y1.coc)], ["Levered IRR", x => pct(x.p.irr)], ["Equity multiple", x => xx(x.p.em)],
    ["Investor IRR", x => x.d.wf?.on ? pct(waterfall(x.p).lp.irr) : "n/a"], ["Buy box", x => allPass(tests(x.p, x.d)) ? "Pass" : "Fail"], ["Bid due", x => x.d.bidDue || ""],
  ]
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
      <Card title="This deal's pipeline status">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Status"><select value={d.status} onChange={e => set({ status: e.target.value as Deal["status"] })}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></Field>
          <Field label="Bid or LOI due"><input type="date" value={d.bidDue} onChange={e => set({ bidDue: e.target.value })} /></Field>
        </div>
        <Field label="Notes"><textarea rows={5} className="mt-1 w-full" value={d.notes} placeholder="Broker, call notes, diligence items, why you passed…" onChange={e => set({ notes: e.target.value })} /></Field>
        <p className="note mt-2">Saved with the deal. Save the deal after changing it.</p>
      </Card>
      <Card title="Pipeline and side by side compare" right={
        <select className="!w-auto" value={filter} onChange={e => setFilter(e.target.value)}><option>All</option>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>}>
        {!list.length ? <p className="note">Save a few deals to track them here and compare up to four side by side.</p> : <>
          <div className="mb-3 flex flex-wrap gap-2">{STATUSES.map(s => { const n = list.filter(x => (x.d.status || "Screening") === s).length; return n ? <span key={s} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{s}: <b>{n}</b></span> : null })}</div>
          <table className="tbl">
            <thead><tr><th className="w-6" /><th>Deal</th><th>Status</th><th>Bid due</th><th>IRR</th><th>Buy box</th><th /></tr></thead>
            <tbody>{shown.map(x => { const ok = allPass(tests(x.p, x.d)); return (
              <tr key={x.r.id}><td><input type="checkbox" className="!w-auto" checked={pick.includes(x.r.id)} onChange={() => toggle(x.r.id)} /></td>
                <td>{x.r.name || "Untitled"}</td><td className="text-xs">{x.d.status || "Screening"}</td><td className="text-xs">{x.d.bidDue || ""}</td>
                <td className="num">{pct(x.p.irr, 1)}</td><td className={`font-semibold ${ok ? "text-pass-600" : "text-fail-600"}`}>{ok ? "Pass" : "Fail"}</td>
                <td><button className="btn !px-2 !py-0.5 text-xs" onClick={() => onOpen(x.i)}>Open</button></td></tr>) })}</tbody>
          </table>
          {cmp.length >= 2 ? <div className="mt-5 overflow-x-auto"><table className="tbl">
            <thead><tr><th>Compare</th>{cmp.map(x => <th key={x.r.id}>{x.r.name || "Untitled"}</th>)}</tr></thead>
            <tbody>{rows.map(([l, f]) => <tr key={l}><td>{l}</td>{cmp.map(x => <td key={x.r.id} className="num">{f(x)}</td>)}</tr>)}</tbody>
          </table></div> : <p className="note mt-3">Tick two to four deals to compare them side by side.</p>}
        </>}
      </Card>
    </div>
  )
}

/* ---------- Insurance ---------- */
function InsuranceCard({ d, p }: { d: Deal; p: Projection }) {
  const t = insTier(d.state), u = p.units || 1, per = d.ins / u
  const flag = benchFlag("ins", per, p.units, d.state)
  const items = [
    ["Replacement cost", "Insured value per square foot that matches today's construction costs, not the purchase price."],
    ["Wind, hail and named storm deductibles", "Often 1 to 5% of insured value per building in coastal and hail states. A 2% deductible on a $10M building is $200,000 per storm."],
    ["Flood", "Required by lenders in FEMA zones A and V; check Market › Location."],
    ["Loss runs", "Five years of claims from the seller. Repeat water or roof claims raise premiums."],
    ["Roof age and construction", "Roofs over 15 to 20 years old and frame construction cost more or limit coverage."],
    ["Liability and umbrella", "Lenders typically require $1M per occurrence and an umbrella sized to the property."],
    ["Loss of rents", "12 months of rent coverage is the usual lender requirement."],
  ]
  return (
    <Card title="Insurance check" right={d.state ? <span className={`chip ${t.tier === "high" ? "bg-fail-50 text-fail-700" : t.tier === "elevated" ? "bg-gold-100 text-gold-700" : "bg-pass-50 text-pass-700"}`}>{t.tier} cost state</span> : null}>
      <div className="grid gap-4 md:grid-cols-[1fr_1.4fr]">
        <div>
          <table className="tbl"><tbody>
            <tr><td>Your insurance</td><td className="num">{usd(per)} / unit</td></tr>
            <tr><td>Typical in {d.state || "your state"}</td><td className="num">{usd(t.lo)} to {usd(t.hi)}</td></tr>
            <tr><td>Insurance growth in your model</td><td className="num">{d.insG}% / yr</td></tr>
          </tbody></table>
          <p className={`mt-3 rounded-lg p-3 text-sm ${flag === "low" ? "bg-fail-50 text-fail-700" : flag === "high" ? "bg-gold-50 text-gold-700" : "bg-slate-50 text-slate-600"}`}>
            {!d.state ? "Set the property's state under Market › Location for a state specific range." : flag === "low" ? `This looks low for ${d.state}. ${t.why} Get a quote before you rely on the seller's number.` : flag === "high" ? "This is above the usual range. Check the deductibles and coverage; there may be room to rebid." : `In range for ${d.state}. ${t.why}`}
          </p>
        </div>
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">What to ask for in a quote</div>
          <ul className="space-y-1.5 text-sm">{items.map(([k, v]) => <li key={k}><b className="text-brand-900">{k}.</b> <span className="text-slate-600">{v}</span></li>)}</ul>
        </div>
      </div>
    </Card>
  )
}
