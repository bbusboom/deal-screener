import type { Path } from "../lib/store"

export default function PathPicker({ username, current, onPick }: { username?: string | null; current?: Path | null; onPick: (p: Path) => void }) {
  const opt = (p: Path, title: string, who: string, points: string[], cta: string) => (
    <button onClick={() => onPick(p)}
      className={`group relative flex flex-col overflow-hidden rounded-3xl bg-white p-7 text-left shadow-lift ring-1 transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_-25px_rgba(255,138,61,.6)] ${current === p ? "ring-gold-300" : "ring-white/10"}`}>
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${p === "learner" ? "from-brand-400 via-violet-400 to-gold-300" : "from-gold-300 via-gold-400 to-brand-500"}`} />
      <div className="text-xs font-semibold uppercase tracking-[.16em] text-gold-600">{who}</div>
      <div className="mt-1 font-display text-3xl font-semibold text-brand-900">{title}</div>
      <ul className="mt-5 flex-1 space-y-2.5 text-sm text-slate-600">{points.map(x => <li key={x} className="flex gap-2.5"><span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-brand-50 text-[10px] text-brand-600">✓</span>{x}</li>)}</ul>
      <span className={`btn mt-7 justify-center py-2.5 ${p === "learner" ? "btn-primary" : "btn-gold"}`}>{cta} →</span>
    </button>
  )
  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-night px-4 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_400px_at_15%_0%,rgba(79,107,237,.35),transparent_70%),radial-gradient(600px_400px_at_90%_20%,rgba(139,61,255,.25),transparent_70%),radial-gradient(600px_300px_at_50%_110%,rgba(255,138,61,.22),transparent_70%)]" />
      <div className="relative mx-auto max-w-4xl">
        <h1 className="text-center font-display text-4xl font-semibold text-white md:text-5xl">{username ? `Welcome, ${username}.` : "Welcome."} <span className="bg-gradient-to-b from-gold-200 to-gold-400 bg-clip-text text-transparent">How do you want to work?</span></h1>
        <p className="mt-3 text-center text-white/60">You can switch any time from the menu at the top.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {opt("learner", "Learn to underwrite", "New to underwriting", [
            "An 11 module course from the basics to pro underwriting",
            "Real photos, diagrams, worked examples and a quiz after each module",
            "Practice deals step by step, or bring your own property",
            "Deal School AI answers questions about every lesson",
          ], "Start learning")}
          {opt("pro", "Underwrite a deal", "Working a live deal", [
            "Import rent rolls, T12s, offering memos and loan quotes",
            "Seller T12 vs your underwriting, lender loan sizing and comps",
            "Value add, refinance, bridge loans and investor waterfalls",
            "Investment memo PDF and Excel export, plus Pro AI",
          ], "Open the workspace")}
        </div>
      </div>
    </div>
  )
}
