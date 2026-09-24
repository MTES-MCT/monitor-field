import {
  MAX_REGULATORY_TILE_ZOOM,
  MAX_ZOOM_TILE_EXTENT,
  OVERVIEW_TILE_EXTENT,
  OVERVIEW_TILE_TOLERANCE
} from '@constants/regulatoryAreaTiles'

/** MapLibre rasterizes in float32, so the screen can't render finer than ~7 cm, whatever the tiles hold. */
export const RENDERER_DISPLAY_PRECISION_METERS = 0.07

const EARTH_CIRCUMFERENCE_METERS = 40_075_016.686

/**
 * Estimates the maximum deviation of what the user sees from the true geometry, in meters.
 *
 * This is a conservative upper bound the user can rely on: on the overview levels it covers both
 * Douglas-Peucker simplification (≤ `tolerance` extent units) and coordinate quantization (≈ 1 unit).
 * On the finest level the tiles are source-precise (~1 cm) but the float32 renderer caps what can be
 * displayed at ~7 cm — so that floor is reported. Above `MAX_REGULATORY_TILE_ZOOM` the tiles are
 * overzoomed, so the error is frozen at that level.
 */
export function estimateTileErrorMeters(zoom: number | undefined): number | undefined {
  if (zoom === undefined) {
    return undefined
  }

  const effectiveZoom = Math.min(Math.floor(zoom), MAX_REGULATORY_TILE_ZOOM)

  if (effectiveZoom >= MAX_REGULATORY_TILE_ZOOM) {
    const tileError = EARTH_CIRCUMFERENCE_METERS / (2 ** MAX_REGULATORY_TILE_ZOOM * MAX_ZOOM_TILE_EXTENT)

    return Math.max(tileError, RENDERER_DISPLAY_PRECISION_METERS)
  }

  const metersPerUnit = EARTH_CIRCUMFERENCE_METERS / (2 ** effectiveZoom * OVERVIEW_TILE_EXTENT)

  // Simplification (tolerance units) + coordinate quantization (~1 unit) → a safe upper bound.
  return (OVERVIEW_TILE_TOLERANCE + 1) * metersPerUnit
}

/** Formats an error estimate for the precision badge. */
export function formatTileError(meters: number | undefined): string {
  if (meters === undefined) {
    return '~?'
  }

  if (meters >= 1000) {
    return `~${(meters / 1000).toFixed(1)} km`
  }

  if (meters >= 1) {
    return `~${Math.round(meters)} m`
  }

  return `~${Math.round(meters * 100)} cm`
}
