import type React from "react"
import { useEffect, useMemo, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import { type Deal, SAMPLE, norm, project, tests, allPass, maxPrice, usd, pct, xx } from "./lib/model"
import { listDeals, saveDeal, deleteDeal, type SavedDeal } from "./lib/store"
import { Kpi } from "./components/ui"
import { Icon } from "./components/Icons"
import { StatementPane } from "./components/StatementPane"
import { ValueAddPane, InvestorsPane } from "./components/ValueAddPane"
import { CompsPane } from "./components/CompsPane"
import { SupplyPane } from "./components/SupplyPane"
import { MonthlyPane } from "./components/MonthlyPane"
import { RentRollPane } from "./components/RentRollPane"
import { TaxPane } from "./components/TaxPane"
import { QuotesPane } from "./components/QuotesPane"
import { SummaryPane, ShareMenu, IncomePane, ExpensesPane, FinancingPane, ProjectionsPane, ScenariosPane, DealsPane, failNames } from "./components/Panes"
import AiPanel from "./components/AiPanel"
import ImportPane from "./components/ImportPane"
import MarketPane from "./components/MarketPane"
import { getHomeState } from "./lib/market"
import { newDealFromDefault } from "./lib/templates"
import { TemplatesCard } from "./components/TemplatesCard"

/** Workspace sections, each with its own pages. Page keys are also the URL hash, so old links keep working. */
const SECTIONS = [
  { key: "overview", label: "Overview", icon: Icon.overview, pages: [["summary", "Summary"]] },
  { key: "property", label: "Property", icon: Icon.property, pages: [["income", "Rent & income"], ["rentroll", "Rent roll"], ["expenses", "Expenses"], ["valueadd", "Value add"], ["documents", "Documents"]] },
  { key: "market", label: "Market", icon: Icon.market, pages: [["market", "Location"], ["supply", "Supply & demand"], ["comps", "Comps"]] },
  { key: "financials", label: "Financials", icon: Icon.financials, pages: [["statement", "Operating statement"], ["monthly", "Monthly"], ["projections", "Projections"], ["scenarios", "Scenarios"], ["taxes", "Taxes"]] },
  { key: "capital", label: "Capital", icon: Icon.capital, pages: [["financing", "Debt"], ["quotes", "Loan quotes"], ["investors", "Investors"]] },
  { key: "advisor", label: "Advisor", icon: Icon.advisor, pages: [["ai", "Deal School AI"]] },
  { key: "pipeline", label: "Pipeline", icon: Icon.pipeline, pages: [["deals", "Deals & buy box"]] },
] as const
type Tab = "summary" | "quotes" | "taxes" | "rentroll" | "monthly" | "supply" | "income" | "expenses" | "valueadd" | "documents" | "market" | "comps" | "statement" | "projections" | "scenarios" | "financing" | "investors" | "ai" | "deals"
type Section = { key: string; label: string; icon: (c?: string) => React.ReactElement; pages: readonly (readonly [Tab, string])[] }
const SECS: readonly Section[] = SECTIONS
const TABS = SECS.flatMap(s => s.pages)
const sectionOf = (t: Tab) => SECS.find(s => s.pages.some(p => p[0] === t))!

const CURRENT_KEY = "dealScreener.current.v1"
function load<T>(key: string, fallback: T): T { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback } }
const tabFromHash = (): Tab => { const h = location.hash.slice(1); return (TABS.some(t => t[0] === h) ? h : "summary") as Tab }

export default function ProWorkspace({ session, toast }: { session: Session | null; toast: (m: string) => void }) {
  const [deal, setDeal] = useState<Deal>(() => norm(load(CURRENT_KEY, SAMPLE)))
  const [dealId, setDealId] = useState<string | undefined>(() => load<string | undefined>(CURRENT_KEY + ".id", undefined))
  const [tab, setTab] = useState<Tab>(tabFromHash)
  const [metric, setMetric] = useState("coc")
  const [saved, setSaved] = useState<SavedDeal[] | null>([])

  useEffect(() => { try { localStorage.setItem(CURRENT_KEY, JSON.stringify(deal)); localStorage.setItem(CURRENT_KEY + ".id", JSON.stringify(dealId ?? null)) } catch {} }, [deal, dealId])
  useEffect(() => { const f = () => setTab(tabFromHash()); addEventListener("hashchange", f); return () => removeEventListener("hashchange", f) }, [])
  const refresh = () => listDeals(session, "pro").then(setSaved).catch(() => setSaved(null))
  useEffect(() => { refresh() }, [session?.user.id])

  const set = (patch: Partial<Deal>) => setDeal(d => norm({ ...d, ...patch }))
  const p = useMemo(() => project(deal), [deal])
  const t = useMemo(() => tests(p, deal), [p, deal])
  const valid = p.units > 0 && deal.price > 0
  const mp = useMemo(() => valid ? maxPrice(deal) : NaN, [deal, valid])
  const ok = allPass(t)
  const sec = sectionOf(tab)
  const [lastPage, setLastPage] = useState<Record<string, Tab>>({})
  useEffect(() => { setLastPage(m => ({ ...m, [sec.key]: tab })) }, [tab])
  const go = (k: Tab) => { history.replaceState(null, "", "#" + k); setTab(k) }
  const pane = { d: deal, p, set, mp }

  async function save() {
    try { const id = await saveDeal(session, deal, "pro", dealId); setDealId(id); toast("Deal saved"); refresh() }
    catch (e: any) { toast("Couldn't save: " + (e?.message || e)) }
  }

  return (
    <>
      <div className="relative bg-night text-white">
        <div className="relative mx-auto max-w-7xl px-4 pt-5 md:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-0 basis-full sm:basis-0 sm:flex-1">
              <div className="text-xs font-medium text-white/50">Underwriting workspace</div>
              <input className="mt-0.5 w-full max-w-xl border-0 !bg-transparent px-0 font-display text-2xl font-semibold text-white shadow-none !ring-0 placeholder:text-white/30 md:text-[28px]" placeholder="Name this deal" value={deal.name} onChange={e => set({ name: e.target.value })} />
            </div>
            {valid && <ShareMenu d={deal} p={p} mp={mp} />}
            <button className="btn btn-gold" onClick={save}>{dealId ? "Save" : "Save deal"}</button>
            <button className="btn btn-ghost" onClick={() => { setDeal(newDealFromDefault(getHomeState())); setDealId(undefined); go("documents") }}>New deal</button>
          </div>
          <nav className="mt-4 flex gap-1 overflow-x-auto">
            {SECS.map(s => { const on = s.key === sec.key; return (
              <button key={s.key} onClick={() => go((lastPage[s.key] || s.pages[0][0]) as Tab)}
                className={`group relative flex items-center gap-2 whitespace-nowrap rounded-t-xl px-4 py-2.5 text-sm font-semibold transition ${on ? "bg-[#f6f6f3] text-ink" : "text-white/60 hover:text-white"}`}>
                <span className={on ? "text-ink" : "text-white/40 group-hover:text-white/70"}>{s.icon("h-4 w-4")}</span>{s.label}
              </button>) })}
          </nav>
        </div>
      </div>
      {sec.pages.length > 1 && (
        <div className="mx-auto max-w-7xl px-4 pt-4 md:px-8">
          <div className="flex flex-wrap gap-5 border-b border-[#e4e4de]">
            {sec.pages.map(([k, label]) => (
              <button key={k} onClick={() => go(k as Tab)} className={`-mb-px border-b-2 pb-2.5 pt-1 text-sm font-medium transition ${tab === k ? "border-ink text-ink" : "border-transparent text-slate-500 hover:text-ink"}`}>{label}</button>))}
          </div>
        </div>)}

      {valid && tab !== "summary" && (
        <div className="sticky top-[65px] z-10 border-b border-[#e4e4de] bg-[#f6f6f3]/95 backdrop-blur">
          <button onClick={() => go("summary")} title="Open the Overview" className="mx-auto flex w-full max-w-7xl items-center gap-x-5 gap-y-1 overflow-x-auto whitespace-nowrap px-4 py-2 text-left text-xs md:px-8">
            <span className={`flex items-center gap-1.5 font-semibold ${ok ? "text-pass-600" : "text-fail-600"}`}><span className={`h-2 w-2 rounded-full ${ok ? "bg-pass-500" : "bg-fail-500"}`} />{ok ? "Clears buy box" : "Misses buy box"}</span>
            <Slim label="NOI" v={usd(p.y1.noi)} />
            <Slim label="Cap" v={pct(p.y1.cap)} bad={!t.cap} />
            <Slim label="DSCR" v={xx(p.y1.dscr)} bad={!t.dscr} />
            <Slim label="CoC" v={pct(p.y1.coc)} bad={!t.coc} />
            <Slim label="IRR" v={pct(p.irr)} bad={!t.irr} />
            <Slim label="Multiple" v={xx(p.em)} bad={!t.em} />
            <span className="ml-auto text-slate-500">Max price <span className="num font-semibold text-ink">{isFinite(mp) ? usd(mp) : "none"}</span></span>
          </button>
        </div>)}

      <main className="mx-auto max-w-7xl space-y-4 px-4 py-5 md:px-8">
        {!valid ? (
          <div className="card border-brand-100 bg-brand-50/60">
            <div className="font-display text-xl font-semibold text-brand-900">Start with a price and a unit mix</div>
            <div className="mt-1 text-sm text-slate-600">Upload a rent roll, T12 or offering memo under Property › Documents, type it in under Property › Rent &amp; income, or load the sample deal from Pipeline.</div>
          </div>
        ) : tab === "summary" && (
          <div className={`card relative overflow-hidden !p-0`}>
            <div className={`absolute inset-y-0 left-0 w-1 ${ok ? "bg-pass-500" : "bg-fail-500"}`} />
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className={`grid h-9 w-9 place-items-center rounded-full ${ok ? "bg-pass-50 text-pass-600" : "bg-fail-50 text-fail-600"}`}>{ok ? Icon.check("h-5 w-5") : Icon.x("h-5 w-5")}</span>
                <div>
                  <div className="text-base font-semibold leading-tight">{ok ? "Clears your buy box" : "Doesn't clear your buy box"}</div>
                  <div className="text-sm text-slate-500">{ok ? "Every test passes at the asking price." : `Short on ${failNames(t).join(", ")}.`}</div>
                </div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-xs text-slate-500">Max price that passes every test</div>
                <div className="num text-lg font-semibold text-brand-900">{isFinite(mp) ? <>{usd(mp)} <span className={`chip ${mp >= deal.price ? "bg-pass-50 text-pass-600" : "bg-gold-100 text-gold-700"}`}>{pct(mp / deal.price - 1, 1)} vs asking</span></> : "No price works"}</div>
              </div>
            </div>
          </div>
        )}

        {valid && tab === "summary" && (
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-[#e4e4de] bg-[#e4e4de] sm:grid-cols-4 lg:grid-cols-7">
            <Kpi label="Per unit" value={usd(p.y1.ppu)} tag={`${p.units} units`} />
            <Kpi label="NOI" value={usd(p.y1.noi)} tag={`yr 1 · ${pct(p.y1.expRatio, 0)} exp ratio`} />
            <Kpi label="Cap rate" value={pct(p.y1.cap)} tag={`min ${deal.minCap}%`} state={t.cap} />
            <Kpi label="DSCR" value={xx(p.y1.dscr)} tag={`yr 1 · min ${deal.minDscr}x`} state={t.dscr} />
            <Kpi label="Cash on cash" value={pct(p.y1.coc)} tag={`yr 1 · min ${deal.minCoc}%`} state={t.coc} />
            <Kpi label="IRR" value={pct(p.irr)} tag={`${deal.hold} yr · min ${deal.minIrr}%`} state={t.irr} />
            <Kpi label="Multiple" value={xx(p.em)} tag={`min ${deal.minEm}x`} state={t.em} />
          </div>
        )}

        {tab === "summary" && (valid ? <SummaryPane {...pane} /> : null)}
        <div className={tab === "documents" ? "" : "hidden"}><ImportPane deal={deal} onApply={(patch, msg) => { set(patch); toast(msg); go("summary") }} /></div>
        {tab === "market" && <MarketPane d={deal} set={set} session={session} route="pro" />}
        {tab === "income" && <IncomePane {...pane} />}
        {tab === "statement" && <StatementPane {...pane} />}
        {tab === "valueadd" && <ValueAddPane {...pane} />}
        {tab === "comps" && <CompsPane {...pane} />}
        {tab === "supply" && <SupplyPane {...pane} />}
        {tab === "monthly" && <MonthlyPane {...pane} />}
        {tab === "rentroll" && <RentRollPane {...pane} />}
        {tab === "taxes" && <TaxPane {...pane} />}
        {tab === "quotes" && <QuotesPane {...pane} />}
        {tab === "investors" && <InvestorsPane {...pane} />}
        {tab === "expenses" && <ExpensesPane {...pane} />}
        {tab === "financing" && <FinancingPane {...pane} />}
        {tab === "projections" && <ProjectionsPane {...pane} />}
        {tab === "scenarios" && <ScenariosPane {...pane} metric={metric} setMetric={setMetric} />}
        <div className={tab === "ai" ? "" : "hidden"}><AiPanel storeKey="pro" deal={deal} fixedRoute="pro" title="Deal School AI · Pro route" onDeal={d => setDeal(norm(d))} /></div>
        {tab === "deals" && <DealsPane {...pane} saved={saved} cloud={!!session}
          onSave={save}
          onOpen={i => { const r = saved![i]; setDeal(norm(r.data)); setDealId(r.id); go("summary") }}
          onDelete={async i => { await deleteDeal(session, saved![i].id).catch(() => {}); if (saved![i].id === dealId) setDealId(undefined); refresh() }}
          onSample={() => { setDeal(norm(SAMPLE)); setDealId(undefined) }}
          onClear={() => { setDeal(newDealFromDefault(getHomeState())); setDealId(undefined) }} />}
        {tab === "deals" && <TemplatesCard d={deal} setDeal={setDeal} session={session} toast={toast} />}
      </main>
    </>
  )
}

function Slim({ label, v, bad }: { label: string; v: string; bad?: boolean }) {
  return <span className="text-slate-500">{label} <span className={`num font-semibold ${bad ? "text-fail-600" : "text-ink"}`}>{v}</span></span>
}
