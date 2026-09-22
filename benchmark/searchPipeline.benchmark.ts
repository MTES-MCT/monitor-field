import {
  compareReports,
  formatComparison,
  formatReport,
  readBaseline,
  runSearchPipelineBenchmark
} from './searchPipeline'

const REGRESSION_THRESHOLD_PCT = 25

describe('search pipeline benchmark', () => {
  it('measures the area hot path and compares it to the committed baseline', () => {
    const report = runSearchPipelineBenchmark()

    // Guard against a silently-fast result: every generated area must pass the full
    // pipeline, otherwise a fixture/schema break would read as a speedup.
    for (const scenario of report.scenarios) {
      expect(scenario.processedAreas).toBe(scenario.areaCount)
    }

    // eslint-disable-next-line no-console
    console.log(formatReport(report))

    const baseline = readBaseline()

    if (!baseline) {
      // eslint-disable-next-line no-console
      console.log('\nNo baseline found at benchmark/results/baseline.json. Captured report JSON:')
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(report, null, 2))
      return
    }

    const comparison = compareReports(baseline, report)

    // eslint-disable-next-line no-console
    console.log(formatComparison(comparison))

    if (process.env.BENCHMARK_FAIL_ON_REGRESSION === '1') {
      const regressions = comparison.filter(row => row.deltaPct > REGRESSION_THRESHOLD_PCT)

      expect(regressions).toEqual([])
    }
  })
})
