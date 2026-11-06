import { type DebtOpts, usd, pct, xx } from "../lib/model"
import { Card, Field, NumInput, Row } from "./ui"
import type { PaneProps } from "./Panes"

export function DebtOptions({ d, p, set }: PaneProps) {
  const D = d.debt, setD = (patch: Partial<DebtOpts>) => set({ debt: { ...D, ...patch } })
  const N = (k: keyof DebtOpts, label: string, step = 0.25, hint?: string) =>
    <Field label={label} hint={hint}><NumInput value={D[k] as number} step={step} onChange={v => setD({ [k]: v } as Partial<DebtOpts>)} /></Field>
  const fl = D.type === "floating", r = p.refi
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card title="Loan type and rate cap">
        <Field label="Rate">
          <select value={D.type} onChange={e => setD({ type: e.target.value as DebtOpts["type"] })}>
            <option value="fixed">Fixed (agency, bank, life company)</option>
            <option value="floating">Floating: SOFR + spread (bridge)</option>
          </select>
        </Field>
        {fl ? <>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {N("sofr", "SOFR today (%)", 0.05)}
            {N("sofrChg", "SOFR change (bps/yr)", 25, "Forward curve guess; negative if rates fall.")}
            {N("spread", "Spread (%)", 0.05, "Bridge loans run about 2.75 to 4%.")}
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" className="!w-auto" checked={D.capOn} onChange={e => setD({ capOn: e.target.checked })} /> Buy an interest rate cap</label>
          {D.capOn && <div className="mt-2 grid grid-cols-2 gap-3">{N("capStrike", "Cap strike, SOFR (%)", 0.25)}{N("capCost", "Cap cost ($, paid at closing)", 5000, "Lenders require one; price depends on term and strike.")}</div>}
          <p className="note mt-3">Floating loans here are interest only. Year 1 rate {pct(p.years[0].rate / 100)}, max {pct(Math.max(...p.years.map(y => y.rate)) / 100)}.</p>
        </> : <p className="note mt-3">Rate, amortization and interest only years come from the loan terms above.</p>}
      </Card>

      <Card title="Prepayment penalty">
        <Field label="If the loan is paid off early">
          <select value={D.prepay} onChange={e => setD({ prepay: e.target.value as DebtOpts["prepay"] })}>
            <option value="none">No penalty</option>
            <option value="stepdown">Step down (e.g. 5-4-3-2-1)</option>
            <option value="ym">Yield maintenance (agency fixed)</option>
            <option value="exitfee">Exit fee (bridge)</option>
          </select>
        </Field>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {D.prepay === "stepdown" && <Field label="% by loan year" hint="Comma separated."><input value={D.steps} onChange={e => setD({ steps: e.target.value })} /></Field>}
          {D.prepay === "ym" && N("tsy", "Treasury yield for YM (%)", 0.05, "Matching the remaining term.")}
          {D.prepay === "exitfee" && N("exitFee", "Exit fee (% of loan)", 0.25)}
        </div>
        <table className="tbl mt-3"><tbody>
          <Row label={r ? "Penalty at refinance" : `Penalty at sale, year ${d.hold}`} value={usd(r ? r.penalty : p.prepayPenalty)} />
        </tbody></table>
        <p className="note mt-2">Yield maintenance can cost 5 to 15% of the balance when rates have fallen, which is why a 7 year hold on a 10 year fixed loan needs this line.</p>
      </Card>

      <Card title="Refinance" right={<label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" className="!w-auto" checked={D.refiOn} onChange={e => setD({ refiOn: e.target.checked })} /> Refinance</label>}>
        <div className={`grid grid-cols-2 gap-3 ${D.refiOn ? "" : "pointer-events-none opacity-50"}`}>
          {N("refiYr", "At end of year", 1)}
          {N("refiCap", "Cap rate for value (%)", 0.05, "Applied to next year's NOI.")}
          {N("refiLtv", "Max LTV (%)", 1)}
          {N("refiDscr", "Min DSCR (x)", 0.05)}
          {N("refiRate", "New rate (%)", 0.05)}
          {N("refiAmort", "Amortization (yrs)", 1)}
          {N("refiIo", "Interest only (yrs)", 1)}
          {N("refiCost", "Costs (% of new loan)", 0.25)}
        </div>
        {r && <table className="tbl mt-3"><tbody>
          <Row label="Appraised value" value={usd(r.value)} />
          <Row label={`New loan (${r.binding} binds, ${pct(r.ltv, 1)} LTV)`} value={usd(r.newLoan)} />
          <Row label="Pay off old loan" value={usd(-r.oldBal)} />
          {r.penalty > 0 && <Row label="Prepayment penalty" value={usd(-r.penalty)} />}
          <Row label="Refinance costs" value={usd(-r.cost)} />
          <Row label={r.cashOut >= 0 ? "Cash out to investors" : "Cash investors must put in"} value={<span className={r.cashOut < 0 ? "text-fail-600" : "text-pass-600"}>{usd(r.cashOut)}</span>} cls="total" />
          <Row label="DSCR after refinance" value={xx(p.years[r.yr]?.dscr)} cls="sub" />
        </tbody></table>}
        {D.refiOn && !r && <p className="note mt-3">The refinance year must be before the sale year ({d.hold}).</p>}
        {r && r.cashOut < 0 && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">The new loan doesn't cover the old one. This is the refinance trap that hurt many 2021 and 2022 bridge deals: plan for a cash in refinance or a longer bridge.</p>}
      </Card>
    </div>
  )
}
