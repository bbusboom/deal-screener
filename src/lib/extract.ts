// Document import: what Claude pulls from a rent roll, T12 or offering memo, and how it maps onto the deal.
import type { Deal, UnitType } from "./model.js"

export const EXTRACT_FIELDS = {
  price: { label: "Purchase / asking price", unit: "$" },
  cc: { label: "Closing costs", unit: "%" },
  other: { label: "Other income", unit: "$/unit/mo" },
  vac: { label: "Vacancy & credit loss", unit: "%" },
  tax: { label: "Property taxes", unit: "$/yr" },
  ins: { label: "Insurance", unit: "$/yr" },
  util: { label: "Utilities", unit: "$/yr" },
  rm: { label: "Repairs & maintenance", unit: "$/yr" },
  pay: { label: "Payroll", unit: "$/yr" },
  adm: { label: "Admin, marketing, contracts", unit: "$/yr" },
  mgmt: { label: "Management", unit: "% of EGI" },
  res: { label: "Replacement reserves", unit: "$/unit/yr" },
  ltv: { label: "Loan to value", unit: "%" },
  rate: { label: "Interest rate", unit: "%" },
  amort: { label: "Amortization", unit: "yrs" },
  ioYrs: { label: "Interest only period", unit: "yrs" },
  exitCap: { label: "Exit cap rate", unit: "%" },
} as const
export type ExtractKey = keyof typeof EXTRACT_FIELDS

export type DocType = "rent_roll" | "t12" | "offering_memo" | "loan_quote" | "other"
export const DOC_LABEL: Record<DocType, string> = { rent_roll: "Rent roll", t12: "T12 / operating statement", offering_memo: "Offering memo", loan_quote: "Loan quote", other: "Other document" }

export interface Extraction {
  document_type: DocType
  property_name?: string
  fields: Partial<Record<ExtractKey, { value: number; source: string }>>
  unit_mix?: { units: UnitType[]; rent_basis: string; source: string }
  notes?: string[]
}

/** JSON schema for the tool Claude must call. */
export const EXTRACTION_TOOL = {
  name: "submit_extraction",
  description: "Return the underwriting data found in the document. Only include values the document actually supports.",
  input_schema: {
    type: "object",
    required: ["document_type", "fields"],
    properties: {
      document_type: { type: "string", enum: ["rent_roll", "t12", "offering_memo", "loan_quote", "other"] },
      property_name: { type: "string" },
      fields: {
        type: "object",
        description: "Each key is optional. value is a plain number in the unit noted; source says where in the document it came from, e.g. 'T12 total column, Real Estate Taxes line'.",
        properties: Object.fromEntries(Object.entries(EXTRACT_FIELDS).map(([k, f]) => [k, {
          type: "object", description: `${f.label} (${f.unit})`, required: ["value", "source"],
          properties: { value: { type: "number" }, source: { type: "string" } },
        }])),
      },
      unit_mix: {
        type: "object", required: ["units", "rent_basis", "source"],
        properties: {
          units: { type: "array", items: { type: "object", required: ["type", "count", "rent"], properties: { type: { type: "string" }, count: { type: "number" }, rent: { type: "number", description: "monthly rent per unit" } } } },
          rent_basis: { type: "string", description: "e.g. 'average in place rent of occupied units' or 'market rent'" },
          source: { type: "string" },
        },
      },
      notes: { type: "array", items: { type: "string" }, description: "Short caveats: annualized partial year, missing lines, assumptions made, items that look off." },
    },
  },
} as const

export const EXTRACTION_PROMPT = `You are reading a multifamily acquisition document to fill a deal underwriting model. Call submit_extraction once.

Rules:
- Only return values the document supports. Leave a field out rather than guess. Never invent numbers.
- Every value needs a short source saying where it came from.
- Money fields are annual dollars unless the unit says otherwise. Percent fields are whole numbers, e.g. 7 for 7%.

By document type:
- Rent roll: group units by unit type or floor plan. count = all units of that type, occupied and vacant. rent = average in place monthly rent of occupied units; if there's no in place rent, use market rent and say so in rent_basis. vac = vacant units / total units × 100 (physical vacancy); note that it's physical vacancy. If unit type names are codes, label them with beds/baths when the roll shows them.
- T12 or operating statement: use the trailing 12 month total column. If fewer than 12 months are shown, annualize and add a note. Map lines: tax = real estate taxes; ins = property insurance; util = all utilities (electric, water, sewer, gas, trash) net of nothing; rm = repairs, maintenance, make ready, turnover, landscaping, pest control and contract services that are maintenance; pay = payroll, salaries, benefits, payroll taxes; adm = administrative, marketing, advertising, office, legal, professional fees, software and other contract services; mgmt = management fee ÷ effective gross income × 100; vac = (vacancy loss + concessions + bad debt + model, employee and down units) ÷ gross potential rent × 100 when those lines exist; other = total other income (fees, RUBS, parking, pet, laundry) ÷ unit count ÷ 12 when the unit count is known; res = replacement reserves per unit if a reserve line exists. Exclude capital expenditures, debt service and depreciation from operating expenses.
- Offering memo: price (asking or guidance price), unit_mix, and pro forma or in place expenses using the same mapping, preferring the in place / T12 figures and noting which you used.
- Loan quote or term sheet: ltv, rate, amort, ioYrs, and loan fees in notes.
- If the document shows a property name, return it.
Add brief notes for anything an underwriter should double check.`

/** Which document type wins when two uploads give the same field. */
const PRIORITY: Record<string, DocType[]> = {
  price: ["offering_memo", "other", "loan_quote", "t12", "rent_roll"],
  vac: ["t12", "rent_roll", "offering_memo", "other", "loan_quote"],
  ltv: ["loan_quote", "offering_memo", "other", "t12", "rent_roll"],
  rate: ["loan_quote", "offering_memo", "other", "t12", "rent_roll"],
  amort: ["loan_quote", "offering_memo", "other", "t12", "rent_roll"],
  ioYrs: ["loan_quote", "offering_memo", "other", "t12", "rent_roll"],
  default: ["t12", "offering_memo", "loan_quote", "other", "rent_roll"],
}
export const UNIT_PRIORITY: DocType[] = ["rent_roll", "offering_memo", "other", "t12", "loan_quote"]

export interface Candidate { file: string; docType: DocType; value: number; source: string }
export function candidatesFor(key: ExtractKey, results: { file: string; ex: Extraction }[]): Candidate[] {
  const order = PRIORITY[key] || PRIORITY.default
  return results
    .filter(r => r.ex.fields?.[key] && isFinite(Number(r.ex.fields[key]!.value)))
    .map(r => ({ file: r.file, docType: r.ex.document_type, value: Number(r.ex.fields[key]!.value), source: r.ex.fields[key]!.source }))
    .sort((a, b) => order.indexOf(a.docType) - order.indexOf(b.docType))
}

export function fmtField(key: ExtractKey, v: number) {
  const u = EXTRACT_FIELDS[key].unit
  if (u.startsWith("$")) return "$" + Math.round(v).toLocaleString("en-US") + (u === "$" ? "" : u.slice(1))
  return `${Math.round(v * 100) / 100}${u === "%" || u.startsWith("% ") ? "%" : " " + u}`
}

export type DealPatch = Partial<Deal>
