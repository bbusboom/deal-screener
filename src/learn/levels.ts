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
  id: string; num: number; name: string; short: string; tag: string
  /** What the level covers, one or two sentences. */
  about: string
  /** How the level relates to underwriting. */
  connects: string
  /** What the learner can do after finishing it. */
  outcome: string
  modules: string[]
  /** Deal Check that closes the level; Level 1 is closed by its quizzes alone. */
  checkpoint?: string
}

/** Score needed on a level's Deal Check to finish the level. */
export const CHECKPOINT_PASS = 80

export const LEVELS: Level[] = [
  {
    id: "L1", num: 1, name: "Foundations", short: "Basics", tag: "Start here",
    about: "What investment real estate is, how owners make money from it, and the documents every deal comes with.",
    connects: "Underwriting is deciding whether a property's income justifies its price. This level gives you the vocabulary and the roadmap before any math.",
    outcome: "You can explain what an underwriter decides, name the steps in order, and know which document each number comes from.",
    modules: ["m1", "m2"],
  },
  {
    id: "L2", num: 2, name: "Building the model", short: "The model", tag: "Core",
    about: "One module for each step of the roadmap: income, expenses, NOI, value, debt and returns, all on the same example property.",
    connects: "This is the underwriting model itself, built top to bottom. Each module's answer is the next module's starting number.",
    outcome: "You can take a rent roll and T12 and build a full year one model: NOI, cap rate, loan size, DSCR, cash flow and IRR.",
    modules: ["m3", "m4", "m5", "m6", "m7", "m8"], checkpoint: "c1",
  },
  {
    id: "L3", num: 3, name: "Judgment", short: "Judgment", tag: "Apply it",
    about: "Stress testing, red flags, location risk, and a capstone that runs the whole roadmap on one deal.",
    connects: "A model is a guess about the future. This level tests how wrong the guess can be and turns the numbers into a decision: pursue, renegotiate or pass.",
    outcome: "You can underwrite a full deal on your own and defend your recommendation.",
    modules: ["m9", "m10"], checkpoint: "c2",
  },
  {
    id: "L4", num: 4, name: "Professional", short: "Pro", tag: "On the job",
    about: "How lenders and acquisitions teams actually do it: tougher income analysis, loan sizing, renovations, investor structures, market supply and the team workflow.",
    connects: "Each step from Level 2 again, done the way a professional team does it, with less trust in the seller and assumptions backed by the market.",
    outcome: "You can screen deals fast, build an institutional quality model and write the memo that gets a deal approved.",
    modules: ["m11", "m12", "m13"], checkpoint: "c3",
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
    learn: ["Calculate NOI from income and expenses", "Know what does and doesn't belong in NOI", "Tell the seller's NOI, your NOI and the pro forma apart, and price on yours"],
    steps: ["noi"],
  },
  m6: {
    why: "This turns NOI into a price, so you can tell whether the asking price makes sense and what you'd be willing to offer.",
    learn: ["Calculate and use a cap rate", "Value a property from its NOI", "Cross check with price per unit and GRM"],
    steps: ["value"],
  },
  m7: {
    why: "Most deals use a loan. The loan decides how much cash you need and whether the property can cover its mortgage, which is often what kills a deal.",
    learn: ["Work out a loan payment from rate and amortization", "Test a deal with DSCR and debt yield, and size the largest loan a lender will give", "Explain when borrowing raises your return and when it lowers it"],
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

/** What the learner gets out of each lesson, shown on the module overview. */
export const LESSON_GOALS: Record<string, string> = {
  m1l1: "What tenants, leases and rent are, where an owner's profit comes from, and what an underwriter is deciding.",
  m1l2: "How apartments, retail, office, industrial and others each earn money, and why that changes the underwriting.",
  m1l3: "The four ways an owner gets paid back, what principal, interest and equity mean, and which return you can count on.",
  m2l1: "The eight steps every underwriting follows, in order, and which module teaches each one.",
  m2l2: "Who the broker is, what the offering memo and pro forma are, and how to read a rent roll.",
  m2l3: "What the T12 shows, and the habit of checking the seller's projections against the real documents.",
  m3l1: "How to calculate gross potential rent from a unit mix, using market rent instead of the seller's hoped for rent.",
  m3l2: "What vacancy and credit loss are, and how to turn a percentage into dollars.",
  m3l3: "What other income includes, and how to put the pieces together into effective gross income.",
  m4l1: "Every operating expense line, what it pays for, and how to work out the management fee and reserves.",
  m4l2: "Three traps that make a seller's costs look too low: taxes after a sale, no management fee, and old insurance.",
  m4l3: "How to check expenses with the expense ratio and cost per unit, and what normal looks like.",
  m5l1: "How to calculate NOI, the property's profit before any loan, from rent all the way down.",
  m5l2: "What NOI leaves out on purpose, what CapEx is, and what above and below the line mean.",
  m5l3: "The three NOIs on every deal, the seller's, yours and the pro forma, and which one to price the deal on.",
  m6l1: "What a cap rate is, how to value a building from its NOI, and why a lower cap rate means a higher price.",
  m6l2: "How to compare a price with other sales using price per unit, gross rent multiplier and comps.",
  m7l1: "How loan to value, interest and amortization set your loan, your down payment and your yearly payments.",
  m7l2: "How lenders use DSCR to check that a building can pay its loan, and what the number means.",
  m7l3: "What debt yield is, and how to size a loan three ways and find the one the lender will give.",
  m7l4: "What leverage is, why a loan can raise or lower your return, and how to tell which by comparing the cap rate with the loan constant.",
  m8l1: "How to calculate the cash flow the owner keeps after the loan.",
  m8l2: "How to add up the cash you invest and calculate cash on cash return.",
  m8l3: "How to find the occupancy where the building just pays its bills and its loan.",
  m8l4: "How to grow NOI over the hold, estimate a sale price with an exit cap, and work out what you walk away with.",
  m8l5: "How to read equity multiple and IRR across the whole investment, and why timing matters.",
  m9l1: "How to stress test a deal one assumption at a time, and read a sensitivity table.",
  m9l2: "The red flags that show a seller's numbers are too good, and where each one was taught.",
  m9l4: "How to choose between pursue, renegotiate and pass, and what happens in due diligence.",
  m9l3: "How property taxes, rent rules and local politics change what the same building is worth.",
  m10l1: "The whole chain on one property, line by line, with the module behind every formula.",
  m11l1: "How to read a T12 the way a lender does: three columns side by side, loss to lease and economic occupancy.",
  m11l2: "How a lender calculates three maximum loans and gives you the smallest, and how to choose the debt.",
  m11l3: "How to price a renovation with return on cost and decide if the work is worth the risk.",
  m11l4: "How sponsors and investors split the cash through a waterfall and preferred return.",
  m11l5: "How to use rent and sale comps to check market rent and pick a realistic exit cap.",
  m12l1: "Why rent is set by competition, not by what a building costs or what the seller wants.",
  m12l2: "How new construction nearby leads to concessions, and how to read the pipeline before you buy.",
  m12l3: "How to convert a concession into effective rent, the number that belongs in your model.",
  m12l4: "Where renter demand comes from, and how to read the ZIP, city and metro.",
  m12l5: "How interest rates move cap rates, and what negative leverage does to your returns.",
  m13l1: "How an acquisitions team works through hundreds of deals, and what your job is on it.",
  m13l2: "How to decide in 30 minutes whether a deal deserves a full model.",
  m13l3: "The order to build a full model in, with a source behind every assumption.",
  m13l4: "The mistakes that most often make a deal look better than it is, and how to check for them.",
  m13l5: "The questions to ask the broker, and how to write a two page memo that gets a decision.",
}

/** The diagram drawn on each module's cover, taken from that module's own lessons. */
export const COVER_ART: Record<string, import("./curriculum").DiagramKind> = {
  m1: "returns4", m2: "docs", m3: "waterfall", m4: "noi", m5: "flow", m6: "capTriangle", m7: "capStack",
  m8: "cashflow", m9: "sensitivity", m10: "timeline", m11: "dscr", m12: "supplyCycle", m13: "funnel",
}

export const levelForCheck = (checkId: string) => LEVELS.find(l => l.checkpoint === checkId)
/** Set by the course when it sends someone to a level checkpoint; Deal Check starts it on arrival. */
export const PENDING_CHECK = "dealScreener.check.pending"
