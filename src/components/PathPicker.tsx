// Path picker shown after sign in: a preview of the Learn side, then the Underwrite side,
// using the landing page's feature showcase and night sky.
import { useRef, type ReactNode } from "react"
import type { Path } from "../lib/store"
import { useScrollVar, Sky, Panel, Showcase } from "../Landing"
import "../landing.css"

type Slide = { key: string; tag: string; title: string; body: string; bullets: string[]; visual: ReactNode }

const LEARN: Slide[] = [
  { key: "course", tag: "Course", title: "Thirteen modules, from what NOI is to how an acquisitions team works.",
    body: "Short lessons with diagrams, worked examples and a quiz after every module. One real deal carries through the basics; later modules cover markets, supply and concessions, and the job itself.",
    bullets: ["5 to 9 minutes a lesson", "Your progress saves as you go"],
    visual: <Panel glow="#2f6bffcc">
      <div className="text-xs font-medium text-slate-500">Your course</div>
      {[["1", "Real estate investing basics", 1], ["5", "Net operating income", 1], ["8", "Cash flow and returns", 0.6], ["12", "Markets: supply, demand and competition", 0], ["13", "Underwriting for an acquisitions team", 0]].map(([n, t, p], i) =>
        <div key={String(n)} className="pop mt-3 flex items-center gap-3" style={{ animationDelay: `${150 + i * 120}ms` }}>
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-slate-100 text-xs font-semibold text-slate-600">{n}</span>
          <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{t}</div>
            <div className="mt-1 h-1.5 rounded-full bg-slate-100"><div className="bar h-1.5 rounded-full bg-brand-800" style={{ width: `${Number(p) * 100}%`, animationDelay: `${300 + i * 120}ms` }} /></div></div>
        </div>)}
    </Panel> },
  { key: "challenges", tag: "Challenges", title: "Find the problem in the seller's numbers, then decide.",
    body: "Spot the trick hands you real looking T12s, rent rolls and offering memos with problems planted in them. Deal Duels put a broker's pitch in front of you: pursue, renegotiate or pass.",
    bullets: ["Each miss shows what it would have cost", "Scores, so you can see yourself get better"],
    visual: <Panel glow="#ff8a3dcc">
      <div className="mb-3 flex items-center gap-2 text-xs"><span className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">T12</span><span className="font-semibold">Cedar Ridge Apartments</span></div>
      <table className="tbl text-sm"><tbody>
        <tr><td>Gross potential rent</td><td className="num">$345,600</td><td /></tr>
        <tr><td><span className="mark rounded px-1" style={{ backgroundImage: "linear-gradient(#bbf7d0,#bbf7d0)", animationDelay: "300ms" }}>Vacancy and credit loss</span></td><td className="num">$0</td><td className="pop text-right text-xs font-semibold text-pass-600" style={{ animationDelay: "500ms" }}>caught</td></tr>
        <tr><td><span className="mark rounded px-1" style={{ backgroundImage: "linear-gradient(#fecaca,#fecaca)", animationDelay: "800ms" }}>Property taxes</span></td><td className="num">$14,200</td><td className="pop text-right text-xs font-semibold text-fail-600" style={{ animationDelay: "1000ms" }}>missed</td></tr>
        <tr className="total"><td>Net operating income</td><td className="num">$247,800</td><td /></tr>
      </tbody></table>
      <div className="pop mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800" style={{ animationDelay: "1200ms" }}>Real NOI is $191,701. The planted problems hid about <b>$863,000</b> of value.</div>
    </Panel> },
  { key: "practice", tag: "Practice a deal", title: "Underwrite a full deal, one step at a time.",
    body: "Nine guided steps take you from the rent roll to a decision. Each step shows the math, what's typical, and what changes if you get it wrong.",
    bullets: ["A hint when a number looks off", "Open it in the full workspace when you're done"],
    visual: <Panel glow="#12c7a3cc">
      <div className="flex items-center justify-between text-xs text-slate-500"><span>Maple Court · step 4 of 9</span><span className="num">44%</span></div>
      <div className="mt-2 h-1.5 rounded-full bg-slate-100"><div className="bar h-1.5 rounded-full bg-brand-800" style={{ width: "44%" }} /></div>
      <div className="mt-4 text-lg font-semibold">Vacancy and credit loss</div>
      <div className="mt-2 flex items-center gap-2"><input readOnly value="3" className="!w-20 text-right" /><span className="text-sm text-slate-500">% of gross rent</span></div>
      <div className="pop mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800" style={{ animationDelay: "500ms" }}>That's low. Most underwriters use 5 to 8% even for a full building. It's your call; we'll show the difference at the end.</div>
    </Panel> },
  { key: "tutor", tag: "Desk AI", title: "Ask questions without feeling dumb.",
    body: "Ask it to explain a term another way, check your math, or walk through a deal. It runs every number through the same model you see, so its answers match the screen.",
    bullets: ["Hints first, the answer when you ask for it", "Under every lesson and challenge"],
    visual: <Panel glow="#8b3dffcc">
      <div className="pop ml-auto max-w-[80%] rounded-lg rounded-br-sm bg-brand-900 px-3 py-2 text-sm text-white" style={{ animationDelay: "150ms" }}>Why does the cap rate go up when I add vacancy?</div>
      <div className="pop mt-3 max-w-[90%] rounded-lg rounded-bl-sm bg-slate-100 px-3 py-2 text-sm text-slate-700" style={{ animationDelay: "600ms" }}>It doesn't. Vacancy lowers NOI, and cap rate is NOI ÷ price, so at the same price the cap rate goes <b>down</b>. Oak Ridge at 6% vacancy has $137,440 of NOI: a 6.87% cap at $2,000,000.</div>
    </Panel> },
]

const PRO: Slide[] = [
  { key: "docs", tag: "Documents", title: "Upload the OM, T12 and rent roll instead of typing them.",
    body: "Underwriting Desk reads PDFs, Excel and photos, shows every value with where it came from, and changes nothing until you approve it. A unit level rent roll gives occupancy, loss to lease and lease expirations.",
    bullets: ["The seller's T12 lands next to your numbers", "Every value shows where it came from"],
    visual: <Panel glow="#2f6bffcc">
      {[["Offering memo.pdf", "Price, unit mix, pro forma"], ["T12 Sept 2026.xlsx", "Income and 18 expense lines"], ["Rent roll.csv", "48 units, 45 occupied"]].map(([f, d], i) =>
        <div key={f} className="pop mb-2 flex items-center justify-between rounded-md border border-slate-200 px-3 py-2" style={{ animationDelay: `${150 + i * 200}ms` }}>
          <div><div className="text-sm font-medium">{f}</div><div className="text-xs text-slate-500">{d}</div></div><span className="text-xs font-semibold text-pass-600">read</span></div>)}
      <div className="pop mt-3 text-sm text-slate-600" style={{ animationDelay: "900ms" }}>23 values found. Review and apply →</div>
    </Panel> },
  { key: "market", tag: "Market", title: "Know what you're competing with.",
    body: "Population and renter growth for the ZIP, city and county, apartment permits for the county, and a live scan of nearby rents, concessions and buildings in lease up.",
    bullets: ["New buildings checked against your rent growth", "Rent comps by unit type", "State tax, rent and insurance rules"],
    visual: <Panel glow="#ff8a3dcc">
      <div className="text-xs text-slate-500">Units permitted, 5+ unit buildings</div>
      <div className="mt-3 flex h-28 items-end gap-2">{[398, 582, 49, 218, 1497, 978, 1327].map((v, i) =>
        <div key={i} className="flex flex-1 flex-col items-center gap-1"><div className={`pop w-full rounded-t-sm ${i === 6 ? "bg-gold-400" : "bg-brand-800"}`} style={{ height: v / 1500 * 100, animationDelay: `${200 + i * 90}ms` }} /><span className="text-[10px] text-slate-400">{i === 6 ? "YTD" : 2020 + i}</span></div>)}</div>
      <div className="pop mt-3 rounded-md bg-fail-50 px-3 py-2 text-sm text-fail-700" style={{ animationDelay: "900ms" }}>Heavy new supply. Two lease ups nearby offer 6 to 8 weeks free.</div>
    </Panel> },
  { key: "model", tag: "The model", title: "Build the full underwriting, the way lenders read it.",
    body: "The seller's T12 next to your numbers with a reason for every change, the loan sized on LTV, DSCR and debt yield, a capex budget, value add, lease up, refinance and lender quotes.",
    bullets: ["Expense lines checked against typical ranges", "Month by month cash flow"],
    visual: <Panel glow="#12c7a3cc">
      <table className="tbl text-[13px]"><thead><tr><th /><th>Seller T12</th><th>Underwritten</th></tr></thead><tbody>
        <tr><td>Effective gross income</td><td className="num">$551,900</td><td className="num">$544,122</td></tr>
        <tr className="bg-amber-50"><td>Real estate taxes</td><td className="num">$41,300</td><td className="num">$62,000</td></tr>
        <tr className="total"><td>Net cash flow</td><td className="num">$268,700</td><td className="num">$242,516</td></tr></tbody></table>
      {([["LTV 70%", 100, "$3.36M"], ["DSCR 1.25x", 76, "$2.56M binds"], ["Debt yield 8%", 90, "$3.03M"]] as const).map(([l, w, v], i) =>
        <div key={l} className="mt-2 flex items-center gap-2 text-xs"><span className="w-20 shrink-0 text-slate-600">{l}</span>
          <div className="h-2.5 flex-1 rounded-sm bg-slate-100"><div className="bar h-2.5 rounded-sm" style={{ width: `${w}%`, animationDelay: `${300 + i * 150}ms`, background: i === 1 ? "#167a4a" : "#94a3b8" }} /></div>
          <span className={`w-24 text-right font-mono ${i === 1 ? "font-semibold text-pass-700" : "text-slate-500"}`}>{v}</span></div>)}
    </Panel> },
  { key: "decide", tag: "The decision", title: "Get to a price you can defend.",
    body: "Pass or fail against your buy box, the most you can pay, your thesis and risks, and an investment memo, Excel model or read only link for whoever needs to see it.",
    bullets: ["Investment memo PDF and Excel model", "A pipeline to track every deal"],
    visual: <Panel glow="#8b3dffcc">
      <div className="flex items-center justify-between"><div><div className="text-xs text-slate-500">Oak Ridge Apartments · 20 units</div><div className="text-xl font-semibold">Clears the buy box</div></div>
        <span className="rounded-md bg-pass-50 px-2 py-1 text-xs font-semibold text-pass-700">Pursue</span></div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">{[["IRR, 5 yr", "12.8%"], ["DSCR", "1.29x"], ["Multiple", "1.75x"]].map(([k, v], i) =>
        <div key={k} className="pop rounded-md border border-slate-200 py-2" style={{ animationDelay: `${200 + i * 120}ms` }}><div className="text-[11px] text-slate-500">{k}</div><div className="num font-semibold">{v}</div></div>)}</div>
      <div className="pop mt-4 flex gap-2" style={{ animationDelay: "700ms" }}><span className="btn !text-xs">Investment memo</span><span className="btn !text-xs">Excel</span><span className="btn !text-xs">Share link</span></div>
    </Panel> },
]

function Story({ id, label, accent, slides, cta, onCta }: { id: string; label: string; accent: string; slides: Slide[]; cta: string; onCta: () => void }) {
  return <Showcase id={id} accent={accent} heading={label} items={slides.map(x => ({ key: x.key, name: x.tag, title: x.title, body: x.body, visual: x.visual }))}
    action={<button className={`btn ${id === "pro" ? "btn-gold" : "!border-white !bg-white !text-ink"}`} onClick={onCta}>{cta} →</button>} />
}

export default function PathPicker({ username, onPick }: { username?: string | null; current?: Path | null; onPick: (p: Path) => void }) {
  const root = useRef<HTMLDivElement>(null)
  useScrollVar(root)
  const to = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  return (
    <div ref={root} className="lp relative overflow-x-clip">
      <Sky />
      <div className="relative z-10">
        <section className="mx-auto flex min-h-[calc(100svh-64px)] max-w-5xl flex-col items-center justify-center px-4 text-center">
          <div className="rise text-sm text-white/60">{username ? `Welcome, ${username}.` : "Welcome."}</div>
          <h1 className="rise serif mt-3 text-4xl font-semibold leading-tight text-white md:text-6xl" style={{ animationDelay: "120ms" }}>Two ways to use Underwriting Desk.</h1>
          <p className="rise mt-5 max-w-2xl text-lg text-white/65" style={{ animationDelay: "250ms" }}>Learn underwriting from the ground up, or put it to work on a live deal. Preview both below, or jump straight in. You can switch any time from the top of the page.</p>
          <div className="rise mt-10 grid w-full max-w-3xl gap-4 sm:grid-cols-2" style={{ animationDelay: "400ms" }}>
            {([["learner", "Learn to underwrite", "New to underwriting, or training interns", "learn"], ["pro", "Underwrite a deal", "Working a live deal", "pro"]] as const).map(([p, t, who, id]) => (
              <div key={p} className="rounded-lg border border-white/12 bg-white/[.04] p-5 text-left backdrop-blur">
                <div className="text-xs text-white/50">{who}</div>
                <div className="mt-1 text-xl font-semibold text-white">{t}</div>
                <div className="mt-4 flex gap-2">
                  <button className={`btn whitespace-nowrap ${p === "pro" ? "btn-gold" : "!border-white !bg-white !text-ink"}`} onClick={() => onPick(p)}>{p === "pro" ? "Open the workspace" : "Start learning"}</button>
                  <button className="btn btn-ghost whitespace-nowrap" onClick={() => to(id)}>Preview ↓</button>
                </div>
              </div>))}
          </div>
          <button onClick={() => to("learn")} className="cue mt-14 text-xs uppercase tracking-[.25em] text-white/45">Scroll<div className="mx-auto mt-2 h-8 w-px bg-gradient-to-b from-white/60 to-transparent" /></button>
        </section>
        <Story id="learn" label="Learn to underwrite" accent="#e8eefb" slides={LEARN} cta="Start learning" onCta={() => onPick("learner")} />
        <Story id="pro" label="Underwrite a deal" accent="#f4b24c" slides={PRO} cta="Open the workspace" onCta={() => onPick("pro")} />
        <section className="px-4 pb-32 pt-24 text-center">
          <h2 className="serif text-3xl font-semibold text-white md:text-5xl">Where do you want to start?</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button className="btn !border-white !bg-white px-5 py-2.5 !text-ink" onClick={() => onPick("learner")}>Start learning</button>
            <button className="btn btn-gold px-5 py-2.5" onClick={() => onPick("pro")}>Open the workspace</button>
          </div>
        </section>
      </div>
    </div>
  )
}
