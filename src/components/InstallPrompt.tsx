import { useEffect, useState } from "react"

const DISMISS = "dealScreener.install.dismissed"
const standalone = () => matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
const isPhone = () => matchMedia("(max-width: 640px)").matches || isIOS() || /android/i.test(navigator.userAgent)

/** On the website's Learn side: points people to the Underwriting Desk app at /learn.
 *  In the app itself (before it is installed): Android gets an Install button, iPhone gets the two taps to add it. */
export default function InstallPrompt({ learnOnly }: { learnOnly: boolean }) {
  const [hidden, setHidden] = useState(() => { try { return standalone() || localStorage.getItem(DISMISS) === "1" } catch { return standalone() } })
  const [evt, setEvt] = useState<any>(null)
  useEffect(() => {
    const f = (e: Event) => { e.preventDefault(); setEvt(e) }
    addEventListener("beforeinstallprompt", f)
    return () => removeEventListener("beforeinstallprompt", f)
  }, [])
  if (hidden) return null
  const close = () => { try { localStorage.setItem(DISMISS, "1") } catch {}; setHidden(true) }

  let body: React.ReactNode
  if (!learnOnly) {
    body = isPhone()
      ? <>Learn on the go with the Underwriting Desk app. <a className="font-semibold underline" href="/learn">Open it</a> and add it to your home screen.</>
      : <>Learn on your phone: open <b>getdealscreener.com/learn</b> on your phone and add it to your home screen. Same account, same progress.</>
  } else if (evt) {
    body = <span className="flex flex-wrap items-center gap-3">Install Underwriting Desk on this device for one tap access.
      <button className="btn btn-primary !py-1" onClick={async () => { evt.prompt(); await evt.userChoice.catch(() => {}); setEvt(null); close() }}>Install</button></span>
  } else if (isIOS()) {
    body = <>To install: tap <b>Share</b> <ShareIcon /> at the bottom of Safari, then <b>Add to Home Screen</b>.</>
  } else return null

  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 md:px-8">
      <div className="flex items-start gap-3 rounded-lg border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-900">
        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-gold-400 text-[10px] font-bold text-[#1c1305]">UD</span>
        <div className="flex-1">{body}</div>
        <button className="text-brand-700/60 hover:text-brand-900" onClick={close} aria-label="Dismiss">✕</button>
      </div>
    </div>
  )
}

function ShareIcon() {
  return <svg viewBox="0 0 24 24" className="-mt-0.5 inline h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-label="Share icon"><path d="M12 3v12M8 7l4-4 4 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
}
