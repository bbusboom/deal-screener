import { useState } from "react"
import { XIcon } from "./Site"
import type { Session } from "@supabase/supabase-js"
import { sendFeedback } from "../lib/store"

/** A small button in the corner of every page. Sends the comment with the page it came from. */
export default function Feedback({ session, page, lift }: { session: Session | null; page: string; lift?: boolean }) {
  const [open, setOpen] = useState(false), [msg, setMsg] = useState(""), [state, setState] = useState<"" | "sending" | "sent">("")
  async function send() {
    if (!msg.trim()) return
    setState("sending")
    await sendFeedback(session, page + (location.hash && !location.hash.startsWith("#share") ? " › " + location.hash.slice(1) : ""), msg).catch(() => {})
    setState("sent"); setMsg("")
    setTimeout(() => { setOpen(false); setState("") }, 1600)
  }
  return (
    <div className={`fixed right-2 z-40 sm:right-4 print:hidden ${lift ? "bottom-[calc(4.5rem+env(safe-area-inset-bottom))] sm:bottom-4" : "bottom-4"}`}>
      {open ? (
        <div className="w-[min(20rem,calc(100vw-2rem))] rounded-lg border border-[#e4e4de] bg-white p-4 shadow-lg">
          {state === "sent" ? <div className="py-6 text-center text-sm font-medium text-pass-600">Thanks, sent.</div> : <>
            <div className="flex items-center"><div className="font-semibold text-ink">Send feedback</div><button className="ml-auto text-slate-400 hover:text-ink" onClick={() => setOpen(false)} aria-label="Close"><XIcon className="h-5 w-5" /></button></div>
            <p className="mt-1 text-xs text-slate-500">Something confusing, broken or missing on this page? Say what you were trying to do.</p>
            <textarea className="mt-3 h-28 w-full resize-none" value={msg} maxLength={4000} autoFocus onChange={e => setMsg(e.target.value)} placeholder="e.g. I couldn't find where to enter the loan rate" />
            <button className="btn btn-primary mt-2 w-full" disabled={!msg.trim() || state === "sending"} onClick={send}>{state === "sending" ? "Sending…" : "Send"}</button>
          </>}
        </div>
      ) : (
        <button onClick={() => setOpen(true)} aria-label="Send feedback" className="flex items-center gap-2 rounded-full border border-[#e4e4de] bg-white/90 p-2 text-sm font-medium text-ink shadow-md backdrop-blur hover:bg-slate-50 sm:bg-white sm:px-4 sm:py-2">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z" /></svg>
          <span className="hidden sm:inline">Feedback</span></button>
      )}
    </div>
  )
}
