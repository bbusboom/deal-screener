import { type Projection, usdK } from "../lib/model"

export default function CashFlowChart({ p }: { p: Projection }) {
  const vals = p.years.map((y, i) => i === p.years.length - 1 ? y.cf + p.proceeds : y.cf)
  const W = 760, H = 230, pad = 36, bw = (W - pad * 2) / vals.length
  const mx = Math.max(1, ...vals), mn = Math.min(0, ...vals), sc = (H - 46) / (mx - mn), y0 = 22 + mx * sc
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Cash flow to equity by year">
      <line x1={pad} x2={W - pad} y1={y0} y2={y0} stroke="#e2e8f0" />
      {vals.map((v, i) => {
        const h = Math.abs(v) * sc, y = v >= 0 ? y0 - h : y0, last = i === vals.length - 1
        const cx = pad + i * bw + bw / 2
        return (
          <g key={i}>
            <rect x={pad + i * bw + bw * 0.16} y={y} width={bw * 0.68} height={Math.max(1, h)} rx={4} fill={v < 0 ? "#b3261e" : last ? "#1e7a4c" : "#1f4e79"} />
            <text x={cx} y={v >= 0 ? y - 5 : y + h + 13} fontSize="11" textAnchor="middle" fill="#0f172a" fontFamily="JetBrains Mono">{usdK(v)}</text>
            <text x={cx} y={H - 4} fontSize="11" textAnchor="middle" fill="#64748b">Yr {i + 1}{last ? " + sale" : ""}</text>
          </g>
        )
      })}
    </svg>
  )
}
