import { type ValueAdd, type Waterfall, usd, pct, xx, waterfall, project } from "../lib/model"
import { Card, Field, NumInput, Row } from "./ui"
import type { PaneProps } from "./Panes"

/* ---------- Value add ---------- */
export function ValueAddPane({ d, p, set }: PaneProps) {
  const va = d.va, setVa = (patch: Partial<ValueAdd>) => set({ va: { ...va, ...patch } })
  const N = (k: keyof ValueAdd, label: string, step = 1, hint?: string) =>
    <Field label={label} hint={hint}><NumInput value={va[k] as number} step={step} min={0} onChange={v => setVa({ [k]: v } as Partial<ValueAdd>)} /></Field>
  const base = va.on ? project({ ...d, va: { ...va, on: false } }) : p
  const Y = [...p.years, p.exitYear]
  const valueCreated = d.exitCap > 0 ? p.va.annualPremium * (1 - d.vac / 100) * (1 - d.mgmt / 100) / (d.exitCap / 100) : NaN
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Renovation program" right={
          <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" className="!w-auto" checked={va.on} onChange={e => setVa({ on: e.target.checked, units: va.units || p.units })} /> Include in the model</label>}>
          <div className={`grid grid-cols-2 gap-3 ${va.on ? "" : "pointer-events-none opacity-50"}`}>
            {N("units", "Units to renovate", 1, `Of ${p.units} total.`)}
            {N("cost", "Cost per unit ($)", 500, "Interiors usually $6k to $20k.")}
            {N("premium", "Rent premium ($/unit/mo)", 5, "Prove it with renovated comps.")}
            {N("pace", "Units started per month", 1, "Often 2 to 6, limited by turnover.")}
            {N("startMo", "Starts in month", 1, "1 = first month after closing.")}
            {N("downMo", "Months offline per unit", 1, "Rent lost while a unit is renovated.")}
            <Field label="Budget is funded" hint={va.upfront ? "Raised as equity at closing (most syndications)." : "Paid out of cash flow as it's spent."}>
              <select value={va.upfront ? "up" : "cf"} onChange={e => setVa({ upfront: e.target.value === "up" })}>
                <option value="up">With equity at closing</option><option value="cf">From cash flow</option>
              </select>
            </Field>
          </div>
          <p className="note mt-3">Interior renovations only make sense if the premium pays back the cost fast. Most sponsors want a return on cost of 15% or more, about a 6 to 7 year payback.</p>
        </Card>
        <Card title="What the program does">
          <table className="tbl"><tbody>
            <Row label="Total renovation budget" value={usd(p.va.budget)} />
            <Row label="Annual premium when finished" value={usd(p.va.annualPremium)} />
            <Row label="Return on cost (after vacancy)" value={<span className={p.va.roc < 0.12 ? "text-fail-600" : p.va.roc >= 0.15 ? "text-pass-600" : ""}>{pct(p.va.roc, 1)}</span>} />
            <Row label="All units finished by" value={isFinite(p.va.finishYr) ? `year ${p.va.finishYr}` : va.on ? "after the hold" : "n/a"} />
            <Row label="Value created at exit cap" value={usd(valueCreated)} cls="sub" />
            <Row label="Value created per $1 spent" value={p.va.budget > 0 ? xx(valueCreated / p.va.budget) : "n/a"} cls="sub" />
            <tr className="head"><td>Effect on the deal</td><td /></tr>
            <Row label="Year 1 NOI" value={`${usd(base.y1.noi)} → ${usd(p.y1.noi)}`} />
            <Row label="Exit NOI" value={`${usd(base.exitNoi)} → ${usd(p.exitNoi)}`} />
            <Row label="Equity required" value={`${usd(base.equity)} → ${usd(p.equity)}`} />
            <Row label="Levered IRR" value={`${pct(base.irr)} → ${pct(p.irr)}`} cls="total" />
            <Row label="Equity multiple" value={`${xx(base.em)} → ${xx(p.em)}`} />
          </tbody></table>
          {va.on && p.y1.dscr < base.y1.dscr && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Downtime cuts year 1 DSCR from {xx(base.y1.dscr)} to {xx(p.y1.dscr)}. Lenders often fund renovations with a bridge loan or a holdback for this reason.</p>}
        </Card>
      </div>
      {va.on && <Card title="Renovation schedule">
        <div className="overflow-x-auto"><table className="tbl">
          <thead><tr><th>Year</th>{Y.map((y, i) => <th key={i}>{i === Y.length - 1 ? `Exit yr ${y.t}` : y.t}</th>)}</tr></thead>
          <tbody>
            <tr><td>Units finished (cumulative)</td>{Y.map((y, i) => <td key={i} className="num">{Math.round(y.vaDone)}</td>)}</tr>
            <tr><td>Budget spent</td>{Y.map((y, i) => <td key={i} className="num">{usd(-y.vaSpend)}</td>)}</tr>
            <tr><td>Rent lost to downtime</td>{Y.map((y, i) => <td key={i} className="num">{usd(-y.vaDown)}</td>)}</tr>
            <tr><td>Renovation premium (net of vacancy)</td>{Y.map((y, i) => <td key={i} className="num text-pass-600">{usd(y.vaPrem)}</td>)}</tr>
            <tr className="total"><td>Net effect on income</td>{Y.map((y, i) => <td key={i} className="num">{usd(y.vaPrem - y.vaDown)}</td>)}</tr>
          </tbody>
        </table></div>
        <p className="note mt-2">Premiums grow with your rent growth. The exit year includes the full premium, which is where most of the value shows up.</p>
      </Card>}
    </div>
  )
}

/* ---------- Investors (GP / LP waterfall) ---------- */
export function InvestorsPane({ d, p, set }: PaneProps) {
  const wf = d.wf, setWf = (patch: Partial<Waterfall>) => set({ wf: { ...wf, ...patch } })
  const N = (k: keyof Waterfall, label: string, step = 0.5, hint?: string) =>
    <Field label={label} hint={hint}><NumInput value={wf[k] as number} step={step} min={0} onChange={v => setWf({ [k]: v } as Partial<Waterfall>)} /></Field>
  const w = waterfall(p)
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Deal structure" right={
          <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" className="!w-auto" checked={wf.on} onChange={e => setWf({ on: e.target.checked })} /> Syndication</label>}>
          <div className={`grid grid-cols-2 gap-3 ${wf.on ? "" : "opacity-60"}`}>
            {N("gpCo", "GP co-invest (% of equity)", 1, "Sponsors usually put in 5 to 10%.")}
            {N("pref", "Preferred return (%/yr)", 0.5, "Paid to all equity first. 6 to 8% is typical.")}
            {N("split1", "LP share after pref (%)", 5, "70/30 and 80/20 are common.")}
            {N("hurdle2", "Second hurdle, LP IRR (%)", 0.5)}
            {N("split2", "LP share above hurdle (%)", 5, "50/50 or 60/40 is common.")}
            {N("acqFee", "Acquisition fee (% of price)", 0.25, "1 to 3%, funded with equity.")}
            {N("amFee", "Asset management fee (% of EGI)", 0.25, "1 to 2%, paid before distributions.")}
            {N("dispFee", "Disposition fee (% of sale)", 0.25, "0 to 1%.")}
          </div>
          <p className="note mt-3">IRR hurdle waterfall: all equity gets cash back pro rata until investors earn the pref, then the split changes as the investors' IRR crosses each hurdle. The extra the sponsor earns above its own share is the promote.</p>
        </Card>
        <Card title="Who earns what">
          <table className="tbl">
            <thead><tr><th /><th>Investors (LP)</th><th>Sponsor (GP)</th></tr></thead>
            <tbody>
              <tr><td>Equity in</td><td className="num">{usd(w.lpEquity)}</td><td className="num">{usd(w.gpEquity)}</td></tr>
              <tr><td>IRR</td><td className="num font-semibold">{pct(w.lp.irr)}</td><td className="num font-semibold">{pct(w.gp.irr)}</td></tr>
              <tr><td>Equity multiple</td><td className="num">{xx(w.lp.em)}</td><td className="num">{xx(w.gp.em)}</td></tr>
              <tr><td>Profit</td><td className="num">{usd(w.lp.profit)}</td><td className="num">{usd(w.gp.profit)}</td></tr>
              <tr><td>of which fees</td><td /><td className="num">{usd(w.gp.fees)}</td></tr>
              <tr><td>of which promote</td><td /><td className="num">{usd(w.gp.promote)}</td></tr>
            </tbody>
          </table>
          <table className="tbl mt-4"><tbody>
            <Row label="Total equity raised (incl. acquisition fee)" value={usd(w.totalEquity)} />
            <Row label="Deal level IRR before fees and promote" value={pct(p.irr)} />
            <Row label="Fee and promote drag on investors" value={isFinite(w.lp.irr) && isFinite(p.irr) ? `${((p.irr - w.lp.irr) * 100).toFixed(2)} pts` : "n/a"} cls="sub" />
          </tbody></table>
          {isFinite(w.lp.irr) && w.lp.irr < wf.pref / 100 && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Investors don't reach the {wf.pref}% pref. Most LPs won't invest unless the base case clears the pref with room to spare.</p>}
        </Card>
      </div>
      <Card title="Distributions by year">
        <div className="overflow-x-auto"><table className="tbl">
          <thead><tr><th>Year</th><th>0</th>{w.years.map(y => <th key={y.t}>{y.t}{y.t === d.hold ? " + sale" : ""}</th>)}</tr></thead>
          <tbody>
            <tr><td>Fees to GP</td><td className="num">{usd(w.acqFee)}</td>{w.years.map(y => <td key={y.t} className="num">{usd(y.amFee)}</td>)}</tr>
            <tr><td>To investors (LP)</td><td className="num">{usd(-w.lpEquity)}</td>{w.years.map(y => <td key={y.t} className="num">{usd(y.toLp)}</td>)}</tr>
            <tr><td>To sponsor (GP)</td><td className="num">{usd(-w.gpEquity)}</td>{w.years.map(y => <td key={y.t} className="num">{usd(y.toGp)}</td>)}</tr>
            <tr className="sub"><td>of which promote</td><td />{w.years.map(y => <td key={y.t} className="num">{usd(y.promote)}</td>)}</tr>
            <tr className="total"><td>LP cash flow</td>{w.lpCfs.map((c, i) => <td key={i} className="num">{usd(c)}</td>)}</tr>
            <tr className="total"><td>GP cash flow incl. fees</td>{w.gpCfs.map((c, i) => <td key={i} className="num">{usd(c)}</td>)}</tr>
          </tbody>
        </table></div>
      </Card>
    </div>
  )
}
