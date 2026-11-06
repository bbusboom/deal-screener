import { type Projection, usdK } from "../lib/model"

export default function CashFlowChart({ p }: { p: Projection }) {
  const vals = p.years.map((y, i) => i === p.years.length - 1 ? y.cf + p.proceeds : y.cf)
  const W = 760, H = 230, pad = 36, bw = (W - pad * 2) / vals.length
  const mx = Math.max(1, ...vals), mn = Math.min(0, ...vals), sc = (H - 46) / (mx - mn), y0 = 22 + mx * sc
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full font-sans" role="img" aria-label="Cash flow to equity by year">
      <defs>
        <linearGradient id="cfBar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7b8ff7" /><stop offset="1" stopColor="#3a55d6" /></linearGradient>
        <linearGradient id="cfSale" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd28a" /><stop offset="1" stopColor="#ff8a3d" /></linearGradient>
        <linearGradient id="cfNeg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e0443b" /><stop offset="1" stopColor="#b3261e" /></linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map(f => <line key={f} x1={pad} x2={W - pad} y1={22 + (H - 46) * f} y2={22 + (H - 46) * f} stroke="#eef1f7" strokeDasharray="3 4" />)}
      <line x1={pad} x2={W - pad} y1={y0} y2={y0} stroke="#cbd5e1" />
      {vals.map((v, i) => {
        const h = Math.abs(v) * sc, y = v >= 0 ? y0 - h : y0, last = i === vals.length - 1
        const cx = pad + i * bw + bw / 2
        return (
          <g key={i}>
            <rect x={pad + i * bw + bw * 0.16} y={y} width={bw * 0.68} height={Math.max(1, h)} rx={2} fill={v < 0 ? "#c2410c" : last ? "#e8a33d" : "#1d2c6e"} />
            <text x={cx} y={v >= 0 ? y - 5 : y + h + 13} fontSize="11" fontWeight="600" textAnchor="middle" fill="#0c1533" fontFamily="JetBrains Mono, monospace">{usdK(v)}</text>
            <text x={cx} y={H - 4} fontSize="11" textAnchor="middle" fill="#94a3b8" fontFamily="Inter, sans-serif">Yr {i + 1}{last ? " + sale" : ""}</text>
          </g>
        )
      })}
    </svg>
  )
}
