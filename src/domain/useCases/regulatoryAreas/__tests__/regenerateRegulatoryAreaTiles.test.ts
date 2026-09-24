import { regenerateRegulatoryAreaTiles } from '../regenerateRegulatoryAreaTiles'
import { createInMemoryGeometryRepository, createInMemoryTileRepository } from './fakes'

function buildGeometry(id: number) {
  return { colorKey: 'opal', geometry: `{"id":${id}}`, id }
}

describe('regenerateRegulatoryAreaTiles', () => {
  it('rebuilds every dataset whose data changed', async () => {
    const tiles = createInMemoryTileRepository()

    await regenerateRegulatoryAreaTiles(
      {
        regulatoryAreaGeometryRepository: createInMemoryGeometryRepository({
          env: [buildGeometry(1)],
          fish: [buildGeometry(2), buildGeometry(3)]
        }),
        regulatoryAreaTileRepository: tiles.repository
      },
      ['env', 'fish']
    )

    expect(tiles.replacedDatasets).toEqual(['env', 'fish'])
    expect(tiles.tiles.get('env')?.map(geometry => geometry.id)).toEqual([1])
    expect(tiles.tiles.get('fish')?.map(geometry => geometry.id)).toEqual([2, 3])
  })

  it('skips a dataset that did not change and whose tiles are current', async () => {
    const tiles = createInMemoryTileRepository()
    tiles.tiles.set('fish', [buildGeometry(2)]) // fish tiles already generated with the current fingerprint

    await regenerateRegulatoryAreaTiles(
      {
        regulatoryAreaGeometryRepository: createInMemoryGeometryRepository({
          env: [buildGeometry(1)],
          fish: [buildGeometry(2)]
        }),
        regulatoryAreaTileRepository: tiles.repository
      },
      ['env']
    )

    expect(tiles.replacedDatasets).toEqual(['env'])
  })

  it('rebuilds a dataset whose tiles are stale even if its data did not change', async () => {
    const tiles = createInMemoryTileRepository() // no tiles generated for any dataset

    await regenerateRegulatoryAreaTiles(
      {
        regulatoryAreaGeometryRepository: createInMemoryGeometryRepository({
          env: [buildGeometry(1)],
          fish: [buildGeometry(2)]
        }),
        regulatoryAreaTileRepository: tiles.repository
      },
      ['env']
    )

    expect(tiles.replacedDatasets).toEqual(['env', 'fish'])
  })
})
