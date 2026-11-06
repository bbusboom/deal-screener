import { usd, type CapexItem } from "../lib/model"
import { Card, NumInput } from "./ui"
import type { PaneProps } from "./Panes"

const COMMON: [string, number][] = [["Roofs", 0], ["HVAC replacements", 0], ["Parking lot and paving", 0], ["Unit interiors", 0], ["Exterior paint and siding", 0], ["Plumbing and water heaters", 0], ["Amenities and curb appeal", 0]]

/** Capital budget by line item: what it is, what it costs, when it's spent and where the number came from. */
export function CapexPane({ d, p, set }: PaneProps) {
  const items = d.capexItems || []
  const setItems = (next: CapexItem[]) => set({ capexItems: next })
  const upd = (i: number, patch: Partial<CapexItem>) => setItems(items.map((x, j) => j === i ? { ...x, ...patch } : x))
  const units = p.units || 1
  const atClose = items.filter(i => !i.yr).reduce((a, i) => a + (i.cost || 0), 0)
  const later = items.filter(i => i.yr).reduce((a, i) => a + (i.cost || 0), 0)
  const unsourced = items.filter(i => i.cost > 0 && !i.source?.trim()).length
  const years = Array.from({ length: d.hold }, (_, k) => k + 1)
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <Card title="Capital budget" right={<div className="flex flex-wrap gap-2">
        <button className="btn" onClick={() => setItems([...items, ...COMMON.filter(([n]) => !items.some(x => x.item === n)).map(([item]) => ({ item, cost: 0, yr: 0, source: "" }))])}>Add common items</button>
        <button className="btn btn-primary" onClick={() => setItems([...items, { item: "", cost: 0, yr: 0, source: "" }])}>+ Add item</button></div>}>
        {items.length === 0 ? (
          <p className="text-sm text-slate-600">List each repair or improvement the property needs: what it is, what it costs, when you'll spend it and where the number came from. Items paid at closing add to the equity you bring; items in a later year come out of that year's cash flow. While the budget is empty, the single up front capex number under Rent &amp; income is used.</p>
        ) : (
          <table className="tbl">
            <thead><tr><th className="!text-left">Item</th><th>Cost</th><th className="!text-left">When</th><th className="!text-left">Source of the number</th><th /></tr></thead>
            <tbody>{items.map((x, i) => (
              <tr key={i}>
                <td className="!py-1"><input className="!min-w-[180px] w-full" value={x.item} placeholder="e.g. Replace 6 roofs" onChange={e => upd(i, { item: e.target.value })} /></td>
                <td className="!py-1"><NumInput className="!w-28 text-right" value={x.cost} min={0} step={1000} onChange={v => upd(i, { cost: v })} /></td>
                <td className="!py-1 text-left"><select value={x.yr} onChange={e => upd(i, { yr: Number(e.target.value) })}>
                  <option value={0}>At closing</option>{years.map(y => <option key={y} value={y}>Year {y}</option>)}</select></td>
                <td className="!py-1"><input className={`!min-w-[180px] w-full ${x.cost > 0 && !x.source?.trim() ? "!border-amber-300" : ""}`} value={x.source || ""} placeholder="Inspection report, contractor bid, guess" onChange={e => upd(i, { source: e.target.value })} /></td>
                <td className="!py-1"><button className="px-1 text-slate-400 hover:text-fail-600" title="Remove" onClick={() => setItems(items.filter((_, j) => j !== i))}>✕</button></td>
              </tr>))}
              <tr className="total"><td>Total</td><td className="num">{usd(atClose + later)}</td><td colSpan={3} className="!text-left text-slate-500">{usd((atClose + later) / units)} per unit</td></tr>
            </tbody>
          </table>)}
        {unsourced > 0 && <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-sm text-amber-900">{unsourced} {unsourced === 1 ? "item has" : "items have"} no source. A number from an inspection report or a contractor bid holds up; a guess should be labeled as one so nobody mistakes it for a quote.</p>}
      </Card>
      <div className="space-y-4">
        <Card title="Where it lands">
          <table className="tbl"><tbody>
            <tr><td>At closing</td><td className="num">{usd(items.length ? atClose : p.capexUp)}</td></tr>
            <tr className="sub"><td colSpan={2} className="!text-left">Added to the equity you bring</td></tr>
            <tr><td>During the hold</td><td className="num">{usd(later)}</td></tr>
            <tr className="sub"><td colSpan={2} className="!text-left">Paid from cash flow in the year listed</td></tr>
            <tr className="total"><td>Equity required</td><td className="num">{usd(p.equity)}</td></tr>
          </tbody></table>
        </Card>
        <Card title="How analysts build this">
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-600">
            <li>Start from the property condition report or your own walk: roofs, HVAC, plumbing, paving, then unit interiors.</li>
            <li>Price big items with a bid when you can. Until then, label the number as an estimate.</li>
            <li>Timing matters: money spent at closing raises the equity check, money spent later lowers that year's cash flow.</li>
            <li>Lenders often hold back renovation money and release it as work is done. Ask your lender how they treat the budget.</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
