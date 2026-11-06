import { useEffect, useMemo, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import { type Deal, DEFAULTS, SAMPLE, norm, project, tests, allPass, maxPrice, usd, pct, xx } from "./lib/model"
import { listDeals, saveDeal, deleteDeal, type SavedDeal } from "./lib/store"
import { Kpi } from "./components/ui"
import { StatementPane } from "./components/StatementPane"
import { ValueAddPane, InvestorsPane } from "./components/ValueAddPane"
import { SummaryPane, IncomePane, ExpensesPane, FinancingPane, ProjectionsPane, ScenariosPane, DealsPane, failNames } from "./components/Panes"
import AiPanel from "./components/AiPanel"
import ImportPane from "./components/ImportPane"
import MarketPane from "./components/MarketPane"
import { getHomeState } from "./lib/market"

const TABS = [
  ["summary", "Summary"], ["documents", "Documents"], ["market", "Market"], ["income", "Income"], ["expenses", "Expenses"], ["statement", "Statement"], ["valueadd", "Value Add"], ["financing", "Financing"], ["investors", "Investors"],
  ["projections", "Projections"], ["scenarios", "Scenarios"], ["ai", "Deal School AI"], ["deals", "Deals"],
] as const
type Tab = typeof TABS[number][0]

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
  const go = (k: Tab) => { history.replaceState(null, "", "#" + k); setTab(k) }
  const pane = { d: deal, p, set, mp }

  async function save() {
    try { const id = await saveDeal(session, deal, "pro", dealId); setDealId(id); toast("Deal saved"); refresh() }
    catch (e: any) { toast("Couldn't save: " + (e?.message || e)) }
  }

  return (
    <>
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 pt-4 md:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <input className="w-full max-w-md font-semibold" placeholder="Deal name" value={deal.name} onChange={e => set({ name: e.target.value })} />
            <button className="btn btn-primary" onClick={save}>{dealId ? "Save" : "Save deal"}</button>
            <button className="btn" onClick={() => { setDeal(norm({ ...DEFAULTS, state: getHomeState() })); setDealId(undefined); go("documents") }}>New deal</button>
          </div>
          <nav className="-mb-px mt-3 flex gap-1 overflow-x-auto">
            {TABS.map(([k, label]) => (
              <button key={k} onClick={() => go(k)}
                className={`whitespace-nowrap border-b-2 px-2.5 py-2.5 text-sm font-semibold transition ${tab === k ? "border-brand-600 text-brand-600" : "border-transparent text-slate-500 hover:text-ink"}`}>
                {label}
              </button>))}
          </nav>
        </div>
      </div>

      <main className="mx-auto max-w-7xl space-y-4 px-4 py-5 md:px-8">
        {!valid ? (
          <div className="rounded-xl border border-brand-100 bg-brand-50 px-5 py-4 text-brand-700">
            <div className="text-lg font-bold">Enter a price and unit mix</div>
            <div className="text-sm">Upload a rent roll, T12 or offering memo on Import Documents, enter it on Property &amp; Income, or load the sample deal from Buy Box &amp; Deals.</div>
          </div>
        ) : (
          <div className={`rounded-xl border px-5 py-4 ${ok ? "border-pass-600/30 bg-pass-50 text-pass-600" : "border-fail-600/30 bg-fail-50 text-fail-600"}`}>
            <div className="text-lg font-bold">{ok ? "Clears the buy box" : "Does not clear the buy box"}</div>
            <div className="text-sm text-ink/80">
              {ok ? "Every test passes at the asking price." : `Short on ${failNames(t).join(", ")}.`}{" "}
              {isFinite(mp) ? <>Max price that passes every test: <b>{usd(mp)}</b> ({usd(mp / p.units)}/unit, {pct(mp / deal.price - 1, 1)} vs asking).</> : "No price passes every test with these terms."}
            </div>
          </div>
        )}

        {valid && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            <Kpi label="Price / unit" value={usd(p.y1.ppu)} tag={`${p.units} units`} />
            <Kpi label="NOI, year 1" value={usd(p.y1.noi)} tag={`expense ratio ${pct(p.y1.expRatio, 1)}`} />
            <Kpi label="Cap rate" value={pct(p.y1.cap)} tag={`min ${deal.minCap}%`} state={t.cap} />
            <Kpi label="DSCR, year 1" value={xx(p.y1.dscr)} tag={`min ${deal.minDscr}x`} state={t.dscr} />
            <Kpi label="Cash on cash, yr 1" value={pct(p.y1.coc)} tag={`min ${deal.minCoc}%`} state={t.coc} />
            <Kpi label="IRR" value={pct(p.irr)} tag={`${deal.hold} yr hold, min ${deal.minIrr}%`} state={t.irr} />
            <Kpi label="Equity multiple" value={xx(p.em)} tag={`min ${deal.minEm}x`} state={t.em} />
          </div>
        )}

        {tab === "summary" && (valid ? <SummaryPane {...pane} /> : null)}
        <div className={tab === "documents" ? "" : "hidden"}><ImportPane deal={deal} onApply={(patch, msg) => { set(patch); toast(msg); go("summary") }} /></div>
        {tab === "market" && <MarketPane d={deal} set={set} session={session} route="pro" />}
        {tab === "income" && <IncomePane {...pane} />}
        {tab === "statement" && <StatementPane {...pane} />}
        {tab === "valueadd" && <ValueAddPane {...pane} />}
        {tab === "investors" && <InvestorsPane {...pane} />}
        {tab === "expenses" && <ExpensesPane {...pane} />}
        {tab === "financing" && <FinancingPane {...pane} />}
        {tab === "projections" && <ProjectionsPane {...pane} />}
        {tab === "scenarios" && <ScenariosPane {...pane} metric={metric} setMetric={setMetric} />}
        <div className={tab === "ai" ? "" : "hidden"}><AiPanel deal={deal} fixedRoute="pro" title="Deal School AI · Pro route" onDeal={d => setDeal(norm(d))} /></div>
        {tab === "deals" && <DealsPane {...pane} saved={saved} cloud={!!session}
          onSave={save}
          onOpen={i => { const r = saved![i]; setDeal(norm(r.data)); setDealId(r.id); go("summary") }}
          onDelete={async i => { await deleteDeal(session, saved![i].id).catch(() => {}); if (saved![i].id === dealId) setDealId(undefined); refresh() }}
          onSample={() => { setDeal(norm(SAMPLE)); setDealId(undefined) }}
          onClear={() => { setDeal(norm({ ...DEFAULTS, state: getHomeState() })); setDealId(undefined) }} />}
      </main>
    </>
  )
}
