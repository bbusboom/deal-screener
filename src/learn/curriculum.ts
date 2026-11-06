// Deal School course: modules, lessons and quizzes, from the basics up to every underwriting metric.
// Running example: Oak Ridge Apartments, 20 units, $2,000,000. All numbers are computed with the site's model.

export type Block =
  | { t: "p"; text: string }
  | { t: "photo"; titles: string[]; query: string; caption: string; google: string }
  | { t: "diagram"; d: DiagramKind; caption?: string }
  | { t: "example"; title: string; rows: [string, string, boolean?][] }
  | { t: "terms"; items: [string, string][] }
  | { t: "tip"; text: string }
  | { t: "formula"; name: string; f: string }
  | { t: "calc"; c: "cap" | "dscr" | "coc" | "noi" }
  | { t: "state" }

export type DiagramKind = "supplyCycle" | "concession" | "funnel" | "flow" | "returns4" | "docs" | "waterfall" | "noi" | "capTriangle" | "capStack" | "dscr" | "cashflow" | "timeline" | "sensitivity"

export interface Lesson { id: string; title: string; minutes: number; blocks: Block[] }
export interface Question { q: string; options: string[]; answer: number; why: string }
export interface Module { id: string; num: number; title: string; summary: string; lessons: Lesson[]; quiz: Question[] }

const P = (titles: string[], query: string, caption: string, google: string): Block => ({ t: "photo", titles, query, caption, google })

export const COURSE: Module[] = [
  /* ------------------------------------------------------------------ 1 */
  {
    id: "m1", num: 1, title: "Real estate investing basics",
    summary: "What commercial real estate is, the main property types, and the four ways investors make money.",
    lessons: [
      {
        id: "m1l1", title: "What is investment real estate?", minutes: 5, blocks: [
          { t: "p", text: "Investment real estate is property you buy to earn money, not to live in. The building produces income from tenants, and the owner pays the costs of running it. What's left over is the owner's profit." },
          { t: "p", text: "Underwriting is the process of figuring out what a property will really earn, what it's worth, and whether buying it at a given price is a good decision. Banks underwrite before they lend; investors underwrite before they buy." },
          P(["File:Colvin Gardens Apartments, Buffalo, New York - 20220902.jpg", "File:Sepulveda Rose Apartments Pool.jpg"], "garden apartment complex", "A garden style apartment complex: several low buildings on one property, all owned by one investor.", "garden style apartment complex"),
          { t: "tip", text: "Think of a property like a small business. Rent is revenue, operating costs are expenses, and the building's value comes from the profit it produces." },
          { t: "terms", items: [["Underwriting", "Analyzing a property's income, costs, value and risks to decide whether, and at what price, to buy or lend."], ["Investor", "The person or company putting money into the deal, also called the sponsor or buyer."], ["Lender", "The bank or other source that loans part of the purchase price."]] },
        ],
      },
      {
        id: "m1l2", title: "The main property types", minutes: 6, blocks: [
          { t: "p", text: "Each property type earns money differently, which changes how it's underwritten. This course focuses on apartments (multifamily), the most common starting point, but the same ideas apply everywhere." },
          P(["File:Detached house, 850 N. Franklintown Road, Baltimore, MD 21216.jpg"], "detached single family house United States", "Single family rental: one house, one tenant. Valued mostly by comparing recent sales of similar homes.", "single family rental house"),
          P(["File:Sepulveda Rose Apartments Pool.jpg", "File:Colvin Gardens Apartments, Buffalo, New York - 20220902.jpg"], "apartment complex United States", "Multifamily: five or more units. Valued by the income it produces.", "multifamily apartment complex"),
          P(["File:Shopping at the Rose, Oxnard (2010-11-28).jpeg"], "strip mall shopping center", "Retail: tenants are businesses on multi year leases. Value depends on who the tenants are and how long they've signed for.", "strip mall shopping center"),
          P(["File:Reston, Virginia (14311563988).jpg"], "suburban office building", "Office: long leases, big costs to refill empty space.", "suburban office building"),
          P(["File:Distribution Centre, Whitwood Common Lane, 1979 - geograph.org.uk - 134787.jpg"], "distribution warehouse loading docks", "Industrial: warehouses and distribution centers, often leased to one tenant who pays most expenses.", "industrial warehouse distribution center"),
          { t: "terms", items: [["Multifamily", "A residential building or complex with five or more units, financed and valued as a commercial property."], ["NNN lease", "Triple net: the tenant pays property taxes, insurance and maintenance on top of rent. Common in retail and industrial."], ["Asset class", "Grades like Class A (newest, nicest), B and C (older, cheaper, more fixes needed)."]] },
        ],
      },
      {
        id: "m1l3", title: "How investors make money", minutes: 5, blocks: [
          { t: "p", text: "Real estate returns come from four places. A good underwriting looks at all four, but only the first one shows up in your bank account every month." },
          { t: "diagram", d: "returns4" },
          { t: "p", text: "Cash flow is what's left after expenses and the mortgage. Loan paydown is the part of each mortgage payment that reduces what you owe, which builds your equity. Appreciation is the property becoming worth more. Tax benefits come mostly from depreciation, which lets owners deduct part of the building's cost each year." },
          { t: "tip", text: "Beginners often count on appreciation to make a deal work. Professional underwriters want a deal that works on cash flow and treat appreciation as a bonus." },
        ],
      },
    ],
    quiz: [
      { q: "What is underwriting?", options: ["Writing the purchase contract", "Analyzing a property's income, costs, value and risk to decide whether and at what price to buy", "Getting the property inspected", "Signing the loan documents"], answer: 1, why: "Underwriting is the analysis that comes before a decision: what it earns, what it's worth, and what could go wrong." },
      { q: "A multifamily property is usually defined as:", options: ["Any home with a family in it", "Two to four units", "Five or more residential units", "Only high rise apartments"], answer: 2, why: "Five or more units are financed and valued as commercial real estate. Two to four units still count as residential." },
      { q: "Which return shows up as money in the owner's account each month?", options: ["Appreciation", "Loan paydown", "Cash flow", "Depreciation"], answer: 2, why: "Cash flow is the money left after expenses and the loan payment. The other three build wealth but don't pay you monthly." },
      { q: "In an NNN (triple net) lease, who usually pays property taxes and insurance?", options: ["The landlord", "The tenant", "The lender", "The city"], answer: 1, why: "Triple net means the tenant pays the three nets: taxes, insurance and maintenance." },
      { q: "Why do professionals avoid deals that only work if the property appreciates?", options: ["Appreciation is taxed more", "Appreciation is uncertain, while cash flow pays the bills now", "Lenders don't allow appreciation", "Appreciation only happens in retail"], answer: 1, why: "Nobody controls the market. A deal that needs prices to rise can lose money if they don't." },
    ],
  },
  /* ------------------------------------------------------------------ 2 */
  {
    id: "m2", num: 2, title: "The underwriting process and documents",
    summary: "The steps every underwriting follows, and the three documents you'll use most.",
    lessons: [
      {
        id: "m2l1", title: "The underwriting roadmap", minutes: 5, blocks: [
          { t: "p", text: "Every underwriting follows the same path. Each step feeds the next, which is why this course is built in the same order." },
          { t: "diagram", d: "flow" },
          { t: "p", text: "You start with income, subtract operating expenses to get NOI, use NOI to judge value, layer on the loan, and end with the cash flow and returns you'd actually earn. Then you stress test it and decide." },
          { t: "tip", text: "If NOI is wrong, everything after it is wrong too. That's why most of an underwriter's time goes into income and expenses." },
        ],
      },
      {
        id: "m2l2", title: "Offering memo, rent roll and T12", minutes: 7, blocks: [
          { t: "diagram", d: "docs" },
          { t: "p", text: "The offering memorandum (OM) is the seller's sales brochure, usually prepared by a broker. It has photos, the property description, the asking price or price guidance, and the broker's projections. Treat its projections as the seller's best case." },
          { t: "p", text: "The rent roll lists every unit: unit number, floor plan, tenant, current rent, market rent, lease start and end dates, and whether it's occupied. It tells you what the property earns today." },
          { t: "p", text: "The T12, or trailing twelve months, is the property's actual income and expense statement for the last year, month by month. It tells you what the property really cost to run." },
          { t: "terms", items: [["OM", "Offering memorandum: the marketing package for a property for sale."], ["Rent roll", "A list of every unit with its rent, tenant and lease dates."], ["T12", "Trailing twelve months of actual income and expenses."], ["Pro forma", "A projection of future income and expenses, as opposed to actual history."]] },
          { t: "tip", text: "Compare the OM's projected rents to the rent roll and the OM's expenses to the T12. The gaps are where sellers make deals look better than they are." },
        ],
      },
    ],
    quiz: [
      { q: "Which document shows what every unit is renting for today?", options: ["Offering memo", "Rent roll", "T12", "Loan quote"], answer: 1, why: "The rent roll lists every unit with its current rent and lease dates." },
      { q: "What does T12 stand for?", options: ["Total of 12 units", "Trailing twelve months of actual income and expenses", "A 12 year loan", "Tax year 2012"], answer: 1, why: "The T12 is the property's real operating history over the last twelve months." },
      { q: "The broker's projections in an offering memo should be treated as:", options: ["Guaranteed", "The seller's best case, to be checked", "The lender's numbers", "Required by law to be accurate"], answer: 1, why: "The OM is a sales document. Underwriters verify its numbers against the rent roll and T12." },
      { q: "Put these in order: NOI, Income, Returns, Expenses", options: ["Income, Expenses, NOI, Returns", "NOI, Income, Expenses, Returns", "Returns, NOI, Expenses, Income", "Expenses, Income, Returns, NOI"], answer: 0, why: "Income minus expenses gives NOI, and NOI drives value, debt and returns." },
      { q: "A pro forma is:", options: ["Last year's actual results", "A projection of future performance", "A loan document", "An inspection report"], answer: 1, why: "Pro forma means projected. Actuals come from the T12." },
    ],
  },
  /* ------------------------------------------------------------------ 3 */
  {
    id: "m3", num: 3, title: "Income",
    summary: "Gross potential rent, vacancy and credit loss, other income, and effective gross income.",
    lessons: [
      {
        id: "m3l1", title: "Gross potential rent", minutes: 5, blocks: [
          { t: "p", text: "Gross potential rent (GPR) is what the property would collect if every unit were rented at market rent for the whole year. It's the ceiling, not what you'll actually collect." },
          { t: "formula", name: "Gross potential rent", f: "Units × monthly rent × 12" },
          { t: "example", title: "Oak Ridge Apartments", rows: [["Units", "20"], ["Rent per unit per month", "$1,000"], ["GPR = 20 × $1,000 × 12", "$240,000", true]] },
          { t: "p", text: "Real properties have several floor plans, so you calculate each unit type and add them up. Use market rent from the rent roll and nearby comparable properties, not the seller's hoped for rent." },
          { t: "terms", items: [["Market rent", "What a unit would rent for today if it were empty and leased to a new tenant."], ["In place rent", "What current tenants are actually paying under their leases."], ["Loss to lease", "The gap between market rent and in place rent."]] },
        ],
      },
      {
        id: "m3l2", title: "Vacancy, credit loss and other income", minutes: 6, blocks: [
          { t: "p", text: "Nobody collects 100% of GPR. Units sit empty between tenants, and some tenants don't pay. Underwriters subtract vacancy and credit loss even when a building is full today, because people always move out eventually." },
          { t: "p", text: "Other income is everything besides rent: parking, pet fees, laundry, application fees, storage, and utility reimbursements (often called RUBS). Add it back to get effective gross income (EGI), what you expect to actually collect." },
          { t: "diagram", d: "waterfall" },
          { t: "example", title: "Oak Ridge Apartments", rows: [["Gross potential rent", "$240,000"], ["Vacancy and credit loss (6%)", "−$14,400"], ["Other income ($40 per unit per month)", "+$9,600"], ["Effective gross income", "$235,200", true]] },
          { t: "tip", text: "Most underwriters use 5% to 8% vacancy for a stable apartment property. Using 0% because the building is full today is one of the most common beginner mistakes." },
          { t: "terms", items: [["Vacancy loss", "Rent lost to empty units."], ["Credit loss", "Rent owed but never collected, also called bad debt."], ["Concessions", "Discounts like a free month to attract tenants; they reduce collected rent."], ["EGI", "Effective gross income: GPR minus vacancy and credit loss plus other income."]] },
        ],
      },
    ],
    quiz: [
      { q: "A 30 unit property rents for $900 per unit per month. What is gross potential rent?", options: ["$27,000", "$270,000", "$324,000", "$32,400"], answer: 2, why: "30 × $900 × 12 = $324,000." },
      { q: "Why subtract vacancy if the building is 100% occupied today?", options: ["Lenders require a fee", "Tenants will move out over time and units sit empty between them", "Vacancy is a tax", "It's only for new buildings"], answer: 1, why: "Turnover always happens. Underwriting the average year means expecting some empty time." },
      { q: "GPR is $500,000, vacancy is 7%, and other income is $20,000. What is EGI?", options: ["$485,000", "$465,000", "$520,000", "$445,000"], answer: 0, why: "$500,000 − $35,000 + $20,000 = $485,000." },
      { q: "Which of these is other income?", options: ["Property taxes", "Pet fees", "Mortgage interest", "Repairs"], answer: 1, why: "Pet fees are income on top of rent. The others are costs." },
      { q: "Loss to lease is:", options: ["Rent lost to vacant units", "The gap between market rent and what current tenants pay", "A lease that was broken", "A legal fee"], answer: 1, why: "If market is $1,100 and a tenant pays $1,000, that $100 is loss to lease." },
    ],
  },
  /* ------------------------------------------------------------------ 4 */
  {
    id: "m4", num: 4, title: "Operating expenses",
    summary: "The costs of running a property, the traps sellers hide, and how to check if expenses look right.",
    lessons: [
      {
        id: "m4l1", title: "Expense categories", minutes: 6, blocks: [
          { t: "p", text: "Operating expenses are the costs of running the property day to day. They do not include the mortgage, big renovation projects, or depreciation." },
          { t: "example", title: "Oak Ridge Apartments, year 1", rows: [["Property taxes", "$26,000"], ["Insurance", "$12,000"], ["Utilities", "$14,000"], ["Repairs and maintenance", "$12,000"], ["Payroll", "$10,000"], ["Admin and marketing", "$6,000"], ["Management (5% of EGI)", "$11,760"], ["Replacement reserves ($300 per unit)", "$6,000"], ["Total operating expenses", "$97,760", true]] },
          { t: "terms", items: [["Fixed expenses", "Costs that don't change much with occupancy, like taxes and insurance."], ["Controllable expenses", "Costs management can influence, like repairs, payroll and marketing."], ["Management fee", "What a property manager charges, usually 3% to 8% of EGI."], ["Replacement reserves", "Money set aside each year for big future replacements like roofs and HVAC."]] },
        ],
      },
      {
        id: "m4l2", title: "Seller traps and sanity checks", minutes: 6, blocks: [
          { t: "p", text: "Expenses are where seller numbers are most often too optimistic. Three traps catch beginners again and again." },
          { t: "p", text: "First, property taxes usually rise after a sale because the county reassesses the property at the new purchase price. Never just copy the seller's tax bill. Second, an owner who manages the property themselves shows no management fee, but you'll pay one. Third, old insurance quotes are often far below today's premiums." },
          { t: "formula", name: "Expense ratio", f: "Operating expenses ÷ EGI" },
          { t: "example", title: "Oak Ridge sanity checks", rows: [["Expense ratio = $97,760 ÷ $235,200", "41.6%"], ["Expenses per unit = $97,760 ÷ 20", "$4,888"]] },
          { t: "tip", text: "Apartments typically run a 35% to 50% expense ratio; older buildings sit at the high end. If a seller shows 28%, something is probably missing." },
        ],
      },
    ],
    quiz: [
      { q: "Which of these is NOT an operating expense?", options: ["Insurance", "Mortgage payment", "Payroll", "Repairs"], answer: 1, why: "The mortgage is a financing cost. It comes after NOI, not in operating expenses." },
      { q: "Why might property taxes go up after you buy?", options: ["The county reassesses the property at the new sale price", "Lenders add a tax", "Tenants request it", "They never change"], answer: 0, why: "Many counties reset the assessed value after a sale, so the new owner's bill is based on the higher price." },
      { q: "EGI is $400,000 and operating expenses are $180,000. What is the expense ratio?", options: ["45%", "55%", "40%", "222%"], answer: 0, why: "$180,000 ÷ $400,000 = 45%." },
      { q: "A seller who self manages shows no management fee. What should you do?", options: ["Leave it at zero", "Budget a management fee anyway", "Add it to the price", "Double the payroll"], answer: 1, why: "You'll either hire a manager or spend your own time. Either way it's a real cost." },
      { q: "Replacement reserves are for:", options: ["Monthly utility bills", "Future big replacements like roofs and HVAC", "The down payment", "Tenant deposits"], answer: 1, why: "Reserves smooth out the large, irregular costs of replacing major building parts." },
    ],
  },
  /* ------------------------------------------------------------------ 5 */
  {
    id: "m5", num: 5, title: "Net operating income",
    summary: "The single most important number in underwriting, and what does and doesn't belong in it.",
    lessons: [
      {
        id: "m5l1", title: "Calculating NOI", minutes: 5, blocks: [
          { t: "formula", name: "Net operating income", f: "EGI − operating expenses" },
          { t: "diagram", d: "noi" },
          { t: "example", title: "Oak Ridge Apartments", rows: [["Effective gross income", "$235,200"], ["Operating expenses", "−$97,760"], ["Net operating income", "$137,440", true]] },
          { t: "p", text: "NOI is the property's profit before any loan payments. It's the same no matter how the buyer pays for the deal, which is why everyone uses it to compare properties." },
          { t: "calc", c: "noi" },
        ],
      },
      {
        id: "m5l2", title: "What NOI leaves out", minutes: 4, blocks: [
          { t: "p", text: "NOI does not include the mortgage payment, capital improvements like a new roof or unit renovations, depreciation, or income taxes. Those all matter, but they come later in the analysis." },
          { t: "tip", text: "Every dollar of NOI is worth many dollars of value. At a 6.5% cap rate, cutting $10,000 of expenses adds about $154,000 of value. That's why investors obsess over NOI." },
          { t: "terms", items: [["CapEx", "Capital expenditures: big one time improvements or replacements, kept below the NOI line."], ["Above the line", "Items included in NOI."], ["Below the line", "Items after NOI, such as debt service and CapEx."]] },
        ],
      },
    ],
    quiz: [
      { q: "EGI is $600,000 and operating expenses are $250,000. What is NOI?", options: ["$850,000", "$350,000", "$250,000", "$600,000"], answer: 1, why: "$600,000 − $250,000 = $350,000." },
      { q: "Is the mortgage payment included in NOI?", options: ["Yes, it's the biggest expense", "No, NOI is before any loan payments", "Only the interest", "Only for apartments"], answer: 1, why: "NOI is before financing, so two buyers with different loans see the same NOI." },
      { q: "A new roof is usually treated as:", options: ["An operating expense", "Capital expenditure below the NOI line", "Other income", "A vacancy cost"], answer: 1, why: "Big one time replacements are CapEx. Reserves set money aside for them over time." },
      { q: "Why do investors compare properties using NOI?", options: ["It includes the mortgage", "It doesn't depend on how the buyer finances the deal", "It's always higher than EGI", "Lenders don't use it"], answer: 1, why: "Taking financing out makes NOI a clean measure of the property itself." },
    ],
  },
  /* ------------------------------------------------------------------ 6 */
  {
    id: "m6", num: 6, title: "Valuation and cap rates",
    summary: "Cap rates, how to value a property from its income, price per unit and GRM.",
    lessons: [
      {
        id: "m6l1", title: "The cap rate", minutes: 7, blocks: [
          { t: "formula", name: "Cap rate", f: "NOI ÷ price" },
          { t: "p", text: "The capitalization rate is the yield you'd earn in year one if you paid all cash. It's how the market prices income: buyers in a given area and property type accept a certain cap rate, and that sets values." },
          { t: "diagram", d: "capTriangle" },
          { t: "example", title: "Oak Ridge Apartments", rows: [["NOI", "$137,440"], ["Price", "$2,000,000"], ["Cap rate = $137,440 ÷ $2,000,000", "6.87%", true], ["Value at a 6.5% market cap = $137,440 ÷ 6.5%", "$2,114,462", true]] },
          { t: "tip", text: "Lower cap rate means higher price for the same income. When market cap rates rise, values fall, even if the building's NOI didn't change." },
          { t: "calc", c: "cap" },
        ],
      },
      {
        id: "m6l2", title: "Other ways to size up price", minutes: 5, blocks: [
          { t: "formula", name: "Price per unit", f: "Price ÷ number of units" },
          { t: "formula", name: "Gross rent multiplier (GRM)", f: "Price ÷ gross potential rent" },
          { t: "example", title: "Oak Ridge Apartments", rows: [["Price per unit = $2,000,000 ÷ 20", "$100,000"], ["GRM = $2,000,000 ÷ $240,000", "8.33"]] },
          { t: "p", text: "Comparable sales, called comps, are recent sales of similar properties nearby. Underwriters compare the subject property's cap rate, price per unit and GRM to comps to see if the asking price is in line with the market." },
          P(["File:Suburbia by David Shankbone.jpg"], "suburban neighborhood aerial", "Comps come from the same market: similar age, size and location.", "comparable property sales neighborhood"),
          { t: "terms", items: [["Comps", "Recent sales of similar properties used to judge value."], ["Going in cap rate", "The cap rate at purchase, using year one NOI."], ["Exit cap rate", "The cap rate assumed when you sell."]] },
        ],
      },
    ],
    quiz: [
      { q: "NOI is $300,000 and the price is $5,000,000. What is the cap rate?", options: ["6%", "16.7%", "5%", "60%"], answer: 0, why: "$300,000 ÷ $5,000,000 = 6%." },
      { q: "NOI is $150,000 and the market cap rate is 6%. What is the value?", options: ["$900,000", "$2,500,000", "$1,500,000", "$9,000,000"], answer: 1, why: "$150,000 ÷ 0.06 = $2,500,000." },
      { q: "If market cap rates rise and NOI stays the same, value:", options: ["Rises", "Falls", "Stays the same", "Doubles"], answer: 1, why: "Value = NOI ÷ cap rate, so a bigger cap rate means a smaller value." },
      { q: "A 40 unit building sells for $6,000,000. Price per unit?", options: ["$240,000", "$150,000", "$15,000", "$60,000"], answer: 1, why: "$6,000,000 ÷ 40 = $150,000." },
      { q: "The cap rate represents:", options: ["The interest rate on the loan", "The year one yield to an all cash buyer", "The vacancy rate", "Annual rent growth"], answer: 1, why: "Cap rate is NOI divided by price, the return if you paid all cash." },
    ],
  },
  /* ------------------------------------------------------------------ 7 */
  {
    id: "m7", num: 7, title: "Financing and debt",
    summary: "Loan to value, interest and amortization, DSCR, debt yield, and how lenders size a loan.",
    lessons: [
      {
        id: "m7l1", title: "How a loan works", minutes: 6, blocks: [
          { t: "diagram", d: "capStack" },
          { t: "p", text: "Most purchases use a loan for most of the price. The loan to value (LTV) is the loan as a share of the price. The rest is equity, the cash the investor puts in." },
          { t: "p", text: "The interest rate is the cost of borrowing. Amortization is how many years the payments are spread over; a 30 year amortization pays down a little principal every month. Some loans start with interest only years, where you pay just the interest." },
          { t: "formula", name: "Loan to value", f: "Loan ÷ price" },
          { t: "example", title: "Oak Ridge financing", rows: [["Price", "$2,000,000"], ["Loan at 70% LTV", "$1,400,000"], ["Down payment", "$600,000"], ["Rate and amortization", "6.5%, 30 years"], ["Annual debt service", "$106,187", true]] },
          { t: "terms", items: [["Debt service", "The total loan payments in a year, principal plus interest."], ["Amortization", "Paying a loan down over time with regular payments."], ["Interest only", "Paying only interest for a period, so the balance doesn't fall."], ["Equity", "The investor's own cash in the deal."]] },
        ],
      },
      {
        id: "m7l2", title: "DSCR, debt yield and loan sizing", minutes: 7, blocks: [
          { t: "formula", name: "Debt service coverage ratio (DSCR)", f: "NOI ÷ annual debt service" },
          { t: "diagram", d: "dscr" },
          { t: "p", text: "DSCR shows how many times the property's income covers the loan payment. Most lenders want at least 1.20 to 1.35. Below 1.0 the property can't pay its own mortgage." },
          { t: "formula", name: "Debt yield", f: "NOI ÷ loan amount" },
          { t: "example", title: "Oak Ridge loan tests", rows: [["DSCR = $137,440 ÷ $106,187", "1.29x"], ["Debt yield = $137,440 ÷ $1,400,000", "9.82%"], ["Largest loan at a 1.25 DSCR", "about $1,449,600"], ["Largest loan at 70% LTV", "$1,400,000", true]] },
          { t: "tip", text: "Lenders size the loan by whichever test is tighter. Here 70% LTV is the binding limit. On many deals it's DSCR, and beginners who only check LTV get surprised when the lender offers less." },
          { t: "calc", c: "dscr" },
        ],
      },
    ],
    quiz: [
      { q: "A $3,000,000 property with a $2,100,000 loan has what LTV?", options: ["70%", "30%", "143%", "21%"], answer: 0, why: "$2,100,000 ÷ $3,000,000 = 70%." },
      { q: "NOI is $250,000 and annual debt service is $200,000. DSCR?", options: ["0.8x", "1.25x", "1.5x", "$50,000"], answer: 1, why: "$250,000 ÷ $200,000 = 1.25x." },
      { q: "A DSCR below 1.0 means:", options: ["The loan is very safe", "Income doesn't cover the loan payment", "The cap rate is high", "The LTV is low"], answer: 1, why: "Below 1.0, NOI is smaller than debt service, so the owner must add cash to pay the loan." },
      { q: "Your DSCR is 1.10 and the lender requires 1.25. Which would fix it?", options: ["A bigger loan", "A lower purchase price or smaller loan", "A higher interest rate", "Ignoring reserves"], answer: 1, why: "A smaller loan lowers debt service, raising DSCR. Raising NOI also works." },
      { q: "Debt yield is calculated as:", options: ["Loan ÷ NOI", "NOI ÷ loan amount", "Debt service ÷ NOI", "Price ÷ loan"], answer: 1, why: "Debt yield is the NOI as a percentage of the loan, a lender's quick risk check." },
    ],
  },
  /* ------------------------------------------------------------------ 8 */
  {
    id: "m8", num: 8, title: "Cash flow and returns",
    summary: "Cash flow, cash on cash, break even occupancy, IRR, equity multiple and the exit.",
    lessons: [
      {
        id: "m8l1", title: "Cash flow and cash on cash", minutes: 6, blocks: [
          { t: "diagram", d: "cashflow" },
          { t: "formula", name: "Cash flow", f: "NOI − debt service" },
          { t: "formula", name: "Cash on cash return", f: "Annual cash flow ÷ total cash invested" },
          { t: "example", title: "Oak Ridge, year 1", rows: [["NOI", "$137,440"], ["Debt service", "−$106,187"], ["Cash flow", "$31,253", true], ["Cash invested = $600,000 down + $40,000 closing", "$640,000"], ["Cash on cash = $31,253 ÷ $640,000", "4.88%", true]] },
          { t: "formula", name: "Break even occupancy", f: "(Operating expenses + debt service) ÷ (GPR + other income)" },
          { t: "p", text: "Oak Ridge breaks even at about 81.7% occupancy. Below that, the owner has to put in cash each month." },
          { t: "calc", c: "coc" },
        ],
      },
      {
        id: "m8l2", title: "IRR, equity multiple and the exit", minutes: 8, blocks: [
          { t: "p", text: "Cash on cash only looks at one year. To see the whole investment, underwriters project every year of the hold, then a sale at the end." },
          { t: "diagram", d: "timeline" },
          { t: "p", text: "The sale price comes from the exit cap rate: next year's NOI divided by the cap rate you expect when you sell. Subtract selling costs and the remaining loan balance to get your net sale proceeds." },
          { t: "example", title: "Oak Ridge, 5 year hold", rows: [["Assumptions", "3% rent and expense growth, 7% exit cap"], ["Sale price", "$2,276,152"], ["Loan payoff", "−$1,310,554"], ["Net sale proceeds", "$920,075"], ["IRR", "12.83%", true], ["Equity multiple", "1.75x", true]] },
          { t: "p", text: "IRR, the internal rate of return, is the yearly return that accounts for when each dollar comes back; money sooner is worth more than money later. The equity multiple is simpler: total cash you get back divided by cash you put in. 1.75x means every $1 invested returns $1.75." },
          { t: "tip", text: "Exit cap rates are usually set equal to or higher than the going in cap rate, because the building will be older when you sell. Assuming a lower exit cap is an easy way to make a weak deal look great." },
          { t: "terms", items: [["Hold period", "How many years you plan to own the property."], ["Net sale proceeds", "Sale price minus selling costs and loan payoff."], ["IRR", "Annual return over the whole hold, accounting for timing."], ["Equity multiple", "Total cash returned ÷ cash invested."]] },
        ],
      },
    ],
    quiz: [
      { q: "NOI is $200,000 and debt service is $150,000. Cash flow?", options: ["$350,000", "$50,000", "$150,000", "$1.33"], answer: 1, why: "$200,000 − $150,000 = $50,000." },
      { q: "Cash flow is $40,000 on $500,000 invested. Cash on cash?", options: ["8%", "12.5%", "4%", "80%"], answer: 0, why: "$40,000 ÷ $500,000 = 8%." },
      { q: "You invest $1,000,000 and get back $1,800,000 in total. Equity multiple?", options: ["0.8x", "1.8x", "18%", "2.8x"], answer: 1, why: "$1,800,000 ÷ $1,000,000 = 1.8x." },
      { q: "Why does IRR differ from the equity multiple?", options: ["IRR ignores the sale", "IRR accounts for when the money comes back", "IRR only counts year one", "They're always equal"], answer: 1, why: "Getting cash back sooner raises IRR even if the total is the same." },
      { q: "Why is assuming an exit cap below the going in cap risky?", options: ["It lowers the sale price", "It assumes buyers will pay more for an older building, inflating returns", "Lenders forbid it", "It increases vacancy"], answer: 1, why: "A lower exit cap means a higher sale price. It's an optimistic bet on the market." },
    ],
  },
  /* ------------------------------------------------------------------ 9 */
  {
    id: "m9", num: 9, title: "Risk, sensitivity and the decision",
    summary: "Stress testing, sensitivity tables, red flags, and how to reach pursue, renegotiate or pass.",
    lessons: [
      {
        id: "m9l1", title: "Stress testing and sensitivity", minutes: 6, blocks: [
          { t: "p", text: "A base case is your best guess. Professionals also ask what happens if things go wrong: rents drop, vacancy rises, rates go up, or the exit cap is higher than planned." },
          { t: "diagram", d: "sensitivity" },
          { t: "p", text: "A sensitivity table changes two inputs at once, like exit cap and rent growth, and shows the return in every combination. Green cells meet your target; red cells don't. If only the most optimistic corner works, the deal is fragile." },
          { t: "tip", text: "On the Underwrite side of this site, the Scenarios tab builds these tables for you." },
        ],
      },
      {
        id: "m9l2", title: "Red flags and making the call", minutes: 6, blocks: [
          { t: "p", text: "Common red flags: 0% vacancy, no management fee, the seller's tax bill, an expense ratio under 35%, rents far above comps, a DSCR under 1.25, or an exit cap lower than the going in cap." },
          { t: "p", text: "The decision is one of three. Pursue if it meets your targets with realistic numbers. Renegotiate if it works at a lower price; your underwriting tells you that price. Pass if no reasonable price makes it work." },
          { t: "p", text: "Before closing, a professional also checks the physical building with an inspection, verifies leases against the rent roll, gets a real insurance quote and a tax estimate, and studies new apartments being built nearby." },
          { t: "terms", items: [["Base case", "Your most likely set of assumptions."], ["Stress test", "Running the deal under bad but realistic scenarios."], ["Due diligence", "The checks done after an offer is accepted and before closing."]] },
        ],
      },
      {
        id: "m9l3", title: "Location: taxes, rent rules and politics", minutes: 8, blocks: [
          { t: "p", text: "Put the same building in two different states and it can be worth very different amounts. Three things about location change the numbers: how the property is taxed, whether rents can be limited by law, and who is writing the rules." },
          { t: "p", text: "Property tax first. The effective rate, tax paid as a share of value, runs from under 0.3% in Hawaii to over 2% in New Jersey. Rentals usually pay more than the owner occupied average because they don't get homestead breaks. And in most places the county moves the value toward your purchase price after you buy, so the seller's tax bill is not your tax bill." },
          { t: "example", title: "Oak Ridge in a high tax state", rows: [["Taxes in our base example (1.3% of price)", "$26,000"], ["Same building at 2.11% of $2,000,000", "$42,200"], ["Extra tax per year", "$16,200"], ["NOI = $137,440 − $16,200", "$121,240", true], ["Cap rate at $2,000,000", "6.06%"], ["Value at a 6.5% market cap = $121,240 ÷ 6.5%", "$1,865,231", true], ["Value lost to the higher tax", "−$249,231"]] },
          { t: "formula", name: "Rule of thumb", f: "Value lost ≈ extra yearly expense ÷ cap rate" },
          { t: "p", text: "Rent rules second. California, Oregon and Washington cap yearly rent increases statewide, at roughly 5% to 10% depending on inflation. A few states such as New York and New Jersey let cities run their own rent control. About 32 states ban local rent control, so rents move with the market. If a cap applies, your rent growth assumption can't go above it, and regulated units may be worth less to the next buyer." },
          { t: "p", text: "Politics third. Governors, legislatures, city councils and voters keep changing these rules: tax caps, eviction timelines, rent limits, insurance rules. Owner groups such as the Texas Apartment Association and the California Apartment Association lobby for owners; tenant advocacy groups push the other way. A good underwriter doesn't pick a side. They track what's in force, what's proposed and how likely it is to pass, then test the deal with and without it." },
          { t: "state" },
          { t: "terms", items: [["Effective tax rate", "Yearly property tax divided by the property's value."], ["Reassessment", "The county updating a property's taxable value, often after a sale."], ["Preemption", "A state law that stops cities from passing their own rules, such as rent control."], ["Rent stabilization", "A limit on how much rent on an existing unit can rise each year."]] },
          { t: "tip", text: "On the Underwrite side, Market › Location runs these checks on your deal, pulls neighborhood data by ZIP, and can write a current policy briefing for the property's state." },
        ],
      },
    ],
    quiz: [
      { q: "A deal only hits its target when rents grow 5% a year and the exit cap is 1% below today. This deal is:", options: ["Very safe", "Fragile, it depends on optimistic assumptions", "Guaranteed", "Unaffected by the market"], answer: 1, why: "If it only works in the best case, small surprises can sink it." },
      { q: "Which is a red flag in a seller's numbers?", options: ["7% vacancy", "A 45% expense ratio", "No management fee on a self managed property", "A 1.35 DSCR"], answer: 2, why: "You'll pay for management. Leaving it out overstates NOI." },
      { q: "The deal misses targets at the asking price but works 8% lower. Best decision?", options: ["Pursue at asking", "Renegotiate", "Pass forever", "Ignore the numbers"], answer: 1, why: "Your underwriting gives you a price that works. Offer near it." },
      { q: "Due diligence happens:", options: ["Before looking at the OM", "After an offer is accepted, before closing", "After selling", "Only for loans"], answer: 1, why: "It's the verification period between agreement and closing." },
      { q: "You're buying for $3,000,000 where the county reassesses after a sale at about 1.6% of value. The seller's tax bill is $24,000. What goes in your model?", options: ["$24,000", "About $48,000", "Nothing until the bill arrives", "The average of the two"], answer: 1, why: "Taxes reset toward your price: $3,000,000 × 1.6% = $48,000. Using the seller's bill overstates NOI by $24,000." },
      { q: "At a 6.5% cap rate, an extra $10,000 a year in property tax lowers the property's value by about:", options: ["$10,000", "$65,000", "$154,000", "$650"], answer: 2, why: "Value lost ≈ $10,000 ÷ 6.5% ≈ $153,800." },
      { q: "A state preempts rent control. That means:", options: ["Rents are capped statewide", "Cities can't pass their own rent control unless the state changes the law", "Landlords can't raise rents", "Rent control is required"], answer: 1, why: "Preemption blocks local rent control; rents move with the market until the state law changes." },
    ],
  },
  /* ------------------------------------------------------------------ 10 */
  {
    id: "m10", num: 10, title: "Capstone: underwrite a full deal",
    summary: "Put every metric together on a full deal from start to verdict.",
    lessons: [
      {
        id: "m10l1", title: "Putting it all together", minutes: 5, blocks: [
          { t: "p", text: "You now know every metric in a standard underwriting. Here's the whole chain on one page, using Oak Ridge." },
          { t: "example", title: "Oak Ridge Apartments, complete", rows: [["Gross potential rent", "$240,000"], ["EGI", "$235,200"], ["Operating expenses (41.6%)", "$97,760"], ["NOI", "$137,440", true], ["Cap rate at $2,000,000", "6.87%"], ["Loan, 70% LTV", "$1,400,000"], ["DSCR", "1.29x"], ["Cash flow", "$31,253"], ["Cash on cash", "4.88%"], ["5 year IRR", "12.83%"], ["Equity multiple", "1.75x", true]] },
          { t: "p", text: "Verdict: solid NOI and a healthy DSCR, but year one cash on cash of 4.88% is below the 6% many investors want. A buyer might renegotiate the price or look for ways to raise NOI." },
          { t: "tip", text: "Next, open Practice a deal to underwrite Maple Court yourself, step by step, with the math shown at every step. Then try your own property or upload real documents." },
        ],
      },
    ],
    quiz: [
      { q: "Put the chain in order:", options: ["NOI, EGI, cap rate, DSCR", "GPR, EGI, NOI, value and debt, cash flow and returns", "Returns, NOI, GPR, EGI", "DSCR, GPR, EGI, NOI"], answer: 1, why: "Income becomes EGI, minus expenses gives NOI, which drives value, debt and finally returns." },
      { q: "Which metric would a lender look at first?", options: ["Equity multiple", "DSCR", "GRM", "Appreciation"], answer: 1, why: "Lenders care whether income covers the loan, which is DSCR, along with LTV." },
      { q: "Oak Ridge's cash on cash is 4.88% and the investor wants 6%. Which change helps most directly?", options: ["A lower purchase price", "A lower exit cap", "Higher vacancy", "A shorter hold"], answer: 0, why: "A lower price reduces the cash needed and the loan payment, raising cash on cash." },
      { q: "NOI rises $10,000 and the market cap rate is 6.5%. Roughly how much value is added?", options: ["$10,000", "$65,000", "$154,000", "$650,000"], answer: 2, why: "$10,000 ÷ 0.065 ≈ $153,846." },
    ],
  },  /* ------------------------------------------------------------------ 11 */
  {
    id: "m11", num: 11, title: "Pro underwriting",
    summary: "How professionals read a T12, size a loan, price a renovation, structure investors and pick an exit cap.",
    lessons: [
      {
        id: "m11l1", title: "Reading the operating statement like a lender", minutes: 8, blocks: [
          { t: "p", text: "Professionals lay three columns side by side: the seller's trailing 12 months (T12), the last 3 months annualized (T3, multiplied by 4), and their own underwritten year 1. The T12 shows the year; the T3 shows the trend. If the T3 is weaker, underwrite to the T3 unless you know why it dipped." },
          { t: "p", text: "Rent is booked at market rent, then reduced. Loss to lease is the gap between market rent and what current leases actually pay. Below it come physical vacancy, concessions (free rent), bad debt (rent never collected) and non revenue units (model, office, employee or down units)." },
          { t: "diagram", d: "waterfall", caption: "Revenue steps down from gross potential rent to effective gross income." },
          { t: "example", title: "Oak Ridge with market rents of $1,050", rows: [["Gross potential rent at market (20 × $1,050 × 12)", "$252,000"], ["Loss to lease (in place $1,000)", "−$12,000"], ["Physical vacancy 6%", "−$15,120"], ["Concessions 1%", "−$2,520"], ["Bad debt 1%", "−$2,520"], ["Net rental income", "$219,840", true], ["Economic occupancy", "87.2%"]] },
          { t: "p", text: "Economic occupancy (rent collected ÷ potential) is the number that matters. A building can be 96% leased and still collect only 88% of its potential." },
          { t: "p", text: "NOI vs NCF: brokers quote cap rates on NOI before replacement reserves. Lenders size loans on net cash flow, which is NOI after reserves. With $150,000 of NOI and $300 per unit of reserves on 20 units, NCF is $144,000. At a $2,000,000 price that's a 7.5% cap on NOI or a 7.2% cap on NCF: same building, two numbers." },
          { t: "terms", items: [["T3 annualized", "The last three months of income or expense multiplied by four, to show the current run rate."], ["Loss to lease", "Market rent minus in place rent, summed across units. It burns off as leases renew at market."], ["Economic occupancy", "Rent actually collected as a share of gross potential rent."], ["Net cash flow (NCF)", "NOI after replacement reserves; what lenders use for DSCR and debt yield."]] },
          { t: "tip", text: "In the Underwrite workspace, Financials › Operating statement builds this three column view and shades every line where your underwriting beats the seller's actuals." },
        ],
      },
      {
        id: "m11l2", title: "Sizing the loan and choosing debt", minutes: 9, blocks: [
          { t: "p", text: "A lender doesn't just lend a percentage of the price. It calculates three maximum loans and gives you the smallest: one by loan to value, one by DSCR, and one by debt yield." },
          { t: "example", title: "Oak Ridge: NOI $137,440, 6.5% rate, 30 year amortization", rows: [["LTV loan, 75% of $2,000,000", "$1,500,000"], ["DSCR loan: $137,440 ÷ 1.25 ÷ 0.0758 loan constant", "$1,449,633"], ["Debt yield loan: $137,440 ÷ 9%", "$1,527,111"], ["Loan you get (DSCR binds)", "$1,449,633", true]] },
          { t: "p", text: "When rates are high, DSCR usually binds, so the loan is smaller than the LTV you were quoted and the equity check is bigger. Always size the loan this way before you promise a seller a price." },
          { t: "p", text: "Fixed rate loans (agency, bank, life company) have steady payments but often carry yield maintenance: a prepayment penalty equal to the lender's lost interest. Paying off $1,000,000 at 6.5% with four years left, when Treasuries yield 4.25%, costs about $81,000. Floating rate bridge loans pay SOFR plus a spread, are usually interest only, and require a rate cap that limits how high SOFR can go." },
          { t: "p", text: "The refinance trap: a buyer pays $10,000,000 for a building with $500,000 of NOI (a 5% cap) using an $8,000,000 bridge loan. Two years later NOI is $540,000, but cap rates have risen to 6%, so the building is worth $9,000,000. A 65% LTV permanent loan is only $5,850,000. The owners must bring about $2,150,000 of new cash to refinance. Many 2021 and 2022 bridge deals ran into exactly this." },
          { t: "terms", items: [["Loan constant", "Annual debt service per dollar of loan; 7.58% for a 6.5%, 30 year loan."], ["Yield maintenance", "A prepayment penalty that pays the lender the interest it loses when a fixed loan is paid off early."], ["Rate cap", "A contract bought at closing that pays the borrower if SOFR rises above a strike rate."], ["Bridge loan", "Short term, usually floating rate, interest only debt used to buy and reposition a property."]] },
          { t: "tip", text: "Capital › Debt sizes the loan three ways, models floating rates with a cap, prepayment penalties and a refinance in any year, and warns you when a refinance needs cash in." },
        ],
      },
      {
        id: "m11l3", title: "Value add: pricing a renovation", minutes: 7, blocks: [
          { t: "p", text: "A value add plan spends money on units to raise rent. The test is return on cost: the extra yearly rent divided by what you spend." },
          { t: "formula", name: "Return on cost", f: "Annual rent premium ÷ renovation cost per unit" },
          { t: "example", title: "One unit", rows: [["Renovation cost", "$8,000"], ["Rent premium", "$100 a month = $1,200 a year"], ["Return on cost", "15%", true], ["Value created at a 6% cap: $1,200 ÷ 0.06", "$20,000"], ["Value per $1 spent", "2.5x", true]] },
          { t: "p", text: "Most sponsors want a return on cost of at least 15%. Below about 12%, the work isn't worth the risk. Prove the premium with renovated comps nearby, not the seller's projections." },
          { t: "p", text: "Don't forget the cost of doing the work: each unit sits empty for a few weeks, so year 1 income usually drops before it rises, and DSCR can dip below what a permanent lender allows. That's why renovations are often financed with bridge loans or a lender holdback." },
          { t: "tip", text: "Property › Value add builds a month by month renovation schedule and shows the before and after NOI, IRR and DSCR." },
        ],
      },
      {
        id: "m11l4", title: "Syndications: who earns what", minutes: 8, blocks: [
          { t: "p", text: "Many deals are bought by a sponsor (the general partner, GP) using money from investors (limited partners, LPs). The GP finds and runs the deal and usually invests 5 to 10% of the equity. The LPs provide the rest." },
          { t: "diagram", d: "capStack", caption: "Debt sits at the bottom of the capital stack; investor and sponsor equity sit above it." },
          { t: "p", text: "Cash is split by a waterfall. First, everyone is paid pro rata until investors earn the preferred return (the pref), often 6 to 8% a year. After that the split shifts toward the sponsor, for example 70% to LPs and 30% to the GP until LPs reach a 15% IRR, then 50/50." },
          { t: "example", title: "$1,000,000 of equity: LPs $900,000, GP $100,000, 8% pref", rows: [["First $80,000 a year (the pref) to LPs", "$72,000"], ["First $80,000 a year to the GP", "$8,000"], ["Next $100,000 of profit, split 70/30: LPs", "$70,000"], ["Same $100,000: GP", "$30,000"], ["GP's pro rata share would have been", "$10,000"], ["Promote earned by the GP", "$20,000", true]] },
          { t: "p", text: "Sponsors also charge fees: an acquisition fee (1 to 3% of the price), an asset management fee (1 to 2% of income) and sometimes a disposition fee at sale. As an investor, compare the deal level IRR with the LP IRR after fees and promote. The gap is the price of the sponsor's work." },
          { t: "terms", items: [["GP / LP", "General partner (the sponsor who runs the deal) and limited partners (passive investors)."], ["Preferred return", "The return investors receive before the sponsor shares in profits."], ["Promote", "The sponsor's share of profits above its share of the equity; its reward for performance."], ["Hurdle", "An IRR level that changes the split once investors reach it."]] },
          { t: "tip", text: "Turn on Syndication under Capital › Investors to see LP and GP returns, fees and promote year by year." },
        ],
      },
      {
        id: "m11l5", title: "Comps and the exit cap", minutes: 6, blocks: [
          { t: "p", text: "Rent comps are nearby properties of similar age and quality. They tell you what market rent really is, which sets loss to lease and the renovation premium. Compare like with like: asking vs effective rent, unit size, amenities and who pays utilities." },
          { t: "p", text: "Sale comps tell you what buyers pay per unit and at what cap rate. Broker cap rates are usually on the seller's trailing NOI before reserves, so compare your price against them on the same basis." },
          { t: "p", text: "The exit cap is the cap rate a future buyer will pay. Professionals set it above the going in cap, about 5 to 10 basis points per year of hold (25 to 75 bps), because the building will be older and rates may be higher. Every 50 bps of exit cap moves the sale price 7 to 9%." },
          { t: "example", title: "Exit cap sensitivity on $400,000 of exit NOI", rows: [["At a 6.0% cap", "$6,666,667"], ["At a 6.5% cap", "$6,153,846"], ["Difference", "−$512,821 (−7.7%)", true]] },
          { t: "tip", text: "Market › Comps compares your rents and price with comps and can set the exit cap to the comp average plus the hold cushion in one click." },
        ],
      },
    ],
    quiz: [
      { q: "40 units have a market rent of $1,100 and in place rent of $1,050. What is annual loss to lease?", options: ["$2,000", "$24,000", "$42,000", "$50,400"], answer: 1, why: "$50 × 40 units × 12 months = $24,000." },
      { q: "A lender's LTV limit gives $3.0M, DSCR gives $2.6M and debt yield gives $2.8M. What loan do you get?", options: ["$3.0M", "$2.8M", "$2.6M", "The average, $2.8M"], answer: 2, why: "Lenders lend the lesser of the three limits; here DSCR binds." },
      { q: "A $10,000 renovation raises rent $125 a month. What is the return on cost?", options: ["1.25%", "12.5%", "15%", "8%"], answer: 2, why: "$125 × 12 = $1,500 a year; $1,500 ÷ $10,000 = 15%." },
      { q: "How should the exit cap compare to the going in cap?", options: ["Lower, because rents grow", "The same", "Higher, by roughly 5 to 10 bps per hold year", "It doesn't matter"], answer: 2, why: "The building ages and rates can rise, so professionals assume a higher exit cap." },
      { q: "What is the sponsor's promote?", options: ["Its acquisition fee", "Its share of profits above its share of the equity", "Its co-investment", "The preferred return"], answer: 1, why: "The promote is the extra profit share the GP earns for performance, beyond its pro rata share." },
      { q: "A $150,000 roof replacement in year 3 affects which number?", options: ["NOI", "Cash flow, but not NOI", "Gross potential rent", "The cap rate"], answer: 1, why: "Capital expenditures sit below NOI: they reduce cash flow to owners but not NOI." },
      { q: "When is a yield maintenance penalty largest?", options: ["When rates have risen", "When rates have fallen since the loan closed", "At maturity", "On floating rate loans"], answer: 1, why: "It pays the lender the interest it can no longer earn, which is largest when Treasury yields are below the loan rate." },
    ],
  },
  /* ------------------------------------------------------------------ 12 */
  {
    id: "m12", num: 12, title: "Markets: supply, demand and competition",
    summary: "Why new buildings drive concessions, what a pipeline of construction means for your purchase, and how jobs, people and interest rates move rents and values.",
    lessons: [
      {
        id: "m12l1", title: "How rents are really set", minutes: 7, blocks: [
          { t: "p", text: "Rent isn't set by what a building costs or what the seller wants. It's set by competition: how many apartments are empty in the area compared with how many people are looking. When renters have few choices, owners raise rents and stop offering specials. When there are lots of empty units nearby, owners cut rents or give free months to fill them." },
          { t: "p", text: "That's why underwriting starts outside the property. Two identical buildings can be worth very different amounts depending on how much competition is coming down the street." },
          { t: "example", title: "A county absorbing a wave of new units", rows: [["Existing apartments", "20,000"], ["Occupied at 94%", "18,800"], ["New units delivered this year", "1,500"], ["New renter households moving in", "600"], ["Occupied after one year", "19,400"], ["Market occupancy after one year: 19,400 ÷ 21,500", "90.2%", true]] },
          { t: "p", text: "Demand grew, but supply grew faster. Every building in the market, including the one you're buying, now competes for renters at about 90% occupancy instead of 94%. Expect slower rent growth and more concessions until the extra units fill." },
          { t: "terms", items: [["Absorption", "How many units the market fills in a period: new renter households plus renters moving between buildings."], ["Supply", "Apartments available or coming: existing units plus buildings under construction or permitted."], ["Market occupancy", "The share of all apartments in an area that are leased; the starting point for your vacancy assumption."]] },
          { t: "tip", text: "Market › Supply & demand compares the county's new renter households each year with the apartment units permitted. Below 1.0x means supply is outrunning demand." },
        ],
      },
      {
        id: "m12l2", title: "New construction and what it means for your buy", minutes: 9, blocks: [
          { t: "p", text: "A new building doesn't hurt nearby owners the day it's announced. It hurts them when it opens and has to lease 200 or 300 empty units fast. Developers need occupancy to refinance their construction loan, so lease ups compete hard: big specials, waived fees, gift cards." },
          { t: "diagram", d: "supplyCycle", caption: "From permit to stabilized usually takes three to five years. The damage to nearby rents shows up during lease up." },
          { t: "p", text: "So when you buy, look backward and forward: permits from the last two or three years tell you what will open during your first years of ownership. If you underwrite 3% rent growth right into a lease up wave, your first two years will miss." },
          { t: "example", title: "Same building, two assumptions, $600,000 of potential rent", rows: [["Year 3 rent at 3% growth", "$636,540"], ["Year 3 rent if a lease up wave holds rent flat for 2 years", "$600,000"], ["Rent shortfall", "−$36,540"], ["Extra vacancy, 3 points", "−$18,000"], ["Matching concessions, 2% of rent", "−$12,000"], ["NOI shortfall", "−$66,540", true], ["Value lost at a 6.25% cap", "−$1,064,640", true]] },
          { t: "p", text: "That's the cost of ignoring supply on one mid size deal: over a million dollars of value, and a weaker loan, because lenders size on NOI." },
          { t: "p", text: "New supply doesn't hit every property equally. A brand new building competes most with other newer, higher rent properties. An older building with lower rents feels it less, unless the new building's specials bring its effective rent down to yours (next lesson). Location matters too: a project across town or aimed at a different renter matters less than one across the street." },
          { t: "terms", items: [["Pipeline", "Apartments permitted or under construction that haven't opened yet."], ["Lease up", "The period after a new building opens while it fills; usually 12 to 24 months."], ["Stabilized", "Occupancy back to normal (around 93 to 95%) and specials mostly gone."]] },
          { t: "tip", text: "When the competition scan shows lease ups nearby, slow your first two years of rent growth, add concessions, and check that your DSCR still works." },
        ],
      },
      {
        id: "m12l3", title: "Concessions: asking rent vs effective rent", minutes: 8, blocks: [
          { t: "p", text: "A concession is a discount given to sign a lease: weeks free, a month off, waived fees. Owners use them instead of cutting the advertised rent because the asking rent stays high on paper, and renewals and appraisals often key off it." },
          { t: "p", text: "Always convert a special into effective rent, the rent the tenant really pays over the lease. That's the number your property competes against." },
          { t: "formula", name: "Effective rent", f: "(Asking rent × lease months − value of free time) ÷ lease months" },
          { t: "example", title: "New lease up: $1,400 asking, 8 weeks free on a 13 month lease", rows: [["Rent over 13 months: $1,400 × 13", "$18,200"], ["One week of rent: $1,400 × 12 ÷ 52", "$323"], ["8 weeks free", "−$2,585"], ["Paid over the lease", "$15,615"], ["Effective rent: $15,615 ÷ 13", "$1,201", true], ["Discount from asking", "14.2%", true]] },
          { t: "diagram", d: "concession", caption: "With the special, the new building is cheaper than your older one." },
          { t: "p", text: "Now your tenants paying $1,250 can move into a brand new unit for $1,201 effective. You either match with your own concessions, accept more move outs, or both. That's why an increase in competition shows up first in concessions, then in vacancy, and only later in asking rents." },
          { t: "p", text: "Why you need to understand it: sellers report rent rolls at asking or gross rent and record concessions on a separate line (or bury them). A T12 that shows strong gross rent but a growing concession line is a market getting softer. Underwrite concessions as a percent of gross potential rent, and use the T3, not the T12, to see the trend." },
          { t: "terms", items: [["Concession", "A discount to sign or renew a lease, usually free weeks or months."], ["Asking rent", "The advertised rent before specials."], ["Effective rent", "What the tenant actually pays on average over the lease after specials."]] },
          { t: "tip", text: "Property › Rent & income has a concessions line. Market › Supply & demand suggests a concession percentage from current specials nearby." },
        ],
      },
      {
        id: "m12l4", title: "Demand: people, jobs and affordability", minutes: 7, blocks: [
          { t: "p", text: "Demand for apartments comes from new households that rent: people moving in for jobs, students, young adults leaving home, and owners who sell and rent. The best single signal is renter household growth; the best leading signal is job growth." },
          { t: "p", text: "Look at three layers: the ZIP (who lives right around the building), the city, and the county or metro (where the jobs are). Fast population growth with slow renter household growth often means people are buying homes or living with roommates, not renting more apartments." },
          { t: "p", text: "Affordability caps rent growth. Renters generally spend about 30% of income on rent. If the median renter household earns $48,000, about $1,200 a month is comfortable. Underwriting rents well above that needs a reason: a nicer building, a better location, or incomes that are rising." },
          { t: "example", title: "Affordability check", rows: [["Median renter household income", "$48,000"], ["30% of income ÷ 12", "$1,200 a month"], ["Your post renovation rent target", "$1,325"], ["Gap to explain", "$125", true]] },
          { t: "terms", items: [["Renter household growth", "New households that rent each year; the demand that fills apartments."], ["Rent to income", "Rent as a share of household income; above about 30% means renters are stretched."], ["Unemployment", "A rising rate in the county is an early warning for bad debt and slower leasing."]] },
          { t: "tip", text: "Market › Supply & demand shows population and renter growth for the ZIP, city and county. Market › Location shows incomes, rents and county unemployment." },
        ],
      },
      {
        id: "m12l5", title: "Interest rates, cap rates and timing", minutes: 8, blocks: [
          { t: "p", text: "Cap rates move with interest rates, because buyers compare a property's yield with what they could earn on safer investments and what they'll pay to borrow. When the 10 year Treasury rose from about 1.5% in 2021 to over 4%, apartment cap rates rose too, and values fell even where NOI held up." },
          { t: "example", title: "Same $500,000 NOI, different market", rows: [["Value at a 4.50% cap (2021)", "$11,111,111"], ["Value at a 5.75% cap", "$8,695,652"], ["Change", "−21.7%", true]] },
          { t: "p", text: "Negative leverage: when the loan costs more than the property yields, borrowing makes your cash return worse, not better. That's common today, and it changes how deals get bought." },
          { t: "example", title: "$10M purchase at a 5.5% cap, 65% loan at 6.5%, 30 year amortization", rows: [["NOI", "$550,000"], ["Debt service on $6.5M (7.58% loan constant)", "−$493,013"], ["Cash flow", "$56,987"], ["Equity", "$3,500,000"], ["Cash on cash", "1.63%", true], ["Cap rate, as if you paid all cash", "5.50%"]] },
          { t: "p", text: "With negative leverage, returns have to come from growing NOI (value add, rent growth) and from the exit. That's exactly why supply, concessions and exit cap discipline matter so much: there's no cushion if rents stall." },
          { t: "terms", items: [["Negative leverage", "When the loan constant is higher than the cap rate, so debt lowers your cash on cash return."], ["Spread to Treasuries", "Cap rate minus the 10 year Treasury yield; a thin spread means prices are rich relative to rates."]] },
          { t: "tip", text: "Market › Location shows today's 10 year Treasury and SOFR. Capital › Loan quotes shows how much each lender's terms change your cash on cash." },
        ],
      },
    ],
    quiz: [
      { q: "A new 300 unit building opens two blocks away and is leasing up. What usually shows up first at nearby properties?", options: ["Asking rents drop right away", "More concessions and move outs", "Higher property taxes", "Lower insurance"], answer: 1, why: "Owners defend asking rent and compete with specials first; vacancy follows, and asking rents adjust last." },
      { q: "A lease up asks $1,500 with 6 weeks free on a 12 month lease. About what is the effective rent?", options: ["$1,500", "$1,327", "$1,250", "$1,125"], answer: 1, why: "6 weeks is about 6 ÷ 52 of a year, 11.5%. $1,500 × (1 − 0.115) ≈ $1,327." },
      { q: "Why look at permits from two or three years ago when buying today?", options: ["Permits show past rents", "They're the buildings that will open and lease up during your first years of ownership", "Lenders require it", "They set the tax rate"], answer: 1, why: "Construction takes 18 to 30 months, so recent permits become your competition right after you buy." },
      { q: "The county adds 400 renter households a year and permits 1,200 apartment units a year. What should you expect?", options: ["Rising occupancy", "Supply outrunning demand: softer occupancy, more concessions", "No effect", "Higher cap rates only"], answer: 1, why: "Demand coverage is about 0.33x. New units must pull renters from existing buildings." },
      { q: "A property's cap rate is 5.25% and the loan constant is 7.6%. What does adding more debt do to cash on cash?", options: ["Raises it", "Lowers it (negative leverage)", "Nothing", "Doubles it"], answer: 1, why: "Each borrowed dollar costs 7.6% a year but the property only yields 5.25% on it." },
      { q: "A seller's T12 shows rising gross rent, but the concession line grew from 1% to 4% of rent in the last six months. What's the best read?", options: ["The market is strengthening", "The property is buying occupancy; effective rent is weaker than gross rent suggests", "Concessions don't matter", "Raise rent growth"], answer: 1, why: "Growing concessions hide softer effective rents. Use the T3 trend and underwrite the concessions." },
    ],
  },
  /* ------------------------------------------------------------------ 13 */
  {
    id: "m13", num: 13, title: "Underwriting for an acquisitions team",
    summary: "How the job works on a real team: the deal funnel, the 30 minute screen, building the model in order, the mistakes interns make, and writing the memo.",
    lessons: [
      {
        id: "m13l1", title: "The deal funnel and your role", minutes: 6, blocks: [
          { t: "p", text: "An acquisitions team looks at far more deals than it buys. Brokers send offering memos every week, and the team's edge comes from screening fast, underwriting the good ones carefully, and saying no quickly to the rest." },
          { t: "diagram", d: "funnel", caption: "A typical year: most deals die at the screen." },
          { t: "p", text: "As an intern or analyst, your job is to make the decision makers faster and better: get the numbers right, flag what's wrong with the seller's story, and give a clear recommendation with the reasons. A good \"no\" with a max price is as valuable as a \"yes\"." },
          { t: "terms", items: [["Offering memorandum (OM)", "The broker's marketing package with the seller's numbers and story."], ["LOI", "Letter of intent: a non binding offer with price and key terms."], ["Best and final", "The last round of bids when several buyers are interested."], ["Investment committee (IC)", "The group that approves buying a deal, usually after reading a memo."]] },
        ],
      },
      {
        id: "m13l2", title: "The 30 minute screen", minutes: 8, blocks: [
          { t: "p", text: "Before building a full model, answer one question: is this worth more of the team's time? Work through these in order and stop as soon as something kills the deal." },
          { t: "example", title: "Screen checklist", rows: [["1. Price per unit vs recent sale comps", "Market › Comps"], ["2. In place NOI from the T12, with taxes reset to your price", "Property › Expenses"], ["3. Insurance and payroll sanity check per unit", "Property › Expenses"], ["4. Going in cap rate on your adjusted NOI", "Overview"], ["5. DSCR and loan size at today's rates", "Capital › Debt"], ["6. In place rents vs comps: room to grow or already at market?", "Market › Comps"], ["7. New supply and concessions nearby", "Market › Supply & demand"], ["8. Max price that still clears the buy box", "Overview", true]] },
          { t: "p", text: "Write the result in two sentences: the price that works, and the one or two things that drive it. For example: \"Works at $4.2M, not the $4.8M ask. Seller's taxes reset by $34k after sale, and three lease ups within two miles mean flat rents for two years.\"" },
          { t: "tip", text: "Upload the OM, T12 and rent roll under Property › Documents first; the site fills most inputs and you check them." },
        ],
      },
      {
        id: "m13l3", title: "Building the full underwriting, in order", minutes: 9, blocks: [
          { t: "p", text: "When a deal passes the screen, build the model in this order. Each step depends on the one before it, so going out of order is how errors creep in." },
          { t: "example", title: "Order of operations", rows: [["1. Rent roll: unit mix, occupancy, in place vs market, expirations", "Property › Rent roll"], ["2. Market: supply, demand, comps, concessions", "Market"], ["3. Revenue: market rent, loss to lease, vacancy, concessions, bad debt, other income", "Property › Rent & income"], ["4. Expenses: T12 and T3 side by side, then your underwritten numbers", "Financials › Operating statement"], ["5. Taxes after sale, real insurance quote, reserves", "Property › Expenses"], ["6. Business plan: renovations, lease up, capital items", "Property › Value add"], ["7. Debt: size the loan the lender's way, compare quotes", "Capital"], ["8. Growth, hold and exit cap above going in", "Financials › Projections"], ["9. Downside, base and upside cases", "Financials › Scenarios"], ["10. Investor returns after fees, if syndicated", "Capital › Investors"], ["11. Memo and recommendation", "Overview", true]] },
          { t: "p", text: "Every assumption should have a source you can point to: a document, a comp, a quote, or the scan. When someone asks \"why 5% vacancy?\" the answer should never be \"it's the default.\"" },
        ],
      },
      {
        id: "m13l4", title: "The mistakes interns make most", minutes: 8, blocks: [
          { t: "p", text: "These are the errors that most often make a deal look better than it is. Check every one before you hand in numbers." },
          { t: "example", title: "Common mistakes and the fix", rows: [["Using the OM's pro forma instead of the T12", "Start from actuals; pro forma is the seller's best case"], ["Keeping the seller's property tax bill", "Reset taxes to your purchase price"], ["Trusting a low insurance number", "Get a quote; use the state range"], ["Underwriting asking rent", "Use effective rent after concessions"], ["0% or 3% vacancy because the building is full today", "Use at least 5 to 7% economic vacancy"], ["Rent growth that ignores new supply", "Check the pipeline; slow years 1 and 2"], ["Exit cap equal to or below going in cap", "Exit at going in plus 5 to 10 bps per year"], ["Loan sized at a quoted LTV", "Size on DSCR and debt yield too"], ["No capital budget for roofs, parking, HVAC", "Add capital lines and reserves", true]] },
          { t: "p", text: "A good habit: after building the model, list every assumption that is better than the seller's actual numbers and write one sentence defending each. The operating statement's shaded lines show you where to start." },
        ],
      },
      {
        id: "m13l5", title: "Questions to ask the broker and the memo", minutes: 8, blocks: [
          { t: "p", text: "Brokers know more than the OM says. A short list of sharp questions saves days and signals that you're a serious buyer." },
          { t: "example", title: "Broker questions", rows: [["Why is the seller selling now?", "Loan maturity, fund ending, or a problem"], ["What's whisper price and how many offers do you expect?", "Sets your bid strategy"], ["Are concessions included in the T12 rent, and what's the trend?", "Effective rent"], ["What's been spent on capital in the last 3 years? Any roofs, plumbing, foundation work?", "Capital budget"], ["Any lease ups or new projects nearby that buyers are worried about?", "Supply risk"], ["Is the loan assumable? Prepayment terms?", "Financing"], ["Can we get the T3, a current rent roll and five years of loss runs?", "Diligence", true]] },
          { t: "p", text: "The memo is how you are judged. Keep it to two pages: the recommendation and price up top, then the deal snapshot, the business plan, the market (supply, demand, competition), the risks with how you'd handle each, the returns and sensitivities, and what diligence still has to confirm. Lead with the answer; support it with the numbers." },
          { t: "tip", text: "Overview › Investment memo (PDF) builds the two page memo from your model, including risk flags. Add your own thesis in the deal notes under Pipeline." },
        ],
      },
    ],
    quiz: [
      { q: "You have 30 minutes on a new deal. What should you produce?", options: ["A full 10 year model", "A max price that works and the one or two things that drive it", "A list of every unit", "A tax projection"], answer: 1, why: "The screen decides whether the deal deserves more time. A price and the key reasons is what the team needs." },
      { q: "Which should you start the expense underwriting from?", options: ["The OM pro forma", "The seller's T12 actuals, adjusted", "Last year's budget from a different property", "National averages only"], answer: 1, why: "Actuals are evidence; adjust them for taxes after sale, insurance quotes and your management plan." },
      { q: "The building is 98% leased today. What vacancy should you underwrite?", options: ["2%", "0%", "At least 5 to 7% economic vacancy", "Whatever the seller says"], answer: 2, why: "Turnover, bad debt, concessions and non revenue units always cost something; lenders use 5% or more." },
      { q: "Your model's going in cap is 5.6%. Which exit cap is most defensible for a 5 year hold?", options: ["5.0%", "5.6%", "6.0%", "4.5%"], answer: 2, why: "Going in plus 5 to 10 bps a year: 25 to 50 bps over five years puts the exit around 5.85% to 6.1%." },
      { q: "What belongs at the top of an investment memo?", options: ["Photos", "The recommendation and price", "The full rent roll", "The broker's contact info"], answer: 1, why: "Decision makers read the first lines most. Lead with the answer and support it below." },
    ],

  },
]

export const allLessons = COURSE.flatMap(m => m.lessons.map(l => ({ ...l, module: m })))
export const glossary = (() => {
  const map = new Map<string, string>()
  COURSE.forEach(m => m.lessons.forEach(l => l.blocks.forEach(b => { if (b.t === "terms") b.items.forEach(([k, v]) => { if (!map.has(k)) map.set(k, v) }) })))
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
})()
