import { Icon } from "./components/Icons"
import { syncTemplates } from "./lib/templates"
import { useEffect, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import { supabase, accountsEnabled, getSession, getProfile, setPath, signOut, type Path, type Profile } from "./lib/store"
import type { Deal } from "./lib/model"
import Auth from "./components/Auth"
import Landing from "./Landing"
import PathPicker from "./components/PathPicker"
import DealCheck from "./learn/DealCheck"
import Feedback from "./components/Feedback"
import ProWorkspace from "./ProWorkspace"
import LearnerApp from "./LearnerApp"
import Course from "./learn/Course"
import Challenges from "./learn/Challenges"
import { StateSelect } from "./components/MarketPane"
import { useHomeState, setHomeState, syncHomeState } from "./lib/market"

const HAS_ACCOUNT = "dealScreener.hasAccount"

export default function App() {
  const [ready, setReady] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [choosing, setChoosing] = useState(false)
  const [recovery, setRecovery] = useState(false)
  const [toast, setToast] = useState("")
  const [proKey, setProKey] = useState(0)
  const homeState = useHomeState()
  // Anyone who has had an account on this browser skips the public home page and goes straight to sign in.
  const [authMode, setAuthMode] = useState<null | "signin" | "signup">(() => { try { return localStorage.getItem(HAS_ACCOUNT) ? "signin" : null } catch { return null } })
  const [learnTab, setLearnTab] = useState<"course" | "challenges" | "check" | "practice">(() => { try { return (localStorage.getItem("dealScreener.learnTab") as any) || "course" } catch { return "course" } })
  useEffect(() => { try { localStorage.setItem("dealScreener.learnTab", learnTab) } catch {} }, [learnTab])

  useEffect(() => {
    let alive = true, uid: string | null = null
    getSession().then(async s => {
      if (!alive) return
      uid = s?.user.id ?? null
      setSession(s); if (s) { try { localStorage.setItem(HAS_ACCOUNT, "1") } catch {} }
      syncHomeState(s); syncTemplates(s); setProfile(await getProfile(s)); setReady(true)
    })
    if (!supabase) return () => { alive = false }
    // Supabase re-checks the login whenever the tab regains focus and fires SIGNED_IN or TOKEN_REFRESHED.
    // Those must not reload the profile (that is what sent people back to the path picker): only a real
    // change of user does. Work is deferred so no Supabase call runs inside the auth lock.
    const { data } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true)
      const next = s?.user.id ?? null
      setSession(prev => (prev?.user.id === next && prev?.access_token === s?.access_token ? prev : s))
      if (next === uid) return
      uid = next
      if (s) { try { localStorage.setItem(HAS_ACCOUNT, "1") } catch {} }
      setTimeout(async () => {
        if (!alive) return
        syncHomeState(s)
        const p = await getProfile(s)
        if (alive && uid === next) setProfile(p)
      }, 0)
    })
    return () => { alive = false; data.subscription.unsubscribe() }
  }, [])
  // Keep the scroll position across a reload (a browser can discard a background tab and reload it on return).
  useEffect(() => {
    if (!ready) return
    const k = "dealScreener.scroll." + location.hash
    try { const y = Number(sessionStorage.getItem(k)); if (y > 0) requestAnimationFrame(() => setTimeout(() => scrollTo({ top: y }), 60)) } catch {}
    const save = () => { try { sessionStorage.setItem("dealScreener.scroll." + location.hash, String(scrollY)) } catch {} }
    const vis = () => { if (document.visibilityState === "hidden") save() }
    addEventListener("pagehide", save); document.addEventListener("visibilitychange", vis)
    return () => { removeEventListener("pagehide", save); document.removeEventListener("visibilitychange", vis) }
  }, [ready])
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2200); return () => clearTimeout(t) }, [toast])

  const pick = (path: Path) => { setProfile(p => ({ ...(p || { id: "local", username: null }), path })); setChoosing(false); history.replaceState(null, "", location.pathname); void setPath(session, path) }
  const openInPro = (d: Deal) => {
    try { localStorage.setItem("dealScreener.current.v1", JSON.stringify(d)); localStorage.setItem("dealScreener.current.v1.id", "null") } catch {}
    setProKey(k => k + 1); pick("pro"); setToast("Opened in the Pro workspace")
  }

  if (!ready) return <div className="grid min-h-screen place-items-center text-slate-400">Loading…</div>
  if (recovery) return <Auth initial="newpass" onDone={() => setRecovery(false)} />
  if (accountsEnabled && !session) {
    if (!authMode) return <Landing go={m => { setAuthMode(m); scrollTo({ top: 0 }) }} />
    return <Auth key={authMode} initial={authMode} onBack={() => setAuthMode(null)} onSignedUp={() => { try { localStorage.setItem(HAS_ACCOUNT, "1") } catch {} }} />
  }

  const path = profile?.path
  const name = profile?.username || session?.user.email || null

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-night/95 text-white backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:px-8">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-gold-400 text-[13px] font-bold text-[#1c1305]">DS</div>
            <div className="leading-tight"><div className="font-bold">Deal Screener</div><div className="hidden text-[11px] text-white/50 sm:block">with Deal School AI</div></div>
          </div>
          {path && !choosing && (
            <div className="flex rounded-full border border-white/10 bg-white/5 p-1 text-sm font-semibold">
              {(["learner", "pro"] as Path[]).map(p => (
                <button key={p} onClick={() => pick(p)} className={`rounded-full px-4 py-1.5 transition ${path === p ? "bg-white text-brand-900 shadow" : "text-white/60 hover:text-white"}`}>
                  {p === "learner" ? "Learn" : "Underwrite"}
                </button>))}
            </div>)}
          <div className="flex items-center gap-3 text-sm">
            <label className="hidden items-center gap-1.5 text-xs text-white/50 lg:flex" title="Your home state sets the default for taxes, rent rules and policy">
              Home state <StateSelect className="select-dark !py-1 !text-xs" value={homeState} onChange={v => setHomeState(session, v)} />
            </label>
            {name && <span className="hidden text-white/60 md:inline">{name}</span>}
            {accountsEnabled ? <button className="btn btn-ghost" onClick={() => signOut()}>Sign out</button> : <span className="hidden text-xs text-white/40 md:inline">Accounts not set up</span>}
          </div>
        </div>
      </header>

      {!path || choosing ? <PathPicker username={profile?.username} current={path} onPick={pick} />
        : path === "learner" ? (
          <>
            <div className="relative overflow-hidden bg-night text-white">
              <div className="relative mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pt-3 md:px-8">
                {([["course", "Course", Icon.course], ["challenges", "Challenges", Icon.challenge], ["check", "Deal Check", Icon.clock], ["practice", "Practice a deal", Icon.practice]] as const).map(([k, label, ic]) => (
                  <button key={k} onClick={() => setLearnTab(k)} className={`group flex items-center gap-2 whitespace-nowrap rounded-t-xl px-4 py-2.5 text-sm font-semibold transition ${learnTab === k ? "bg-[#f6f6f3] text-ink" : "text-white/60 hover:text-white"}`}>
                    <span className={learnTab === k ? "text-ink" : "text-white/40 group-hover:text-white/70"}>{ic("h-4 w-4")}</span>{label}</button>))}
              </div>
            </div>
            {learnTab === "course" ? <Course session={session} onPractice={() => setLearnTab("practice")} /> : learnTab === "challenges" ? <Challenges session={session} /> : learnTab === "check" ? <DealCheck session={session} onOpenInPro={openInPro} /> : <LearnerApp session={session} toast={setToast} onOpenInPro={openInPro} />}
          </>)
        : <ProWorkspace key={proKey} session={session} toast={setToast} />}

      <footer className="mx-auto max-w-7xl px-4 pb-8 pt-4 text-xs text-slate-400 md:px-8">Screening and learning tool, not investment advice. Verify rent roll, T12, taxes after sale and insurance quotes.</footer>
      {path && !choosing && <Feedback session={session} page={path === "learner" ? `Learn › ${learnTab}` : "Underwrite"} />}
      {toast && <div className="fixed bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-md bg-ink px-4 py-2 text-sm text-white">{toast}</div>}
    </div>
  )
}
