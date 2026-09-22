import { buildEnvRegulatoryAreas } from '@features/RegulatoryAreas/useCases/buildEnvRegulatoryAreas'
import { buildFishRegulatoryAreas } from '@features/RegulatoryAreas/useCases/buildFishRegulatoryAreas'
import { clearGeometryCache } from '@/utils/geometryCache'
import type { Filters } from '@contexts/RegulatoryAreasContext'
import type { EnvRegulatoryAreaFromDatabase, FishRegulatoryAreaFromDatabase } from '@/types/regulatoryAreasTypes'
import type { BoundingBox, Geometry } from '@/types/mapTypes'

/**
 * Benchmark for the regulatory-area search processing.
 *
 * It drives the real `buildEnvRegulatoryAreas` / `buildFishRegulatoryAreas` functions (the full
 * per-area processing, minus the SQL query) with synthetic `fetchedAreas`, so it measures exactly
 * the code that runs in production. The geometry shapes are synthetic but sized to the real
 * dataset: fish geometries "reach ~118 000 vertices" (`FishRegulatoryAreaDataResponse.ts`).
 */

export type BenchmarkMode = 'MONITORENV' | 'MONITORFISH'

export type ScenarioConfig = {
  name: string
  mode: BenchmarkMode
  areaCount: number
  verticesPerArea: number
  durationMs: number
}

export type TimingSummary = {
  meanMs: number
  medianMs: number
  p95Ms: number
  msPerArea: number
  areasPerSecond: number
}

export type ScenarioResult = {
  name: string
  mode: BenchmarkMode
  areaCount: number
  verticesPerArea: number
  /** number of passes measured within the fixed duration */
  samples: number
  durationMs: number
  /** full `build*RegulatoryAreas` processing (filter + resolve + intersect + build) */
  processing: TimingSummary
  processedAreas: number
}

export type BenchmarkReport = {
  generatedAt: string
  scenarios: ScenarioResult[]
}

// A bbox fully inside the generated ring, so `doesGeometryIntersectBbox` has to walk the full
// ring instead of short-circuiting on the first vertex.
const BENCHMARK_BBOX: BoundingBox = {
  maxLat: 48.2,
  maxLon: -3.8,
  minLat: 47.8,
  minLon: -4.2
}

// Empty filters: no text search, no recently-added filter, so every area flows through to the
// intersection (the measured cost).
const FILTERS: Filters = {
  recentlyAddedOrModified: false,
  searchQuery: undefined,
  themesAndSubThemes: []
}

const RING_CENTER_LON = -4
const RING_CENTER_LAT = 48
const RING_RADIUS_LON = 0.5
const RING_RADIUS_LAT = 0.5

function createRing(vertices: number): number[][] {
  const ring: number[][] = []

  for (let i = 0; i < vertices; i += 1) {
    const angle = (i / vertices) * Math.PI * 2
    ring.push([
      RING_CENTER_LON + Math.cos(angle) * RING_RADIUS_LON,
      RING_CENTER_LAT + Math.sin(angle) * RING_RADIUS_LAT
    ])
  }

  const first = ring[0]
  if (first) {
    // Close the ring, matching real GeoJSON polygons.
    ring.push([first[0] ?? 0, first[1] ?? 0])
  }

  return ring
}

function createSyntheticGeometry(vertices: number): Geometry {
  return {
    coordinates: [createRing(vertices)],
    type: 'Polygon'
  }
}

function createSyntheticFeature(vertices: number): string {
  const feature = {
    geometry: createSyntheticGeometry(vertices),
    properties: {},
    type: 'Feature'
  }

  return JSON.stringify(feature)
}

function buildEnvRow(id: number, vertices: number): EnvRegulatoryAreaFromDatabase {
  return {
    additionalRefReg: '',
    authorizationPeriods: '',
    bbox_max_lat: 48.5,
    bbox_max_lon: -3.5,
    bbox_min_lat: 47.5,
    bbox_min_lon: -4.5,
    date: '2026-01-01',
    dateFin: '2026-12-31',
    edition: '2026-01-01',
    facade: 'NAMO',
    fillColor: '#0B4F6C',
    geojson: createSyntheticFeature(vertices),
    id,
    layerName: 'Couche',
    location: 'Lieu',
    plan: 'Plan',
    polyName: `Polygone ${id}`,
    prohibitionPeriods: '',
    refReg: `Ref ${id}`,
    resume: 'Résumé',
    themes: 'Thème',
    totalByGroup: 1,
    type: 'Type',
    url: 'https://example.org'
  }
}

function buildFishRow(id: number, vertices: number): FishRegulatoryAreaFromDatabase {
  return {
    bbox_max_lat: 48.5,
    bbox_max_lon: -3.5,
    bbox_min_lat: 47.5,
    bbox_min_lon: -4.5,
    fillColor: '#67A9CF',
    geojson: createSyntheticFeature(vertices),
    id,
    regulations: 'Réglementation',
    theme: 'Thématique',
    totalByGroup: 1,
    type: 'Reg. NAMO',
    zone: `Zone ${id}`
  }
}

function buildRows(
  mode: BenchmarkMode,
  areaCount: number,
  verticesPerArea: number
): EnvRegulatoryAreaFromDatabase[] | FishRegulatoryAreaFromDatabase[] {
  if (mode === 'MONITORENV') {
    return Array.from({ length: areaCount }, (_, index) => buildEnvRow(index + 1, verticesPerArea))
  }

  return Array.from({ length: areaCount }, (_, index) => buildFishRow(index + 1, verticesPerArea))
}

function processBatch(
  mode: BenchmarkMode,
  rows: EnvRegulatoryAreaFromDatabase[] | FishRegulatoryAreaFromDatabase[]
): number {
  if (mode === 'MONITORENV') {
    return buildEnvRegulatoryAreas(rows as EnvRegulatoryAreaFromDatabase[], BENCHMARK_BBOX, FILTERS).listItems.length
  }

  return buildFishRegulatoryAreas(rows as FishRegulatoryAreaFromDatabase[], BENCHMARK_BBOX, FILTERS).listItems.length
}

function percentile(sorted: number[], ratio: number): number {
  if (sorted.length === 0) {
    return 0
  }

  const index = Math.min(sorted.length - 1, Math.ceil(ratio * sorted.length) - 1)

  return sorted[Math.max(0, index)] ?? 0
}

function summarize(samples: number[], areaCount: number): TimingSummary {
  const sorted = [...samples].sort((a, b) => a - b)
  const total = sorted.reduce((sum, sample) => sum + sample, 0)
  const meanMs = total / sorted.length
  const msPerArea = meanMs / areaCount

  return {
    areasPerSecond: msPerArea > 0 ? 1000 / msPerArea : Number.POSITIVE_INFINITY,
    meanMs,
    medianMs: percentile(sorted, 0.5),
    msPerArea,
    p95Ms: percentile(sorted, 0.95)
  }
}

function runScenario(config: ScenarioConfig): ScenarioResult {
  const rows = buildRows(config.mode, config.areaCount, config.verticesPerArea)

  // Scenarios reuse ids with different geometry sizes, so start from a clean cache. The warm-up
  // below populates it, so the measured iterations reflect the steady-state (cached) cost.
  clearGeometryCache()

  // Warm the JIT and the cache before timing.
  processBatch(config.mode, rows)

  const samples: number[] = []
  let processedAreas = 0

  // Measure for a fixed wall-clock duration; the sample count adapts to the machine speed.
  const deadline = performance.now() + config.durationMs

  while (performance.now() < deadline) {
    const start = performance.now()
    processedAreas = processBatch(config.mode, rows)
    samples.push(performance.now() - start)
  }

  return {
    areaCount: config.areaCount,
    durationMs: config.durationMs,
    mode: config.mode,
    name: config.name,
    processedAreas,
    processing: summarize(samples, config.areaCount),
    samples: samples.length,
    verticesPerArea: config.verticesPerArea
  }
}

/**
 * Each scenario is measured for a fixed wall-clock duration; the sample count self-calibrates to
 * the machine, so no pass count is hardcoded. Override with `BENCHMARK_DURATION_MS`.
 */
function readDefaultDurationMs(): number {
  const fromEnv = Number(process.env.BENCHMARK_DURATION_MS)

  return Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : 10000
}

const DEFAULT_DURATION_MS = readDefaultDurationMs()

export const DEFAULT_SCENARIOS: ScenarioConfig[] = [
  {
    areaCount: 50,
    durationMs: DEFAULT_DURATION_MS,
    mode: 'MONITORFISH',
    name: 'per-area · 1k vertices',
    verticesPerArea: 1_000
  },
  {
    areaCount: 20,
    durationMs: DEFAULT_DURATION_MS,
    mode: 'MONITORFISH',
    name: 'per-area · 10k vertices',
    verticesPerArea: 10_000
  },
  {
    areaCount: 3,
    durationMs: DEFAULT_DURATION_MS,
    mode: 'MONITORFISH',
    name: 'per-area · 100k vertices',
    verticesPerArea: 100_000
  },
  {
    areaCount: 30,
    durationMs: DEFAULT_DURATION_MS,
    mode: 'MONITORENV',
    name: 'env search · 30 zones × 5k',
    verticesPerArea: 5_000
  },
  {
    areaCount: 50,
    durationMs: DEFAULT_DURATION_MS,
    mode: 'MONITORFISH',
    name: 'fish search · 50 zones × 5k',
    verticesPerArea: 5_000
  }
]

export function runSearchPipelineBenchmark(scenarios: ScenarioConfig[] = DEFAULT_SCENARIOS): BenchmarkReport {
  return {
    generatedAt: new Date().toISOString(),
    scenarios: scenarios.map(runScenario)
  }
}

function round(value: number): string {
  return value.toFixed(2)
}

export function formatReport(report: BenchmarkReport): string {
  const lines = [`Search pipeline benchmark — ${report.generatedAt}`, '']

  for (const scenario of report.scenarios) {
    const vertices = scenario.verticesPerArea.toLocaleString('en-US')

    lines.push(
      `${scenario.name} (${scenario.mode}) — ${scenario.areaCount} areas × ${vertices} vertices, ${scenario.samples} samples in ${scenario.durationMs}ms`
    )
    lines.push(
      `  processing (build*RegulatoryAreas)  mean ${round(scenario.processing.meanMs)}ms · median ${round(scenario.processing.medianMs)}ms · p95 ${round(scenario.processing.p95Ms)}ms · ${round(scenario.processing.msPerArea)} ms/area · ${round(scenario.processing.areasPerSecond)} areas/s`
    )
    lines.push(`  processed ${scenario.processedAreas}/${scenario.areaCount}`)
    lines.push('')
  }

  return lines.join('\n')
}

export type ComparisonRow = {
  name: string
  baselineMsPerArea: number
  currentMsPerArea: number
  deltaPct: number
}

function deltaPct(current: number, baseline: number): number {
  if (baseline === 0) {
    return 0
  }

  return ((current - baseline) / baseline) * 100
}

export function compareReports(baseline: BenchmarkReport, current: BenchmarkReport): ComparisonRow[] {
  const baselineByName = new Map(baseline.scenarios.map(scenario => [scenario.name, scenario]))
  const rows: ComparisonRow[] = []

  for (const scenario of current.scenarios) {
    const baselineScenario = baselineByName.get(scenario.name)
    if (!baselineScenario) {
      continue
    }

    rows.push({
      baselineMsPerArea: baselineScenario.processing.msPerArea,
      currentMsPerArea: scenario.processing.msPerArea,
      deltaPct: deltaPct(scenario.processing.msPerArea, baselineScenario.processing.msPerArea),
      name: scenario.name
    })
  }

  return rows
}

export function formatComparison(rows: ComparisonRow[]): string {
  const lines = ['', 'vs baseline (negative = faster):', '']

  for (const row of rows) {
    const sign = row.deltaPct > 0 ? '+' : ''

    lines.push(
      `  ${row.name}  ${round(row.baselineMsPerArea).padStart(8)}ms/area → ${round(row.currentMsPerArea).padStart(8)}ms/area  (${sign}${row.deltaPct.toFixed(1)}%)`
    )
  }

  return lines.join('\n')
}

/** Reads the committed baseline, if present. Safe to call when the file does not exist yet. */
export function readBaseline(): BenchmarkReport | undefined {
  try {
    return require('./results/baseline.json') as BenchmarkReport
  } catch {
    return undefined
  }
}

// `__dirname` is provided by jest (CommonJS) at runtime but isn't declared by this project's
// `types` (which only includes `jest`), so declare it for type-checking.
declare const __dirname: string

/** Writes the report as the committed baseline, so it can be updated in one command. */
export function writeBaseline(report: BenchmarkReport): void {
  // oxlint-disable-next-line typescript/no-require-imports
  const fs = require('node:fs')
  // oxlint-disable-next-line typescript/no-require-imports
  const path = require('node:path')

  const baselinePath = path.join(__dirname, 'results', 'baseline.json')

  fs.mkdirSync(path.dirname(baselinePath), { recursive: true })
  fs.writeFileSync(baselinePath, `${JSON.stringify(report, null, 2)}\n`)
}
