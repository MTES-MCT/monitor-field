/// <reference types="jest" />

import { VectorTile } from '@mapbox/vector-tile'
import Pbf from 'pbf'
import {
  MAX_REGULATORY_TILE_ZOOM,
  MAX_ZOOM_TILE_BUFFER,
  MAX_ZOOM_TILE_EXTENT,
  OVERVIEW_TILE_EXTENT,
  OVERVIEW_TILE_TOLERANCE
} from '@constants/regulatoryAreaTiles'
import type { GeoJSONCollection } from '@/types/mapTypes'
import { generateVectorTiles } from '../generateVectorTiles'

const EARTH_CIRCUMFERENCE_METERS = 40_075_016.686

/** MapLibre rasterizes in float32, so the screen can't render finer than ~7 cm, whatever the tiles hold. */
const RENDERER_DISPLAY_PRECISION_METERS = 0.07

type Point = { x: number; y: number }
type Ring = Point[]

function polygonRing(centerLon: number, centerLat: number, radius: number, points: number): number[][] {
  const ring: number[][] = []
  for (let i = 0; i < points; i += 1) {
    const angle = (i / points) * 2 * Math.PI
    ring.push([centerLon + radius * Math.cos(angle), centerLat + radius * Math.sin(angle)])
  }
  ring.push(ring[0]!)
  return ring
}

function collectionWithPolygon(coordinates: number[][]): GeoJSONCollection {
  return {
    features: [
      {
        geometry: { coordinates: [coordinates], type: 'Polygon' },
        properties: { id: 1 },
        type: 'Feature'
      }
    ],
    type: 'FeatureCollection'
  }
}

/** Web Mercator Y, clamped to [0, 1] — exactly matching geojson-vt's `projectY`. */
function mercatorY(lat: number): number {
  const sin = Math.sin((lat * Math.PI) / 180)
  const y = 0.5 - (0.25 * Math.log((1 + sin) / (1 - sin))) / Math.PI
  return y < 0 ? 0 : y > 1 ? 1 : y
}

function pointToSegmentDistance(px: number, py: number, a: Point, b: Point): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const lengthSquared = dx * dx + dy * dy

  if (lengthSquared === 0) {
    return Math.hypot(px - a.x, py - a.y)
  }

  const t = Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / lengthSquared))
  return Math.hypot(px - (a.x + t * dx), py - (a.y + t * dy))
}

function pointToRingsDistance(px: number, py: number, rings: Ring[]): number {
  let min = Infinity

  for (const ring of rings) {
    for (let i = 0; i < ring.length - 1; i += 1) {
      const distance = pointToSegmentDistance(px, py, ring[i]!, ring[i + 1]!)
      if (distance < min) {
        min = distance
      }
    }
  }

  return min
}

function decodeRings(data: Uint8Array): Ring[] {
  const layer = new VectorTile(new Pbf(data)).layers['regulatory-areas']
  if (!layer) {
    return []
  }

  const rings: Ring[] = []
  for (let i = 0; i < layer.length; i += 1) {
    rings.push(...layer.feature(i).loadGeometry())
  }
  return rings
}

function generateAtZoom(
  collection: GeoJSONCollection,
  zoom: number
): { extent: number; tiles: ReturnType<typeof generateVectorTiles> } {
  const isMaxZoom = zoom === MAX_REGULATORY_TILE_ZOOM
  const extent = isMaxZoom ? MAX_ZOOM_TILE_EXTENT : OVERVIEW_TILE_EXTENT

  const tiles = generateVectorTiles(
    collection,
    isMaxZoom
      ? { buffer: MAX_ZOOM_TILE_BUFFER, extent, maxZoom: zoom, minZoom: zoom, tolerance: 0 }
      : { detailZoom: MAX_REGULATORY_TILE_ZOOM, extent, maxZoom: zoom }
  )

  return { extent, tiles }
}

/**
 * Maximum distance, in tile-extent units, from any source vertex to the simplified tile geometry.
 * Source vertices are projected with the exact same Web Mercator math geojson-vt uses, so the
 * result is the real "how far off is the drawn polygon" error (simplification + quantization).
 */
function measureMaxErrorUnits(collection: GeoJSONCollection, zoom: number): number {
  const { extent, tiles } = generateAtZoom(collection, zoom)
  const z2 = 2 ** zoom

  const ringsByTile = new Map<string, Ring[]>()
  for (const tile of tiles) {
    if (tile.z !== zoom) {
      continue
    }
    const rings = decodeRings(tile.data)
    if (rings.length > 0) {
      ringsByTile.set(`${tile.x},${tile.y}`, rings)
    }
  }

  let maxUnits = 0

  for (const feature of collection.features) {
    const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates

    for (const polygon of polygons) {
      for (const ring of polygon) {
        for (const position of ring) {
          const lon = position[0] ?? 0
          const lat = position[1] ?? 0
          const xNorm = lon / 360 + 0.5
          const yNorm = mercatorY(lat)
          const tileX = Math.floor(xNorm * z2)
          const tileY = Math.floor(yNorm * z2)
          const decoded = ringsByTile.get(`${tileX},${tileY}`)

          if (!decoded) {
            continue
          }

          const px = (xNorm * z2 - tileX) * extent
          const py = (yNorm * z2 - tileY) * extent
          const distance = pointToRingsDistance(px, py, decoded)
          if (distance > maxUnits) {
            maxUnits = distance
          }
        }
      }
    }
  }

  return maxUnits
}

describe('actual tile error vs source geometry', () => {
  // A dense circle gives Douglas-Peucker its worst case: the max dropped-point deviation lands right
  // at the simplification tolerance, so the measured error is a tight upper bound.
  const collection = collectionWithPolygon(polygonRing(3, 46, 1, 3000))

  const metersPerUnit = (zoom: number, extent: number) => EARTH_CIRCUMFERENCE_METERS / (2 ** zoom * extent)

  it('stays within the simplification tolerance on the overview zooms', () => {
    for (const zoom of [4, 6, 8]) {
      const actualUnits = measureMaxErrorUnits(collection, zoom)
      const actualMeters = actualUnits * metersPerUnit(zoom, OVERVIEW_TILE_EXTENT)

      // eslint-disable-next-line no-console
      console.log(`[tiles] z${zoom}: actual ~${(actualMeters * 100).toFixed(1)} cm (${actualUnits.toFixed(2)} units)`)

      expect(actualUnits).toBeLessThanOrEqual(OVERVIEW_TILE_TOLERANCE + 1)
    }
  })

  it('stays within the renderer precision floor at the max zoom', () => {
    const zoom = MAX_REGULATORY_TILE_ZOOM
    const actualUnits = measureMaxErrorUnits(collection, zoom)
    const actualMeters = actualUnits * metersPerUnit(zoom, MAX_ZOOM_TILE_EXTENT)

    // eslint-disable-next-line no-console
    console.log(`[tiles] z${zoom}: actual ~${(actualMeters * 100).toFixed(2)} cm`)

    expect(actualMeters).toBeLessThanOrEqual(RENDERER_DISPLAY_PRECISION_METERS)
  })
})
