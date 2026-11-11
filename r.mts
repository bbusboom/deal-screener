import { project, maxPrice, SAMPLE, PRACTICE, norm, exitCapCheck, exitStress } from "./src/lib/model.ts"
import { DUELS } from "./src/learn/challenges.ts"
const s = project(norm(SAMPLE)), pr = project(norm(PRACTICE))
console.log("SAMPLE irr", (s.irr*100).toFixed(2), "max", maxPrice(norm(SAMPLE)), "noi", Math.round(s.y1.noi))
console.log("PRACTICE noi", Math.round(pr.y1.noi))
console.log("exit check", exitCapCheck(s), exitStress(norm(SAMPLE)).map(x=>(x.irr*100).toFixed(2)))
console.log("duels", (DUELS as any[]).length)
import { trueDeal, fairPrice } from "./src/learn/challenges.ts"
for (const x of DUELS) { const td = trueDeal(x); console.log(x.id, Math.round(project(td).y1.noi), fairPrice(td)) }
