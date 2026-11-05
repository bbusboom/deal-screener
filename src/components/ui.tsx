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
  const bar = state === undefined ? "border-l-slate-200" : state ? "border-l-pass-600" : "border-l-fail-600"
  return (
    <div className={`rounded-xl border border-slate-200 border-l-4 ${bar} bg-white px-3.5 py-2.5 shadow-card`}>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="num mt-0.5 text-lg font-semibold">{value}</div>
      <div className="text-[11px] text-slate-400">{tag}</div>
    </div>
  )
}
