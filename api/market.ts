// Market check: free public data for a deal's location. Every source is optional; whatever works comes back.
// Keys (all free) go in Vercel environment variables: CENSUS_API_KEY, FRED_API_KEY, HUD_API_TOKEN, BLS_API_KEY.
// Census and FEMA work without a key at low volume.
import { authorize } from "./_auth.js"

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
    address, benchmark: "Public_AR_Current", vintage: "Current_Current", format: "json" })
  const j = await getJson(u)
  const m = j?.result?.addressMatches?.[0]
  if (!m) return null
  const county = m.geographies?.["Counties"]?.[0]
  const tract = m.geographies?.["Census Tracts"]?.[0]
  return {
    matched: m.matchedAddress as string, lat: m.coordinates.y as number, lon: m.coordinates.x as number,
    countyFips: county?.GEOID as string | undefined, countyName: county?.NAME as string | undefined, tract: tract?.GEOID as string | undefined,
    zip: (m.addressComponents?.zip as string | undefined),
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
  let past: any = null
  try { past = await acs(zip, year - 5) } catch { /* growth is optional */ }
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
    incomeGrowth5y: past ? growth(L.income, past.income) : null, compareYear: past ? year - 5 : null,
  }
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
  }
  tasks.push(rates().then(v => { out.rates = v; if (!v) notes.push("Live interest rates: add a free FRED_API_KEY to turn this on.") }).catch(e => { notes.push("FRED: " + e.message) }))
  await Promise.all(tasks)
  out.notes = notes
  res.setHeader("cache-control", "private, max-age=3600")
  return res.status(200).json(out)
}
