import { DEFAULTS, norm, project, type Deal } from "../lib/model"
import type { CheckAnswers } from "../lib/store"

/** Deal Check: a broker package to underwrite against the clock. Year one only, so the key is unambiguous. */
export interface Check { id: string; title: string; level: 1 | 2 | 3; where: string; pitch: string; deal: Deal; notes: string[] }

const D = (o: Partial<Deal>): Deal => norm({ ...DEFAULTS, cc: 2, loanFee: 0, hold: 5, minCap: 6, minDscr: 1.25, ...o })

export const CHECKS: Check[] = [
  {
    id: "c1", title: "Oak Hollow", level: 1, where: "Springdale, AR",
    pitch: "16 units, two floor plans, fully stabilized. Seller is a local owner who has self managed. Asking $1,400,000.",
    deal: D({ name: "Oak Hollow", state: "AR", price: 1400000, other: 35, vac: 6, tax: 21000, ins: 14400, util: 18000, rm: 16000, adm: 6000, contract: 4800, mgmt: 6, res: 250,
      ltv: 70, rate: 6.25, amort: 30, ioYrs: 0, units: [{ type: "1 bed / 1 bath", count: 8, rent: 925 }, { type: "2 bed / 1 bath", count: 8, rent: 1125 }] }),
    notes: ["Rents shown are in place and at market."],
  },
  {
    id: "c2", title: "Riverside Commons", level: 2, where: "Tulsa, OK",
    pitch: "40 units with in place rents a little under market. The rent roll shows some concessions and bad debt. Asking $2,700,000.",
    deal: D({ name: "Riverside Commons", state: "OK", price: 2700000, other: 40, vac: 7, conc: 1, bad: 1, tax: 48000, ins: 36000, util: 44000, rm: 30000, pay: 52000, adm: 14000, turn: 12000, mgmt: 4.5, res: 300,
      ltv: 70, rate: 6.5, amort: 30, ioYrs: 0,
      units: [{ type: "1 bed / 1 bath", count: 20, rent: 875, market: 925 }, { type: "2 bed / 2 bath", count: 20, rent: 1050, market: 1100 }] }),
    notes: ["Gross potential rent is at market. The gap to in place rent is loss to lease.", "Vacancy, concessions and bad debt are a percent of gross potential rent."],
  },
  {
    id: "c3", title: "Pine Street Townhomes", level: 3, where: "Rogers, AR",
    pitch: "12 two bed townhomes, tenants pay most utilities. The lender is offering two years of interest only. Asking $2,280,000.",
    deal: D({ name: "Pine Street Townhomes", state: "AR", price: 2280000, other: 60, vac: 5, tax: 26500, ins: 13200, util: 6000, rm: 12000, adm: 4000, contract: 3600, mgmt: 7, res: 350,
      ltv: 65, rate: 6.25, amort: 30, ioYrs: 2, units: [{ type: "2 bed / 2.5 bath", count: 12, rent: 1450 }] }),
    notes: ["Debt service in year one is interest only."],
  },
]

export function answerKey(c: Check): CheckAnswers {
  const p = project(c.deal)
  const cap = p.y1.cap * 100, dscr = p.y1.dscr
  return { noi: Math.round(p.y1.noi), cap: Math.round(cap * 100) / 100, dscr: Math.round(dscr * 100) / 100, verdict: cap >= c.deal.minCap && dscr >= c.deal.minDscr ? "clears" : "misses" }
}

/** 40 points for NOI within 2%, 20 for cap rate within 0.10 points, 20 for DSCR within 0.03, 20 for the right call. */
export function scoreCheck(a: CheckAnswers, k: CheckAnswers) {
  const noiOff = k.noi ? (a.noi - k.noi) / k.noi : 1
  const parts = {
    noi: Math.abs(noiOff) <= 0.02, cap: Math.abs(a.cap - k.cap) <= 0.1, dscr: Math.abs(a.dscr - k.dscr) <= 0.03, verdict: a.verdict === k.verdict,
  }
  return { parts, noiOff, score: (parts.noi ? 40 : 0) + (parts.cap ? 20 : 0) + (parts.dscr ? 20 : 0) + (parts.verdict ? 20 : 0) }
}
