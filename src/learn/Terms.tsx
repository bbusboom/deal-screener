// Glossary terms inside lesson text: shown in blue, with the definition on hover, focus or tap.
import { useEffect, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { glossary } from "./curriculum"

/** Words too common to be worth highlighting in running text. */
const SKIP = new Set(["Underwriting", "Investor", "Lender", "Equity", "Supply", "Pipeline", "Unemployment", "Multifamily", "Base case", "Hurdle", "Concessions", "Stabilized", "Appreciation", "Depreciation"])

type Alias = { text: string; exact: boolean; key: string; def: string }
const ALIASES: Alias[] = (() => {
  const out: Alias[] = []
  for (const [k, def] of glossary) {
    if (SKIP.has(k)) continue
    const m = k.match(/^(.*?)\s*\((.+)\)$/), names = m ? [m[1], m[2]] : k.split(" / ").length > 1 ? k.split(" / ") : [k]
    for (const n of names) {
      const t = n.trim(); if (t.length < 2 || SKIP.has(t)) continue
      out.push({ text: t, exact: t === t.toUpperCase() || /[A-Z].*[A-Z]/.test(t.slice(1)), key: k, def })
    }
  }
  return out.sort((a, b) => b.text.length - a.text.length)
})()
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
const RE = new RegExp(`(?<![A-Za-z0-9])(${ALIASES.map(a => esc(a.text)).join("|")})(s?)(?![A-Za-z0-9])`, "gi")
const find = (m: string) => ALIASES.find(a => a.exact ? a.text === m : a.text.toLowerCase() === m.toLowerCase())

export function Term({ children, term, def }: { children: ReactNode; term: string; def: string }) {
  const [pos, setPos] = useState<{ left: number; top: number; below: boolean } | null>(null)
  const show = (el: HTMLElement) => {
    const r = el.getBoundingClientRect(), w = Math.min(288, innerWidth - 16)
    const below = r.top < 140
    setPos({ left: Math.max(8, Math.min(r.left, innerWidth - w - 8)), top: below ? r.bottom + 8 : r.top - 8, below })
  }
  useEffect(() => {
    if (!pos) return
    const hide = () => setPos(null)
    addEventListener("scroll", hide, true); addEventListener("resize", hide)
    return () => { removeEventListener("scroll", hide, true); removeEventListener("resize", hide) }
  }, [pos])
  return (
    <>
      <button type="button" className="cursor-help font-medium text-brand-600 underline decoration-brand-500/40 decoration-dotted underline-offset-4 hover:decoration-brand-500"
        onMouseEnter={e => show(e.currentTarget)} onMouseLeave={() => setPos(null)} onFocus={e => show(e.currentTarget)} onBlur={() => setPos(null)}
        onClick={e => pos ? setPos(null) : show(e.currentTarget)} aria-label={`${term}: ${def}`}>{children}</button>
      {pos && createPortal(<span role="tooltip" style={{ left: pos.left, top: pos.top, width: Math.min(288, innerWidth - 16), transform: pos.below ? undefined : "translateY(-100%)" }}
        className="pointer-events-none fixed z-50 rounded-lg bg-brand-900 px-3 py-2 text-left text-[13px] font-normal leading-snug text-white shadow-lg">
        <b className="block text-amber-300">{term}</b>{def}
      </span>, document.body)}
    </>)
}

/** Highlights the first use of each glossary term in a lesson. `seen` is shared across the lesson's paragraphs. */
export function withTerms(text: string, seen: Set<string>): ReactNode[] {
  const parts: ReactNode[] = []; let last = 0
  for (const m of text.matchAll(RE)) {
    const a = find(m[1]); if (!a || seen.has(a.key)) continue
    seen.add(a.key)
    if (m.index! > last) parts.push(text.slice(last, m.index))
    parts.push(<Term key={m.index} term={a.key} def={a.def}>{m[0]}</Term>)
    last = m.index! + m[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}
