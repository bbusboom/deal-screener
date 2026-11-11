// Course levels and module overviews: what each module covers, how it fits into underwriting,
// and where it sits on the underwriting roadmap. Shown on the course home and each module's overview page.

export type Step = "docs" | "income" | "expenses" | "noi" | "value" | "debt" | "returns" | "decision"

/** The underwriting roadmap, in the order a model is built. */
export const STEPS: { key: Step; label: string; short: string }[] = [
  { key: "docs", label: "Read the documents", short: "Documents" },
  { key: "income", label: "Income", short: "Income" },
  { key: "expenses", label: "Expenses", short: "Expenses" },
  { key: "noi", label: "NOI", short: "NOI" },
  { key: "value", label: "Value", short: "Value" },
  { key: "debt", label: "Debt", short: "Debt" },
  { key: "returns", label: "Returns", short: "Returns" },
  { key: "decision", label: "Risk and the call", short: "Decision" },
]

export interface Level {
  id: string; num: number; name: string; tag: string
  /** What the level covers, one or two sentences. */
  about: string
  /** How the level relates to underwriting. */
  connects: string
  /** What the learner can do after finishing it. */
  outcome: string
  modules: string[]
}

export const LEVELS: Level[] = [
  {
    id: "L1", num: 1, name: "Foundations", tag: "Start here",
    about: "What investment real estate is, how owners make money from it, and the documents every deal comes with.",
    connects: "Underwriting is deciding whether a property's income justifies its price. This level gives you the vocabulary and the roadmap before any math.",
    outcome: "You can explain what an underwriter decides, name the steps in order, and know which document each number comes from.",
    modules: ["m1", "m2"],
  },
  {
    id: "L2", num: 2, name: "Building the model", tag: "Core",
    about: "One module for each step of the roadmap: income, expenses, NOI, value, debt and returns, all on the same example property.",
    connects: "This is the underwriting model itself, built top to bottom. Each module's answer is the next module's starting number.",
    outcome: "You can take a rent roll and T12 and build a full year one model: NOI, cap rate, loan size, DSCR, cash flow and IRR.",
    modules: ["m3", "m4", "m5", "m6", "m7", "m8"],
  },
  {
    id: "L3", num: 3, name: "Judgment", tag: "Apply it",
    about: "Stress testing, red flags, location risk, and a capstone that runs the whole roadmap on one deal.",
    connects: "A model is a guess about the future. This level tests how wrong the guess can be and turns the numbers into a decision: pursue, renegotiate or pass.",
    outcome: "You can underwrite a full deal on your own and defend your recommendation.",
    modules: ["m9", "m10"],
  },
  {
    id: "L4", num: 4, name: "Professional", tag: "On the job",
    about: "How lenders and acquisitions teams actually do it: tougher income analysis, loan sizing, renovations, investor structures, market supply and the team workflow.",
    connects: "Each step from Level 2 again, done the way a professional team does it, with less trust in the seller and assumptions backed by the market.",
    outcome: "You can screen deals fast, build an institutional quality model and write the memo that gets a deal approved.",
    modules: ["m11", "m12", "m13"],
  },
]

export interface ModuleGuide {
  /** How this module relates to underwriting. */
  why: string
  /** What the learner will be able to do. */
  learn: string[]
  /** Where it sits on the roadmap. "all" lights every step. */
  steps: Step[] | "all"
}

export const GUIDE: Record<string, ModuleGuide> = {
  m1: {
    why: "Before you can judge a price, you need to know what you're buying and how its owner earns money. Each property type earns income differently, so each one is underwritten differently.",
    learn: ["Tell the main property types apart and how each earns income", "Name the four ways investors make money", "Explain what an underwriter is actually deciding"],
    steps: [],
  },
  m2: {
    why: "This is the map for the rest of the course. Every module after this fills in one step of the roadmap you learn here, using numbers from the rent roll, T12 and offering memo.",
    learn: ["Walk through the underwriting steps in order", "Know what the offering memo, rent roll and T12 each tell you", "Spot where a seller's documents are selling, not reporting"],
    steps: ["docs"],
  },
  m3: {
    why: "Income is the top line of every model. NOI, value, the loan and your returns all start here, so a mistake in income flows all the way down.",
    learn: ["Build gross potential rent from a unit mix", "Subtract vacancy and credit loss", "Add other income to reach effective gross income"],
    steps: ["income"],
  },
  m4: {
    why: "Expenses turn income into NOI. Sellers tend to show the lowest expenses they can, so this is where underwriters earn their keep.",
    learn: ["Know every operating expense line and what drives it", "Catch the expenses sellers leave out or understate", "Sanity check with expense ratio and cost per unit"],
    steps: ["expenses"],
  },
  m5: {
    why: "NOI is the number lenders size loans from and buyers price properties from. The next three modules all start with it.",
    learn: ["Calculate NOI from income and expenses", "Know what does and doesn't belong in NOI", "Explain why debt service and capex sit below the line"],
    steps: ["noi"],
  },
  m6: {
    why: "This turns NOI into a price, so you can tell whether the asking price makes sense and what you'd be willing to offer.",
    learn: ["Calculate and use a cap rate", "Value a property from its NOI", "Cross check with price per unit and GRM"],
    steps: ["value"],
  },
  m7: {
    why: "Most deals use a loan. The loan decides how much cash you need and whether the property can cover its mortgage, which is often what kills a deal.",
    learn: ["Work out a loan payment from rate and amortization", "Test a deal with DSCR and debt yield", "Size the largest loan a lender will give"],
    steps: ["debt"],
  },
  m8: {
    why: "This is what the investor actually gets. It answers the last question in the model: is this worth our money compared with other options?",
    learn: ["Calculate cash flow and cash on cash", "Model a sale and the proceeds", "Read IRR and equity multiple"],
    steps: ["returns"],
  },
  m9: {
    why: "Every assumption in the model can be wrong. This module tests how wrong before the deal fails, adds location risk like taxes and rent rules, and turns it into a call.",
    learn: ["Run stress tests and sensitivity tables", "Recognize the red flags that end a deal", "Make the call: pursue, renegotiate or pass"],
    steps: ["decision"],
  },
  m10: {
    why: "Runs the whole roadmap from Module 2 on one deal, so you see how every piece connects from the rent roll to the final answer.",
    learn: ["Underwrite a full deal start to finish", "Check each number against the one before it", "Reach and explain a verdict"],
    steps: "all",
  },
  m11: {
    why: "Takes each step from Level 2 and does it the way a lender or acquisitions team does: a tougher read of income, real loan sizing, renovations, investors and the exit.",
    learn: ["Read a T12 the way a lender does", "Size a loan on LTV, DSCR and debt yield and pick the debt", "Price a renovation, split returns with investors and pick an exit cap"],
    steps: "all",
  },
  m12: {
    why: "Your rent growth, vacancy, concessions and exit cap all come from the market. This module shows where those assumptions come from and how new supply changes them.",
    learn: ["Explain how rents are really set", "Read a construction pipeline and what it does to your deal", "Convert concessions to effective rent and link rates to cap rates"],
    steps: ["income", "value", "decision"],
  },
  m13: {
    why: "How underwriting fits into a real acquisitions team: screening deals fast, building the model in order, avoiding the common mistakes and writing the memo.",
    learn: ["Screen a deal in 30 minutes", "Build the full model in the right order", "Ask the broker the right questions and write the memo"],
    steps: "all",
  },
}

export const levelOf = (moduleId: string) => LEVELS.find(l => l.modules.includes(moduleId))!
