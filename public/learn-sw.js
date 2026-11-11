// Underwriting Desk app service worker (scope /learn). Pages: network first, cached copy when offline.
// Built assets (hashed file names) and fonts: cache first. API calls and Supabase are never cached.
const CACHE = "uw-desk-v3"
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(["/learn"]))); self.skipWaiting() })
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()))
})
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url)
  if (req.method !== "GET" || url.pathname.startsWith("/api/") || url.hostname.endsWith("supabase.co")) return
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put("/learn", copy)); return r }).catch(() => caches.match("/learn")))
    return
  }
  const cacheable = url.pathname.startsWith("/assets/") || url.pathname.startsWith("/app/") || url.hostname.includes("fonts.g")
  if (cacheable) e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === "opaque") { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)) } return r })))
})
