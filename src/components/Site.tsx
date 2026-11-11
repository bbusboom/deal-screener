// Shared pieces that make the Learn side read like a website: the full width page band and real photos.
import { useEffect, useState, type ReactNode } from "react"
import { load as loadPhotos } from "../learn/Photo"

/** Full width navy band at the top of a page: serif title, short intro, optional content on the right. */
export function PageHero({ title, intro, crumbs, aside, children, wide = false }: { title: ReactNode; intro?: ReactNode; crumbs?: ReactNode; aside?: ReactNode; children?: ReactNode; wide?: boolean }) {
  return (
    <section className="bg-night text-white">
      <div className={`mx-auto grid ${wide ? "max-w-7xl" : "max-w-6xl"} gap-10 px-4 pb-12 pt-10 md:px-8 md:pb-14 ${aside ? "md:grid-cols-[1.1fr_1fr] md:items-center" : ""}`}>
        <div>
          {crumbs && <div className="mb-6">{crumbs}</div>}
          <h1 className="font-serif text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">{title}</h1>
          {intro && <p className="mt-4 max-w-xl text-lg text-white/65">{intro}</p>}
          {children}
        </div>
        {aside && <div className="min-w-0">{aside}</div>}
      </div>
    </section>)
}

/** A real, freely licensed photo from Wikimedia Commons, with credit. Renders nothing if it can't load. */
export function SitePhoto({ titles = [], query, className = "aspect-[4/3]", dark = false }: { titles?: string[]; query: string; className?: string; dark?: boolean }) {
  const [img, setImg] = useState<Awaited<ReturnType<typeof loadPhotos>>[number] | null | undefined>(undefined)
  const key = titles.join("|") + query
  useEffect(() => { let on = true; setImg(undefined); loadPhotos(titles, query).then(r => on && setImg(r[0] || null)).catch(() => on && setImg(null)); return () => { on = false } }, [key])
  if (img === null) return null
  return (
    <figure>
      <div className={`overflow-hidden rounded-lg ${dark ? "bg-white/5" : "bg-slate-100"} ${className}`}>{img && <img src={img.url} alt="" className="h-full w-full object-cover" loading="lazy" />}</div>
      {img && <figcaption className={`mt-2 text-xs ${dark ? "text-white/40" : "text-slate-400"}`}>Photo: <a className="hover:underline" href={img.page} target="_blank" rel="noreferrer">{img.author}</a>, {img.license}</figcaption>}
    </figure>)
}

/** Underlined section heading used across the Learn pages. */
export function SectionHead({ title, intro, children }: { title: ReactNode; intro?: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
      <div><h2 className="font-serif text-3xl font-semibold tracking-tight">{title}</h2>{intro && <p className="mt-2 max-w-2xl text-lg leading-relaxed text-slate-600">{intro}</p>}</div>
      {children}
    </div>)
}
