import { usd, pct, type DdStatus, type IcCase } from "../lib/model"
import { Card, NumInput } from "./ui"
import AiPanel from "./AiPanel"
import type { PaneProps } from "./Panes"

export const DD_GROUPS: [string, [string, string][]][] = [
  ["Income", [["rr_audit", "Rent roll matched to leases"], ["bank", "T12 checked against bank deposits"], ["estoppel", "Tenant estoppels"], ["delinquency", "Delinquency and concession report"]]],
  ["Physical", [["pca", "Property condition report"], ["units", "Walk every unit (or a sample)"], ["roof", "Roof inspection"], ["sewer", "Sewer scope"], ["env", "Phase I environmental"]]],
  ["Legal and title", [["title", "Title commitment"], ["survey", "Survey"], ["zoning", "Zoning letter"], ["contracts", "Service contracts reviewed"]]],
  ["Costs", [["tax", "Property tax estimate on purchase price"], ["insurance", "Insurance quote"], ["utility", "Utility bills, 12 months"]]],
]
const STATUS: [DdStatus, string][] = [["todo", "Not started"], ["doing", "In progress"], ["done", "Done"], ["na", "N/A"]]
const EMPTY: IcCase = { thesis: "", risks: [{ risk: "", plan: "" }, { risk: "", plan: "" }, { risk: "", plan: "" }], call: "", offer: 0 }

/** The judgment half of an investment memo, plus the diligence list. */
export function ThesisPane({ d, mp, set }: PaneProps) {
  const ic = d.ic || EMPTY, dd = d.dd || {}
  const setIc = (patch: Partial<IcCase>) => set({ ic: { ...ic, ...patch } })
  const setRisk = (i: number, patch: Partial<IcCase["risks"][number]>) => setIc({ risks: ic.risks.map((r, j) => j === i ? { ...r, ...patch } : r) })
  const all = DD_GROUPS.flatMap(([, xs]) => xs), done = all.filter(([k]) => dd[k] === "done" || dd[k] === "na").length
  const context = `The analyst's case for this deal.\nThesis: ${ic.thesis || "(not written yet)"}\nRisks and plans:\n${ic.risks.filter(r => r.risk).map(r => `- ${r.risk}: ${r.plan || "(no plan)"}`).join("\n") || "(none listed)"}\nCall: ${ic.call || "(none)"}; offer ${ic.offer ? usd(ic.offer) : "(none)"}; asking ${usd(d.price)}; max price that passes the buy box ${isFinite(mp) ? usd(mp) : "n/a"}.\nDiligence: ${done} of ${all.length} items done or not applicable.`
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-4">
        <Card title="Thesis: why buy this deal">
          <textarea className="h-28 w-full resize-y" value={ic.thesis} maxLength={1500} onChange={e => setIc({ thesis: e.target.value })}
            placeholder="Two or three sentences. What do you believe that makes this worth buying at this price? e.g. Rents are $120 under the comps two blocks over, the seller self manages, and no new supply is permitted within two miles." />
        </Card>
        <Card title="Risks and how you'd handle them">
          <div className="space-y-2">
            {ic.risks.map((r, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-2">
                <input value={r.risk} maxLength={200} placeholder={`Risk ${i + 1}, e.g. taxes reset on sale`} onChange={e => setRisk(i, { risk: e.target.value })} />
                <input value={r.plan} maxLength={240} className={r.risk.trim() && !r.plan.trim() ? "!border-amber-300" : ""} placeholder="How you'd handle it, e.g. underwritten at the new millage" onChange={e => setRisk(i, { plan: e.target.value })} />
              </div>))}
          </div>
          {ic.risks.length < 6 && <button className="btn mt-2" onClick={() => setIc({ risks: [...ic.risks, { risk: "", plan: "" }] })}>+ Add a risk</button>}
        </Card>
        <Card title="Your call">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex gap-2">{(["pursue", "renegotiate", "pass"] as const).map(c => (
              <button key={c} className={`btn ${ic.call === c ? "btn-primary" : ""}`} onClick={() => setIc({ call: c })}>{c === "pursue" ? "Pursue at asking" : c === "renegotiate" ? "Pursue at a lower price" : "Pass"}</button>))}</div>
            {ic.call === "renegotiate" && <label className="text-xs font-medium text-slate-500">Your offer ($)<NumInput className="mt-1 !w-36" value={ic.offer} min={0} step={10000} onChange={v => setIc({ offer: v })} /></label>}
          </div>
          {ic.call && <p className="note mt-3">Asking {usd(d.price)} · max price that passes your buy box {isFinite(mp) ? usd(mp) : "none"}{ic.call === "renegotiate" && ic.offer > 0 ? ` · your offer is ${pct(ic.offer / d.price - 1, 1)} vs asking` : ""}.
            {ic.call === "pursue" && isFinite(mp) && mp < d.price ? " The buy box says the asking price is too high; say in the thesis why you'd pay it anyway." : ""}</p>}
        </Card>
        <Card title={`Due diligence · ${done} of ${all.length}`}>
          <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
            {DD_GROUPS.map(([g, xs]) => (
              <div key={g}>
                <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">{g}</div>
                {xs.map(([k, label]) => (
                  <div key={k} className="flex items-center justify-between gap-3 border-b border-[#efefea] py-1.5 text-sm">
                    <span className={dd[k] === "done" ? "text-slate-400 line-through" : ""}>{label}</span>
                    <select className="!py-0.5 text-xs" value={dd[k] || "todo"} onChange={e => set({ dd: { ...dd, [k]: e.target.value as DdStatus } })}>
                      {STATUS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
                  </div>))}
              </div>))}
          </div>
        </Card>
      </div>
      <AiPanel storeKey="thesis" deal={d} fixedRoute="pro" compact title="Ask Deal School to push back" context={context}
        greeting="Write your thesis and risks, then ask me to challenge them. I'll point out what you haven't proven, the risks you missed, and whether your offer squares with the numbers."
        reviewLabel="Challenge my case" reviewPrompt="Challenge my case like an investment committee would. Which parts of my thesis aren't supported by the numbers in the screener? What are the biggest risks I left out? Does my call and offer square with the max price and the buy box? Be direct and specific." onDeal={() => {}} />
    </div>
  )
}
