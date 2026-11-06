// Market check: free public data for a deal's location. Every source is optional; whatever works comes back.
// Keys (all free) go in Vercel environment variables: CENSUS_API_KEY, FRED_API_KEY, HUD_API_TOKEN, BLS_API_KEY.
// Census and FEMA work without a key at low volume.
import { authorize } from "./_auth.js"
import { parsePermitFile, supplyRead } from "../src/lib/permits.js"

const TIMEOUT = 9000

async function getJson(url: string, init: RequestInit = {}): Promise<any> {
  const ctl = new AbortController()
  const t = setTimeout(() => ctl.abort(), TIMEOUT)
  try {
    const r = await fetch(url, { ...init, signal: ctl.signal, headers: { "user-agent": "DealSchool/1.0", ...(init.headers || {}) } })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return await r.json()
  } finally { clearTimeout(t) }
}

const num = (v: any) => { const n = Number(v); return isFinite(n) && n > -100000 ? n : null }

/* ---------- Census geocoder: address -> point, county, tract (free, no key) ---------- */
async function geocode(address: string) {
  const u = "https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress?" + new URLSearchParams({
    address, benchmark: "Public_AR_Current", vintage: "Current_Current", layers: "all", format: "json" })
  const j = await getJson(u)
  const m = j?.result?.addressMatches?.[0]
  if (!m) return null
  const county = m.geographies?.["Counties"]?.[0]
  const tract = m.geographies?.["Census Tracts"]?.[0]
  const place = m.geographies?.["Incorporated Places"]?.[0] || m.geographies?.["Census Designated Places"]?.[0]
  return {
    matched: m.matchedAddress as string, lat: m.coordinates.y as number, lon: m.coordinates.x as number,
    countyFips: county?.GEOID as string | undefined, countyName: county?.NAME as string | undefined, tract: tract?.GEOID as string | undefined,
    zip: (m.addressComponents?.zip as string | undefined),
    placeFips: place?.GEOID as string | undefined, placeName: place?.NAME as string | undefined,
  }
}

/* ---------- Census ACS 5 year by ZIP (ZCTA) ---------- */
const ACS_VARS = {
  pop: "B01003_001E", income: "B19013_001E", rent: "B25064_001E", value: "B25077_001E", taxes: "B25103_001E",
  occupied: "B25003_001E", renters: "B25003_003E", forRent: "B25004_002E", built: "B25035_001E",
}
async function acs(zip: string, year: number) {
  const key = process.env.CENSUS_API_KEY ? `&key=${process.env.CENSUS_API_KEY}` : ""
  const u = `https://api.census.gov/data/${year}/acs/acs5?get=NAME,${Object.values(ACS_VARS).join(",")}&for=zip%20code%20tabulation%20area:${zip}${key}`
  const j = await getJson(u)
  if (!Array.isArray(j) || j.length < 2) throw new Error("no ACS row")
  const head: string[] = j[0], row: string[] = j[1]
  const get = (code: string) => num(row[head.indexOf(code)])
  const o: Record<string, number | null> = {}
  for (const [k, code] of Object.entries(ACS_VARS)) o[k] = get(code)
  return o
}
async function census(zip: string) {
  let latest: any = null, year = 0
  for (const y of [2024, 2023]) { try { latest = await acs(zip, y); year = y; break } catch { /* try older */ } }
  if (!latest) throw new Error(process.env.CENSUS_API_KEY ? "no data for this ZIP" : "no data came back. If this keeps happening, add a free CENSUS_API_KEY.")
  // 2019 and earlier ZIP (ZCTA) tables use a different geography, so fall back to the 2020 survey if needed.
  let past: any = null, pastYear = 0
  for (const y of [year - 5, year - 4]) { try { past = await acs(zip, y); pastYear = y; break } catch { /* growth is optional */ } }
  const L = latest
  const renterShare = L.occupied && L.renters != null ? L.renters / L.occupied : null
  const rentalVacancy = L.renters != null && L.forRent != null && L.renters + L.forRent > 0 ? L.forRent / (L.renters + L.forRent) : null
  const taxRate = L.taxes && L.value ? L.taxes / L.value : null
  const growth = (a: number | null, b: number | null) => (a && b ? a / b - 1 : null)
  return {
    source: `U.S. Census Bureau, American Community Survey 5 year estimates ${year - 4}–${year}`, year,
    population: L.pop, medianIncome: L.income, medianRent: L.rent, medianHomeValue: L.value, medianRealEstateTaxes: L.taxes,
    renterShare, rentalVacancy, effectiveTaxRate: taxRate, medianYearBuilt: L.built,
    popGrowth5y: past ? growth(L.pop, past.pop) : null, rentGrowth5y: past ? growth(L.rent, past.rent) : null,
    incomeGrowth5y: past ? growth(L.income, past.income) : null, compareYear: past ? pastYear : null,
  }
}

/* ---------- Area growth: county and city, ACS 5 year now vs five years earlier ---------- */
const AREA_VARS = { pop: "B01003_001E", hh: "B11001_001E", renters: "B25003_003E", units: "B25001_001E", rent: "B25064_001E",
  u5a: "B25024_007E", u5b: "B25024_008E", u5c: "B25024_009E", u5d: "B25024_010E" }
async function areaAcs(year: number, forClause: string) {
  const key = process.env.CENSUS_API_KEY ? `&key=${process.env.CENSUS_API_KEY}` : ""
  const j = await getJson(`https://api.census.gov/data/${year}/acs/acs5?get=NAME,${Object.values(AREA_VARS).join(",")}&${forClause}${key}`)
  if (!Array.isArray(j) || j.length < 2) throw new Error("no row")
  const head: string[] = j[0], row: string[] = j[1], g = (c: string) => num(row[head.indexOf(c)])
  const o: any = { name: row[head.indexOf("NAME")] }
  for (const [k, c] of Object.entries(AREA_VARS)) o[k] = g(c)
  o.units5 = [o.u5a, o.u5b, o.u5c, o.u5d].every((v: any) => v != null) ? o.u5a + o.u5b + o.u5c + o.u5d : null
  return o
}
async function areaGrowth(forClause: string) {
  let now: any = null, year = 0
  for (const y of [2024, 2023]) { try { now = await areaAcs(y, forClause); year = y; break } catch { /* older */ } }
  if (!now) return null
  let then: any = null
  try { then = await areaAcs(year - 5, forClause) } catch { /* optional */ }
  const gr = (a: number | null, b: number | null) => a && b ? a / b - 1 : null
  return {
    name: now.name, year, compareYear: then ? year - 5 : null,
    population: now.pop, households: now.hh, renterHouseholds: now.renters, housingUnits: now.units, apartmentUnits5plus: now.units5, medianRent: now.rent,
    popGrowth5y: then ? gr(now.pop, then.pop) : null, householdGrowth5y: then ? gr(now.hh, then.hh) : null,
    renterGrowth5y: then ? gr(now.renters, then.renters) : null, rentGrowth5y: then ? gr(now.rent, then.rent) : null,
    newResidentsPerYear: then && now.pop && then.pop ? (now.pop - then.pop) / 5 : null,
    newRenterHouseholdsPerYear: then && now.renters && then.renters ? (now.renters - then.renters) / 5 : null,
  }
}

/* ---------- New supply: Census Building Permits Survey, units in 5+ unit buildings by county ---------- */
async function getText(url: string) {
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), TIMEOUT)
  try { const r = await fetch(url, { signal: ctl.signal, headers: { "user-agent": "DealSchool/1.0" } }); if (!r.ok) throw new Error(`HTTP ${r.status}`); return await r.text() }
  finally { clearTimeout(t) }
}
async function permits(stateFips: string, countyFips: string) {
  const Y = new Date().getFullYear(), base = "https://www2.census.gov/econ/bps/County/"
  const years = [Y - 6, Y - 5, Y - 4, Y - 3, Y - 2, Y - 1]
  const got = await Promise.all(years.map(y => getText(`${base}co${y}a.txt`).then(t => ({ year: y, row: parsePermitFile(t, stateFips, countyFips) })).catch(() => null)))
  const perYear = got.filter((g): g is { year: number; row: NonNullable<ReturnType<typeof parsePermitFile>> } => !!g && !!g.row)
    .map(g => ({ year: g.year, units5: g.row.units5, units2to4: g.row.units2to4, units1: g.row.units1 }))
  // Year to date: the newest monthly cumulative file that exists (coYYMMy.txt).
  let ytd: { through: string; units5: number } | null = null
  const now = new Date()
  for (let back = 1; back <= 5 && !ytd; back++) {
    const d = new Date(now.getFullYear(), now.getMonth() - back, 1)
    if (d.getFullYear() !== now.getFullYear()) break
    const yy = String(d.getFullYear()).slice(2), mm = String(d.getMonth() + 1).padStart(2, "0")
    try { const r = parsePermitFile(await getText(`${base}co${yy}${mm}y.txt`), stateFips, countyFips); if (r) ytd = { through: d.toLocaleString("en-US", { month: "short", year: "numeric" }), units5: r.units5 } } catch { /* not published yet */ }
  }
  if (!perYear.length && !ytd) throw new Error("no permit data for this county")
  return { source: "U.S. Census Bureau, Building Permits Survey (county, units in buildings with 5+ units)", perYear, ytd }
}

/* ---------- FEMA flood zone (free public map service) ---------- */
async function flood(lat: number, lon: number) {
  const u = "https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query?" + new URLSearchParams({
    geometry: `${lon},${lat}`, geometryType: "esriGeometryPoint", inSR: "4326", spatialRel: "esriSpatialRelIntersects",
    outFields: "FLD_ZONE,ZONE_SUBTY,SFHA_TF,STATIC_BFE", returnGeometry: "false", f: "json" })
  const j = await getJson(u)
  const a = j?.features?.[0]?.attributes
  if (!a) return { source: "FEMA National Flood Hazard Layer", zone: null, sfha: null, note: "No digital FEMA flood map at this point." }
  return {
    source: "FEMA National Flood Hazard Layer", zone: a.FLD_ZONE as string, subtype: a.ZONE_SUBTY as string | null,
    sfha: a.SFHA_TF === "T", baseFloodElevation: num(a.STATIC_BFE) !== null && Number(a.STATIC_BFE) > -9000 ? Number(a.STATIC_BFE) : null,
  }
}

/* ---------- HUD Fair Market Rents (free token) ---------- */
async function hudFmr(countyFips: string, zip?: string) {
  const token = process.env.HUD_API_TOKEN
  if (!token) return null
  const j = await getJson(`https://www.huduser.gov/hudapi/public/fmr/data/${countyFips}99999`, { headers: { authorization: `Bearer ${token}` } })
  const d = j?.data
  let b = d?.basicdata
  if (Array.isArray(b)) b = b.find((x: any) => x.zip_code === zip) || b.find((x: any) => x.zip_code === "MSA level") || b[0]
  if (!b) return null
  return {
    source: `HUD Fair Market Rents FY${d?.year ?? ""}`, area: d?.area_name || d?.metro_name || d?.county_name,
    smallArea: !!(zip && b.zip_code === zip),
    studio: num(b.Efficiency), oneBed: num(b["One-Bedroom"]), twoBed: num(b["Two-Bedroom"]), threeBed: num(b["Three-Bedroom"]), fourBed: num(b["Four-Bedroom"]),
  }
}

/* ---------- FRED rates (free key) ---------- */
async function fredLatest(series: string, key: string) {
  const j = await getJson(`https://api.stlouisfed.org/fred/series/observations?series_id=${series}&api_key=${key}&file_type=json&sort_order=desc&limit=10`)
  const o = (j?.observations || []).find((x: any) => x.value !== ".")
  return o ? { value: Number(o.value), date: o.date as string } : null
}
async function rates() {
  const key = process.env.FRED_API_KEY
  if (!key) return null
  const [t10, sofr, mort] = await Promise.all([fredLatest("DGS10", key), fredLatest("SOFR", key), fredLatest("MORTGAGE30US", key)].map(p => p.catch(() => null)))
  return { source: "Federal Reserve Bank of St. Louis (FRED)", treasury10: t10, sofr, mortgage30: mort }
}

/* ---------- BLS county unemployment (v1 without key, v2 with BLS_API_KEY) ---------- */
async function jobs(countyFips: string) {
  const series = `LAUCN${countyFips}0000000003`
  const key = process.env.BLS_API_KEY
  const y = new Date().getFullYear()
  const j = key
    ? await getJson("https://api.bls.gov/publicAPI/v2/timeseries/data/", { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ seriesid: [series], startyear: String(y - 2), endyear: String(y), registrationkey: key }) })
    : await getJson(`https://api.bls.gov/publicAPI/v1/timeseries/data/${series}`)
  const data: any[] = j?.Results?.series?.[0]?.data || []
  if (!data.length) return null
  const latest = data[0]
  const yearAgo = data.find(x => x.period === latest.period && Number(x.year) === Number(latest.year) - 1)
  return {
    source: "U.S. Bureau of Labor Statistics, Local Area Unemployment Statistics",
    unemployment: Number(latest.value), period: `${latest.periodName} ${latest.year}`,
    yearAgo: yearAgo ? Number(yearAgo.value) : null,
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" })
  const auth = await authorize(req)
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error })
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {}
  const address = String(body.address || "").slice(0, 200).trim()
  let zip = String(body.zip || "").replace(/\D/g, "").slice(0, 5)
  const notes: string[] = []
  const out: any = { fetchedAt: new Date().toISOString() }

  let geo: Awaited<ReturnType<typeof geocode>> = null
  if (address) {
    try { geo = await geocode(address + (zip && !address.includes(zip) ? " " + zip : "")) } catch (e: any) { notes.push("Address lookup failed: " + e.message) }
    if (!geo) notes.push("The Census geocoder couldn't match that address. Flood zone, HUD rents and county jobs need a street address.")
    if (geo?.zip && !zip) zip = geo.zip
  }
  out.location = geo

  const tasks: Promise<void>[] = []
  if (/^\d{5}$/.test(zip)) tasks.push(census(zip).then(v => { out.census = v }).catch(e => { notes.push("Census: " + e.message) }))
  else notes.push("Add a 5 digit ZIP for neighborhood rent, income and population data.")
  if (geo) tasks.push(flood(geo.lat, geo.lon).then(v => { out.flood = v }).catch(e => { notes.push("FEMA flood map: " + e.message) }))
  if (geo?.countyFips) {
    tasks.push(hudFmr(geo.countyFips, zip).then(v => { out.hud = v; if (!v && !process.env.HUD_API_TOKEN) notes.push("HUD rents: add a free HUD_API_TOKEN to turn this on.") }).catch(e => { notes.push("HUD: " + e.message) }))
    tasks.push(jobs(geo.countyFips).then(v => { out.jobs = v }).catch(e => { notes.push("BLS jobs: " + e.message) }))
    const sF = geo.countyFips.slice(0, 2), cF = geo.countyFips.slice(2)
    const supply: any = {}
    tasks.push((async () => {
      const [county, city, pm] = await Promise.all([
        areaGrowth(`for=county:${cF}&in=state:${sF}`).catch(() => null),
        geo!.placeFips ? areaGrowth(`for=place:${geo!.placeFips.slice(2)}&in=state:${sF}`).catch(() => null) : Promise.resolve(null),
        permits(sF, cF).catch(e => { notes.push("Building permits: " + e.message); return null }),
      ])
      supply.county = county; supply.city = city; supply.permits = pm
      supply.read = pm ? supplyRead(pm.perYear, county?.apartmentUnits5plus ?? null, county?.newRenterHouseholdsPerYear ?? null) : null
      out.supply = supply
    })())
  }
  tasks.push(rates().then(v => { out.rates = v; if (!v) notes.push("Live interest rates: add a free FRED_API_KEY to turn this on.") }).catch(e => { notes.push("FRED: " + e.message) }))
  await Promise.all(tasks)
  out.notes = notes
  res.setHeader("cache-control", "private, max-age=3600")
  return res.status(200).json(out)
}
