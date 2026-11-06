import { useState } from "react"
import {
  type StatementKey, type StatementCol, usd, pct, xx, underwrittenCol, colTotals, exitCapCheck, exitStress,
} from "../lib/model"
import { Card, NumInput } from "./ui"
import type { PaneProps } from "./Panes"

type Line = { k: StatementKey; label: string; neg?: boolean }
const REV: Line[] = [
  { k: "gpr", label: "Gross potential rent (at market)" },
  { k: "ltl", label: "Loss to lease", neg: true },
  { k: "vac", label: "Physical vacancy", neg: true },
  { k: "conc", label: "Concessions", neg: true },
  { k: "bad", label: "Bad debt", neg: true },
  { k: "nru", label: "Non revenue units", neg: true },
  { k: "other", label: "Other income" },
]
const EXP: Line[] = [
  { k: "tax", label: "Real estate taxes" }, { k: "ins", label: "Insurance" }, { k: "util", label: "Utilities" },
  { k: "rm", label: "Repairs & maintenance" }, { k: "turn", label: "Turnover / make ready" }, { k: "contract", label: "Contract services" },
  { k: "pay", label: "Payroll" }, { k: "adm", label: "General & admin" }, { k: "mkt", label: "Marketing" }, { k: "mgmt", label: "Management fee" },
]

/** Three column operating statement: seller T12, T3 annualized, underwritten. Same layout lenders and IC memos use. */
export function StatementPane({ d, p, set }: PaneProps) {
  const units = p.units || 1
  const uw = underwrittenCol(p), y1 = p.years[0]
  // Underwritten totals come straight from the model so added lines are included.
  const U = { egi: y1.egi, opexBR: y1.opex - y1.res, noi: y1.noiBR, ncf: y1.noi }
  const added = (kind: "income" | "expense") => d.custom.map((c, i) => ({ c, v: y1.cust[i] || 0 })).filter(x => x.c.kind === kind && x.v)
  const addedRow = (label: string, v: number, key: string) => (
    <tr key={key} className="bg-brand-50/40"><td>{label} <span className="text-[10px] text-slate-400">added</span></td><td /><td />
      <td className="num font-medium">{usd(v)}</td>{showPU && <td className="num text-slate-500">{usd(v / units)}</td>}{showPU && <td className="num text-slate-500">{U.egi > 0 ? pct(Math.abs(v) / U.egi, 1) : ""}</td>}<td /></tr>)
  const t12 = d.t12 || {}, t3 = d.t3 || {}
  const T = colTotals(t12), T3 = colTotals(t3)
  const has12 = Object.keys(t12).length > 0, has3 = Object.keys(t3).length > 0
  const [showPU, setShowPU] = useState(true)
  const setCol = (col: "t12" | "t3", k: StatementKey, v: number) => set({ [col]: { ...(d[col] || {}), [k]: v } } as any)
  const snapshot = () => { const c: StatementCol = {}; for (const [k, v] of Object.entries(uw)) c[k as StatementKey] = Math.round(v); set({ t12: c }) }
  
  // Flag lines where the underwriting is more optimistic than the seller's actuals by > 5%.
  const flag = (k: StatementKey, revenue: boolean) => {
    if (!has12 || t12[k] === undefined) return ""
    const a = Number(t12[k]) || 0, b = uw[k]
    if (a === 0 && b === 0) return ""
    const deduction = ["ltl", "vac", "conc", "bad", "nru"].includes(k)
    const better = revenue ? (deduction ? b < a * 0.95 : b > a * 1.05) : b < a * 0.95
    return better ? "bg-amber-50" : ""
  }
  const cell = (col: "t12" | "t3", k: StatementKey) => (
    <td className="num !py-1"><NumInput className="!w-28 !py-1 text-right" value={(d[col] || {})[k] ?? ("" as any)} step={500} min={0} onChange={v => setCol(col, k, v)} /></td>
  )
  const line = (l: Line, revenue: boolean) => {
    const v = uw[l.k]
    return (
      <tr key={l.k} className={flag(l.k, revenue)}>
        <td>{l.neg ? <span className="pl-3">less {l.label.toLowerCase()}</span> : l.label}</td>
        {cell("t12", l.k)}{cell("t3", l.k)}
        <td className="num font-medium">{usd(l.neg ? -v : v)}</td>
        {showPU && <td className="num text-slate-500">{usd((l.neg ? -v : v) / units)}</td>}
        {showPU && <td className="num text-slate-500">{U.egi > 0 ? pct(v / U.egi, 1) : ""}</td>}
        <td className="num text-slate-500">{has12 && t12[l.k] !== undefined ? usd((l.neg ? -1 : 1) * (v - (Number(t12[l.k]) || 0))) : ""}</td>
      </tr>
    )
  }
  const tot = (label: string, a: number, b: number, c: number, cls = "total", has = [has12, has3]) => (
    <tr className={cls}><td>{label}</td>
      <td className="num">{has[0] ? usd(a) : ""}</td><td className="num">{has[1] ? usd(b) : ""}</td><td className="num">{usd(c)}</td>
      {showPU && <td className="num">{usd(c / units)}</td>}{showPU && <td className="num">{U.egi > 0 ? pct(c / U.egi, 1) : ""}</td>}
      <td className="num">{has[0] ? usd(c - a) : ""}</td></tr>
  )
  const reserves: Line = { k: "res", label: "Replacement reserves" }

  const ex = exitCapCheck(p), stress = exitStress(d)
  const ds = p.y1.ds
  const optimistic = has12 && U.noi > T.noi * 1.05

  return (
    <div className="space-y-4">
      <Card title="Operating statement" right={
        <div className="flex flex-wrap gap-2">
          <label className="flex items-center gap-1 text-xs text-slate-500"><input type="checkbox" className="!w-auto" checked={showPU} onChange={e => setShowPU(e.target.checked)} /> $/unit and % EGI</label>
          <button className="btn" onClick={snapshot} title="Copy the current underwriting into the Seller T12 column, as a starting point to edit">Fill T12 from inputs</button>
          {(has12 || has3) && <button className="btn" onClick={() => set({ t12: undefined, t3: undefined })}>Clear seller columns</button>}
        </div>}>
        <p className="note mb-3">Enter the seller's trailing 12 months and the last 3 months annualized (× 4) as positive numbers. Importing a T12 on the Documents tab fills the first column. Shaded lines are where your underwriting is more optimistic than the seller's actuals: be ready to defend each one.</p>
        <div className="overflow-x-auto"><table className="tbl">
          <thead><tr><th className="min-w-[200px]">Annual</th><th>Seller T12</th><th>T3 annualized</th><th>Underwritten yr 1</th>{showPU && <th>$/unit</th>}{showPU && <th>% EGI</th>}<th>UW − T12</th></tr></thead>
          <tbody>
            <tr className="head"><td colSpan={8}>Revenue</td></tr>
            {REV.map(l => line(l, true))}
            {added("income").map((x, j) => addedRow(x.c.label || "Added income", x.v, "ai" + j))}
            {tot("Effective gross income", T.egi, T3.egi, U.egi)}
            <tr className="head"><td colSpan={8}>Operating expenses</td></tr>
            {EXP.map(l => line(l, false))}
            {added("expense").map((x, j) => addedRow(x.c.label || "Added expense", -x.v, "ae" + j))}
            {tot("Total operating expenses", T.opexBR, T3.opexBR, U.opexBR, "sub")}
            {tot("Net operating income (before reserves)", T.noi, T3.noi, U.noi)}
            {line(reserves, false)}
            {tot("Net cash flow (lender NOI after reserves)", T.ncf, T3.ncf, U.ncf)}
          </tbody>
        </table></div>
        {optimistic && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Underwritten NOI is {pct(U.noi / T.noi - 1, 1)} above the seller's T12. Lenders size on in place numbers, and buyers who pay for upside they haven't created yet usually overpay.</p>}
        {has12 && has3 && T3.egi < T.egi * 0.97 && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Recent income (T3) is running {pct(1 - T3.egi / T.egi, 1)} below the T12. The trend matters more than the year: underwrite to the T3 unless you know why it dipped.</p>}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Lender view, year 1">
          <table className="tbl"><tbody>
            <tr><td>NOI before reserves</td><td className="num">{usd(U.noi)}</td></tr>
            <tr><td>less replacement reserves</td><td className="num">{usd(-uw.res)}</td></tr>
            <tr className="total"><td>Net cash flow (NCF)</td><td className="num">{usd(U.ncf)}</td></tr>
            <tr><td>Debt service</td><td className="num">{usd(-ds)}</td></tr>
            <tr><td>DSCR on NCF</td><td className="num">{xx(ds > 0 ? U.ncf / ds : NaN)}</td></tr>
            <tr><td>Debt yield on NCF</td><td className="num">{pct(p.loan > 0 ? U.ncf / p.loan : NaN)}</td></tr>
            <tr><td>Cap rate on NOI before reserves</td><td className="num">{pct(d.price > 0 ? U.noi / d.price : NaN)}</td></tr>
            <tr><td>Cap rate on NCF</td><td className="num">{pct(p.y1.cap)}</td></tr>
          </tbody></table>
          <p className="note mt-2">Brokers quote cap rates on NOI before reserves; lenders and this model use NCF. Know which one a number is.</p>
        </Card>
        <Card title="Exit cap discipline">
          <div className={`mb-3 rounded-lg p-3 text-sm ${ex.level === "bad" ? "bg-fail-50 text-fail-600" : ex.level === "warn" ? "bg-amber-50 text-amber-900" : "bg-pass-50 text-pass-600"}`}>
            {ex.level === "bad" && <>Exit cap {ex.exit.toFixed(2)}% is below the going in cap of {ex.goingIn.toFixed(2)}%. You're assuming the market pays more for an older building. Most investment committees reject that.</>}
            {ex.level === "warn" && <>Exit cap {ex.exit.toFixed(2)}% is above going in ({ex.goingIn.toFixed(2)}%) but by less than the usual cushion. A {d.hold} year hold suggests about {ex.suggested.toFixed(2)}%.</>}
            {ex.level === "ok" && <>Exit cap {ex.exit.toFixed(2)}% is at least {(ex.suggested - ex.goingIn).toFixed(2)} points over going in ({ex.goingIn.toFixed(2)}%). Conservative.</>}
            {ex.level === "na" && <>Enter a price and exit cap to check.</>}
          </div>
          <table className="tbl">
            <thead><tr><th>Exit cap</th><th>Sale price</th><th>IRR</th><th>Equity multiple</th></tr></thead>
            <tbody>{stress.map(s => <tr key={s.exitCap} className={s.exitCap === d.exitCap ? "font-semibold" : ""}><td>{s.exitCap.toFixed(2)}%</td><td className="num">{usd(s.price)}</td><td className="num">{pct(s.irr)}</td><td className="num">{xx(s.em)}</td></tr>)}</tbody>
          </table>
          <p className="note mt-2">Rule of thumb: exit cap = going in + 5 to 10 bps per hold year (25 to 75 bps). Every 50 bps of exit cap moves value 7 to 9%.</p>
        </Card>
      </div>
    </div>
  )
}
