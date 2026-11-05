// Shared check for the API functions. Files starting with _ are not routes on Vercel.
// When Supabase is configured, only signed in users can call the AI. The optional access code still applies.
export async function authorize(req: any): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const code = process.env.DEAL_SCHOOL_ACCESS_CODE
  if (code && req.headers["x-access-code"] !== code) return { ok: false, status: 401, error: "access_code" }
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  if (!url || !key) return { ok: true }
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "")
  if (!token) return { ok: false, status: 401, error: "signin" }
  try {
    const r = await fetch(`${url}/auth/v1/user`, { headers: { apikey: key, authorization: `Bearer ${token}` } })
    return r.ok ? { ok: true } : { ok: false, status: 401, error: "signin" }
  } catch {
    return { ok: false, status: 503, error: "Couldn't verify your sign in. Try again." }
  }
}
