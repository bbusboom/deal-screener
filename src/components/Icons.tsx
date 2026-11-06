// Small line icons (24px grid, stroke based) used in navigation.
const S = ({ d, className = "h-4 w-4" }: { d: string; className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden><path d={d} /></svg>
)
export const Icon = {
  overview: (c?: string) => <S className={c} d="M3 13h8V3H3v10zm10 8h8V11h-8v10zM3 21h8v-6H3v6zm10-18v6h8V3h-8z" />,
  property: (c?: string) => <S className={c} d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5M9 9h.01M15 9h.01M9 13h.01M15 13h.01" />,
  market: (c?: string) => <S className={c} d="M12 21s-7-6.2-7-11.5a7 7 0 0114 0C19 14.8 12 21 12 21zm0-9a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />,
  financials: (c?: string) => <S className={c} d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  capital: (c?: string) => <S className={c} d="M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18" />,
  advisor: (c?: string) => <S className={c} d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12zM8.5 12h.01M12 12h.01M15.5 12h.01" />,
  pipeline: (c?: string) => <S className={c} d="M4 5h16M4 5v14h4V5M10 5v10h4V5M16 5v6h4V5" />,
  course: (c?: string) => <S className={c} d="M2 8l10-5 10 5-10 5L2 8zm4 2.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-5.5" />,
  challenge: (c?: string) => <S className={c} d="M12 2l2.6 6.6L21 9.2l-5 4.5 1.5 6.8L12 17l-5.5 3.5L8 13.7 3 9.2l6.4-.6L12 2z" />,
  practice: (c?: string) => <S className={c} d="M9 11l3 3 8-8M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h9" />,
  check: (c?: string) => <S className={c} d="M5 12l5 5L20 7" />,
  clock: (c?: string) => <S className={c} d="M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  x: (c?: string) => <S className={c} d="M6 6l12 12M18 6L6 18" />,
}
