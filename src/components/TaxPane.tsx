import { type TaxOpts, afterTax, usd, pct, xx } from "../lib/model"
import { Card, Field, NumInput, Row } from "./ui"
import type { PaneProps } from "./Panes"

/** Financials › Taxes: depreciation, cost segregation and after tax returns for an individual owner. */
export function TaxPane({ d, p, set }: PaneProps) {
  const X = d.tx, setX = (patch: Partial<TaxOpts>) => set({ tx: { ...X, ...patch } })
  const N = (k: keyof TaxOpts, label: string, step = 1, hint?: string) =>
    <Field label={label} hint={hint}><NumInput value={X[k] as number} step={step} onChange={v => setX({ [k]: v } as Partial<TaxOpts>)} /></Field>
  const a = afterTax(p), noSeg = afterTax(p, { costSegPct: 0 }), other = afterTax(p, { losses: X.losses === "now" ? "carry" : "now" })
  const y1 = a.years[0]
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Card title="Tax assumptions">
          <div className="grid grid-cols-2 gap-3">
            {N("landPct", "Land share of price (%)", 1, "County assessor's land vs improvement split.")}
            {N("costSegPct", "Cost segregation (% of building)", 1, "Apartments usually 20 to 35%. 0 = no study.")}
            {N("bonusPct", "Bonus depreciation (%)", 5, "100% for property acquired after Jan 19, 2025.")}
            {N("ordinary", "Ordinary income tax rate (%)", 1)}
            {N("capGains", "Long term capital gains rate (%)", 1)}
            {N("recapture", "Straight line recapture rate (%)", 1, "Unrecaptured §1250 gain, max 25%.")}
            <Field label="Losses" hint={X.losses === "now" ? "Real estate professional, or other passive income to offset." : "Passive investor: losses wait until sale."}>
              <select value={X.losses} onChange={e => setX({ losses: e.target.value as TaxOpts["losses"] })}>
                <option value="carry">Suspended until sale (passive)</option><option value="now">Used each year</option>
              </select>
            </Field>
            <label className="flex items-center gap-2 self-end pb-2 text-sm"><input type="checkbox" checked={X.niit} onChange={e => setX({ niit: e.target.checked })} /> 3.8% net investment income tax</label>
          </div>
          <p className="note mt-3">A simplified individual owner model for comparing deals, not tax advice. State income tax, the $25,000 rental loss allowance, 1031 exchanges and entity rules aren't modeled. Confirm with a CPA before relying on it.</p>
        </Card>
        <Card title="After tax returns">
          <table className="tbl"><tbody>
            <Row label="Levered IRR before tax" value={pct(p.irr)} />
            <Row label="After tax IRR" value={<b className="text-brand-900">{pct(a.irr)}</b>} cls="total" />
            <Row label="After tax equity multiple" value={xx(a.em)} />
            <Row label="After tax profit" value={usd(a.profit)} />
            <Row label="Without cost segregation" value={pct(noSeg.irr)} cls="sub" />
            <Row label={X.losses === "now" ? "If losses were suspended instead" : "If losses could be used each year"} value={pct(other.irr)} cls="sub" />
            <tr className="head"><td>Depreciation</td><td /></tr>
            <Row label="Depreciable building basis" value={usd(a.basis - a.land)} />
            <Row label="Year 1 depreciation" value={usd(y1.depreciation)} />
            <Row label={`Year 1 taxable income${X.losses === "carry" ? " (after suspending losses)" : ""}`} value={usd(y1.taxable)} />
            <Row label={X.losses === "now" ? "Year 1 tax savings" : "Losses suspended until sale"} value={usd(X.losses === "now" ? -y1.tax : a.sale.suspendedReleased)} />
          </tbody></table>
          {X.losses === "carry" && a.irr < noSeg.irr && <p className="mt-3 rounded-lg bg-gold-50 p-3 text-sm text-gold-700">For a passive investor whose losses wait until sale, cost segregation mostly shifts timing and turns some gain into ordinary income at sale. It pays off most when the losses can be used each year.</p>}
        </Card>
      </div>
      <Card title="By year">
        <div className="overflow-x-auto"><table className="tbl">
          <thead><tr><th>Year</th>{a.years.map(y => <th key={y.t}>{y.t}</th>)}</tr></thead>
          <tbody>
            <tr><td>NOI</td>{a.years.map(y => <td key={y.t} className="num">{usd(y.noi)}</td>)}</tr>
            <tr><td>Interest</td>{a.years.map(y => <td key={y.t} className="num">{usd(-y.interest)}</td>)}</tr>
            <tr><td>Depreciation</td>{a.years.map(y => <td key={y.t} className="num">{usd(-y.depreciation)}</td>)}</tr>
            <tr><td>Loan fee amortization</td>{a.years.map(y => <td key={y.t} className="num">{usd(-y.amort)}</td>)}</tr>
            {X.losses === "carry" && <tr><td>Suspended losses used</td>{a.years.map(y => <td key={y.t} className="num">{y.suspendedUsed ? usd(-y.suspendedUsed) : ""}</td>)}</tr>}
            <tr className="sub"><td>Taxable income</td>{a.years.map(y => <td key={y.t} className="num">{usd(y.taxable)}</td>)}</tr>
            <tr><td>Income tax (− = savings)</td>{a.years.map(y => <td key={y.t} className="num">{usd(y.tax)}</td>)}</tr>
            <tr><td>Cash flow before tax</td>{a.years.map(y => <td key={y.t} className="num">{usd(y.cf)}</td>)}</tr>
            <tr className="total"><td>Cash flow after tax</td>{a.years.map(y => <td key={y.t} className="num">{usd(y.afterTax)}</td>)}</tr>
          </tbody>
        </table></div>
      </Card>
      <Card title={`Tax at sale, year ${d.hold}`}>
        <div className="grid gap-6 md:grid-cols-2">
          <table className="tbl"><tbody>
            <Row label="Sale price less selling costs" value={usd(a.sale.realized)} />
            <Row label="Adjusted basis (cost + capital − depreciation)" value={usd(-a.sale.adjBasis)} />
            <Row label="Total gain" value={usd(a.sale.gain)} cls="total" />
          </tbody></table>
          <table className="tbl"><tbody>
            <Row label={`Recapture, cost seg property at ${X.ordinary}%`} value={usd(a.sale.recapture1245)} />
            <Row label={`Straight line recapture at ${Math.min(X.recapture, X.ordinary)}%`} value={usd(a.sale.unrecap1250)} />
            <Row label={`Capital gain at ${X.capGains}%`} value={usd(a.sale.capitalGain)} />
            {a.sale.suspendedReleased > 0 && <Row label="Suspended losses released" value={usd(-a.sale.suspendedReleased)} />}
            <Row label="Tax due at sale" value={usd(a.sale.tax)} cls="total" />
            <Row label="Net sale proceeds after tax" value={usd(a.sale.afterTaxProceeds)} />
          </tbody></table>
        </div>
        <p className="note mt-2">A 1031 exchange into another property can defer all of this tax; it isn't modeled here.</p>
      </Card>
    </div>
  )
}
