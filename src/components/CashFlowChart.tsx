import { usdK, usd, xx, type Projection } from "../lib/model"

/** Yearly cash flow to equity on its own scale, with the sale shown beside it instead of stacked on the last bar
 *  (stacked, a $1.4M sale flattens $20k years into lines you can't compare). */
export default function CashFlowChart({ p }: { p: Projection }) {
  const vals = p.years.map(y => y.cf + (y.refiCash || 0))
  const W = 640, H = 220, pad = 28, bw = (W - pad * 2) / vals.length
  const mx = Math.max(1, ...vals), mn = Math.min(0, ...vals), sc = (H - 50) / (mx - mn || 1), y0 = 24 + mx * sc
  const during = vals.reduce((a, b) => a + b, 0), back = during + p.proceeds
  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_240px]">
      <div>
        <div className="mb-1 text-xs font-medium text-slate-500">Cash flow after debt service, each year</div>
        <svg viewBox={`0 0 ${W} ${H}`} className="cf-chart h-auto w-full font-sans" role="img" aria-label="Cash flow to equity by year">
          {[0.33, 0.66].map(f => <line key={f} x1={pad} x2={W - pad} y1={24 + (H - 50) * f} y2={24 + (H - 50) * f} stroke="#eeeeea" strokeDasharray="3 4" />)}
          <line x1={pad} x2={W - pad} y1={y0} y2={y0} stroke="#cbd5e1" />
          {vals.map((v, i) => {
            const h = Math.abs(v) * sc, y = v >= 0 ? y0 - h : y0, cx = pad + i * bw + bw / 2
            return (
              <g key={i}>
                <rect x={pad + i * bw + bw * 0.2} y={y} width={bw * 0.6} height={Math.max(1.5, h)} rx={2} fill={v < 0 ? "#b3261e" : "#1d2c6e"} />
                <text x={cx} y={v >= 0 ? y - 6 : y + h + 14} fontSize="12" fontWeight="600" textAnchor="middle" fill="#0c1533" className="num">{usdK(v)}</text>
                <text x={cx} y={H - 4} fontSize="12" textAnchor="middle" fill="#94a3b8">Yr {i + 1}</text>
              </g>
            )
          })}
        </svg>
      </div>
      <div className="flex flex-col justify-center gap-3 border-t border-[#e4e4de] pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
        <Stat label="Equity invested" value={usd(p.equity)} />
        <Stat label={`Cash flow over ${vals.length} years`} value={usd(during)} />
        <Stat label={`Sale, year ${vals.length}, net proceeds`} value={usd(p.proceeds)} accent />
        <div className="border-t border-[#e4e4de] pt-3">
          <Stat label="Total back to equity" value={`${usd(back)} · ${xx(p.em)}`} strong />
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, accent, strong }: { label: string; value: string; accent?: boolean; strong?: boolean }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-slate-500">{accent && <span className="h-2 w-2 rounded-sm bg-gold-500" />}{label}</div>
      <div className={`num mt-0.5 ${strong ? "text-lg font-semibold text-ink" : "text-[15px] font-semibold text-ink"}`}>{value}</div>
    </div>
  )
}
