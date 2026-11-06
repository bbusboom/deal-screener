import { useEffect, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import { supabase, accountsEnabled, getSession, getProfile, setPath, signOut, type Path, type Profile } from "./lib/store"
import type { Deal } from "./lib/model"
import Auth from "./components/Auth"
import PathPicker from "./components/PathPicker"
import ProWorkspace from "./ProWorkspace"
import LearnerApp from "./LearnerApp"
import Course from "./learn/Course"
import { StateSelect } from "./components/MarketPane"
import { useHomeState, setHomeState, syncHomeState } from "./lib/market"

export default function App() {
  const [ready, setReady] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [choosing, setChoosing] = useState(false)
  const [recovery, setRecovery] = useState(false)
  const [toast, setToast] = useState("")
  const [proKey, setProKey] = useState(0)
  const homeState = useHomeState()
  const [learnTab, setLearnTab] = useState<"course" | "practice">(() => { try { return (localStorage.getItem("dealScreener.learnTab") as any) || "course" } catch { return "course" } })
  useEffect(() => { try { localStorage.setItem("dealScreener.learnTab", learnTab) } catch {} }, [learnTab])

  useEffect(() => {
    let alive = true
    getSession().then(async s => { if (!alive) return; setSession(s); syncHomeState(s); setProfile(await getProfile(s)); setReady(true) })
    if (!supabase) return () => { alive = false }
    const { data } = supabase.auth.onAuthStateChange(async (event, s) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true)
      setSession(s); syncHomeState(s); setProfile(await getProfile(s))
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
  if (accountsEnabled && !session) return <Auth />

  const path = profile?.path
  const name = profile?.username || session?.user.email || null

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:px-8">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">DS</div>
            <div className="leading-tight"><div className="font-bold">Deal Screener</div><div className="hidden text-[11px] text-slate-400 sm:block">v0.8 · Market check</div></div>
          </div>
          {path && !choosing && (
            <div className="flex rounded-lg bg-slate-100 p-1 text-sm font-semibold">
              {(["learner", "pro"] as Path[]).map(p => (
                <button key={p} onClick={() => pick(p)} className={`rounded-md px-3 py-1.5 transition ${path === p ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-ink"}`}>
                  {p === "learner" ? "Learn" : "Underwrite"}
                </button>))}
            </div>)}
          <div className="flex items-center gap-3 text-sm">
            <label className="hidden items-center gap-1.5 text-xs text-slate-500 lg:flex" title="Your home state sets the default for taxes, rent rules and policy">
              Home state <StateSelect className="!py-1 !text-xs" value={homeState} onChange={v => setHomeState(session, v)} />
            </label>
            {name && <span className="hidden text-slate-500 md:inline">{name}</span>}
            {accountsEnabled ? <button className="btn" onClick={() => signOut()}>Sign out</button> : <span className="note hidden md:inline">Accounts not set up</span>}
          </div>
        </div>
      </header>

      {!path || choosing ? <PathPicker username={profile?.username} current={path} onPick={pick} />
        : path === "learner" ? (
          <>
            <div className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl gap-1 px-4 md:px-8">
              {([["course", "Course"], ["practice", "Practice a deal"]] as const).map(([k, label]) => (
                <button key={k} onClick={() => setLearnTab(k)} className={`border-b-2 px-3 py-2.5 text-sm font-semibold ${learnTab === k ? "border-brand-600 text-brand-600" : "border-transparent text-slate-500 hover:text-ink"}`}>{label}</button>))}
            </div></div>
            {learnTab === "course" ? <Course session={session} onPractice={() => setLearnTab("practice")} /> : <LearnerApp session={session} toast={setToast} onOpenInPro={openInPro} />}
          </>)
        : <ProWorkspace key={proKey} session={session} toast={setToast} />}

      <footer className="mx-auto max-w-7xl px-4 pb-8 pt-4 text-xs text-slate-400 md:px-8">Screening and learning tool, not investment advice. Verify rent roll, T12, taxes after sale and insurance quotes.</footer>
      {toast && <div className="fixed bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-lg bg-ink px-4 py-2 text-sm text-white shadow-lg">{toast}</div>}
    </div>
  )
}
