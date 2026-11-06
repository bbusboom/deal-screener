import { type CustomLine, type CustomKind, type CustomBasis, BASIS_LABEL, usd } from "../lib/model"
import { Card, NumInput } from "./ui"
import type { PaneProps } from "./Panes"

type Tpl = { label: string; lines: Omit<CustomLine, "start" | "end">[]; note?: string }
const L = (label: string, kind: CustomKind, basis: CustomBasis, amt: number, growth = 3): Omit<CustomLine, "start" | "end"> => ({ label, kind, basis, amt, growth })

/** Common layers professionals add. Amounts are rough starting points to edit. */
export const TEMPLATES: Record<CustomKind, Tpl[]> = {
  income: [
    { label: "RUBS (utility bill back)", lines: [L("RUBS (utility bill back)", "income", "unitMonth", 45)] },
    { label: "Pet rent and fees", lines: [L("Pet rent and fees", "income", "unitMonth", 8)] },
    { label: "Parking / covered parking", lines: [L("Parking", "income", "unitMonth", 6)] },
    { label: "Storage units", lines: [L("Storage", "income", "unitMonth", 4)] },
    { label: "Application, admin and late fees", lines: [L("Application, admin and late fees", "income", "unitMonth", 12)] },
    { label: "Tech package / bulk internet", lines: [L("Tech package income", "income", "unitMonth", 60), L("Bulk internet contract", "expense", "unitMonth", 35)], note: "Adds the resident charge and the provider contract." },
    { label: "Washer / dryer rental", lines: [L("Washer / dryer rental", "income", "unitMonth", 10)] },
    { label: "Cell tower or billboard lease", lines: [L("Antenna / billboard lease", "income", "year", 18000, 2)] },
  ],
  expense: [
    { label: "Valet trash (with resident fee)", lines: [L("Valet trash contract", "expense", "unitMonth", 22), L("Valet trash fee", "income", "unitMonth", 28)], note: "Usually a pass through: the contract cost and the resident fee." },
    { label: "Courtesy patrol / security", lines: [L("Courtesy patrol / security", "expense", "year", 18000)] },
    { label: "Pest control", lines: [L("Pest control", "expense", "unitMonth", 3)] },
    { label: "Landscaping", lines: [L("Landscaping", "expense", "unitMonth", 12)] },
    { label: "Pool service", lines: [L("Pool service", "expense", "year", 9000)] },
    { label: "Elevator maintenance", lines: [L("Elevator maintenance", "expense", "year", 6000)] },
    { label: "HOA / association dues", lines: [L("HOA / association dues", "expense", "year", 12000)] },
    { label: "Ground lease", lines: [L("Ground lease", "expense", "year", 50000, 2)] },
    { label: "Asset management fee", lines: [L("Asset management fee", "expense", "pctEgi", 1.5, 0)], note: "Sponsor fee, usually 1 to 2% of EGI." },
    { label: "Software and resident portal", lines: [L("Software and resident portal", "expense", "unitMonth", 4)] },
    { label: "Snow removal", lines: [L("Snow removal", "expense", "year", 8000)] },
    { label: "Franchise or business tax", lines: [L("Franchise / business tax", "expense", "pctEgi", 0.7, 0)], note: "Texas margin tax is about 0.75% of gross receipts." },
  ],
  capex: [
    { label: "Roof replacement", lines: [L("Roof replacement", "capex", "once", 150000, 0)] },
    { label: "Parking lot resurface", lines: [L("Parking lot resurface", "capex", "once", 60000, 0)] },
    { label: "HVAC replacements (annual)", lines: [L("HVAC replacements", "capex", "year", 30000)] },
    { label: "Exterior paint", lines: [L("Exterior paint", "capex", "once", 80000, 0)] },
    { label: "Unit renovations (annual)", lines: [L("Unit renovations", "capex", "year", 100000, 0)] },
    { label: "Foundation / structural", lines: [L("Foundation / structural", "capex", "once", 100000, 0)] },
  ],
}

const KIND_LABEL: Record<CustomKind, string> = { income: "Income", expense: "Operating expense", capex: "Capital (below NOI)" }

export function CustomLinesCard({ d, p, set, kinds, title }: PaneProps & { kinds: CustomKind[]; title: string }) {
  const lines = d.custom || []
  const shown = lines.map((c, i) => ({ c, i })).filter(x => kinds.includes(x.c.kind))
  const upd = (i: number, patch: Partial<CustomLine>) => set({ custom: lines.map((c, j) => j === i ? { ...c, ...patch } : c) })
  const add = (ls: Omit<CustomLine, "start" | "end">[]) => set({ custom: [...lines, ...ls.map(l => ({ ...l, start: 1, end: 0 }))] })
  const y1 = p.years[0]
  return (
    <Card title={title} right={
      <select className="!w-auto" value="" onChange={e => {
        const v = e.target.value; if (!v) return
        if (v.startsWith("blank:")) { const k = v.slice(6) as CustomKind; add([L("", k, k === "capex" ? "once" : "year", 0, k === "capex" ? 0 : 3)]); return }
        const [k, idx] = v.split(":"); add(TEMPLATES[k as CustomKind][Number(idx)].lines)
      }}>
        <option value="">+ Add a line…</option>
        {kinds.map(k => <optgroup key={k} label={KIND_LABEL[k]}>
          <option value={`blank:${k}`}>Blank {KIND_LABEL[k].toLowerCase()} line</option>
          {TEMPLATES[k].map((t, i) => <option key={t.label} value={`${k}:${i}`}>{t.label}</option>)}
        </optgroup>)}
      </select>}>
      {shown.length === 0 ? <p className="note">Add anything the standard lines don't cover: valet trash, courtesy patrol, bulk internet, a ground lease, a roof in year 3. Each line can be a yearly amount, per unit per month, or a % of rent or EGI, with its own growth rate and start and end years.</p> : (
        <div className="overflow-x-auto"><table className="tbl">
          <thead><tr><th>Line</th>{kinds.length > 1 && <th className="!text-left">Type</th>}<th className="!text-left">Basis</th><th>Amount</th><th>Growth %/yr</th><th>Start yr</th><th>End yr</th><th>Year 1</th><th /></tr></thead>
          <tbody>{shown.map(({ c, i }) => (
            <tr key={i}>
              <td className="!py-1"><input className="!w-48" value={c.label} placeholder="Name this line" onChange={e => upd(i, { label: e.target.value })} /></td>
              {kinds.length > 1 && <td className="!py-1 !text-left"><select className="!w-auto" value={c.kind} onChange={e => upd(i, { kind: e.target.value as CustomKind })}>
                {(["income", "expense", "capex"] as CustomKind[]).map(k => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}</select></td>}
              <td className="!py-1 !text-left"><select className="!w-auto" value={c.basis} onChange={e => upd(i, { basis: e.target.value as CustomBasis })}>
                {(Object.keys(BASIS_LABEL) as CustomBasis[]).filter(b => !(c.kind === "income" && b === "pctEgi")).map(b => <option key={b} value={b}>{BASIS_LABEL[b]}</option>)}</select></td>
              <td className="!py-1"><NumInput className="!w-24 text-right" value={c.amt} step={c.basis.startsWith("pct") ? 0.25 : c.basis === "unitMonth" ? 1 : 500} onChange={v => upd(i, { amt: v })} /></td>
              <td className="!py-1"><NumInput className="!w-16 text-right" value={c.growth} step={0.5} disabled={c.basis === "once" || c.basis.startsWith("pct")} onChange={v => upd(i, { growth: v })} /></td>
              <td className="!py-1"><NumInput className="!w-14 text-right" value={c.start} min={1} onChange={v => upd(i, { start: Math.max(1, Math.round(v)) })} /></td>
              <td className="!py-1"><NumInput className="!w-14 text-right" value={c.end} min={0} disabled={c.basis === "once"} onChange={v => upd(i, { end: Math.max(0, Math.round(v)) })} /></td>
              <td className={`num ${c.kind === "income" ? "text-pass-600" : ""}`}>{usd((c.kind === "income" ? 1 : -1) * (y1.cust[i] || 0))}</td>
              <td><button className="text-slate-400 hover:text-fail-600" title="Remove" onClick={() => set({ custom: lines.filter((_, j) => j !== i) })}>✕</button></td>
            </tr>))}
          </tbody>
        </table>
        {!kinds.includes("income") && lines.some(c => c.kind === "income") && <p className="mt-2 text-xs text-brand-600">Paired income lines ({lines.filter(c => c.kind === "income").map(c => c.label || "unnamed").join(", ")}) are under Property › Rent & income.</p>}
        <p className="note mt-2">End year 0 means the line runs for the whole hold. Capital lines reduce cash flow but not NOI, the way lenders and buyers treat them. One time amounts land in the start year.</p></div>
      )}
    </Card>
  )
}
