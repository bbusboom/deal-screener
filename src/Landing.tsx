// Public home page shown before someone has an account.
// Cinematic night skyline, a pinned scroll story where each use of the site slides in, and reveal animations.
// Numbers in the mockups come from the course's Oak Ridge example and the Cedar Ridge challenge, so they're real model output.
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { CheckIcon, StarIcon } from "./components/Site"
import "./landing.css"

type Go = (mode: "signin" | "signup") => void

/* ---------- motion helpers ---------- */
/** Writes scrollY into a CSS variable so parallax layers move without re-rendering React. */
export function useScrollVar(root: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    let raf = 0
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => root.current?.style.setProperty("--sy", String(scrollY))) }
    on(); addEventListener("scroll", on, { passive: true })
    return () => { cancelAnimationFrame(raf); removeEventListener("scroll", on) }
  }, [root])
}
/** Which stage of a tall pinned section is on screen. Also writes --p (0..1) on the section for the progress bar. */
/** Scroll distance per pinned slide, in viewport heights. Lower means less scrolling to get through the slides. */
export const STAGE_VH = 45
/** Phones skip the pinned slides and show them as normal stacked sections, so scrolling never feels stuck. */
export function useIsPhone() {
  const q = "(max-width: 767px)"
  const [m, setM] = useState(() => typeof matchMedia !== "undefined" && matchMedia(q).matches)
  useEffect(() => { const mq = matchMedia(q), f = () => setM(mq.matches); mq.addEventListener("change", f); return () => mq.removeEventListener("change", f) }, [])
  return m
}
export function useStage(ref: React.RefObject<HTMLElement | null>, n: number) {
  const [stage, setStage] = useState(0)
  useEffect(() => {
    let raf = 0
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => {
      const el = ref.current; if (!el) return
      const r = el.getBoundingClientRect(), total = r.height - innerHeight
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, total)))
      el.style.setProperty("--p", p.toFixed(4))
      setStage(Math.min(n - 1, Math.floor(p * n * 0.999)))
    }) }
    on(); addEventListener("scroll", on, { passive: true }); addEventListener("resize", on)
    return () => { cancelAnimationFrame(raf); removeEventListener("scroll", on); removeEventListener("resize", on) }
  }, [ref, n])
  return stage
}
export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect() } }, { threshold: 0.15 })
    io.observe(el); return () => io.disconnect()
  }, [])
  return <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>
}

/* ---------- night skyline ---------- */
function rng(seed: number) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 } }
function Skyline({ seed, cls, maxH, fill, lit }: { seed: number; cls: string; maxH: number; fill: string; lit: number }) {
  const { blds, wins } = useMemo(() => {
    const r = rng(seed), blds: { x: number; w: number; h: number; spire: boolean }[] = [], wins: { x: number; y: number; cool: boolean; tw: boolean; d: number }[] = []
    let x = -10
    while (x < 1460) {
      const w = 40 + r() * 90, h = 80 + r() * maxH * (0.4 + 0.6 * Math.sin((x / 1440) * Math.PI) ** 0.6)
      blds.push({ x, w, h, spire: r() < 0.12 })
      for (let wy = 500 - h + 14; wy < 488; wy += 14) for (let wx = x + 8; wx < x + w - 10; wx += 11)
        if (r() < lit) wins.push({ x: wx, y: wy, cool: r() < 0.18, tw: r() < 0.08, d: r() * 7 })
      x += w + 2 + r() * 6
    }
    return { blds, wins }
  }, [seed, maxH, lit])
  return (
    <svg className={`lp-skyline ${cls}`} viewBox="0 0 1440 500" preserveAspectRatio="xMidYMax slice" aria-hidden>
      {blds.map((b, i) => <g key={i}>
        <rect x={b.x} y={500 - b.h} width={b.w} height={b.h} fill={fill} />
        {b.spire && <rect x={b.x + b.w / 2 - 1.5} y={500 - b.h - 26} width={3} height={26} fill={fill} />}
      </g>)}
      {wins.map((w, i) => <rect key={i} x={w.x} y={w.y} width={5} height={7} rx={0.5} className={`w ${w.cool ? "cool" : ""} ${w.tw ? "tw" : ""}`} style={w.tw ? { animationDelay: `${w.d}s` } : undefined} opacity={0.85} />)}
    </svg>
  )
}
export function Sky() {
  return (
    <div className="lp-sky" aria-hidden>
      <div className="lp-blob b1" /><div className="lp-blob b2" /><div className="lp-blob b3" /><div className="lp-blob b4" />
      <div className="lp-stars" />
      <Skyline seed={7} cls="far" maxH={340} fill="#101a3d" lit={0.05} />
      <Skyline seed={42} cls="near" maxH={190} fill="#070c1f" lit={0.12} />
      <div className="lp-vignette" />
    </div>
  )
}

/* ---------- pieces ---------- */
const Logo = () => (
  <div className="flex items-center gap-2">
    <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#f4b24c] text-sm font-bold text-[#1c1305]">UD</div>
    <div className="whitespace-nowrap font-bold leading-tight text-white">Underwriting Desk<div className="hidden text-[11px] font-normal text-white/60 sm:block">Real estate underwriting</div></div>
  </div>
)

function HeroMock() {
  const kpis: [string, string][] = [["NOI, year 1", "$137,440"], ["Cap rate", "6.87%"], ["DSCR", "1.29x"], ["IRR, 5 yr", "12.8%"]]
  return (
    <div className="float relative">
      <div className="card-white glow-blue rounded-2xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <div><div className="text-xs text-slate-400">Oak Ridge Apartments · 20 units</div><div className="font-semibold">Underwriting summary</div></div>
          <span className="rounded-full bg-pass-50 px-2.5 py-1 text-xs font-semibold text-pass-600">Pursue</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {kpis.map(([l, v]) => (
            <div key={l} className="rounded-lg border border-l-4 border-l-pass-600 px-3 py-2">
              <div className="text-[11px] text-slate-500">{l}</div><div className="num text-lg font-semibold">{v}</div>
            </div>))}
        </div>
        <div className="mt-3 flex h-20 items-end gap-1.5 rounded-lg bg-slate-50 p-2">
          {[32, 35, 38, 41, 44].map((h, i) => <div key={i} className="flex-1 rounded-t bg-brand-500/80" style={{ height: `${h + 20}%` }} />)}
          <div className="flex-[1.4] rounded-t bg-gradient-to-t from-pass-600 to-emerald-400" style={{ height: "100%" }} />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-slate-400"><span>Cash flow years 1 to 5</span><span>Sale</span></div>
      </div>
      <div className="card-white absolute -bottom-8 -left-8 hidden w-64 rounded-xl p-3 text-sm shadow-2xl sm:block" style={{ boxShadow: "0 16px 40px -20px #000000aa" }}>
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-amber-600">Flagged</div>
        <p className="text-slate-700">The seller's taxes are from 2009. On your price, budget about <b>$32,600</b>, not $14,200.</p>
      </div>
    </div>
  )
}

/* ---------- the five uses, as stages ---------- */
type StageDef = { key: string; tag: string; title: string; body: string; bullets: string[]; accent: string; bg: string; visual: ReactNode }
export const Panel = ({ children }: { children: ReactNode; glow?: string }) =>
  <div className="card-white w-full max-w-md rounded-xl p-5" style={{ boxShadow: "0 1px 0 #ffffff10, 0 24px 48px -28px #000000cc" }}>{children}</div>

const STAGES: StageDef[] = [
  { key: "learn", tag: "01 · Learn", title: "Start with what NOI is. End up reading a T12 the way a lender does.",
    body: "Thirteen modules. One deal follows you through the early ones, from rent and expenses to cap rate, loan size and IRR, and each module ends with a short quiz.",
    bullets: ["Lessons run 5 to 9 minutes", "Every formula broken down, one step at a time"],
    accent: "#f4b24c", bg: "transparent",
    visual: <Panel glow="#2f6bffcc">
      <div className="text-xs font-semibold uppercase tracking-wide text-brand-500">Module 5 · Net operating income</div>
      <div className="mt-3 space-y-2 font-mono text-sm">
        {[["Gross potential rent", "$264,000"], ["less vacancy 5%", "−$13,200"], ["plus other income", "$9,600"], ["Effective gross income", "$260,400"], ["less operating expenses", "−$122,960"]].map(([l, v], i) =>
          <div key={l} className="pop flex justify-between border-b border-slate-100 pb-1" style={{ animationDelay: `${150 + i * 140}ms` }}><span className="font-sans text-slate-600">{l}</span><span>{v}</span></div>)}
        <div className="pop flex justify-between pt-1 text-base font-bold" style={{ animationDelay: "900ms" }}><span className="font-sans">Net operating income</span><span className="text-pass-600">$137,440</span></div>
      </div>
      <div className="pop mt-4 rounded-lg bg-pass-50 px-3 py-2 text-sm text-pass-600" style={{ animationDelay: "1150ms" }}>Quiz: correct. Debt service is not an operating expense.</div>
    </Panel> },
  { key: "trick", tag: "02 · Spot the trick", title: "The seller's T12 isn't the deal.",
    body: "Each challenge hands you a T12 or rent roll with something wrong in it: no vacancy, a tax bill from 2009, a one time payment counted as income. Miss it and you see what it would have cost you.",
    bullets: ["Scored on what you catch", "Every trap explained afterward"],
    accent: "#f4b24c", bg: "transparent",
    visual: <Panel glow="#ff8a3dcc">
      <div className="mb-3 flex items-center gap-2 text-xs"><span className="rounded bg-slate-200 px-2 py-0.5 font-semibold text-slate-600">T12</span><span className="font-semibold">Cedar Ridge Apartments</span></div>
      <table className="tbl text-sm"><tbody>
        <tr><td>Gross potential rent</td><td className="num">$345,600</td><td /></tr>
        <tr><td><span className="mark rounded px-1" style={{ backgroundImage: "linear-gradient(#bbf7d0,#bbf7d0)", animationDelay: "300ms" }}>Vacancy and credit loss</span></td><td className="num">$0</td><td className="pop text-right text-xs font-semibold text-pass-600" style={{ animationDelay: "500ms" }}>✓ caught</td></tr>
        <tr><td><span className="mark rounded px-1" style={{ backgroundImage: "linear-gradient(#bbf7d0,#bbf7d0)", animationDelay: "700ms" }}>Property taxes</span></td><td className="num">$14,200</td><td className="pop text-right text-xs font-semibold text-pass-600" style={{ animationDelay: "900ms" }}>✓ caught</td></tr>
        <tr><td>Insurance</td><td className="num">$19,000</td><td /></tr>
        <tr><td><span className="mark rounded px-1" style={{ backgroundImage: "linear-gradient(#fecaca,#fecaca)", animationDelay: "1100ms" }}>Management fee</span></td><td className="num">$0</td><td className="pop text-right text-xs font-semibold text-fail-600" style={{ animationDelay: "1300ms" }}>✗ missed</td></tr>
        <tr className="total"><td>Net operating income</td><td className="num">$247,800</td><td /></tr>
      </tbody></table>
      <div className="pop mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800" style={{ animationDelay: "1500ms" }}><b className="inline-flex align-[-2px]"><StarIcon className="h-4 w-4" /><StarIcon className="h-4 w-4" /><StarIcon className="h-4 w-4 text-amber-300" filled={false} /></b> Real NOI is $191,701. Those lines hid about <b>$863,000</b> of value.</div>
    </Panel> },
  { key: "duel", tag: "03 · Deal Duels", title: "A broker calls with a deal. Make the call.",
    body: "Fix the seller's numbers before the clock runs out, then pursue, go in lower, or pass. Afterward you see what the deal was really worth.",
    bullets: ["Deals set in Arkansas, Texas, Ohio and Florida", "Scored out of 100"],
    accent: "#f4b24c", bg: "transparent",
    visual: <Panel glow="#ff3d7acc">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-800 text-xs font-bold text-white">BR</div>
        <div className="pop rounded-2xl rounded-tl-sm bg-slate-100 px-3 py-2 text-sm text-slate-700" style={{ animationDelay: "200ms" }}>32 units in Little Rock, 7.1% cap on the seller's actuals. Best and final is Friday. You in?</div>
        <svg viewBox="0 0 40 40" className="h-11 w-11 shrink-0 -rotate-90"><circle cx="20" cy="20" r="18" fill="none" stroke="#f1f5f9" strokeWidth="4" /><circle className="ring" cx="20" cy="20" r="18" fill="none" stroke="#f4b24c" strokeWidth="4" strokeLinecap="round" /></svg>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-sm font-semibold">
        {["Pursue", "Renegotiate", "Pass"].map((b, i) => <div key={b} className={`pop rounded-lg border px-2 py-2 text-center ${b === "Renegotiate" ? "border-[#0c1533] bg-[#0c1533] text-white" : "border-slate-200 text-slate-600"}`} style={{ animationDelay: `${500 + i * 120}ms` }}>{b}</div>)}
      </div>
      <div className="pop mt-4 flex items-center justify-between rounded-lg bg-slate-900 px-4 py-3 text-white" style={{ animationDelay: "1100ms" }}>
        <div><div className="text-[11px] uppercase tracking-wide text-white/50">Your score</div><div className="text-2xl font-bold">86<span className="text-sm text-white/50"> / 100</span></div></div>
        <div className="text-right text-xs text-white/70">True NOI $184,501<br />Fair price about $2.55M</div>
      </div>
    </Panel> },
  { key: "uw", tag: "04 · Underwrite", title: "The same workspace you'd use on a live deal.",
    body: "The seller's T12 next to your numbers, with a place to write why you changed each line. The loan sized the way a lender sizes it. A capex budget, your thesis, and a memo you can hand to your boss.",
    bullets: ["Upload the rent roll, T12 or OM instead of typing it", "Expense lines checked against typical ranges", "The most you can pay and still clear your buy box"],
    accent: "#f4b24c", bg: "transparent",
    visual: <Panel glow="#12c7a3cc">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-600">Operating statement</div>
      <table className="tbl text-[13px]">
        <thead><tr><th /><th>Seller T12</th><th>Underwritten</th></tr></thead>
        <tbody>
          <tr><td>Effective gross income</td><td className="num">$551,900</td><td className="num">$544,122</td></tr>
          <tr className="bg-amber-50"><td>Repairs & maintenance</td><td className="num">$21,400</td><td className="num">$36,000</td></tr>
          <tr><td>Real estate taxes</td><td className="num">$41,300</td><td className="num">$62,000</td></tr>
          <tr className="total"><td>Net cash flow</td><td className="num">$268,700</td><td className="num">$242,516</td></tr>
        </tbody>
      </table>
      <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Loan sizing</div>
      {([["LTV 70%", 100, "$3.36M"], ["DSCR 1.25x", 76, "$2.56M · binds"], ["Debt yield 8%", 90, "$3.03M"]] as const).map(([l, w, v], i) =>
        <div key={l} className="mt-2 flex items-center gap-2 text-xs">
          <span className="w-24 shrink-0 text-slate-600">{l}</span>
          <div className="h-3 flex-1 rounded bg-slate-100"><div className="bar h-3 rounded" style={{ width: `${w}%`, animationDelay: `${300 + i * 180}ms`, background: i === 1 ? "#12a37f" : "#94a3b8" }} /></div>
          <span className={`w-24 shrink-0 text-right font-mono ${i === 1 ? "font-bold text-emerald-700" : "text-slate-500"}`}>{v}</span>
        </div>)}
    </Panel> },
  { key: "market", tag: "05 · Market check", title: "Check the market before you fall for the building.",
    body: "What happens to property taxes after the sale, rent rules, flood zones, area rents and incomes, jobs, and today's rates, for every state and DC.",
    bullets: ["Pulled from Census, FEMA, HUD, BLS and FRED", "Policy summary written to stay neutral"],
    accent: "#f4b24c", bg: "transparent",
    visual: <Panel glow="#8b3dffcc">
      <div className="flex items-center justify-between"><div><div className="text-xs text-slate-400">Example</div><div className="font-semibold">Fayetteville, Arkansas</div></div><span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">AR</span></div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        {[["Property tax", "Reassessed after sale"], ["Rent control", "Preempted statewide"], ["Flood zone", "Check FEMA map"], ["Rates", "Live from FRED"], ["Area rents", "HUD fair market rent"], ["Jobs", "BLS county data"]].map(([a, b], i) =>
          <div key={a} className="pop rounded-lg border border-slate-200 px-3 py-2" style={{ animationDelay: `${150 + i * 110}ms` }}><div className="text-[11px] text-slate-500">{a}</div><div className="font-medium">{b}</div></div>)}
      </div>
      <div className="pop mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800" style={{ animationDelay: "900ms" }}>Your tax line is below the estimate on your price. <b>Fix it →</b></div>
    </Panel> },
]

/** A feature list on the left with a live preview on the right. Normal scrolling: it cycles on its own
 *  until someone clicks, and pauses while the pointer is over it. Used on the landing and welcome pages. */
export type ShowItem = { key: string; name: string; title: string; body: string; visual: ReactNode }
export function Showcase({ id, items, accent = "#f4b24c", heading, intro, action }: { id: string; items: ShowItem[]; accent?: string; heading: ReactNode; intro?: ReactNode; action?: ReactNode }) {
  const [i, setI] = useState(0), [auto, setAuto] = useState(true), [hover, setHover] = useState(false)
  const DUR = 7000
  useEffect(() => {
    if (!auto || hover || matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const t = setTimeout(() => setI(n => (n + 1) % items.length), DUR)
    return () => clearTimeout(t)
  }, [i, auto, hover, items.length])
  const pick = (n: number) => { setAuto(false); setI(n) }
  const s = items[i]
  return (
    <section id={id} className="scroll-mt-16 py-20 md:py-28" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><h2 className="serif text-3xl font-semibold leading-tight text-white md:text-5xl">{heading}</h2>
            {intro && <p className="mt-3 max-w-xl text-lg text-white/60">{intro}</p>}</div>
          {action}
        </div>
        <div className="-mx-5 mt-8 flex gap-2 overflow-x-auto px-5 pb-1 md:hidden">
          {items.map((x, n) => <button key={x.key} onClick={() => pick(n)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${n === i ? "text-[#1c1305]" : "bg-white/10 text-white/70"}`} style={n === i ? { background: accent } : undefined}>{x.name}</button>)}
        </div>
        <div className="mt-8 grid gap-10 md:mt-12 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-start">
          <ol className="hidden space-y-1 md:block">
            {items.map((x, n) => {
              const on = n === i
              return (
                <li key={x.key}>
                  <button onClick={() => pick(n)} aria-current={on ? "true" : undefined} className={`relative block w-full overflow-hidden rounded-lg px-5 py-4 text-left transition ${on ? "bg-white/[.06]" : "hover:bg-white/[.03]"}`}>
                    <div className="text-sm font-semibold" style={{ color: on ? accent : "#ffffff73" }}>{x.name}</div>
                    <div className={`serif mt-1 text-xl font-semibold leading-snug ${on ? "text-white" : "text-white/55"}`}>{x.title}</div>
                    {on && <p className="mt-2 text-[15px] leading-relaxed text-white/65">{x.body}</p>}
                    {on && auto && !hover && <span key={i} className="absolute bottom-0 left-0 h-0.5" style={{ background: accent, animation: `lpfill ${DUR}ms linear forwards` }} />}
                  </button>
                </li>)
            })}
          </ol>
          <div>
            <div className="md:hidden">
              <h3 className="serif text-2xl font-semibold leading-snug text-white">{s.title}</h3>
              <p className="mt-2 text-white/65">{s.body}</p>
            </div>
            <div key={s.key} className="visual lp-fade lp-show mt-6 flex justify-center md:sticky md:top-24 md:mt-0 md:justify-end">{s.visual}</div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Story() {
  return <Showcase id="features" heading="What's inside" intro="Five tools, one place. Learn it, practice it on deals built to trick you, then use it on real ones."
    items={STAGES.map(x => ({ key: x.key, name: x.tag.split(" · ")[1] || x.tag, title: x.title, body: x.body, visual: x.visual }))} />
}

/* ---------- page ---------- */
const COMPARE: [string, string, string, string][] = [
  ["Learn from the basics to IRR", "✓", "✓", "—"],
  ["Timed Deal Checks scored against an answer key", "✓", "—", "—"],
  ["Practice on realistic deals with seller traps built in", "✓", "Sometimes", "—"],
  ["Learn and underwrite live deals in the same tool", "✓", "—", "—"],
  ["Questions answered about the lesson or your deal", "✓", "—", "—"],
  ["Upload real documents and model them", "✓", "—", "✓"],
  ["State tax, rent law and market data built in", "✓", "—", "Paid add-on"],
  ["Free to start", "✓", "Rarely", "Rarely"],
]
const TEAMS: [string, string, boolean][] = [
  ["The basics, in order", "Thirteen modules, from reading a rent roll to IRR, with every formula worked out on the same example property.", false],
  ["A score, not a feeling", "Deal Check times each person on a broker package and scores NOI, cap rate, DSCR and the call, so readiness is a number, not a guess.", false],
  ["Your firm's standards", "Load your own buy box and expense assumptions so new hires learn your way, and see the whole team's progress in one view.", true],
]
const FAQ: [string, string][] = [
  ["Can my whole team use it?", "Yes. Each person makes a free account and works at their own pace, on the website or the Underwriting Desk phone app. A team view where you see everyone's progress and Deal Check scores in one place is coming next."],
  ["Do I need to know anything about real estate?", "No. The Learn path starts with what a rental property earns and costs, and builds one step at a time. If you already underwrite, skip straight to the workspace."],
  ["Is it free?", "Yes, it's free to use while we build it out. We'll always keep a free way to learn."],
  ["Is this investment advice?", "No. Underwriting Desk is a learning and screening tool. Always verify rent rolls, taxes and insurance with the actual documents and local professionals."],
  ["Who built it?", "Blake Busboom, a University of Arkansas student who underwrites multifamily deals for a family real estate company, built around how real deals actually get screened."],
]
const HEADLINE = ["Train", "analysts", "on", "real", "deals.", "Know", "who's", "ready."]

export default function Landing({ go }: { go: Go }) {
  const root = useRef<HTMLDivElement>(null)
  useScrollVar(root)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => { const on = () => setScrolled(scrollY > 40); on(); addEventListener("scroll", on, { passive: true }); return () => removeEventListener("scroll", on) }, [])

  return (
    <div ref={root} className="lp relative min-h-screen overflow-x-clip">
      <Sky />

      <header className={`fixed inset-x-0 top-0 z-40 transition-colors duration-500 ${scrolled ? "border-b border-white/10 bg-[#060a18]/70 backdrop-blur-xl" : ""}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Logo />
          <nav className="hidden gap-7 text-sm text-white/70 md:flex">
            <a href="#features" className="hover:text-white">What's inside</a>
            <a href="#teams" className="hover:text-white">For teams</a>
            <a href="#different" className="hover:text-white">Why it's different</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={() => go("signin")} className="whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-medium text-white/85 hover:bg-white/10">Sign in</button>
            <button onClick={() => go("signup")} className="whitespace-nowrap rounded-md bg-white px-4 py-1.5 text-sm font-semibold text-[#0b1330] transition hover:bg-white/90">Create account</button>
          </div>
        </div>
      </header>

      <div className="relative z-10">
        {/* hero */}
        <section className="relative mx-auto grid min-h-[100svh] max-w-7xl items-center gap-14 px-4 pb-28 pt-28 md:grid-cols-[1.1fr_.9fr] md:px-8">
          <div>
            <div className="rise mb-5 text-sm font-medium text-[#f4b24c]">Underwriting training for acquisitions teams</div>
            <h1 className="serif text-[2.6rem] font-semibold leading-[1.05] md:text-7xl">
              {HEADLINE.map((w, i) => <span key={i} className="rise inline-block text-white" style={{ animationDelay: `${120 + i * 70}ms` }}><span className={i >= 5 ? "shine" : ""}>{w}</span>&nbsp;</span>)}
            </h1>
            <p className="rise mt-6 max-w-xl text-lg text-white/70" style={{ animationDelay: "800ms" }}>Underwriting Desk teaches underwriting from the first rent roll to IRR, then tests it: new hires work realistic broker packages on a clock and get a score. When they're ready, they run live deals in the same workspace. Learning on your own works the same way.</p>
            <div className="rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: "950ms" }}>
              <button onClick={() => go("signup")} className="rounded-md bg-[#f4b24c] px-6 py-3 font-semibold text-[#1c1305] transition hover:bg-[#ffc266]">Start free →</button>
              <a href="#features" className="rounded-md px-6 py-3 font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/10">See what's inside</a>
            </div>
            <div className="rise mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/55" style={{ animationDelay: "1100ms" }}>
              <span>Free to start. Built by an underwriter, not a software company.</span>
            </div>
          </div>
          <div className="rise" style={{ animationDelay: "600ms" }}><HeroMock /></div>
        </section>

        <Story />

        {/* why I built this */}
        <section id="why" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:px-8">
          <Reveal className="glass grid items-center gap-8 overflow-hidden rounded-3xl p-6 md:grid-cols-[280px_1fr] md:p-10">
            <img src="/founder.jpg?v=2" alt="Blake Busboom, founder of Underwriting Desk" className="mx-auto aspect-[4/5] w-56 rounded-2xl object-cover md:w-full" loading="lazy" />
            <div>
              <div className="text-sm font-semibold uppercase tracking-[.2em] text-[#f4b24c]">Why I built this</div>
              <blockquote className="serif mt-4 text-3xl font-semibold leading-snug text-white md:text-4xl">“I was thrown into the work fast, and half the language went over my head.”</blockquote>
              <p className="mt-5 max-w-2xl text-white/75 md:text-lg">When I started underwriting, there was no simple path to learn it. I was thrown into the work fast, and half the language went over my head. I built Underwriting Desk so junior underwriters can learn the basics quickly, then use their own mistakes to get good fast.</p>
              <div className="mt-5 text-sm text-white/60"><span className="font-semibold text-white">Blake Busboom</span>, founder · junior underwriter</div>
            </div>
          </Reveal>
        </section>

        {/* for teams */}
        <section id="teams" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:px-8">
          <Reveal className="max-w-2xl">
            <div className="text-sm font-semibold uppercase tracking-[.2em] text-[#f4b24c]">For teams</div>
            <h2 className="serif mt-3 text-4xl font-semibold text-white md:text-5xl">Get new hires underwriting sooner.</h2>
            <p className="mt-4 text-white/65">Built inside a family real estate firm to train its own interns. Hand a new analyst Underwriting Desk on day one instead of a spreadsheet and a stack of old deals.</p>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {TEAMS.map(([t, b, soon], i) => (
              <Reveal key={t} delay={i * 120} className="glass rounded-3xl p-6">
                <div className="flex items-center gap-2"><h3 className="text-lg font-semibold text-white">{t}</h3>{soon && <span className="rounded-full border border-white/20 px-2 py-0.5 text-[11px] text-white/60">Coming soon</span>}</div>
                <p className="mt-2 text-sm text-white/60">{b}</p>
              </Reveal>))}
          </div>
        </section>

        {/* why different */}
        <section id="different" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:px-8">
          <Reveal className="max-w-2xl">
            <div className="text-sm font-semibold uppercase tracking-[.2em] text-[#f4b24c]">Why it's different</div>
            <h2 className="serif mt-3 text-4xl font-semibold text-white md:text-5xl">Courses don't let you practice. Software doesn't teach.</h2>
            <p className="mt-4 text-white/65">Most people learn underwriting from videos or by being handed a spreadsheet and an old deal. Underwriting Desk puts the lesson, the practice deal and the real model in one place, so the mistakes happen on practice deals instead of real ones.</p>
          </Reveal>
          <Reveal delay={150} className="glass mt-10 overflow-x-auto rounded-3xl">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/10 text-left">
                <th className="px-5 py-4" /><th className="px-5 py-4 text-center font-semibold text-[#f4b24c]">Underwriting Desk</th>
                <th className="px-5 py-4 text-center font-medium text-white/50">Video courses</th><th className="px-5 py-4 text-center font-medium text-white/50">Underwriting software</th>
              </tr></thead>
              <tbody>{COMPARE.map(([f, a, b, c]) => (
                <tr key={f} className="border-b border-white/5 last:border-0">
                  <td className="px-5 py-3.5 text-white/85">{f}</td>{[a, b, c].map((v, k) => <td key={k} className={`px-5 py-3.5 text-center ${k ? "text-white/45" : "font-semibold text-white"}`}>{v === "✓" ? <CheckIcon className={`h-5 w-5 ${k ? "" : "text-[#f4b24c]"}`} label="Yes" /> : v === "—" ? <span aria-label="No">–</span> : v}</td>)}
                </tr>))}</tbody>
            </table>
          </Reveal>
        </section>

        {/* faq */}
        <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-16 md:px-8">
          <Reveal><h2 className="serif text-4xl font-semibold text-white">Questions</h2></Reveal>
          <Reveal delay={100} className="glass mt-8 divide-y divide-white/10 rounded-3xl">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group p-5">
                <summary className="cursor-pointer list-none font-semibold text-white">{q}<span className="float-right text-white/40 transition group-open:rotate-45">+</span></summary>
                <p className="mt-2 text-sm text-white/60">{a}</p>
              </details>))}
          </Reveal>
        </section>

        {/* final cta */}
        <section className="relative px-4 pb-40 pt-24 text-center">
          <Reveal>
            <h2 className="serif mx-auto max-w-3xl text-4xl font-semibold text-white md:text-6xl">Try it on one deal.</h2>
            <p className="mx-auto mt-5 max-w-xl text-white/65">Make a free account and start with Cedar Ridge, a five minute challenge with three seller traps hidden in the T12. Then take a Deal Check and see your score.</p>
            <button onClick={() => go("signup")} className="mt-9 rounded-md bg-[#f4b24c] px-8 py-3.5 font-semibold text-[#1c1305] transition hover:bg-[#ffc266]">Create your free account</button>
            <div className="mt-4 text-sm text-white/55">Already have one? <button onClick={() => go("signin")} className="underline hover:text-white">Sign in</button></div>
          </Reveal>
        </section>

        <footer className="relative border-t border-white/10 bg-[#060a18]/80 py-6 text-center text-xs text-white/40 backdrop-blur">© {new Date().getFullYear()} Underwriting Desk · A learning and screening tool, not investment advice.</footer>
      </div>
    </div>
  )
}
