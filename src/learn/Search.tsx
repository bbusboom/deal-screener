// ⌘K search across lessons, modules and glossary terms.
import { useEffect, useMemo, useRef, useState } from "react"
import { COURSE, allLessons, glossary } from "./curriculum"
import { LESSON_GOALS } from "./levels"

export type Hit = { kind: "lesson" | "module" | "term"; id: string; title: string; sub: string }
const ALL: Hit[] = [
  ...COURSE.map(m => ({ kind: "module" as const, id: m.id, title: `Module ${m.num}: ${m.title}`, sub: m.summary })),
  ...allLessons.map(l => ({ kind: "lesson" as const, id: l.id, title: l.title, sub: `Module ${l.module.num}. ${LESSON_GOALS[l.id] || ""}` })),
  ...glossary.map(([k, v]) => ({ kind: "term" as const, id: k, title: k, sub: v })),
]
const LABEL = { lesson: "Lesson", module: "Module", term: "Term" }

export default function Search({ onClose, onPick }: { onClose: () => void; onPick: (h: Hit) => void }) {
  const [q, setQ] = useState(""), [sel, setSel] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => { input.current?.focus() }, [])
  const hits = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return ALL.filter(h => h.kind === "module").slice(0, 8)
    const words = t.split(/\s+/)
    return ALL.map(h => {
      const title = h.title.toLowerCase(), sub = h.sub.toLowerCase()
      if (!words.every(w => title.includes(w) || sub.includes(w))) return null
      const score = (title.startsWith(t) ? 0 : title.includes(t) ? 1 : words.every(w => title.includes(w)) ? 2 : 3) + (h.kind === "term" ? 0.5 : 0)
      return { h, score }
    }).filter(Boolean).sort((a, b) => a!.score - b!.score).slice(0, 12).map(x => x!.h)
  }, [q])
  useEffect(() => setSel(0), [q])
  const go = (h?: Hit) => { if (h) { onPick(h); onClose() } }
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-ink/40 px-4 pt-[12vh] backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-slate-200 px-4">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" strokeLinecap="round" /></svg>
          <input ref={input} value={q} onChange={e => setQ(e.target.value)} placeholder="Search lessons, modules and terms" aria-label="Search"
            className="h-14 flex-1 !border-0 bg-transparent text-lg !shadow-none !ring-0 focus:!outline-none"
            onKeyDown={e => {
              if (e.key === "ArrowDown") { e.preventDefault(); setSel(s => Math.min(s + 1, hits.length - 1)) }
              else if (e.key === "ArrowUp") { e.preventDefault(); setSel(s => Math.max(s - 1, 0)) }
              else if (e.key === "Enter") go(hits[sel])
              else if (e.key === "Escape") onClose()
            }} />
          <kbd className="rounded border border-slate-200 px-1.5 py-0.5 text-xs text-slate-400">esc</kbd>
        </div>
        <ul className="max-h-[50vh] overflow-y-auto py-2" role="listbox">
          {!q.trim() && <li className="px-4 pb-1 pt-1 text-xs text-slate-400">Modules</li>}
          {hits.map((h, i) => (
            <li key={h.kind + h.id} role="option" aria-selected={i === sel}>
              <button className={`block w-full px-4 py-2.5 text-left ${i === sel ? "bg-slate-100" : ""}`} onMouseEnter={() => setSel(i)} onClick={() => go(h)}>
                <div className="flex items-baseline gap-2"><span className="w-14 shrink-0 text-xs text-slate-400">{LABEL[h.kind]}</span><span className="font-medium text-ink">{h.title}</span></div>
                <div className="ml-16 line-clamp-2 text-sm text-slate-500">{h.sub}</div>
              </button>
            </li>))}
          {q.trim() && hits.length === 0 && <li className="px-4 py-6 text-center text-sm text-slate-500">Nothing matches "{q}". Try a shorter word, like "cap" or "loan".</li>}
        </ul>
        <div className="flex gap-4 border-t border-slate-100 px-4 py-2 text-xs text-slate-400"><span>↑ ↓ to move</span><span>Enter to open</span><span>In a lesson, ← → move between lessons</span></div>
      </div>
    </div>)
}
