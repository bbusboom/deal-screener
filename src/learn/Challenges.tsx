import { useEffect, useMemo, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import { getProgress, saveProgress, type Progress } from "../lib/store"
import { type Deal, project, usd, pct, xx } from "../lib/model"
import { stateBy, taxEstimate } from "../lib/states"
import { Card, Field, NumInput } from "../components/ui"
import AiPanel from "../components/AiPanel"
import { StateSnapshot } from "../components/MarketPane"
import { TRICKS, DUELS, DUEL_FIELDS, DUEL_LEVEL, fairPrice, trueDeal, rightCall, scoreDuel, type TrickPuzzle, type Duel, type Call, type DuelScore } from "./challenges"

type View = { k: "home" } | { k: "trick"; id: string } | { k: "duel"; id: string }

const Stars = ({ n, of = 3 }: { n: number; of?: number }) =>
  <span className="tracking-wider text-amber-500" aria-label={`${n} of ${of} stars`}>{"★".repeat(n)}<span className="text-slate-300">{"★".repeat(Math.max(0, of - n))}</span></span>

function record(p: Progress, id: string, score: number): Progress {
  const prev = p.challenges?.[id]
  return { ...p, challenges: { ...(p.challenges || {}), [id]: { best: Math.max(prev?.best ?? 0, score), tries: (prev?.tries ?? 0) + 1 } } }
}

/* ====================================================================== home */
function Home({ prog, open }: { prog: Progress; open: (v: View) => void }) {
  const c = prog.challenges || {}
  const stars = TRICKS.reduce((s, t) => s + (c[t.id]?.best ?? 0), 0)
  const duelPts = DUELS.reduce((s, d) => s + (c[d.id]?.best ?? 0), 0)
  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-brand-900 px-6 py-5 text-white">
        <div className="text-xl font-bold">Challenges</div>
        <p className="mt-1 max-w-2xl text-sm text-brand-100">Short, real situations where you make the call. Catch what sellers hide, decide on deals against the clock, and see what actually happened. Wrong answers are where the learning is.</p>
        <div className="mt-4 flex flex-wrap gap-6 text-sm">
          <div><div className="text-2xl font-bold">{stars}<span className="text-base text-brand-100"> / {TRICKS.length * 3}</span></div><div className="text-brand-100">trick stars</div></div>
          <div><div className="text-2xl font-bold">{duelPts}<span className="text-base text-brand-100"> / {DUELS.length * 100}</span></div><div className="text-brand-100">duel points</div></div>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-bold">Spot the seller's trick</h2>
        <p className="note mb-3">A real looking document with problems planted in it. Click every line you wouldn't trust, then check. Some odd looking lines are fine, so don't flag everything.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TRICKS.map(t => (
            <button key={t.id} onClick={() => open({ k: "trick", id: t.id })} className="rounded-lg border border-slate-200 bg-white p-4 text-left shadow-card transition hover:border-brand-500">
              <div className="flex items-center justify-between text-xs"><span className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">{t.doc}</span><span className="text-slate-400">{DUEL_LEVEL[t.level]}</span></div>
              <div className="mt-2 font-semibold">{t.title}</div>
              <div className="mt-2 text-sm">{c[t.id] ? <Stars n={c[t.id].best} /> : <span className="text-slate-400">Not tried yet</span>}</div>
            </button>))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold">Deal Duels</h2>
        <p className="note mb-3">A broker pitches you a deal. Read the clues, fix the seller's numbers, then pursue, renegotiate or pass. Scored out of 100 on your assumptions, your call and your offer.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DUELS.map(d => (
            <button key={d.id} onClick={() => open({ k: "duel", id: d.id })} className="rounded-lg border border-slate-200 bg-white p-4 text-left shadow-card transition hover:border-brand-500">
              <div className="flex items-center justify-between text-xs"><span className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">{stateBy(d.state)?.name}</span><span className="text-slate-400">{DUEL_LEVEL[d.level]} · {d.minutes} min</span></div>
              <div className="mt-2 font-semibold">{d.title}</div>
              <div className="text-xs text-slate-500">{d.seller.name} · {d.seller.units.reduce((s, u) => s + u.count, 0)} units · {usd(d.seller.price)}</div>
              <div className="mt-2 text-sm">{c[d.id] ? <><b>{c[d.id].best}</b><span className="text-slate-400"> / 100 best</span></> : <span className="text-slate-400">Not tried yet</span>}</div>
            </button>))}
        </div>
      </section>
    </div>
  )
}

/* ====================================================================== spot the trick */
function TrickPlayer({ t, onDone, onBack, onNext }: { t: TrickPuzzle; onDone: (stars: number) => void; onBack: () => void; onNext?: () => void }) {
  const [flags, setFlags] = useState<Set<number>>(new Set())
  const [checked, setChecked] = useState(false)
  useEffect(() => { setFlags(new Set()); setChecked(false); scrollTo({ top: 0 }) }, [t.id])
  const traps = t.rows.map((r, i) => r.trap ? i : -1).filter(i => i >= 0)
  const caught = traps.filter(i => flags.has(i)).length
  const falseFlags = [...flags].filter(i => !t.rows[i].trap).length
  const stars = caught === traps.length && falseFlags === 0 ? 3 : caught >= traps.length - 1 && falseFlags <= 1 ? 2 : caught > 0 ? 1 : 0
  const toggle = (i: number) => { if (checked || t.rows[i].total) return; setFlags(f => { const n = new Set(f); n.has(i) ? n.delete(i) : n.add(i); return n }) }
  const check = () => { setChecked(true); onDone(stars) }
  const context = `Challenge "Spot the seller's trick": ${t.title} (${t.doc}). ${t.setup}\nRows: ${t.rows.map(r => r.cells.join(" | ")).join("; ")}.` +
    (checked ? `\nThe user has checked. Traps: ${t.rows.filter(r => r.trap).map(r => r.cells[0] + ": " + r.trap).join(" ")} Lesson: ${t.lesson}` : "\nThe user hasn't checked yet: give hints, not answers.")

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <button className="text-sm text-brand-600" onClick={onBack}>← All challenges</button>
        <Card>
          <div className="flex flex-wrap items-center gap-2 text-xs"><span className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">{t.doc}</span><span className="text-slate-400">{DUEL_LEVEL[t.level]}</span></div>
          <h1 className="mt-1 text-xl font-bold">{t.title}</h1>
          <p className="mt-2 text-[15px] text-ink/90">{t.setup}</p>
          <div className="mt-4 overflow-x-auto">
            <table className="tbl">
              <thead><tr>{t.columns.map((c, i) => <th key={i} className={i ? "" : "!text-left"}>{c}</th>)}<th className="w-24"></th></tr></thead>
              <tbody>
                {t.rows.map((r, i) => {
                  const flagged = flags.has(i)
                  const state = !checked ? (flagged ? "bg-amber-50" : "") : r.trap ? (flagged ? "bg-pass-50" : "bg-fail-50") : flagged ? "bg-amber-50" : ""
                  const tag = !checked ? (flagged ? <span className="text-amber-700">⚑ flagged</span> : null)
                    : r.trap ? (flagged ? <span className="text-pass-600">✓ caught</span> : <span className="text-fail-600">✗ missed</span>)
                    : flagged ? <span className="text-amber-700">fine</span> : null
                  return (
                    <tr key={i} onClick={() => toggle(i)} className={`${r.total ? "total" : checked ? "" : "cursor-pointer hover:bg-slate-50"} ${state}`}>
                      {r.cells.map((c, k) => <td key={k} className={k ? "num" : "!whitespace-normal"}>{c}</td>)}
                      <td className="text-right text-xs font-semibold">{tag}</td>
                    </tr>)
                })}
              </tbody>
            </table>
          </div>
          {!checked ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button className="btn btn-primary" disabled={!flags.size} onClick={check}>Check my picks</button>
              <span className="note">{flags.size ? `${flags.size} flagged` : "Click a line to flag it."} There are {traps.length} real problems.</span>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className={`rounded-lg px-4 py-3 ${stars === 3 ? "bg-pass-50 text-pass-600" : stars === 0 ? "bg-fail-50 text-fail-600" : "bg-amber-50 text-amber-800"}`}>
                <div className="text-lg font-bold"><Stars n={stars} /> {caught} of {traps.length} caught{falseFlags ? `, ${falseFlags} false alarm${falseFlags > 1 ? "s" : ""}` : ""}</div>
                <div className="text-sm text-ink/80">{t.lesson}</div>
              </div>
              <div>
                <div className="card-title !mb-2">What each line was hiding</div>
                <ul className="space-y-2 text-sm">
                  {t.rows.map((r, i) => (r.trap || flags.has(i)) && !r.total ? (
                    <li key={i} className="flex gap-2"><span className={r.trap ? (flags.has(i) ? "text-pass-600" : "text-fail-600") : "text-amber-700"}>{r.trap ? (flags.has(i) ? "✓" : "✗") : "○"}</span>
                      <span><b>{r.cells[0]}{t.doc === "Rent roll" ? ` (${r.cells[1]})` : ""}.</b> {r.trap || r.note}</span></li>) : null)}
                </ul>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="card-title !mb-2">What it does to the deal</div>
                <table className="tbl"><tbody>{t.impact.map(([l, v, tot], k) => <tr key={k} className={tot ? "total" : ""}><td className="!whitespace-normal">{l}</td><td className="num">{v}</td></tr>)}</tbody></table>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="btn" onClick={() => { setFlags(new Set()); setChecked(false) }}>Try again</button>
                {onNext && <button className="btn btn-primary" onClick={onNext}>Next challenge →</button>}
              </div>
            </div>
          )}
        </Card>
      </div>
      <div className="lg:sticky lg:top-20 lg:self-start">
        <AiPanel key={t.id + String(checked)} deal={trueDeal(DUELS[0])} onDeal={() => {}} fixedRoute="learner" compact title="Ask Deal School" context={context}
          reviewLabel={checked ? "Explain what I missed" : "Give me a hint"} reviewPrompt={checked ? "Explain the problems I missed or flagged wrong, and how a pro would verify each one with the seller." : "Give me one hint about where to look, without telling me the answer."}
          greeting={checked ? "Want me to explain any of these, or show how a pro would check it with the seller?" : "Stuck? Ask me what to look for in a " + t.doc + " and I'll give you a hint without spoiling it."} />
      </div>
    </div>
  )
}

/* ====================================================================== deal duels */
function Kpis({ d, marketCap }: { d: Deal; marketCap: number }) {
  const p = project(d), fair = fairPrice(d)
  const cells: [string, string, boolean?][] = [
    ["NOI", usd(p.y1.noi)], ["Cap rate at asking", pct(p.y1.cap)], [`Value at a ${marketCap}% market cap`, usd(p.y1.noi / (marketCap / 100))],
    ["DSCR", xx(p.y1.dscr), p.y1.dscr >= 1.25], ["Cash on cash", pct(p.y1.coc), p.y1.coc >= 0.06],
    ["Price that hits 1.25 DSCR and 6% CoC", isFinite(fair) ? usd(fair) : "none"],
  ]
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {cells.map(([l, v, ok]) => (
        <div key={l} className={`rounded-lg border border-l-4 bg-white px-3 py-2 ${ok === undefined ? "border-l-slate-200" : ok ? "border-l-pass-600" : "border-l-fail-600"}`}>
          <div className="text-[11px] text-slate-500">{l}</div><div className="num font-semibold">{v}</div>
        </div>))}
    </div>
  )
}

function DuelPlayer({ x, onDone, onBack, onNext }: { x: Duel; onDone: (pts: number) => void; onBack: () => void; onNext?: () => void }) {
  const [step, setStep] = useState<"brief" | "work" | "reveal">("brief")
  const [mine, setMine] = useState<Deal>(x.seller)
  const [call, setCall] = useState<Call | null>(null)
  const [offer, setOffer] = useState(0)
  const [score, setScore] = useState<DuelScore | null>(null)
  const [start, setStart] = useState(Date.now())
  const [now, setNow] = useState(Date.now())
  const [frozen, setFrozen] = useState<number | null>(null)
  useEffect(() => { setStep("brief"); setMine(x.seller); setCall(null); setOffer(0); setScore(null); setFrozen(null); setStart(Date.now()); setNow(Date.now()); scrollTo({ top: 0 }) }, [x.id])
  useEffect(() => { if (step === "reveal") return; const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [step])
  const secs = frozen ?? Math.max(0, Math.floor((now - start) / 1000)), over = secs > x.minutes * 60
  const st = stateBy(x.state)
  const units = x.seller.units.reduce((s, u) => s + u.count, 0)
  const truth = useMemo(() => trueDeal(x), [x])
  const right = useMemo(() => rightCall(x), [x])
  const yourFair = useMemo(() => fairPrice(mine), [mine])
  useEffect(() => { if (call === "renegotiate" && !offer && isFinite(yourFair)) setOffer(Math.min(yourFair, x.seller.price)) }, [call])

  const submit = () => { if (!call) return; setFrozen(Math.max(0, Math.floor((Date.now() - start) / 1000))); const s = scoreDuel(x, mine, call, offer); setScore(s); setStep("reveal"); onDone(s.total) }
  const CALLS: [Call, string, string][] = [["pursue", "Pursue at asking", "It works at the seller's price."], ["renegotiate", "Renegotiate", "It works at a lower price. Name it."], ["pass", "Pass", "No reasonable price makes it work."]]
  const context = `Challenge "Deal Duel": ${x.title}, ${x.seller.name} in ${st?.name}, ${units} units, asking ${usd(x.seller.price)}. Pitch: ${x.pitch} Clues: ${x.clues.join(" ")} Seller's numbers: vacancy ${x.seller.vac}%, taxes ${usd(x.seller.tax)}, insurance ${usd(x.seller.ins)}, R&M ${usd(x.seller.rm)}, management ${x.seller.mgmt}%, reserves $${x.seller.res}/unit. Market cap ${x.marketCap}%. Loan 70% LTV at 6.5%, 30 year amortization.` +
    (step === "reveal" ? ` The user finished. Reality: vacancy ${truth.vac}%, taxes ${usd(truth.tax)}, insurance ${usd(truth.ins)}, R&M ${usd(truth.rm)}, management ${truth.mgmt}%, reserves $${truth.res}. Right call: ${right.call}${right.call === "renegotiate" ? " around " + usd(right.fair) : ""}. They chose ${call}${call === "renegotiate" ? " at " + usd(offer) : ""} and scored ${score?.total}/100. Outcome: ${x.outcome}` : " The user is still deciding: give hints and questions, not the answer.")

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button className="text-sm text-brand-600" onClick={onBack}>← All challenges</button>
          {step !== "reveal" && <span className={`num rounded-full px-3 py-1 text-sm font-semibold ${over ? "bg-fail-50 text-fail-600" : "bg-slate-100 text-slate-600"}`}>⏱ {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, "0")} / {x.minutes}:00</span>}
        </div>

        <Card>
          <div className="text-xs text-slate-400">{DUEL_LEVEL[x.level]} · {st?.name} · {units} units · asking {usd(x.seller.price)}</div>
          <h1 className="mt-1 text-xl font-bold">{x.title}</h1>
          <blockquote className="mt-3 border-l-4 border-brand-500 bg-brand-50 px-4 py-3 text-[15px] italic text-ink/90">{x.pitch}</blockquote>
          <div className="mt-4"><div className="card-title !mb-2">What you found in due diligence</div>
            <ul className="list-disc space-y-1 pl-5 text-sm">{x.clues.map(c => <li key={c}>{c}</li>)}</ul></div>
          {step === "brief" && <button className="btn btn-primary mt-4" onClick={() => setStep("work")}>Underwrite it →</button>}
        </Card>

        {step !== "brief" && (
          <Card title="Your underwriting">
            <p className="note mb-3">These start at the seller's numbers. Change anything you don't believe. Rents, other income, utilities, payroll and admin check out, and the loan is 70% LTV at 6.5% over 30 years.</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {DUEL_FIELDS.map(f => {
                const changed = (mine[f.k] as number) !== (x.seller[f.k] as number)
                return (
                  <Field key={f.k} label={f.label}>
                    <NumInput value={mine[f.k] as number} step={f.step} disabled={step === "reveal"} onChange={v => setMine(m => ({ ...m, [f.k]: v }))} className={changed ? "!border-brand-500" : ""} />
                    <span className="font-normal text-slate-400">Seller: {f.pct ? x.seller[f.k] + "%" : usd(x.seller[f.k] as number)}{step === "reveal" && score && score.fieldHits[f.k] !== undefined ? (score.fieldHits[f.k] ? " · ✓ close to reality" : ` · ✗ reality ${f.pct ? truth[f.k] + "%" : usd(truth[f.k] as number)}`) : ""}</span>
                  </Field>)
              })}
            </div>
            {st && (
              <details className="mt-4 rounded-lg border border-slate-200 p-3">
                <summary className="cursor-pointer text-sm font-semibold">Market check: {st.name}</summary>
                <div className="mt-3 space-y-3">
                  <div className="text-sm">Rough property tax for a rental on this price: <b>{usd(Math.round(taxEstimate(x.seller.price, st) / 100) * 100)}</b> a year.</div>
                  <StateSnapshot abbr={x.state} learner />
                </div>
              </details>)}
            <div className="mt-4"><Kpis d={mine} marketCap={x.marketCap} /></div>
          </Card>)}

        {step === "work" && (
          <Card title="Your call">
            <div className="grid gap-2 sm:grid-cols-3">
              {CALLS.map(([k, label, sub]) => (
                <button key={k} onClick={() => setCall(k)} className={`rounded-lg border p-3 text-left transition ${call === k ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:border-brand-500"}`}>
                  <div className="font-semibold">{label}</div><div className="text-xs text-slate-500">{sub}</div></button>))}
            </div>
            {call === "renegotiate" && <div className="mt-3 max-w-xs"><Field label="Your offer ($)"><NumInput value={offer} step={10000} onChange={setOffer} /></Field></div>}
            <button className="btn btn-primary mt-4" disabled={!call || (call === "renegotiate" && !offer)} onClick={submit}>Lock it in</button>
          </Card>)}

        {step === "reveal" && score && (() => {
          const s = project(x.seller), y = project(mine), r = project(truth)
          const rows: [string, (p: ReturnType<typeof project>) => string][] = [["NOI", p => usd(p.y1.noi)], ["Cap rate at asking", p => pct(p.y1.cap)], ["DSCR", p => xx(p.y1.dscr)], ["Cash on cash", p => pct(p.y1.coc)], [`Value at ${x.marketCap}% cap`, p => usd(p.y1.noi / (x.marketCap / 100))]]
          const label = { pursue: "Pursue at asking", renegotiate: "Renegotiate", pass: "Pass" }
          return (
            <Card>
              <div className={`rounded-lg px-4 py-3 ${score.total >= 80 ? "bg-pass-50 text-pass-600" : score.total >= 50 ? "bg-amber-50 text-amber-800" : "bg-fail-50 text-fail-600"}`}>
                <div className="text-2xl font-bold">{score.total} / 100</div>
                <div className="text-sm text-ink/80">Assumptions {score.assumptions}/50 · Call {score.decision}/30 · Offer {score.offer}/20 · {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, "0")} {over ? "(over time)" : ""}</div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 p-3"><div className="text-xs text-slate-500">Your call</div><div className="font-semibold">{label[call!]}{call === "renegotiate" ? ` at ${usd(offer)}` : ""}</div></div>
                <div className="rounded-lg border border-slate-200 p-3"><div className="text-xs text-slate-500">The right call</div><div className="font-semibold">{label[right.call]}{right.call === "renegotiate" ? ` near ${usd(right.fair)}` : ""}</div>
                  {right.call !== "pursue" && <div className="text-xs text-slate-500">{isFinite(right.fair) ? `It works at about ${usd(right.fair)}, ${pct(right.fair / x.seller.price - 1, 0)} vs asking.` : "No price makes it work."}</div>}</div>
              </div>
              {call === "pursue" && right.call !== "pursue" && <p className="mt-3 rounded-md bg-fail-50 px-3 py-2 text-sm text-fail-600">Paying asking would have cost about {usd(x.seller.price - (isFinite(right.fair) ? right.fair : 0))} more than the deal can support.</p>}
              <div className="mt-4 overflow-x-auto"><table className="tbl">
                <thead><tr><th className="!text-left"></th><th>Seller said</th><th>You said</th><th>Reality</th></tr></thead>
                <tbody>{rows.map(([l, f]) => <tr key={l}><td>{l}</td><td className="num">{f(s)}</td><td className="num">{f(y)}</td><td className="num font-semibold">{f(r)}</td></tr>)}</tbody>
              </table></div>
              <div className="mt-4"><div className="card-title !mb-1">What happened</div><p className="text-[15px]">{x.outcome}</p></div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="btn" onClick={() => { setStep("work"); setScore(null); setCall(null); setOffer(0); setMine(x.seller); setFrozen(null); setStart(Date.now()); setNow(Date.now()) }}>Try again</button>
                {onNext && <button className="btn btn-primary" onClick={onNext}>Next duel →</button>}
              </div>
            </Card>)
        })()}
      </div>
      <div className="lg:sticky lg:top-20 lg:self-start">
        <AiPanel key={x.id + step} deal={mine} onDeal={() => {}} fixedRoute="learner" compact title="Ask Deal School" context={context}
          reviewLabel={step === "reveal" ? "Explain my result" : "Give me a hint"} reviewPrompt={step === "reveal" ? "Explain my score: which assumptions I got wrong, why the right call was what it was, and what I should do differently next time." : "Give me one hint about which seller number to question first, without giving me the answer."}
          greeting={step === "reveal" ? "Want me to walk through what you missed, or how you'd pitch that offer to the broker?" : "I'm your deal partner. Ask what a clue means or where to look; I won't hand you the answer."} />
      </div>
    </div>
  )
}

/* ====================================================================== root */
export default function Challenges({ session }: { session: Session | null }) {
  const [prog, setProg] = useState<Progress>({ lessons: {}, quizzes: {} })
  const [view, setView] = useState<View>(() => {
    try {
      const v = JSON.parse(sessionStorage.getItem("dealScreener.challenges.view") || "null") as View | null
      if (v && (v.k === "home" || (v.k === "trick" && TRICKS.some(t => t.id === v.id)) || (v.k === "duel" && DUELS.some(d => d.id === v.id)))) return v
    } catch {}
    return { k: "home" }
  })
  useEffect(() => { try { sessionStorage.setItem("dealScreener.challenges.view", JSON.stringify(view)) } catch {} }, [view])
  useEffect(() => { getProgress(session).then(setProg) }, [session?.user.id])
  const done = (id: string, score: number) => setProg(p => { const n = record(p, id, score); saveProgress(session, n); return n })
  const open = (v: View) => { setView(v); scrollTo({ top: 0 }) }

  let body
  if (view.k === "trick") {
    const i = TRICKS.findIndex(t => t.id === view.id)
    body = <TrickPlayer t={TRICKS[i]} onDone={s => done(TRICKS[i].id, s)} onBack={() => open({ k: "home" })} onNext={i < TRICKS.length - 1 ? () => open({ k: "trick", id: TRICKS[i + 1].id }) : () => open({ k: "duel", id: DUELS[0].id })} />
  } else if (view.k === "duel") {
    const i = DUELS.findIndex(d => d.id === view.id)
    body = <DuelPlayer x={DUELS[i]} onDone={s => done(DUELS[i].id, s)} onBack={() => open({ k: "home" })} onNext={i < DUELS.length - 1 ? () => open({ k: "duel", id: DUELS[i + 1].id }) : undefined} />
  } else body = <Home prog={prog} open={open} />
  return <main className="mx-auto max-w-7xl px-4 py-5 md:px-8">{body}</main>
}
