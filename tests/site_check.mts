import { project, norm, PRACTICE } from "../src/lib/model.ts"
const p = project(norm(PRACTICE))
console.log(`NOI y1 ${Math.round(p.y1.noi).toLocaleString()}  DS ${Math.round(p.y1.ds).toLocaleString()}  DSCR ${p.y1.dscr.toFixed(3)}  cap ${(p.y1.cap*100).toFixed(2)}%  CoC ${(p.y1.coc*100).toFixed(2)}%  IRR ${(p.irr*100).toFixed(2)}%  EM ${p.em.toFixed(2)}`)
