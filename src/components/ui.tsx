import { useEffect, useRef, useState, type ReactNode } from "react"

export function Card({ title, children, className = "", right }: { title?: string; children: ReactNode; className?: string; right?: ReactNode }) {
  return (
    <div className={`card ${className}`}>
      {(title || right) && <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">{title && <h2 className="card-title !mb-0">{title}</h2>}{right}</div>}
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
  const tone = state === undefined ? { val: "text-ink", tag: "text-slate-400" } : state ? { val: "text-ink", tag: "text-pass-600" } : { val: "text-fail-600", tag: "text-fail-600" }
  return (
    <div className="bg-white px-4 py-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`num mt-0.5 text-[19px] font-semibold ${tone.val}`}>{value}</div>
      <div className={`mt-0.5 text-[11px] ${tone.tag}`}>{tag}</div>
    </div>
  )
}
