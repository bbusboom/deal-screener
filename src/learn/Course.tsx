import { useEffect, useMemo, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import { COURSE, allLessons, glossary, type Block, type Module, type Lesson } from "./curriculum"
import { getProgress, saveProgress, getSession, type Progress } from "../lib/store"
import { StateSelect, StateSnapshot } from "../components/MarketPane"
import { useHomeState, setHomeState } from "../lib/market"
import { PRACTICE, norm } from "../lib/model"
import Photo from "./Photo"
import Diagram from "./Diagrams"
import Calc from "./Calc"
import AiPanel from "../components/AiPanel"

type View = { kind: "home" } | { kind: "lesson"; id: string } | { kind: "quiz"; id: string } | { kind: "glossary" }
const PASS = 0.8
const VIEW_KEY = "dealScreener.course.view"

function blockText(b: Block): string {
  if (b.t === "p" || b.t === "tip") return b.text
  if (b.t === "formula") return `${b.name}: ${b.f}`
  if (b.t === "example") return `${b.title}: ` + b.rows.map(r => `${r[0]} ${r[1]}`).join("; ")
  if (b.t === "terms") return b.items.map(([k, v]) => `${k}: ${v}`).join(" ")
  if (b.t === "photo") return `Photo: ${b.caption}`
  if (b.t === "state") return "Interactive card showing the user's home state: property tax rate, income tax, rent regulation, reassessment after a sale, and owner groups."
  return ""
}

function StateBlock() {
  const home = useHomeState()
  return (
    <div className="my-4 rounded-lg border border-brand-100 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="card-title !mb-0">Your state</div>
        <StateSelect value={home} onChange={v => { getSession().then(s => setHomeState(s, v)) }} />
      </div>
      <StateSnapshot abbr={home} learner />
    </div>
  )
}

function Blocks({ blocks }: { blocks: Block[] }) {
  return <>{blocks.map((b, i) => {
    if (b.t === "p") return <p key={i} className="my-3 text-[15.5px] leading-relaxed text-ink/90">{b.text}</p>
    if (b.t === "photo") return <Photo key={i} titles={b.titles} query={b.query} caption={b.caption} google={b.google} />
    if (b.t === "diagram") return <Diagram key={i} d={b.d} caption={b.caption} />
    if (b.t === "tip") return <div key={i} className="my-4 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[14.5px] text-amber-900"><span className="font-bold">Tip</span><span>{b.text}</span></div>
    if (b.t === "formula") return <div key={i} className="my-4 rounded-lg bg-brand-900 px-5 py-4 text-white"><div className="text-xs font-semibold uppercase tracking-wider text-brand-100">{b.name}</div><div className="mt-1 font-mono text-lg">{b.f}</div></div>
    if (b.t === "example") return (
      <div key={i} className="my-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="card-title !mb-2">Worked example · {b.title}</div>
        <table className="tbl"><tbody>{b.rows.map(([l, v, tot], k) => <tr key={k} className={tot ? "total" : ""}><td className="!whitespace-normal">{l}</td><td className="num">{v}</td></tr>)}</tbody></table>
      </div>)
    if (b.t === "terms") return (
      <div key={i} className="my-4 rounded-lg border border-slate-200 bg-white p-4">
        <div className="card-title !mb-2">Key terms</div>
        <dl className="space-y-2 text-sm">{b.items.map(([k, v]) => <div key={k}><dt className="inline font-semibold">{k}: </dt><dd className="inline text-slate-600">{v}</dd></div>)}</dl>
      </div>)
    if (b.t === "calc") return <Calc key={i} c={b.c} />
    if (b.t === "state") return <StateBlock key={i} />
    return null
  })}</>
}

function QuizView({ mod, onDone, onBack }: { mod: Module; onDone: (score: number) => void; onBack: () => void }) {
  const [qi, setQi] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const q = mod.quiz[qi], total = mod.quiz.length
  if (finished) {
    const pass = score / total >= PASS
    return (
      <div className="card text-center">
        <div className={`text-4xl font-bold ${pass ? "text-pass-600" : "text-amber-700"}`}>{score} / {total}</div>
        <p className="mt-2 text-slate-600">{pass ? `Module ${mod.num} complete. Nice work.` : `You need ${Math.ceil(total * PASS)} to complete the module. Review the lessons and try again; the explanations are the best part.`}</p>
        <div className="mt-5 flex justify-center gap-2">
          <button className="btn" onClick={() => { setQi(0); setPicked(null); setScore(0); setFinished(false) }}>Retake quiz</button>
          <button className="btn btn-primary" onClick={onBack}>Back to course</button>
        </div>
      </div>)
  }
  return (
    <div className="card">
      <div className="mb-1 flex items-center justify-between text-xs text-slate-500"><span>Module {mod.num} quiz</span><span>Question {qi + 1} of {total}</span></div>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-brand-500 transition-all" style={{ width: `${(qi / total) * 100}%` }} /></div>
      <h2 className="mb-4 text-lg font-semibold">{q.q}</h2>
      <div className="space-y-2">
        {q.options.map((o, k) => {
          const state = picked === null ? "" : k === q.answer ? "border-pass-600 bg-pass-50" : k === picked ? "border-fail-600 bg-fail-50" : "opacity-60"
          return <button key={k} disabled={picked !== null} onClick={() => { setPicked(k); if (k === q.answer) setScore(s => s + 1) }}
            className={`w-full rounded-lg border-2 border-slate-200 px-4 py-3 text-left text-[15px] transition hover:border-brand-500 disabled:hover:border-inherit ${state}`}>{o}</button>
        })}
      </div>
      {picked !== null && (
        <div className={`mt-4 rounded-lg px-4 py-3 text-[14.5px] ${picked === q.answer ? "bg-pass-50 text-pass-600" : "bg-amber-50 text-amber-900"}`}>
          <b>{picked === q.answer ? "Correct. " : "Not quite. "}</b>{q.why}
        </div>)}
      <div className="mt-5 flex justify-end">
        {picked !== null && <button className="btn btn-primary" onClick={() => { if (qi + 1 < total) { setQi(qi + 1); setPicked(null) } else { setFinished(true); onDone(score) } }}>{qi + 1 < total ? "Next question →" : "See results"}</button>}
      </div>
    </div>
  )
}

export default function Course({ session, onPractice }: { session: Session | null; onPractice: () => void }) {
  const [view, setView] = useState<View>(() => {
    try {
      const v = JSON.parse(sessionStorage.getItem(VIEW_KEY) || "null") as View | null
      if (v && (v.kind === "home" || v.kind === "glossary" || allLessons.some(l => l.id === (v as any).id) || COURSE.some(m => m.id === (v as any).id))) return v
    } catch {}
    return { kind: "home" }
  })
  useEffect(() => { try { sessionStorage.setItem(VIEW_KEY, JSON.stringify(view)) } catch {} }, [view])
  const [prog, setProg] = useState<Progress>({ lessons: {}, quizzes: {} })
  useEffect(() => { getProgress(session).then(setProg) }, [session?.user.id])
  useEffect(() => { scrollTo({ top: 0 }) }, [view])
  const update = (fn: (p: Progress) => Progress) => setProg(p => { const n = fn(p); saveProgress(session, n); return n })

  const lessonsDone = allLessons.filter(l => prog.lessons[l.id]).length
  const modsDone = COURSE.filter(m => prog.quizzes[m.id]?.passed).length
  const nextLesson = allLessons.find(l => !prog.lessons[l.id])
  const resume = (prog.last && allLessons.find(l => l.id === prog.last)) || nextLesson

  const lesson = view.kind === "lesson" ? allLessons.find(l => l.id === view.id)! : null
  const ctx = useMemo(() => lesson ? `Module ${lesson.module.num}: ${lesson.module.title}. Lesson: ${lesson.title}.\n` + lesson.blocks.map(blockText).filter(Boolean).join("\n") : "", [lesson?.id])

  /* ---------- home ---------- */
  if (view.kind === "home") return (
    <main className="mx-auto max-w-5xl px-4 py-6 md:px-8">
      <div className="rounded-lg bg-brand-900 p-6 text-white md:p-8">
        <div className="text-xs font-semibold uppercase tracking-wider text-brand-100">Deal School</div>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl">Learn to underwrite real estate</h1>
        <p className="mt-2 max-w-2xl text-white/80">Thirteen modules that take you from what investment real estate is to how markets, competition and new supply move a deal, and how an acquisitions team works. Real photos, diagrams, worked examples, a quiz after each module, and Deal School AI for any question.</p>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          {resume && <button className="btn border-white bg-white text-brand-700 hover:bg-brand-50" onClick={() => setView({ kind: "lesson", id: resume.id })}>{lessonsDone ? "Continue" : "Start"}: {resume.title} →</button>}
          <div className="text-sm text-white/80">{lessonsDone} of {allLessons.length} lessons · {modsDone} of {COURSE.length} modules complete</div>
        </div>
        <div className="mt-3 h-2 max-w-md overflow-hidden rounded-full bg-white/20"><div className="h-full bg-white" style={{ width: `${(lessonsDone / allLessons.length) * 100}%` }} /></div>
      </div>
      {lessonsDone < 3 && (
        <div className="card mt-4 flex items-center gap-4 !py-4">
          <img src="/founder-face.jpg?v=2" alt="Blake Busboom, founder of Deal School" className="h-14 w-14 shrink-0 rounded-full object-cover" />
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">From the founder</div>
            <p className="mt-0.5 text-sm text-ink">“I built Deal School so junior underwriters can learn the basics quickly, then use their own mistakes to get good fast.” <span className="text-slate-500">· Blake Busboom</span></p>
          </div>
        </div>)}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {COURSE.map(m => {
          const done = m.lessons.filter(l => prog.lessons[l.id]).length, qz = prog.quizzes[m.id]
          return (
            <div key={m.id} className="card flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div><div className="text-xs font-semibold uppercase tracking-wider text-brand-500">Module {m.num}</div><h2 className="text-lg font-bold">{m.title}</h2></div>
                {qz?.passed ? <span className="rounded-full bg-pass-50 px-2.5 py-1 text-xs font-semibold text-pass-600">✓ Complete</span> : done ? <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600">In progress</span> : null}
              </div>
              <p className="mt-1 text-sm text-slate-500">{m.summary}</p>
              <ul className="mt-3 flex-1 space-y-1">
                {m.lessons.map(l => <li key={l.id}><button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-slate-50" onClick={() => setView({ kind: "lesson", id: l.id })}>
                  <span className={`grid h-5 w-5 place-items-center rounded-full text-[11px] ${prog.lessons[l.id] ? "bg-pass-600 text-white" : "border border-slate-300 text-slate-400"}`}>{prog.lessons[l.id] ? "✓" : ""}</span>
                  <span className="flex-1">{l.title}</span><span className="text-xs text-slate-400">{l.minutes} min</span></button></li>)}
                <li><button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium text-brand-600 hover:bg-brand-50" onClick={() => setView({ kind: "quiz", id: m.id })}>
                  <span className="grid h-5 w-5 place-items-center rounded-full border border-brand-500 text-[11px]">?</span><span className="flex-1">Module quiz</span>
                  <span className="text-xs text-slate-400">{qz ? `best ${qz.best}/${qz.total}` : `${m.quiz.length} questions`}</span></button></li>
              </ul>
            </div>)
        })}
        {/* Practice and glossary fill the spot beside the last module when the count is odd; otherwise they get their own row. */}
        <div className={`flex flex-col gap-4 ${COURSE.length % 2 === 1 ? "" : "md:col-span-2 md:grid md:grid-cols-2"}`}>
          <button className="card flex-1 text-left hover:border-brand-500" onClick={onPractice}><div className="font-bold">Practice a deal →</div><p className="mt-1 text-sm text-slate-500">Underwrite Maple Court step by step, your own property, or uploaded documents, with the math shown at every step.</p></button>
          <button className="card flex-1 text-left hover:border-brand-500" onClick={() => setView({ kind: "glossary" })}><div className="font-bold">Glossary →</div><p className="mt-1 text-sm text-slate-500">Every term from the course in one place, {glossary.length} terms.</p></button>
        </div>
      </div>
    </main>)

  /* ---------- glossary ---------- */
  if (view.kind === "glossary") return (
    <main className="mx-auto max-w-3xl px-4 py-6 md:px-8">
      <button className="mb-3 text-sm text-brand-600 hover:underline" onClick={() => setView({ kind: "home" })}>← Course</button>
      <div className="card"><h1 className="mb-4 text-2xl font-bold">Glossary</h1>
        <dl className="divide-y divide-slate-100">{glossary.map(([k, v]) => <div key={k} className="py-2.5"><dt className="font-semibold">{k}</dt><dd className="text-sm text-slate-600">{v}</dd></div>)}</dl></div>
    </main>)

  /* ---------- quiz ---------- */
  if (view.kind === "quiz") {
    const m = COURSE.find(x => x.id === view.id)!
    return (
      <main className="mx-auto max-w-3xl px-4 py-6 md:px-8">
        <button className="mb-3 text-sm text-brand-600 hover:underline" onClick={() => setView({ kind: "home" })}>← Course</button>
        <QuizView key={m.id} mod={m} onBack={() => setView({ kind: "home" })} onDone={score => update(p => {
          const prev = p.quizzes[m.id], total = m.quiz.length, best = Math.max(score, prev?.best || 0)
          return { ...p, quizzes: { ...p.quizzes, [m.id]: { best, total, passed: best / total >= PASS } } }
        })} />
      </main>)
  }

  /* ---------- lesson ---------- */
  const l = lesson as Lesson & { module: Module }
  const idx = allLessons.findIndex(x => x.id === l.id)
  const prev = allLessons[idx - 1], next = allLessons[idx + 1]
  const lastInModule = !next || next.module.id !== l.module.id
  const finish = (go: View) => { update(p => ({ ...p, lessons: { ...p.lessons, [l.id]: true }, last: next?.id })); setView(go) }
  return (
    <main className="mx-auto max-w-6xl px-4 py-6 md:px-8">
      <div className="mb-3 flex flex-wrap items-center gap-1 text-sm text-slate-500">
        <button className="text-brand-600 hover:underline" onClick={() => setView({ kind: "home" })}>Course</button><span>›</span>
        <span>Module {l.module.num}: {l.module.title}</span>
      </div>
      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-1 text-sm">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Module {l.module.num}</div>
            {l.module.lessons.map(x => <button key={x.id} onClick={() => setView({ kind: "lesson", id: x.id })}
              className={`block w-full rounded-md px-2 py-1.5 text-left ${x.id === l.id ? "bg-brand-50 font-semibold text-brand-700" : "hover:bg-slate-100"}`}>{prog.lessons[x.id] ? "✓ " : ""}{x.title}</button>)}
            <button className="block w-full rounded-md px-2 py-1.5 text-left text-brand-600 hover:bg-brand-50" onClick={() => setView({ kind: "quiz", id: l.module.id })}>Module quiz</button>
          </div>
        </aside>
        <div className="min-w-0">
          <article className="card">
            <div className="text-xs font-semibold uppercase tracking-wider text-brand-500">Lesson {idx + 1} of {allLessons.length} · {l.minutes} min</div>
            <h1 className="mb-2 mt-1 text-2xl font-bold">{l.title}</h1>
            <Blocks blocks={l.blocks} />
            <div className="mt-6 flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-4">
              {prev ? <button className="btn" onClick={() => setView({ kind: "lesson", id: prev.id })}>← {prev.title}</button> : <span />}
              {lastInModule
                ? <button className="btn btn-primary" onClick={() => finish({ kind: "quiz", id: l.module.id })}>Take the module {l.module.num} quiz →</button>
                : <button className="btn btn-primary" onClick={() => finish({ kind: "lesson", id: next!.id })}>Next: {next!.title} →</button>}
            </div>
          </article>
          <div className="mt-5">
            <AiPanel key={l.id} storeKey={"lesson." + l.id} deal={norm(PRACTICE)} fixedRoute="learner" compact title="Ask Deal School about this lesson" context={ctx}
              greeting={`Questions about "${l.title}"? Ask anything, like "why do we subtract vacancy?" or "explain this like I'm new."`}
              reviewLabel="Explain this lesson another way" reviewPrompt={`Explain the main idea of the lesson "${l.title}" in a different way than the lesson did, with a simple everyday example, in under 150 words.`}
              onDeal={() => {}} />
          </div>
        </div>
      </div>
    </main>
  )
}
