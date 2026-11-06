import { type LoanQuote, project, quotePatch, norm, usd, pct, xx } from "../lib/model"
import { Card, NumInput } from "./ui"
import type { PaneProps } from "./Panes"

const TPL: Record<string, LoanQuote> = {
  "Agency fixed": { lender: "Agency (Fannie/Freddie)", type: "fixed", maxLtv: 65, minDscr: 1.25, minDy: 0, rate: 5.9, spread: 0, amort: 30, io: 2, term: 10, fee: 1, prepay: "ym", steps: "", capCost: 0 },
  "Bank": { lender: "Local or regional bank", type: "fixed", maxLtv: 70, minDscr: 1.3, minDy: 9, rate: 6.6, spread: 0, amort: 25, io: 0, term: 5, fee: 0.75, prepay: "stepdown", steps: "3,2,1", capCost: 0 },
  "Bridge": { lender: "Bridge / debt fund", type: "floating", maxLtv: 75, minDscr: 1.0, minDy: 7, rate: 0, spread: 3.25, amort: 0, io: 3, term: 3, fee: 1, prepay: "exitfee", steps: "", capCost: 60000 },
  "Life company": { lender: "Life insurance company", type: "fixed", maxLtv: 60, minDscr: 1.35, minDy: 9, rate: 5.6, spread: 0, amort: 30, io: 0, term: 10, fee: 0.5, prepay: "ym", steps: "", capCost: 0 },
}
type Row = [string, keyof LoanQuote, number, string?]
const ROWS: Row[] = [["Max LTV (%)", "maxLtv", 1], ["Min DSCR (x)", "minDscr", 0.05], ["Min debt yield (%)", "minDy", 0.25, "0 = none"], ["Rate (%)", "rate", 0.05, "fixed"], ["Spread over SOFR (%)", "spread", 0.05, "floating"],
  ["Amortization (yrs)", "amort", 1, "0 = interest only"], ["Interest only (yrs)", "io", 1], ["Term (yrs)", "term", 1], ["Fees (% of loan)", "fee", 0.25], ["Rate cap cost ($)", "capCost", 5000, "floating"]]

/** Capital › Loan quotes: compare lender term sheets on what they mean for this deal. */
export function QuotesPane({ d, set }: PaneProps) {
  const qs = d.quotes, upd = (i: number, patch: Partial<LoanQuote>) => set({ quotes: qs.map((q, j) => j === i ? { ...q, ...patch } : q) })
  const runs = qs.map(q => { const dd = norm({ ...d, ...quotePatch(d, q) }); return { dd, p: project(dd) } })
  const best = runs.length ? runs.reduce((a, r, i) => (r.p.irr > runs[a].p.irr ? i : a), 0) : -1
  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center gap-2 !py-4">
        <div className="mr-auto"><div className="font-display text-lg font-semibold text-brand-900">Compare lender quotes</div>
          <div className="text-xs text-slate-500">Each quote is sized the way that lender would (lesser of LTV, DSCR and debt yield) and run through the full model. Starting terms are examples; replace them with your actual term sheets.</div></div>
        {Object.keys(TPL).map(k => <button key={k} className="btn" disabled={qs.length >= 4} onClick={() => set({ quotes: [...qs, { ...TPL[k] }] })}>+ {k}</button>)}
      </div>
      {qs.length === 0 ? <Card><p className="note">Add two to four quotes to see which one gives the most loan, the best cash flow and the best return, and what each costs if you sell or refinance early.</p></Card> : <>
        <Card title="Terms">
          <div className="overflow-x-auto"><table className="tbl">
            <thead><tr><th /> {qs.map((q, i) => <th key={i} className="!text-left"><input className="!w-44 font-semibold" value={q.lender} onChange={e => upd(i, { lender: e.target.value })} /></th>)}</tr></thead>
            <tbody>
              <tr><td>Rate type</td>{qs.map((q, i) => <td key={i} className="!text-left"><select className="!w-44" value={q.type} onChange={e => upd(i, { type: e.target.value as LoanQuote["type"] })}><option value="fixed">Fixed</option><option value="floating">Floating (SOFR + spread)</option></select></td>)}</tr>
              {ROWS.map(([l, k, step, only]) => <tr key={k}><td>{l}</td>{qs.map((q, i) => <td key={i} className="!text-left">{only === "fixed" && q.type !== "fixed" || only === "floating" && q.type !== "floating" ? <span className="text-xs text-slate-300">n/a</span> :
                <NumInput className="!w-44" value={q[k] as number} step={step} onChange={v => upd(i, { [k]: v } as Partial<LoanQuote>)} />}</td>)}</tr>)}
              <tr><td>Prepayment</td>{qs.map((q, i) => <td key={i} className="!text-left"><select className="!w-44" value={q.prepay} onChange={e => upd(i, { prepay: e.target.value as LoanQuote["prepay"] })}><option value="none">None</option><option value="stepdown">Step down</option><option value="ym">Yield maintenance</option><option value="exitfee">Exit fee</option></select>
                {q.prepay === "stepdown" && <input className="mt-1 !w-44" value={q.steps} placeholder="3,2,1" onChange={e => upd(i, { steps: e.target.value })} />}</td>)}</tr>
              <tr><td /> {qs.map((_, i) => <td key={i} className="!text-left"><button className="text-xs text-slate-400 hover:text-fail-600" onClick={() => set({ quotes: qs.filter((_, j) => j !== i) })}>Remove</button></td>)}</tr>
            </tbody>
          </table></div>
          <p className="note mt-2">Floating quotes use the SOFR path and cap strike from Capital › Debt. Agency loans usually size on DSCR alone; banks and debt funds add a debt yield test.</p>
        </Card>
        <Card title="What each quote does to the deal">
          <div className="overflow-x-auto"><table className="tbl">
            <thead><tr><th /> {qs.map((q, i) => <th key={i}>{q.lender || `Quote ${i + 1}`}{i === best && qs.length > 1 && <span className="chip ml-1 bg-pass-50 text-pass-700">best IRR</span>}</th>)}</tr></thead>
            <tbody>
              {([["Loan amount", r => usd(r.p.loan)], ["Binding test", r => r.p.sizing.binding], ["Effective LTV", r => pct(r.p.loan / d.price, 1)], ["Year 1 rate", r => r.p.years[0].rate.toFixed(2) + "%"],
                 ["Year 1 debt service", r => usd(r.p.y1.ds)], ["Year 1 DSCR", r => xx(r.p.y1.dscr)], ["Lowest DSCR in hold", r => xx(r.p.minDscr)], ["Equity required", r => usd(r.p.equity)],
                 ["Cash on cash, year 1", r => pct(r.p.y1.coc)], ["Levered IRR", r => pct(r.p.irr)], ["Equity multiple", r => xx(r.p.em)],
                 ["Prepayment cost at sale", r => usd(r.p.prepayPenalty)], ["Matures before sale", r => r.p.balloonBeforeSale ? "Yes, refinance needed" : "No"]] as [string, (r: typeof runs[number]) => string][]).map(([l, f]) =>
                <tr key={l} className={l === "Levered IRR" ? "total" : ""}><td>{l}</td>{runs.map((r, i) => <td key={i} className="num">{f(r)}</td>)}</tr>)}
              <tr><td /> {qs.map((q, i) => <td key={i}><button className="btn btn-primary !py-1 text-xs" onClick={() => set(quotePatch(d, q))}>Use this loan</button></td>)}</tr>
            </tbody>
          </table></div>
          <p className="note mt-2">The best IRR isn't always the best loan: a short bridge loan can win on IRR but leaves refinance risk, and yield maintenance can be expensive if you sell early. "Use this loan" copies the terms into Capital › Debt.</p>
        </Card>
      </>}
    </div>
  )
}
