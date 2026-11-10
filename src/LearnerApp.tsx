import { useEffect, useMemo, useState, type ReactNode } from "react"
import type { Session } from "@supabase/supabase-js"
import { type Deal, DEFAULTS, PRACTICE, norm, project, monthlyPmt, usd, pct, xx, type Projection } from "./lib/model"
import { listDeals, saveDeal, type SavedDeal } from "./lib/store"
import { Card, Field, NumInput } from "./components/ui"
import AiPanel from "./components/AiPanel"
import ImportPane from "./components/ImportPane"
import MarketPane, { StateSelect } from "./components/MarketPane"
import { stateBy, taxEstimate } from "./lib/states"
import { useHomeState } from "./lib/market"

const STEPS = ["Start", "Property", "Income", "Expenses", "NOI", "Value", "Financing", "Cash flow", "Review"] as const
const CUR = "dealScreener.learner.current"
function load<T>(k: string, f: T): T { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f } catch { return f } }

/* ---------- small pieces ---------- */
function Explain({ children }: { children: ReactNode }) {
  return <div className="mb-4 rounded-lg border-l-4 border-brand-500 bg-brand-50 px-4 py-3 text-[14px] leading-relaxed text-ink/85">{children}</div>
}
function Math_({ lines }: { lines: [string, string, boolean?][] }) {
  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="card-title !mb-2">The math with your numbers</div>
      <table className="tbl"><tbody>{lines.map(([l, v, tot], i) => <tr key={i} className={tot ? "total" : ""}><td>{l}</td><td className="num">{v}</td></tr>)}</tbody></table>
    </div>
  )
}
function Hint({ children, warn }: { children: ReactNode; warn?: boolean }) {
  return <p className={`mt-1 text-xs ${warn ? "text-amber-700" : "text-slate-400"}`}>{children}</p>
}

/* ---------- review helpers ---------- */
function choices(d: Deal, p: Projection) {
  const out: { label: string; theirs: string; typical: string; diff: string }[] = []
  const cmp = (label: string, o: Partial<Deal>, theirs: string, typical: string) => {
    const alt = project(norm({ ...d, ...o }))
    out.push({ label, theirs, typical, diff: `NOI ${usd(alt.y1.noi - p.y1.noi)} · cash flow ${usd(alt.y1.cf - p.y1.cf)} a year at typical` })
  }
  if (d.vac < 5) cmp("Vacancy", { vac: 6 }, `${d.vac}%`, "6%")
  if (d.mgmt < 3) cmp("Management fee", { mgmt: 5 }, `${d.mgmt}% of EGI`, "5% of EGI")
  if (d.res < 200) cmp("Reserves", { res: 300 }, `${usd(d.res)}/unit`, "$300/unit")
  if (p.y1.expRatio < 0.35) out.push({ label: "Expense ratio", theirs: pct(p.y1.expRatio, 1), typical: "35% to 50%", diff: "Low expenses make NOI look better than it may be. Check the T12 and the tax after sale." })
  return out
}

export default function LearnerApp({ session, toast, onOpenInPro }: { session: Session | null; toast: (m: string) => void; onOpenInPro: (d: Deal) => void }) {
  const home = useHomeState()
  const [deal, setDeal] = useState<Deal>(() => norm(load(CUR, PRACTICE)))
  const [dealId, setDealId] = useState<string | undefined>(() => load<string | undefined>(CUR + ".id", undefined))
  const [step, setStep] = useState<number>(() => load(CUR + ".step", 0))
  const [marketCap, setMarketCap] = useState(6)
  const [showHold, setShowHold] = useState(false)
  const [mine, setMine] = useState<SavedDeal[]>([])
  const [importing, setImporting] = useState(false)

  useEffect(() => { try { localStorage.setItem(CUR, JSON.stringify(deal)); localStorage.setItem(CUR + ".id", JSON.stringify(dealId ?? null)); localStorage.setItem(CUR + ".step", JSON.stringify(step)) } catch {} }, [deal, dealId, step])
  useEffect(() => { listDeals(session, "learner").then(setMine).catch(() => {}) }, [session?.user.id])
  useEffect(() => { scrollTo({ top: 0 }) }, [step])

  const set = (patch: Partial<Deal>) => setDeal(d => norm({ ...d, ...patch }))
  const p = useMemo(() => project(deal), [deal])
  const valid = p.units > 0 && deal.price > 0
  const go = (n: number) => setStep(Math.max(0, Math.min(STEPS.length - 1, n)))
  const start = (d: Deal, id?: string) => { setDeal(norm({ ...d, state: d.state || home })); setDealId(id); setImporting(false); go(1) }
  async function save() {
    try { const id = await saveDeal(session, deal, "learner", dealId); setDealId(id); toast("Progress saved"); listDeals(session, "learner").then(setMine).catch(() => {}) }
    catch (e: any) { toast("Couldn't save: " + (e?.message || e)) }
  }
  const N = (k: keyof Deal, label: string, step = 1, hint?: ReactNode) =>
    <Field label={label}><NumInput value={deal[k] as number} step={step} onChange={v => set({ [k]: v } as Partial<Deal>)} />{hint}</Field>

  /* ---------- steps ---------- */
  const y = p.years[0]
  const loanAt125 = (() => { const maxDs = p.y1.noi / 1.25, perDollar = monthlyPmt(1, deal.rate, deal.amort) * 12; return perDollar > 0 ? maxDs / perDollar : NaN })()
  let body: ReactNode = null
  if (step === 0) body = (
    <Card title="Pick a deal to work through">
      <Explain>We'll underwrite a property together, one step at a time: what it earns, what it costs to run, what it's worth, how the loan works and whether it's a good deal. You'll see the math with your own numbers at every step. Ask the Desk anything along the way.</Explain>
      <div className="grid gap-3 md:grid-cols-3">
        <button className="rounded-lg border border-slate-200 p-4 text-left hover:border-brand-500" onClick={() => start(PRACTICE)}>
          <div className="font-semibold">Practice deal</div><div className="note mt-1">Maple Court, a 24 unit apartment building. Best for a first run.</div></button>
        <button className="rounded-lg border border-slate-200 p-4 text-left hover:border-brand-500" onClick={() => start({ ...DEFAULTS, name: "My deal", units: [{ type: "1 bed", count: 0, rent: 0 }] })}>
          <div className="font-semibold">My own property</div><div className="note mt-1">Enter the numbers as we go. Missing one? We'll suggest a starting point.</div></button>
        <button className="rounded-lg border border-slate-200 p-4 text-left hover:border-brand-500" onClick={() => setImporting(v => !v)}>
          <div className="font-semibold">Upload documents</div><div className="note mt-1">Rent roll, T12 or offering memo. Claude fills in what it finds.</div></button>
      </div>
      {importing && <div className="mt-4"><ImportPane deal={{ ...DEFAULTS, name: "" }} onApply={(patch, msg) => { start({ ...DEFAULTS, name: "My deal", ...patch }); toast(msg) }} /></div>}
      {mine.length > 0 && (
        <div className="mt-6"><div className="card-title">Pick up where you left off</div>
          <div className="flex flex-wrap gap-2">{mine.map(r => <button key={r.id} className="btn" onClick={() => start(r.data, r.id)}>{r.name}</button>)}</div></div>)}
    </Card>)
  if (step === 1) body = (
    <Card title="Step 1 · Property basics">
      <Explain>Start with what you're buying and what it costs. <b>Price per unit</b> is the first sanity check investors use: it lets you compare buildings of different sizes. Two buildings at the same price aren't the same deal if one has twice the units.</Explain>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Property name"><input value={deal.name} onChange={e => set({ name: e.target.value })} /></Field>
        {N("price", "Purchase price ($)", 1000)}
        {N("cc", "Closing costs (% of price)", 0.1, <Hint>Usually 1% to 3% for title, legal, lender and inspection fees.</Hint>)}
        <Field label="State the property is in"><StateSelect value={deal.state || ""} onChange={v => set({ state: v })} />
          <Hint>{stateBy(deal.state) ? `We'll use ${stateBy(deal.state)!.name}'s tax and rent rules when we check the deal.` : "Taxes and rent rules depend on the state."}</Hint></Field>
      </div>
      <Math_ lines={[["Units (set on the next step)", String(p.units)], ["Price per unit = price ÷ units", valid ? usd(p.y1.ppu) : "—", true]]} />
    </Card>)
  if (step === 2) body = (
    <Card title="Step 2 · Income">
      <Explain><b>Gross potential rent</b> is what you'd collect if every unit were rented all year. Nobody collects all of it, so we subtract <b>vacancy and credit loss</b>, even if the building is full today, because people move out and some don't pay. Add other income like parking or pet fees and you get <b>effective gross income</b>, what you actually expect to collect.</Explain>
      <div className="mb-1 grid grid-cols-[1.4fr_.7fr_1fr_28px] gap-2 text-xs text-slate-500"><span>Unit type</span><span>Count</span><span>Rent / mo</span><span /></div>
      {deal.units.map((u, i) => (
        <div key={i} className="mb-2 grid grid-cols-[1.4fr_.7fr_1fr_28px] items-center gap-2">
          <input value={u.type} onChange={e => set({ units: deal.units.map((x, j) => j === i ? { ...x, type: e.target.value } : x) })} />
          <NumInput value={u.count} onChange={v => set({ units: deal.units.map((x, j) => j === i ? { ...x, count: v } : x) })} />
          <NumInput value={u.rent} step={5} onChange={v => set({ units: deal.units.map((x, j) => j === i ? { ...x, rent: v } : x) })} />
          <button className="text-slate-400 hover:text-fail-600" onClick={() => set({ units: deal.units.length > 1 ? deal.units.filter((_, j) => j !== i) : deal.units })}>✕</button>
        </div>))}
      <button className="btn mb-4" onClick={() => set({ units: [...deal.units, { type: "", count: 0, rent: 0 }] })}>+ Add unit type</button>
      <div className="grid gap-3 sm:grid-cols-2">
        {N("vac", "Vacancy & credit loss (%)", 0.5, <Hint warn={deal.vac < 5}>{deal.vac < 5 ? "That's low. Most underwriters use 5% to 8% even for a full building. It's your call; we'll show the difference at the end." : "Most underwriters use 5% to 8% in a stable market."}</Hint>)}
        {N("other", "Other income ($ per unit per month)", 5, <Hint>Parking, pets, laundry, utility reimbursements. $25 to $75 is common.</Hint>)}
      </div>
      <Math_ lines={[["Gross potential rent = units × rent × 12", usd(p.y1.gpr)], [`Vacancy loss = GPR × ${deal.vac}%`, usd(-p.y1.vacLoss)], ["Other income", usd(p.y1.oth)], ["Effective gross income", usd(p.y1.egi), true]]} />
    </Card>)
  if (step === 3) body = (
    <Card title="Step 3 · Operating expenses">
      <Explain>These are the costs of running the property. This is where seller numbers are most often too rosy. Two classic traps: <b>property tax</b> usually goes up after a sale because the county reassesses at the new price, and an owner who manages it themselves shows no <b>management fee</b>, but you'll pay one. The mortgage is <b>not</b> an operating expense.</Explain>
      <div className="grid gap-3 sm:grid-cols-2">
        {N("tax", "Property taxes ($/yr)", 500, <Hint>Estimate on your purchase price, not the seller's bill.{stateBy(deal.state) && deal.price > 0 ? ` In ${stateBy(deal.state)!.name}, a rough estimate is ${usd(Math.round(taxEstimate(deal.price, stateBy(deal.state)) / 100) * 100)} a year.` : ""}</Hint>)}
        {N("ins", "Insurance ($/yr)", 500)}
        {N("util", "Utilities ($/yr)", 500)}
        {N("rm", "Repairs & maintenance ($/yr)", 500)}
        {N("pay", "Payroll ($/yr)", 500)}
        {N("adm", "Admin, marketing, contracts ($/yr)", 500)}
        {N("mgmt", "Management (% of EGI)", 0.25, <Hint warn={deal.mgmt < 3}>{deal.mgmt < 3 ? "Below what a manager would charge. Budget it even if you'll self manage; your time has a cost." : "Usually 3% to 8% of EGI; smaller buildings pay more."}</Hint>)}
        {N("res", "Replacement reserves ($/unit/yr)", 25, <Hint>Money set aside for roofs, HVAC and appliances. $250 to $400 per unit is common.</Hint>)}
      </div>
      <Math_ lines={[["Total operating expenses", usd(y.opex), true], ["Per unit", usd(y.opex / Math.max(1, p.units))], ["Expense ratio = expenses ÷ EGI", pct(p.y1.expRatio, 1)]]} />
      <Hint warn={p.y1.expRatio < 0.35}>{p.y1.expRatio < 0.35 ? "An expense ratio under 35% is unusually low for apartments. Double check for missing lines." : "Apartments usually run 35% to 50% of EGI; older buildings sit at the high end."}</Hint>
    </Card>)
  if (step === 4) body = (
    <Card title="Step 4 · Net operating income">
      <Explain><b>NOI</b> is the property's profit before any loan payments. It's the most important number in the deal: the value, the loan size and your returns all come from it. Because it ignores the loan, two buyers with different financing get the same NOI.</Explain>
      <Math_ lines={[["Effective gross income", usd(p.y1.egi)], ["Operating expenses", usd(-p.y1.opex)], ["Net operating income", usd(p.y1.noi), true]]} />
    </Card>)
  if (step === 5) body = (
    <Card title="Step 5 · Value and cap rate">
      <Explain>The <b>cap rate</b> is NOI divided by price: the yield you'd earn in year one if you paid all cash. Flip it around and you can value a property: NOI divided by the cap rate buyers in that market accept. A <b>lower</b> cap rate means a <b>higher</b> price for the same income.</Explain>
      <div className="max-w-xs"><Field label="Cap rate buyers accept in this market (%)"><NumInput value={marketCap} step={0.1} onChange={setMarketCap} /></Field>
        <Hint>Look up recent sales nearby, or ask a broker. If you're not sure, use this as a placeholder.</Hint></div>
      <Math_ lines={[["Your cap rate = NOI ÷ price", pct(p.y1.cap)], [`Value at a ${marketCap}% cap = NOI ÷ ${marketCap}%`, usd(p.y1.noi / (marketCap / 100))], ["Asking price", usd(deal.price)], ["Difference", usd(p.y1.noi / (marketCap / 100) - deal.price), true]]} />
    </Card>)
  if (step === 6) body = (
    <Card title="Step 6 · Financing">
      <Explain>Lenders limit the loan two ways: <b>loan to value</b> (the loan as a share of price) and <b>DSCR</b>, NOI divided by the yearly loan payment, which shows how many times the income covers the debt. Most want at least 1.20 to 1.35. Whichever limit is tighter sets your loan.</Explain>
      <div className="grid gap-3 sm:grid-cols-3">{N("ltv", "Loan to value (%)")}{N("rate", "Interest rate (%)", 0.05)}{N("amort", "Amortization (years)")}</div>
      <Math_ lines={[["Loan = price × LTV", usd(p.loan)], ["Yearly payment", usd(p.y1.ds)], ["DSCR = NOI ÷ payment", xx(p.y1.dscr), true], ["Biggest loan a 1.25 DSCR allows", usd(loanAt125)], ["That's an LTV of", pct(loanAt125 / deal.price, 1)]]} />
      {p.y1.dscr < 1.25 && <Hint warn>DSCR is below 1.25, so many lenders would cut this loan to about {usd(loanAt125)}. Ways to fix it: a lower price, a smaller loan, or more NOI.</Hint>}
    </Card>)
  if (step === 7) body = (
    <Card title="Step 7 · Cash flow and returns">
      <Explain><b>Cash flow</b> is what's left after the loan payment. <b>Cash on cash</b> divides that by the cash you put in: down payment plus closing costs. It's a year one number. If you want the whole picture over the time you own it, including the sale, turn on the hold period below to see <b>IRR</b>.</Explain>
      <Math_ lines={[["NOI", usd(p.y1.noi)], ["Loan payment", usd(-p.y1.ds)], ["Cash flow", usd(p.y1.cf), true], ["Cash invested = down payment + closing costs", usd(p.equity)], ["Cash on cash = cash flow ÷ cash invested", pct(p.y1.coc), true]]} />
      <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" className="!w-auto" checked={showHold} onChange={e => setShowHold(e.target.checked)} />Show the full hold period</label>
      {showHold && (
        <div className="mt-3">
          <div className="grid gap-3 sm:grid-cols-3">
            {N("hold", "Years you'd own it")}
            <Field label="Rent growth per year (%)"><NumInput value={deal.rg[0] ?? 3} step={0.25} onChange={v => set({ rg: deal.rg.map(() => v) })} /></Field>
            {N("exitCap", "Cap rate when you sell (%)", 0.05, <Hint>Your call. Many people use the cap rate they bought at or a bit higher, since the building will be older.</Hint>)}
          </div>
          <Math_ lines={[[`Sale price in year ${deal.hold}`, usd(p.salePrice)], ["Cash back after paying off the loan", usd(p.proceeds)], ["IRR, the yearly return including the sale", pct(p.irr), true], ["Equity multiple, cash back ÷ cash in", xx(p.em)]]} />
        </div>)}
    </Card>)
  if (step === 8) {
    const stress = [
      ["As entered", {}], ["Rent drops 5%", { rentChangePct: -5 }], [`Vacancy up to ${deal.vac + 5}%`, { vac: deal.vac + 5 }], [`Rate up to ${(deal.rate + 1).toFixed(2)}%`, { rate: deal.rate + 1 }],
    ] as const
    const ch = choices(deal, p)
    const goodDscr = p.y1.dscr >= 1.25, goodCoc = p.y1.coc >= 0.06, goodCap = p.y1.cap >= marketCap / 100
    const fixPrice = (() => { let lo = deal.price * 0.3, hi = deal.price; const ok = (pr: number) => { const q = project(deal, { price: pr }); return q.y1.dscr >= 1.25 && q.y1.coc >= 0.06 }
      if (!ok(lo)) return NaN; if (ok(hi)) return hi; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (ok(m)) lo = m; else hi = m } return Math.floor(lo / 10000) * 10000 })()
    const verdict = goodDscr && goodCoc ? "Pursue" : isFinite(fixPrice) && fixPrice >= deal.price * 0.75 ? "Renegotiate" : "Pass"
    body = (
      <Card title="Step 8 · Review">
        <div className={`mb-4 rounded-lg px-4 py-3 ${verdict === "Pursue" ? "bg-pass-50 text-pass-600" : verdict === "Pass" ? "bg-fail-50 text-fail-600" : "bg-amber-50 text-amber-800"}`}>
          <div className="text-lg font-bold">Verdict: {verdict}</div>
          <div className="text-sm text-ink/80">{verdict === "Pursue" ? "It covers the loan comfortably and pays a solid cash return at this price." :
            <>At {usd(deal.price)} it {!goodDscr ? `doesn't cover the loan well enough (DSCR ${xx(p.y1.dscr)})` : `pays only ${pct(p.y1.coc)} cash on cash`}. {isFinite(fixPrice) ? <>Around <b>{usd(fixPrice)}</b> ({pct(fixPrice / deal.price - 1, 0)} vs asking) it would reach a 1.25 DSCR and 6% cash on cash{verdict === "Pass" ? ", which is likely too big a cut for a seller to accept" : ""}.</> : "No reasonable price fixes it with these numbers."}</>}</div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div><div className="card-title">Deal snapshot</div>
            <table className="tbl"><tbody>
              {[["Price", usd(deal.price)], ["Price per unit", usd(p.y1.ppu)], ["EGI", usd(p.y1.egi)], ["Expenses", usd(p.y1.opex) + " · " + pct(p.y1.expRatio, 0)], ["NOI", usd(p.y1.noi)], ["Cap rate", pct(p.y1.cap)], ["Loan", usd(p.loan)], ["DSCR", xx(p.y1.dscr)], ["Cash flow", usd(p.y1.cf)], ["Cash on cash", pct(p.y1.coc)]]
                .map(([a, b]) => <tr key={a}><td>{a}</td><td className="num">{b}</td></tr>)}
            </tbody></table></div>
          <div><div className="card-title">What looks solid</div>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {goodCap && <li>The cap rate is at or above the {marketCap}% market rate you used.</li>}
              {goodDscr && <li>Income covers the loan {xx(p.y1.dscr)} times.</li>}
              {p.y1.beo < 0.85 && <li>It breaks even at {pct(p.y1.beo, 0)} occupancy, so there's room for a rough patch.</li>}
              {p.y1.expRatio >= 0.35 && p.y1.expRatio <= 0.5 && <li>Expenses are in the normal range for apartments.</li>}
              {!goodCap && !goodDscr && p.y1.beo >= 0.85 && <li>Not much yet at this price. The next sections show why.</li>}
            </ul></div>
        </div>
        {ch.length > 0 && (<div className="mt-5"><div className="card-title">Your choices vs typical</div>
          <table className="tbl"><thead><tr><th>Input</th><th>Yours</th><th>Typical</th><th className="!text-left">What it changes</th></tr></thead>
            <tbody>{ch.map(c => <tr key={c.label}><td>{c.label}</td><td className="num">{c.theirs}</td><td className="num">{c.typical}</td><td className="!whitespace-normal !text-left text-xs text-slate-600">{c.diff}</td></tr>)}</tbody></table></div>)}
        <div className="mt-5"><div className="card-title">Stress test</div>
          <table className="tbl"><thead><tr><th>Scenario</th><th>NOI</th><th>DSCR</th><th>Cash flow</th></tr></thead>
            <tbody>{stress.map(([l, o]) => { const q = project(deal, o as any); return <tr key={l}><td>{l}</td><td className="num">{usd(q.y1.noi)}</td><td className={`num ${q.y1.dscr < 1.25 ? "text-fail-600" : ""}`}>{xx(q.y1.dscr)}</td><td className={`num ${q.y1.cf < 0 ? "text-fail-600" : ""}`}>{usd(q.y1.cf)}</td></tr> })}</tbody></table>
          <p className="note mt-1">A deal that only works when nothing goes wrong is fragile.</p></div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div><div className="card-title">What a pro would check next</div>
            <ul className="list-disc space-y-1 pl-5 text-sm"><li>Property condition inspection</li><li>Rent and sale comps nearby</li><li>Tax assessment after the sale</li><li>A real insurance quote</li><li>The actual leases against the rent roll</li><li>New apartments being built nearby</li></ul></div>
          <div><div className="card-title">What you learned</div>
            <ul className="list-disc space-y-1 pl-5 text-sm"><li>NOI drives value, the loan and your returns.</li><li>A good cap rate can still fail the lender's DSCR test.</li><li>Small changes in vacancy or rate move cash flow a lot.</li><li>Seller numbers need checking, especially taxes.</li></ul></div>
        </div>
        <details className="mt-5 rounded-lg border border-slate-200 p-3" open={!!deal.state}>
          <summary className="cursor-pointer font-semibold">Check the market and your state</summary>
          <p className="note mt-1">Where a property sits changes its taxes, how fast rents can grow and who's making the rules. Add the ZIP to compare with the neighborhood.</p>
          <div className="mt-3"><MarketPane d={deal} set={set} session={session} route="learner" /></div>
        </details>
        <div className="mt-5 flex flex-wrap gap-2"><button className="btn btn-primary" onClick={() => onOpenInPro(deal)}>Open this deal in the Pro workspace</button><button className="btn" onClick={() => go(0)}>Start another deal</button></div>
      </Card>)
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-5 md:px-8">
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        {STEPS.map((s, i) => (
          <button key={s} onClick={() => (i === 0 || valid || i <= 2) && go(i)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${i === step ? "bg-brand-600 text-white" : i < step ? "bg-brand-100 text-brand-700" : "bg-white text-slate-500 ring-1 ring-slate-200"}`}>
            {i > 0 ? `${i}. ` : ""}{s}
          </button>))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {body}
          {step > 0 && (
            <div className="flex justify-between">
              <button className="btn" onClick={() => go(step - 1)}>← Back</button>
              <div className="flex gap-2"><button className="btn" onClick={save}>Save progress</button>
                {step < STEPS.length - 1 && <button className="btn btn-primary" disabled={step >= 1 && !valid && step !== 1} onClick={() => go(step + 1)}>Next →</button>}</div>
            </div>)}
        </div>
        <aside className="space-y-4">
          {step > 0 && (
            <Card title="Running scoreboard">
              <table className="tbl"><tbody>
                {[["Price", usd(deal.price), 1], ["Units", String(p.units), 2], ["EGI", usd(p.y1.egi), 2], ["Expenses", usd(p.y1.opex), 3], ["NOI", usd(p.y1.noi), 4], ["Cap rate", pct(p.y1.cap), 5], ["DSCR", xx(p.y1.dscr), 6], ["Cash on cash", pct(p.y1.coc), 7]]
                  .filter(r => step >= (r[2] as number)).map(([a, b]) => <tr key={a as string}><td>{a}</td><td className="num">{valid ? b : "—"}</td></tr>)}
              </tbody></table>
            </Card>)}
          <AiPanel storeKey="practice" deal={deal} fixedRoute="learner" title="Ask the Desk" compact onDeal={d => setDeal(norm(d))} />
        </aside>
      </div>
    </main>
  )
}
