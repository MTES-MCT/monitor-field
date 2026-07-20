import type { BoundingBox } from '@/types/mapTypes'

export function calculateBboxFromWkt(wkt: string | undefined): BoundingBox | undefined {
  if (!wkt) return undefined

  try {
    const wktTrimmed = wkt.trim()
    const coords: [number, number][] = []

    // Extract all coordinates from WKT
    const coordMatches = wktTrimmed.match(/-?\d+\.?\d*\s+-?\d+\.?\d*/g)
    if (!coordMatches) return undefined

    for (const match of coordMatches) {
      const [lon, lat] = match.split(' ').map(Number)
      if (lon && !isNaN(lon) && lat && !isNaN(lat)) {
        coords.push([lon, lat])
      }
    }

    if (coords.length === 0) return undefined

    const lons = coords.map(c => c[0])
    const lats = coords.map(c => c[1])

    return {
      maxLat: Math.max(...lats),
      maxLon: Math.max(...lons),
      minLat: Math.min(...lats),
      minLon: Math.min(...lons)
    }
  } catch {
    return undefined
  }
}
