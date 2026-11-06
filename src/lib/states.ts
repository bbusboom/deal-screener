// State profiles for Market check. Stable rules that change an owner's underwriting:
// property tax level, how taxes reset after a sale, rent regulation, income tax, and the groups that shape policy.
// Current officials, new bills and ballot measures change too often to hard code; the AI policy briefing looks those up live.
//
// Sources (checked Nov 2026): effective property tax rates from Census ACS 2024 based state tables
// (PropertyShark 2026 report and Tax Foundation 2026); rates for some states are approximate.
// Rent regulation status from the National Apartment Association's rent control outlook (statewide: CA, OR, WA, DC;
// local: ME, MD, MN, NJ, NY; 32 states preempt; the rest neither preempt nor have it). Top income tax rates: Tax Foundation 2026.

export type RentRule = "statewide" | "local" | "allowed" | "preempted"

export interface StateInfo {
  abbr: string
  name: string
  /** Effective property tax rate on owner occupied homes, % of value. Rentals often pay more. */
  propTax: number
  /** Typical rate for rental property where it differs a lot from the owner home average, % of value. Approximate. */
  rentalTax?: number
  /** Top personal income tax rate, %. */
  incomeTax: number
  rent: RentRule
  /** Statewide cap on annual rent increases, if any, in plain words. */
  rentCap?: string
  /** Rough max % a year rent can rise under a statewide cap, for the model check. */
  capPct?: number
  rentNote?: string
  /** How property taxes reset when a property sells. */
  reassess?: string
  /** Owner and industry groups active in state policy. */
  groups?: { name: string; url?: string }[]
}

const S = (abbr: string, name: string, propTax: number, incomeTax: number, rent: RentRule, extra: Partial<StateInfo> = {}): StateInfo =>
  ({ abbr, name, propTax, incomeTax, rent, ...extra })

export const STATES: StateInfo[] = [
  S("AL", "Alabama", 0.38, 5.0, "preempted"),
  S("AK", "Alaska", 1.04, 0, "allowed"),
  S("AZ", "Arizona", 0.48, 2.5, "preempted", {
    reassess: "Taxes are based on a limited property value that can rise at most 5% a year, so a sale does not jump the bill all at once. Rentals are taxed in a different class than owner occupied homes.",
    groups: [{ name: "Arizona Multihousing Association" }] }),
  S("AR", "Arkansas", 0.55, 3.9, "preempted", {
    rentalTax: 1.05,
    reassess: "Arkansas assesses property at 20% of market value and applies the local millage rate (often 45 to 60 mills), so a rental without the homestead credit commonly pays about 0.9% to 1.2% of value. Counties reappraise every 3 to 5 years, and a recent sale price is strong evidence of value.",
    rentNote: "Arkansas law is known as one of the most owner friendly in the country: no rent control and fast nonpayment remedies." }),
  S("CA", "California", 0.71, 13.3, "statewide", {
    rentalTax: 1.15,
    rentCap: "Statewide cap (AB 1482): 5% plus local CPI, never more than 10% a year, for most buildings older than 15 years. Many cities, such as Los Angeles, San Francisco and Oakland, have stricter local rent control.",
    capPct: 10,
    reassess: "Prop 13: the property is reassessed to your purchase price when you buy, then the taxable value can rise at most 2% a year. The rate is about 1% plus local bonds, often 1.1% to 1.25% of price. Never underwrite the seller's tax bill.",
    groups: [{ name: "California Apartment Association", url: "https://caanet.org" }] }),
  S("CO", "Colorado", 0.48, 4.4, "preempted", {
    rentNote: "Colorado bans local rent control, but repeal bills come up often.",
    groups: [{ name: "Apartment Association of Metro Denver" }] }),
  S("CT", "Connecticut", 1.81, 6.99, "allowed", {
    rentNote: "No state ban, and cities can use fair rent commissions to review increases tenants challenge as excessive." }),
  S("DE", "Delaware", 0.50, 6.6, "allowed"),
  S("DC", "District of Columbia", 0.57, 10.75, "statewide", {
    rentCap: "Rent stabilization covers many older buildings; the District sets the allowed increase each year. Newer buildings are generally exempt." }),
  S("FL", "Florida", 0.82, 0, "preempted", {
    rentalTax: 1.8,
    reassess: "Non homestead property (like rentals) can rise at most 10% a year in assessed value, but that cap resets to full market value when the property sells. Insurance is often the bigger surprise: get a real quote.",
    groups: [{ name: "Florida Apartment Association", url: "https://faahq.org" }] }),
  S("GA", "Georgia", 0.83, 5.19, "preempted", {
    reassess: "Property is assessed at 40% of fair market value; after a sale, counties commonly move the value toward the purchase price.",
    groups: [{ name: "Georgia Apartment Association" }] }),
  S("HI", "Hawaii", 0.27, 11.0, "allowed"),
  S("ID", "Idaho", 0.49, 5.3, "preempted"),
  S("IL", "Illinois", 2.01, 4.95, "preempted", {
    reassess: "Cook County (Chicago) reassesses every three years, with big swings between cycles. Illinois has one of the highest property tax levels in the country.",
    rentNote: "Illinois bans local rent control; repeal bills are introduced regularly." }),
  S("IN", "Indiana", 0.75, 2.95, "preempted", {
    reassess: "Indiana caps the tax bill as a share of value: 1% for homesteads, 2% for rentals and other residential, 3% for commercial. Apartments usually fall in the 2% bucket." }),
  S("IA", "Iowa", 1.39, 3.8, "preempted"),
  S("KS", "Kansas", 1.26, 5.58, "preempted"),
  S("KY", "Kentucky", 0.77, 3.5, "preempted"),
  S("LA", "Louisiana", 0.55, 3.0, "preempted", {
    reassess: "Homestead exemptions keep the owner occupied average low; rentals don't get them. Insurance in coastal parishes can be the largest expense." }),
  S("ME", "Maine", 1.09, 7.15, "local", { rentNote: "Local rent control is allowed; Portland has a rent control ordinance." }),
  S("MD", "Maryland", 0.99, 6.5, "local", { rentNote: "A few local governments regulate rent increases, including Montgomery County and Takoma Park. Check the county before you underwrite rent growth." }),
  S("MA", "Massachusetts", 1.04, 9.0, "preempted", {
    rentNote: "Voters banned rent control in 1994. A 2026 ballot question to bring it back was removed by the state's highest court in June 2026; supporters have said they may try again, and stabilization bills are still discussed at the State House." }),
  S("MI", "Michigan", 1.24, 4.25, "preempted", {
    rentalTax: 1.6,
    reassess: "Taxable value is capped at inflation (max 5%) while you own it, but it 'uncaps' to 50% of market value the year after a sale. Underwrite taxes on your price." }),
  S("MN", "Minnesota", 1.02, 9.85, "local", { rentNote: "Local rent control is allowed; St. Paul has a rent stabilization ordinance with exemptions for newer buildings." }),
  S("MS", "Mississippi", 0.67, 4.0, "preempted"),
  S("MO", "Missouri", 0.88, 4.7, "preempted"),
  S("MT", "Montana", 0.68, 5.65, "preempted"),
  S("NE", "Nebraska", 1.49, 4.55, "preempted"),
  S("NV", "Nevada", 0.47, 0, "allowed", {
    reassess: "Nevada caps yearly property tax increases (3% for owner occupied homes, a higher cap for rentals), which keeps bills well below value growth." }),
  S("NH", "New Hampshire", 1.66, 0, "allowed", { reassess: "No income or sales tax, so towns lean on property tax. Rates vary a lot from town to town." }),
  S("NJ", "New Jersey", 2.11, 10.75, "local", {
    rentNote: "Roughly a hundred municipalities have their own rent control ordinances, each with different caps and exemptions. Check the town ordinance before underwriting rent growth.",
    reassess: "The highest property taxes in the country. Towns reassess on their own schedules, so check the equalization ratio." }),
  S("NM", "New Mexico", 0.67, 5.9, "preempted"),
  S("NY", "New York", 1.55, 10.9, "local", {
    rentNote: "Rent stabilization covers many NYC buildings with 6+ units built before 1974, and some nearby counties opted in. Since 2024, NYC's Good Cause Eviction law limits increases on many other units, and other cities can opt in. Stabilized rents are set by the Rent Guidelines Board, not the market.",
    reassess: "NYC taxes apartment buildings in a separate class with its own rules; outside the city, assessments and rates vary widely by town." }),
  S("NC", "North Carolina", 0.70, 3.99, "preempted", {
    reassess: "Counties revalue on their own schedule (at least every 8 years, many every 4). A revaluation year can bring a large jump.",
    groups: [{ name: "Apartment Association of North Carolina" }] }),
  S("ND", "North Dakota", 0.98, 2.5, "preempted"),
  S("OH", "Ohio", 1.31, 2.75, "preempted", {
    reassess: "Counties reappraise every 6 years with an update at year 3, and a recent sale price is strong evidence of value. Rentals don't get the owner occupancy credit." }),
  S("OK", "Oklahoma", 0.82, 4.5, "preempted"),
  S("OR", "Oregon", 0.86, 9.9, "statewide", {
    rentCap: "Statewide cap: 7% plus CPI, never more than 10% a year, for buildings older than 15 years. Cities can't adopt stricter caps.",
    capPct: 10,
    reassess: "Measure 50 limits assessed value growth to 3% a year, and it does not reset when the property sells, so the seller's bill is a better guide here than in most states.",
    groups: [{ name: "Multifamily NW" }] }),
  S("PA", "Pennsylvania", 1.35, 3.07, "allowed", {
    reassess: "Counties go many years between reassessments, so the official ratio of assessed to market value matters. Philadelphia reassesses more often." }),
  S("RI", "Rhode Island", 1.24, 5.99, "allowed", { rentNote: "No state ban. Rent caps have been proposed in the legislature and in Providence but none are in force." }),
  S("SC", "South Carolina", 0.48, 6.0, "preempted", {
    rentalTax: 0.75,
    reassess: "Rentals are assessed at 6% of value versus 4% for owner occupied homes, so a rental pays about 50% more than the state average suggests. Value is reassessed after a sale." }),
  S("SD", "South Dakota", 1.07, 0, "preempted"),
  S("TN", "Tennessee", 0.50, 0, "preempted", { groups: [{ name: "Tennessee Apartment Association" }] }),
  S("TX", "Texas", 1.49, 0, "preempted", {
    rentalTax: 2.0,
    reassess: "Appraisal districts value property at market value every year, and a sale price shows up fast. A temporary 20% yearly cap on appraisal increases for non homestead property worth $5 million or less has applied through the 2026 tax year; check whether it was extended. With no income tax, property tax is often the largest expense after payroll.",
    rentNote: "Texas bans rent control and its eviction process is among the fastest.",
    groups: [{ name: "Texas Apartment Association", url: "https://www.taa.org" }] }),
  S("UT", "Utah", 0.52, 4.5, "preempted", { reassess: "Primary residences are taxed on 55% of value; rentals that aren't primary residences of the tenant can lose that exemption, so check the classification." }),
  S("VT", "Vermont", 1.59, 8.75, "preempted", { reassess: "Education property tax is set by the state and can differ for homestead and non homestead property; rentals pay the non homestead rate." }),
  S("VA", "Virginia", 0.80, 5.75, "preempted", { groups: [{ name: "Virginia Apartment Management Association" }] }),
  S("WA", "Washington", 0.84, 0, "statewide", {
    rentCap: "Statewide cap since May 2025: 7% plus CPI, never more than 10% a year (9.683% for 2026). Buildings under 12 years old are exempt.",
    capPct: 10,
    rentNote: "Washington has no wage income tax but does tax capital gains.",
    groups: [{ name: "Washington Multi-Family Housing Association" }] }),
  S("WV", "West Virginia", 0.53, 4.82, "allowed"),
  S("WI", "Wisconsin", 1.42, 7.65, "preempted"),
  S("WY", "Wyoming", 0.57, 0, "allowed"),
]

export const stateBy = (abbr?: string) => STATES.find(s => s.abbr === (abbr || "").toUpperCase())

export const RENT_LABEL: Record<RentRule, string> = {
  statewide: "Statewide rent cap",
  local: "Local rent control in some cities",
  allowed: "No rent control today, but cities aren't banned from it",
  preempted: "Rent control banned statewide",
}

export const DEFAULT_REASSESS = "In most counties the assessed value moves toward your purchase price after you buy. Estimate taxes on your price, not the seller's current bill."

/** Rentals usually pay more than the owner occupied average (no homestead break). Used for a rough estimate. */
export const RENTAL_TAX_FACTOR = 1.15

/** Rough rental tax rate as a fraction. zipOwnerRate is the Census owner occupied rate for the ZIP, if pulled. */
export function rentalTaxRate(st?: StateInfo, zipOwnerRate?: number | null) {
  if (!st) return NaN
  const fromZip = zipOwnerRate && zipOwnerRate > 0 ? zipOwnerRate * RENTAL_TAX_FACTOR : 0
  const fromState = st.rentalTax ? st.rentalTax / 100 : st.propTax / 100 * RENTAL_TAX_FACTOR
  if (st.abbr === "CA") return fromState // Prop 13: the rate on a new purchase price, not the average owner's old value
  return Math.max(fromZip, st.rentalTax ? fromState : 0) || fromState
}
export function taxEstimate(price: number, st?: StateInfo, zipOwnerRate?: number | null) {
  if (!st || price <= 0) return NaN
  return price * rentalTaxRate(st, zipOwnerRate)
}
