import { useEffect, useState } from "react"
import { type Deal, project, maxPrice } from "../lib/model"
import { readShare } from "../lib/templates"
import { MemoView } from "./Memo"

/** Read only view of a deal opened from a share link. Works without an account. */
export function SharedDeal() {
  const [d, setD] = useState<Deal | null | undefined>(undefined)
  useEffect(() => { readShare(location.hash).then(setD) }, [])
  if (d === undefined) return <div className="grid min-h-screen place-items-center text-slate-400">Opening shared deal…</div>
  if (!d) return <div className="grid min-h-screen place-items-center p-6 text-center"><div><div className="font-display text-2xl text-brand-900">This share link didn't open</div><p className="mt-2 text-slate-500">It may have been cut off when it was copied. Ask for the link again.</p><a className="btn btn-primary mt-4" href="/">Go to Underwriting Desk</a></div></div>
  const p = project(d), mp = maxPrice(d)
  const openInWorkspace = () => {
    try { localStorage.setItem("dealScreener.current.v1", JSON.stringify(d)); localStorage.setItem("dealScreener.current.v1.id", "null") } catch {}
    location.href = "/#summary"
  }
  return (
    <div className="min-h-screen bg-night">
      <MemoView d={d} p={p} mp={mp} onClose={() => { location.href = "/" }} closeLabel="Visit Underwriting Desk"
        extra={<><span className="mr-auto self-center text-sm text-white/70">Shared from <b className="text-white">Underwriting Desk</b> · read only</span><button className="btn btn-gold" onClick={openInWorkspace}>Open a copy in my workspace</button></>} />
    </div>
  )
}
