import { getMatchingRegulatoryAreaIds } from '../getMatchingRegulatoryAreaIds'
import {
  buildEnvAreaSummary,
  buildFishAreaSummary,
  createInMemoryEnvSummaryRepository,
  createInMemoryFishSummaryRepository
} from './fakes'

const NOW = new Date('2026-09-16T10:00:00Z')
const NO_FILTERS = {
  recentlyAddedOrModified: false,
  searchQueryEnv: undefined,
  searchQueryFish: undefined,
  themesAndSubThemes: []
}

describe('getMatchingRegulatoryAreaIds', () => {
  it('matches areas wherever they lie, not only in the viewport', async () => {
    const dependencies = {
      envRegulatoryAreaSummaryRepository: createInMemoryEnvSummaryRepository(),
      fishRegulatoryAreaSummaryRepository: createInMemoryFishSummaryRepository([
        buildFishAreaSummary(1, { bbox: { maxLat: 44, maxLon: 8, minLat: 43, minLon: 7 }, zone: 'Corse' }),
        buildFishAreaSummary(2, { zone: 'Iroise' })
      ]),
      now: () => NOW
    }

    const ids = await getMatchingRegulatoryAreaIds(dependencies, 'fish', { ...NO_FILTERS, searchQueryFish: 'corse' })

    expect(ids).toEqual([1])
  })

  it('applies the env-only "recently added or modified" filter', async () => {
    const dependencies = {
      envRegulatoryAreaSummaryRepository: createInMemoryEnvSummaryRepository([
        buildEnvAreaSummary(1, { edition: '2026-09-10' }),
        buildEnvAreaSummary(2, { edition: null })
      ]),
      fishRegulatoryAreaSummaryRepository: createInMemoryFishSummaryRepository(),
      now: () => NOW
    }

    const ids = await getMatchingRegulatoryAreaIds(dependencies, 'env', {
      ...NO_FILTERS,
      recentlyAddedOrModified: true
    })

    expect(ids).toEqual([1])
  })
})
