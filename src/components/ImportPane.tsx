import { useRef, useState } from "react"
import type { Deal } from "../lib/model"
import { usd } from "../lib/model"
import {
  type Extraction, type ExtractKey, type Candidate, EXTRACT_FIELDS, DOC_LABEL, UNIT_PRIORITY, candidatesFor, fmtField,
} from "../lib/extract"
import { Card } from "./ui"

export const CODE_KEY = "dealSchool.accessCode"
export const getCode = () => { try { return localStorage.getItem(CODE_KEY) || "" } catch { return "" } }

type Item = { id: number; file: File; status: "reading" | "done" | "error"; error?: string; ex?: Extraction }
const MAX_BYTES = 3_000_000
const ACCEPT = ".pdf,.png,.jpg,.jpeg,.webp,.xlsx,.xls,.csv,.txt"

const toBase64 = (f: File) => new Promise<string>((ok, bad) => {
  const r = new FileReader(); r.onload = () => ok(String(r.result).split(",")[1] || ""); r.onerror = () => bad(r.error); r.readAsDataURL(f)
})
async function spreadsheetText(f: File) {
  const XLSX = await import("xlsx")
  const wb = XLSX.read(await f.arrayBuffer(), { type: "array" })
  return wb.SheetNames.map(n => `### Sheet: ${n}\n` + XLSX.utils.sheet_to_csv(wb.Sheets[n], { blankrows: false })).join("\n\n")
}
async function payloadFor(f: File) {
  const name = f.name.toLowerCase()
  if (/\.(xlsx|xls)$/.test(name)) return { filename: f.name, text: await spreadsheetText(f) }
  if (/\.(csv|txt)$/.test(name)) return { filename: f.name, text: await f.text() }
  if (f.size > MAX_BYTES) throw new Error("File is over 3 MB. Split the PDF, or upload just the rent roll or T12 pages.")
  const mediaType = name.endsWith(".pdf") ? "application/pdf" : f.type
  return { filename: f.name, mediaType, data: await toBase64(f) }
}

export default function ImportPane({ deal, onApply }: { deal: Deal; onApply: (patch: Partial<Deal>, summary: string) => void }) {
  const [items, setItems] = useState<Item[]>([])
  const [drag, setDrag] = useState(false)
  const [choice, setChoice] = useState<Record<string, number>>({})   // field -> candidate index, -1 = skip
  const [unitChoice, setUnitChoice] = useState(0)
  const [needCode, setNeedCode] = useState(false)
  const [code, setCode] = useState(getCode)
  const inputRef = useRef<HTMLInputElement>(null)
  const nextId = useRef(1)

  const upd = (id: number, patch: Partial<Item>) => setItems(list => list.map(i => i.id === id ? { ...i, ...patch } : i))

  async function run(it: Item) {
    try {
      const body = await payloadFor(it.file)
      const r = await fetch("/api/extract", { method: "POST", headers: { "content-type": "application/json", "x-access-code": getCode() }, body: JSON.stringify(body) })
      if (r.status === 404) throw new Error("The import server isn't running here. It works on the deployed site.")
      const data = await r.json().catch(() => ({}))
      if (r.status === 401) { setNeedCode(true); throw new Error("Enter the access code, then click Retry.") }
      if (r.status === 429 || data.error === "rate_limited") throw new Error("Too many requests right now. Wait a minute and retry.")
      if (!r.ok) throw new Error(data.error || `Import failed (${r.status})`)
      upd(it.id, { status: "done", ex: data.extraction })
    } catch (e: any) { upd(it.id, { status: "error", error: e.message || String(e) }) }
  }
  function add(files: FileList | File[]) {
    const fresh = [...files].map(file => ({ id: nextId.current++, file, status: "reading" as const }))
    setItems(list => [...list, ...fresh]); setChoice({})
    fresh.forEach(run)
  }

  const done = items.filter(i => i.status === "done" && i.ex).map(i => ({ file: i.file.name, ex: i.ex! }))
  const keys = Object.keys(EXTRACT_FIELDS) as ExtractKey[]
  const cands: Record<string, Candidate[]> = Object.fromEntries(keys.map(k => [k, candidatesFor(k, done)]))
  const found = keys.filter(k => cands[k].length)
  const unitCands = done.filter(r => r.ex.unit_mix?.units?.length).sort((a, b) => UNIT_PRIORITY.indexOf(a.ex.document_type) - UNIT_PRIORITY.indexOf(b.ex.document_type))
  const name = done.find(r => r.ex.property_name)?.ex.property_name
  const busy = items.some(i => i.status === "reading")

  function apply() {
    const patch: any = {}; const applied: string[] = []
    found.forEach(k => { const i = choice[k] ?? 0; if (i >= 0 && cands[k][i]) { patch[k] = cands[k][i].value; applied.push(EXTRACT_FIELDS[k].label) } })
    if (unitCands.length && unitChoice >= 0) { patch.units = unitCands[unitChoice].ex.unit_mix!.units.map(u => ({ type: u.type, count: Math.round(u.count), rent: Math.round(u.rent) })); applied.push("unit mix") }
    if (name && !deal.name) patch.name = name
    onApply(patch, applied.length ? `Updated ${applied.length} items from your documents` : "Nothing selected")
  }

  return (
    <div className="space-y-4">
      <Card title="Import documents">
        <div onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files.length) add(e.dataTransfer.files) }}
          className={`cursor-pointer rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${drag ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:border-brand-500 hover:bg-slate-50"}`}>
          <div className="text-base font-semibold">Drop a rent roll, T12, offering memo or loan quote</div>
          <div className="note mt-1">PDF, Excel, CSV or a photo of the page. Claude reads each file and suggests values; nothing changes until you apply them.</div>
          <button className="btn btn-primary mt-4" onClick={e => { e.stopPropagation(); inputRef.current?.click() }}>Choose files</button>
          <input ref={inputRef} type="file" multiple accept={ACCEPT} className="hidden" onChange={e => { if (e.target.files?.length) add(e.target.files); e.target.value = "" }} />
        </div>
        {needCode && (
          <div className="mt-3 flex gap-2">
            <input type="password" placeholder="Access code" value={code} onChange={e => setCode(e.target.value)} />
            <button className="btn" onClick={() => { try { localStorage.setItem(CODE_KEY, code) } catch {} setNeedCode(false) }}>Save code</button>
          </div>)}
        {items.length > 0 && (
          <ul className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
            {items.map(it => (
              <li key={it.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
                <span className="font-medium">{it.file.name}</span>
                <span className="flex items-center gap-2">
                  {it.status === "reading" && <span className="text-slate-500">Reading…</span>}
                  {it.status === "done" && <span className="text-pass-600">{DOC_LABEL[it.ex!.document_type] || "Read"} · {Object.keys(it.ex!.fields || {}).length + (it.ex!.unit_mix ? 1 : 0)} items found</span>}
                  {it.status === "error" && <><span className="text-fail-600">{it.error}</span><button className="btn !py-0.5 text-xs" onClick={() => { upd(it.id, { status: "reading", error: undefined }); run(it) }}>Retry</button></>}
                  <button className="text-slate-400 hover:text-fail-600" title="Remove" onClick={() => setItems(l => l.filter(x => x.id !== it.id))}>✕</button>
                </span>
              </li>))}
          </ul>)}
      </Card>

      {(found.length > 0 || unitCands.length > 0) && (
        <Card title="Review before applying" right={<button className="btn btn-primary" disabled={busy} onClick={apply}>Apply selected to deal</button>}>
          {name && <p className="mb-3 text-sm">Property: <b>{name}</b>{deal.name ? <span className="note"> (deal name kept as “{deal.name}”)</span> : null}</p>}
          <div className="overflow-x-auto"><table className="tbl">
            <thead><tr><th>Input</th><th>Current</th><th>From documents</th><th className="!text-left">Source</th></tr></thead>
            <tbody>
              {found.map(k => { const c = cands[k], i = choice[k] ?? 0, cur = c[i]; return (
                <tr key={k}>
                  <td>{EXTRACT_FIELDS[k].label}</td>
                  <td className="num text-slate-500">{fmtField(k, deal[k] as number)}</td>
                  <td>
                    <select className="w-auto font-mono" value={i} onChange={e => setChoice(s => ({ ...s, [k]: +e.target.value }))}>
                      {c.map((x, j) => <option key={j} value={j}>{fmtField(k, x.value)}{c.length > 1 ? ` · ${DOC_LABEL[x.docType]}` : ""}</option>)}
                      <option value={-1}>Keep current</option>
                    </select>
                  </td>
                  <td className="!whitespace-normal !text-left text-xs text-slate-500">{cur ? <>{cur.source} <span className="text-slate-400">· {cur.file}</span>{k === "tax" && cur.docType !== "loan_quote" ? <span className="block text-amber-700">This is the seller's tax bill. Taxes usually reset after a sale, so check the expected assessment at your price.</span> : null}</> : "Not changed"}</td>
                </tr>) })}
            </tbody>
          </table></div>

          {unitCands.length > 0 && (
            <div className="mt-6">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="card-title !mb-0">Unit mix</h3>
                <select className="w-auto" value={unitChoice} onChange={e => setUnitChoice(+e.target.value)}>
                  {unitCands.map((r, j) => <option key={j} value={j}>Use {DOC_LABEL[r.ex.document_type]} · {r.file}</option>)}
                  <option value={-1}>Keep current unit mix</option>
                </select>
              </div>
              {unitChoice >= 0 && unitCands[unitChoice] && (() => { const um = unitCands[unitChoice].ex.unit_mix!; const total = um.units.reduce((s, u) => s + u.count, 0); return (
                <>
                  <table className="tbl"><thead><tr><th>Type</th><th>Units</th><th>Rent / mo</th></tr></thead>
                    <tbody>{um.units.map((u, j) => <tr key={j}><td>{u.type}</td><td className="num">{u.count}</td><td className="num">{usd(u.rent)}</td></tr>)}
                      <tr className="total"><td>Total</td><td className="num">{total}</td><td className="num">{usd(um.units.reduce((s, u) => s + u.count * u.rent, 0) / Math.max(1, total))} avg</td></tr></tbody></table>
                  <p className="note mt-1">{um.rent_basis}. {um.source}</p>
                </>) })()}
            </div>)}

          {done.some(r => r.ex.notes?.length) && (
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
              <div className="mb-1 font-semibold text-amber-800">Double check</div>
              <ul className="list-disc space-y-0.5 pl-5 text-amber-900">
                {done.flatMap(r => (r.ex.notes || []).map((n, j) => <li key={r.file + j}>{n} <span className="text-amber-700/70">· {r.file}</span></li>))}
              </ul>
            </div>)}
          <p className="note mt-3">When two documents disagree, the dropdown starts with the most reliable source for that line: the T12 for expenses, the rent roll for units, the offering memo for price and the loan quote for financing.</p>
        </Card>
      )}
    </div>
  )
}
