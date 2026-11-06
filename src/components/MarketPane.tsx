import { useEffect, useMemo, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import { type Deal, usd, pct } from "../lib/model"
import { STATES, stateBy, RENT_LABEL, DEFAULT_REASSESS } from "../lib/states"
import { marketChecks, fetchMarket, cachedMarket, fetchBriefing, cachedBriefing, setHomeState, useHomeState, type MarketData, type Briefing, type Level } from "../lib/market"
import { Card, Field } from "./ui"
import { mdLite } from "./AiPanel"

const DOT: Record<Level, string> = { ok: "bg-pass-600", watch: "bg-amber-500", flag: "bg-fail-600", info: "bg-slate-400" }
const n0 = (v: number | null | undefined) => v == null ? "—" : Math.round(v).toLocaleString("en-US")
const $ = (v: number | null | undefined) => v == null ? "—" : usd(v)
const pc = (v: number | null | undefined, dp = 1) => v == null ? "—" : pct(v, dp)

export function StateSelect({ value, onChange, className = "" }: { value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className={className}>
      <option value="">Choose a state…</option>
      {STATES.map(s => <option key={s.abbr} value={s.abbr}>{s.name}</option>)}
    </select>
  )
}

/** The state profile: taxes, rent rules, reassessment and groups. Used in Market check and in the course. */
export function StateSnapshot({ abbr, learner }: { abbr: string; learner?: boolean }) {
  const st = stateBy(abbr)
  if (!st) return <div className="note">Pick a state to see how it treats rental owners.</div>
  const rentTone = st.rent === "preempted" ? "text-pass-600" : st.rent === "allowed" ? "text-slate-700" : "text-amber-700"
  return (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div className="rounded-lg bg-slate-50 p-3"><div className="text-xs text-slate-500">Property tax (owner homes)</div><div className="num text-lg font-semibold">{st.propTax.toFixed(2)}%</div><div className="text-[11px] text-slate-400">{st.rentalTax ? `rentals: about ${st.rentalTax}% of value` : "of value per year; rentals often pay more"}</div></div>
        <div className="rounded-lg bg-slate-50 p-3"><div className="text-xs text-slate-500">Top income tax</div><div className="num text-lg font-semibold">{st.incomeTax ? st.incomeTax + "%" : "None"}</div><div className="text-[11px] text-slate-400">on your share of the profits</div></div>
        <div className="col-span-2 rounded-lg bg-slate-50 p-3 sm:col-span-1"><div className="text-xs text-slate-500">Rent regulation</div><div className={`font-semibold ${rentTone}`}>{RENT_LABEL[st.rent]}</div></div>
      </div>
      {st.rentCap && <p><b>Rent cap. </b>{st.rentCap}</p>}
      {st.rentNote && <p><b>Rent rules. </b>{st.rentNote}</p>}
      <p><b>Taxes after you buy. </b>{st.reassess || DEFAULT_REASSESS}</p>
      {learner && <p className="text-slate-600">Why it matters: taxes are often the biggest expense after payroll, and rent rules decide how fast income can grow. Both change what a property is worth to you.</p>}
      <p><b>Who shapes policy. </b>
        {st.groups?.length ? st.groups.map((g, i) => <span key={g.name}>{i ? ", " : ""}{g.url ? <a className="text-brand-600 underline" href={g.url} target="_blank" rel="noreferrer">{g.name}</a> : g.name}</span>) : "The state apartment association"}
        {" "}speaks for owners (find yours through the <a className="text-brand-600 underline" href="https://naahq.org" target="_blank" rel="noreferrer">National Apartment Association</a>); tenant advocacy groups and the state legislature shape the other side. The policy briefing covers both.</p>
    </div>
  )
}

function BriefingBox({ state, city, route }: { state: string; city: string; route: "learner" | "pro" }) {
  const [b, setB] = useState<Briefing | null>(() => cachedBriefing(state, city, route))
  const [busy, setBusy] = useState(false), [err, setErr] = useState("")
  useEffect(() => { setB(cachedBriefing(state, city, route)); setErr("") }, [state, city, route])
  async function run() {
    setBusy(true); setErr("")
    try { setB(await fetchBriefing(state, city, route)) } catch (e: any) { setErr(e.message) } finally { setBusy(false) }
  }
  const st = stateBy(state)
  return (
    <Card title="Policy briefing" right={st && <button className="btn" disabled={busy} onClick={run}>{busy ? "Researching…" : b ? "Refresh" : `Brief me on ${st.name}`}</button>}>
      {!st ? <div className="note">Pick a state first.</div>
        : !b && !busy ? <div className="note">Deal School searches the web for who holds office in {st.name}, the rental laws in force, bills and ballot measures that are moving, and what owner groups and tenant advocates are saying, then turns it into changes for your model. It's neutral: it reports each side, it doesn't take one. Takes about 30 seconds.</div>
        : busy ? <div className="note">Searching current sources for {st.name}{city ? `, ${city}` : ""}…</div> : null}
      {err && <div className="mt-2 rounded-md bg-fail-50 px-3 py-2 text-sm text-fail-600">{err}</div>}
      {b && !busy && (
        <div className="mt-1 text-sm leading-relaxed">
          <div className="note mb-2">As of {b.asOf}{b.city ? ` · ${b.city}` : ""} · saved for a week</div>
          <div dangerouslySetInnerHTML={{ __html: mdLite(b.text) }} />
          {b.sources.length > 0 && (
            <div className="mt-3 border-t border-slate-100 pt-2">
              <div className="card-title !mb-1">Sources</div>
              <ul className="space-y-0.5 text-xs">{b.sources.map(s => <li key={s.url}><a className="text-brand-600 underline" href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}</ul>
            </div>)}
        </div>)}
    </Card>
  )
}

function LiveData({ m }: { m: MarketData }) {
  const c = m.census, h = m.hud, r = m.rates, j = m.jobs, f = m.flood
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {c && (
        <Card title="Neighborhood (ZIP)">
          <table className="tbl"><tbody>
            <tr><td>Population</td><td className="num">{n0(c.population)}{c.popGrowth5y != null && <span className="text-slate-400"> ({c.popGrowth5y >= 0 ? "+" : ""}{pc(c.popGrowth5y)} since {c.compareYear})</span>}</td></tr>
            <tr><td>Median household income</td><td className="num">{$(c.medianIncome)}</td></tr>
            <tr><td>Median gross rent</td><td className="num">{$(c.medianRent)}{c.rentGrowth5y != null && <span className="text-slate-400"> ({c.rentGrowth5y >= 0 ? "+" : ""}{pc(c.rentGrowth5y)} since {c.compareYear})</span>}</td></tr>
            <tr><td>Renters (share of households)</td><td className="num">{pc(c.renterShare, 0)}</td></tr>
            <tr><td>Rental vacancy</td><td className="num">{pc(c.rentalVacancy)}</td></tr>
            <tr><td>Median home value</td><td className="num">{$(c.medianHomeValue)}</td></tr>
            <tr><td>Effective property tax (owner homes)</td><td className="num">{pc(c.effectiveTaxRate, 2)}</td></tr>
            <tr><td>Median year built</td><td className="num">{c.medianYearBuilt ?? "—"}</td></tr>
          </tbody></table>
          <div className="note mt-2">{c.source}. Survey averages lag the market by a year or two.</div>
        </Card>)}
      <div className="space-y-4">
        {f && <Card title="Flood risk"><div className="text-sm">{f.zone ? <>FEMA zone <b>{f.zone}</b>{f.subtype ? ` · ${f.subtype.toLowerCase()}` : ""}. {f.sfha ? "Inside the 100 year floodplain: flood insurance is required for federally backed loans." : "Outside the 100 year floodplain."}</> : f.note}</div><div className="note mt-1">{f.source}. Screening only, not a certified determination.</div></Card>}
        {h && <Card title="HUD Fair Market Rents"><table className="tbl"><tbody>
          {([["Studio", h.studio], ["1 bed", h.oneBed], ["2 bed", h.twoBed], ["3 bed", h.threeBed], ["4 bed", h.fourBed]] as const).map(([k, v]) => <tr key={k}><td>{k}</td><td className="num">{$(v)}</td></tr>)}
        </tbody></table><div className="note mt-1">{h.source}{h.area ? ` · ${h.area}` : ""}{h.smallArea ? " · ZIP level" : ""}. What a voucher program pays near the 40th percentile; your rents above it is normal for nicer units.</div></Card>}
        {j && <Card title="Jobs"><div className="text-sm">County unemployment <b>{j.unemployment}%</b> in {j.period}{j.yearAgo != null ? `, vs ${j.yearAgo}% a year earlier` : ""}.</div><div className="note mt-1">{j.source}{m.location?.countyName ? ` · ${m.location.countyName}` : ""}</div></Card>}
        {r && <Card title="Interest rates today"><table className="tbl"><tbody>
          {r.treasury10 && <tr><td>10 year Treasury</td><td className="num">{r.treasury10.value.toFixed(2)}% <span className="text-slate-400">({r.treasury10.date})</span></td></tr>}
          {r.sofr && <tr><td>SOFR (floating loans)</td><td className="num">{r.sofr.value.toFixed(2)}% <span className="text-slate-400">({r.sofr.date})</span></td></tr>}
          {r.mortgage30 && <tr><td>30 year home mortgage</td><td className="num">{r.mortgage30.value.toFixed(2)}% <span className="text-slate-400">({r.mortgage30.date})</span></td></tr>}
        </tbody></table><div className="note mt-1">{r.source}. Fixed rate apartment loans are usually priced as a spread over the 10 year Treasury; floating loans over SOFR.</div></Card>}
      </div>
    </div>
  )
}

export default function MarketPane({ d, set, session, route = "pro" }: { d: Deal; set: (p: Partial<Deal>) => void; session: Session | null; route?: "learner" | "pro" }) {
  const home = useHomeState()
  useEffect(() => { if (!d.state && home) set({ state: home }) }, [home])
  const st = stateBy(d.state)
  const [m, setM] = useState<MarketData | null>(() => cachedMarket(d))
  const [busy, setBusy] = useState(false), [err, setErr] = useState("")
  const checks = useMemo(() => marketChecks(d, st, m), [d, st, m])
  const city = ((d.address || "").split(",").slice(-2, -1)[0] || "").trim()

  async function pull() {
    setBusy(true); setErr("")
    try { setM(await fetchMarket(d)) } catch (e: any) { setErr(e.message) } finally { setBusy(false) }
  }

  return (
    <div className="space-y-4">
      <Card title="Where is the property?">
        <div className="grid gap-3 sm:grid-cols-[1fr_2fr_120px]">
          <Field label="State"><StateSelect value={d.state || ""} onChange={v => { set({ state: v }); if (!home && v) setHomeState(session, v) }} /></Field>
          <Field label="Street address (for flood, HUD rents and county jobs)"><input value={d.address || ""} placeholder="123 Main St, Fayetteville, AR" onChange={e => set({ address: e.target.value })} /></Field>
          <Field label="ZIP"><input value={d.zip || ""} inputMode="numeric" maxLength={5} placeholder="72701" onChange={e => set({ zip: e.target.value.replace(/\D/g, "").slice(0, 5) })} /></Field>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button className="btn btn-primary" disabled={busy || (!d.zip && !d.address)} onClick={pull}>{busy ? "Pulling data…" : m ? "Refresh market data" : "Pull live market data"}</button>
          <span className="note">Free public data: Census, FEMA, HUD, BLS and the Federal Reserve.{m ? ` Last pulled ${new Date(m.fetchedAt).toLocaleDateString()}.` : ""}</span>
        </div>
        {err && <div className="mt-2 rounded-md bg-fail-50 px-3 py-2 text-sm text-fail-600">{err}</div>}
        {m?.notes?.length ? <ul className="note mt-2 list-disc pl-5">{m.notes.map(x => <li key={x}>{x}</li>)}</ul> : null}
      </Card>

      <Card title={st ? `What ${st.name} and this market mean for the deal` : "What the location means for the deal"}>
        <ul className="space-y-3">
          {checks.map((c, i) => (
            <li key={i} className="flex gap-3">
              <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${DOT[c.level]}`} />
              <div className="flex-1 text-sm">
                <div className="font-semibold">{c.title}</div>
                {c.detail && <div className="text-slate-600">{c.detail}</div>}
              </div>
              {c.fix && <button className="btn h-fit shrink-0" onClick={() => set(c.fix!.patch)}>{c.fix.label}</button>}
            </li>))}
        </ul>
        <div className="note mt-3">Checks update as you change the deal. Green is fine, amber is worth a look, red needs a change or a reason.</div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title={st ? `${st.name} at a glance` : "State at a glance"}><StateSnapshot abbr={d.state || ""} learner={route === "learner"} /></Card>
        <BriefingBox state={d.state || ""} city={city} route={route} />
      </div>

      {m && <LiveData m={m} />}
    </div>
  )
}
