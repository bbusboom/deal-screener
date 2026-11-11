// Diagrams drawn in code to show how underwriting works. Numbers match the Oak Ridge example.
import type React from "react"
import type { DiagramKind } from "./curriculum"

const C = { brand: "#1f4e79", brand2: "#2563a6", soft: "#eef4fb", green: "#1e7a4c", greenSoft: "#e9f7ef", red: "#b3261e", redSoft: "#fdecea", ink: "#0f172a", muted: "#64748b", line: "#cbd5e1", amber: "#a86400", amberSoft: "#fdf1dd" }
const T = (x: number, y: number, s: string, o: { size?: number; w?: number; c?: string; a?: "start" | "middle" | "end" } = {}) =>
  <text x={x} y={y} fontSize={o.size || 13} fontWeight={o.w || 500} fill={o.c || C.ink} textAnchor={o.a || "middle"} fontFamily="Inter, system-ui, sans-serif">{s}</text>
const Arrow = ({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) => <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.muted} strokeWidth={2} markerEnd="url(#ah)" />
const Defs = () => <defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill={C.muted} /></marker></defs>

function Flow() {
  const steps = ["Documents", "Income", "Expenses", "NOI", "Value", "Debt", "Returns", "Decision"]
  const w = 92, gap = 14
  return (
    <svg viewBox="0 0 860 120"><Defs />
      {steps.map((s, i) => {
        const x = 8 + i * (w + gap), hl = s === "NOI"
        return <g key={s}>
          <rect x={x} y={30} width={w} height={54} rx={10} fill={hl ? C.brand : C.soft} stroke={hl ? C.brand : C.line} />
          {T(x + w / 2, 52, String(i + 1), { size: 11, c: hl ? "#cfe0f3" : C.muted })}
          {T(x + w / 2, 70, s, { size: 13, w: 600, c: hl ? "#fff" : C.ink })}
          {i < steps.length - 1 && <Arrow x1={x + w + 1} y1={57} x2={x + w + gap - 1} y2={57} />}
        </g>
      })}
      {T(430, 112, "Everything after NOI depends on getting income and expenses right", { size: 12, c: C.muted })}
    </svg>)
}
function Returns4() {
  const items = [["Cash flow", "Money left after expenses and the loan, paid to you", C.green], ["Loan paydown", "Each payment lowers what you owe, building equity", C.brand2], ["Appreciation", "The property becoming worth more over time", C.amber], ["Tax benefits", "Depreciation lowers taxable income", C.muted]] as const
  return (
    <svg viewBox="0 0 860 150">
      {items.map(([h, s, c], i) => {
        const x = 10 + i * 212
        return <g key={h}><rect x={x} y={10} width={200} height={128} rx={12} fill="#fff" stroke={C.line} /><rect x={x} y={10} width={200} height={8} rx={4} fill={c} />
          {T(x + 100, 52, h, { size: 16, w: 700, c })}
          <foreignObject x={x + 14} y={66} width={172} height={64}><div style={{ font: "12.5px Inter, sans-serif", color: C.muted, textAlign: "center", lineHeight: 1.35 }}>{s}</div></foreignObject>
        </g>
      })}
    </svg>)
}
function Docs() {
  const d = [["Offering memo", "The seller's pitch", ["Photos and description", "Asking price", "Broker projections"]], ["Rent roll", "What each unit earns today", ["Unit and floor plan", "Current and market rent", "Lease dates, occupancy"]], ["T12", "What it really cost to run", ["12 months of income", "Every expense line", "Actual, not projected"]]] as const
  return (
    <svg viewBox="0 0 860 200">
      {d.map(([h, s, lines], i) => {
        const x = 20 + i * 280
        return <g key={h}>
          <path d={`M${x} 14 h190 l30 30 v146 h-220 z`} fill="#fff" stroke={C.line} /><path d={`M${x + 190} 14 v30 h30`} fill={C.soft} stroke={C.line} />
          {T(x + 110, 52, h, { size: 16, w: 700, c: C.brand })}{T(x + 110, 72, s, { size: 12, c: C.muted })}
          {lines.map((l, k) => <g key={l}><rect x={x + 22} y={92 + k * 28} width={176} height={18} rx={4} fill={C.soft} />{T(x + 110, 105 + k * 28, l, { size: 11.5 })}</g>)}
        </g>
      })}
    </svg>)
}
function Waterfall() {
  const max = 250000, H = 170, sc = (v: number) => v / max * H, base = 200
  const bars = [{ l: "Gross potential rent", v: 240000, y0: 0, c: C.brand }, { l: "Vacancy 6%", v: -14400, y0: 240000, c: C.red }, { l: "Other income", v: 9600, y0: 225600, c: C.green }, { l: "EGI", v: 235200, y0: 0, c: C.brand }]
  return (
    <svg viewBox="0 0 860 240">
      <line x1={40} x2={820} y1={base} y2={base} stroke={C.line} />
      {bars.map((b, i) => {
        const x = 70 + i * 190, top = b.v >= 0 ? b.y0 + b.v : b.y0, h = Math.abs(b.v)
        return <g key={b.l}><rect x={x} y={base - sc(top)} width={110} height={Math.max(3, sc(h))} rx={6} fill={b.c} opacity={i === 3 ? 1 : 0.88} />
          {T(x + 55, base - sc(top) - 8, (b.v < 0 ? "−" : "") + "$" + Math.abs(b.v).toLocaleString(), { size: 13, w: 700 })}
          {T(x + 55, base + 20, b.l, { size: 12.5, c: C.muted })}</g>
      })}
    </svg>)
}
function Noi() {
  return (
    <svg viewBox="0 0 860 160"><Defs />
      <rect x={20} y={40} width={220} height={80} rx={12} fill={C.soft} stroke={C.line} />{T(130, 72, "Effective gross income", { size: 14, w: 600 })}{T(130, 98, "$235,200", { size: 20, w: 700, c: C.brand })}
      {T(290, 88, "−", { size: 34, w: 700, c: C.muted })}
      <rect x={330} y={40} width={220} height={80} rx={12} fill={C.redSoft} stroke="#f0c3be" />{T(440, 72, "Operating expenses", { size: 14, w: 600 })}{T(440, 98, "$97,760", { size: 20, w: 700, c: C.red })}
      {T(600, 88, "=", { size: 34, w: 700, c: C.muted })}
      <rect x={640} y={30} width={200} height={100} rx={12} fill={C.brand} />{T(740, 66, "NOI", { size: 16, w: 700, c: "#cfe0f3" })}{T(740, 98, "$137,440", { size: 24, w: 800, c: "#fff" })}
      {T(430, 152, "No mortgage, no CapEx, no depreciation, no income taxes", { size: 12, c: C.muted })}
    </svg>)
}
function CapTriangle() {
  return (
    <svg viewBox="0 0 860 230">
      <path d="M430 14 L610 200 L250 200 Z" fill={C.soft} stroke={C.brand} strokeWidth={2} /><line x1={300} y1={130} x2={560} y2={130} stroke={C.brand} strokeWidth={2} /><line x1={430} y1={130} x2={430} y2={200} stroke={C.brand} strokeWidth={2} />
      {T(430, 98, "NOI", { size: 20, w: 800, c: C.brand })}{T(355, 172, "Value", { size: 17, w: 700 })}{T(505, 172, "Cap rate", { size: 17, w: 700 })}
      {[["Cap rate = NOI ÷ Value", 60], ["Value = NOI ÷ Cap rate", 110], ["NOI = Value × Cap rate", 160]].map(([s, y]) => <g key={s as string}>{T(700, y as number, s as string, { size: 14, w: 600, a: "start" })}</g>)}
      {T(140, 90, "Cover the one you want;", { size: 12.5, c: C.muted })}{T(140, 110, "the other two show the formula", { size: 12.5, c: C.muted })}
    </svg>)
}
function CapStack() {
  return (
    <svg viewBox="0 0 860 220">
      <rect x={300} y={20} width={260} height={54} rx={8} fill={C.green} />{T(430, 44, "Equity  $600,000", { size: 15, w: 700, c: "#fff" })}{T(430, 63, "30%  your cash", { size: 12, c: "#d6f0e0" })}
      <rect x={300} y={74} width={260} height={126} rx={8} fill={C.brand} />{T(430, 130, "Loan  $1,400,000", { size: 16, w: 700, c: "#fff" })}{T(430, 152, "70% LTV  from the lender", { size: 12, c: "#cfe0f3" })}
      {T(240, 116, "Purchase price", { size: 13, w: 600, a: "end" })}{T(240, 136, "$2,000,000", { size: 15, w: 800, a: "end", c: C.brand })}
      {T(600, 50, "Paid back last, gets the upside", { size: 12.5, c: C.muted, a: "start" })}{T(600, 140, "Paid first, fixed interest", { size: 12.5, c: C.muted, a: "start" })}
    </svg>)
}
function Dscr() {
  const sc = 1.3
  return (
    <svg viewBox="0 0 860 200">
      <rect x={120} y={30} width={137440 / 1000 * sc * 3.2} height={50} rx={8} fill={C.green} />{T(130, 61, "NOI  $137,440", { size: 14, w: 700, c: "#fff", a: "start" })}
      <rect x={120} y={100} width={106187 / 1000 * sc * 3.2} height={50} rx={8} fill={C.brand} />{T(130, 131, "Debt service  $106,187", { size: 14, w: 700, c: "#fff", a: "start" })}
      <line x1={120 + 106187 / 1000 * sc * 3.2} y1={20} x2={120 + 106187 / 1000 * sc * 3.2} y2={160} stroke={C.red} strokeDasharray="5 4" />
      {T(120 + 106187 / 1000 * sc * 3.2, 178, "1.0x: income just covers the loan", { size: 12, c: C.red })}
      {T(760, 70, "DSCR", { size: 14, w: 600, c: C.muted })}{T(760, 104, "1.29x", { size: 30, w: 800, c: C.green })}{T(760, 128, "lenders want 1.20+", { size: 12, c: C.muted })}
    </svg>)
}
function Cashflow() {
  const rows = [["NOI", 137440, C.brand], ["Debt service", -106187, C.red], ["Cash flow", 31253, C.green]] as const
  return (
    <svg viewBox="0 0 860 170">
      {rows.map(([l, v, c], i) => <g key={l}>{T(150, 42 + i * 48, l, { size: 14, w: 600, a: "end" })}
        <rect x={170} y={20 + i * 48} width={Math.abs(v) / 1000 * 3.6} height={34} rx={6} fill={c} />
        {T(180 + Math.abs(v) / 1000 * 3.6, 42 + i * 48, (v < 0 ? "−" : "") + "$" + Math.abs(v).toLocaleString(), { size: 14, w: 700, a: "start" })}</g>)}
      {T(760, 72, "Cash on cash", { size: 13, c: C.muted })}{T(760, 104, "4.88%", { size: 28, w: 800, c: C.green })}{T(760, 126, "$31,253 ÷ $640,000", { size: 12, c: C.muted })}
    </svg>)
}
function Timeline() {
  const cfs = [-640000, 31253, 35376, 39623, 43997, 968578], sc = 0.11, base = 140
  return (
    <svg viewBox="0 0 860 270">
      <line x1={40} x2={820} y1={base} y2={base} stroke={C.line} />
      {cfs.map((v, i) => {
        const x = 70 + i * 130, h = Math.abs(v) / 1000 * sc, last = i === cfs.length - 1
        return <g key={i}><rect x={x} y={v >= 0 ? base - h : base} width={70} height={Math.max(3, h)} rx={5} fill={v < 0 ? C.red : last ? C.green : C.brand} />
          {T(x + 35, v >= 0 ? base - h - 7 : base + h + 16, (v < 0 ? "−" : "") + "$" + Math.round(Math.abs(v) / 1000) + "k", { size: 12, w: 700 })}
          {T(x + 35, 262, i === 0 ? "Buy" : `Yr ${i}${last ? " + sale" : ""}`, { size: 12, c: C.muted })}</g>
      })}
      {T(330, 40, "IRR 12.83%  ·  Equity multiple 1.75x", { size: 15, w: 700, c: C.brand })}
    </svg>)
}
function Sensitivity() {
  const caps = ["6.5%", "7.0%", "7.5%"], rg = ["1%", "3%", "5%"], vals = [["7.1%", "3.0%", "−1.2%"], ["16.2%", "12.8%", "9.5%"], ["23.7%", "20.6%", "17.7%"]]
  return (
    <svg viewBox="0 0 860 210">
      {T(250, 24, "Exit cap rate →", { size: 12, c: C.muted })}{T(60, 120, "Rent growth ↓", { size: 12, c: C.muted })}
      {caps.map((c, j) => T(190 + j * 110 + 50, 52, c, { size: 13, w: 700 }))}
      {rg.map((g, i) => <g key={g}>{T(160, 92 + i * 46, g, { size: 13, w: 700, a: "end" })}
        {vals[i].map((v, j) => { const ok = parseFloat(v.replace("−", "-")) >= 12; return <g key={j}><rect x={190 + j * 110} y={66 + i * 46} width={100} height={40} rx={6} fill={ok ? C.greenSoft : C.redSoft} stroke={i === 1 && j === 1 ? C.ink : "none"} strokeWidth={2} />{T(240 + j * 110, 92 + i * 46, v, { size: 14, w: 700, c: ok ? C.green : C.red })}</g> })}</g>)}
      <foreignObject x={560} y={60} width={280} height={120}><div style={{ font: "13px Inter, sans-serif", color: C.muted, lineHeight: 1.45 }}>Oak Ridge 5 year IRR as rent growth and exit cap change. Green meets a 12% target; the outlined cell is the base case. Notice how fast returns fall when rents grow slowly and the exit cap rises.</div></foreignObject>
    </svg>)
}

function SupplyCycle() {
  const ph = [["Permit", "0", C.muted, 90], ["Construction", "18 to 30 months", C.brand2, 250], ["Lease up", "12 to 24 months", C.amber, 230], ["Stabilized", "", C.green, 140]] as const
  let x = 30
  return (
    <svg viewBox="0 0 860 210"><Defs />
      {ph.map(([h, sub, c, w]) => { const x0 = x; x += w + 12
        return <g key={h}><rect x={x0} y={30} width={w} height={56} rx={10} fill={c} opacity={h === "Lease up" ? 1 : 0.9} />
          {T(x0 + w / 2, 56, h, { size: 14, w: 700, c: "#fff" })}{sub && T(x0 + w / 2, 74, sub, { size: 11.5, c: "#ffffffcc" })}</g> })}
      <path d="M 30 150 C 300 150, 360 150, 400 175 S 560 195, 620 175 S 760 150, 830 148" fill="none" stroke={C.red} strokeWidth={3} />
      {T(130, 140, "Nearby rents and concessions", { size: 12, c: C.muted })}
      {T(500, 205, "Concessions peak and rent growth stalls while new units lease up", { size: 12, w: 600, c: C.red })}
      {T(430, 118, "The building you'll compete with was permitted 2 to 4 years before it hurts you", { size: 12.5, w: 600, c: C.brand })}
    </svg>)
}
function Concession() {
  const bars = [["New building, asking", 1400, C.brand2], ["New building, effective (8 weeks free)", 1201, C.amber], ["Your older building, in place", 1250, C.green]] as const
  return (
    <svg viewBox="0 0 860 190">
      {bars.map(([l, v, c], i) => { const w = v / 1400 * 520, y = 20 + i * 54
        return <g key={l}><rect x={260} y={y} width={w} height={36} rx={8} fill={c} />
          {T(250, y + 23, l, { size: 12.5, a: "end" })}{T(268 + w, y + 23, "$" + v.toLocaleString(), { size: 14, w: 700, a: "start" })}</g> })}
      {T(520, 182, "After the free weeks, the brand new unit costs less than yours", { size: 12.5, w: 600, c: C.red })}
    </svg>)
}
function Funnel() {
  const st = [["Deals screened", "100", 760], ["Fully underwritten", "20", 560], ["Offers (LOI)", "5", 360], ["Closed", "1", 180]] as const
  return (
    <svg viewBox="0 0 860 220">
      {st.map(([l, n, w], i) => <g key={l}><rect x={430 - w / 2} y={10 + i * 50} width={w} height={42} rx={10} fill={[C.soft, "#dbe7f5", C.brand2, C.brand][i]} />
        {T(430, 37 + i * 50, `${n}  ·  ${l}`, { size: 14, w: 700, c: i > 1 ? "#fff" : C.brand })}</g>)}
    </svg>)
}
const MAP: Record<DiagramKind, () => React.ReactElement> = { supplyCycle: SupplyCycle, concession: Concession, funnel: Funnel, flow: Flow, returns4: Returns4, docs: Docs, waterfall: Waterfall, noi: Noi, capTriangle: CapTriangle, capStack: CapStack, dscr: Dscr, cashflow: Cashflow, timeline: Timeline, sensitivity: Sensitivity }
export default function Diagram({ d, caption }: { d: DiagramKind; caption?: string }) {
  const D = MAP[d]
  return <figure className="my-5 rounded-lg border border-slate-200 bg-white p-4"><div className="[&_svg]:h-auto [&_svg]:w-full">{<D />}</div>{caption && <figcaption className="note mt-2 text-center">{caption}</figcaption>}</figure>
}
/** The bare drawing, for module covers. */
export function DiagramArt({ d }: { d: DiagramKind }) { const D = MAP[d]; return <D /> }
