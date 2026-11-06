import { Icon } from "./components/Icons"
import { useEffect, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import { supabase, accountsEnabled, getSession, getProfile, setPath, signOut, type Path, type Profile } from "./lib/store"
import type { Deal } from "./lib/model"
import Auth from "./components/Auth"
import Landing from "./Landing"
import PathPicker from "./components/PathPicker"
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
  const [learnTab, setLearnTab] = useState<"course" | "challenges" | "practice">(() => { try { return (localStorage.getItem("dealScreener.learnTab") as any) || "course" } catch { return "course" } })
  useEffect(() => { try { localStorage.setItem("dealScreener.learnTab", learnTab) } catch {} }, [learnTab])

  useEffect(() => {
    let alive = true
    getSession().then(async s => { if (!alive) return; setSession(s); if (s) { try { localStorage.setItem(HAS_ACCOUNT, "1") } catch {} } syncHomeState(s); setProfile(await getProfile(s)); setReady(true) })
    if (!supabase) return () => { alive = false }
    const { data } = supabase.auth.onAuthStateChange(async (event, s) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true)
      setSession(s); syncHomeState(s); setProfile(await getProfile(s))
      if (s) { try { localStorage.setItem(HAS_ACCOUNT, "1") } catch {} }
    })
    return () => { alive = false; data.subscription.unsubscribe() }
  }, [])
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2200); return () => clearTimeout(t) }, [toast])

  const pick = async (path: Path) => { await setPath(session, path); setProfile(p => ({ ...(p || { id: "local", username: null }), path })); setChoosing(false); history.replaceState(null, "", location.pathname) }
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
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-gold-300 to-gold-500 text-sm font-bold text-[#1a1030] shadow-glow">DS</div>
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
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_200px_at_10%_0%,rgba(139,61,255,.30),transparent_70%),radial-gradient(500px_200px_at_95%_10%,rgba(255,179,107,.18),transparent_70%)]" />
              <div className="relative mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pt-3 md:px-8">
                {([["course", "Course", Icon.course], ["challenges", "Challenges", Icon.challenge], ["practice", "Practice a deal", Icon.practice]] as const).map(([k, label, ic]) => (
                  <button key={k} onClick={() => setLearnTab(k)} className={`group flex items-center gap-2 whitespace-nowrap rounded-t-xl px-4 py-2.5 text-sm font-semibold transition ${learnTab === k ? "bg-[#f3f5fb] text-brand-900" : "text-white/65 hover:bg-white/5 hover:text-white"}`}>
                    <span className={learnTab === k ? "text-brand-600" : "text-white/45 group-hover:text-gold-300"}>{ic("h-4 w-4")}</span>{label}</button>))}
              </div>
            </div>
            {learnTab === "course" ? <Course session={session} onPractice={() => setLearnTab("practice")} /> : learnTab === "challenges" ? <Challenges session={session} /> : <LearnerApp session={session} toast={setToast} onOpenInPro={openInPro} />}
          </>)
        : <ProWorkspace key={proKey} session={session} toast={setToast} />}

      <footer className="mx-auto max-w-7xl px-4 pb-8 pt-4 text-xs text-slate-400 md:px-8">Screening and learning tool, not investment advice. Verify rent roll, T12, taxes after sale and insurance quotes.</footer>
      {toast && <div className="fixed bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/10 bg-night px-5 py-2.5 text-sm text-white shadow-lift">{toast}</div>}
    </div>
  )
}
