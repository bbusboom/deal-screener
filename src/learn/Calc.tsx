// Small try-it-yourself calculators inside lessons.
import { useState } from "react"
import { NumInput } from "../components/ui"
import { monthlyPmt } from "../lib/model"

const usd = (n: number) => isFinite(n) ? (n < 0 ? "−$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US") : "—"
const pct = (n: number) => isFinite(n) ? (n * 100).toFixed(2) + "%" : "—"

function Box({ title, children, result }: { title: string; children: React.ReactNode; result: React.ReactNode }) {
  return (
    <div className="my-5 rounded-xl border-2 border-dashed border-brand-100 bg-brand-50/40 p-4">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-600">Try it: {title}</div>
      <div className="grid gap-3 sm:grid-cols-3">{children}</div>
      <div className="mt-3 rounded-lg bg-white px-4 py-3 text-sm shadow-card">{result}</div>
    </div>
  )
}
const F = ({ label, v, set, step = 1 }: { label: string; v: number; set: (n: number) => void; step?: number }) =>
  <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">{label}<NumInput value={v} step={step} onChange={set} /></label>

export default function Calc({ c }: { c: "cap" | "dscr" | "coc" | "noi" }) {
  const [a, setA] = useState(c === "noi" ? 235200 : c === "cap" ? 137440 : c === "dscr" ? 137440 : 137440)
  const [b, setB] = useState(c === "noi" ? 97760 : c === "cap" ? 2000000 : c === "dscr" ? 1400000 : 1400000)
  const [r, setR] = useState(c === "cap" ? 6.5 : 6.5)
  const [eq, setEq] = useState(640000)

  if (c === "noi") return (
    <Box title="NOI" result={<>NOI = {usd(a)} − {usd(b)} = <b className="num text-brand-600">{usd(a - b)}</b>. Expense ratio {pct(b / a)}.</>}>
      <F label="Effective gross income ($)" v={a} set={setA} step={1000} /><F label="Operating expenses ($)" v={b} set={setB} step={1000} />
    </Box>)
  if (c === "cap") return (
    <Box title="cap rate and value" result={<>Cap rate = {usd(a)} ÷ {usd(b)} = <b className="num text-brand-600">{pct(a / b)}</b>. At a {r}% market cap, the property is worth <b className="num text-brand-600">{usd(a / (r / 100))}</b> ({usd(a / (r / 100) - b)} vs this price).</>}>
      <F label="NOI ($)" v={a} set={setA} step={1000} /><F label="Price ($)" v={b} set={setB} step={10000} /><F label="Market cap rate (%)" v={r} set={setR} step={0.1} />
    </Box>)
  const ds = monthlyPmt(b, r, 30) * 12
  if (c === "dscr") return (
    <Box title="DSCR" result={<>Annual debt service on {usd(b)} at {r}% over 30 years = {usd(ds)}. DSCR = {usd(a)} ÷ {usd(ds)} = <b className={`num ${a / ds >= 1.25 ? "text-pass-600" : "text-fail-600"}`}>{(a / ds).toFixed(2)}x</b> {a / ds >= 1.25 ? "(passes a 1.25 test)" : "(below a 1.25 test)"}.</>}>
      <F label="NOI ($)" v={a} set={setA} step={1000} /><F label="Loan amount ($)" v={b} set={setB} step={10000} /><F label="Interest rate (%)" v={r} set={setR} step={0.05} />
    </Box>)
  return (
    <Box title="cash on cash" result={<>Cash flow = {usd(a)} − {usd(ds)} = {usd(a - ds)}. Cash on cash = {usd(a - ds)} ÷ {usd(eq)} = <b className="num text-brand-600">{pct((a - ds) / eq)}</b>.</>}>
      <F label="NOI ($)" v={a} set={setA} step={1000} /><F label="Loan amount ($)" v={b} set={setB} step={10000} /><F label="Cash invested ($)" v={eq} set={setEq} step={10000} />
    </Box>)
}
