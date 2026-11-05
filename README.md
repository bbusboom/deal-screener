# Deal Screener

A multifamily underwriting website with the **Deal School** AI agent built in. Started as a Claude artifact (v0.1 to v0.3) and moved to a real web app in v0.4.

## What it does

- **Summary**: buy box verdict, max price that passes every test, sources and uses, returns, cash flow chart, deal memo
- **Property & Income**: unit mix, other income, vacancy
- **Expenses**: operating expenses and year 1 pro forma
- **Financing**: LTV, rate, amortization, interest only period, loan fees, loan schedule
- **Projections**: hold period, rent growth by year, expense, tax and insurance growth, exit cap, annual cash flow, sale, IRR and equity multiple
- **Scenarios**: downside, base and upside with probabilities and weighted IRR, plus sensitivity grids
- **Deal School AI**: Learner and Pro routes. The AI runs every number through the same model as the tabs, and can change inputs when asked
- **Buy Box & Deals**: screening minimums and saved deals (saved in the browser for now)

## Project layout

```
src/lib/model.ts       All underwriting math. One source of truth for the tabs and the AI.
src/lib/agent.ts       Deal School tools and route rules
src/components/        Tabs, AI panel, chart, UI pieces
api/deal-school.ts     Serverless function that calls the Anthropic API (keeps the key off the browser)
```

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

- Accounts and saved deals in a database (Supabase)
- Single family and commercial modes
- Market data and tax panel
- Web research for the Pro route
