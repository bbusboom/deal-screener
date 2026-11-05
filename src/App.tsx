import { useEffect, useMemo, useState } from "react"
import { type Deal, DEFAULTS, SAMPLE, norm, project, tests, allPass, maxPrice, usd, pct, xx } from "./lib/model"
import { Kpi } from "./components/ui"
import { SummaryPane, IncomePane, ExpensesPane, FinancingPane, ProjectionsPane, ScenariosPane, DealsPane, failNames } from "./components/Panes"
import AiPanel from "./components/AiPanel"

const TABS = [
  ["summary", "Summary"], ["income", "Property & Income"], ["expenses", "Expenses"], ["financing", "Financing"],
  ["projections", "Projections"], ["scenarios", "Scenarios"], ["ai", "Deal School AI"], ["deals", "Buy Box & Deals"],
] as const
type Tab = typeof TABS[number][0]

const SAVED_KEY = "dealScreener.deals.v1", CURRENT_KEY = "dealScreener.current.v1"
function load<T>(key: string, fallback: T): T { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback } }
function store(key: string, v: unknown) { try { localStorage.setItem(key, JSON.stringify(v)); return true } catch { return false } }
const tabFromHash = (): Tab => { const h = location.hash.slice(1); return (TABS.some(t => t[0] === h) ? h : "summary") as Tab }

export default function App() {
  const [deal, setDeal] = useState<Deal>(() => norm(load(CURRENT_KEY, SAMPLE)))
  const [tab, setTab] = useState<Tab>(tabFromHash)
  const [metric, setMetric] = useState("coc")
  const [saved, setSaved] = useState<Deal[] | null>(() => { const s = load<Deal[] | null>(SAVED_KEY, []); return s ? s.map(x => norm(x)) : null })
  const [toast, setToast] = useState("")

  useEffect(() => { store(CURRENT_KEY, deal) }, [deal])
  useEffect(() => { const f = () => setTab(tabFromHash()); addEventListener("hashchange", f); return () => removeEventListener("hashchange", f) }, [])
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 1800); return () => clearTimeout(t) }, [toast])

  const set = (patch: Partial<Deal>) => setDeal(d => norm({ ...d, ...patch }))
  const p = useMemo(() => project(deal), [deal])
  const t = useMemo(() => tests(p, deal), [p, deal])
  const valid = p.units > 0 && deal.price > 0
  const mp = useMemo(() => valid ? maxPrice(deal) : NaN, [deal, valid])
  const ok = allPass(t)
  const go = (k: Tab) => { history.replaceState(null, "", "#" + k); setTab(k) }

  const saveDeal = () => {
    const list = [...(saved || [])], i = list.findIndex(s => s.name && s.name === deal.name)
    if (i >= 0) list[i] = deal; else list.push(deal)
    setToast(store(SAVED_KEY, list) ? "Deal saved" : "Couldn't save"); setSaved(list)
  }
  const pane = { d: deal, p, set, mp }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 pt-5 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">DS</div>
                <h1 className="text-xl font-bold tracking-tight">Deal Screener</h1>
              </div>
              <p className="mt-1 text-sm text-slate-500">Underwrite a multifamily acquisition: year 1 screen, full hold period, scenarios and the Deal School AI.</p>
            </div>
            <span className="font-mono text-xs text-slate-400">v0.4 · first web build</span>
          </div>
          <input className="mt-4 w-full max-w-md font-semibold" placeholder="Deal name" value={deal.name} onChange={e => set({ name: e.target.value })} />
          <nav className="-mb-px mt-4 flex gap-1 overflow-x-auto">
            {TABS.map(([k, label]) => (
              <button key={k} onClick={() => go(k)}
                className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold transition ${tab === k ? "border-brand-600 text-brand-600" : "border-transparent text-slate-500 hover:text-ink"}`}>
                {label}
              </button>))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-4 px-4 py-5 md:px-8">
        {!valid ? (
          <div className="rounded-xl border border-brand-100 bg-brand-50 px-5 py-4 text-brand-700">
            <div className="text-lg font-bold">Enter a price and unit mix</div>
            <div className="text-sm">Start on Property &amp; Income, or load the sample deal from Buy Box &amp; Deals.</div>
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
        {tab === "income" && <IncomePane {...pane} />}
        {tab === "expenses" && <ExpensesPane {...pane} />}
        {tab === "financing" && <FinancingPane {...pane} />}
        {tab === "projections" && <ProjectionsPane {...pane} />}
        {tab === "scenarios" && <ScenariosPane {...pane} metric={metric} setMetric={setMetric} />}
        <div className={tab === "ai" ? "" : "hidden"}><AiPanel deal={deal} onDeal={d => setDeal(norm(d))} /></div>
        {tab === "deals" && <DealsPane {...pane} saved={saved}
          onSave={saveDeal}
          onOpen={i => { setDeal(norm(saved![i])); go("summary") }}
          onDelete={i => { const l = saved!.filter((_, j) => j !== i); store(SAVED_KEY, l); setSaved(l) }}
          onSample={() => setDeal(norm(SAMPLE))}
          onClear={() => setDeal(norm(DEFAULTS))} />}
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-8 text-xs text-slate-400 md:px-8">Screening tool, not investment advice. Verify rent roll, T12, taxes after sale and insurance quotes.</footer>
      {toast && <div className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-lg bg-ink px-4 py-2 text-sm text-white">{toast}</div>}
    </div>
  )
}
