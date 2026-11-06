import { useState } from "react"
import type { Session } from "@supabase/supabase-js"
import { sendFeedback } from "../lib/store"

/** A small button in the corner of every page. Sends the comment with the page it came from. */
export default function Feedback({ session, page }: { session: Session | null; page: string }) {
  const [open, setOpen] = useState(false), [msg, setMsg] = useState(""), [state, setState] = useState<"" | "sending" | "sent">("")
  async function send() {
    if (!msg.trim()) return
    setState("sending")
    await sendFeedback(session, page + (location.hash && !location.hash.startsWith("#share") ? " › " + location.hash.slice(1) : ""), msg).catch(() => {})
    setState("sent"); setMsg("")
    setTimeout(() => { setOpen(false); setState("") }, 1600)
  }
  return (
    <div className="fixed bottom-4 right-4 z-40 print:hidden">
      {open ? (
        <div className="w-80 rounded-lg border border-[#e4e4de] bg-white p-4 shadow-lg">
          {state === "sent" ? <div className="py-6 text-center text-sm font-medium text-pass-600">Thanks, sent.</div> : <>
            <div className="flex items-center"><div className="font-semibold text-ink">Send feedback</div><button className="ml-auto text-slate-400 hover:text-ink" onClick={() => setOpen(false)} aria-label="Close">✕</button></div>
            <p className="mt-1 text-xs text-slate-500">Something confusing, broken or missing on this page? Say what you were trying to do.</p>
            <textarea className="mt-3 h-28 w-full resize-none" value={msg} maxLength={4000} autoFocus onChange={e => setMsg(e.target.value)} placeholder="e.g. I couldn't find where to enter the loan rate" />
            <button className="btn btn-primary mt-2 w-full" disabled={!msg.trim() || state === "sending"} onClick={send}>{state === "sending" ? "Sending…" : "Send"}</button>
          </>}
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="rounded-full border border-[#e4e4de] bg-white px-4 py-2 text-sm font-medium text-ink shadow-md hover:bg-slate-50">Feedback</button>
      )}
    </div>
  )
}
