// Investment committee memo: a clean one to three page layout the user prints or saves as PDF.
import { useEffect } from "react"
import { createPortal } from "react-dom"
import { type Deal, type Projection, usd, pct, xx, tests, allPass, TEST_NAMES, exitCapCheck, exitStress, waterfall, BENCH, benchFlag, type TestKey } from "../lib/model"

function risks(d: Deal, p: Projection): string[] {
  const r: string[] = [], u = p.units || 1, ex = exitCapCheck(p)
  if (ex.level === "bad") r.push(`Exit cap (${ex.exit.toFixed(2)}%) is below the going in cap (${ex.goingIn.toFixed(2)}%).`)
  if (p.y1.dscr < 1.25) r.push(`Year 1 DSCR is ${xx(p.y1.dscr)}, below the 1.25x most lenders require.`)
  if (p.sizing.binding !== "LTV" && d.sizeMode !== "lesser") r.push(`At these terms a lender would size the loan to ${usd(p.sizing.maxLoan)} (${p.sizing.binding}), not ${usd(p.loan)}.`)
  if (p.balloonBeforeSale) r.push(`The loan matures in year ${d.term}, before the planned sale in year ${d.hold}.`)
  if (p.refi && p.refi.cashOut < 0) r.push(`The year ${p.refi.yr} refinance needs ${usd(-p.refi.cashOut)} of new equity.`)
  if (p.y1.beo > 0.85) r.push(`Break even occupancy is ${pct(p.y1.beo, 1)}; little room for a downturn.`)
  for (const k of ["ins", "rm", "pay", "res"]) { const v = k === "res" ? d.res : (d as any)[k]; if (benchFlag(k, k === "res" ? v : v / u, p.units) === "low") r.push(`${BENCH[k].label} looks low at ${usd(k === "res" ? v : v / u)} per unit.`) }
  if (d.va.on && isFinite(p.va.roc) && p.va.roc < 0.15) r.push(`Renovation return on cost is ${pct(p.va.roc, 1)}, under the usual 15% target.`)
  if (d.t12 && Object.keys(d.t12).length) { const t = d.t12, egi = (t.gpr || 0) - (t.ltl || 0) - (t.vac || 0) - (t.conc || 0) - (t.bad || 0) - (t.nru || 0) + (t.other || 0); if (egi > 0 && p.y1.egi > egi * 1.05) r.push(`Underwritten EGI is ${pct(p.y1.egi / egi - 1, 1)} above the seller's T12.`) }
  return r
}

export function MemoView({ d, p, mp, onClose }: { d: Deal; p: Projection; mp: number; onClose: () => void }) {
  const t = tests(p, d), ok = allPass(t), y = p.years[0], w = d.wf.on ? waterfall(p) : null
  const R = risks(d, p), stress = exitStress(d)
  useEffect(() => { document.body.classList.add("memo-open"); return () => document.body.classList.remove("memo-open") }, [])
  const H = ({ children }: { children: string }) => <h2 className="mb-2 mt-6 border-b border-slate-300 pb-1 text-sm font-bold uppercase tracking-wide text-slate-700">{children}</h2>
  const KV = ({ k, v }: { k: string; v: string }) => <tr><td className="py-0.5 pr-4 text-slate-600">{k}</td><td className="py-0.5 text-right font-mono">{v}</td></tr>
  return createPortal(
    <div className="fixed inset-0 z-50 overflow-auto bg-slate-900/60 p-4 print:static print:bg-white print:p-0">
      <div className="no-print mx-auto mb-3 flex max-w-[8.5in] justify-end gap-2">
        <button className="btn btn-primary" onClick={() => print()}>Print or save as PDF</button>
        <button className="btn" onClick={onClose}>Close</button>
      </div>
      <div className="print-area mx-auto max-w-[8.5in] bg-white p-10 text-[12.5px] leading-snug text-ink shadow-2xl print:max-w-none print:p-0 print:shadow-none">
        <div className="flex items-start justify-between border-b-2 border-ink pb-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500">Investment memo</div>
            <h1 className="text-2xl font-bold">{d.name || "Untitled deal"}</h1>
            <div className="text-slate-600">{[d.address, d.state].filter(Boolean).join(", ")}{d.address || d.state ? " · " : ""}{p.units} units · {new Date().toLocaleDateString()}</div>
          </div>
          <div className={`rounded px-3 py-1.5 text-sm font-bold ${ok ? "bg-pass-50 text-pass-600" : "bg-fail-50 text-fail-600"}`}>{ok ? "Clears the buy box" : "Does not clear the buy box"}</div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          {([["Price", usd(d.price)], ["Per unit", usd(p.y1.ppu)], ["Going in cap", pct(p.y1.cap)], ["Year 1 DSCR", xx(p.y1.dscr)],
             ["Levered IRR", pct(p.irr)], ["Equity multiple", xx(p.em)], ["Cash on cash yr 1", pct(p.y1.coc)], ["Max price, buy box", isFinite(mp) ? usd(mp) : "n/a"]] as const).map(([k, v]) =>
            <div key={k} className="rounded border border-slate-200 px-2 py-1.5"><div className="text-[10px] uppercase text-slate-500">{k}</div><div className="font-mono text-base font-semibold">{v}</div></div>)}
        </div>
        {!ok && <p className="mt-2 text-slate-700">Short on: {(Object.entries(t) as [TestKey, boolean][]).filter(([, b]) => !b).map(([k]) => TEST_NAMES[k]).join(", ")}.</p>}

        <div className="grid grid-cols-2 gap-8">
          <div>
            <H>Sources and uses</H>
            <table className="w-full"><tbody>
              <KV k="Purchase price" v={usd(d.price)} /><KV k="Closing costs" v={usd(p.closing)} /><KV k="Loan fees" v={usd(p.fee)} />
              {d.capexUp > 0 && <KV k="Up front capex" v={usd(d.capexUp)} />}{p.va.upfront > 0 && <KV k="Renovation budget" v={usd(p.va.upfront)} />}{p.capCost > 0 && <KV k="Rate cap" v={usd(p.capCost)} />}
              <KV k="Loan" v={`${usd(p.loan)} (${pct(p.loan / d.price, 1)} LTV)`} /><KV k="Equity" v={usd(p.equity)} />
            </tbody></table>
            <H>Debt</H>
            <table className="w-full"><tbody>
              <KV k="Type" v={d.debt.type === "floating" ? `Floating, SOFR + ${d.debt.spread}%` : `Fixed ${d.rate}%`} />
              <KV k="Amortization / IO" v={d.debt.type === "floating" ? "Interest only" : `${d.amort} yrs / ${d.ioYrs} yrs IO`} />
              <KV k="Debt yield" v={pct(p.y1.debtYield)} /><KV k="Sizing constraint" v={p.sizing.binding} />
              {p.refi && <KV k={`Refinance, year ${p.refi.yr}`} v={`${usd(p.refi.newLoan)}, net ${usd(p.refi.cashOut)}`} />}
              {p.prepayPenalty > 0 && <KV k="Prepayment at sale" v={usd(p.prepayPenalty)} />}
            </tbody></table>
          </div>
          <div>
            <H>Year 1 operations</H>
            <table className="w-full"><tbody>
              <KV k="Gross potential rent" v={usd(y.gpr)} /><KV k="Economic occupancy" v={pct(p.y1.econOcc, 1)} />
              <KV k="Effective gross income" v={usd(y.egi)} /><KV k="Operating expenses" v={usd(y.opex)} />
              <KV k="Expenses per unit" v={usd(y.opex / (p.units || 1))} /><KV k="Expense ratio" v={pct(p.y1.expRatio, 1)} />
              <KV k="NOI before reserves" v={usd(y.noiBR)} /><KV k="Net cash flow (NOI after reserves)" v={usd(y.noi)} />
              <KV k="Debt service" v={usd(y.ds)} /><KV k="Cash flow" v={usd(y.cf)} />
            </tbody></table>
          </div>
        </div>

        <H>Projection</H>
        <table className="w-full text-right font-mono text-[11px]">
          <thead><tr className="text-slate-500"><th className="text-left font-sans">Year</th>{p.years.map(r => <th key={r.t}>{r.t}</th>)}</tr></thead>
          <tbody>
            {([["EGI", "egi"], ["NOI", "noi"], ["Debt service", "ds"], ["Cash flow", "cf"]] as const).map(([l, k]) =>
              <tr key={k}><td className="text-left font-sans text-slate-600">{l}</td>{p.years.map(r => <td key={r.t}>{usd(r[k])}</td>)}</tr>)}
            <tr><td className="text-left font-sans text-slate-600">DSCR</td>{p.years.map(r => <td key={r.t}>{xx(r.dscr)}</td>)}</tr>
          </tbody>
        </table>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <H>Exit and returns</H>
            <table className="w-full"><tbody>
              <KV k={`Exit year ${d.hold + 1} NOI`} v={usd(p.exitNoi)} /><KV k="Exit cap" v={`${d.exitCap}%`} /><KV k="Sale price" v={usd(p.salePrice)} />
              <KV k="Net sale proceeds" v={usd(p.proceeds)} /><KV k="Unlevered IRR" v={pct(p.unlevIrr)} /><KV k="Profit" v={usd(p.profit)} />
              {w && <><KV k="Investor (LP) IRR" v={pct(w.lp.irr)} /><KV k="Investor multiple" v={xx(w.lp.em)} /><KV k="Sponsor fees + promote" v={usd(w.gp.fees + w.gp.promote)} /></>}
            </tbody></table>
          </div>
          <div>
            <H>Exit cap sensitivity</H>
            <table className="w-full text-right"><thead><tr className="text-slate-500"><th className="text-left">Exit cap</th><th>Sale price</th><th>IRR</th><th>Multiple</th></tr></thead>
              <tbody>{stress.map(s => <tr key={s.exitCap} className={s.exitCap === d.exitCap ? "font-bold" : ""}><td className="text-left">{s.exitCap.toFixed(2)}%</td><td className="font-mono">{usd(s.price)}</td><td className="font-mono">{pct(s.irr)}</td><td className="font-mono">{xx(s.em)}</td></tr>)}</tbody></table>
            {d.va.on && <><H>Value add</H><table className="w-full"><tbody>
              <KV k="Units / budget" v={`${p.va.units} / ${usd(p.va.budget)}`} /><KV k="Premium per unit per month" v={usd(d.va.premium)} /><KV k="Return on cost" v={pct(p.va.roc, 1)} />
            </tbody></table></>}
          </div>
        </div>

        <H>Risks and diligence items</H>
        {R.length ? <ul className="list-disc space-y-1 pl-5">{R.map(x => <li key={x}>{x}</li>)}</ul> : <p className="text-slate-600">No automatic flags. Verify the rent roll, T12, taxes after sale and an insurance quote.</p>}

        <p className="mt-8 border-t border-slate-200 pt-2 text-[10px] text-slate-400">Prepared with Deal Screener (getdealscreener.com). A screening and learning tool, not investment advice. Figures depend on the inputs entered.</p>
      </div>
    </div>, document.body
  )
}
