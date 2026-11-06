# Deal Screener

A multifamily underwriting website with the **Deal School** AI agent built in. Started as a Claude artifact (v0.1 to v0.3), moved to a real web app in v0.4, added document import in v0.5, accounts with two paths (Learn and Underwrite) in v0.6, and the Deal School course in v0.7.

## What it does

- **Import Documents**: upload a rent roll, T12, offering memo or loan quote (PDF, Excel, CSV or photo). Claude reads it, shows each value with its source, and you choose what to apply
- **Summary**: buy box verdict, max price that passes every test, sources and uses, returns, cash flow chart, deal memo
- **Property & Income**: unit mix, other income, vacancy
- **Expenses**: operating expenses and year 1 pro forma
- **Financing**: LTV, rate, amortization, interest only period, loan fees, loan schedule
- **Projections**: hold period, rent growth by year, expense, tax and insurance growth, exit cap, annual cash flow, sale, IRR and equity multiple
- **Scenarios**: downside, base and upside with probabilities and weighted IRR, plus sensitivity grids
- **Deal School AI**: Learner and Pro routes. The AI runs every number through the same model as the tabs, and can change inputs when asked
- **Buy Box & Deals**: screening minimums and saved deals (saved in the browser for now)

## Deal School course

`src/learn/curriculum.ts` holds the 10 modules, lessons and quizzes. Photos load live from Wikimedia Commons with author and license credit (free licenses only), and each photo links to a Google Images search. Diagrams are drawn in code in `src/learn/Diagrams.tsx`. The worked example numbers come from the site's own model.

## Project layout

```
src/lib/model.ts       All underwriting math. One source of truth for the tabs and the AI.
src/lib/agent.ts       Deal School tools and route rules
src/components/        Tabs, AI panel, chart, UI pieces
api/deal-school.ts     Serverless function for the Deal School AI (keeps the key off the browser)
api/extract.ts         Serverless function that reads uploaded documents
src/lib/extract.ts     What gets pulled from each document type and how it maps to inputs
```

## Accounts (Supabase)

1. Create a Supabase project, open SQL Editor, paste `supabase/schema.sql` and run it.
2. Also run `supabase/002_course_progress.sql` (course progress). It's included at the end of schema.sql for new setups.
3. In Vercel, add `VITE_SUPABASE_URL` (the project URL) and `VITE_SUPABASE_ANON_KEY` (the publishable key), then redeploy.
4. In Supabase, Authentication > URL Configuration: set Site URL to the live site.

Without these variables the site runs without logins and saves deals in the browser.

## Run it locally

```
npm install
npm run dev          # the site, without the AI
npx vercel dev       # the site and the AI, after adding .env.local (see .env.example)
```

## Deploy on Vercel

1. Sign in at vercel.com with GitHub and choose **Add New > Project**, then import `bbusboom/deal-screener`. Vercel detects Vite automatically.
2. Under **Environment Variables**, add `ANTHROPIC_API_KEY` (from console.anthropic.com). Optionally add `DEAL_SCHOOL_ACCESS_CODE` so only people with the code can use the AI.
3. Deploy. Every push to `main` redeploys.

Set a monthly spend limit in the Anthropic Console, since each AI request is billed.

## Roadmap

- Single family and commercial modes
- Market data and tax panel
- Web research for the Pro route

## Document import limits

- PDFs and images up to about 3 MB each (the hosting request limit). Split large offering memos or upload just the rent roll and T12 pages.
- Excel and CSV files are converted to text in the browser first, so size is rarely a problem.
- Nothing changes until you click Apply. Always check the values against the documents.
