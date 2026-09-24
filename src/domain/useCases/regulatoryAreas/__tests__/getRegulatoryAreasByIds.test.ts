import { getRegulatoryAreasByIds } from '../getRegulatoryAreasByIds'
import {
  buildEnvAreaSummary,
  buildFishAreaSummary,
  createInMemoryEnvSummaryRepository,
  createInMemoryFishSummaryRepository
} from './fakes'

const dependencies = {
  envRegulatoryAreaSummaryRepository: createInMemoryEnvSummaryRepository([buildEnvAreaSummary(1)]),
  fishRegulatoryAreaSummaryRepository: createInMemoryFishSummaryRepository([
    buildFishAreaSummary(1),
    buildFishAreaSummary(2),
    buildFishAreaSummary(3)
  ])
}

describe('getRegulatoryAreasByIds', () => {
  it('returns the areas in the order the ids were given, once each', async () => {
    const areas = await getRegulatoryAreasByIds(dependencies, 'fish', [3, 1, 3])

    expect(areas.map(area => area.id)).toEqual([3, 1])
  })

  it('skips unknown ids', async () => {
    const areas = await getRegulatoryAreasByIds(dependencies, 'env', [1, 2])

    expect(areas.map(area => area.id)).toEqual([1])
  })

  it('returns nothing for no ids', async () => {
    expect(await getRegulatoryAreasByIds(dependencies, 'fish', [])).toEqual([])
  })
})
