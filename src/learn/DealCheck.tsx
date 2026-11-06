import { useEffect, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import { usd, type Deal } from "../lib/model"
import { saveCheck, listChecks, type CheckAnswers, type CheckRecord } from "../lib/store"
import { CHECKS, answerKey, scoreCheck, type Check } from "./checks"
import { Card } from "../components/ui"

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

  if (result) return <Result r={result} onBack={() => setResult(null)} onRetry={() => start(CHECKS.find(c => c.id === result.check_id)!)} />
  if (attempt) {
    const c = CHECKS.find(x => x.id === attempt.id)
    if (c) return <Run c={c} a={attempt} session={session} onQuit={quit}
      onOpen={onOpenInPro && (() => { const a = { ...attempt, usedWorkspace: true }; writeAttempt(a); setAttempt(a); onOpenInPro({ ...c.deal, name: `Deal Check: ${c.title}` }) })}
      onDone={r => { writeAttempt(null); setAttempt(null); setResult(r) }} />
  }

  return (
    <main className="mx-auto max-w-5xl space-y-4 px-4 py-6 md:px-8">
      <div className="rounded-lg bg-brand-900 p-6 text-white md:p-8">
        <div className="text-xs font-semibold uppercase tracking-wider text-brand-100">Deal Check</div>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl">Underwrite a deal against the clock</h1>
        <p className="mt-2 max-w-2xl text-white/80">You get a broker package. Work out year one NOI, the cap rate and DSCR, then decide whether it clears the buy box. Use paper, a calculator{onOpenInPro ? " or the Underwrite workspace" : ""}. The clock runs until you submit, and your score and time are saved.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {CHECKS.map(c => {
          const best = history.filter(h => h.check_id === c.id).sort((a, b) => b.score - a.score || a.seconds - b.seconds)[0]
          return (
            <div key={c.id} className="card flex flex-col">
              <div className="text-xs font-medium text-slate-500">Level {c.level} · {c.where}</div>
              <div className="mt-1 font-display text-lg font-semibold">{c.title}</div>
              <p className="mt-1 flex-1 text-sm text-slate-600">{c.pitch}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-slate-500">{best ? <>Best: <b className="text-ink">{best.score}</b> in {mmss(best.seconds)}</> : "Not tried yet"}</span>
                <button className="btn btn-primary" onClick={() => start(c)}>Start</button>
              </div>
            </div>)
        })}
      </div>
      {history.length > 0 && (
        <Card title="Your results">
          <table className="tbl"><thead><tr><th className="text-left">Deal</th><th>Score</th><th>Time</th><th>Used workspace</th><th>When</th></tr></thead><tbody>
            {history.slice(0, 12).map((h, i) => (
              <tr key={i}><td>{CHECKS.find(c => c.id === h.check_id)?.title || h.check_id}</td><td className="num text-right">{h.score}</td><td className="num text-right">{mmss(h.seconds)}</td>
                <td className="text-right">{h.used_workspace ? "Yes" : "No"}</td><td className="text-right text-slate-500">{new Date(h.created_at).toLocaleDateString()}</td></tr>))}
          </tbody></table>
        </Card>)}
    </main>
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
    <main className="mx-auto max-w-5xl space-y-4 px-4 py-6 md:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn" onClick={onQuit}>‹ Leave</button>
        <div>
          <div className="text-xs text-slate-500">Deal Check · Level {c.level}</div>
          <div className="font-display text-xl font-semibold">{c.title}, {c.where}</div>
        </div>
        <div className="num ml-auto rounded-lg bg-brand-900 px-4 py-2 text-lg font-semibold text-white">{mmss((now - a.start) / 1000)}</div>
      </div>
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
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-6 md:px-8">
      <div className="card text-center">
        <div className="text-xs text-slate-500">Deal Check · {c.title}</div>
        <div className="num mt-1 text-4xl font-semibold text-ink">{r.score}<span className="text-lg text-slate-400"> / 100</span></div>
        <div className="mt-1 text-sm text-slate-600">in {mmss(r.seconds)}{r.used_workspace ? ", using the workspace" : ""}</div>
      </div>
      <Card title="Your answers vs the key">
        <table className="tbl"><thead><tr><th className="text-left" /><th>You</th><th>Key</th><th /></tr></thead><tbody>
          {rows.map(([k, a, b, ok]) => <tr key={k}><td>{k}</td><td className="num text-right">{a}</td><td className="num text-right">{b}</td><td className={`text-right font-semibold ${ok ? "text-pass-600" : "text-fail-600"}`}>{ok ? "✓" : "✕"}</td></tr>)}
        </tbody></table>
        <p className="note mt-2">Full marks need NOI within 2%, cap rate within 0.10 points and DSCR within 0.03.</p>
      </Card>
      {tips.length > 0 && <Card title="Where to look"><ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">{tips.map(t => <li key={t}>{t}</li>)}</ul></Card>}
      <div className="flex gap-2"><button className="btn" onClick={onBack}>All deals</button><button className="btn btn-primary" onClick={onRetry}>Try again</button></div>
    </main>
  )
}
