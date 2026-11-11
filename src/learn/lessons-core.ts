// Lessons for Modules 1 to 10 (Levels 1 to 3). Written for someone starting from zero:
// every term is explained the first time it appears, every formula says what each part means,
// and later lessons point back to where a term was taught. Running example: Oak Ridge Apartments,
// 20 units, $2,000,000. Every number here is checked against the site's model.
import type { Block, Lesson } from "./curriculum"

const P = (titles: string[], query: string, caption: string, google: string): Block => ({ t: "photo", titles, query, caption, google })

export const CORE_LESSONS: Record<string, Lesson[]> = {
  /* ------------------------------------------------------------------ 1 */
  m1: [
    {
      id: "m1l1", title: "What is investment real estate?", minutes: 6, blocks: [
        { t: "p", text: "Investment real estate is property you buy to earn money, not to live in. You own the building, and other people pay you to use it. Those people are tenants, and the agreement that says how much they pay and for how long is called a lease." },
        { t: "p", text: "The money tenants pay is rent. Running the building costs money too: property taxes to the county, insurance, repairs, utilities, and someone to manage it all. Whatever is left after paying those costs belongs to the owner." },
        { t: "example", title: "A 10 unit building, one month", rows: [["Rent collected: 10 apartments × $1,000 each", "$10,000"], ["Costs to run the building that month", "−$4,000"], ["Left over for the owner", "$6,000", true]] },
        { t: "p", text: "That leftover amount is the whole point. A building is worth money because of the income it produces, the same way a small business is worth money because of its profits." },
        P(["File:Colvin Gardens Apartments, Buffalo, New York - 20220902.jpg", "File:Sepulveda Rose Apartments Pool.jpg"], "garden apartment complex", "A garden style apartment complex: several low buildings on one property, all owned by one investor.", "garden style apartment complex"),
        { t: "p", text: "Underwriting is the work of checking all of this before you buy. You figure out what the property will really earn, what it will really cost to run, what it's worth, and whether buying it at the asking price is a good decision. The rest of this course teaches you how to do each of those steps." },
        { t: "p", text: "Two kinds of people underwrite a deal. The investor is the buyer putting their own money in. The lender is the bank that loans part of the purchase price; it underwrites to make sure the property can pay the loan back. You'll learn how loans work in Module 7." },
        { t: "tip", text: "Think of a property like a small business. Rent is revenue, operating costs are expenses, and the building's value comes from the profit it produces." },
        { t: "terms", items: [["Tenant", "A person or business that rents space in the building."], ["Lease", "The contract between owner and tenant: how much rent, and for how long."], ["Underwriting", "Analyzing a property's income, costs, value and risks to decide whether, and at what price, to buy or lend."], ["Investor", "The person or company putting money into the deal, also called the buyer or sponsor."], ["Lender", "The bank or other source that loans part of the purchase price."]] },
      ],
    },
    {
      id: "m1l2", title: "The main property types", minutes: 6, blocks: [
        { t: "p", text: "Real estate comes in a few main types. Each one earns money in a different way, so each one is underwritten a little differently. In every type, a unit means one rentable space: one apartment, one store, or one office suite." },
        P(["File:Detached house, 850 N. Franklintown Road, Baltimore, MD 21216.jpg"], "detached single family house United States", "Single family rental: one house, one tenant. Valued mostly by comparing recent sales of similar homes.", "single family rental house"),
        P(["File:Sepulveda Rose Apartments Pool.jpg", "File:Colvin Gardens Apartments, Buffalo, New York - 20220902.jpg"], "apartment complex United States", "Multifamily: five or more apartments in one property. Valued by the income it produces.", "multifamily apartment complex"),
        P(["File:Shopping at the Rose, Oxnard (2010-11-28).jpeg"], "strip mall shopping center", "Retail: tenants are businesses on leases of several years. Value depends on who the tenants are and how long they've signed for.", "strip mall shopping center"),
        P(["File:Reston, Virginia (14311563988).jpg"], "suburban office building", "Office: long leases, and big costs to fill space when a tenant leaves.", "suburban office building"),
        P(["File:Distribution Centre, Whitwood Common Lane, 1979 - geograph.org.uk - 134787.jpg"], "distribution warehouse loading docks", "Industrial: warehouses and distribution centers, often leased to one tenant who pays most of the costs.", "industrial warehouse distribution center"),
        { t: "p", text: "This course focuses on apartments, which the industry calls multifamily. Apartments are where most people start: leases are short, usually one year, so you can see quickly what renters will pay, and there are many similar buildings to compare against." },
        { t: "p", text: "Buildings with five or more apartments are treated as commercial property. Lenders decide how much to lend based on the income the building produces, not on the buyer's personal salary. Buildings with two to four units are still financed like a house." },
        { t: "p", text: "In some property types the tenant pays most of the building's costs. A triple net lease, written NNN, means the tenant pays the property taxes, insurance and maintenance on top of rent. The owner's income is steadier, but the deal depends heavily on that one tenant staying." },
        { t: "p", text: "Buildings are also graded by age and quality. Class A is the newest and nicest, with the highest rents. Class B is older but well kept. Class C is older still, with lower rents and more repairs needed." },
        { t: "terms", items: [["Unit", "One rentable space: an apartment, a store or an office suite."], ["Multifamily", "A residential property with five or more apartments, financed and valued as a commercial property."], ["NNN lease", "Triple net: the tenant pays property taxes, insurance and maintenance on top of rent. Common in retail and industrial."], ["Asset class", "Grades like Class A (newest, nicest), B and C (older, cheaper, more fixes needed)."]] },
      ],
    },
    {
      id: "m1l3", title: "How investors make money", minutes: 7, blocks: [
        { t: "p", text: "An owner gets paid back in four ways. Only the first one puts money in your bank account every month, which is why underwriters care about it most." },
        { t: "diagram", d: "returns4" },
        { t: "p", text: "1. Cash flow. The money left after paying the costs of running the building and the monthly loan payment. In the 10 unit example from lesson 1, the building had $6,000 left each month before any loan. If the loan payment were $4,500 a month, the owner's cash flow would be $1,500 a month." },
        { t: "p", text: "2. Loan paydown. Most buyers borrow part of the price with a mortgage, a loan backed by the property. Each payment has two parts. Interest is the lender's fee for lending you the money. Principal is the part that actually reduces what you owe. Every principal dollar you pay raises your equity, the share of the property you own outright." },
        { t: "example", title: "One loan payment, split in two (simple example)", rows: [["Monthly loan payment", "$4,500"], ["Interest part: the lender's fee", "$3,800"], ["Principal part: you now owe this much less", "$700", true]] },
        { t: "p", text: "3. Appreciation. The property becoming worth more over time, usually because its income grows or buyers in the market are willing to pay more for buildings like it." },
        { t: "p", text: "4. Tax benefits. The tax code lets owners deduct part of the building's cost every year as depreciation, an allowance for wear and tear. It lowers the income you pay taxes on, even though you didn't spend that cash." },
        { t: "tip", text: "Beginners often count on appreciation to make a deal work. Professional underwriters want a deal that works on cash flow and treat appreciation as a bonus, because nobody controls the market." },
        { t: "terms", items: [["Cash flow", "Money left for the owner after the building's costs and the loan payment."], ["Mortgage", "A loan used to buy property, backed by the property itself."], ["Principal", "The part of a loan payment that reduces what you owe."], ["Interest", "The part of a loan payment that is the lender's fee."], ["Equity", "The share of the property you own outright: its value minus what you still owe."], ["Depreciation", "A yearly tax deduction for wear on the building. It isn't a cash cost."]] },
      ],
    },
  ],
  /* ------------------------------------------------------------------ 2 */
  m2: [
    {
      id: "m2l1", title: "The underwriting roadmap", minutes: 6, blocks: [
        { t: "p", text: "Every underwriting follows the same eight steps in the same order. Each step uses the answer from the step before it, which is why this course is built in the same order." },
        { t: "diagram", d: "flow" },
        { t: "example", title: "The eight steps, and where you'll learn each one", rows: [["1. Read the documents: the seller's marketing package, the list of tenants, and last year's income and costs", "Module 2"], ["2. Income: what the property collects", "Module 3"], ["3. Expenses: what it costs to run", "Module 4"], ["4. NOI: income minus expenses, the property's profit before any loan", "Module 5"], ["5. Value: what that profit is worth", "Module 6"], ["6. Debt: how much a lender will lend, and what it costs", "Module 7"], ["7. Returns: what the investor actually earns", "Module 8"], ["8. Risk and the call: what could go wrong, then buy, renegotiate or pass", "Module 9"]] },
        { t: "p", text: "NOI stands for net operating income. It's the single most important number in underwriting, and you'll calculate it step by step in Module 5. For now, think of it as the property's yearly profit before any loan payment." },
        { t: "tip", text: "If income or expenses are wrong, NOI is wrong, and so is every step after it. That's why most of an underwriter's time goes into steps 2 and 3." },
      ],
    },
    {
      id: "m2l2", title: "The offering memo and the rent roll", minutes: 7, blocks: [
        { t: "p", text: "When a building is for sale, the owner, called the seller, usually hires a broker: a salesperson who markets the property and collects offers. The broker sends interested buyers a package of documents. Three of them matter most. This lesson covers the first two, and the next lesson covers the third." },
        { t: "diagram", d: "docs" },
        { t: "p", text: "The offering memorandum, or OM, is the sales brochure. It has photos, a description of the property and neighborhood, the asking price, and the broker's projection of future income and costs. That projection is called a pro forma. Remember who wrote it: the broker is paid to sell, so the pro forma shows the seller's best case." },
        { t: "p", text: "The rent roll is a list of every unit in the building, one row per apartment. Each row shows the unit number, the floor plan, the tenant's name, the rent they pay now, what similar units rent for today, and when their lease started and ends. The rent roll tells you what the property earns today." },
        { t: "example", title: "Three rows from a rent roll", rows: [["Unit 101: 1 bed, tenant Smith, lease ends March 2027", "$950 a month"], ["Unit 102: 1 bed, vacant", "$0"], ["Unit 201: 2 bed, tenant Lopez, lease ends August 2026", "$1,150 a month"]] },
        { t: "p", text: "Even from three rows you can see two things an underwriter checks right away: which units are empty, and whether tenants pay different amounts for the same floor plan. You'll use both in Module 3." },
        { t: "terms", items: [["Broker", "The salesperson the seller hires to market the property and collect offers."], ["Offering memorandum (OM)", "The broker's marketing package: photos, description, asking price and projections."], ["Pro forma", "A projection of future income and costs, as opposed to actual history."], ["Rent roll", "A list of every unit with its rent, tenant and lease dates."]] },
      ],
    },
    {
      id: "m2l3", title: "The T12, and checking one document against another", minutes: 6, blocks: [
        { t: "p", text: "The T12, short for trailing twelve months, is the property's actual income and costs for the last twelve months, usually shown month by month. Trailing means looking back. Unlike the pro forma, the T12 is history: what really came in and what was really spent." },
        { t: "example", title: "A T12, added up for the year", rows: [["Rent collected", "$228,000"], ["Other income: laundry, pet fees, parking", "$9,000"], ["Property taxes", "−$18,500"], ["Insurance", "−$9,800"], ["Repairs", "−$11,200"], ["Utilities", "−$13,500"], ["Payroll", "−$10,000"], ["Admin and marketing", "−$6,000"], ["Management fee (the owner runs it themselves)", "$0"], ["What was left for the owner", "$168,000", true]] },
        { t: "p", text: "The best habit in underwriting is to check one document against another. Compare the rents in the OM's pro forma with what the rent roll shows tenants actually pay. Compare the costs in the pro forma with the T12. Wherever the pro forma looks better than the real documents, ask why." },
        { t: "tip", text: "In this T12 the management fee is $0 because the owner runs the building themselves. A new owner will pay someone to manage it, so that $0 won't last. You'll see this trap again in Module 4." },
        { t: "terms", items: [["T12", "Trailing twelve months: the property's actual income and costs for the last year."]] },
      ],
    },
  ],
  /* ------------------------------------------------------------------ 3 */
  m3: [
    {
      id: "m3l1", title: "Gross potential rent", minutes: 9, blocks: [
        { t: "p", text: "Income is the first number you build, and everything else depends on it. The starting point is gross potential rent, written GPR: the rent the property would collect in a year if every unit were rented all year at market rent." },
        { t: "p", text: "Market rent is what a unit would rent for today if it were empty and you advertised it. It can differ from what current tenants pay, called in place rent, because many tenants signed their leases months ago. You find market rent by looking at what similar apartments nearby are renting for. The steps are at the end of this lesson." },
        { t: "formula", name: "Gross potential rent (GPR)", f: "Number of units × market rent per month × 12", parts: [["Number of units", "How many apartments of this floor plan the building has."], ["Market rent per month", "What one of those apartments would rent for today."], ["× 12", "Turns one month into a full year, since there are 12 months in a year."]], say: "Take one month of rent for one apartment, multiply by the number of apartments, then by 12 to get a full year." },
        { t: "example", title: "Oak Ridge Apartments: 20 units, one floor plan", rows: [["Number of units", "20"], ["Market rent per month", "$1,000"], ["Step 1: one month for the whole building, 20 × $1,000", "$20,000"], ["Step 2: a full year, $20,000 × 12", "$240,000", true]] },
        { t: "p", text: "Most buildings have more than one floor plan, so you do the math for each floor plan separately and add the results." },
        { t: "example", title: "A building with two floor plans", rows: [["10 one bed units × $900 × 12", "$108,000"], ["10 two bed units × $1,100 × 12", "$132,000"], ["Gross potential rent: $108,000 + $132,000", "$240,000", true]] },
        { t: "p", text: "Why call it potential? Because you'll never collect all of it. Some units will be empty and some tenants won't pay. The next lesson takes those out." },
        { t: "p", text: "One more number to know: loss to lease is the gap between market rent and in place rent. If market rent is $1,000 but a tenant's lease says $950, that unit has $50 a month of loss to lease, or $600 a year. It goes away as old leases end and new ones are signed at market rent." },
        { t: "p", text: "So which rent do you actually count? Gross potential rent always uses market rent, so it shows what the building could earn. Then, if some tenants pay less, you subtract the loss to lease, so you only count rent that's really coming in. In Oak Ridge every tenant already pays market rent, so there's nothing to subtract. Here's what it looks like when they don't." },
        { t: "example", title: "If 5 of Oak Ridge's tenants paid $950 instead of $1,000", rows: [["Gross potential rent at market", "$240,000"], ["Loss to lease: 5 units × $50 × 12", "−$3,000"], ["Rent the leases actually call for", "$237,000", true]] },
        { t: "find", what: "Market rent", steps: [["Start with the rent roll", "Look at the leases signed in the building over the last two or three months. What new tenants just agreed to pay is the best evidence of market rent for that floor plan."], ["Find three to five rent comps", "A rent comp, short for comparable, is a nearby building of similar age, size and condition. Search a listing site such as Apartments.com or Zillow for buildings within a mile or two, and write down the asking rent for the same floor plan."], ["Compare like with like", "Match bedrooms, bathrooms and size. If the sizes differ, compare rent per square foot: the monthly rent divided by the unit's square feet."], ["Call the leasing office", "Listings show asking rent. Call as a renter would and ask about specials, such as a free month. The rent after specials is the real number."], ["Take the middle, not the top", "If the comps run from $950 to $1,060, use a number near the middle unless your building is clearly nicer or rougher than they are."]], note: "Professionals also use paid databases such as CoStar and Yardi Matrix, and the broker's rent comps in the offering memo. Check the broker's comps yourself. The broker chose the ones that support the price." },
        { t: "terms", items: [["Market rent", "What a unit would rent for today if it were empty and leased to a new tenant."], ["In place rent", "What current tenants are actually paying under their leases."], ["Loss to lease", "The gap between market rent and in place rent."]] },
      ],
    },
    {
      id: "m3l2", title: "Vacancy and credit loss", minutes: 8, blocks: [
        { t: "p", text: "Nobody collects 100% of gross potential rent. Two things eat into it." },
        { t: "p", text: "Vacancy is rent lost because a unit is empty. Even a full building loses some, because tenants move out and the unit sits empty for a few weeks while it's cleaned, repaired and rented again. Credit loss, also called bad debt, is rent a tenant owes but never pays." },
        { t: "p", text: "Underwriters combine the two into one percentage of GPR. A percentage is a share of 100: 6% means 6 out of every 100 dollars. To turn a percentage into dollars, first change it to a decimal by dividing by 100, so 6% becomes 0.06. Then multiply." },
        { t: "formula", name: "Vacancy and credit loss", f: "Gross potential rent × vacancy and credit loss rate", parts: [["Gross potential rent", "Rent if every unit were rented all year at market rent (lesson 1)."], ["Vacancy and credit loss rate", "The share of that rent you expect to lose, written as a decimal. Usually 5% to 8% (0.05 to 0.08) for a stable apartment building."]], say: "Take the full potential rent and set aside the slice you expect to lose to empty units and unpaid rent." },
        { t: "example", title: "Oak Ridge Apartments", rows: [["Gross potential rent (lesson 1)", "$240,000"], ["Vacancy and credit loss rate: 6% = 0.06", "0.06"], ["Vacancy and credit loss: $240,000 × 0.06", "$14,400", true], ["Rent you expect to collect: $240,000 − $14,400", "$225,600"]] },
        { t: "tip", text: "Use 5% to 8% for a stable apartment building even if it's 100% full today. Using 0% because every unit is rented right now is one of the most common beginner mistakes, because tenants always move out eventually." },
        { t: "find", what: "Vacancy and credit loss rate", steps: [["The building's own history", "On the T12 (Module 2), compare the rent actually collected with the gross potential rent, month by month. The gap is what the building really lost. A year of history tells you more than how full it is today."], ["Today's rent roll", "Count the empty units and divide by the total number of units. That's today's vacancy. Also count the tenants who are behind on rent."], ["The area", "Brokerage firms such as CBRE, Marcus & Millichap and Berkadia publish free market reports with the average apartment vacancy for each city and neighborhood. The Census Bureau publishes rental vacancy rates for large metro areas too."], ["Use the worse number, with a floor", "Take the higher of the building's history and the area average, and don't go below 5%. Many lenders use 5% as their minimum no matter how full the building is."]] },
        { t: "p", text: "Sometimes owners offer a deal to fill units, like the first month free. That discount is called a concession. It also lowers what you collect. Module 12 covers concessions in depth." },
        { t: "terms", items: [["Vacancy loss", "Rent lost to empty units."], ["Credit loss", "Rent owed but never collected, also called bad debt."], ["Concessions", "Discounts like a free month to attract tenants; they reduce collected rent."]] },
      ],
    },
    {
      id: "m3l3", title: "Other income and effective gross income", minutes: 6, blocks: [
        { t: "p", text: "Rent isn't the only money a building brings in. Other income is everything else tenants pay: parking, pet fees, laundry machines, application fees, storage, and charges for utilities. When an owner bills tenants for their share of water or trash using a formula, it's called RUBS, short for ratio utility billing system." },
        { t: "p", text: "Other income is usually small, often $25 to $75 per unit per month, but it adds up across a whole building and a whole year." },
        { t: "example", title: "Oak Ridge other income", rows: [["Other income per unit per month", "$40"], ["Step 1: the whole building for a month, $40 × 20 units", "$800"], ["Step 2: a full year, $800 × 12", "$9,600", true]] },
        { t: "p", text: "Now you have all three pieces of income. Put them together and you get effective gross income, written EGI: what you expect the building to actually collect in a year." },
        { t: "formula", name: "Effective gross income (EGI)", f: "Gross potential rent − vacancy and credit loss + other income", parts: [["Gross potential rent", "Full rent if every unit were rented all year (lesson 1)."], ["Vacancy and credit loss", "The rent you expect to lose to empty units and unpaid rent (lesson 2)."], ["Other income", "Fees and charges besides rent (this lesson)."]], say: "Start with the most the rent could be, take out what you won't collect, then add the extra fees. What's left is what you expect to actually collect in a year." },
        { t: "p", text: "If some tenants pay less than market rent, subtract the loss to lease right after gross potential rent, before vacancy (lesson 1). Oak Ridge has none, so the example below skips it." },
        { t: "diagram", d: "waterfall" },
        { t: "example", title: "Oak Ridge Apartments, step by step", rows: [["Gross potential rent", "$240,000"], ["Minus vacancy and credit loss", "−$14,400"], ["Rent you expect to collect", "$225,600"], ["Plus other income", "+$9,600"], ["Effective gross income (EGI)", "$235,200", true]] },
        { t: "tip", text: "EGI is the starting point for everything that follows. In Module 4 you'll subtract the costs of running the building from it." },
      ],
    },
  ],
  /* ------------------------------------------------------------------ 4 */
  m4: [
    {
      id: "m4l1", title: "What it costs to run a building", minutes: 8, blocks: [
        { t: "p", text: "Operating expenses are the regular costs of running the property day to day. They're the second half of the profit math: EGI is what comes in (Module 3), operating expenses are what goes out." },
        { t: "p", text: "Three things are not operating expenses, even though they cost money: the mortgage payment, which is a cost of how you paid for the building (Module 7); big one time projects like a new roof (Module 5); and depreciation, which is a tax deduction, not cash you spend (Module 1)." },
        { t: "p", text: "Here is each line you'll see on an apartment building, with what it pays for." },
        { t: "example", title: "Oak Ridge Apartments, one year of operating expenses", rows: [["Property taxes: paid to the county, based on the property's value", "$26,000"], ["Insurance: protects against fire, storms and lawsuits", "$12,000"], ["Utilities: water, sewer, trash and common area electric the owner pays", "$14,000"], ["Repairs and maintenance: fixing leaks, appliances and everyday wear", "$12,000"], ["Payroll: on site staff, like a maintenance technician", "$10,000"], ["Admin and marketing: office costs, software, advertising", "$6,000"], ["Management fee: 5% of EGI, $235,200 × 0.05", "$11,760"], ["Replacement reserves: $300 per unit × 20 units", "$6,000"], ["Total operating expenses", "$97,760", true]] },
        { t: "p", text: "Two lines need a closer look. The management fee is what a property management company charges to collect rent, lease units and handle repairs. It's quoted as a percentage of EGI, usually 3% to 8%. To get dollars, multiply EGI by the rate as a decimal: $235,200 × 0.05 = $11,760." },
        { t: "p", text: "Replacement reserves are money set aside every year for big things that wear out eventually: roofs, heating and air conditioning systems, parking lots. Underwriters budget a fixed amount per unit, often $250 to $350 a year, so a $40,000 roof in year 8 isn't a surprise." },
        { t: "p", text: "A note for later: not everyone puts reserves in operating expenses. Brokers usually leave them out, which makes NOI look a little higher. Lenders put them in. This course puts them in from the start, the way a lender would, and Module 11 shows how to compare your number with a broker's." },
        { t: "p", text: "Expenses are also sorted into two groups. Fixed expenses, like taxes and insurance, barely change whether the building is full or half empty. Controllable expenses, like repairs, payroll and marketing, are the ones a good manager can bring down." },
        { t: "terms", items: [["Operating expenses", "The regular yearly costs of running the property. Not the mortgage, big projects or depreciation."], ["Fixed expenses", "Costs that don't change much with occupancy, like taxes and insurance."], ["Controllable expenses", "Costs management can influence, like repairs, payroll and marketing."], ["Management fee", "What a property manager charges, usually 3% to 8% of EGI."], ["Replacement reserves", "Money set aside each year for big future replacements like roofs and HVAC."]] },
      ],
    },
    {
      id: "m4l2", title: "Three traps in the seller's expenses", minutes: 7, blocks: [
        { t: "p", text: "Sellers want their building to look as profitable as possible, and expenses are the easiest place to make that happen. Three traps catch beginners again and again. Each one makes the seller's costs look lower than yours will be." },
        { t: "p", text: "Trap 1: property taxes go up after you buy. The county taxes a property based on its assessed value, the county's estimate of what it's worth. Many counties update that value after a sale, using the price the new buyer paid. The seller may have owned the building for 15 years at a much lower assessed value, so their tax bill is lower than yours will be." },
        { t: "example", title: "Resetting taxes to your price", rows: [["Seller's tax bill, based on an old value", "$18,000"], ["Your purchase price", "$2,000,000"], ["County tax rate: 1.3% of value = 0.013", "0.013"], ["Your tax bill: $2,000,000 × 0.013", "$26,000", true], ["Extra cost every year: $26,000 − $18,000", "$8,000"]] },
        { t: "p", text: "Trap 2: no management fee. An owner who runs the building themselves often shows $0 for management, like the T12 in Module 2. But you will either hire a manager or spend your own time, and your time isn't free. Budget a fee anyway, usually 3% to 8% of EGI." },
        { t: "p", text: "Trap 3: old insurance numbers. Insurance prices have risen quickly in many states. A seller's policy may have been bought years ago, or may cover less than a lender requires. Get a real quote rather than copying the seller's number." },
        { t: "tip", text: "When you fix all three, the seller's profit usually shrinks. That isn't bad news. It's the real number, and it keeps you from overpaying." },
        { t: "terms", items: [["Assessed value", "The county's estimate of a property's value, used to calculate its tax bill."], ["Reassessment", "The county updating a property's taxable value, often after a sale."]] },
      ],
    },
    {
      id: "m4l3", title: "Checking expenses: expense ratio and cost per unit", minutes: 7, blocks: [
        { t: "p", text: "After you list every expense, step back and ask: does the total look reasonable for a building like this? Two quick checks answer that question." },
        { t: "formula", name: "Expense ratio", f: "Operating expenses ÷ EGI", parts: [["Operating expenses", "The total yearly cost of running the building (lesson 1)."], ["EGI", "Effective gross income: what the building actually collects in a year (Module 3)."], ["÷", "Divide. The answer is a decimal, like 0.416. Multiply by 100 to read it as a percent, 41.6%."]], say: "Out of every dollar the building collects, how many cents go to running it?" },
        { t: "example", title: "Oak Ridge expense ratio, step by step", rows: [["Operating expenses (lesson 1)", "$97,760"], ["EGI (Module 3)", "$235,200"], ["Step 1: divide, $97,760 ÷ $235,200", "0.416"], ["Step 2: as a percent, 0.416 × 100", "41.6%", true], ["In words", "About 42 cents of every dollar collected pays the bills"]] },
        { t: "p", text: "Apartments usually run between 35% and 50%. Older buildings, buildings where the owner pays the utilities, and buildings in high tax states sit toward the high end. If a seller's numbers show 28%, something is probably missing, often one of the three traps from the last lesson. If they show 60%, look for a one time cost, like a big repair, that you wouldn't pay every year." },
        { t: "formula", name: "Expenses per unit", f: "Operating expenses ÷ number of units", parts: [["Operating expenses", "The total yearly cost of running the building."], ["Number of units", "How many apartments it has."]], say: "What it costs, on average, to run one apartment for a year." },
        { t: "example", title: "Oak Ridge expenses per unit", rows: [["Per year: $97,760 ÷ 20 units", "$4,888", true], ["Per month: $4,888 ÷ 12", "$407"]] },
        { t: "p", text: "Cost per unit lets you compare buildings of different sizes. If similar buildings nearby cost $5,000 to $6,000 per unit a year to run and the seller shows $3,200, ask what's missing." },
      ],
    },
  ],
  /* ------------------------------------------------------------------ 5 */
  m5: [
    {
      id: "m5l1", title: "Calculating NOI", minutes: 6, blocks: [
        { t: "p", text: "Net operating income, written NOI, is the property's yearly profit from running it: what it collects minus what it costs to run. It doesn't include any loan payment. You already have both halves: EGI from Module 3 and operating expenses from Module 4." },
        { t: "formula", name: "Net operating income (NOI)", f: "EGI − operating expenses", parts: [["EGI", "Effective gross income: rent after vacancy and credit loss, plus other income (Module 3)."], ["Operating expenses", "The yearly cost of running the building: taxes, insurance, repairs, management and the rest (Module 4)."], ["−", "Subtract: take the costs out of what comes in."]], say: "What's left each year after the building pays its own bills, before any loan." },
        { t: "diagram", d: "noi" },
        { t: "example", title: "Oak Ridge Apartments, from rent to NOI", rows: [["Gross potential rent (Module 3)", "$240,000"], ["Minus vacancy and credit loss, 6%", "−$14,400"], ["Plus other income", "+$9,600"], ["EGI", "$235,200"], ["Minus operating expenses (Module 4)", "−$97,760"], ["NOI", "$137,440", true]] },
        { t: "p", text: "Why leave out the loan? Two buyers could purchase the same building, one with all cash and one with a big loan. Their monthly costs would be very different, but the building itself is exactly the same. NOI measures the building on its own, so everyone can compare buildings fairly." },
        { t: "calc", c: "noi" },
      ],
    },
    {
      id: "m5l2", title: "What NOI leaves out", minutes: 6, blocks: [
        { t: "p", text: "Some real costs are kept out of NOI on purpose. They still matter; they just come later in the analysis. Underwriters call this putting them below the line, the line being NOI." },
        { t: "example", title: "Above and below the line", rows: [["Income and operating expenses", "In NOI (above the line)"], ["Debt service: the yearly loan payments (Module 7)", "Below the line"], ["Capital expenditures: big one time projects like a new roof", "Below the line"], ["Depreciation: a tax deduction, not cash (Module 1)", "Not in NOI"], ["Income taxes: depend on the owner, not the building", "Not in NOI"]] },
        { t: "p", text: "Capital expenditures, or CapEx, are large purchases that last many years: a new roof, a repaved parking lot, or renovated kitchens. They're kept out of NOI because they don't happen every year, and including a $40,000 roof in one year would make that year's profit look strange. Replacement reserves (Module 4) are the steady yearly amount set aside for them, and reserves do stay in operating expenses." },
        { t: "tip", text: "Every dollar of NOI matters more than it looks. In Module 6 you'll see that buildings are priced as a multiple of their NOI, so saving $10,000 a year in expenses can add well over $100,000 to what the building is worth." },
        { t: "terms", items: [["CapEx", "Capital expenditures: big one time improvements or replacements, kept below the NOI line."], ["Above the line", "Items included in NOI."], ["Below the line", "Items after NOI, such as debt service and CapEx."]] },
      ],
    },
    {
      id: "m5l3", title: "Which NOI? The seller's, yours and the pro forma", minutes: 7, blocks: [
        { t: "p", text: "Once you know how to calculate NOI, you'll notice every deal has more than one. There are three you'll see on almost every deal, and mixing them up is one of the most expensive beginner mistakes." },
        { t: "p", text: "1. The seller's NOI comes from the T12 (Module 2): what the building actually earned last year, as the seller ran it. It's real history, but it carries the seller's situation, like an old tax bill or no management fee." },
        { t: "p", text: "2. Your NOI, also called underwritten or adjusted NOI, is the seller's NOI corrected for what will change when you own it: taxes reset to your price, a real management fee, a real insurance quote, and reserves (Module 4). This is your best estimate of year one." },
        { t: "p", text: "3. The pro forma NOI comes from the broker's offering memo (Module 2): a projection of what the building could earn if everything goes to plan, like rents rising and empty units filling. It's the seller's best case." },
        { t: "example", title: "The building from the Module 2 T12, three ways", rows: [["Seller's NOI from the T12", "$168,000"], ["Taxes reset to your $2,000,000 price: $26,000 instead of $18,500", "−$7,500"], ["Insurance quote $12,000 instead of $9,800", "−$2,200"], ["Management fee, 5% of $237,000 collected", "−$11,850"], ["Reserves, $300 × 20 units", "−$6,000"], ["Your NOI", "$140,450", true], ["Broker's pro forma NOI (rents up 8%, no management fee)", "$185,000"]] },
        { t: "p", text: "Same building, three numbers: $140,450, $168,000 and $185,000. At a 6.5% cap rate (Module 6), that's the difference between a building worth about $2.16 million and one worth about $2.85 million." },
        { t: "p", text: "The rule: start from the seller's actual T12, adjust it into your NOI, and price the deal on your NOI. Treat the pro forma as a list of ideas to check, not a number to pay for. If you can prove a pro forma idea, like rents that really can rise, it can earn its way into your model later as growth." },
        { t: "terms", items: [["Underwritten NOI", "Your own year one NOI: the seller's actual numbers adjusted for what changes when you buy."], ["Pro forma NOI", "The broker's projected NOI if the plan goes right; the seller's best case."]] },
      ],
    },
  ],
  /* ------------------------------------------------------------------ 6 */
  m6: [
    {
      id: "m6l1", title: "The cap rate", minutes: 10, blocks: [
        { t: "p", text: "Now that you know a building's NOI, the next question is what it's worth. The main tool is the capitalization rate, almost always shortened to cap rate." },
        { t: "formula", name: "Cap rate", f: "NOI ÷ price", parts: [["NOI", "The building's yearly profit before any loan (Module 5)."], ["Price", "What you pay for the building, or what it's worth."], ["÷", "Divide, then multiply by 100 to read the answer as a percent."]], say: "If you bought the building with all cash, what percent of your money would come back each year as profit?" },
        { t: "example", title: "Oak Ridge cap rate, step by step", rows: [["NOI (Module 5)", "$137,440"], ["Price", "$2,000,000"], ["Step 1: divide, $137,440 ÷ $2,000,000", "0.0687"], ["Step 2: as a percent, 0.0687 × 100", "6.87%", true], ["In words", "About 6.9 cents of profit a year for every dollar of price"]] },
        { t: "p", text: "Think of it like a savings account. A $2,000,000 account paying 6.87% interest would pay you $137,440 a year. The cap rate tells you what a building pays you each year, before any loan, for every dollar you pay for it." },
        { t: "p", text: "Cap rates come from the market. Look at recent sales of similar buildings in the same area. If buyers have been paying prices that work out to about 6.5% of NOI, then 6.5% is the market cap rate there. Buyers accept lower cap rates, meaning they pay higher prices, for newer buildings in strong areas, and want higher cap rates for older buildings or riskier areas." },
        { t: "find", what: "Market cap rate", steps: [["Recent sales nearby", "Find three to five similar buildings that sold in the last year or so. For each one, divide its NOI by its sale price. In most states the sale price is public through the county assessor or recorder. The NOI usually comes from the broker who sold it."], ["Ask brokers", "Brokers who sell apartments in the area know what buyers are paying. Ask two or three what cap rate buildings like yours are selling at. Expect the broker selling your deal to quote the low end, because a lower cap rate means a higher price."], ["Market reports", "CBRE, Marcus & Millichap, Berkadia and Newmark publish cap rate ranges by city and building quality. Treat them as a range, not an exact number."], ["Adjust for your building", "If yours is older, smaller or rougher than the ones that sold, use a higher cap rate. If it's newer or in a better spot, use a lower one."], ["Check which NOI was used", "Ask whether a quoted cap rate uses last year's actual NOI or a projected one, and whether property taxes were updated to the sale price (Module 4). A cap rate built on projected NOI makes a sale look better than it was."]], note: "Paid databases such as CoStar and MSCI Real Capital Analytics list sales and cap rates. Most firms subscribe to at least one." },
        { t: "p", text: "If you know the NOI and the market cap rate, you can flip the formula around to find what the building is worth." },
        { t: "formula", name: "Value from NOI", f: "NOI ÷ cap rate", parts: [["NOI", "The building's yearly profit before any loan."], ["Cap rate", "The market cap rate, written as a decimal: 6.5% becomes 0.065."]], say: "The price the market would pay for this much yearly profit." },
        { t: "example", title: "What Oak Ridge is worth at the market cap rate", rows: [["NOI", "$137,440"], ["Market cap rate: 6.5% = 0.065", "0.065"], ["Value: $137,440 ÷ 0.065", "$2,114,462", true], ["Compared with the $2,000,000 asking price", "About $114,000 above the price"]] },
        { t: "diagram", d: "capTriangle" },
        { t: "p", text: "Lower cap rate, higher price. Because you divide by the cap rate, a smaller cap rate gives a bigger value. At a 6% cap, $137,440 of NOI is worth $2,290,667. At a 7% cap, it's worth $1,963,429. Same building, same income, nearly $330,000 apart." },
        { t: "p", text: "This is why Module 5 said every dollar of NOI matters. At a 6.5% cap, $10,000 more NOI is worth $10,000 ÷ 0.065, about $153,800 more value." },
        { t: "calc", c: "cap" },
        { t: "terms", items: [["Market cap rate", "The cap rate buyers have been paying for similar buildings nearby."]] },
      ],
    },
    {
      id: "m6l2", title: "Price per unit and gross rent multiplier", minutes: 6, blocks: [
        { t: "p", text: "The cap rate is the main way to value a building, but two quick checks help you compare a price against other sales." },
        { t: "formula", name: "Price per unit", f: "Price ÷ number of units", parts: [["Price", "What you'd pay for the whole building."], ["Number of units", "How many apartments it has."]], say: "What you're paying for each apartment." },
        { t: "example", title: "Oak Ridge price per unit", rows: [["$2,000,000 ÷ 20 units", "$100,000", true]] },
        { t: "p", text: "If similar buildings nearby sold for $85,000 to $95,000 per unit, paying $100,000 needs a reason: a newer building, a better location, or room to raise rents." },
        { t: "formula", name: "Gross rent multiplier (GRM)", f: "Price ÷ gross potential rent", parts: [["Price", "What you'd pay for the whole building."], ["Gross potential rent", "Yearly rent if every unit were rented at market rent (Module 3)."]], say: "How many years of full rent it would take to add up to the price." },
        { t: "example", title: "Oak Ridge GRM", rows: [["$2,000,000 ÷ $240,000", "8.33", true], ["In words", "The price equals about 8.3 years of full rent"]] },
        { t: "p", text: "GRM ignores expenses, so it's only a rough check. Two buildings with the same rent can have very different costs. Use it to spot prices that look way off, then do the full NOI and cap rate math." },
        { t: "p", text: "Both checks rely on comps, short for comparable sales: recent sales of similar buildings nearby. A good comp is close in age, size, quality and location, and sold recently." },
        P(["File:Suburbia by David Shankbone.jpg"], "suburban neighborhood aerial", "Comps come from the same market: similar age, size and location.", "comparable property sales neighborhood"),
        { t: "terms", items: [["Comps", "Recent sales of similar properties used to judge value."], ["Going in cap rate", "The cap rate when you buy, using year one NOI and your price."], ["Exit cap rate", "The cap rate you assume when you sell later (Module 8)."]] },
      ],
    },
  ],
  /* ------------------------------------------------------------------ 7 */
  m7: [
    {
      id: "m7l1", title: "How a loan works", minutes: 11, blocks: [
        { t: "p", text: "Most buyers don't pay all cash. They borrow most of the price from a lender and put in the rest themselves. The cash the buyer puts in is called equity. The loan plus the equity always add up to the price." },
        { t: "diagram", d: "capStack" },
        { t: "formula", name: "Loan to value (LTV)", f: "Loan amount ÷ price", parts: [["Loan amount", "How much the lender lends."], ["Price", "What the building costs, or what an appraiser says it's worth."]], say: "What share of the price is borrowed." },
        { t: "example", title: "Oak Ridge financing", rows: [["Price", "$2,000,000"], ["Lender allows 70% loan to value: $2,000,000 × 0.70", "$1,400,000"], ["Equity, the buyer's down payment: $2,000,000 − $1,400,000", "$600,000", true]] },
        { t: "p", text: "The loan has to be paid back with interest. The interest rate is the yearly cost of borrowing, as a percent of what you owe. At 6.5%, owing $1,400,000 costs about $91,000 in interest in the first year ($1,400,000 × 0.065)." },
        { t: "p", text: "Amortization is how the loan gets paid off. With a 30 year amortization, the monthly payment is set so the loan is completely paid off after 30 years of equal payments. Early on, most of each payment is interest and only a small part is principal, the part that lowers what you owe. Over the years the split shifts toward principal." },
        { t: "example", title: "Oak Ridge loan: the first monthly payment", rows: [["Loan: $1,400,000 at 6.5%, 30 year amortization", ""], ["Monthly payment", "$8,849"], ["Interest part: $1,400,000 × 0.065 ÷ 12", "$7,583"], ["Principal part: $8,849 − $7,583", "$1,266", true]] },
        { t: "p", text: "The monthly payment comes from a standard loan formula that every financial calculator and spreadsheet has built in (in Excel it's =PMT). You don't need to work it out by hand. You do need to know the three things that go into it: the loan amount, the interest rate and the amortization." },
        { t: "formula", name: "Annual debt service", f: "Monthly loan payment × 12", parts: [["Monthly loan payment", "Principal plus interest, paid every month."], ["× 12", "Turns it into a yearly number so it lines up with NOI, which is also yearly."]], say: "Everything you pay the lender in a year." },
        { t: "example", title: "Oak Ridge annual debt service", rows: [["$8,849 × 12", "$106,187", true]] },
        { t: "p", text: "Don't mix up amortization with the loan's term. The term is how long you have the loan before the whole remaining balance is due. The amortization only sets the size of the payment. Most apartment loans have a term shorter than their amortization: a 10 year term with 30 year amortization is common. You make payments as if you had 30 years, but at year 10 you still owe most of the loan, and you have to pay it off in one lump, called a balloon payment. Owners usually do that by selling the building or taking out a new loan, called refinancing." },
        { t: "example", title: "Oak Ridge loan with a 10 year term", rows: [["Loan: $1,400,000 at 6.5%, 30 year amortization", ""], ["Monthly payment, same as above", "$8,849"], ["Payments made by the end of the term: 10 years × 12", "120 of 360"], ["Still owed when the term ends, the balloon", "$1,186,866", true]] },
        { t: "p", text: "Some loans start with interest only years: you pay just the interest part, so the payment is lower, but you don't pay down what you owe. When that period ends, the payment jumps up to include principal." },
        { t: "terms", items: [["Debt service", "The total loan payments in a year, principal plus interest."], ["Amortization", "Paying a loan down over time with regular payments; also the number of years those payments are spread over."], ["Interest only", "Paying only interest for a period, so the balance doesn't fall."], ["Loan term", "How long you have the loan before the remaining balance is due. Often shorter than the amortization."], ["Balloon payment", "The remaining loan balance, paid in one lump when the term ends."]] },
      ],
    },
    {
      id: "m7l2", title: "DSCR: can the building pay its loan?", minutes: 7, blocks: [
        { t: "p", text: "A lender's first question is simple: does the building earn enough to make its loan payments, with room to spare? The number that answers it is the debt service coverage ratio, written DSCR." },
        { t: "formula", name: "Debt service coverage ratio (DSCR)", f: "NOI ÷ annual debt service", parts: [["NOI", "The building's yearly profit before any loan (Module 5)."], ["Annual debt service", "All the loan payments for a year (last lesson)."], ["x", "DSCR is written with an x, like 1.29x. The x means times: the profit covers the payments 1.29 times."]], say: "How many times over the building's profit covers its loan payments." },
        { t: "diagram", d: "dscr" },
        { t: "example", title: "Oak Ridge DSCR, step by step", rows: [["NOI (Module 5)", "$137,440"], ["Annual debt service (last lesson)", "$106,187"], ["DSCR: $137,440 ÷ $106,187", "1.29x", true], ["Left after the loan: $137,440 − $106,187", "$31,253"]] },
        { t: "p", text: "Read DSCR like this. At exactly 1.00x, every dollar of profit goes to the lender and nothing is left over. Below 1.00x, the building can't cover its own loan and the owner has to add cash every month. Everything above 1.00x is the cushion." },
        { t: "p", text: "Lenders want a cushion because NOI can fall: a few tenants move out, taxes rise, a big repair hits. Most require a DSCR of at least 1.20x to 1.35x. At 1.25x, the building could lose a fifth of its NOI and still just make its payments." },
        { t: "calc", c: "dscr" },
      ],
    },
    {
      id: "m7l3", title: "Debt yield, and how big a loan you can get", minutes: 8, blocks: [
        { t: "p", text: "Lenders run more than one test, and they lend the smallest amount that passes all of them. You've seen loan to value and DSCR. The third common test is debt yield." },
        { t: "formula", name: "Debt yield", f: "NOI ÷ loan amount", parts: [["NOI", "The building's yearly profit before any loan."], ["Loan amount", "How much the lender would lend."]], say: "If the lender had to take the building back, what percent of its money would the building's profit return each year?" },
        { t: "example", title: "Oak Ridge debt yield", rows: [["$137,440 ÷ $1,400,000", "0.0982"], ["As a percent", "9.82%", true]] },
        { t: "p", text: "Lenders often want a debt yield of 8% to 10%. Unlike DSCR, debt yield doesn't depend on the interest rate, so it's a steady check even when rates move." },
        { t: "p", text: "Now size the Oak Ridge loan all three ways. Say the lender allows up to 70% loan to value, needs a DSCR of at least 1.25x, and needs a debt yield of at least 9%." },
        { t: "p", text: "For the DSCR test, work backward. First find the most the yearly payments can be: NOI ÷ 1.25. Then find how big a loan has payments that size, using the loan constant: the yearly payment for every $1 borrowed." },
        { t: "example", title: "Test 2, sizing by DSCR", rows: [["Step 1: most debt service allowed, $137,440 ÷ 1.25", "$109,952"], ["Step 2: loan constant at 6.5%, 30 years: $106,187 ÷ $1,400,000", "0.07585"], ["Step 3: largest loan, $109,952 ÷ 0.07585", "about $1,449,600", true]] },
        { t: "example", title: "Test 3, sizing by debt yield", rows: [["Largest loan: $137,440 ÷ 0.09", "$1,527,111", true]] },
        { t: "example", title: "The three tests side by side", rows: [["Test 1, loan to value: $2,000,000 × 0.70", "$1,400,000"], ["Test 2, DSCR at 1.25x", "$1,449,600"], ["Test 3, debt yield at 9%", "$1,527,111"], ["Loan you get: the smallest of the three", "$1,400,000", true]] },
        { t: "p", text: "Here loan to value is the tightest test, so it sets the loan. When interest rates are higher, the DSCR test usually becomes the tightest instead. Beginners who only check loan to value are surprised when the lender offers less, and they need more cash to close." },
        { t: "terms", items: [["Loan constant", "The yearly loan payments for every dollar borrowed. About 7.585% for a 6.5%, 30 year loan."], ["Binding test", "The lender's test that gives the smallest loan; it sets your loan size."]] },
      ],
    },
    {
      id: "m7l4", title: "Leverage: why borrow at all?", minutes: 8, blocks: [
        { t: "p", text: "Using borrowed money to buy something is called leverage. A loan means you put in less of your own cash, but you still get all of the building's growth. Leverage can raise your return, or lower it, depending on what the loan costs compared with what the building earns." },
        { t: "p", text: "Compare buying Oak Ridge with all cash against buying it with the 70% loan from lesson 1. The numbers for the next five years come from Module 8, which walks through them step by step." },
        { t: "example", title: "Oak Ridge, all cash vs with the loan", rows: [["All cash: cash you put in, $2,000,000 price + $40,000 closing costs", "$2,040,000"], ["All cash: year one cash flow (no loan, so it's all of NOI)", "$137,440"], ["All cash: year one return, $137,440 ÷ $2,040,000", "6.74%"], ["All cash: return over 5 years, counting the sale (IRR, Module 8)", "8.69%", true], ["With the loan: cash you put in, $600,000 down + $40,000", "$640,000"], ["With the loan: year one cash flow, $137,440 − $106,187", "$31,253"], ["With the loan: year one return, $31,253 ÷ $640,000", "4.88%"], ["With the loan: return over 5 years, counting the sale", "12.83%", true]] },
        { t: "p", text: "Two different things happened. In year one, the loan made the return worse: 4.88% instead of 6.74%. That's because the loan costs 7.585% a year per dollar borrowed (the loan constant from lesson 3), while the building only earns 6.87% per dollar of price (the cap rate from Module 6). Every borrowed dollar costs more than it brings in this year." },
        { t: "p", text: "Over five years, the loan made the return better: 12.83% instead of 8.69%. NOI grows, the tenants' rent pays down the loan, and the building sells for more than you paid. All of those gains land on $640,000 of your money instead of $2,040,000." },
        { t: "formula", name: "Positive or negative leverage", f: "Compare the cap rate with the loan constant", parts: [["Cap rate", "What the building earns each year per dollar of price (Module 6)."], ["Loan constant", "What the loan costs each year per dollar borrowed, interest plus principal (lesson 3)."]], say: "If the cap rate is higher, each borrowed dollar earns more than it costs, and borrowing raises your return right away. If the loan constant is higher, borrowing lowers your return today, and you're counting on growth and the sale to make up for it." },
        { t: "example", title: "Same deal with a cheaper 5% loan", rows: [["Loan constant at 5%, 30 years", "6.44%"], ["Cap rate", "6.87%"], ["Annual debt service on $1,400,000", "$90,186"], ["Year one cash flow: $137,440 − $90,186", "$47,254"], ["Year one return: $47,254 ÷ $640,000", "7.38%", true], ["In words", "Higher than the 6.74% all cash return: positive leverage"]] },
        { t: "tip", text: "Leverage cuts both ways. The loan payment stays the same even if NOI falls, so a bad year hurts a borrower much more than an all cash buyer. That's why lenders insist on a DSCR cushion (lesson 2)." },
        { t: "terms", items: [["Leverage", "Using borrowed money to buy an investment, so your own cash controls a bigger asset."], ["Positive leverage", "When the cap rate is above the loan constant, so borrowing raises your cash return."], ["Negative leverage", "When the loan constant is above the cap rate, so borrowing lowers your cash return today."]] },
      ],
    },
  ],
  /* ------------------------------------------------------------------ 8 */
  m8: [
    {
      id: "m8l1", title: "Cash flow", minutes: 5, blocks: [
        { t: "p", text: "NOI is what the building earns. Cash flow is what the owner actually keeps after paying the lender. It's the return from Module 1 that shows up in your bank account." },
        { t: "diagram", d: "cashflow" },
        { t: "formula", name: "Cash flow", f: "NOI − annual debt service", parts: [["NOI", "The building's yearly profit before any loan (Module 5)."], ["Annual debt service", "All the loan payments for the year (Module 7)."]], say: "What's left for the owner after the building pays its bills and its loan." },
        { t: "example", title: "Oak Ridge cash flow, year 1", rows: [["NOI", "$137,440"], ["Minus annual debt service", "−$106,187"], ["Cash flow for the year", "$31,253", true], ["Per month: $31,253 ÷ 12", "$2,604"]] },
        { t: "p", text: "Cash flow can be negative. If the loan payments are bigger than NOI, the owner has to add money every month. That's the same as a DSCR below 1.00x (Module 7)." },
        { t: "p", text: "In a full model you'd also subtract any big projects planned that year, the CapEx from Module 5, to get the cash the owner really receives." },
      ],
    },
    {
      id: "m8l2", title: "Cash on cash return", minutes: 6, blocks: [
        { t: "p", text: "A $31,253 cash flow sounds good, but is it good for how much money you put in? Cash on cash return answers that." },
        { t: "p", text: "First, add up the cash you invested. It's more than the down payment. Buying a building also comes with closing costs: legal fees, title insurance, the lender's fees, inspections and appraisals, usually 1% to 3% of the price." },
        { t: "example", title: "Cash invested in Oak Ridge", rows: [["Down payment, the equity from Module 7", "$600,000"], ["Closing costs, 2% of the price: $2,000,000 × 0.02", "$40,000"], ["Total cash invested", "$640,000", true]] },
        { t: "formula", name: "Cash on cash return", f: "Annual cash flow ÷ total cash invested", parts: [["Annual cash flow", "What you keep in a year after the loan (last lesson)."], ["Total cash invested", "Your down payment plus closing costs."]], say: "For every dollar you put in, how many cents come back to you this year?" },
        { t: "example", title: "Oak Ridge cash on cash, step by step", rows: [["Annual cash flow", "$31,253"], ["Total cash invested", "$640,000"], ["Step 1: divide, $31,253 ÷ $640,000", "0.0488"], ["Step 2: as a percent", "4.88%", true], ["In words", "About 4.9 cents a year for every dollar invested"]] },
        { t: "p", text: "Many apartment investors want 6% to 8% or more in year one. Compare it with what you could earn elsewhere with less work and less risk. Cash on cash only looks at one year, though. The last two lessons of this module look at the whole time you own the building." },
        { t: "calc", c: "coc" },
        { t: "terms", items: [["Closing costs", "One time costs to complete a purchase: legal, title, lender fees and inspections."]] },
      ],
    },
    {
      id: "m8l3", title: "Break even occupancy", minutes: 5, blocks: [
        { t: "p", text: "How empty could the building get before the owner starts losing money? Break even occupancy answers that." },
        { t: "p", text: "Occupancy is the share of units that are rented. 95% occupancy in a 20 unit building means 19 units are rented." },
        { t: "formula", name: "Break even occupancy", f: "(Operating expenses + annual debt service) ÷ (GPR + other income)", parts: [["Operating expenses", "The yearly cost of running the building (Module 4)."], ["Annual debt service", "The yearly loan payments (Module 7)."], ["GPR + other income", "The most the building could collect if every unit were rented all year (Module 3)."]], say: "The share of the building's full potential income you need just to pay all the bills and the loan." },
        { t: "example", title: "Oak Ridge break even, step by step", rows: [["Step 1, everything you must pay: $97,760 + $106,187", "$203,947"], ["Step 2, the most you could collect: $240,000 + $9,600", "$249,600"], ["Step 3: $203,947 ÷ $249,600", "0.817"], ["Break even occupancy", "81.7%", true]] },
        { t: "p", text: "Oak Ridge breaks even at about 81.7% occupancy, between 16 and 17 of its 20 units. Below that, the owner adds cash every month. The lower the break even, the safer the deal; many lenders and investors like to see it under 85%." },
      ],
    },
    {
      id: "m8l4", title: "Selling the building: the exit", minutes: 9, blocks: [
        { t: "p", text: "Most investors don't own forever. They plan a hold period, often 5 to 10 years, then sell. The sale is called the exit, and it's often where most of the profit comes from." },
        { t: "p", text: "To estimate the sale price, use the value formula from Module 6 (NOI ÷ cap rate), but with future numbers. A buyer in year 6 will look at the NOI they'll earn in their first year of owning it, so you use your year 6 NOI. The cap rate you assume for that future sale is called the exit cap rate." },
        { t: "p", text: "First, grow NOI. If rents and expenses both grow 3% a year, NOI grows 3% a year too. Growing 3% means multiplying by 1.03 each year." },
        { t: "example", title: "Growing Oak Ridge NOI 3% a year", rows: [["Year 1 NOI", "$137,440"], ["Year 2: $137,440 × 1.03", "$141,563"], ["Year 3: $141,563 × 1.03", "$145,810"], ["Year 4: $145,810 × 1.03", "$150,184"], ["Year 5: $150,184 × 1.03", "$154,690"], ["Year 6: $154,690 × 1.03", "$159,331", true]] },
        { t: "formula", name: "Sale price", f: "NOI in the year after you sell ÷ exit cap rate", parts: [["NOI in the year after you sell", "The yearly profit the next owner will start with. For a 5 year hold, that's year 6 NOI."], ["Exit cap rate", "The cap rate you assume buyers will pay when you sell, as a decimal."]], say: "Value the building the way the next buyer will." },
        { t: "example", title: "Oak Ridge sale price after 5 years", rows: [["Year 6 NOI", "$159,331"], ["Exit cap rate: 7% = 0.07", "0.07"], ["Sale price: $159,331 ÷ 0.07", "$2,276,152", true]] },
        { t: "p", text: "Before you can work out what you walk away with, you need the loan balance: what you still owe after five years. Each monthly payment pays a little principal (Module 7), so the balance shrinks a bit every year. Spreadsheets track this with an amortization schedule, a list of every payment split into interest and principal." },
        { t: "example", title: "Oak Ridge loan balance, end of each year", rows: [["Start: the loan", "$1,400,000"], ["End of year 1 (paid down $15,648)", "$1,384,352"], ["End of year 2", "$1,367,656"], ["End of year 3", "$1,349,841"], ["End of year 4", "$1,330,834"], ["End of year 5", "$1,310,554", true]] },
        { t: "p", text: "Notice the principal paid each year gets a little bigger: as you owe less, less of each payment goes to interest. Over five years, the tenants' rent paid down almost $90,000 of the loan." },
        { t: "formula", name: "Net sale proceeds", f: "Sale price − selling costs − loan balance", parts: [["Sale price", "What the buyer pays."], ["Selling costs", "Broker commission, legal and closing costs, often about 2% of the price."], ["Loan balance", "What you still owe the lender. It gets paid off out of the sale."]], say: "The cash you walk away with after the sale." },
        { t: "example", title: "What Oak Ridge's owner walks away with", rows: [["Sale price", "$2,276,152"], ["Selling costs, 2%: $2,276,152 × 0.02", "−$45,523"], ["Loan balance after 5 years of payments", "−$1,310,554"], ["Net sale proceeds", "$920,075", true]] },
        { t: "find", what: "Growth rates and the exit cap rate", steps: [["Rent growth: look back", "Compare the rents on today's rent roll with a year ago, and read how rents in the area moved over the last 5 to 10 years in broker market reports. Long run rent growth is usually around 3% a year. Be suspicious of a forecast well above that."], ["Rent growth: look ahead", "Check how many new apartments are being built nearby (Module 12). A wave of new buildings usually means flat rents for a year or two, so many underwriters use 0% to 2% in the first years and the long run rate after that."], ["Expense growth", "Use 2% to 3% a year for most costs, about the pace of inflation. Handle two lines separately: get a real insurance quote, and set property taxes from your purchase price (Module 4)."], ["Exit cap rate", "Start from today's market cap rate (Module 6) and add a little because the building will be older when you sell. A common rule is 0.10 percentage points for each year you hold, so about 0.50 points on a 5 year hold. Oak Ridge follows it: a 6.5% market cap rate today, a 7% exit cap."]] },
        { t: "tip", text: "Set the exit cap at or above the cap rate you bought at. The building will be older when you sell. Here the going in cap was 6.87% and the exit cap is 7%. Assuming a lower exit cap is an easy way to make a weak deal look great." },
        { t: "terms", items: [["Hold period", "How many years you plan to own the property."], ["Exit cap rate", "The cap rate you assume a buyer will pay when you sell."], ["Net sale proceeds", "Sale price minus selling costs and the loan payoff."]] },
      ],
    },
    {
      id: "m8l5", title: "Equity multiple and IRR", minutes: 7, blocks: [
        { t: "p", text: "Now you can see the whole investment: the cash you put in at the start, the cash flow each year, and the sale proceeds at the end." },
        { t: "diagram", d: "timeline" },
        { t: "formula", name: "Equity multiple", f: "Total cash you get back ÷ total cash invested", parts: [["Total cash you get back", "Every year's cash flow added up, plus the net sale proceeds."], ["Total cash invested", "Your down payment plus closing costs (lesson 2)."]], say: "How many dollars come back for every dollar you put in." },
        { t: "p", text: "First, list every year's cash flow. NOI grows 3% a year (last lesson), but the loan payment stays the same, so cash flow grows faster than NOI." },
        { t: "example", title: "Oak Ridge cash flow, year by year", rows: [["Year 1: $137,440 NOI − $106,187 debt service", "$31,253"], ["Year 2: $141,563 − $106,187", "$35,376"], ["Year 3: $145,810 − $106,187", "$39,623"], ["Year 4: $150,184 − $106,187", "$43,997"], ["Year 5: $154,690 − $106,187", "$48,503"], ["Total, years 1 to 5", "$198,752", true]] },
        { t: "example", title: "Oak Ridge equity multiple", rows: [["Cash flow, years 1 to 5", "$198,752"], ["Net sale proceeds (last lesson)", "$920,075"], ["Total cash back: $198,752 + $920,075", "$1,118,827"], ["Total cash invested", "$640,000"], ["Equity multiple: $1,118,827 ÷ $640,000", "1.75x", true]] },
        { t: "p", text: "1.75x means every $1 you invested came back as $1.75: your dollar plus 75 cents of profit. But it doesn't say how long that took. Getting 1.75x back in 3 years is much better than getting it back in 15." },
        { t: "p", text: "That's what IRR, the internal rate of return, adds. IRR is a yearly return on your money that accounts for timing, because money you get sooner is worth more than money you get later: you can use it or reinvest it sooner, and it carries less risk. This idea is called the time value of money." },
        { t: "p", text: "IRR is too complex to work out by hand, so every spreadsheet has it built in (in Excel it's =IRR). You list the cash for each year: negative when money goes in, positive when it comes back. For Oak Ridge that's −$640,000 at the start, then five years of cash flow, with the sale proceeds added to year 5. The answer is 12.83% a year." },
        { t: "example", title: "Oak Ridge, 5 year hold", rows: [["Cash invested at the start", "−$640,000"], ["Cash flow, years 1 to 5", "$198,752"], ["Net sale proceeds in year 5", "$920,075"], ["IRR", "12.83%", true], ["Equity multiple", "1.75x", true]] },
        { t: "p", text: "One way to picture IRR: it's the interest rate a savings account would need to pay to give you back the same cash at the same times. Here's how much timing matters." },
        { t: "example", title: "Two investments, both 1.75x on $640,000", rows: [["A: all $1,120,000 comes back after 3 years", "IRR about 20.5%"], ["B: all $1,120,000 comes back after 10 years", "IRR about 5.8%"], ["Same equity multiple, very different deal", "A is far better", true]] },
        { t: "p", text: "Both turned $640,000 into $1,120,000, but A did it in less than a third of the time, so you could reinvest the money sooner. That's what IRR captures and the equity multiple doesn't. Many apartment investors target an IRR of 12% to 18%, and look at both numbers together." },
        { t: "terms", items: [["IRR", "Internal rate of return: the yearly return over the whole hold, accounting for when the cash comes back."], ["Equity multiple", "Total cash returned ÷ cash invested."], ["Time value of money", "A dollar today is worth more than a dollar later, because you can use or invest it in the meantime."]] },
      ],
    },
  ],
  /* ------------------------------------------------------------------ 9 */
  m9: [
    {
      id: "m9l1", title: "Stress testing", minutes: 7, blocks: [
        { t: "p", text: "Every number in your model is a guess about the future: rent, vacancy, expenses, interest rates, the exit cap. Your best guess for all of them together is called the base case. Stress testing asks what happens if some of those guesses turn out worse." },
        { t: "p", text: "Change one assumption at a time, and watch the numbers you care about most, like DSCR and cash flow." },
        { t: "example", title: "Oak Ridge: vacancy rises from 6% to 10%", rows: [["Vacancy and credit loss at 10%: $240,000 × 0.10", "−$24,000"], ["That's this much more lost rent than at 6%", "−$9,600"], ["The management fee (5% of EGI) falls a little with it: $9,600 × 0.05", "+$480"], ["New NOI: $137,440 − $9,600 + $480", "$128,320"], ["New DSCR: $128,320 ÷ $106,187", "1.21x", true], ["In words", "Still above 1.20x, but barely"]] },
        { t: "p", text: "Common stress tests: vacancy up 3 to 5 points, rents flat for two years, expenses up 10%, the interest rate up 1 point, the exit cap up half a point. If the deal still works in most of them, it's sturdy. If one small change breaks it, it's fragile." },
        { t: "diagram", d: "sensitivity" },
        { t: "p", text: "A sensitivity table changes two assumptions at once and shows the result for every combination. In the table above, each row is a different exit cap and each column a different rent growth rate; each cell is the IRR you'd get. Green cells meet your target and red cells don't. If only the most optimistic corner is green, the deal is fragile." },
        { t: "tip", text: "On the Underwrite side of this site, the Scenarios tab builds these tables for you." },
        { t: "terms", items: [["Base case", "Your most likely set of assumptions."], ["Stress test", "Running the deal under bad but realistic scenarios."], ["Sensitivity table", "A grid showing the result when two assumptions change at once."]] },
      ],
    },
    {
      id: "m9l2", title: "Red flags in a deal", minutes: 6, blocks: [
        { t: "p", text: "These are the signs that a seller's numbers are too good to be true. Each one points back to something you've already learned." },
        { t: "example", title: "Red flags, and why each one matters", rows: [["0% vacancy", "Tenants always move out eventually (Module 3)"], ["No management fee", "You'll pay one (Module 4)"], ["The seller's old tax bill", "Taxes reset after a sale (Module 4)"], ["Expense ratio under 35%", "Costs are probably missing (Module 4)"], ["Rents well above nearby buildings", "Hard to keep tenants at that rent (Module 3)"], ["DSCR under 1.25x", "Little cushion to cover the loan (Module 7)"], ["Exit cap below the going in cap", "Assumes buyers will pay more for an older building (Module 8)"]] },
        { t: "p", text: "One red flag doesn't kill a deal. It tells you where to dig and what to ask the seller. Several together usually mean the asking price is built on numbers you can't trust." },
      ],
    },
    {
      id: "m9l4", title: "Making the call", minutes: 6, blocks: [
        { t: "p", text: "Underwriting ends with a decision, and there are three choices." },
        { t: "p", text: "Pursue: the deal meets your targets with realistic numbers. You make an offer near the asking price." },
        { t: "p", text: "Renegotiate: the deal doesn't work at the asking price, but would at a lower one. Your model tells you that price. Lower the price in your model until cash on cash, DSCR and IRR hit your targets. That number becomes your offer, and your red flags become your reasons." },
        { t: "p", text: "Pass: no reasonable price makes it work, or the risks are too big. A quick, clear pass saves your team time, and that's a good result too." },
        { t: "example", title: "Oak Ridge against an investor's targets", rows: [["Cash on cash 4.88%, target 6%", "Misses"], ["DSCR 1.29x, target 1.25x", "Passes"], ["IRR 12.83%, target 12%", "Passes"], ["Decision", "Renegotiate", true]] },
        { t: "p", text: "If the seller accepts your offer, a due diligence period begins, usually 30 to 60 days before the purchase closes. That's when you check everything for real: inspect the building, read every lease against the rent roll, get a real insurance quote and tax estimate, and study new apartments being built nearby. If you find problems, you can renegotiate again or walk away." },
        { t: "terms", items: [["Due diligence", "The checks done after an offer is accepted and before closing."], ["Closing", "The day the purchase is completed and ownership changes hands."]] },
      ],
    },
  ],
  /* ------------------------------------------------------------------ 10 */
  m10: [
    {
      id: "m10l1", title: "Putting it all together", minutes: 8, blocks: [
        { t: "p", text: "You now know every step of a standard underwriting. Here's the whole chain on one property, one line at a time. Each line uses a formula from an earlier module, so if any line feels unclear, go back to that module." },
        { t: "example", title: "Oak Ridge Apartments, start to finish", rows: [["Gross potential rent: 20 units × $1,000 × 12 (Module 3)", "$240,000"], ["Vacancy and credit loss: $240,000 × 0.06 (Module 3)", "−$14,400"], ["Other income: $40 × 20 units × 12 (Module 3)", "+$9,600"], ["Effective gross income (Module 3)", "$235,200"], ["Operating expenses (Module 4)", "−$97,760"], ["NOI: $235,200 − $97,760 (Module 5)", "$137,440", true], ["Cap rate: $137,440 ÷ $2,000,000 (Module 6)", "6.87%"], ["Loan: $2,000,000 × 0.70 (Module 7)", "$1,400,000"], ["Annual debt service: $8,849 × 12 (Module 7)", "$106,187"], ["DSCR: $137,440 ÷ $106,187 (Module 7)", "1.29x"], ["Cash flow: $137,440 − $106,187 (Module 8)", "$31,253"], ["Cash on cash: $31,253 ÷ $640,000 (Module 8)", "4.88%"], ["5 year IRR (Module 8)", "12.83%"], ["Equity multiple (Module 8)", "1.75x", true]] },
        { t: "p", text: "Verdict: solid NOI and a healthy DSCR, but year one cash on cash of 4.88% is below the 6% many investors want. Following Module 9, the call is to renegotiate the price, or look for realistic ways to raise NOI." },
        { t: "tip", text: "Next, open Practice a deal to underwrite Maple Court yourself, step by step, with the math shown at every step. Then try your own property or upload real documents." },
      ],
    },
  ],
}
