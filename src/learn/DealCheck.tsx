import { useEffect, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import { usd, type Deal } from "../lib/model"
import { PENDING_CHECK, levelForCheck, CHECKPOINT_PASS } from "./levels"
import { saveCheck, listChecks, type CheckAnswers, type CheckRecord } from "../lib/store"
import { CHECKS, answerKey, scoreCheck, type Check } from "./checks"
import { Card } from "../components/ui"
import { PageHero, SitePhoto, SectionHead, WorkBar, CheckIcon, XIcon } from "../components/Site"

/* An attempt lives in sessionStorage so the clock keeps running if you leave the tab or open the deal in Underwrite. */
type Attempt = { id: string; start: number; usedWorkspace: boolean }
const ATTEMPT = "dealScreener.check.attempt"
const readAttempt = (): Attempt | null => { try { return JSON.parse(sessionStorage.getItem(ATTEMPT) || "null") } catch { return null } }
const writeAttempt = (a: Attempt | null) => { try { a ? sessionStorage.setItem(ATTEMPT, JSON.stringify(a)) : sessionStorage.removeItem(ATTEMPT) } catch {} }
const V = "!whitespace-normal text-right"
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`

export default function DealCheck({ session, onOpenInPro }: { session: Session | null; onOpenInPro?: (d: Deal) => void }) {
  const [attempt, setAttempt] = useState<Attempt | null>(readAttempt)
  const [result, setResult] = useState<CheckRecord | null>(null)
  const [history, setHistory] = useState<CheckRecord[]>([])
  useEffect(() => { listChecks(session).then(setHistory) }, [session?.user.id, result])

  const start = (c: Check) => { const a = { id: c.id, start: Date.now(), usedWorkspace: false }; writeAttempt(a); setAttempt(a); setResult(null); scrollTo({ top: 0 }) }
  const quit = () => { writeAttempt(null); setAttempt(null) }
  // Arriving from a course level checkpoint starts that deal, unless another attempt is already running.
  useEffect(() => {
    let id: string | null = null
    try { id = sessionStorage.getItem(PENDING_CHECK); sessionStorage.removeItem(PENDING_CHECK) } catch {}
    const c = id && CHECKS.find(x => x.id === id)
    if (c && !readAttempt()) start(c)
  }, [])

  if (result) return <Result r={result} onBack={() => setResult(null)} onRetry={() => start(CHECKS.find(c => c.id === result.check_id)!)} />
  if (attempt) {
    const c = CHECKS.find(x => x.id === attempt.id)
    if (c) return <Run c={c} a={attempt} session={session} onQuit={quit}
      onOpen={onOpenInPro && (() => { const a = { ...attempt, usedWorkspace: true }; writeAttempt(a); setAttempt(a); onOpenInPro({ ...c.deal, name: `Deal Check: ${c.title}` }) })}
      onDone={r => { writeAttempt(null); setAttempt(null); setResult(r) }} />
  }

  return (
    <div>
      <PageHero title="Deal Check" intro={<>You get a broker package. Work out year one NOI, the cap rate and DSCR, then decide whether it clears the buy box. Use paper, a calculator{onOpenInPro ? " or the Underwrite workspace" : ""}. The clock runs until you submit, and your score and time are saved.</>}
        aside={<SitePhoto titles={["File:Colvin Gardens Apartments, Buffalo, New York - 20220902.jpg"]} query="garden apartment complex" dark className="aspect-[16/10]" />} />
      <div className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
          <SectionHead title="The deals" intro={`Each one closes a level of the course. Score ${CHECKPOINT_PASS} or more to pass it.`} />
          <ol>
            {CHECKS.map((c, i) => {
              const best = history.filter(h => h.check_id === c.id).sort((a, b) => b.score - a.score || a.seconds - b.seconds)[0], lv = levelForCheck(c.id)
              return (
                <li key={c.id} className="grid gap-x-6 gap-y-3 border-b border-slate-200 py-7 sm:grid-cols-[48px_1fr_auto]">
                  <span className="font-serif text-4xl font-semibold leading-none text-slate-300">{i + 1}</span>
                  <div className="min-w-0">
                    <div className="text-sm text-slate-500">{lv ? `Level ${lv.num} checkpoint` : `Level ${c.level}`}, {c.where}</div>
                    <h3 className="mt-0.5 font-serif text-2xl font-semibold">{c.title}</h3>
                    <p className="mt-1.5 max-w-2xl leading-relaxed text-slate-600">{c.pitch}</p>
                    <div className="mt-3 text-sm text-slate-400">{best ? <>Best: <b className={best.score >= CHECKPOINT_PASS ? "text-pass-600" : "text-ink"}>{best.score}</b> in {mmss(best.seconds)}{best.score >= CHECKPOINT_PASS ? ", passed" : ""}</> : "Not tried yet"}</div>
                  </div>
                  <div className="sm:pt-6"><button className="rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800" onClick={() => start(c)}>{best ? "Try again" : "Start"}</button></div>
                </li>)
            })}
          </ol>
          {history.length > 0 && (
            <div className="mt-16">
              <SectionHead title="Your results" />
              <div className="overflow-x-auto">
                <table className="w-full text-sm"><thead><tr className="border-b border-slate-200 text-left text-slate-500"><th className="py-3 font-medium">Deal</th><th className="py-3 text-right font-medium">Score</th><th className="py-3 text-right font-medium">Time</th><th className="py-3 text-right font-medium">Used workspace</th><th className="py-3 text-right font-medium">When</th></tr></thead><tbody>
                  {history.slice(0, 12).map((h, i) => (
                    <tr key={i} className="border-b border-slate-100"><td className="py-3">{CHECKS.find(c => c.id === h.check_id)?.title || h.check_id}</td><td className="num py-3 text-right font-semibold">{h.score}</td><td className="num py-3 text-right">{mmss(h.seconds)}</td>
                      <td className="py-3 text-right">{h.used_workspace ? "Yes" : "No"}</td><td className="py-3 text-right text-slate-500">{new Date(h.created_at).toLocaleDateString()}</td></tr>))}
                </tbody></table>
              </div>
            </div>)}
        </div>
      </div>
    </div>
  )
}

function Run({ c, a, session, onQuit, onOpen, onDone }: { c: Check; a: Attempt; session: Session | null; onQuit: () => void; onOpen?: () => void; onDone: (r: CheckRecord) => void }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])
  const [f, setF] = useState({ noi: "", cap: "", dscr: "", verdict: "" as "" | "clears" | "misses" })
  const [busy, setBusy] = useState(false)
  const d = c.deal, units = d.units.reduce((s, u) => s + u.count, 0)
  const num = (v: string) => Number(v.replace(/[$,%x\s]/gi, ""))
  const ready = f.noi && f.cap && f.dscr && f.verdict && [f.noi, f.cap, f.dscr].every(v => isFinite(num(v)))

  async function submit() {
    if (!ready) return
    setBusy(true)
    const answers: CheckAnswers = { noi: Math.round(num(f.noi)), cap: num(f.cap), dscr: num(f.dscr), verdict: f.verdict as "clears" | "misses" }
    const key = answerKey(c), { score } = scoreCheck(answers, key)
    const rec = { check_id: c.id, seconds: Math.round((Date.now() - a.start) / 1000), used_workspace: a.usedWorkspace, answers, answer_key: key, score }
    await saveCheck(session, rec).catch(() => {})
    onDone({ ...rec, created_at: new Date().toISOString() })
  }

  const exp: [string, number][] = ([["Real estate taxes", d.tax], ["Insurance", d.ins], ["Utilities", d.util], ["Repairs & maintenance", d.rm], ["Turnover", d.turn], ["Contract services", d.contract], ["Payroll", d.pay], ["General & admin", d.adm], ["Marketing", d.mkt]] as [string, number][]).filter(([, v]) => v > 0)
  return (
    <div>
    <WorkBar back="Leave Deal Check" onBack={onQuit} eyebrow={`Deal Check${levelForCheck(c.id) ? `, Level ${levelForCheck(c.id)!.num} checkpoint` : ""}, ${c.where}`} title={c.title}
      right={<div className="text-right"><div className="text-xs text-white/50">Time</div><div className="num font-serif text-3xl font-semibold">{mmss((now - a.start) / 1000)}</div></div>} />
    <main className="mx-auto max-w-5xl space-y-4 px-4 py-8 md:px-8">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card title="Broker package">
          <p className="text-sm text-slate-600">{c.pitch}</p>
          <table className="tbl mt-3"><tbody>
            <tr className="head"><td>Units</td><td className="text-right">Count</td><td className="text-right">In place rent</td><td className="text-right">Market rent</td></tr>
            {d.units.map((u, i) => <tr key={i}><td>{u.type}</td><td className="num text-right">{u.count}</td><td className="num text-right">{usd(u.rent)}</td><td className="num text-right">{usd(u.market || u.rent)}</td></tr>)}
          </tbody></table>
          <table className="tbl mt-3"><tbody>
            <tr className="head"><td>Income assumptions</td><td /></tr>
            <tr><td>Other income</td><td className={V}>{usd(d.other)} per unit per month</td></tr>
            <tr><td>Physical vacancy</td><td className="num text-right">{d.vac}%</td></tr>
            {d.conc > 0 && <tr><td>Concessions</td><td className="num text-right">{d.conc}%</td></tr>}
            {d.bad > 0 && <tr><td>Bad debt</td><td className="num text-right">{d.bad}%</td></tr>}
            <tr className="head"><td>Expenses, year one</td><td /></tr>
            {exp.map(([k, v]) => <tr key={k}><td>{k}</td><td className="num text-right">{usd(v)}</td></tr>)}
            <tr><td>Management fee</td><td className={V}>{d.mgmt}% of effective gross income</td></tr>
            <tr><td>Replacement reserves</td><td className={V}>{usd(d.res)} per unit per year</td></tr>
            <tr className="head"><td>Price and loan</td><td /></tr>
            <tr><td>Asking price</td><td className={V}>{usd(d.price)} · {units} units</td></tr>
            <tr><td>Loan</td><td className={V}>{d.ltv}% of price at {d.rate}%, {d.amort} yr amortization{d.ioYrs ? `, ${d.ioYrs} yrs interest only` : ""}</td></tr>
            <tr className="head"><td>Buy box</td><td /></tr>
            <tr><td>Clears if</td><td className={V}>cap rate ≥ {d.minCap}% and DSCR ≥ {d.minDscr}x</td></tr>
          </tbody></table>
          <ul className="note mt-3 list-disc space-y-1 pl-5">
            {c.notes.map(n => <li key={n}>{n}</li>)}
            <li>Reserves count as an operating expense, the way lenders underwrite. Cap rate is year one NOI over the asking price.</li>
          </ul>
        </Card>
        <div className="space-y-4">
          <Card title="Your answers">
            <div className="space-y-3">
              <Ans label="Year one NOI ($)" v={f.noi} set={v => setF({ ...f, noi: v })} ph="e.g. 125000" />
              <Ans label="Cap rate (%)" v={f.cap} set={v => setF({ ...f, cap: v })} ph="e.g. 6.25" />
              <Ans label="Year one DSCR (x)" v={f.dscr} set={v => setF({ ...f, dscr: v })} ph="e.g. 1.30" />
              <div>
                <div className="mb-1 text-xs font-medium text-slate-600">Does it clear the buy box?</div>
                <div className="flex gap-2">
                  {(["clears", "misses"] as const).map(v => <button key={v} className={`btn flex-1 ${f.verdict === v ? "btn-primary" : ""}`} onClick={() => setF({ ...f, verdict: v })}>{v === "clears" ? "Clears" : "Misses"}</button>)}
                </div>
              </div>
              <button className="btn btn-gold w-full" disabled={!ready || busy} onClick={submit}>{busy ? "Saving…" : "Submit and see the answer"}</button>
            </div>
          </Card>
          {onOpen && <Card title="Want to use the workspace?">
            <p className="text-sm text-slate-600">Open this deal in Underwrite to work it there. The clock keeps running, and your result notes that you used the workspace. Come back to Learn › Deal Check to submit.</p>
            <button className="btn mt-3" onClick={onOpen}>Open in Underwrite</button>
          </Card>}
        </div>
      </div>
    </main>
    </div>
  )
}

function Ans({ label, v, set, ph }: { label: string; v: string; set: (v: string) => void; ph: string }) {
  return <label className="block"><div className="mb-1 text-xs font-medium text-slate-600">{label}</div><input inputMode="decimal" className="w-full" value={v} placeholder={ph} onChange={e => set(e.target.value)} /></label>
}

function Result({ r, onBack, onRetry }: { r: CheckRecord; onBack: () => void; onRetry: () => void }) {
  const c = CHECKS.find(x => x.id === r.check_id)!
  const { parts, noiOff } = scoreCheck(r.answers, r.answer_key)
  const rows: [string, string, string, boolean][] = [
    ["Year one NOI", usd(r.answers.noi), usd(r.answer_key.noi), parts.noi],
    ["Cap rate", r.answers.cap.toFixed(2) + "%", r.answer_key.cap.toFixed(2) + "%", parts.cap],
    ["DSCR", r.answers.dscr.toFixed(2) + "x", r.answer_key.dscr.toFixed(2) + "x", parts.dscr],
    ["Buy box", r.answers.verdict === "clears" ? "Clears" : "Misses", r.answer_key.verdict === "clears" ? "Clears" : "Misses", parts.verdict],
  ]
  const tips: string[] = []
  if (!parts.noi) tips.push(noiOff > 0
    ? "Your NOI is high. Check that management is a percent of effective gross income, that reserves are counted as an expense, and that vacancy and any concessions or bad debt are taken off rent."
    : "Your NOI is low. Check that other income is included and that vacancy is taken off gross potential rent only once.")
  if (!parts.cap && parts.noi) tips.push("Cap rate is year one NOI divided by the asking price, as a percent.")
  if (!parts.dscr) tips.push(c.deal.ioYrs ? "This loan is interest only in year one, so debt service is the loan amount times the rate." : "DSCR is NOI divided by a full year of loan payments. The loan is the price times the loan to value.")
  if (!parts.verdict) tips.push("A deal clears only if both tests pass. One failing test means it misses, even if the other looks strong.")
  return (
    <div>
    <WorkBar back="Deal Check" onBack={onBack} eyebrow="Deal Check result" title={c.title} />
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-8 md:px-8">
      <div className="card text-center">
        <div className="text-xs text-slate-500">Deal Check: {c.title}</div>
        <div className="num mt-1 text-4xl font-semibold text-ink">{r.score}<span className="text-lg text-slate-400"> / 100</span></div>
        <div className="mt-1 text-sm text-slate-600">in {mmss(r.seconds)}{r.used_workspace ? ", using the workspace" : ""}</div>
        {levelForCheck(c.id) && <div className={`mx-auto mt-3 inline-block rounded-full px-3 py-1 text-sm font-semibold ${r.score >= CHECKPOINT_PASS ? "bg-pass-50 text-pass-600" : "bg-amber-50 text-amber-800"}`}>
          {r.score >= CHECKPOINT_PASS ? `Level ${levelForCheck(c.id)!.num} checkpoint passed` : `Level ${levelForCheck(c.id)!.num} checkpoint needs ${CHECKPOINT_PASS} or more`}</div>}
      </div>
      <Card title="Your answers vs the key">
        <table className="tbl"><thead><tr><th className="text-left" /><th>You</th><th>Key</th><th /></tr></thead><tbody>
          {rows.map(([k, a, b, ok]) => <tr key={k}><td>{k}</td><td className="num text-right">{a}</td><td className="num text-right">{b}</td><td className={`text-right font-semibold ${ok ? "text-pass-600" : "text-fail-600"}`}>{ok ? <CheckIcon className="ml-auto h-4 w-4" label="Correct" /> : <XIcon className="ml-auto h-4 w-4" label="Wrong" />}</td></tr>)}
        </tbody></table>
        <p className="note mt-2">Full marks need NOI within 2%, cap rate within 0.10 points and DSCR within 0.03.</p>
      </Card>
      {tips.length > 0 && <Card title="Where to look"><ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">{tips.map(t => <li key={t}>{t}</li>)}</ul></Card>}
      <div className="flex gap-2"><button className="btn" onClick={onBack}>All deals</button><button className="btn btn-primary" onClick={onRetry}>Try again</button></div>
    </main>
    </div>
  )
}
