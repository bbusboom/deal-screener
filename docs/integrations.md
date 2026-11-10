# Underwriting Desk integrations plan

Researched November 2026. Goal: make Underwriting Desk a tool people actually use, both for learning (Learn path) and for real deals (Underwrite path), without paying for expensive data before people want it.

How to read this: **Tier 1** is free and worth building next. **Tier 2** costs a little and mostly helps the Underwrite path. **Tier 3** costs real money and waits until users ask for it. Prices are as published at the time of research and should be checked again before signing up.

## Tier 1: free, build next

| Tool | What it gives the site | Path | Cost | Notes |
|---|---|---|---|---|
| FRED (St. Louis Fed) | Live SOFR, 10-yr Treasury, Fed funds, mortgage rates | Both | Free key | Default the interest rate to today's market and teach "rate = index + spread" with live numbers |
| Census ACS API | Median rent, median income, population, renter share, home value by ZIP / county / tract | Both | Free key (500 calls/day without one) | Market card: rent-to-income, is the area growing |
| BLS Public Data API v2 | Jobs, unemployment, wages by metro and county | Both | Free key (500 queries/day, 50 series per call) | "Are jobs growing here?" for the market lesson and Pro market tab |
| HUD USER API | Fair Market Rents by bedroom count, income limits | Both | Free token | Sanity check: is the rent roll above or below HUD FMR? Great teaching moment |
| FEMA National Flood Hazard Layer | Flood zone (A, AE, X...) at an address | Pro, and a lesson | Free public service | Flag a deal in a flood zone (insurance cost), screening only, not a certified determination |
| Zillow Research (ZORI, ZHVI) | Rent and home-value trends by metro, county, city, ZIP | Both | Free CSV download, no API | Pull monthly into a static file; ground the rent-growth assumption in real history |
| PostHog | Product analytics, session replay, error tracking | Site itself | Free up to 1M events, 5K recordings / month | See where learners quit a lesson and which features get used. This is how we learn "what people want" before pricing |
| SheetJS (already in the app) | Export a deal to Excel | Both | Free | Industry runs on Excel; let users take their model with them |

Suggested first build (v0.8, "Market check"): a card on each deal and a new course lesson that pulls FRED, Census, BLS, HUD FMR, FEMA flood and ZORI for the property's ZIP and explains each number in plain words. All of it is free.

## Tier 2: cheap, mostly for the Underwrite path

| Tool | What it gives | Cost (as published) | Notes |
|---|---|---|---|
| RentCast API | Rent estimates and rent comps per address, 140M+ property records | Free developer tier, then paid per-call plans | Has MCP servers, so the AI agent can call it directly. DealCheck uses RentCast estimates |
| Rentometer | Rent comps near an address | API on the Pro plan (~$29/mo) | Alternative to RentCast for rent checks |
| Claude web search tool | Agent can look up local news, tax changes, employers | $10 per 1,000 searches plus tokens | Pro route only, with a per-user daily cap |
| Walk Score API | Walk, Transit and Bike Score | Contact Walk Score for a key; branding rules apply | Nice for the market card; lower priority |

## Tier 3: real money, wait for demand

| Tool | What it gives | Notes |
|---|---|---|
| ATTOM | Property tax assessments, sales history, sale comps, AVM, hazard data | Free trial key; has an MCP server. Best single source for "what will taxes be after I buy" |
| Regrid | Parcel boundaries, zoning, ownership | Self-serve monthly plans priced per parcel record |
| HelloData | Multifamily rent comps and **expense benchmarks** from 25,000+ properties | Sales demo. Expense benchmarks would power "is this opex normal?" for both paths |

## AI and agents

- The Underwriting Desk agent already uses tools. Each data source above can become one more tool (get_rates, get_market, get_flood_zone, get_rent_comps), so the AI answers with live numbers instead of guesses.
- Ready-made MCP servers exist for RentCast, ATTOM, FRED, Census and HUD FMR. Useful for testing in Claude before writing our own API routes.
- Later: publish Underwriting Desk itself as an MCP server, so people can underwrite from inside Claude.
- Document extraction: keep our own Claude-based extractor. The paid tools (Cactus, Archer, RedIQ, Clik.ai, QuickData, Cash Flow Portal parser) show the bar to meet: show every extracted number, let the user edit it, and audit the rent roll against the T12.

## Competitors to learn from (not integrate)

- **Courses:** A.CRE Accelerator (~$597, 16 case-based courses), Break Into CRE, REFM's REFAI certification, Wall Street Prep (~$499). All are video plus Excel. Underwriting Desk's edge: interactive lessons, an AI tutor under every lesson, and practice on real deals.
- **Software:** Cash Flow Portal, DealCheck, Archer, Cactus, RedIQ. Their common thread is "rent roll and T12 to a model in minutes".

## Ideas still to research

Certificates for finishing the course, email reminders (streaks, "your deal changed"), a property map (Google Maps or Mapbox), flashcards with spaced repetition, a community or Discord for learners.

## Keys to protect

Every new key (FRED, Census, BLS, HUD, RentCast...) goes in Vercel environment variables and is used only from /api routes, never in VITE_ variables or the browser.
