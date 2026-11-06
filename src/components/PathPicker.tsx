import type { Path } from "../lib/store"

export default function PathPicker({ username, current, onPick }: { username?: string | null; current?: Path | null; onPick: (p: Path) => void }) {
  const opt = (p: Path, title: string, who: string, points: string[], cta: string) => (
    <button onClick={() => onPick(p)}
      className={`group relative flex flex-col rounded-lg border bg-white p-7 text-left transition hover:border-gold-400 ${current === p ? "border-gold-400" : "border-transparent"}`}>
      <div className="text-xs font-medium text-slate-500">{who}</div>
      <div className="mt-1 font-display text-2xl font-semibold text-ink">{title}</div>
      <ul className="mt-5 flex-1 space-y-2.5 text-sm text-slate-600">{points.map(x => <li key={x} className="flex gap-2.5"><span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-slate-400" />{x}</li>)}</ul>
      <span className={`btn mt-7 justify-center py-2.5 ${p === "learner" ? "btn-primary" : "btn-gold"}`}>{cta} →</span>
    </button>
  )
  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-night px-4 py-16">
      <div className="relative mx-auto max-w-4xl">
        <h1 className="text-center font-display text-3xl font-semibold text-white md:text-4xl">{username ? `Welcome, ${username}.` : "Welcome."} <span className="text-gold-300">How do you want to work?</span></h1>
        <p className="mt-3 text-center text-white/60">You can switch any time from the menu at the top.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {opt("learner", "Learn to underwrite", "New to underwriting", [
            "A 13 module course: the basics, pro underwriting, markets and supply, and how acquisitions teams work",
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
