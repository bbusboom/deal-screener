import { useState } from "react"
import type { Session } from "@supabase/supabase-js"
import type { Deal } from "../lib/model"
import { listTemplates, saveTemplate, deleteTemplate, setDefaultTemplate, defaultTemplateName, applyTemplate } from "../lib/templates"
import { Card } from "./ui"

/** Pipeline › Assumption templates: save your standard assumptions and apply them to any deal. */
export function TemplatesCard({ d, setDeal, session, toast }: { d: Deal; setDeal: (d: Deal) => void; session: Session | null; toast: (m: string) => void }) {
  const [list, setList] = useState(listTemplates), [def, setDef] = useState(defaultTemplateName)
  const [name, setName] = useState(""), [makeDefault, setMakeDefault] = useState(true)
  const refresh = () => { setList(listTemplates()); setDef(defaultTemplateName()) }
  return (
    <Card title="Assumption templates">
      <p className="note mb-3">Save your standard underwriting: vacancy, management, reserves, loan terms, growth, exit cap, buy box, scenarios, loan options, waterfall and tax settings, plus operating expenses per unit. The default template fills every new deal. {session ? "Saved to your account." : "Saved in this browser."}</p>
      <div className="flex flex-wrap items-center gap-2">
        <input className="min-w-[200px] flex-1" placeholder="Template name, e.g. Busboom Group standard" value={name} onChange={e => setName(e.target.value)} />
        <label className="flex items-center gap-1.5 text-sm text-slate-600"><input type="checkbox" checked={makeDefault} onChange={e => setMakeDefault(e.target.checked)} /> Use for new deals</label>
        <button className="btn btn-primary" disabled={!name.trim()} onClick={async () => { await saveTemplate(session, d, name.trim(), makeDefault); refresh(); setName(""); toast("Template saved") }}>Save current assumptions</button>
      </div>
      {list.length > 0 && <table className="tbl mt-4">
        <thead><tr><th>Template</th><th>Saved</th><th /></tr></thead>
        <tbody>{list.map(t => (
          <tr key={t.name}>
            <td>{t.name} {def === t.name && <span className="chip ml-1 bg-gold-100 text-gold-700">default</span>}</td>
            <td className="text-xs text-slate-500">{new Date(t.savedAt).toLocaleDateString()}</td>
            <td className="space-x-1 whitespace-nowrap">
              <button className="btn !px-2 !py-0.5 text-xs" onClick={() => { setDeal(applyTemplate(d, t, false)); toast(`Applied ${t.name} (assumptions)`) }}>Apply</button>
              <button className="btn !px-2 !py-0.5 text-xs" title="Also replaces operating expenses with the template's per unit amounts" onClick={() => { setDeal(applyTemplate(d, t, true)); toast(`Applied ${t.name} with expenses`) }}>Apply with expenses</button>
              {def !== t.name && <button className="btn !px-2 !py-0.5 text-xs" onClick={async () => { await setDefaultTemplate(session, t.name); refresh() }}>Make default</button>}
              <button className="btn !px-2 !py-0.5 text-xs" onClick={async () => { await deleteTemplate(session, t.name); refresh() }}>Delete</button>
            </td>
          </tr>))}</tbody>
      </table>}
    </Card>
  )
}
