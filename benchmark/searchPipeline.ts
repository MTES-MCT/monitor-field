import { doesGeometryIntersectBbox } from '@/utils/doesGeometryIntersectBbox'
import { parseStoredFeature } from '@/utils/parseGeoJSONFeature'
import { EnvFeaturePropertiesSchema, FishFeaturePropertiesSchema } from '@/types/schemas'
import type { BoundingBox, Geometry } from '@/types/mapTypes'

/**
 * Benchmark for the regulatory-area search hot path.
 *
 * It replicates, in isolation, the per-area body of `getEnvRegulatoryAreas` /
 * `getFishRegulatoryAreas`: `parseStoredFeature` (a JSON.parse of the geometry already validated
 * at ingest), an optional `doesGeometryIntersectBbox` intersection test, and a Zod validation of
 * the (small) properties object. That is the exact cost identified as the main "search in the
 * area shown on screen is slow" driver, and the thing we want to measure before/after optimising
 * (e.g. caching parsed geometries, pushing text search into SQL).
 *
 * The geometry shapes are synthetic but sized to the real dataset: the codebase itself notes
 * fish geometries "reach ~118 000 vertices" (`FishRegulatoryAreaDataResponse.ts`).
 */

export type BenchmarkMode = 'MONITORENV' | 'MONITORFISH'

export type ScenarioConfig = {
  name: string
  mode: BenchmarkMode
  areaCount: number
  verticesPerArea: number
  iterations: number
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
  iterations: number
  /** parse + 2× Zod validation, without the intersection test */
  validate: TimingSummary
  /** validate + `doesGeometryIntersectBbox` (the real loop body) */
  search: TimingSummary
  processedAreas: number
}

export type BenchmarkReport = {
  generatedAt: string
  scenarios: ScenarioResult[]
}

type AreaRow = {
  id: number
  geojson: string
}

type PipelineStep = 'processed' | 'parseFailed' | 'intersectFailed' | 'validateFailed'

// A bbox fully inside the generated ring, so `doesGeometryIntersectBbox` has to walk the full
// ring instead of short-circuiting on the first vertex.
const BENCHMARK_BBOX: BoundingBox = {
  maxLat: 48.2,
  maxLon: -3.8,
  minLat: 47.8,
  minLon: -4.2
}

const RING_CENTER_LON = -4
const RING_CENTER_LAT = 48
const RING_RADIUS_LON = 0.5
const RING_RADIUS_LAT = 0.5

type EnvFeatureProperties = {
  additionalRefReg: string | null
  authorizationPeriods: string | null
  date: string | null
  dateFin: string | null
  edition: string | null
  facade: string | null
  fillColor: string
  id: number
  plan: string | null
  polyName: string | null
  prohibitionPeriods: string | null
  refReg: string | null
  resume: string | null
  themes: string | null
  type: string | null
  url: string | null
}

type FishFeatureProperties = {
  fillColor: string
  id: number
  theme: string
  type: string
  zone: string
}

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

function createAreaRow(id: number, vertices: number): AreaRow {
  const feature = {
    geometry: createSyntheticGeometry(vertices),
    properties: {},
    type: 'Feature'
  }

  return { geojson: JSON.stringify(feature), id }
}

function buildProperties(id: number, mode: BenchmarkMode): EnvFeatureProperties | FishFeatureProperties {
  if (mode === 'MONITORFISH') {
    return {
      fillColor: '#67A9CF',
      id,
      theme: 'Thématique',
      type: 'Reg. NAMO',
      zone: `Zone ${id}`
    }
  }

  return {
    additionalRefReg: null,
    authorizationPeriods: null,
    date: '2026-01-01',
    dateFin: null,
    edition: null,
    facade: 'NAMO',
    fillColor: '#0B4F6C',
    id,
    plan: null,
    polyName: `Polygone ${id}`,
    prohibitionPeriods: null,
    refReg: `Ref ${id}`,
    resume: null,
    themes: 'Thème',
    type: 'Type',
    url: 'https://example.org'
  }
}

function runArea(row: AreaRow, bbox: BoundingBox, mode: BenchmarkMode, includeIntersection: boolean): PipelineStep {
  const feature = parseStoredFeature(row.geojson)

  if (!feature) {
    return 'parseFailed'
  }

  if (includeIntersection && !doesGeometryIntersectBbox(feature.geometry, bbox)) {
    return 'intersectFailed'
  }

  const properties = buildProperties(row.id, mode)

  const validated =
    mode === 'MONITORFISH'
      ? FishFeaturePropertiesSchema.safeParse(properties)
      : EnvFeaturePropertiesSchema.safeParse(properties)

  return validated.success ? 'processed' : 'validateFailed'
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
  const rows = Array.from({ length: config.areaCount }, (_, index) => createAreaRow(index + 1, config.verticesPerArea))

  // Warm the JIT with the validate-only path.
  for (const row of rows) {
    runArea(row, BENCHMARK_BBOX, config.mode, false)
  }

  const validateSamples: number[] = []
  const searchSamples: number[] = []
  let processedAreas = 0

  for (let iteration = 0; iteration < config.iterations; iteration += 1) {
    let start = performance.now()
    for (const row of rows) {
      runArea(row, BENCHMARK_BBOX, config.mode, false)
    }
    validateSamples.push(performance.now() - start)

    start = performance.now()
    let processed = 0
    for (const row of rows) {
      if (runArea(row, BENCHMARK_BBOX, config.mode, true) === 'processed') {
        processed += 1
      }
    }
    searchSamples.push(performance.now() - start)
    processedAreas = processed
  }

  return {
    areaCount: config.areaCount,
    iterations: config.iterations,
    mode: config.mode,
    name: config.name,
    processedAreas,
    search: summarize(searchSamples, config.areaCount),
    validate: summarize(validateSamples, config.areaCount),
    verticesPerArea: config.verticesPerArea
  }
}

export const DEFAULT_SCENARIOS: ScenarioConfig[] = [
  { areaCount: 50, iterations: 5, mode: 'MONITORFISH', name: 'per-area · 1k vertices', verticesPerArea: 1_000 },
  { areaCount: 10, iterations: 5, mode: 'MONITORFISH', name: 'per-area · 10k vertices', verticesPerArea: 10_000 },
  { areaCount: 1, iterations: 5, mode: 'MONITORFISH', name: 'per-area · 100k vertices', verticesPerArea: 100_000 },
  { areaCount: 30, iterations: 5, mode: 'MONITORENV', name: 'env search · 30 zones × 5k', verticesPerArea: 5_000 },
  { areaCount: 50, iterations: 5, mode: 'MONITORFISH', name: 'fish search · 50 zones × 5k', verticesPerArea: 5_000 }
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
      `${scenario.name} (${scenario.mode}) — ${scenario.areaCount} areas × ${vertices} vertices, ${scenario.iterations} iterations`
    )
    lines.push(
      `  validate (JSON.parse + props Zod)  mean ${round(scenario.validate.meanMs)}ms · median ${round(scenario.validate.medianMs)}ms · p95 ${round(scenario.validate.p95Ms)}ms · ${round(scenario.validate.msPerArea)} ms/area`
    )
    lines.push(
      `  search   (validate + intersect) mean ${round(scenario.search.meanMs)}ms · median ${round(scenario.search.medianMs)}ms · p95 ${round(scenario.search.p95Ms)}ms · ${round(scenario.search.msPerArea)} ms/area · ${round(scenario.search.areasPerSecond)} areas/s`
    )
    lines.push(`  processed ${scenario.processedAreas}/${scenario.areaCount}`)
    lines.push('')
  }

  return lines.join('\n')
}

export type ComparisonRow = {
  name: string
  metric: 'validate' | 'search'
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
      baselineMsPerArea: baselineScenario.validate.msPerArea,
      currentMsPerArea: scenario.validate.msPerArea,
      deltaPct: deltaPct(scenario.validate.msPerArea, baselineScenario.validate.msPerArea),
      metric: 'validate',
      name: scenario.name
    })
    rows.push({
      baselineMsPerArea: baselineScenario.search.msPerArea,
      currentMsPerArea: scenario.search.msPerArea,
      deltaPct: deltaPct(scenario.search.msPerArea, baselineScenario.search.msPerArea),
      metric: 'search',
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
      `  ${row.name} · ${row.metric.padEnd(8)}  ${round(row.baselineMsPerArea).padStart(8)}ms/area → ${round(row.currentMsPerArea).padStart(8)}ms/area  (${sign}${row.deltaPct.toFixed(1)}%)`
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
