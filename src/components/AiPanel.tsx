import { useRef, useState } from "react"
import type { Deal } from "../lib/model"
import { Card } from "./ui"

type Msg = { role: "user" | "assistant"; content: string }
const CODE_KEY = "dealSchool.accessCode"

const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!))
function mdLite(t: string) {
  return esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").split("\n")
    .map(l => /^\s*[-•]\s+/.test(l) ? `<li>${l.replace(/^\s*[-•]\s+/, "")}</li>` : l).join("\n")
    .replace(/(<li>.*<\/li>\n?)+/g, m => `<ul class="list-disc pl-5 my-1">${m.replace(/\n/g, "")}</ul>`).replace(/\n/g, "<br>")
}
const GREETING = {
  learner: "Learner route. I'll walk through the deal in this screener with you and explain things as they come up. Press Review this deal, or ask me anything about the numbers.",
  pro: "Pro route. I'll stress the deal across scenarios you weight and find your max bid. Tell me your hold period and return targets, or press Review this deal.",
}
const REVIEW = {
  learner: "Walk me through the deal in the screener and give me the review: snapshot, what looks solid, red flags, a stress test, and a verdict.",
  pro: "Underwrite the deal in the screener. Give a quick screen, then propose downside, base and upside scenarios over the hold with explicit assumptions, show breakpoints, and ask me to adjust and weight them.",
}

export default function AiPanel({ deal, onDeal }: { deal: Deal; onDeal: (d: Deal) => void }) {
  const [route, setRoute] = useState<"learner" | "pro">("learner")
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [needCode, setNeedCode] = useState(false)
  const [code, setCode] = useState(() => { try { return localStorage.getItem(CODE_KEY) || "" } catch { return "" } })
  const logRef = useRef<HTMLDivElement>(null)

  async function ask(q: string) {
    if (busy || !q.trim()) return
    const next: Msg[] = [...msgs, { role: "user", content: q.trim() }]
    setMsgs(next); setInput(""); setBusy(true); setError("")
    setTimeout(() => logRef.current?.scrollTo({ top: 1e9 }), 0)
    try {
      const r = await fetch("/api/deal-school", {
        method: "POST",
        headers: { "content-type": "application/json", "x-access-code": code },
        body: JSON.stringify({ route, messages: next, deal }),
      })
      if (r.status === 404) throw new Error("The AI server isn't running here. It works once the site is deployed on Vercel, or locally with `vercel dev`.")
      const data = await r.json().catch(() => ({}))
      if (r.status === 401) { setNeedCode(true); setMsgs(msgs); throw new Error("Enter the access code to use Deal School.") }
      if (r.status === 429 || data.error === "rate_limited") throw new Error("Too many requests right now. Wait a minute and try again.")
      if (!r.ok) throw new Error(data.error || `Request failed (${r.status})`)
      setMsgs([...next, { role: "assistant", content: data.text }])
      if (data.deal) onDeal(data.deal)
    } catch (e: any) {
      setError(e.message || String(e))
    } finally {
      setBusy(false)
      setTimeout(() => logRef.current?.scrollTo({ top: 1e9, behavior: "smooth" }), 0)
    }
  }
  const reset = (r = route) => { setMsgs([]); setError(""); setRoute(r) }

  return (
    <Card title="Deal School AI" right={
      <div className="flex flex-wrap items-center gap-2">
        <select className="w-auto" value={route} onChange={e => reset(e.target.value as any)}>
          <option value="learner">Learner route</option><option value="pro">Pro route</option>
        </select>
        <button className="btn btn-primary" disabled={busy} onClick={() => ask(REVIEW[route])}>Review this deal</button>
        <button className="btn" onClick={() => reset()}>New chat</button>
      </div>}>
      <div ref={logRef} className="mb-3 flex max-h-[560px] min-h-[200px] flex-col gap-2 overflow-auto">
        <div className="max-w-[92%] self-start rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px]">{GREETING[route]}</div>
        {msgs.map((m, i) => m.role === "user"
          ? <div key={i} className="max-w-[92%] self-end rounded-lg bg-brand-600 px-3 py-2 text-[13px] text-white">{m.content}</div>
          : <div key={i} className="max-w-[92%] self-start rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] leading-relaxed" dangerouslySetInnerHTML={{ __html: mdLite(m.content) }} />)}
        {busy && <div className="self-start rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-500">Working through the numbers...</div>}
        {error && <div className="self-start rounded-lg border border-fail-600/30 bg-fail-50 px-3 py-2 text-[13px] text-fail-600">{error}</div>}
      </div>
      {needCode && (
        <div className="mb-3 flex gap-2">
          <input type="password" placeholder="Access code" value={code} onChange={e => setCode(e.target.value)} />
          <button className="btn" onClick={() => { try { localStorage.setItem(CODE_KEY, code) } catch {} setNeedCode(false); setError("") }}>Save code</button>
        </div>)}
      <div className="flex gap-2">
        <textarea rows={1} className="min-h-[38px] flex-1 resize-y" placeholder="Ask about this deal, or tell it what to change" value={input}
          onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(input) } }} />
        <button className="btn btn-primary" disabled={busy} onClick={() => ask(input)}>Send</button>
      </div>
      <p className="note mt-2">Deal School runs its math through the same model as every tab, so its numbers match the screen. It can change inputs when you ask. It can't browse the web yet, so give it local comps and tax figures.</p>
    </Card>
  )
}
