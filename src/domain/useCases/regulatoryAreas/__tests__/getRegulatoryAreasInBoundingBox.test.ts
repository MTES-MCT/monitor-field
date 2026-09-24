import { getRegulatoryAreasInBoundingBox } from '../getRegulatoryAreasInBoundingBox'
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
const VIEWPORT = { maxLat: 50, maxLon: 0, minLat: 47, minLon: -5 }

const SMALL = { maxLat: 48.1, maxLon: -3.9, minLat: 48, minLon: -4 }
const LARGE = { maxLat: 49, maxLon: -1, minLat: 47, minLon: -4 }
const ELSEWHERE = { maxLat: 44, maxLon: 8, minLat: 43, minLon: 7 }

function setup({ env = [buildEnvAreaSummary(1)], fish = [buildFishAreaSummary(1)] } = {}) {
  return {
    envRegulatoryAreaSummaryRepository: createInMemoryEnvSummaryRepository(env),
    fishRegulatoryAreaSummaryRepository: createInMemoryFishSummaryRepository(fish),
    now: () => NOW
  }
}

describe('getRegulatoryAreasInBoundingBox', () => {
  it('reads the dataset matching the app mode', async () => {
    const dependencies = setup({ env: [buildEnvAreaSummary(10)], fish: [buildFishAreaSummary(20)] })

    const fish = await getRegulatoryAreasInBoundingBox(dependencies, 'fish', VIEWPORT, NO_FILTERS)
    const env = await getRegulatoryAreasInBoundingBox(dependencies, 'env', VIEWPORT, NO_FILTERS)

    expect(fish.map(area => area.id)).toEqual([20])
    expect(env.map(area => area.id)).toEqual([10])
  })

  it('leaves out areas outside the bounding box', async () => {
    const dependencies = setup({
      fish: [buildFishAreaSummary(1, { bbox: SMALL }), buildFishAreaSummary(2, { bbox: ELSEWHERE })]
    })

    const areas = await getRegulatoryAreasInBoundingBox(dependencies, 'fish', VIEWPORT, NO_FILTERS)

    expect(areas.map(area => area.id)).toEqual([1])
  })

  it('lists the largest areas first', async () => {
    const dependencies = setup({
      fish: [buildFishAreaSummary(1, { bbox: SMALL }), buildFishAreaSummary(2, { bbox: LARGE })]
    })

    const areas = await getRegulatoryAreasInBoundingBox(dependencies, 'fish', VIEWPORT, NO_FILTERS)

    expect(areas.map(area => area.id)).toEqual([2, 1])
  })

  it('applies the search query, ignoring case and accents', async () => {
    const dependencies = setup({
      fish: [buildFishAreaSummary(1, { zone: 'Baie de Seine' }), buildFishAreaSummary(2, { zone: 'Iroise' })]
    })

    const areas = await getRegulatoryAreasInBoundingBox(dependencies, 'fish', VIEWPORT, {
      ...NO_FILTERS,
      searchQueryFish: 'SÉINE'
    })

    expect(areas.map(area => area.id)).toEqual([1])
  })

  it('keeps only env areas edited in the last 30 days when asked to', async () => {
    const dependencies = setup({
      env: [buildEnvAreaSummary(1, { edition: '2026-09-01' }), buildEnvAreaSummary(2, { edition: '2026-07-01' })]
    })

    const areas = await getRegulatoryAreasInBoundingBox(dependencies, 'env', VIEWPORT, {
      ...NO_FILTERS,
      recentlyAddedOrModified: true
    })

    expect(areas.map(area => area.id)).toEqual([1])
  })
})
