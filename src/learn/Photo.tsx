// Real photos from Wikimedia Commons, loaded live with their author and license.
// Only freely licensed images are shown (public domain, CC0, CC BY, CC BY-SA), with credit under each.
import { useEffect, useState } from "react"

interface Img { url: string; page: string; author: string; license: string; licenseUrl?: string; title: string }
const API = "https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1000"
const strip = (h = "") => h.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
const FREE = /(cc0|public domain|^pd|cc[ -]by(?![^ ]*-n[cd])|cc[ -]by-sa)/i
const NOT_FREE = /(-nc|-nd|\bnc\b|\bnd\b|fair use|non-free)/i

function parse(data: any): Img[] {
  const pages = Object.values(data?.query?.pages || {}) as any[]
  return pages
    .filter(p => p.imageinfo?.[0])
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .map(p => {
      const ii = p.imageinfo[0], md = ii.extmetadata || {}
      return {
        url: ii.thumburl || ii.url, page: ii.descriptionurl, title: String(p.title || "").replace(/^File:/, "").replace(/\.[a-z]+$/i, ""),
        author: strip(md.Artist?.value) || "Unknown author", license: strip(md.LicenseShortName?.value) || "", licenseUrl: md.LicenseUrl?.value,
      }
    })
    .filter(i => FREE.test(i.license) && !NOT_FREE.test(i.license) && /\.(jpe?g|png|webp)/i.test(i.url))
}

const cache = new Map<string, Promise<Img[]>>()
function load(titles: string[], query: string): Promise<Img[]> {
  const key = titles.join("|") + "#" + query
  if (!cache.has(key)) cache.set(key, (async () => {
    const out: Img[] = []
    try {
      if (titles.length) {
        const r = await fetch(`${API}&titles=${encodeURIComponent(titles.join("|"))}`)
        out.push(...parse(await r.json()))
      }
      if (out.length < 3) {
        const r = await fetch(`${API}&generator=search&gsrnamespace=6&gsrlimit=8&gsrsearch=${encodeURIComponent("filetype:bitmap " + query)}`)
        for (const i of parse(await r.json())) if (!out.some(o => o.page === i.page)) out.push(i)
      }
    } catch { /* offline or blocked: fall through to the Google link */ }
    return out
  })())
  return cache.get(key)!
}

export default function Photo({ titles, query, caption, google }: { titles: string[]; query: string; caption: string; google: string }) {
  const [imgs, setImgs] = useState<Img[] | null>(null)
  const [i, setI] = useState(0)
  const [broken, setBroken] = useState<Set<number>>(new Set())
  useEffect(() => { let on = true; load(titles, query).then(r => on && setImgs(r)); return () => { on = false } }, [titles.join("|"), query])

  const list = (imgs || []).filter((_, k) => !broken.has(k))
  const cur = imgs && imgs[i] && !broken.has(i) ? imgs[i] : list[0]
  const gUrl = "https://www.google.com/search?tbm=isch&q=" + encodeURIComponent(google)

  return (
    <figure className="my-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
      {imgs === null ? <div className="grid h-64 place-items-center bg-slate-100 text-sm text-slate-400">Loading photo…</div>
        : cur ? (
          <div className="relative bg-slate-900">
            <img src={cur.url} alt={caption} loading="lazy" className="mx-auto max-h-[420px] w-full object-contain"
              onError={() => setBroken(b => new Set(b).add(imgs.indexOf(cur)))} />
            {imgs.length > 1 && (
              <button className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2.5 py-1 text-xs font-medium text-white hover:bg-black/75"
                onClick={() => setI(k => { let n = k; for (let s = 0; s < imgs.length; s++) { n = (n + 1) % imgs.length; if (!broken.has(n)) break } return n })}>
                Another photo ({(imgs.indexOf(cur) + 1)}/{imgs.length})
              </button>)}
          </div>)
        : <div className="grid h-40 place-items-center bg-slate-50 px-6 text-center text-sm text-slate-500">Photo couldn't load here. Use the Google Images link below to see examples.</div>}
      <figcaption className="space-y-1 px-4 py-3">
        <div className="text-sm text-ink/85">{caption}</div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>{cur ? <>Photo: <a className="underline hover:text-slate-600" href={cur.page} target="_blank" rel="noreferrer">{cur.author}</a>, {cur.licenseUrl ? <a className="underline hover:text-slate-600" href={cur.licenseUrl} target="_blank" rel="noreferrer">{cur.license}</a> : cur.license}, via Wikimedia Commons</> : null}</span>
          <a className="font-medium text-brand-600 hover:underline" href={gUrl} target="_blank" rel="noreferrer">See more on Google Images ↗</a>
        </div>
      </figcaption>
    </figure>
  )
}
