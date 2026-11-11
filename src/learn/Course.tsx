import { useEffect, useMemo, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import { COURSE, allLessons, glossary, type Block, type Module, type Lesson } from "./curriculum"
import { getProgress, saveProgress, getSession, listChecks, type Progress, type CheckRecord } from "../lib/store"
import { CHECKS } from "./checks"
import { StateSelect, StateSnapshot } from "../components/MarketPane"
import { useHomeState, setHomeState } from "../lib/market"
import { PRACTICE, norm } from "../lib/model"
import Photo from "./Photo"
import { SitePhoto } from "../components/Site"
import Diagram, { DiagramArt } from "./Diagrams"
import Calc from "./Calc"
import { withTerms } from "./Terms"
import AiPanel from "../components/AiPanel"
import { LEVELS, GUIDE, STEPS, LESSON_GOALS, COVER_ART, CHECKPOINT_PASS, PENDING_CHECK, levelOf, type Step, type Level } from "./levels"

type View = { kind: "home" } | { kind: "lesson"; id: string } | { kind: "quiz"; id: string } | { kind: "module"; id: string } | { kind: "glossary" }
const PASS = 0.8
const VIEW_KEY = "dealScreener.course.view"
const LEVEL_KEY = "dealScreener.course.level"

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
  const seen = new Set<string>()
  return <>{blocks.map((b, i) => {
    if (b.t === "p") return <p key={i} className="my-5 text-[17px] leading-[1.75] text-slate-700">{withTerms(b.text, seen)}</p>
    if (b.t === "photo") return <Photo key={i} titles={b.titles} query={b.query} caption={b.caption} google={b.google} />
    if (b.t === "diagram") return <Diagram key={i} d={b.d} caption={b.caption} />
    if (b.t === "tip") return <div key={i} className="my-6 border-l-4 border-[#f4b24c] bg-[#fff8eb] px-5 py-4 text-[16px] leading-relaxed text-[#5c3d0a]"><span className="mr-2 font-semibold">Tip:</span><span>{withTerms(b.text, seen)}</span></div>
    if (b.t === "formula") return <div key={i} className="my-4 rounded-lg bg-brand-900 px-5 py-4 text-white"><div className="text-sm text-white/60">{b.name}</div><div className="mt-1 font-mono text-lg">{b.f}</div></div>
    if (b.t === "example") return (
      <div key={i} className="my-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="mb-2 font-serif text-lg font-semibold">Worked example: {b.title}</div>
        <table className="tbl"><tbody>{b.rows.map(([l, v, tot], k) => <tr key={k} className={tot ? "total" : ""}><td className="!whitespace-normal">{l}</td><td className="num">{v}</td></tr>)}</tbody></table>
      </div>)
    if (b.t === "terms") return (
      <div key={i} className="my-4 rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-2 font-serif text-lg font-semibold">Key terms</div>
        <dl className="space-y-2 text-sm">{b.items.map(([k, v]) => <div key={k}><dt className="inline font-semibold">{k}: </dt><dd className="inline text-slate-600">{v}</dd></div>)}</dl>
      </div>)
    if (b.t === "calc") return <Calc key={i} c={b.c} />
    if (b.t === "state") return <StateBlock key={i} />
    return null
  })}</>
}

/** The underwriting roadmap with this module's steps lit up. */
function Roadmap({ steps, compact = false }: { steps: Step[] | "all"; compact?: boolean }) {
  const on = (k: Step) => steps === "all" || steps.includes(k)
  return (
    <ol className={`flex flex-wrap items-center gap-y-2 ${compact ? "text-[11px]" : "text-xs md:text-sm"}`}>
      {STEPS.map((s, i) => (
        <li key={s.key} className="flex items-center">
          <span className={`rounded-full px-2.5 py-1 font-semibold ${on(s.key) ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-400"}`}>{compact ? s.short : s.label}</span>
          {i < STEPS.length - 1 && <span className={`mx-1 ${on(s.key) && on(STEPS[i + 1].key) ? "text-brand-700" : "text-slate-300"}`}>→</span>}
        </li>))}
    </ol>)
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

export default function Course({ session, onPractice, onCheck }: { session: Session | null; onPractice: () => void; onCheck?: () => void }) {
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
  const [checks, setChecks] = useState<CheckRecord[]>([])
  useEffect(() => { listChecks(session).then(setChecks).catch(() => {}) }, [session?.user.id])
  const bestCheck = (id?: string) => id ? Math.max(-1, ...checks.filter(c => c.check_id === id).map(c => c.score)) : -1
  const quizzesDone = (x: Level) => x.modules.every(id => prog.quizzes[id]?.passed)
  const levelDone = (x: Level) => quizzesDone(x) && (!x.checkpoint || bestCheck(x.checkpoint) >= CHECKPOINT_PASS)
  const goCheck = (id: string) => { try { sessionStorage.setItem(PENDING_CHECK, id) } catch {}; onCheck?.() }
  useEffect(() => { scrollTo({ top: 0 }) }, [view])
  const [lvSel, setLvSel] = useState<{ id: string; back: boolean } | null>(() => { try { const id = sessionStorage.getItem(LEVEL_KEY); return id ? { id, back: false } : null } catch { return null } })
  const pickLevel = (id: string, back: boolean) => { setLvSel({ id, back }); try { sessionStorage.setItem(LEVEL_KEY, id) } catch {} }
  const update = (fn: (p: Progress) => Progress) => setProg(p => { const n = fn(p); saveProgress(session, n); return n })

  const lessonsDone = allLessons.filter(l => prog.lessons[l.id]).length
  const modsDone = COURSE.filter(m => prog.quizzes[m.id]?.passed).length
  const nextLesson = allLessons.find(l => !prog.lessons[l.id])
  const resume = (prog.last && allLessons.find(l => l.id === prog.last)) || nextLesson

  const lesson = view.kind === "lesson" ? allLessons.find(l => l.id === view.id)! : null
  const ctx = useMemo(() => lesson ? `Module ${lesson.module.num}: ${lesson.module.title}. Lesson: ${lesson.title}.\n` + lesson.blocks.map(blockText).filter(Boolean).join("\n") : "", [lesson?.id])

  const Crumbs = ({ items }: { items: [string, (() => void) | null][] }) => (
    <nav className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-white/60" aria-label="Breadcrumb">
      {items.map(([t, go], i) => <span key={i} className="flex items-center gap-1.5">{i > 0 && <span className="text-white/30">/</span>}
        {go ? <button className="hover:text-white" onClick={go}>{t}</button> : <span className="text-white/80">{t}</span>}</span>)}
    </nav>)

  /* ---------- home: where you are, then one level at a time ---------- */
  if (view.kind === "home") {
    const cur = resume || allLessons[allLessons.length - 1]
    const curMod = cur.module, curLv = levelOf(curMod.id)
    const lv = LEVELS.find(x => x.id === lvSel?.id) || curLv, lvIdx = LEVELS.indexOf(lv)
    const mods = lv.modules.map(id => COURSE.find(m => m.id === id)!).filter(Boolean)
    const inMod = curMod.lessons.findIndex(x => x.id === cur.id)
    const finished = !nextLesson && modsDone === COURSE.length
    const qd = quizzesDone(lv), ck = lv.checkpoint ? CHECKS.find(c => c.id === lv.checkpoint) : undefined, best = bestCheck(lv.checkpoint), lvDone = levelDone(lv)
    return (
      <div>
        {/* Full width band: the course and the one lesson to do next. */}
        <section className="bg-night text-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-12 pt-10 md:grid-cols-[1.1fr_1fr] md:px-8 md:pb-16 md:pt-14">
            <div>
              <h1 className="font-serif text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">Learn to underwrite real estate</h1>
              <p className="mt-4 max-w-md text-lg text-white/65">Four levels, from what a rent roll is to how an acquisitions team decides. Each one builds on the last.</p>
              <div className="mt-6 max-w-sm">
                <div className="flex justify-between text-sm text-white/55"><span>{lessonsDone} of {allLessons.length} lessons</span><span>{modsDone} of {COURSE.length} modules</span></div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/15"><div className="h-full bg-[#f4b24c]" style={{ width: `${(lessonsDone / allLessons.length) * 100}%` }} /></div>
              </div>
            </div>
            <div className="border-white/15 md:border-l md:pl-10">
              <div className="text-sm font-medium text-[#f4b24c]">{finished ? "Course complete" : lessonsDone ? "Up next for you" : "Start here"}</div>
              <div className="mt-3 text-sm text-white/55">Level {curLv.num}, {curLv.name} / Module {curMod.num}, {curMod.title}</div>
              <h2 className="mt-1 font-serif text-2xl font-semibold leading-snug md:text-3xl">{finished ? "You've finished every module" : cur.title}</h2>
              {!finished && LESSON_GOALS[cur.id] && <p className="mt-2 text-white/70">{LESSON_GOALS[cur.id]}</p>}
              {!finished && <p className="mt-2 text-sm text-white/45">Lesson {inMod + 1} of {curMod.lessons.length} in this module, then the quiz. About {cur.minutes} minutes.</p>}
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                {!finished && <button className="rounded-md bg-[#f4b24c] px-5 py-2.5 font-semibold text-[#1c1305] transition hover:bg-[#f7c574]" onClick={() => setView({ kind: "lesson", id: cur.id })}>{lessonsDone ? "Continue" : "Start the first lesson"}</button>}
                <button className="text-sm font-medium text-white/75 underline decoration-white/30 underline-offset-4 hover:text-white" onClick={() => setView({ kind: "module", id: curMod.id })}>About module {curMod.num}</button>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-white">
          <div className="mx-auto max-w-6xl px-4 md:px-8">
            {/* Levels as plain tabs. */}
            <nav className="-mx-4 flex gap-8 overflow-x-auto border-b border-slate-200 px-4 md:mx-0 md:px-0" aria-label="Levels">
              {LEVELS.map((x, i) => {
                const on = x.id === lv.id, done = levelDone(x)
                return (
                  <button key={x.id} onClick={() => pickLevel(x.id, i < lvIdx)} aria-current={on ? "page" : undefined}
                    className={`shrink-0 border-b-2 pb-4 pt-6 text-left transition ${on ? "border-ink" : "border-transparent hover:border-slate-300"}`}>
                    <div className={`text-xs ${on ? "text-slate-500" : "text-slate-400"}`}>Level {x.num}{done ? ", complete" : x.id === curLv.id ? ", you're here" : ""}</div>
                    <div className={`mt-0.5 font-serif text-lg font-semibold ${on ? "text-ink" : "text-slate-400"}`}>{x.name}</div>
                  </button>)
              })}
            </nav>

            <section key={lv.id} className={`py-10 ${lvSel?.back ? "page-in-back" : "page-in"}`}>
              <div className="grid gap-10 md:grid-cols-[1fr_340px]">
                <div>
                  <h2 className="font-serif text-3xl font-semibold tracking-tight">Level {lv.num}: {lv.name}</h2>
                  <p className="mt-3 max-w-2xl text-lg leading-relaxed text-slate-600">{lv.about}</p>
                  <div className="mt-6 grid max-w-2xl gap-6 sm:grid-cols-2">
                    <div><h3 className="font-semibold text-ink">Why it matters</h3><p className="mt-1 text-[15px] leading-relaxed text-slate-600">{lv.connects}</p></div>
                    <div><h3 className="font-semibold text-ink">When you finish</h3><p className="mt-1 text-[15px] leading-relaxed text-slate-600">{lv.outcome}</p></div>
                  </div>
                </div>
                <LevelPhoto id={lv.id} />
              </div>

              {/* Modules as a table of contents. */}
              <ol className="mt-10 border-t border-slate-200">
                {mods.map(m => {
                  const done = m.lessons.filter(l => prog.lessons[l.id]).length, qz = prog.quizzes[m.id], here = m.id === curMod.id && !finished
                  const ahead = !finished && COURSE.indexOf(m) > COURSE.indexOf(curMod) && !done && !qz
                  const mins = m.lessons.reduce((t, l) => t + l.minutes, 0)
                  const status = qz?.passed ? "Complete" : here ? "You're here" : done ? "In progress" : ahead ? "" : "Not started"
                  return (
                    <li key={m.id} className="border-b border-slate-200">
                      <button onClick={() => setView({ kind: "module", id: m.id })}
                        className={`group grid w-full gap-x-6 gap-y-3 py-7 text-left sm:grid-cols-[72px_1fr_200px] ${here ? "relative before:absolute before:-left-4 before:bottom-6 before:top-6 before:w-1 before:rounded before:bg-[#f4b24c] md:before:-left-6" : ""}`}>
                        <div className={`font-serif text-5xl font-semibold leading-none ${ahead ? "text-slate-200" : "text-slate-300 group-hover:text-[#e0a23a]"}`}>{String(m.num).padStart(2, "0")}</div>
                        <div className="min-w-0">
                          <h3 className={`font-serif text-2xl font-semibold leading-snug group-hover:underline group-hover:decoration-slate-300 group-hover:underline-offset-4 ${ahead ? "text-slate-500" : "text-ink"}`}>{m.title}</h3>
                          <p className={`mt-1.5 max-w-xl leading-relaxed ${ahead ? "text-slate-400" : "text-slate-600"}`}>{m.summary}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
                            <span>{m.lessons.length} lessons and a quiz</span><span>{mins} minutes</span>
                            {status && <span className={qz?.passed ? "font-medium text-pass-600" : here ? "font-medium text-[#b7791f]" : ""}>{qz?.passed ? "✓ " : ""}{status}</span>}
                          </div>
                        </div>
                        {COVER_ART[m.id] && <div aria-hidden className={`pointer-events-none hidden h-28 items-center justify-center overflow-hidden rounded-md bg-slate-50 p-3 sm:flex [&_svg]:max-h-full [&_svg]:w-auto [&_svg]:max-w-full ${ahead ? "opacity-50 grayscale" : ""}`}><DiagramArt d={COVER_ART[m.id]} /></div>}
                      </button>
                    </li>)
                })}
                {/* The level checkpoint closes the list. */}
                <li className="py-7">
                  <div className="grid gap-x-6 gap-y-3 sm:grid-cols-[72px_1fr_200px]">
                    <div className={`grid h-12 w-12 place-items-center rounded-full text-lg font-bold ${lvDone ? "bg-pass-600 text-white" : "bg-[#f4b24c] text-[#1c1305]"}`}>{lvDone ? "✓" : "★"}</div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[#b7791f]">Level {lv.num} checkpoint</div>
                      <h3 className="mt-0.5 font-serif text-2xl font-semibold leading-snug">{ck ? `Deal Check: ${ck.title}` : `Pass the Module ${lv.modules.map(id => COURSE.find(m => m.id === id)!.num).join(" and ")} quizzes`}</h3>
                      <p className="mt-1.5 max-w-xl leading-relaxed text-slate-600">{ck
                        ? `A timed broker package from ${ck.where}. Work out year one NOI, the cap rate and DSCR, and decide whether it clears the buy box. Score ${CHECKPOINT_PASS} or more, with every quiz in this level passed, to finish Level ${lv.num}.`
                        : `Level ${lv.num} has no math yet, so its quizzes are the checkpoint. The first Deal Check comes at the end of Level ${lv.num + 1}, once you can build NOI.`}</p>
                      <div className="mt-3 text-sm text-slate-400">Quizzes passed: {lv.modules.filter(id => prog.quizzes[id]?.passed).length} of {lv.modules.length}{ck ? <>, best score: {best >= 0 ? best : "not tried yet"}</> : null}</div>
                    </div>
                    <div className="flex items-start sm:justify-end">
                      {lvDone ? <span className="font-medium text-pass-600">Level {lv.num} complete</span>
                        : ck ? <button className={`rounded-md px-4 py-2 text-sm font-semibold transition ${qd ? "bg-ink text-white hover:bg-slate-800" : "border border-slate-300 text-ink hover:border-ink"}`} onClick={() => goCheck(ck.id)}>{best >= 0 ? "Try again" : "Start the checkpoint"}</button>
                        : null}
                    </div>
                  </div>
                </li>
              </ol>

              <div className="mt-4 flex items-center justify-between gap-4 text-sm font-medium">
                {lvIdx > 0 ? <button className="text-slate-500 hover:text-ink" onClick={() => pickLevel(LEVELS[lvIdx - 1].id, true)}>← Level {lvIdx}: {LEVELS[lvIdx - 1].name}</button> : <span />}
                {lvIdx < LEVELS.length - 1 ? <button className="text-ink hover:underline" onClick={() => pickLevel(LEVELS[lvIdx + 1].id, false)}>Level {lvIdx + 2}: {LEVELS[lvIdx + 1].name} →</button> : <span />}
              </div>
            </section>
          </div>
        </div>

        <section className="border-t border-slate-200 bg-[#f6f6f3]">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3 md:px-8">
            {lessonsDone < 3 ? (
              <div className="flex gap-4 md:col-span-1">
                <img src="/founder-face.jpg?v=2" alt="Blake Busboom" className="h-14 w-14 shrink-0 rounded-full object-cover" />
                <div><p className="font-serif text-lg leading-snug">“I built Underwriting Desk so junior underwriters can learn the basics quickly, then use their own mistakes to get good fast.”</p><p className="mt-2 text-sm text-slate-500">Blake Busboom, founder</p></div>
              </div>) : <div className="hidden md:block" />}
            <button className="text-left" onClick={onPractice}><h3 className="font-serif text-xl font-semibold hover:underline">Practice a deal →</h3><p className="mt-1 text-slate-600">Underwrite Maple Court step by step, your own property, or uploaded documents, with the math shown at every step.</p></button>
            <button className="text-left" onClick={() => setView({ kind: "glossary" })}><h3 className="font-serif text-xl font-semibold hover:underline">Glossary →</h3><p className="mt-1 text-slate-600">All {glossary.length} terms from the course in one place. In lessons, blue words show their definition when you hover or tap.</p></button>
          </div>
        </section>
      </div>)
  }

  /* ---------- module overview ---------- */
  if (view.kind === "module") {
    const m = COURSE.find(x => x.id === view.id)!, g = GUIDE[m.id], lv = levelOf(m.id)
    const prevM = COURSE[COURSE.indexOf(m) - 1], nextM = COURSE[COURSE.indexOf(m) + 1]
    const firstOpen = m.lessons.find(l => !prog.lessons[l.id]) || m.lessons[0]
    const mins = m.lessons.reduce((a, l) => a + l.minutes, 0), qz = prog.quizzes[m.id]
    return (
      <div key={m.id} className="page-in">
        <section className="bg-night text-white">
          <div className="mx-auto max-w-6xl px-4 pb-12 pt-8 md:px-8">
            <Crumbs items={[["Course", () => setView({ kind: "home" })], [`Level ${lv.num}: ${lv.name}`, () => { pickLevel(lv.id, false); setView({ kind: "home" }) }], [`Module ${m.num}`, null]]} />
            <div className="mt-8 grid gap-8 md:grid-cols-[1fr_300px] md:items-end">
              <div>
                <div className="font-serif text-6xl font-semibold leading-none text-white/20">{String(m.num).padStart(2, "0")}</div>
                <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight tracking-tight md:text-5xl">{m.title}</h1>
                <p className="mt-4 max-w-2xl text-lg text-white/70">{m.summary}</p>
                <p className="mt-3 text-sm text-white/45">{m.lessons.length} lessons, about {mins} minutes, and a {m.quiz.length} question quiz{qz?.passed ? ". Complete." : "."}</p>
                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <button className="rounded-md bg-[#f4b24c] px-5 py-2.5 font-semibold text-[#1c1305] hover:bg-[#f7c574]" onClick={() => setView({ kind: "lesson", id: firstOpen.id })}>{m.lessons.some(l => prog.lessons[l.id]) ? "Continue" : "Start"}: {firstOpen.title}</button>
                  <button className="text-sm font-medium text-white/75 underline decoration-white/30 underline-offset-4 hover:text-white" onClick={() => setView({ kind: "quiz", id: m.id })}>Go to the quiz</button>
                </div>
              </div>
              {COVER_ART[m.id] && <div aria-hidden className="hidden rounded-lg bg-white p-4 md:block [&_svg]:h-auto [&_svg]:w-full"><DiagramArt d={COVER_ART[m.id]} /></div>}
            </div>
          </div>
        </section>
        <div className="bg-white">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-12 md:grid-cols-[1fr_280px] md:px-8">
            <div className="min-w-0">
              <h2 className="font-serif text-2xl font-semibold">How it fits into underwriting</h2>
              <p className="mt-3 text-lg leading-relaxed text-slate-700">{g.why}</p>
              <div className="mt-5"><Roadmap steps={g.steps} /></div>

              <h2 className="mt-12 font-serif text-2xl font-semibold">What you'll be able to do</h2>
              <ul className="mt-4 space-y-3">{g.learn.map(t => <li key={t} className="flex gap-3 text-lg text-slate-700"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f4b24c]" /><span>{t}</span></li>)}</ul>

              <h2 className="mt-12 font-serif text-2xl font-semibold">Lessons</h2>
              <ol className="mt-4 border-t border-slate-200">
                {m.lessons.map((l, i) => <li key={l.id} className="border-b border-slate-200"><button className="group grid w-full grid-cols-[40px_1fr_auto] gap-4 py-5 text-left" onClick={() => setView({ kind: "lesson", id: l.id })}>
                  <span className={`font-serif text-2xl font-semibold ${prog.lessons[l.id] ? "text-pass-600" : "text-slate-300"}`}>{prog.lessons[l.id] ? "✓" : i + 1}</span>
                  <span className="min-w-0"><span className="block text-lg font-semibold group-hover:underline group-hover:underline-offset-4">{l.title}</span>{LESSON_GOALS[l.id] && <span className="mt-1 block leading-relaxed text-slate-600">{LESSON_GOALS[l.id]}</span>}</span>
                  <span className="pt-1 text-sm text-slate-400">{l.minutes} min</span></button></li>)}
                <li className="border-b border-slate-200"><button className="group grid w-full grid-cols-[40px_1fr_auto] gap-4 py-5 text-left" onClick={() => setView({ kind: "quiz", id: m.id })}>
                  <span className={`font-serif text-2xl font-semibold ${qz?.passed ? "text-pass-600" : "text-slate-300"}`}>{qz?.passed ? "✓" : "?"}</span>
                  <span className="min-w-0"><span className="block text-lg font-semibold group-hover:underline group-hover:underline-offset-4">Module quiz</span><span className="mt-1 block text-slate-600">{m.quiz.length} questions, each with an explanation. Score {Math.ceil(m.quiz.length * PASS)} or more to complete the module.</span></span>
                  <span className="pt-1 text-sm text-slate-400">{qz ? `best ${qz.best}/${qz.total}` : ""}</span></button></li>
              </ol>
            </div>
            <aside className="space-y-8 text-sm">
              <div>
                <h3 className="font-semibold text-ink">Level {lv.num}: {lv.name}</h3>
                <ol className="mt-3 space-y-2">{lv.modules.map(id => { const x = COURSE.find(c => c.id === id)!; return (
                  <li key={id}><button className={`text-left ${x.id === m.id ? "font-semibold text-ink" : "text-slate-500 hover:text-ink"}`} onClick={() => setView({ kind: "module", id })}>{x.num}. {x.title}{prog.quizzes[id]?.passed ? " ✓" : ""}</button></li>) })}</ol>
              </div>
              <div className="space-y-2 border-t border-slate-200 pt-6">
                {prevM && <button className="block text-left text-slate-500 hover:text-ink" onClick={() => setView({ kind: "module", id: prevM.id })}>← Builds on Module {prevM.num}: {prevM.title}</button>}
                {nextM && <button className="block text-left text-slate-500 hover:text-ink" onClick={() => setView({ kind: "module", id: nextM.id })}>Leads into Module {nextM.num}: {nextM.title} →</button>}
              </div>
            </aside>
          </div>
        </div>
      </div>)
  }

  /* ---------- glossary ---------- */
  if (view.kind === "glossary") return (
    <div className="page-in bg-white">
      <section className="bg-night text-white"><div className="mx-auto max-w-4xl px-4 pb-10 pt-8 md:px-8">
        <Crumbs items={[["Course", () => setView({ kind: "home" })], ["Glossary", null]]} />
        <h1 className="mt-6 font-serif text-4xl font-semibold">Glossary</h1>
        <p className="mt-2 text-white/65">Every term from the course, {glossary.length} in all.</p>
      </div></section>
      <dl className="mx-auto max-w-4xl divide-y divide-slate-200 px-4 py-8 md:px-8">{glossary.map(([k, v]) => <div key={k} className="grid gap-1 py-4 sm:grid-cols-[240px_1fr] sm:gap-6"><dt className="font-serif text-lg font-semibold">{k}</dt><dd className="leading-relaxed text-slate-600">{v}</dd></div>)}</dl>
    </div>)

  /* ---------- quiz ---------- */
  if (view.kind === "quiz") {
    const m = COURSE.find(x => x.id === view.id)!
    return (
      <div className="page-in">
        <section className="bg-night text-white"><div className="mx-auto max-w-3xl px-4 pb-8 pt-8 md:px-8">
          <Crumbs items={[["Course", () => setView({ kind: "home" })], [`Module ${m.num}: ${m.title}`, () => setView({ kind: "module", id: m.id })], ["Quiz", null]]} />
          <h1 className="mt-6 font-serif text-3xl font-semibold">Module {m.num} quiz</h1>
        </div></section>
        <main className="mx-auto max-w-3xl px-4 py-8 md:px-8">
          <QuizView key={m.id} mod={m} onBack={() => setView({ kind: "module", id: m.id })} onDone={score => update(p => {
            const prev = p.quizzes[m.id], total = m.quiz.length, best = Math.max(score, prev?.best || 0)
            return { ...p, quizzes: { ...p.quizzes, [m.id]: { best, total, passed: best / total >= PASS } } }
          })} />
        </main>
      </div>)
  }

  /* ---------- lesson: a reading page ---------- */
  const l = lesson as Lesson & { module: Module }
  const idx = allLessons.findIndex(x => x.id === l.id), inM = l.module.lessons.findIndex(x => x.id === l.id)
  const prev = allLessons[idx - 1], next = allLessons[idx + 1]
  const lastInModule = !next || next.module.id !== l.module.id
  const finish = (go: View) => { update(p => ({ ...p, lessons: { ...p.lessons, [l.id]: true }, last: next?.id })); setView(go) }
  const lv = levelOf(l.module.id)
  return (
    <div key={l.id} className="page-in bg-white">
      <section className="border-b border-slate-200 bg-[#f6f6f3]">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 md:px-8">
          <nav className="flex flex-wrap items-center gap-x-1.5 text-sm text-slate-500" aria-label="Breadcrumb">
            <button className="hover:text-ink" onClick={() => setView({ kind: "home" })}>Course</button><span className="text-slate-300">/</span>
            <button className="hover:text-ink" onClick={() => { pickLevel(lv.id, false); setView({ kind: "home" }) }}>Level {lv.num}</button><span className="text-slate-300">/</span>
            <button className="hover:text-ink" onClick={() => setView({ kind: "module", id: l.module.id })}>Module {l.module.num}: {l.module.title}</button>
          </nav>
          <div className="mt-8 max-w-3xl">
            <div className="text-sm text-slate-500">Lesson {inM + 1} of {l.module.lessons.length}, {l.minutes} minute read</div>
            <h1 className="mt-2 font-serif text-4xl font-semibold leading-tight tracking-tight md:text-[2.75rem]">{l.title}</h1>
            {LESSON_GOALS[l.id] && <p className="mt-3 text-lg text-slate-600">{LESSON_GOALS[l.id]}</p>}
          </div>
        </div>
      </section>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:px-8 lg:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[200px_minmax(0,1fr)_300px]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 text-sm">
            <button className="font-semibold text-ink hover:underline" onClick={() => setView({ kind: "module", id: l.module.id })}>Module {l.module.num}</button>
            <ol className="mt-3 space-y-1 border-l border-slate-200">
              {l.module.lessons.map(x => <li key={x.id}><button onClick={() => setView({ kind: "lesson", id: x.id })}
                className={`-ml-px block w-full border-l-2 py-1.5 pl-3 text-left ${x.id === l.id ? "border-ink font-semibold text-ink" : "border-transparent text-slate-500 hover:text-ink"}`}>{x.title}{prog.lessons[x.id] ? " ✓" : ""}</button></li>)}
              <li><button className="-ml-px block w-full border-l-2 border-transparent py-1.5 pl-3 text-left text-slate-500 hover:text-ink" onClick={() => setView({ kind: "quiz", id: l.module.id })}>Module quiz</button></li>
            </ol>
          </div>
        </aside>
        <article className="min-w-0 max-w-[44rem] [&_h2]:font-serif">
          <Blocks blocks={l.blocks} />
          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6">
            {prev ? <button className="text-sm text-slate-500 hover:text-ink" onClick={() => setView({ kind: "lesson", id: prev.id })}>← {prev.title}</button> : <span />}
            {lastInModule
              ? <button className="rounded-md bg-ink px-5 py-2.5 font-semibold text-white hover:bg-slate-800" onClick={() => finish({ kind: "quiz", id: l.module.id })}>Done. Take the module {l.module.num} quiz →</button>
              : <button className="rounded-md bg-ink px-5 py-2.5 font-semibold text-white hover:bg-slate-800" onClick={() => finish({ kind: "lesson", id: next!.id })}>Next: {next!.title} →</button>}
          </div>
        </article>
        <aside className="min-w-0 lg:col-span-2 xl:col-span-1">
          <div className="xl:sticky xl:top-24">
            <AiPanel key={l.id} storeKey={"lesson." + l.id} deal={norm(PRACTICE)} fixedRoute="learner" compact title="Ask the Desk about this lesson" context={ctx}
              greeting={`Questions about "${l.title}"? Ask anything, like "why do we subtract vacancy?" or "explain this like I'm new."`}
              reviewLabel="Explain this lesson another way" reviewPrompt={`Explain the main idea of the lesson "${l.title}" in a different way than the lesson did, with a simple everyday example, in under 150 words.`}
              onDeal={() => {}} />
          </div>
        </aside>
      </div>
    </div>
  )
}

/** One real photo per level, from Wikimedia Commons with credit. */
const LEVEL_PHOTOS: Record<string, [string[], string]> = {
  L1: [["File:Colvin Gardens Apartments, Buffalo, New York - 20220902.jpg"], "garden apartment complex"],
  L2: [["File:Sepulveda Rose Apartments Pool.jpg"], "apartment complex United States"],
  L3: [["File:Suburbia by David Shankbone.jpg"], "suburban neighborhood aerial"],
  L4: [["File:Reston, Virginia (14311563988).jpg"], "suburban office building"],
}
function LevelPhoto({ id }: { id: string }) {
  const p = LEVEL_PHOTOS[id]
  return <div className="hidden md:block">{p && <SitePhoto titles={p[0]} query={p[1]} />}</div>
}
