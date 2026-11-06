import { useRef, useState } from "react"
import { usd, pct } from "../lib/model"
import { detectColumns, buildUnits, analyze, RR_FIELDS, type RRField } from "../lib/rentroll"
import { Card } from "./ui"
import type { PaneProps } from "./Panes"

/** Property › Rent roll: upload a unit level rent roll and see occupancy, loss to lease and lease expirations. */
export function RentRollPane({ d, set }: PaneProps) {
  const [raw, setRaw] = useState<any[][] | null>(null)
  const [det, setDet] = useState<{ headerRow: number; map: Partial<Record<RRField, number>> } | null>(null)
  const [err, setErr] = useState(""), [showUnits, setShowUnits] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  async function load(f: File) {
    setErr("")
    try {
      const XLSX = await import("xlsx")
      const wb = XLSX.read(await f.arrayBuffer(), { cellDates: true })
      const rows = XLSX.utils.sheet_to_json<any[]>(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: true, defval: "" })
      const dt = detectColumns(rows)
      setRaw(rows); setDet(dt)
      if (dt.map.unit === undefined || dt.map.rent === undefined) { setErr("Couldn't find the unit and rent columns automatically. Pick them below."); return }
      set({ rr: buildUnits(rows, dt.headerRow, dt.map), rrName: f.name })
    } catch (e: any) { setErr("Couldn't read that file: " + (e?.message || e)) }
  }
  function remap(k: RRField, col: number) {
    if (!raw || !det) return
    const map = { ...det.map, [k]: col < 0 ? undefined : col }; const nd = { ...det, map }; setDet(nd)
    if (map.unit !== undefined && map.rent !== undefined) set({ rr: buildUnits(raw, nd.headerRow, map) })
  }
  const a = d.rr.length ? analyze(d.rr) : null
  const header = raw && det ? raw[det.headerRow] : null

  function applyMix() {
    if (!a) return
    set({ units: a.types.map(t => ({ type: t.type, count: t.count, rent: Math.round(t.inPlace || t.market), market: t.market > t.inPlace ? Math.round(t.market) : 0, sf: Math.round(t.sf) })), nru: a.nonrev })
  }
  const maxM = a ? Math.max(1, ...a.months.map(m => m.count)) : 1

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center gap-3 !py-4">
        <div className="mr-auto">
          <div className="font-display text-lg font-semibold text-brand-900">{d.rrName || "Unit level rent roll"}</div>
          <div className="text-xs text-slate-500">Excel or CSV export from the property's management software (Yardi, RealPage, AppFolio, Entrata, Rent Manager). Read in your browser; columns are found automatically.</div>
        </div>
        <input ref={input} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e => e.target.files?.[0] && load(e.target.files[0])} />
        <button className="btn btn-gold" onClick={() => input.current?.click()}>{d.rr.length ? "Upload a new rent roll" : "Upload rent roll"}</button>
        {d.rr.length > 0 && <button className="btn" onClick={() => { set({ rr: [], rrName: "" }); setRaw(null); setDet(null) }}>Clear</button>}
      </div>
      {err && <div className="rounded-xl bg-gold-50 px-4 py-3 text-sm text-gold-700">{err}</div>}

      {header && det && <Card title="Columns found">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {RR_FIELDS.map(f => (
            <label key={f.k} className="flex flex-col gap-1 text-xs font-medium text-slate-500">{f.label}
              <select value={det.map[f.k] ?? -1} onChange={e => remap(f.k, Number(e.target.value))}>
                <option value={-1}>(none)</option>{header.map((h, i) => <option key={i} value={i}>{String(h || `Column ${i + 1}`)}</option>)}
              </select></label>))}
        </div>
        <p className="note mt-2">Check these if numbers look off. Rows without a unit number and total rows are skipped.</p>
      </Card>}

      {!a ? !header && <Card><p className="note">Upload a rent roll to see physical and economic occupancy, in place vs market rent by unit type, units far below market, month to month leases and when leases expire. One click turns it into your unit mix.</p></Card> : <>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          {([["Units", String(a.total)], ["Physical occupancy", pct(a.physicalOcc, 1)], ["Economic occupancy", a.marketTotal ? pct(a.economicOcc, 1) : "n/a"],
             ["Vacant / non revenue", `${a.vacant} / ${a.nonrev}`], ["Month to month", String(a.mtm)], ["10%+ below market", String(a.below)]] as const).map(([l, v]) =>
            <div key={l} className="card !p-4"><div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{l}</div><div className="num mt-1 text-xl font-semibold text-brand-900">{v}</div></div>)}
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Card title="By unit type" right={<button className="btn btn-primary" onClick={applyMix}>Use as unit mix</button>}>
            <div className="overflow-x-auto"><table className="tbl">
              <thead><tr><th>Type</th><th>Units</th><th>Occupied</th><th>Avg SF</th><th>Avg in place</th><th>Avg market</th><th>Loss to lease</th><th>Rent range</th></tr></thead>
              <tbody>{a.types.map(t => (
                <tr key={t.type}><td>{t.type}</td><td className="num">{t.count}</td><td className="num">{t.occupied}{t.vacant ? <span className="text-fail-600"> ({t.vacant} vac)</span> : ""}</td>
                  <td className="num">{t.sf ? Math.round(t.sf) : ""}</td><td className="num">{usd(t.inPlace)}</td><td className="num">{t.market ? usd(t.market) : ""}</td>
                  <td className={`num ${t.ltl > 50 ? "text-pass-600" : ""}`}>{t.ltl ? usd(t.ltl) : ""}</td>
                  <td className="num text-xs text-slate-500">{isFinite(t.minRent) ? `${usd(t.minRent)} to ${usd(t.maxRent)}` : ""}</td></tr>))}</tbody>
            </table></div>
            <p className="note mt-2">"Use as unit mix" sets your unit types, counts, average in place rent (occupied units), market rent and square feet, plus {a.nonrev} non revenue units. Physical vacancy here is {pct(1 - a.physicalOcc, 1)}; most underwriters still use at least 5 to 7%.</p>
            <div className="mt-2 flex flex-wrap gap-2"><button className="btn" onClick={() => set({ vac: Math.max(5, Math.round((a.vacant / Math.max(1, a.total)) * 1000) / 10) })}>Set vacancy to {Math.max(5, Math.round((a.vacant / Math.max(1, a.total)) * 1000) / 10)}%</button></div>
          </Card>
          <Card title="Lease expirations, next 12 months">
            <div className="flex h-[150px] items-end gap-1.5">
              {a.months.map(m => <div key={m.key} className="flex flex-1 flex-col items-center gap-1">
                <div className="num text-[11px] font-semibold text-brand-900">{m.count || ""}</div>
                <div className={`w-full rounded-t ${m.count / Math.max(1, a.total) > 0.15 ? "bg-gradient-to-t from-fail-500 to-gold-400" : "bg-gradient-to-t from-brand-600 to-brand-400"}`} style={{ height: Math.max(2, m.count / maxM * 110) }} />
                <div className="text-[10px] text-slate-400">{m.label.split(" ")[0]}</div></div>)}
            </div>
            <table className="tbl mt-3"><tbody>
              <tr><td>Month to month or expired</td><td className="num">{a.mtm}</td></tr>
              <tr><td>Expiring after 12 months</td><td className="num">{a.later}</td></tr>
              <tr><td>Most in one month</td><td className={`num ${a.maxMonthShare > 0.15 ? "text-fail-600" : ""}`}>{pct(a.maxMonthShare, 0)} of units</td></tr>
            </tbody></table>
            <p className="note mt-2">More than about 15% of leases ending in one month is a turnover risk. Lots of month to month leases can be an opportunity to raise rents, or a sign of weak management.</p>
          </Card>
        </div>
        <Card title="Units" right={<button className="btn" onClick={() => setShowUnits(s => !s)}>{showUnits ? "Hide" : `Show all ${a.total}`}</button>}>
          {showUnits ? <div className="max-h-[480px] overflow-auto"><table className="tbl text-[13px]">
            <thead><tr><th>Unit</th><th className="!text-left">Type</th><th>SF</th><th className="!text-left">Status</th><th>Rent</th><th>Market</th><th>Gap</th><th>Lease end</th></tr></thead>
            <tbody>{d.rr.map(u => <tr key={u.unit}><td>{u.unit}</td><td className="!text-left">{u.type}</td><td className="num">{u.sf || ""}</td>
              <td className="!text-left"><span className={`chip ${u.status === "occupied" ? "bg-pass-50 text-pass-700" : u.status === "vacant" ? "bg-fail-50 text-fail-700" : "bg-gold-100 text-gold-700"}`}>{u.status}</span></td>
              <td className="num">{u.rent ? usd(u.rent) : ""}</td><td className="num">{u.market ? usd(u.market) : ""}</td>
              <td className={`num ${u.market && u.rent && u.rent < u.market * 0.9 ? "text-pass-600" : "text-slate-400"}`}>{u.market && u.rent ? usd(u.market - u.rent) : ""}</td><td className="num">{u.end}</td></tr>)}</tbody>
          </table></div> : <p className="note">{a.total} units loaded. Average {Math.round(a.avgSf) || "?"} SF at {usd(a.avgRent)} in place.</p>}
        </Card>
      </>}
    </div>
  )
}
