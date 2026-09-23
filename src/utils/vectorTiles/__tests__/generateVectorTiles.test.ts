import geojsonvt from 'geojson-vt'
import { VectorTile } from '@mapbox/vector-tile'
import Pbf from 'pbf'
import type { GeoJSONCollection } from '@/types/mapTypes'
import { generateVectorTiles } from '../generateVectorTiles'

function polygonRing(centerLon: number, centerLat: number, radius: number, points: number): number[][] {
  const ring: number[][] = []
  for (let i = 0; i < points; i += 1) {
    const angle = (i / points) * 2 * Math.PI
    ring.push([centerLon + radius * Math.cos(angle), centerLat + radius * Math.sin(angle)])
  }
  ring.push(ring[0]!)
  return ring
}

function collectionWithPolygons(...rings: number[][][]): GeoJSONCollection {
  return {
    features: rings.map((coordinates, index) => ({
      geometry: { coordinates: [coordinates], type: 'Polygon' },
      properties: { fillColor: '#000000', id: index + 1 },
      type: 'Feature'
    })),
    type: 'FeatureCollection'
  }
}

type GeoJSONVT = InstanceType<typeof geojsonvt>

function countTilePoints(tile: NonNullable<ReturnType<GeoJSONVT['getTile']>>): number {
  let total = 0

  for (const feature of tile.features) {
    if (feature.type === 1) {
      total += feature.geometry.length
    } else {
      for (const ring of feature.geometry) {
        total += ring.length
      }
    }
  }

  return total
}

/** Total decoded coordinate count of every emitted tile at `zoom`. */
function countEmittedPoints(tiles: ReturnType<typeof generateVectorTiles>, zoom: number): number {
  let total = 0

  for (const tile of tiles) {
    if (tile.z !== zoom) {
      continue
    }

    const layer = new VectorTile(new Pbf(tile.data)).layers['regulatory-areas']

    if (!layer) {
      continue
    }

    for (let i = 0; i < layer.length; i += 1) {
      for (const ring of layer.feature(i).loadGeometry()) {
        total += ring.length
      }
    }
  }

  return total
}

describe('generateVectorTiles', () => {
  it('generates a non-empty MVT buffer for every populated tile', () => {
    const collection = collectionWithPolygons(polygonRing(3, 46, 1, 200), polygonRing(4, 47, 0.5, 100))

    const tiles = generateVectorTiles(collection, { maxZoom: 6 })

    expect(tiles.length).toBeGreaterThan(0)

    for (const tile of tiles) {
      expect(Number.isInteger(tile.z)).toBe(true)
      expect(tile.z).toBeGreaterThanOrEqual(0)
      expect(tile.data).toBeInstanceOf(Uint8Array)
      expect(tile.data.length).toBeGreaterThan(0)
    }
  })

  it('keeps more detail at higher zoom levels', () => {
    const collection = collectionWithPolygons(polygonRing(3, 46, 2, 2000))
    const index = new geojsonvt(collection, { indexMaxPoints: 0, indexMaxZoom: 9, maxZoom: 9 })

    const pointsAt = (zoom: number) => {
      let total = 0
      for (const { z, x, y } of index.tileCoords) {
        if (z !== zoom) continue
        const tile = index.getTile(z, x, y)
        if (tile) total += countTilePoints(tile)
      }
      return total
    }

    expect(pointsAt(9)).toBeGreaterThan(pointsAt(2))
  })

  it('promotes the area id to the MVT feature id', () => {
    const collection = collectionWithPolygons(polygonRing(3, 46, 0.1, 8))
    const index = new geojsonvt(collection, { indexMaxPoints: 0, indexMaxZoom: 4, maxZoom: 4, promoteId: 'id' })

    const tile = index.tileCoords
      .map(({ z, x, y }) => index.getTile(z, x, y))
      .find(tile => tile && tile.features.length > 0)

    expect(tile?.features[0]?.id).toBe(1)
  })

  it('simplifies the deepest emitted zoom when detailZoom is set above maxZoom', () => {
    // A dense ring gives Douglas-Peucker plenty to drop: at z6 the default `maxZoom` forces
    // full detail (tolerance = 0), while `detailZoom: 7` makes z6 an interior, simplified zoom.
    const collection = collectionWithPolygons(polygonRing(3, 46, 1, 2000))

    const fullDetail = generateVectorTiles(collection, { maxZoom: 6 })
    const simplified = generateVectorTiles(collection, { detailZoom: 7, maxZoom: 6 })

    expect(countEmittedPoints(fullDetail, 6)).toBeGreaterThan(countEmittedPoints(simplified, 6))
  })

  it('does not emit tiles beyond maxZoom when detailZoom is higher', () => {
    const collection = collectionWithPolygons(polygonRing(3, 46, 1, 200))

    const tiles = generateVectorTiles(collection, { detailZoom: 8, maxZoom: 6 })

    expect(tiles.some(tile => tile.z > 6)).toBe(false)
  })
})
