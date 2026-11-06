// Public home page shown before someone has an account. Explains what Deal Screener does and why to sign up.
// Numbers in the mockups come from the course's Oak Ridge example and the Cedar Ridge challenge, so they're real model output.

type Go = (mode: "signin" | "signup") => void

const Logo = ({ light }: { light?: boolean }) => (
  <div className="flex items-center gap-2">
    <div className={`grid h-9 w-9 place-items-center rounded-lg text-sm font-bold ${light ? "bg-white/15 text-white" : "bg-brand-600 text-white"}`}>DS</div>
    <div className={`whitespace-nowrap font-bold leading-tight ${light ? "text-white" : "text-ink"}`}>Deal Screener<div className={`hidden text-[11px] font-normal sm:block ${light ? "text-white/70" : "text-slate-500"}`}>with Deal School AI</div></div>
  </div>
)

function HeroMock() {
  const kpis: [string, string, boolean][] = [["NOI, year 1", "$137,440", true], ["Cap rate", "6.87%", true], ["DSCR", "1.29x", true], ["IRR, 5 yr", "12.8%", true]]
  return (
    <div className="relative">
      <div className="rounded-2xl bg-white p-4 text-ink shadow-2xl ring-1 ring-black/5">
        <div className="mb-3 flex items-center justify-between">
          <div><div className="text-xs text-slate-400">Oak Ridge Apartments · 20 units</div><div className="font-semibold">Underwriting summary</div></div>
          <span className="rounded-full bg-pass-50 px-2.5 py-1 text-xs font-semibold text-pass-600">Pursue</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {kpis.map(([l, v, ok]) => (
            <div key={l} className={`rounded-lg border border-l-4 px-3 py-2 ${ok ? "border-l-pass-600" : "border-l-fail-600"}`}>
              <div className="text-[11px] text-slate-500">{l}</div><div className="num text-lg font-semibold">{v}</div>
            </div>))}
        </div>
        <div className="mt-3 flex h-20 items-end gap-1.5 rounded-lg bg-slate-50 p-2">
          {[32, 35, 38, 41, 44].map((h, i) => <div key={i} className="flex-1 rounded-t bg-brand-500/80" style={{ height: `${h + 20}%` }} />)}
          <div className="flex-[1.4] rounded-t bg-pass-600" style={{ height: "100%" }} />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-slate-400"><span>Cash flow years 1 to 5</span><span>Sale</span></div>
      </div>
      <div className="absolute -bottom-6 -left-6 hidden w-64 rounded-xl bg-white p-3 text-sm text-ink shadow-xl ring-1 ring-black/5 sm:block">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Deal School AI</div>
        <p className="text-slate-700">The seller's taxes are from 2009. On your price, budget about <b>$32,600</b>, not $14,200.</p>
      </div>
    </div>
  )
}

const FEATURES: { icon: string; title: string; body: string }[] = [
  { icon: "🎓", title: "A real underwriting course", body: "Ten modules that start at \"what is NOI?\" and build to IRR, debt sizing and exit caps. Real photos, diagrams, calculators and quizzes, with one worked deal carried through every lesson." },
  { icon: "🤖", title: "An AI tutor under every lesson", body: "Deal School AI knows what you're studying. Ask it to explain a term another way, check your math, or walk through your own deal. It runs its numbers through the same model you see." },
  { icon: "🕵️", title: "Spot the seller's trick", body: "Real looking T12s, rent rolls and offering memos with problems planted in them. Find the $0 vacancy, the stale tax bill and the one-time income before they cost you." },
  { icon: "⏱️", title: "Deal Duels", body: "A broker pitches you a deal. Fix the seller's numbers, then pursue, renegotiate or pass against the clock. See what really happened and get scored out of 100." },
  { icon: "📄", title: "Upload documents, skip the typing", body: "Drop in a rent roll, T12, offering memo or loan quote. Deal Screener pulls out the numbers, shows you every value, and lets you confirm before anything changes." },
  { icon: "🗺️", title: "Market check for any state", body: "Property tax rules, rent control, flood zones, neighborhood rents and incomes, jobs and today's interest rates, plus a neutral briefing on the policy that affects owners." },
]

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

export default function Landing({ go }: { go: Go }) {
  return (
    <div className="bg-slate-50 text-ink">
      {/* nav */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-brand-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <Logo light />
          <nav className="hidden gap-6 text-sm text-white/80 md:flex">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#different" className="hover:text-white">Why it's different</a>
            <a href="#how" className="hover:text-white">How it works</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={() => go("signin")} className="whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-medium text-white/90 hover:bg-white/10">Sign in</button>
            <button onClick={() => go("signup")} className="whitespace-nowrap rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-brand-900 shadow hover:bg-brand-50">Create account</button>
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="bg-gradient-to-b from-brand-900 to-brand-700 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-24 pt-14 md:grid-cols-2 md:px-8 md:pt-20">
          <div>
            <div className="mb-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90">Real estate underwriting, learned by doing</div>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">Learn to underwrite real estate. Then underwrite real deals.</h1>
            <p className="mt-5 max-w-xl text-lg text-white/80">Deal Screener teaches you every number behind a rental property, from rent and expenses to cap rates, debt and IRR, and gives you a professional workspace and an AI partner to run your own deals.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => go("signup")} className="rounded-lg bg-white px-5 py-3 font-semibold text-brand-900 shadow-lg hover:bg-brand-50">Start free →</button>
              <a href="#features" className="rounded-lg px-5 py-3 font-semibold text-white ring-1 ring-white/30 hover:bg-white/10">See what's inside</a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
              <span>✓ Free to start</span><span>✓ No experience needed</span><span>✓ Built on how lenders and investors actually underwrite</span>
            </div>
          </div>
          <HeroMock />
        </div>
      </section>

      {/* stat strip */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 text-center md:grid-cols-4 md:px-8">
          {[["10", "course modules"], ["8", "hands-on challenges"], ["50 + DC", "states with tax and rent rules"], ["24/7", "AI tutor and deal partner"]].map(([n, l]) => (
            <div key={l}><div className="text-3xl font-bold text-brand-700">{n}</div><div className="text-sm text-slate-500">{l}</div></div>))}
        </div>
      </section>

      {/* features */}
      <section id="features" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 md:px-8">
        <div className="max-w-2xl">
          <div className="text-sm font-semibold uppercase tracking-wide text-brand-600">What you can do</div>
          <h2 className="mt-2 text-3xl font-bold">Everything you need to go from beginner to underwriter</h2>
          <p className="mt-3 text-slate-600">Two paths in one account: <b>Learn</b> if you're starting out, <b>Underwrite</b> when you're working a real deal. Switch any time.</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(f => (
            <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.body}</p>
            </div>))}
        </div>
      </section>

      {/* challenge showcase */}
      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 md:grid-cols-2 md:px-8">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-card">
            <div className="mb-3 flex items-center gap-2 text-xs"><span className="rounded bg-slate-200 px-2 py-0.5 font-semibold text-slate-600">T12</span><span className="font-semibold">Cedar Ridge Apartments</span></div>
            <table className="tbl text-sm"><tbody>
              <tr><td>Gross potential rent</td><td className="num">$345,600</td><td /></tr>
              <tr className="bg-pass-50"><td>Vacancy and credit loss</td><td className="num">$0</td><td className="text-right text-xs font-semibold text-pass-600">✓ caught</td></tr>
              <tr className="bg-pass-50"><td>Property taxes</td><td className="num">$14,200</td><td className="text-right text-xs font-semibold text-pass-600">✓ caught</td></tr>
              <tr><td>Insurance</td><td className="num">$19,000</td><td /></tr>
              <tr className="bg-fail-50"><td>Management fee</td><td className="num">$0</td><td className="text-right text-xs font-semibold text-fail-600">✗ missed</td></tr>
              <tr className="total"><td>Net operating income</td><td className="num">$247,800</td><td /></tr>
            </tbody></table>
            <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800"><b>★★☆</b> The real NOI is $191,701. Those three lines hid about <b>$863,000</b> of value.</div>
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-brand-600">Learn the way pros do</div>
            <h2 className="mt-2 text-3xl font-bold">Make the mistakes here, not on a real deal</h2>
            <p className="mt-3 text-slate-600">Most courses show you a finished spreadsheet. Deal Screener hands you the seller's numbers and lets you decide what to trust. Every challenge shows the dollar cost of what you missed, and Deal School explains it when you're ready.</p>
            <ul className="mt-5 space-y-2 text-slate-700">
              <li>✓ Seller traps that cost buyers the most money</li>
              <li>✓ Timed duels where you pursue, renegotiate or pass</li>
              <li>✓ Scores and progress saved to your account</li>
            </ul>
          </div>
        </div>
      </section>

      {/* why different */}
      <section id="different" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 md:px-8">
        <div className="max-w-2xl">
          <div className="text-sm font-semibold uppercase tracking-wide text-brand-600">Why it's different</div>
          <h2 className="mt-2 text-3xl font-bold">A course, a practice field and a pro workspace in one place</h2>
          <p className="mt-3 text-slate-600">Video courses teach but don't let you practice. Underwriting software runs numbers but doesn't teach. Deal Screener does both, with an AI partner that connects them.</p>
        </div>
        <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-card">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="px-4 py-3 font-semibold"></th>
              <th className="px-4 py-3 text-center font-semibold text-brand-700">Deal Screener</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-500">Video courses</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-500">Underwriting software</th>
            </tr></thead>
            <tbody>{COMPARE.map(([f, a, b, c]) => (
              <tr key={f} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3">{f}</td>
                <td className="px-4 py-3 text-center font-semibold text-pass-600">{a}</td>
                <td className="px-4 py-3 text-center text-slate-500">{b}</td>
                <td className="px-4 py-3 text-center text-slate-500">{c}</td>
              </tr>))}
            </tbody>
          </table>
        </div>
      </section>

      {/* how it works */}
      <section id="how" className="scroll-mt-20 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-sm font-semibold uppercase tracking-wide text-brand-600">How it works</div>
          <h2 className="mt-2 text-3xl font-bold">Three steps to your first deal</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map(([t, b], i) => (
              <div key={t} className="relative rounded-2xl border border-slate-200 p-6">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-600 font-bold text-white">{i + 1}</div>
                <h3 className="mt-4 text-lg font-semibold">{t}</h3>
                <p className="mt-2 text-sm text-slate-600">{b}</p>
              </div>))}
          </div>
        </div>
      </section>

      {/* faq */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-20 md:px-8">
        <h2 className="text-3xl font-bold">Questions</h2>
        <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group p-5">
              <summary className="cursor-pointer list-none font-semibold">{q}<span className="float-right text-slate-400 group-open:rotate-45">+</span></summary>
              <p className="mt-2 text-sm text-slate-600">{a}</p>
            </details>))}
        </div>
      </section>

      {/* final cta */}
      <section className="bg-gradient-to-r from-brand-900 to-brand-700 py-16 text-center text-white">
        <h2 className="text-3xl font-bold">Your first deal is waiting</h2>
        <p className="mx-auto mt-3 max-w-xl text-white/80">Create a free account and start with the five minute Cedar Ridge challenge. You'll never read a T12 the same way again.</p>
        <button onClick={() => go("signup")} className="mt-7 rounded-lg bg-white px-6 py-3 font-semibold text-brand-900 shadow-lg hover:bg-brand-50">Create your free account</button>
        <div className="mt-3 text-sm text-white/70">Already have one? <button onClick={() => go("signin")} className="underline">Sign in</button></div>
      </section>

      <footer className="bg-brand-900 py-6 text-center text-xs text-white/50">© {new Date().getFullYear()} Deal Screener · A learning and screening tool, not investment advice.</footer>
    </div>
  )
}
