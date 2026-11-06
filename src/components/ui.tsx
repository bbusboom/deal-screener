import { useEffect, useRef, useState, type ReactNode } from "react"

export function Card({ title, children, className = "", right }: { title?: string; children: ReactNode; className?: string; right?: ReactNode }) {
  return (
    <div className={`card ${className}`}>
      {(title || right) && <div className="mb-3 flex items-center justify-between gap-3">{title && <h2 className="card-title !mb-0">{title}</h2>}{right}</div>}
      {children}
    </div>
  )
}

/** Number input that lets people clear and retype without the value snapping to 0. */
export function NumInput({ value, onChange, step = 1, min, className = "", ...rest }:
  { value: number; onChange: (v: number) => void; step?: number; min?: number; className?: string; [k: string]: any }) {
  const [text, setText] = useState(String(value))
  const focused = useRef(false)
  useEffect(() => { if (!focused.current) setText(String(value)) }, [value])
  return (
    <input type="number" inputMode="decimal" step={step} min={min} value={text} className={`w-full ${className}`} {...rest}
      onFocus={() => { focused.current = true }}
      onBlur={() => { focused.current = false; setText(String(value)) }}
      onChange={e => { setText(e.target.value); const n = parseFloat(e.target.value); onChange(isFinite(n) ? n : 0) }} />
  )
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
      {label}
      {children}
      {hint && <span className="font-normal text-slate-400">{hint}</span>}
    </label>
  )
}

export function Row({ label, value, cls = "" }: { label: ReactNode; value: ReactNode; cls?: string }) {
  return <tr className={cls}><td>{label}</td><td className="num">{value}</td></tr>
}

export function Kpi({ label, value, tag, state }: { label: string; value: string; tag: string; state?: boolean }) {
  const tone = state === undefined ? { bar: "from-brand-400 to-brand-200", dot: "bg-brand-400", tag: "bg-slate-100 text-slate-500" }
    : state ? { bar: "from-pass-500 to-emerald-300", dot: "bg-pass-500", tag: "bg-pass-50 text-pass-700" }
    : { bar: "from-fail-500 to-gold-400", dot: "bg-fail-500", tag: "bg-fail-50 text-fail-700" }
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-4 pb-3 pt-3.5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tone.bar}`} />
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400"><span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />{label}</div>
      <div className="num mt-1 text-xl font-semibold text-brand-900">{value}</div>
      <div className={`chip mt-1 ${tone.tag}`}>{tag}</div>
    </div>
  )
}
