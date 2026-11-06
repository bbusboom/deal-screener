import type { Deal } from "../lib/model"

/** Guided first pass through a new deal. Each step is done when its numbers are in (or, for review steps, once the page is visited). */
export interface SetupStep { key: string; label: string; page: string; hint: string; done: boolean }

export function setupSteps(d: Deal, visited: Set<string>): SetupStep[] {
  const units = d.units.reduce((s, u) => s + (u.count || 0), 0)
  const hasRents = units > 0 && d.units.some(u => (u.rent || 0) > 0)
  const core = hasRents && d.price > 0 && d.tax > 0 && d.ins > 0
  return [
    { key: "property", label: "Load the property", page: "documents", hint: "Upload the rent roll, T12 or offering memo, or type the unit mix under Rent & income.", done: hasRents },
    { key: "price", label: "Price", page: "income", hint: "Enter the asking price and closing costs.", done: d.price > 0 },
    { key: "expenses", label: "Expenses", page: "expenses", hint: "Taxes and insurance at minimum. Re-estimate taxes on your price, not the seller's.", done: d.tax > 0 && d.ins > 0 },
    { key: "market", label: "Market", page: "supply", hint: "Check growth, new supply and nearby competition.", done: visited.has("supply") || visited.has("market") },
    { key: "financing", label: "Financing", page: "financing", hint: "Confirm loan to value, rate and amortization, or size it the lender's way.", done: visited.has("financing") },
    { key: "verdict", label: "Verdict", page: "summary", hint: "Read the verdict and the max price that passes your buy box.", done: core && visited.has("summary") },
  ]
}

export default function SetupGuide({ steps, onGo, onClose, warn }: { steps: SetupStep[]; onGo: (page: string) => void; onClose: () => void; warn?: { text: string; page: string } }) {
  const doneCount = steps.filter(s => s.done).length
  const next = steps.find(s => !s.done)
  return (
    <div className="card !p-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="text-sm font-semibold text-ink">Set up this deal <span className="font-normal text-slate-500">· {doneCount} of {steps.length}</span></div>
        {next && <div className="min-w-0 flex-1 text-sm text-slate-600"><span className="font-medium text-ink">Next: {next.label}.</span> {next.hint}</div>}
        {next ? <button className="btn btn-primary !py-1.5" onClick={() => onGo(next.page)}>Go to {next.label.toLowerCase()} →</button>
          : warn ? <div className="flex flex-1 flex-wrap items-center gap-2 text-sm text-gold-700"><span className="font-medium">Set up, but check this:</span> {warn.text} <button className="btn !py-1" onClick={() => onGo(warn.page)}>Review</button></div>
          : <div className="flex-1 text-sm font-medium text-pass-600">Deal is set up. Every number on Overview now reflects it.</div>}
        <button className="text-slate-400 hover:text-ink" onClick={onClose} aria-label="Hide setup steps" title="Hide">✕</button>
      </div>
      <ol className="mt-3 grid grid-cols-3 gap-1.5 sm:grid-cols-6">
        {steps.map((s, i) => (
          <li key={s.key}>
            <button onClick={() => onGo(s.page)} className={`flex w-full items-center gap-2 rounded-md border px-2 py-1.5 text-left text-xs transition ${s.done ? "border-pass-100 bg-pass-50 text-pass-700" : s === next ? "border-brand-200 bg-brand-50 text-brand-900" : "border-[#e4e4de] text-slate-500 hover:border-slate-300"}`}>
              <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold ${s.done ? "bg-pass-500 text-white" : s === next ? "bg-brand-900 text-white" : "bg-slate-100 text-slate-500"}`}>{s.done ? "✓" : i + 1}</span>
              <span className="truncate font-medium">{s.label}</span>
            </button>
          </li>))}
      </ol>
    </div>
  )
}
