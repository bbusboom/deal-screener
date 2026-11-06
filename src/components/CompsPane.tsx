import { type RentComp, type SaleComp, usd, pct } from "../lib/model"
import { Card, NumInput } from "./ui"
import type { PaneProps } from "./Panes"

const avg = (xs: number[]) => { const v = xs.filter(x => x > 0); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : NaN }
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "")

export function CompsPane({ d, p, set }: PaneProps) {
  const rc = d.rentComps, sc = d.saleComps
  const setRc = (i: number, patch: Partial<RentComp>) => set({ rentComps: rc.map((c, j) => j === i ? { ...c, ...patch } : c) })
  const setSc = (i: number, patch: Partial<SaleComp>) => set({ saleComps: sc.map((c, j) => j === i ? { ...c, ...patch } : c) })
  const types = d.units.map(u => u.type)

  // Rent comps by subject unit type (matched on the type label).
  const byType = d.units.map((u, i) => {
    const m = rc.filter(c => norm(c.type) === norm(u.type))
    const rent = avg(m.map(c => c.rent)), psf = avg(m.filter(c => c.sf > 0).map(c => c.rent / c.sf))
    const subjMkt = (u.market || 0) > 0 ? u.market! : u.rent
    return { i, u, n: m.length, rent, psf, sfRent: psf * (u.sf || 0), subjMkt }
  })

  const ppu = avg(sc.map(c => c.units > 0 ? c.price / c.units : 0)), capAvg = avg(sc.map(c => c.cap))
  const byPpu = ppu * p.units, byCap = capAvg > 0 ? p.y1.noiBR / (capAvg / 100) : NaN
  const cell = "!py-1"
  return (
    <div className="space-y-4">
      <Card title="Rent comps" right={<button className="btn" onClick={() => set({ rentComps: [...rc, { name: "", dist: 0, built: 0, type: types[0] || "", rent: 0, sf: 0 }] })}>+ Add rent comp</button>}>
        {rc.length === 0 ? <p className="note">Add comparable properties' asking or effective rents by unit type. They test the market rents on the Income tab, which drive loss to lease and the renovation premium. Pull them from listing sites, CoStar, or a broker survey, or ask Deal School AI to help organize them.</p> : (
          <div className="overflow-x-auto"><table className="tbl">
            <thead><tr><th>Property</th><th>Miles</th><th>Year built</th><th className="!text-left">Unit type</th><th>Rent / mo</th><th>SF</th><th>$/SF</th><th /></tr></thead>
            <tbody>{rc.map((c, i) => (
              <tr key={i}>
                <td className={cell}><input className="!w-48" value={c.name} placeholder="Comp name" onChange={e => setRc(i, { name: e.target.value })} /></td>
                <td className={cell}><NumInput className="!w-16 text-right" value={c.dist} step={0.1} onChange={v => setRc(i, { dist: v })} /></td>
                <td className={cell}><NumInput className="!w-20 text-right" value={c.built} onChange={v => setRc(i, { built: v })} /></td>
                <td className={`${cell} !text-left`}><select className="!w-auto" value={c.type} onChange={e => setRc(i, { type: e.target.value })}>{[...new Set([...types, c.type])].map(t => <option key={t} value={t}>{t || "(type)"}</option>)}</select></td>
                <td className={cell}><NumInput className="!w-24 text-right" value={c.rent} step={10} onChange={v => setRc(i, { rent: v })} /></td>
                <td className={cell}><NumInput className="!w-20 text-right" value={c.sf} step={10} onChange={v => setRc(i, { sf: v })} /></td>
                <td className="num">{c.sf > 0 ? "$" + (c.rent / c.sf).toFixed(2) : ""}</td>
                <td><button className="text-slate-400 hover:text-fail-600" onClick={() => set({ rentComps: rc.filter((_, j) => j !== i) })}>✕</button></td>
              </tr>))}</tbody>
          </table></div>)}
        {rc.length > 0 && <>
          <h3 className="card-title mt-6">Comps vs. your underwriting</h3>
          <div className="overflow-x-auto"><table className="tbl">
            <thead><tr><th>Unit type</th><th>Comps</th><th>Comp avg rent</th><th>Comp $/SF × your SF</th><th>Your in place</th><th>Your market rent</th><th>Gap</th><th /></tr></thead>
            <tbody>{byType.map(r => {
              const target = isFinite(r.rent) ? Math.round(r.rent) : NaN, gap = r.subjMkt - target
              return <tr key={r.i}>
                <td>{r.u.type || "Unit"}</td><td className="num">{r.n}</td><td className="num">{usd(r.rent)}</td><td className="num">{isFinite(r.sfRent) && r.sfRent > 0 ? usd(r.sfRent) : "n/a"}</td>
                <td className="num">{usd(r.u.rent)}</td><td className="num">{usd(r.subjMkt)}</td>
                <td className={`num ${isFinite(gap) && gap > 25 ? "text-fail-600" : ""}`}>{isFinite(gap) ? (gap > 0 ? "+" : "") + usd(gap) : ""}</td>
                <td>{isFinite(target) && <button className="btn !py-0.5 !text-xs" onClick={() => set({ units: d.units.map((u, j) => j === r.i ? { ...u, market: target } : u) })}>Use as market rent</button>}</td>
              </tr>
            })}</tbody>
          </table></div>
          <p className="note mt-2">A red gap means your market rent is above what the comps support. Comps should be similar age, class and location; adjust for amenities and whether rents are asking or effective (after concessions).</p>
        </>}
      </Card>

      <Card title="Sale comps" right={<button className="btn" onClick={() => set({ saleComps: [...sc, { name: "", date: "", built: 0, units: 0, price: 0, cap: 0 }] })}>+ Add sale comp</button>}>
        {sc.length === 0 ? <p className="note">Add recent sales of similar properties to check your price and exit cap. Brokers and county records are the usual sources.</p> : (
          <div className="overflow-x-auto"><table className="tbl">
            <thead><tr><th>Property</th><th>Sale date</th><th>Year built</th><th>Units</th><th>Price</th><th>$/unit</th><th>Cap rate %</th><th /></tr></thead>
            <tbody>{sc.map((c, i) => (
              <tr key={i}>
                <td className={cell}><input className="!w-48" value={c.name} placeholder="Comp name" onChange={e => setSc(i, { name: e.target.value })} /></td>
                <td className={cell}><input className="!w-28" value={c.date} placeholder="e.g. Mar 2026" onChange={e => setSc(i, { date: e.target.value })} /></td>
                <td className={cell}><NumInput className="!w-20 text-right" value={c.built} onChange={v => setSc(i, { built: v })} /></td>
                <td className={cell}><NumInput className="!w-16 text-right" value={c.units} onChange={v => setSc(i, { units: v })} /></td>
                <td className={cell}><NumInput className="!w-32 text-right" value={c.price} step={10000} onChange={v => setSc(i, { price: v })} /></td>
                <td className="num">{c.units > 0 ? usd(c.price / c.units) : ""}</td>
                <td className={cell}><NumInput className="!w-20 text-right" value={c.cap} step={0.05} onChange={v => setSc(i, { cap: v })} /></td>
                <td><button className="text-slate-400 hover:text-fail-600" onClick={() => set({ saleComps: sc.filter((_, j) => j !== i) })}>✕</button></td>
              </tr>))}</tbody>
          </table></div>)}
        {sc.length > 0 && <table className="tbl mt-4"><tbody>
          <tr className="head"><td>Your deal vs. the comps</td><td /><td /></tr>
          <tr><td>Average $/unit</td><td className="num">{usd(ppu)}</td><td className="num text-slate-500">yours {usd(p.y1.ppu)}</td></tr>
          <tr><td>Value at comp $/unit</td><td className="num">{usd(byPpu)}</td><td className={`num ${d.price > byPpu * 1.05 ? "text-fail-600" : "text-slate-500"}`}>price {pct(d.price / byPpu - 1, 1)} vs comps</td></tr>
          <tr><td>Average cap rate</td><td className="num">{isFinite(capAvg) ? capAvg.toFixed(2) + "%" : "n/a"}</td><td className="num text-slate-500">your going in {pct(d.price > 0 ? p.y1.noiBR / d.price : NaN)} (before reserves)</td></tr>
          <tr><td>Value at comp cap rate (your NOI before reserves)</td><td className="num">{usd(byCap)}</td><td className="num text-slate-500">{isFinite(byCap) ? `price ${pct(d.price / byCap - 1, 1)} vs comps` : ""}</td></tr>
          <tr><td>Your exit cap</td><td className="num">{d.exitCap}%</td><td>{isFinite(capAvg) && <button className="btn !py-0.5 !text-xs" onClick={() => set({ exitCap: Math.round((capAvg + Math.min(0.75, Math.max(0.25, d.hold * 0.05))) * 20) / 20 })}>Set exit cap to comp avg + {Math.min(0.75, Math.max(0.25, d.hold * 0.05)).toFixed(2)}</button>}</td></tr>
        </tbody></table>}
        {sc.length > 0 && <p className="note mt-2">Broker cap rates are usually on the seller's trailing NOI before reserves, so this compares like with like. Comp prices per unit vary a lot with vintage and unit size; weight the closest matches.</p>}
      </Card>
    </div>
  )
}
