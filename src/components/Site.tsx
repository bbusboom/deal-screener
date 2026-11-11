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

/** Slimmer navy bar for screens where you're working: back link, title, and a slot on the right (like a timer). */
export function WorkBar({ back, onBack, eyebrow, title, right }: { back: string; onBack: () => void; eyebrow?: ReactNode; title: ReactNode; right?: ReactNode }) {
  return (
    <section className="bg-night text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-4 pb-8 pt-6 md:px-8">
        <div className="min-w-0">
          <button className="text-sm text-white/55 hover:text-white" onClick={onBack}>← {back}</button>
          {eyebrow && <div className="mt-5 text-sm text-white/55">{eyebrow}</div>}
          <h1 className={`${eyebrow ? "mt-1" : "mt-5"} font-serif text-3xl font-semibold leading-tight tracking-tight md:text-4xl`}>{title}</h1>
        </div>
        {right}
      </div>
    </section>)
}

/* Small drawn icons, used instead of text symbols like ✓ and ★. */
const svg = (cls: string, d: ReactNode, label?: string) =>
  <svg viewBox="0 0 24 24" className={`inline-block shrink-0 ${cls}`} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>{d}</svg>
export const CheckIcon = ({ className = "h-4 w-4", label }: { className?: string; label?: string }) => svg(className, <path d="M5 12.5l4.5 4.5L19 7.5" />, label)
export const XIcon = ({ className = "h-4 w-4", label }: { className?: string; label?: string }) => svg(className, <path d="M6 6l12 12M18 6L6 18" />, label)
export const QuizIcon = ({ className = "h-4 w-4" }: { className?: string }) => svg(className, <><path d="M9.2 9.3a2.9 2.9 0 015.6.9c0 2-2.8 2.6-2.8 4.3" /><path d="M12 17.6v.1" /></>)
export const FlagIcon = ({ className = "h-4 w-4" }: { className?: string }) => svg(className, <><path d="M5 21V4" /><path d="M5 4h11l-2 4 2 4H5" /></>)
export const StarIcon = ({ className = "h-4 w-4", filled = true }: { className?: string; filled?: boolean }) =>
  <svg viewBox="0 0 24 24" className={`inline-block shrink-0 ${className}`} aria-hidden fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z" /></svg>

/** Gray placeholder blocks shown while something loads. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-200/70 ${className}`} />
}

/** Brand mark: a sheet whose bottom line is gold. Outline uses currentColor. */
export function LogoMark({ className = "h-7 w-[26px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 26" className={className} aria-hidden="true">
      <rect x="1.5" y="1.5" width="21" height="23" rx="3" fill="none" stroke="currentColor" strokeWidth="2" opacity=".9" />
      <path d="M6 8h12M6 12.5h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".55" />
      <path d="M6 18.5h12" stroke="#f4b24c" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  )
}
