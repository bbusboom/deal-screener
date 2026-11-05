import {
  type Deal, type NumField, type Projection, type Scenario, type TestKey,
  usd, pct, xx, monthlyPmt, project, weighted, scenCases, defaultScen, avgGrowth, memo, tests, allPass, TEST_NAMES,
} from "../lib/model"
import { Card, Field, NumInput, Row } from "./ui"
import CashFlowChart from "./CashFlowChart"

export interface PaneProps { d: Deal; p: Projection; set: (patch: Partial<Deal>) => void; mp: number }

function Num({ d, set, k, label, step = 1, hint }: { d: Deal; set: PaneProps["set"]; k: NumField; label: string; step?: number; hint?: string }) {
  return <Field label={label} hint={hint}><NumInput value={d[k]} step={step} onChange={v => set({ [k]: v } as Partial<Deal>)} /></Field>
}

/* ---------- Summary ---------- */
export function SummaryPane({ d, p, mp }: PaneProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Sources & uses">
          <table className="tbl"><tbody>
            <tr className="head"><td>Uses</td><td /></tr>
            <Row label="Purchase price" value={usd(d.price)} />
            <Row label={`Closing costs (${d.cc}%)`} value={usd(p.closing)} />
            <Row label={`Loan fees (${d.loanFee}%)`} value={usd(p.fee)} />
            <Row label="Total uses" value={usd(d.price + p.closing + p.fee)} cls="total" />
            <tr className="head"><td>Sources</td><td /></tr>
            <Row label={`Loan (${d.ltv}% LTV)`} value={usd(p.loan)} />
            <Row label="Equity" value={usd(p.equity)} />
            <Row label="Total sources" value={usd(p.loan + p.equity)} cls="total" />
          </tbody></table>
        </Card>
        <Card title="Returns over the hold">
          <table className="tbl"><tbody>
            <Row label="Levered IRR" value={pct(p.irr)} />
            <Row label="Unlevered IRR" value={pct(p.unlevIrr)} />
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
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <Card title="Property">
          <div className="grid grid-cols-2 gap-3">
            <Num d={d} set={set} k="price" label="Purchase price ($)" step={1000} />
            <Num d={d} set={set} k="cc" label="Closing costs (% of price)" step={0.1} />
          </div>
        </Card>
        <Card title="Unit mix (monthly rent)">
          <div className="mb-1 grid grid-cols-[1.4fr_.7fr_1fr_28px] gap-2 text-xs text-slate-500"><span>Unit type</span><span>Count</span><span>Rent / mo</span><span /></div>
          {units.map((u, i) => (
            <div key={i} className="mb-2 grid grid-cols-[1.4fr_.7fr_1fr_28px] items-center gap-2">
              <input value={u.type} onChange={e => setUnit(i, { type: e.target.value })} />
              <NumInput value={u.count} min={0} onChange={v => setUnit(i, { count: v })} />
              <NumInput value={u.rent} min={0} step={5} onChange={v => setUnit(i, { rent: v })} />
              <button className="text-slate-400 hover:text-fail-600" title="Remove" onClick={() => set({ units: units.length > 1 ? units.filter((_, j) => j !== i) : [{ type: "", count: 0, rent: 0 }] })}>✕</button>
            </div>
          ))}
          <button className="btn mt-1" onClick={() => set({ units: [...units, { type: "", count: 0, rent: 0 }] })}>+ Add unit type</button>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Num d={d} set={set} k="other" label="Other income ($/unit/mo)" step={5} />
            <Num d={d} set={set} k="vac" label="Vacancy & credit loss (%)" step={0.5} />
          </div>
        </Card>
      </div>
      <Card title="Year 1 income">
        <table className="tbl"><tbody>
          <Row label="Gross potential rent" value={usd(p.y1.gpr)} />
          <Row label={`Vacancy & credit loss (${d.vac}%)`} value={usd(-p.y1.vacLoss)} />
          <Row label="Other income" value={usd(p.y1.oth)} />
          <Row label="Effective gross income" value={usd(p.y1.egi)} cls="total" />
          <Row label="Gross rent multiplier" value={isFinite(p.y1.grm) ? p.y1.grm.toFixed(2) : "n/a"} />
        </tbody></table>
        <h3 className="card-title mt-6">Rent by unit type</h3>
        <table className="tbl">
          <thead><tr><th>Type</th><th>Units</th><th>Rent</th><th>Annual</th><th>Mix</th></tr></thead>
          <tbody>
            {units.map((u, i) => <tr key={i}><td>{u.type || "Unit"}</td><td className="num">{u.count}</td><td className="num">{usd(u.rent)}</td><td className="num">{usd(u.count * u.rent * 12)}</td><td className="num">{pct(u.count / p.units, 0)}</td></tr>)}
            <tr className="total"><td>Total</td><td className="num">{p.units}</td><td className="num">{usd(p.y1.gpr / 12 / p.units)} avg</td><td className="num">{usd(p.y1.gpr)}</td><td /></tr>
          </tbody>
        </table>
      </Card>
    </div>
  )
}

/* ---------- Expenses ---------- */
export function ExpensesPane({ d, p, set }: PaneProps) {
  const y = p.years[0]
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Operating expenses (year 1, annual)">
        <div className="grid grid-cols-2 gap-3">
          <Num d={d} set={set} k="tax" label="Property taxes ($)" step={500} />
          <Num d={d} set={set} k="ins" label="Insurance ($)" step={500} />
          <Num d={d} set={set} k="util" label="Utilities ($)" step={500} />
          <Num d={d} set={set} k="rm" label="Repairs & maintenance ($)" step={500} />
          <Num d={d} set={set} k="pay" label="Payroll ($)" step={500} />
          <Num d={d} set={set} k="adm" label="Admin, marketing, contracts ($)" step={500} />
          <Num d={d} set={set} k="mgmt" label="Management (% of EGI)" step={0.25} />
          <Num d={d} set={set} k="res" label="Replacement reserves ($/unit/yr)" step={25} />
        </div>
        <p className="note mt-3">Base property tax on the expected assessment after the sale, not the seller's bill.</p>
      </Card>
      <Card title="Year 1 pro forma">
        <table className="tbl"><tbody>
          <Row label="Effective gross income" value={usd(y.egi)} cls="total" />
          <Row label="Taxes" value={usd(-y.tax)} /><Row label="Insurance" value={usd(-y.ins)} />
          <Row label="Utilities" value={usd(-d.util)} /><Row label="Repairs & maintenance" value={usd(-d.rm)} />
          <Row label="Payroll" value={usd(-d.pay)} /><Row label="Admin, marketing, contracts" value={usd(-d.adm)} />
          <Row label={`Management (${d.mgmt}% of EGI)`} value={usd(-y.mgmt)} /><Row label="Reserves" value={usd(-y.res)} />
          <Row label="Total operating expenses" value={usd(-y.opex)} />
          <Row label="Per unit" value={usd(y.opex / p.units)} cls="sub" />
          <Row label="Net operating income" value={usd(y.noi)} cls="total" />
          <Row label="Expense ratio" value={pct(p.y1.expRatio, 1)} />
        </tbody></table>
      </Card>
    </div>
  )
}

/* ---------- Financing ---------- */
export function FinancingPane({ d, p, set }: PaneProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Loan terms">
          <div className="grid grid-cols-2 gap-3">
            <Num d={d} set={set} k="ltv" label="Loan to value (%)" />
            <Num d={d} set={set} k="rate" label="Interest rate (%)" step={0.05} />
            <Num d={d} set={set} k="amort" label="Amortization (years)" />
            <Num d={d} set={set} k="ioYrs" label="Interest only period (years)" />
            <Num d={d} set={set} k="loanFee" label="Loan fees and points (% of loan)" step={0.25} />
          </div>
          <p className="note mt-3">Interest only years pay interest only, then the loan amortizes over the amortization period. Set interest only to the hold period for a fully interest only loan.</p>
        </Card>
        <Card title="Debt summary">
          <table className="tbl"><tbody>
            <Row label="Loan amount" value={usd(p.loan)} />
            <Row label="Interest only payment, annual" value={usd(p.loan * d.rate / 100)} />
            <Row label="Amortizing payment, annual" value={usd(monthlyPmt(p.loan, d.rate, d.amort) * 12)} />
            <Row label="Year 1 DSCR" value={xx(p.y1.dscr)} />
            <Row label="Lowest DSCR during hold" value={xx(p.minDscr)} />
            <Row label="Debt yield" value={pct(p.y1.debtYield)} />
            <Row label="Break even occupancy, yr 1" value={pct(p.y1.beo, 1)} />
            <Row label={`Balance at year ${d.hold}`} value={usd(p.payoff)} cls="total" />
          </tbody></table>
        </Card>
      </div>
      <Card title="Loan schedule">
        <div className="overflow-x-auto"><table className="tbl">
          <thead><tr><th>Year</th>{p.years.map(y => <th key={y.t}>{y.t}{y.t <= d.ioYrs ? " IO" : ""}</th>)}</tr></thead>
          <tbody>
            {([["Debt service", "ds"], ["Interest", "interest"], ["Principal", "principal"], ["Ending balance", "endBal"]] as const).map(([l, k]) =>
              <tr key={k}><td>{l}</td>{p.years.map(y => <td key={y.t} className="num">{usd(y[k])}</td>)}</tr>)}
            <tr><td>DSCR</td>{p.years.map(y => <td key={y.t} className={`num ${y.dscr < d.minDscr ? "text-fail-600" : ""}`}>{xx(y.dscr)}</td>)}</tr>
          </tbody>
        </table></div>
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
            {line("Effective gross income", y => usd(y.egi), "total")}
            {line("Property taxes", y => usd(-y.tax))}
            {line("Insurance", y => usd(-y.ins))}
            {line("Other operating", y => usd(-y.fixed))}
            {line("Management", y => usd(-y.mgmt))}
            {line("Reserves", y => usd(-y.res))}
            {line("Net operating income", y => usd(y.noi), "total")}
            {line("Debt service", y => usd(-y.ds), "", true)}
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
export function DealsPane({ d, set, saved, onSave, onOpen, onDelete, onSample, onClear }: PaneProps & {
  saved: Deal[] | null; onSave: () => void; onOpen: (i: number) => void; onDelete: (i: number) => void; onSample: () => void; onClear: () => void }) {
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
          {saved === null ? <p className="note mt-3">Saving isn't available in this browser.</p> : saved.length === 0 ? <p className="note mt-3">No saved deals yet.</p> : (
            <table className="tbl mt-3">
              <thead><tr><th>Deal</th><th>Cap</th><th>IRR</th><th>Result</th><th /></tr></thead>
              <tbody>{saved.map((s, i) => { const p = project(s), ok = allPass(tests(p, s)); return (
                <tr key={i}><td>{s.name || "Untitled"}</td><td className="num">{pct(p.y1.cap)}</td><td className="num">{pct(p.irr, 1)}</td>
                  <td className={`font-semibold ${ok ? "text-pass-600" : "text-fail-600"}`}>{ok ? "Pass" : "Fail"}</td>
                  <td className="space-x-1"><button className="btn !px-2 !py-0.5 text-xs" onClick={() => onOpen(i)}>Open</button><button className="btn !px-2 !py-0.5 text-xs" onClick={() => onDelete(i)}>Delete</button></td></tr>) })}</tbody>
            </table>)}
          <p className="note mt-2">Saved deals stay in this browser for now.</p>
        </Card>
      </div>
      <Card title="How the numbers are calculated">
        <p className="note leading-relaxed">EGI = gross potential rent × (1 − vacancy) + other income. NOI = EGI − operating expenses; management is a % of EGI and reserves are per unit. Rent and other income grow by the yearly rent growth; taxes, insurance and other expenses grow at their own rates. Debt service is interest only during the interest only period, then a standard amortizing payment. Cash flow = NOI − debt service. Equity = down payment + closing costs + loan fees. Sale price = exit year NOI ÷ exit cap; net proceeds = sale price − selling costs − loan payoff. IRR uses the equity outflow at purchase, each year's cash flow and the net proceeds in the final year. Equity multiple = total cash returned ÷ equity. Max price is the highest price where every buy box test still passes, holding everything else constant.</p>
      </Card>
    </div>
  )
}

export const failNames = (t: Partial<Record<TestKey, boolean>>) => (Object.entries(t) as [TestKey, boolean][]).filter(([, b]) => !b).map(([k]) => TEST_NAMES[k])
