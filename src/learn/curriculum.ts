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

export type DiagramKind = "flow" | "returns4" | "docs" | "waterfall" | "noi" | "capTriangle" | "capStack" | "dscr" | "cashflow" | "timeline" | "sensitivity"

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
    ],
    quiz: [
      { q: "A deal only hits its target when rents grow 5% a year and the exit cap is 1% below today. This deal is:", options: ["Very safe", "Fragile, it depends on optimistic assumptions", "Guaranteed", "Unaffected by the market"], answer: 1, why: "If it only works in the best case, small surprises can sink it." },
      { q: "Which is a red flag in a seller's numbers?", options: ["7% vacancy", "A 45% expense ratio", "No management fee on a self managed property", "A 1.35 DSCR"], answer: 2, why: "You'll pay for management. Leaving it out overstates NOI." },
      { q: "The deal misses targets at the asking price but works 8% lower. Best decision?", options: ["Pursue at asking", "Renegotiate", "Pass forever", "Ignore the numbers"], answer: 1, why: "Your underwriting gives you a price that works. Offer near it." },
      { q: "Due diligence happens:", options: ["Before looking at the OM", "After an offer is accepted, before closing", "After selling", "Only for loans"], answer: 1, why: "It's the verification period between agreement and closing." },
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
  },
]

export const allLessons = COURSE.flatMap(m => m.lessons.map(l => ({ ...l, module: m })))
export const glossary = (() => {
  const map = new Map<string, string>()
  COURSE.forEach(m => m.lessons.forEach(l => l.blocks.forEach(b => { if (b.t === "terms") b.items.forEach(([k, v]) => { if (!map.has(k)) map.set(k, v) }) })))
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
})()
