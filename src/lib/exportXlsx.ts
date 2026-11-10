// Excel export. Line items are values; totals, NOI, cash flow, DSCR, IRR and multiple are live Excel formulas,
// so the file recalculates if someone edits a line.
import { type Deal, type Projection, waterfall, BASIS_LABEL } from "./model"

type Cell = string | number | { f: string } | null
const col = (i: number) => { let s = ""; i++; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26) } return s }

export async function exportXlsx(d: Deal, p: Projection) {
  const XLSX = await import("xlsx")
  const wb = XLSX.utils.book_new()
  const sheet = (name: string, rows: Cell[][], widths: number[] = []) => {
    const aoa = rows.map(r => r.map(c => (c && typeof c === "object" ? null : c)))
    const ws = XLSX.utils.aoa_to_sheet(aoa)
    rows.forEach((r, ri) => r.forEach((c, ci) => { if (c && typeof c === "object") ws[`${col(ci)}${ri + 1}`] = { t: "n", f: c.f } }))
    ws["!cols"] = widths.map(w => ({ wch: w }))
    XLSX.utils.book_append_sheet(wb, ws, name)
  }
  const r0 = (n: number) => isFinite(n) ? Math.round(n) : null
  const r4 = (n: number) => isFinite(n) ? Math.round(n * 10000) / 10000 : null

  /* Pro forma with formulas */
  const Y = [...p.years, p.exitYear], n = Y.length
  const rows: Cell[][] = [[d.name || "Deal", ...Y.map((y, i) => i === n - 1 ? `Exit yr ${y.t}` : `Year ${y.t}`)]]
  const at: Record<string, number> = {}
  const add = (key: string, label: string, f: (y: typeof Y[number], i: number) => Cell) => { rows.push([label, ...Y.map(f)]); at[key] = rows.length }
  const ref = (key: string, i: number) => `${col(i + 1)}${at[key]}`
  add("gpr", "Gross potential rent", y => r0(y.gpr))
  add("ltl", "Loss to lease", y => r0(-y.ltl))
  add("vac", "Vacancy", y => r0(-y.vacLoss))
  add("conc", "Concessions", y => r0(-y.conc))
  add("bad", "Bad debt", y => r0(-y.bad))
  add("nru", "Non revenue units", y => r0(-y.nru))
  add("oth", "Other income", y => r0(y.oth))
  add("cinc", "Added income", y => r0(y.custInc))
  add("va", "Renovation premium less downtime", y => r0(y.vaPrem - y.vaDown))
  add("egi", "Effective gross income", (_, i) => ({ f: `SUM(${ref("gpr", i)}:${ref("va", i)})` }))
  add("tax", "Real estate taxes", y => r0(-y.tax))
  add("ins", "Insurance", y => r0(-y.ins))
  add("fixed", "Utilities, R&M, payroll, G&A, contract, turnover, marketing", y => r0(-y.fixed))
  add("cexp", "Added expenses", y => r0(-y.custExp))
  add("mgmt", "Management", y => r0(-y.mgmt))
  add("res", "Replacement reserves", y => r0(-y.res))
  add("opex", "Total operating expenses", (_, i) => ({ f: `SUM(${ref("tax", i)}:${ref("res", i)})` }))
  add("noi", "Net operating income (after reserves)", (_, i) => ({ f: `${ref("egi", i)}+${ref("opex", i)}` }))
  add("ds", "Debt service", y => r0(-y.ds))
  add("capex", "Capital expenditures", y => r0(-y.capex))
  add("refi", "Refinance net cash", y => r0(y.refiCash))
  add("cf", "Cash flow to equity", (_, i) => ({ f: `${ref("noi", i)}+${ref("ds", i)}+${ref("capex", i)}+${ref("refi", i)}` }))
  add("dscr", "DSCR", (_, i) => ({ f: `IF(${ref("ds", i)}=0,"",${ref("noi", i)}/-${ref("ds", i)})` }))
  add("bal", "Loan balance, end of year", y => r0(y.endBal))
  rows.push([])
  const N = d.hold, lastCol = col(N)
  rows.push(["Sale", null]); const sRow = rows.length
  rows.push(["Exit cap rate", d.exitCap / 100]); const capRow = rows.length
  rows.push(["Sale price", { f: `${col(n)}${at.noi}/B${capRow}` }]); const spRow = rows.length
  rows.push(["Selling costs", { f: `-B${spRow}*${d.sellCost / 100}` }]); const scRow = rows.length
  rows.push(["Loan payoff incl. prepayment", r0(-p.payoff)]); const poRow = rows.length
  rows.push(["Net sale proceeds", { f: `B${spRow}+B${scRow}+B${poRow}` }]); const npRow = rows.length
  rows.push([])
  rows.push(["Equity cash flows", "Year 0", ...p.years.map(y => `Year ${y.t}`)]); const eqHead = rows.length
  rows.push(["Equity", r0(-p.equity), ...p.years.map((_, i) => ({ f: i === N - 1 ? `${col(i + 1)}${at.cf}+B${npRow}` : `${col(i + 1)}${at.cf}` }))]); const eqRow = rows.length
  rows.push(["Levered IRR", { f: `IRR(B${eqRow}:${col(N + 1)}${eqRow})` }])
  rows.push(["Equity multiple", { f: `SUM(C${eqRow}:${col(N + 1)}${eqRow})/-B${eqRow}` }])
  rows.push(["Model IRR (check)", r4(p.irr)])
  void sRow; void eqHead; void lastCol
  sheet("Pro Forma", rows, [44, ...Y.map(() => 14)])

  /* Summary */
  const y1 = p.y1
  sheet("Summary", [
    ["Deal", d.name || "Untitled"], ["Address", d.address || ""], ["State", d.state || ""], ["Units", p.units],
    ["Purchase price", d.price], ["Price per unit", r0(y1.ppu)], [],
    ["Year 1 NOI (after reserves)", r0(y1.noi)], ["Going in cap rate", r4(y1.cap)], ["Loan", r0(p.loan)], ["Equity", r0(p.equity)],
    ["Year 1 DSCR", r4(y1.dscr)], ["Debt yield", r4(y1.debtYield)], ["Cash on cash, year 1", r4(y1.coc)], [],
    ["Hold (years)", d.hold], ["Levered IRR", r4(p.irr)], ["Unlevered IRR", r4(p.unlevIrr)], ["Equity multiple", r4(p.em)], ["Profit", r0(p.profit)],
    ["Sale price", r0(p.salePrice)], ["Net sale proceeds", r0(p.proceeds)],
    [], ["Prepared with Underwriting Desk (getdealscreener.com). Screening tool, not investment advice."],
  ], [34, 18])

  /* Inputs */
  const inp: Cell[][] = [["Input", "Value"]]
  const skip = new Set(["units", "scen", "rg", "custom", "otherItems", "va", "wf", "debt", "t12", "t3"])
  for (const [k, v] of Object.entries(d)) if (!skip.has(k) && (typeof v === "number" || typeof v === "string")) inp.push([k, v as any])
  inp.push([], ["Rent growth by year (%)", d.rg.join(", ")], [], ["Unit type", "Count", "In place rent", "Market rent", "Avg SF"])
  d.units.forEach(u => inp.push([u.type, u.count, u.rent, u.market || null, u.sf || null]))
  if (d.custom.length) { inp.push([], ["Added line", "Type", "Basis", "Amount", "Growth %", "Start yr", "End yr"]); d.custom.forEach(c => inp.push([c.label, c.kind, BASIS_LABEL[c.basis], c.amt, c.growth, c.start, c.end || null])) }
  for (const [name, obj] of [["Value add", d.va], ["Loan options", d.debt], ["Waterfall", d.wf]] as const) {
    inp.push([], [name, null]); for (const [k, v] of Object.entries(obj)) inp.push([k, typeof v === "boolean" ? (v ? "yes" : "no") : v as any])
  }
  sheet("Inputs", inp, [30, 14, 14, 14, 12, 10, 10])

  /* Waterfall */
  if (d.wf.on) {
    const w = waterfall(p)
    sheet("Waterfall", [
      ["", "Year 0", ...w.years.map(y => `Year ${y.t}`)],
      ["Fees to GP", r0(w.acqFee), ...w.years.map(y => r0(y.amFee))],
      ["LP cash flow", ...w.lpCfs.map(r0)], ["GP cash flow incl. fees", ...w.gpCfs.map(r0)],
      ["GP promote", null, ...w.years.map(y => r0(y.promote))], [],
      ["LP IRR", { f: `IRR(B3:${col(N + 1)}3)` }], ["GP IRR", { f: `IRR(B4:${col(N + 1)}4)` }],
      ["LP equity multiple", r4(w.lp.em)], ["GP equity multiple", r4(w.gp.em)],
    ], [26, ...Array(N + 1).fill(14)])
  }

  const safe = (d.name || "deal").replace(/[^\w\- ]+/g, "").trim().slice(0, 60) || "deal"
  XLSX.writeFile(wb, `${safe} - Underwriting Desk.xlsx`)
}
