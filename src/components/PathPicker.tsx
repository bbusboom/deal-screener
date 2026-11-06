import type { Path } from "../lib/store"

export default function PathPicker({ username, current, onPick }: { username?: string | null; current?: Path | null; onPick: (p: Path) => void }) {
  const opt = (p: Path, title: string, who: string, points: string[], cta: string) => (
    <button onClick={() => onPick(p)}
      className={`group flex flex-col rounded-2xl border-2 bg-white p-6 text-left shadow-card transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-lg ${current === p ? "border-brand-500" : "border-transparent"}`}>
      <div className="text-xs font-semibold uppercase tracking-wider text-brand-500">{who}</div>
      <div className="mt-1 text-2xl font-bold">{title}</div>
      <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-600">{points.map(x => <li key={x} className="flex gap-2"><span className="text-brand-500">✓</span>{x}</li>)}</ul>
      <span className="btn btn-primary mt-6 justify-center group-hover:bg-brand-700">{cta}</span>
    </button>
  )
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-center text-3xl font-bold tracking-tight">{username ? `Welcome, ${username}.` : "Welcome."} How do you want to work?</h1>
        <p className="mt-2 text-center text-slate-500">You can switch any time from the menu at the top.</p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
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
