import { Icon } from "./components/Icons"
import { Skeleton, LogoMark } from "./components/Site"
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
import InstallPrompt from "./components/InstallPrompt"
import ProWorkspace from "./ProWorkspace"
import LearnerApp from "./LearnerApp"
import Course from "./learn/Course"
import Challenges from "./learn/Challenges"
import { StateSelect } from "./components/MarketPane"
import { useHomeState, setHomeState, syncHomeState } from "./lib/market"

const HAS_ACCOUNT = "dealScreener.hasAccount"
const LEARN_TABS = [["course", "Course", Icon.course], ["challenges", "Challenges", Icon.challenge], ["check", "Deal Check", Icon.clock], ["practice", "Practice a deal", Icon.practice]] as const

/** learnOnly: the Underwriting Desk phone app at /learn. Same accounts and progress, Learn only, no underwriting. */
export default function App({ learnOnly = false }: { learnOnly?: boolean }) {
  const [ready, setReady] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [choosing, setChoosing] = useState(false)
  const [recovery, setRecovery] = useState(false)
  const [toast, setToast] = useState("")
  const [proKey, setProKey] = useState(0)
  const homeState = useHomeState()
  // Anyone who has had an account on this browser skips the public home page and goes straight to sign in.
  const [authMode, setAuthMode] = useState<null | "signin" | "signup">(() => { try { return localStorage.getItem(HAS_ACCOUNT) ? "signin" : learnOnly ? "signup" : null } catch { return learnOnly ? "signup" : null } })
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
    // The app has no underwriting: hand the deal to the full website.
    if (learnOnly) { void setPath(session, "pro").finally(() => location.assign("/#summary")); return }
    setProKey(k => k + 1); pick("pro"); setToast("Opened in the Pro workspace")
  }

  if (!ready) return (
    <div className="min-h-screen" aria-busy="true" aria-label="Loading">
      <div className="h-16 bg-night" />
      <div className="h-56 bg-night/95" />
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-10 md:px-8">
        <Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-full max-w-2xl" /><Skeleton className="h-4 w-full max-w-xl" />
        <div className="grid gap-4 pt-6 md:grid-cols-3"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div>
      </div>
    </div>)
  if (recovery) return <Auth initial="newpass" onDone={() => setRecovery(false)} />
  if (accountsEnabled && !session) {
    if (learnOnly) return <Auth app key={authMode || "signup"} initial={authMode || "signup"} onSignedUp={() => { try { localStorage.setItem(HAS_ACCOUNT, "1") } catch {} }} />
    if (!authMode) return <Landing go={m => { setAuthMode(m); scrollTo({ top: 0 }) }} />
    return <Auth key={authMode} initial={authMode} onBack={() => setAuthMode(null)} onSignedUp={() => { try { localStorage.setItem(HAS_ACCOUNT, "1") } catch {} }} />
  }

  const path: Path | null | undefined = learnOnly ? "learner" : profile?.path
  const name = profile?.username || session?.user.email || null

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-night/95 pt-[env(safe-area-inset-top)] text-white backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 md:px-8">
          <button className="flex shrink-0 items-center gap-2.5" onClick={() => { if (path === "learner") setLearnTab("course"); scrollTo({ top: 0 }) }}>
            <LogoMark className="h-7 w-[26px]" />
            <span className="font-serif text-[19px] font-semibold tracking-tight">Underwriting Desk</span>
          </button>
          {path === "learner" && !choosing && (
            <nav className="hidden h-16 items-stretch gap-6 text-sm md:flex" aria-label="Learn">
              {LEARN_TABS.map(([k, label]) => (
                <button key={k} onClick={() => { setLearnTab(k); scrollTo({ top: 0 }) }} aria-current={learnTab === k ? "page" : undefined}
                  className={`border-b-2 pt-0.5 transition ${learnTab === k ? "border-[#f4b24c] font-semibold text-white" : "border-transparent text-white/60 hover:text-white"}`}>{label}</button>))}
            </nav>)}
          <div className="ml-auto flex items-center gap-4 text-sm">
            {path === "learner" && !choosing && (
              <button className="hidden items-center gap-2 rounded-md border border-white/15 px-2.5 py-1.5 text-white/60 hover:border-white/30 hover:text-white lg:flex" aria-label="Search the course"
                onClick={() => { setLearnTab("course"); setTimeout(() => dispatchEvent(new Event("ud:search")), 0) }}>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" strokeLinecap="round" /></svg>
                Search <kbd className="rounded bg-white/10 px-1.5 text-[11px]">⌘K</kbd></button>)}
            {path && !choosing && !learnOnly && (
              <button className="hidden font-medium text-[#f4b24c] hover:text-white sm:inline" onClick={() => pick(path === "learner" ? "pro" : "learner")}>
                {path === "learner" ? "Underwrite a deal →" : "← Back to Learn"}</button>)}
            <label className="hidden items-center gap-1.5 text-xs text-white/50 xl:flex" title="Your home state sets the default for taxes, rent rules and policy">
              Home state <StateSelect className="select-dark !py-1 !text-xs" value={homeState} onChange={v => setHomeState(session, v)} />
            </label>
            {name && <span className="hidden text-white/50 lg:inline">{name}</span>}
            {accountsEnabled ? <button className="text-white/70 hover:text-white" onClick={() => signOut()}>Sign out</button> : <span className="hidden text-xs text-white/40 md:inline">Accounts not set up</span>}
          </div>
        </div>
        {path === "learner" && !choosing && (
          <nav className={`flex gap-5 overflow-x-auto border-t border-white/10 px-4 text-sm md:hidden ${learnOnly ? "hidden" : ""}`} aria-label="Learn">
            {LEARN_TABS.map(([k, label]) => (
              <button key={k} onClick={() => { setLearnTab(k); scrollTo({ top: 0 }) }} className={`shrink-0 border-b-2 py-2.5 ${learnTab === k ? "border-[#f4b24c] font-semibold text-white" : "border-transparent text-white/60"}`}>{label}</button>))}
            <button className="ml-auto shrink-0 py-2.5 font-medium text-[#f4b24c]" onClick={() => pick("pro")}>Underwrite →</button>
          </nav>)}
      </header>

      {!path || choosing ? <PathPicker username={profile?.username} current={path} onPick={pick} />
        : path === "learner" ? (
          <>
            <InstallPrompt learnOnly={learnOnly} />
            {learnTab === "course" ? <Course session={session} onPractice={() => setLearnTab("practice")} onCheck={() => { setLearnTab("check"); scrollTo({ top: 0 }) }} /> : learnTab === "challenges" ? <Challenges session={session} /> : learnTab === "check" ? <DealCheck session={session} onOpenInPro={learnOnly ? undefined : openInPro} /> : <LearnerApp session={session} toast={setToast} onOpenInPro={openInPro} />}
            {learnOnly && (
              <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#e4e4de] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden">
                <div className="grid grid-cols-4">
                  {LEARN_TABS.map(([k, label, ic]) => (
                    <button key={k} onClick={() => { setLearnTab(k); scrollTo({ top: 0 }) }} className={`flex flex-col items-center gap-1 py-2 text-[11px] font-medium ${learnTab === k ? "text-brand-900" : "text-slate-400"}`}>
                      {ic("h-5 w-5")}{label === "Practice a deal" ? "Practice" : label}</button>))}
                </div>
              </nav>)}
          </>)
        : <ProWorkspace key={proKey} session={session} toast={setToast} />}

      <footer className={`border-t border-slate-200 bg-white ${learnOnly ? "pb-24 sm:pb-0" : ""}`}>
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
          <div>
            <div className="flex items-center gap-2.5"><LogoMark className="h-6 w-[22px]" /><span className="font-serif text-lg font-semibold">Underwriting Desk</span></div>
            <p className="mt-3 max-w-sm text-slate-500">Real estate underwriting, taught on real deals. Built in Fayetteville, Arkansas by Blake Busboom.</p>
          </div>
          <div>
            <div className="font-semibold text-ink">Learn</div>
            <ul className="mt-3 space-y-2 text-slate-500">
              {LEARN_TABS.map(([k, label]) => <li key={k}><button className="hover:text-ink" onClick={() => { if (path !== "learner") pick("learner"); setLearnTab(k); scrollTo({ top: 0 }) }}>{label}</button></li>)}
            </ul>
          </div>
          <div>
            <div className="font-semibold text-ink">Work</div>
            <ul className="mt-3 space-y-2 text-slate-500">
              {!learnOnly && <li><button className="hover:text-ink" onClick={() => { pick("pro"); scrollTo({ top: 0 }) }}>Underwrite a deal</button></li>}
              <li><a className="hover:text-ink" href={learnOnly ? "/" : "/learn"}>{learnOnly ? "Full website" : "Phone app"}</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-100">
          <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 px-4 py-4 text-xs text-slate-400 md:px-8">
            <span>© {new Date().getFullYear()} Underwriting Desk</span>
            <span>A learning and screening tool, not investment advice. Verify rent rolls, T12s, taxes after sale and insurance quotes.</span>
          </div>
        </div>
      </footer>
      {path && !choosing && <Feedback session={session} lift={learnOnly} page={(learnOnly ? "App › " : path === "learner" ? "Learn › " : "Underwrite") + (path === "learner" ? learnTab : "")} />}
      {toast && <div className="fixed bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-md bg-ink px-4 py-2 text-sm text-white">{toast}</div>}
    </div>
  )
}
