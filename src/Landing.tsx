// Public home page shown before someone has an account.
// Cinematic night skyline, a pinned scroll story where each use of the site slides in, and reveal animations.
// Numbers in the mockups come from the course's Oak Ridge example and the Cedar Ridge challenge, so they're real model output.
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import "./landing.css"

type Go = (mode: "signin" | "signup") => void

/* ---------- motion helpers ---------- */
/** Writes scrollY into a CSS variable so parallax layers move without re-rendering React. */
function useScrollVar(root: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    let raf = 0
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => root.current?.style.setProperty("--sy", String(scrollY))) }
    on(); addEventListener("scroll", on, { passive: true })
    return () => { cancelAnimationFrame(raf); removeEventListener("scroll", on) }
  }, [root])
}
/** Which stage of a tall pinned section is on screen. Also writes --p (0..1) on the section for the progress bar. */
function useStage(ref: React.RefObject<HTMLElement | null>, n: number) {
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
function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect() } }, { threshold: 0.15 })
    io.observe(el); return () => io.disconnect()
  }, [])
  return <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>
}
function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null), [v, setV] = useState(0)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect()
      const t0 = performance.now(), run = (t: number) => { const k = Math.min(1, (t - t0) / 1400); setV(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(run) }
      requestAnimationFrame(run)
    }, { threshold: 0.5 })
    io.observe(el); return () => io.disconnect()
  }, [to])
  return <span ref={ref}>{v}{suffix}</span>
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
function Sky() {
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
    <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-[#ffd28a] to-[#ff8a3d] text-sm font-bold text-[#1a1030]">DS</div>
    <div className="whitespace-nowrap font-bold leading-tight text-white">Deal Screener<div className="hidden text-[11px] font-normal text-white/60 sm:block">with Deal School AI</div></div>
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
      <div className="card-white absolute -bottom-8 -left-8 hidden w-64 rounded-xl p-3 text-sm shadow-2xl sm:block" style={{ boxShadow: "0 20px 60px -15px #ff8a3d88" }}>
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-amber-600">Deal School AI</div>
        <p className="text-slate-700">The seller's taxes are from 2009. On your price, budget about <b>$32,600</b>, not $14,200.</p>
      </div>
    </div>
  )
}

/* ---------- the five uses, as stages ---------- */
type StageDef = { key: string; tag: string; title: string; body: string; bullets: string[]; accent: string; bg: string; visual: ReactNode }
const Panel = ({ children, glow }: { children: ReactNode; glow: string }) =>
  <div className="card-white w-full max-w-md rounded-2xl p-5" style={{ boxShadow: `0 0 0 1px #ffffff18, 0 40px 100px -25px ${glow}, 0 0 140px -40px ${glow}` }}>{children}</div>

const STAGES: StageDef[] = [
  { key: "learn", tag: "01 · Learn", title: "Start at “what is NOI?” Finish reading deals like a lender.",
    body: "Thirteen modules carry one real deal from rent and expenses to cap rates, debt sizing, IRR and exit caps, with diagrams, calculators and quizzes.",
    bullets: ["One worked deal through every lesson", "Deal School AI under each lesson", "Progress saved to your account"],
    accent: "#9cc4ff", bg: "radial-gradient(80% 70% at 75% 50%, #2f6bff40, transparent 70%)",
    visual: <Panel glow="#2f6bffcc">
      <div className="text-xs font-semibold uppercase tracking-wide text-brand-500">Module 3 · Net operating income</div>
      <div className="mt-3 space-y-2 font-mono text-sm">
        {[["Gross potential rent", "$264,000"], ["less vacancy 5%", "−$13,200"], ["plus other income", "$9,600"], ["Effective gross income", "$260,400"], ["less operating expenses", "−$122,960"]].map(([l, v], i) =>
          <div key={l} className="pop flex justify-between border-b border-slate-100 pb-1" style={{ animationDelay: `${150 + i * 140}ms` }}><span className="font-sans text-slate-600">{l}</span><span>{v}</span></div>)}
        <div className="pop flex justify-between pt-1 text-base font-bold" style={{ animationDelay: "900ms" }}><span className="font-sans">Net operating income</span><span className="text-pass-600">$137,440</span></div>
      </div>
      <div className="pop mt-4 rounded-lg bg-pass-50 px-3 py-2 text-sm text-pass-600" style={{ animationDelay: "1150ms" }}>✓ Quiz: correct. Debt service is not an operating expense.</div>
    </Panel> },
  { key: "trick", tag: "02 · Spot the trick", title: "Find what the seller hid before it costs you.",
    body: "Real looking T12s, rent rolls and offering memos with problems planted in them. Every miss shows its dollar cost.",
    bullets: ["$0 vacancy, stale tax bills, one time income", "Stars and a dollar impact score", "Deal School explains each trap"],
    accent: "#ffd28a", bg: "radial-gradient(80% 70% at 75% 50%, #ff8a3d38, transparent 70%)",
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
      <div className="pop mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800" style={{ animationDelay: "1500ms" }}><b>★★☆</b> Real NOI is $191,701. Those lines hid about <b>$863,000</b> of value.</div>
    </Panel> },
  { key: "duel", tag: "03 · Deal Duels", title: "A broker pitches. The clock runs. You make the call.",
    body: "Fix the seller's numbers, then pursue, renegotiate or pass. See what really happened and get scored out of 100.",
    bullets: ["Real markets in AR, TX, OH and FL", "Scored against model computed reality", "Timed, so it feels like the real thing"],
    accent: "#ff9ab8", bg: "radial-gradient(80% 70% at 75% 50%, #ff3d7a33, transparent 70%)",
    visual: <Panel glow="#ff3d7acc">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-800 text-xs font-bold text-white">BR</div>
        <div className="pop rounded-2xl rounded-tl-sm bg-slate-100 px-3 py-2 text-sm text-slate-700" style={{ animationDelay: "200ms" }}>32 units in Little Rock, 7.1% cap on the seller's actuals. Best and final is Friday. You in?</div>
        <svg viewBox="0 0 40 40" className="h-11 w-11 shrink-0 -rotate-90"><circle cx="20" cy="20" r="18" fill="none" stroke="#f1f5f9" strokeWidth="4" /><circle className="ring" cx="20" cy="20" r="18" fill="none" stroke="#ff3d7a" strokeWidth="4" strokeLinecap="round" /></svg>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-sm font-semibold">
        {["Pursue", "Renegotiate", "Pass"].map((b, i) => <div key={b} className={`pop rounded-lg border px-2 py-2 text-center ${b === "Renegotiate" ? "border-[#ff3d7a] bg-[#ff3d7a] text-white" : "border-slate-200 text-slate-600"}`} style={{ animationDelay: `${500 + i * 120}ms` }}>{b}</div>)}
      </div>
      <div className="pop mt-4 flex items-center justify-between rounded-lg bg-slate-900 px-4 py-3 text-white" style={{ animationDelay: "1100ms" }}>
        <div><div className="text-[11px] uppercase tracking-wide text-white/50">Your score</div><div className="text-2xl font-bold">86<span className="text-sm text-white/50"> / 100</span></div></div>
        <div className="text-right text-xs text-white/70">True NOI $184,501<br />Fair price about $2.55M</div>
      </div>
    </Panel> },
  { key: "uw", tag: "04 · Underwrite", title: "A workspace professionals recognize.",
    body: "Seller T12 next to your underwriting, the lender's view of NCF, loan sizing on LTV, DSCR and debt yield, and exit cap discipline.",
    bullets: ["Upload a rent roll, T12 or OM to fill it", "Benchmarks flag every expense line", "Scenarios, sensitivity and max bid"],
    accent: "#7cf0c8", bg: "radial-gradient(80% 70% at 75% 50%, #12c7a333, transparent 70%)",
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
  { key: "market", tag: "05 · Market check", title: "Know the rules where you're buying.",
    body: "Property tax after a sale, rent rules, flood zones, neighborhood rents and incomes, jobs and today's rates, for all 50 states and DC.",
    bullets: ["Live Census, FEMA, HUD, BLS and FRED data", "One click fixes to your model", "Neutral briefing on local policy"],
    accent: "#c9a8ff", bg: "radial-gradient(80% 70% at 75% 50%, #8b3dff40, transparent 70%)",
    visual: <Panel glow="#8b3dffcc">
      <div className="flex items-center justify-between"><div><div className="text-xs text-slate-400">Example</div><div className="font-semibold">Fayetteville, Arkansas</div></div><span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">AR</span></div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        {[["Property tax", "Reassessed after sale"], ["Rent control", "Preempted statewide"], ["Flood zone", "Check FEMA map"], ["Rates", "Live from FRED"], ["Area rents", "HUD fair market rent"], ["Jobs", "BLS county data"]].map(([a, b], i) =>
          <div key={a} className="pop rounded-lg border border-slate-200 px-3 py-2" style={{ animationDelay: `${150 + i * 110}ms` }}><div className="text-[11px] text-slate-500">{a}</div><div className="font-medium">{b}</div></div>)}
      </div>
      <div className="pop mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800" style={{ animationDelay: "900ms" }}>Your tax line is below the estimate on your price. <b>Fix it →</b></div>
    </Panel> },
]

function Story() {
  const ref = useRef<HTMLElement>(null), stage = useStage(ref, STAGES.length)
  const jump = (i: number) => { const el = ref.current; if (!el) return; const total = el.offsetHeight - innerHeight; scrollTo({ top: el.offsetTop + total * (i + 0.5) / STAGES.length, behavior: "smooth" }) }
  return (
    <section ref={ref} id="features" className="relative" style={{ height: `${STAGES.length * 100}vh` }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {STAGES.map((s, i) => <div key={s.key} className="lp-stage-bg" style={{ background: s.bg, opacity: i === stage ? 1 : 0, transition: "opacity 1s ease" }} />)}
        <div className="absolute inset-x-0 top-16 z-10"><div className="lp-progress" /></div>
        {/* stage list */}
        <nav className="absolute left-6 top-1/2 z-10 hidden -translate-y-1/2 space-y-3 xl:block">
          {STAGES.map((s, i) => (
            <button key={s.key} onClick={() => jump(i)} className="group flex items-center gap-3 text-left text-sm">
              <span className="h-px transition-all duration-500" style={{ width: i === stage ? 36 : 14, background: i === stage ? s.accent : "#ffffff40" }} />
              <span className="transition-colors duration-500" style={{ color: i === stage ? s.accent : "#ffffff60" }}>{s.tag.split(" · ")[1]}</span>
            </button>))}
        </nav>
        {STAGES.map((s, i) => (
          <div key={s.key} className={`lp-stage ${i === stage ? "on" : i < stage ? "past" : ""}`} aria-hidden={i !== stage}>
            <div className="mx-auto grid w-full max-w-6xl items-center gap-6 px-5 pt-16 md:grid-cols-2 md:gap-12 md:px-8 xl:pl-40">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[.2em]" style={{ color: s.accent }}>{s.tag}</div>
                <h2 className="serif mt-3 text-3xl font-semibold leading-tight text-white md:text-5xl">{s.title}</h2>
                <p className="mt-4 hidden max-w-lg text-white/70 sm:block md:text-lg">{s.body}</p>
                <ul className="mt-5 hidden space-y-2 text-white/80 md:block">
                  {s.bullets.map((b, j) => <li key={b} className="pop flex gap-2" style={{ animationDelay: `${200 + j * 120}ms` }}><span style={{ color: s.accent }}>●</span>{b}</li>)}
                </ul>
              </div>
              <div className="visual"><div className="flex origin-top scale-[.82] justify-center sm:scale-100 md:justify-end">{s.visual}</div></div>
            </div>
          </div>))}
        {/* dots on mobile */}
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2 xl:hidden">
          {STAGES.map((s, i) => <button key={s.key} aria-label={s.tag} onClick={() => jump(i)} className="h-2 rounded-full transition-all duration-500" style={{ width: i === stage ? 24 : 8, background: i === stage ? s.accent : "#ffffff40" }} />)}
        </div>
      </div>
    </section>
  )
}

/* ---------- page ---------- */
const COMPARE: [string, string, string, string][] = [
  ["Learn from the basics to IRR", "✓", "✓", "—"],
  ["Practice on realistic deals and get scored", "✓", "Sometimes", "—"],
  ["AI tutor that knows the lesson and your deal", "✓", "—", "—"],
  ["Upload real documents and model them", "✓", "—", "✓"],
  ["State tax, rent law and market data built in", "✓", "—", "Paid add-on"],
  ["Free to start", "✓", "Rarely", "Rarely"],
]
const STEPS: [string, string][] = [
  ["Create a free account", "Pick a path: learn underwriting from scratch, or jump straight into underwriting a deal."],
  ["Learn by doing", "Work through lessons, challenges and practice deals. Mistakes are where the learning happens."],
  ["Underwrite your own deals", "Upload the documents, check the market, stress test it, and decide with numbers you trust."],
]
const FAQ: [string, string][] = [
  ["Do I need to know anything about real estate?", "No. The Learn path starts with what a rental property earns and costs, and builds one step at a time. If you already underwrite, skip straight to the workspace."],
  ["Is it free?", "Yes, it's free to use while we build it out. We'll always keep a free way to learn."],
  ["Is this investment advice?", "No. Deal Screener is a learning and screening tool. Always verify rent rolls, taxes and insurance with the actual documents and local professionals."],
  ["Who built it?", "A University of Arkansas student who underwrites multifamily deals for a family real estate company, built around how real deals actually get screened."],
]
const HEADLINE = ["Learn", "to", "underwrite", "real", "estate.", "Then", "underwrite", "real", "deals."]

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
            <a href="#different" className="hover:text-white">Why it's different</a>
            <a href="#how" className="hover:text-white">How it works</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={() => go("signin")} className="whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-medium text-white/85 hover:bg-white/10">Sign in</button>
            <button onClick={() => go("signup")} className="whitespace-nowrap rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-[#0b1330] shadow-[0_0_30px_-5px_#ffd28a] transition hover:shadow-[0_0_40px_0_#ffd28a]">Create account</button>
          </div>
        </div>
      </header>

      <div className="relative z-10">
        {/* hero */}
        <section className="relative mx-auto grid min-h-[100svh] max-w-7xl items-center gap-14 px-4 pb-28 pt-28 md:grid-cols-[1.1fr_.9fr] md:px-8">
          <div>
            <div className="rise mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ffd28a]" />Real estate underwriting, learned by doing</div>
            <h1 className="serif text-[2.6rem] font-semibold leading-[1.05] md:text-7xl">
              {HEADLINE.map((w, i) => <span key={i} className="rise inline-block text-white" style={{ animationDelay: `${120 + i * 70}ms` }}><span className={i >= 5 ? "shine" : ""}>{w}</span>&nbsp;</span>)}
            </h1>
            <p className="rise mt-6 max-w-xl text-lg text-white/70" style={{ animationDelay: "800ms" }}>Every number behind a rental property, from rent and expenses to cap rates, debt and IRR. Then a professional workspace and an AI partner to run your own deals.</p>
            <div className="rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: "950ms" }}>
              <button onClick={() => go("signup")} className="rounded-full bg-gradient-to-r from-[#ffd28a] to-[#ff8a3d] px-6 py-3 font-semibold text-[#1a1030] shadow-[0_10px_40px_-8px_#ff8a3d] transition hover:-translate-y-0.5">Start free →</button>
              <a href="#features" className="rounded-full px-6 py-3 font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/10">See what's inside</a>
            </div>
            <div className="rise mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/55" style={{ animationDelay: "1100ms" }}>
              <span>✓ Free to start</span><span>✓ No experience needed</span><span>✓ Built the way lenders underwrite</span>
            </div>
          </div>
          <div className="rise" style={{ animationDelay: "600ms" }}><HeroMock /></div>
          <a href="#features" className="cue absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-xs uppercase tracking-[.25em] text-white/50">Scroll<div className="mx-auto mt-2 h-8 w-px bg-gradient-to-b from-white/60 to-transparent" /></a>
        </section>

        <Story />

        {/* stats */}
        <section className="mx-auto max-w-6xl px-4 py-24 md:px-8">
          <Reveal className="glass grid grid-cols-2 gap-8 rounded-3xl px-6 py-10 text-center md:grid-cols-4">
            {([[13, "", "course modules"], [8, "", "hands-on challenges"], [51, "", "states + DC with tax and rent rules"], [24, "/7", "AI tutor and deal partner"]] as const).map(([n, s, l]) => (
              <div key={l}><div className="serif text-5xl font-semibold text-white"><CountUp to={n} suffix={s} /></div><div className="mt-1 text-sm text-white/55">{l}</div></div>))}
          </Reveal>
        </section>

        {/* why different */}
        <section id="different" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:px-8">
          <Reveal className="max-w-2xl">
            <div className="text-sm font-semibold uppercase tracking-[.2em] text-[#ffd28a]">Why it's different</div>
            <h2 className="serif mt-3 text-4xl font-semibold text-white md:text-5xl">A course, a practice field and a pro workspace in one place.</h2>
            <p className="mt-4 text-white/65">Video courses teach but don't let you practice. Underwriting software runs numbers but doesn't teach. Deal Screener does both, with an AI partner that connects them.</p>
          </Reveal>
          <Reveal delay={150} className="glass mt-10 overflow-x-auto rounded-3xl">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/10 text-left">
                <th className="px-5 py-4" /><th className="px-5 py-4 text-center font-semibold text-[#ffd28a]">Deal Screener</th>
                <th className="px-5 py-4 text-center font-medium text-white/50">Video courses</th><th className="px-5 py-4 text-center font-medium text-white/50">Underwriting software</th>
              </tr></thead>
              <tbody>{COMPARE.map(([f, a, b, c]) => (
                <tr key={f} className="border-b border-white/5 last:border-0">
                  <td className="px-5 py-3.5 text-white/85">{f}</td><td className="px-5 py-3.5 text-center font-semibold text-emerald-300">{a}</td>
                  <td className="px-5 py-3.5 text-center text-white/45">{b}</td><td className="px-5 py-3.5 text-center text-white/45">{c}</td>
                </tr>))}</tbody>
            </table>
          </Reveal>
        </section>

        {/* how */}
        <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 md:px-8">
          <Reveal><div className="text-sm font-semibold uppercase tracking-[.2em] text-[#9cc4ff]">How it works</div>
            <h2 className="serif mt-3 text-4xl font-semibold text-white md:text-5xl">Three steps to your first deal.</h2></Reveal>
          <div className="relative mt-12 grid gap-6 md:grid-cols-3">
            <div className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-white/25 to-transparent md:block" />
            {STEPS.map(([t, b], i) => (
              <Reveal key={t} delay={i * 150} className="glass relative rounded-3xl p-6">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-[#9cc4ff] to-[#8b3dff] text-lg font-bold text-white shadow-[0_0_30px_-5px_#8b3dff]">{i + 1}</div>
                <h3 className="mt-5 text-lg font-semibold text-white">{t}</h3><p className="mt-2 text-sm text-white/60">{b}</p>
              </Reveal>))}
          </div>
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
            <h2 className="serif mx-auto max-w-3xl text-4xl font-semibold text-white md:text-6xl">Your first deal is <span className="shine">waiting.</span></h2>
            <p className="mx-auto mt-5 max-w-xl text-white/65">Create a free account and start with the five minute Cedar Ridge challenge. You'll never read a T12 the same way again.</p>
            <button onClick={() => go("signup")} className="mt-9 rounded-full bg-gradient-to-r from-[#ffd28a] to-[#ff8a3d] px-8 py-3.5 font-semibold text-[#1a1030] shadow-[0_10px_50px_-8px_#ff8a3d] transition hover:-translate-y-0.5">Create your free account</button>
            <div className="mt-4 text-sm text-white/55">Already have one? <button onClick={() => go("signin")} className="underline hover:text-white">Sign in</button></div>
          </Reveal>
        </section>

        <footer className="relative border-t border-white/10 bg-[#060a18]/80 py-6 text-center text-xs text-white/40 backdrop-blur">© {new Date().getFullYear()} Deal Screener · A learning and screening tool, not investment advice.</footer>
      </div>
    </div>
  )
}
