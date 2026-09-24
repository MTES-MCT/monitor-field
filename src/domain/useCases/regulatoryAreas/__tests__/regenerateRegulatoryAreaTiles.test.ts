import { regenerateRegulatoryAreaTiles } from '../regenerateRegulatoryAreaTiles'
import { createInMemoryGeometryRepository, createInMemoryTileRepository } from './fakes'

function buildGeometry(id: number) {
  return { colorKey: 'opal', geometry: `{"id":${id}}`, id }
}

describe('regenerateRegulatoryAreaTiles', () => {
  it('rebuilds the tiles of each dataset from its geometries', async () => {
    const tiles = createInMemoryTileRepository()

    await regenerateRegulatoryAreaTiles({
      regulatoryAreaGeometryRepository: createInMemoryGeometryRepository({
        env: [buildGeometry(1)],
        fish: [buildGeometry(2), buildGeometry(3)]
      }),
      regulatoryAreaTileRepository: tiles.repository
    })

    expect(tiles.replacedDatasets).toEqual(['env', 'fish'])
    expect(tiles.tiles.get('env')?.map(geometry => geometry.id)).toEqual([1])
    expect(tiles.tiles.get('fish')?.map(geometry => geometry.id)).toEqual([2, 3])
  })
})
