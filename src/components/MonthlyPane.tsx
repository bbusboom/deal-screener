import { useState } from "react"
import { type LeaseUp, monthlyView, usd, usdK, pct } from "../lib/model"
import { Card, Field, NumInput } from "./ui"
import type { PaneProps } from "./Panes"

/** Financials › Monthly: lease up inputs and a month by month cash flow for the first two or three years. */
export function MonthlyPane({ d, p, set }: PaneProps) {
  const lu = d.lu, setLu = (patch: Partial<LeaseUp>) => set({ lu: { ...lu, ...patch } })
  const [months, setMonths] = useState(24)
  const rows = monthlyView(p, months)
  const low = rows.reduce((a, r) => r.cum < a.cum ? r : a, rows[0] || { cum: 0, m: 0 } as any)
  const firstPos = rows.find(r => r.cf > 0)?.m
  const stabM = lu.on ? lu.months + 1 : null
  const W = 760, H = 150, maxCf = Math.max(1, ...rows.map(r => Math.abs(r.cf)))
  const bw = (W - 20) / Math.max(1, rows.length)
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <Card title="Lease up" right={<label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={lu.on} onChange={e => setLu({ on: e.target.checked })} /> Property is leasing up</label>}>
          <div className={`grid grid-cols-2 gap-3 ${lu.on ? "" : "pointer-events-none opacity-50"}`}>
            <Field label="Occupancy at closing (%)"><NumInput value={lu.startOcc} step={1} onChange={v => setLu({ startOcc: v })} /></Field>
            <Field label="Months to stabilize" hint={`Reaches ${100 - d.vac}% (100% − vacancy).`}><NumInput value={lu.months} step={1} onChange={v => setLu({ months: v })} /></Field>
          </div>
          <p className="note mt-3">Use for new construction, a distressed property, or a building emptied for renovation. Typical lease up absorbs 10 to 20 units a month, slower when nearby buildings are also leasing up (see Market › Supply &amp; demand). Lenders usually want 90% occupancy for 90 days before permanent financing.</p>
          <table className="tbl mt-3"><tbody>
            <tr><td>Lowest cumulative cash position</td><td className="num">{usd(low?.cum)}{low?.m ? ` (month ${low.m})` : ""}</td></tr>
            <tr><td>First month with positive cash flow</td><td className="num">{firstPos ? `month ${firstPos}` : "not in this window"}</td></tr>
            {stabM && <tr><td>Stabilized</td><td className="num">month {stabM}</td></tr>}
          </tbody></table>
        </Card>
        <Card title="Monthly cash flow" right={<select className="!w-auto" value={months} onChange={e => setMonths(Number(e.target.value))}><option value={12}>12 months</option><option value={24}>24 months</option><option value={36}>36 months</option></select>}>
          <svg viewBox={`0 0 ${W} ${H + 24}`} className="h-auto w-full font-sans">
            <line x1={10} x2={W - 10} y1={H / 2} y2={H / 2} stroke="#cbd5e1" />
            {rows.map((r, i) => { const h = Math.abs(r.cf) / maxCf * (H / 2 - 6), up = r.cf >= 0
              return <rect key={r.m} x={10 + i * bw + bw * 0.15} y={up ? H / 2 - h : H / 2} width={bw * 0.7} height={Math.max(1, h)} rx={2} fill={up ? "#4f6bed" : "#e0443b"} opacity={0.9}><title>{`Month ${r.m}: ${usd(r.cf)}`}</title></rect> })}
            {rows.filter(r => r.m % 6 === 0).map(r => <text key={r.m} x={10 + (r.m - 0.5) * bw} y={H + 16} fontSize="11" fill="#94a3b8" textAnchor="middle">M{r.m}</text>)}
          </svg>
          <p className="note">Cash flow after debt service and capital spending, by month. Red months need cash from reserves or investors.</p>
        </Card>
      </div>
      <Card title="Month by month">
        <div className="overflow-x-auto"><table className="tbl text-[13px]">
          <thead><tr><th>Month</th><th>Occupancy</th><th>Potential rent</th><th>Vacancy &amp; loss</th><th>Renovation net</th><th>Other income</th><th>EGI</th><th>Opex</th><th>NOI</th><th>Debt service</th><th>Capital</th><th>Cash flow</th><th>Cumulative</th></tr></thead>
          <tbody>{rows.map(r => (
            <tr key={r.m} className={r.m % 12 === 0 ? "border-b-2 border-slate-200" : ""}>
              <td>{r.m}</td><td className="num">{pct(r.occ, 0)}</td><td className="num">{usd(r.gpr)}</td><td className="num">{usd(-r.vacancy)}</td>
              <td className="num">{r.reno ? usd(r.reno) : ""}</td><td className="num">{usd(r.other)}</td><td className="num font-medium">{usd(r.egi)}</td>
              <td className="num">{usd(-r.opex)}</td><td className="num font-medium">{usd(r.noi)}</td><td className="num">{usd(-r.ds)}</td><td className="num">{r.capex ? usd(-r.capex) : ""}</td>
              <td className={`num font-semibold ${r.cf < 0 ? "text-fail-600" : "text-brand-900"}`}>{usd(r.cf)}</td><td className="num text-slate-500">{usdK(r.cum)}</td>
            </tr>))}</tbody>
        </table></div>
        <p className="note mt-2">Cumulative starts at minus your equity at closing. Steady items are each year's total divided by 12; lease up, renovation downtime, premiums and spending follow the actual monthly schedule, so every year adds back to the annual model.</p>
      </Card>
    </div>
  )
}
