// Market › Supply & demand: who is moving in (population and renter household growth), how much new apartment
// supply is coming (building permits), and the live competition around the property (AI scan of rents,
// concessions and new buildings in lease up or under construction).
import { useEffect, useState } from "react"
import { type RentComp, usd, pct } from "../lib/model"
import { fetchMarket, cachedMarket, fetchCompetition, cachedCompetition, type MarketData, type AreaGrowth, type CompetitionScan } from "../lib/market"
import { Card } from "./ui"
import type { PaneProps } from "./Panes"

const place = (s?: string) => (s || "").replace(/\s+(city|town|village|CDP|municipality|borough)$/i, "")
const n0 = (v: number | null | undefined) => v == null ? "—" : Math.round(v).toLocaleString("en-US")
const g = (v: number | null | undefined) => v == null ? "—" : (v >= 0 ? "+" : "") + pct(v, 1)
/** Bedroom count from a unit type label: "Studio" = 0, "2 bed / 1 bath" = 2, "2BR" = 2. */
export const beds = (s: string) => /studio|efficiency|eff\b/i.test(s) ? 0 : Number((s.match(/(\d)\s*(?:bed|br|bd|bedroom)/i) || [])[1] ?? NaN)

const STATUS_TONE: Record<string, string> = { stabilized: "bg-slate-100 text-slate-600", "lease-up": "bg-gold-100 text-gold-700", "under construction": "bg-fail-50 text-fail-700", planned: "bg-brand-50 text-brand-700" }
const LEVEL: Record<string, [string, string]> = {
  heavy: ["Heavy new supply", "bg-fail-50 text-fail-700"], elevated: ["Elevated new supply", "bg-gold-100 text-gold-700"],
  light: ["Light new supply", "bg-pass-50 text-pass-700"], unknown: ["Supply unknown", "bg-slate-100 text-slate-600"],
}

function GrowthTable({ zip, city, county }: { zip: MarketData["census"]; city: AreaGrowth | null; county: AreaGrowth | null }) {
  const cols: { name: string; pop: number | null; pg: number | null; renters: number | null; rg: number | null; rent: number | null; rentg: number | null; perYr: number | null; rentersPerYr: number | null }[] = []
  if (zip) cols.push({ name: "ZIP", pop: zip.population, pg: zip.popGrowth5y, renters: null, rg: null, rent: zip.medianRent, rentg: zip.rentGrowth5y,
    perYr: zip.popGrowth5y != null && zip.population && zip.compareYear ? (zip.population - zip.population / (1 + zip.popGrowth5y)) / (zip.year - zip.compareYear) : null, rentersPerYr: null })
  for (const a of [city, county]) if (a) cols.push({ name: place(a.name.split(",")[0]), pop: a.population, pg: a.popGrowth5y, renters: a.renterHouseholds, rg: a.renterGrowth5y, rent: a.medianRent, rentg: a.rentGrowth5y, perYr: a.newResidentsPerYear, rentersPerYr: a.newRenterHouseholdsPerYear })
  if (!cols.length) return <p className="note">No growth data came back for this location.</p>
  const row = (l: string, f: (c: typeof cols[number]) => string, hi?: (c: typeof cols[number]) => boolean) =>
    <tr><td>{l}</td>{cols.map(c => <td key={c.name} className={`num ${hi?.(c) ? "font-semibold text-pass-600" : ""}`}>{f(c)}</td>)}</tr>
  return (
    <table className="tbl">
      <thead><tr><th /> {cols.map(c => <th key={c.name}>{c.name}</th>)}</tr></thead>
      <tbody>
        {row("Population", c => n0(c.pop))}
        {row("Population growth", c => g(c.pg), c => (c.pg ?? 0) > 0.05)}
        {row("New residents per year", c => c.perYr == null ? "—" : (c.perYr >= 0 ? "+" : "") + n0(c.perYr))}
        {row("Renter households", c => n0(c.renters))}
        {row("Renter household growth", c => g(c.rg), c => (c.rg ?? 0) > 0.05)}
        {row("New renter households per year", c => c.rentersPerYr == null ? "—" : (c.rentersPerYr >= 0 ? "+" : "") + n0(c.rentersPerYr))}
        {row("Median rent", c => c.rent == null ? "—" : usd(c.rent))}
        {row("Rent growth", c => g(c.rentg))}
      </tbody>
    </table>
  )
}

function PermitChart({ data, ytd }: { data: { year: number; units5: number }[]; ytd: { through: string; units5: number } | null }) {
  const bars = [...data.map(d => ({ l: String(d.year), v: d.units5, ytd: false })), ...(ytd ? [{ l: `${ytd.through} YTD`, v: ytd.units5, ytd: true }] : [])]
  const max = Math.max(1, ...bars.map(b => b.v)), H = 130
  return (
    <div className="flex h-[170px] items-end gap-2">
      {bars.map(b => (
        <div key={b.l} className="flex flex-1 flex-col items-center gap-1">
          <div className="num text-xs font-semibold text-brand-900">{n0(b.v)}</div>
          <div className={`w-full rounded-t-sm ${b.ytd ? "bg-gold-400" : "bg-brand-800"}`} style={{ height: Math.max(3, b.v / max * H) }} />
          <div className="whitespace-nowrap text-[11px] text-slate-400">{b.l}</div>
        </div>))}
    </div>
  )
}

export function SupplyPane({ d, p, set }: PaneProps) {
  const [m, setM] = useState<MarketData | null>(() => cachedMarket(d))
  const [scan, setScan] = useState<CompetitionScan | null>(() => cachedCompetition(d))
  const [busy, setBusy] = useState(""), [err, setErr] = useState("")
  const S = m?.supply, read = S?.read
  const city = place(m?.location?.placeName) || ((d.address || "").split(",").slice(-2, -1)[0] || "").trim()

  // Market data cached from the Location page before supply existed (or without it): fetch fresh once.
  useEffect(() => { if ((d.address || d.zip) && (!m || !m.supply) && !busy) pull() }, [])
  async function pull() { setBusy("data"); setErr(""); try { setM(await fetchMarket(d)) } catch (e: any) { setErr(e.message) } finally { setBusy("") } }
  async function runScan() { setBusy("scan"); setErr(""); try { setScan(await fetchCompetition(d, city)) } catch (e: any) { setErr(e.message) } finally { setBusy("") } }

  // Map scanned rents onto this deal's unit types by bedroom count.
  function addComps() {
    if (!scan) return
    const add: RentComp[] = []
    for (const pr of scan.properties) for (const r of pr.rents) {
      const u = d.units.find(u => beds(u.type) === beds(r.type))
      if (u) add.push({ name: pr.name + (pr.status !== "stabilized" ? ` (${pr.status})` : ""), dist: pr.distanceMi, built: pr.yearBuilt, type: u.type, rent: r.rent, sf: 0 })
    }
    set({ rentComps: [...d.rentComps, ...add] })
  }
  const sug = scan?.suggestions || {}
  const leaseUp = scan?.properties.filter(x => x.status !== "stabilized") || []
  const withConc = scan?.properties.filter(x => x.concession) || []

  // What this means for the model.
  const flags: string[] = []
  if (read?.level === "heavy" && (d.rg[0] || 0) > 2) flags.push(`Permits in the last 3 years equal ${pct(read.pctOfStock!, 1)} of the county's apartment stock, but your year 1 rent growth is ${d.rg[0]}%. New buildings in lease up usually hold rents flat and add concessions for 12 to 24 months.`)
  if (read?.coverage != null && read.coverage < 0.8) flags.push(`The county adds about ${n0(S?.county?.newRenterHouseholdsPerYear)} renter households a year against about ${n0(read.avgPermits)} new apartment units permitted a year, so supply is outrunning demand.`)
  if (withConc.length >= 2 && !d.conc) flags.push(`${withConc.length} nearby properties are advertising concessions, but your model has 0% concessions.`)
  if ((S?.county?.popGrowth5y ?? 0) < 0) flags.push("The county lost population over the last five years. Underwrite flat rent growth and higher vacancy.")

  return (
    <div className="space-y-4">
      {(!d.address && !d.zip) ? (
        <Card><div className="font-display text-lg font-semibold text-brand-900">Add the property's address first</div><p className="mt-1 text-sm text-slate-600">Enter the street address and ZIP under Market › Location. Supply and growth use the county and city the address sits in.</p></Card>
      ) : (
        <div className="card flex flex-wrap items-center gap-3 !py-4">
          <div className="mr-auto"><div className="font-display text-lg font-semibold text-brand-900">{m?.location?.placeName ? `${place(m.location.placeName)}, ${m.location.countyName || ""}` : d.address || d.zip}</div>
            <div className="text-xs text-slate-500">Population and households from the Census, new apartment permits from the Census Building Permits Survey, competition from a live web scan.</div></div>
          <button className="btn" disabled={!!busy} onClick={pull}>{busy === "data" ? "Pulling…" : S ? "Refresh data" : "Pull growth and supply data"}</button>
          <button className="btn btn-gold" disabled={!!busy} onClick={runScan}>{busy === "scan" ? "Scanning the market… (about a minute)" : scan ? "Rescan competition" : "Scan the competition"}</button>
        </div>
      )}
      {err && <div className="rounded-lg bg-fail-50 px-4 py-3 text-sm text-fail-600">{err}</div>}

      {flags.length > 0 && <div className="card border-gold-200 bg-gold-50/60">
        <div className="card-title">What this means for your model</div>
        <ul className="space-y-1.5 text-sm text-slate-700">{flags.map(f => <li key={f} className="flex gap-2"><span className="text-gold-600">●</span>{f}</li>)}</ul>
      </div>}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Who's moving in">
          {m ? <GrowthTable zip={m.census} city={S?.city ?? null} county={S?.county ?? null} /> : <p className="note">Pull the data to see population, household and renter growth for the ZIP, city and county. Rising renter households are the demand that fills new and existing apartments.</p>}
          {(S?.county || m?.census) && <p className="note mt-2">Growth compares Census American Community Survey 5 year estimates for {S?.county?.year ?? m?.census?.year} with {S?.county?.compareYear ?? m?.census?.compareYear ?? "an earlier survey"}{m?.census?.compareYear && S?.county?.compareYear && m.census.compareYear !== S.county.compareYear ? ` (ZIP: ${m.census.compareYear})` : ""}. They lag by a year or two; fast growing cities are usually ahead of these numbers.</p>}
        </Card>
        <Card title="New apartment supply" right={read && <span className={`chip ${LEVEL[read.level][1]}`}>{LEVEL[read.level][0]}</span>}>
          {S?.permits ? <>
            <PermitChart data={S.permits.perYear} ytd={S.permits.ytd} />
            <div className="mt-1 text-center text-[11px] text-slate-400">Units permitted in buildings with 5+ units, {S.county?.name.split(",")[0] || "county"}</div>
            <table className="tbl mt-3"><tbody>
              <tr><td>Permitted last 3 years</td><td className="num">{n0(read?.last3)} units</td></tr>
              <tr><td>As a share of existing apartments (5+ unit buildings)</td><td className="num">{read?.pctOfStock != null ? pct(read.pctOfStock, 1) : "—"}</td></tr>
              <tr><td>New renter households per year vs units permitted per year</td><td className="num">{n0(S.county?.newRenterHouseholdsPerYear)} vs {n0(read?.avgPermits)}</td></tr>
              <tr className="sub"><td>Demand coverage (above 1.0x means demand keeps up)</td><td className="num">{read?.coverage != null ? read.coverage.toFixed(2) + "x" : "—"}</td></tr>
            </tbody></table>
            <p className="note mt-2">Most permitted buildings deliver 18 to 30 months later, so permits from the last two years are the units you'll compete with during your first years of ownership. Under 5% of stock is light, 5 to 10% elevated, over 10% heavy.</p>
          </> : <p className="note">{m ? "No permit data came back for this county." : "Pull the data to see how many apartment units the county has permitted each year."}</p>}
        </Card>
      </div>

      <Card title="Competition scan" right={scan && <span className="text-xs text-slate-400">as of {scan.asOf}</span>}>
        {!scan ? <p className="note">Underwriting Desk searches listing sites, local news and planning records near the property for competing apartments, their asking rents and current concessions, and new buildings under construction or in lease up. Takes about a minute and costs a few cents of AI usage. Verify anything you rely on.</p> : <>
          <p className="text-sm leading-relaxed text-slate-700">{scan.summary}</p>
          <div className="mt-4 overflow-x-auto"><table className="tbl">
            <thead><tr><th>Property</th><th className="!text-left">Status</th><th>Miles</th><th>Built</th><th>Units</th><th className="!text-left">Asking rents</th><th className="!text-left">Concession</th><th /></tr></thead>
            <tbody>{scan.properties.map((x, i) => (
              <tr key={i}>
                <td className="!whitespace-normal"><div className="font-medium">{x.name}</div><div className="text-[11px] text-slate-400">{x.address}</div></td>
                <td className="!text-left"><span className={`chip ${STATUS_TONE[x.status]}`}>{x.status}{x.delivery ? ` · ${x.delivery}` : ""}</span></td>
                <td className="num">{x.distanceMi ? x.distanceMi.toFixed(1) : ""}</td><td className="num">{x.yearBuilt || ""}</td><td className="num">{x.units || ""}</td>
                <td className="!text-left !whitespace-normal text-xs">{x.rents.map(r => `${r.type} ${usd(r.rent)}`).join(" · ") || "—"}</td>
                <td className="!text-left !whitespace-normal text-xs">{x.concession ? <span className="text-gold-700">{x.concession}</span> : "—"}</td>
                <td>{x.source && <a className="text-xs text-brand-600 underline" href={x.source} target="_blank" rel="noreferrer">source</a>}</td>
              </tr>))}</tbody>
          </table></div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4"><div className="card-title">New buildings nearby ({leaseUp.length})</div><p className="text-sm text-slate-700">{scan.pipeline}</p></div>
            <div className="rounded-lg bg-slate-50 p-4"><div className="card-title">Concessions</div><p className="text-sm text-slate-700">{scan.concessions}</p></div>
          </div>
          <div className="mt-4 rounded-lg border border-brand-100 bg-brand-50/50 p-4">
            <div className="card-title">Suggested underwriting</div>
            {sug.marketRentNote && <p className="mb-2 text-sm text-slate-700">{sug.marketRentNote}</p>}
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-primary" onClick={addComps}>Add these rents to Comps</button>
              {sug.concessionPct ? <button className="btn" onClick={() => set({ conc: sug.concessionPct! })}>Concessions {sug.concessionPct}% (yours {d.conc}%)</button> : null}
              {sug.vacancyPct ? <button className="btn" onClick={() => set({ vac: sug.vacancyPct! })}>Vacancy {sug.vacancyPct}% (yours {d.vac}%)</button> : null}
              {sug.rentGrowthYear1Pct != null && sug.rentGrowthYear1Pct !== 0 || sug.rentGrowthYear2Pct ? <button className="btn" onClick={() => set({ rg: d.rg.map((v, i) => i === 0 && sug.rentGrowthYear1Pct != null ? sug.rentGrowthYear1Pct : i === 1 && sug.rentGrowthYear2Pct != null ? sug.rentGrowthYear2Pct : v) })}>Rent growth yr 1 {sug.rentGrowthYear1Pct ?? d.rg[0]}%, yr 2 {sug.rentGrowthYear2Pct ?? d.rg[1]}% (yours {d.rg[0]}%, {d.rg[1]}%)</button> : null}
            </div>
            {sug.notes?.filter(Boolean).length ? <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">{sug.notes.filter(Boolean).map(n => <li key={n}>{n}</li>)}</ul> : null}
            <p className="note mt-2">Year 1 NOI today: {usd(p.y1.noi)}. Each button changes one input; undo by changing it back on the Property pages.</p>
          </div>
          {scan.sources.length > 0 && <details className="mt-3 text-xs text-slate-500"><summary className="cursor-pointer">Sources ({scan.sources.length})</summary>
            <ul className="mt-2 space-y-1">{scan.sources.map(s => <li key={s.url}><a className="text-brand-600 underline" href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}</ul></details>}
        </>}
      </Card>
    </div>
  )
}
