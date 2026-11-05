// Accounts and saved deals. Uses Supabase when it's configured, otherwise this browser only.
import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js"
import { type Deal, norm } from "./model"

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const supabase: SupabaseClient | null = URL && KEY ? createClient(URL, KEY) : null
export const accountsEnabled = !!supabase

export type Path = "learner" | "pro"
export interface Profile { id: string; username: string | null; path: Path | null }
export interface SavedDeal { id: string; name: string; path: Path; data: Deal; updated_at: string }

/* ---------- auth ---------- */
export async function getSession() { return supabase ? (await supabase.auth.getSession()).data.session : null }
export function onAuth(cb: (s: Session | null) => void) {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange((_e, s) => cb(s))
  return () => data.subscription.unsubscribe()
}
export async function signUp(email: string, password: string, username: string) {
  if (!supabase) throw new Error("Accounts aren't set up yet.")
  const u = username.trim()
  if (!/^[A-Za-z0-9_.]{3,24}$/.test(u)) throw new Error("Usernames are 3 to 24 letters, numbers, dots or underscores.")
  const { data: free, error: e1 } = await supabase.rpc("username_available", { u })
  if (e1) throw new Error("Couldn't check that username. Try again.")
  if (!free) throw new Error("That username is taken.")
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username: u }, emailRedirectTo: location.origin } })
  if (error) throw error
  return { needsConfirm: !data.session }
}
export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error("Accounts aren't set up yet.")
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message === "Invalid login credentials" ? "Wrong email or password." : error.message)
}
export async function resetPassword(email: string) {
  if (!supabase) throw new Error("Accounts aren't set up yet.")
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: location.origin + "/#reset" })
  if (error) throw error
}
export async function updatePassword(password: string) {
  if (!supabase) throw new Error("Accounts aren't set up yet.")
  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw error
}
export async function signOut() { if (supabase) await supabase.auth.signOut() }
export async function accessToken() { return (await getSession())?.access_token || "" }

/* ---------- profile ---------- */
const LOCAL_PATH = "dealScreener.path"
export async function getProfile(session: Session | null): Promise<Profile> {
  if (!supabase || !session) {
    let path: Path | null = null; try { path = localStorage.getItem(LOCAL_PATH) as Path | null } catch {}
    return { id: "local", username: null, path }
  }
  const { data } = await supabase.from("profiles").select("id, username, path").eq("id", session.user.id).maybeSingle()
  return data ? (data as Profile) : { id: session.user.id, username: session.user.user_metadata?.username ?? null, path: null }
}
export async function setPath(session: Session | null, path: Path) {
  if (!supabase || !session) { try { localStorage.setItem(LOCAL_PATH, path) } catch {} return }
  await supabase.from("profiles").upsert({ id: session.user.id, path })
}

/* ---------- deals ---------- */
const LOCAL_DEALS = "dealScreener.deals.v2", OLD_DEALS = "dealScreener.deals.v1"
function localList(): SavedDeal[] {
  try {
    const v2 = localStorage.getItem(LOCAL_DEALS)
    if (v2) return JSON.parse(v2)
    const old = JSON.parse(localStorage.getItem(OLD_DEALS) || "[]") as Deal[]
    return old.map((d, i) => ({ id: "local-" + i + "-" + Date.now(), name: d.name || "Untitled", path: "pro", data: norm(d), updated_at: new Date().toISOString() }))
  } catch { return [] }
}
function localSave(list: SavedDeal[]) { try { localStorage.setItem(LOCAL_DEALS, JSON.stringify(list)); return true } catch { return false } }

export async function listDeals(session: Session | null, path?: Path): Promise<SavedDeal[]> {
  let rows: SavedDeal[]
  if (!supabase || !session) rows = localList()
  else {
    const { data, error } = await supabase.from("deals").select("id, name, path, data, updated_at").order("updated_at", { ascending: false })
    if (error) throw error
    rows = (data || []) as SavedDeal[]
  }
  return rows.filter(r => !path || r.path === path).map(r => ({ ...r, data: norm(r.data) }))
}
/** Insert or update. Pass id to update an existing deal. Returns the saved row id. */
export async function saveDeal(session: Session | null, deal: Deal, path: Path, id?: string): Promise<string> {
  const name = deal.name || "Untitled deal", now = new Date().toISOString()
  if (!supabase || !session) {
    const list = localList(), i = id ? list.findIndex(r => r.id === id) : -1
    const row: SavedDeal = { id: id || "local-" + Date.now(), name, path, data: deal, updated_at: now }
    if (i >= 0) list[i] = row; else list.unshift(row)
    if (!localSave(list)) throw new Error("Couldn't save in this browser.")
    return row.id
  }
  if (id && !id.startsWith("local-")) {
    const { error } = await supabase.from("deals").update({ name, path, data: deal, updated_at: now }).eq("id", id)
    if (error) throw error
    return id
  }
  const { data, error } = await supabase.from("deals").insert({ name, path, data: deal }).select("id").single()
  if (error) throw error
  return data.id
}
export async function deleteDeal(session: Session | null, id: string) {
  if (!supabase || !session || id.startsWith("local-")) { localSave(localList().filter(r => r.id !== id)); return }
  const { error } = await supabase.from("deals").delete().eq("id", id)
  if (error) throw error
}

/* ---------- API calls ---------- */
export const CODE_KEY = "dealSchool.accessCode"
export const getCode = () => { try { return localStorage.getItem(CODE_KEY) || "" } catch { return "" } }
export async function apiHeaders(): Promise<Record<string, string>> {
  const h: Record<string, string> = { "content-type": "application/json", "x-access-code": getCode() }
  const t = await accessToken(); if (t) h.authorization = "Bearer " + t
  return h
}
