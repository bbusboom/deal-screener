import { useState } from "react"
import { LogoMark } from "./Site"
import { signIn, signUp, resetPassword, updatePassword } from "../lib/store"

type Mode = "signin" | "signup" | "forgot" | "newpass"

export default function Auth({ initial = "signin", onDone, onBack, onSignedUp, app = false }: { initial?: Mode; onDone?: () => void; onBack?: () => void; onSignedUp?: () => void; app?: boolean }) {
  const [mode, setMode] = useState<Mode>(initial)
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(""); setInfo("")
    try {
      if (mode === "signin") await signIn(email.trim(), password)
      if (mode === "signup") {
        if (password.length < 8) throw new Error("Use a password with at least 8 characters.")
        const { needsConfirm } = await signUp(email.trim(), password, username)
        onSignedUp?.()
        if (needsConfirm) { setInfo("Check your email and click the link to confirm your account, then sign in."); setMode("signin") }
      }
      if (mode === "forgot") { await resetPassword(email.trim()); setInfo("If that email has an account, a reset link is on its way.") }
      if (mode === "newpass") {
        if (password.length < 8) throw new Error("Use a password with at least 8 characters.")
        await updatePassword(password); setInfo("Password updated."); onDone?.()
      }
    } catch (err: any) { setError(err?.message || String(err)) }
    finally { setBusy(false) }
  }

  const title = { signin: "Sign in", signup: "Create your account", forgot: "Reset your password", newpass: "Choose a new password" }[mode]
  return (
    <div className="grid min-h-screen place-items-center bg-night px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2 text-white">
          <LogoMark className="h-9 w-[33px]" />
          <div><div className="text-xl font-bold leading-tight">Underwriting Desk</div><div className="text-xs text-white/70">{app ? "Same account as underwritingdeskhq.com" : "Real estate underwriting"}</div></div>
        </div>
        <form onSubmit={submit} className="rounded-lg bg-white p-6 shadow-xl">
          <h1 className="mb-4 text-lg font-bold">{title}</h1>
          <div className="space-y-3">
            {mode !== "newpass" && <label className="block text-xs font-medium text-slate-500">Email<input className="mt-1 w-full" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>}
            {mode === "signup" && <label className="block text-xs font-medium text-slate-500">Username<input className="mt-1 w-full" autoComplete="username" required value={username} onChange={e => setUsername(e.target.value)} placeholder="3 to 24 letters or numbers" /></label>}
            {mode !== "forgot" && <label className="block text-xs font-medium text-slate-500">{mode === "newpass" ? "New password" : "Password"}<input className="mt-1 w-full" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} required value={password} onChange={e => setPassword(e.target.value)} /></label>}
          </div>
          {error && <p className="mt-3 rounded-md bg-fail-50 px-3 py-2 text-sm text-fail-600">{error}</p>}
          {info && <p className="mt-3 rounded-md bg-pass-50 px-3 py-2 text-sm text-pass-600">{info}</p>}
          <button className="btn btn-primary mt-4 w-full justify-center py-2" disabled={busy}>{busy ? "One moment…" : title}</button>
          <div className="mt-4 flex justify-between text-sm">
            {mode === "signin" && <><button type="button" className="text-brand-600 hover:underline" onClick={() => setMode("signup")}>Create an account</button>
              <button type="button" className="text-slate-500 hover:underline" onClick={() => setMode("forgot")}>Forgot password?</button></>}
            {(mode === "signup" || mode === "forgot") && <button type="button" className="text-brand-600 hover:underline" onClick={() => setMode("signin")}>Back to sign in</button>}
          </div>
        </form>
        {onBack && <p className="mt-4 text-center text-sm"><button type="button" className="text-white/80 underline hover:text-white" onClick={onBack}>← See what Underwriting Desk can do</button></p>}
        <p className="mt-3 text-center text-xs text-white/60">Underwriting tool for learning and screening deals. Not investment advice.</p>
      </div>
    </div>
  )
}
