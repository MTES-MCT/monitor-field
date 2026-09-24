export const MIN_REGULATORY_TILE_ZOOM = 0
export const MAX_REGULATORY_TILE_ZOOM = 11

// Levels below the max zoom are Douglas-Peucker simplified.
export const OVERVIEW_TILE_EXTENT = 4096
export const OVERVIEW_TILE_TOLERANCE = 3
export const OVERVIEW_TILE_BUFFER = 64

// The max zoom level keeps the source precision.
export const MAX_ZOOM_TILE_EXTENT = 2 ** 21
/** Scaled with the extent (2^21 / 64) to keep the ~1.5% overlap: otherwise tile seams show. */
export const MAX_ZOOM_TILE_BUFFER = 32768

/** The `source-layer` of the map style. */
export const REGULATORY_AREAS_TILE_LAYER = 'regulatory-areas'

/** Changes whenever the generated tiles would, so that they get rebuilt. */
export function buildTileGenerationFingerprint(): string {
  return [
    `z${MIN_REGULATORY_TILE_ZOOM}-${MAX_REGULATORY_TILE_ZOOM}`,
    `ext${OVERVIEW_TILE_EXTENT}`,
    `sim${OVERVIEW_TILE_TOLERANCE}`,
    `buf${OVERVIEW_TILE_BUFFER}`,
    `maxExt${MAX_ZOOM_TILE_EXTENT}`,
    `maxBuf${MAX_ZOOM_TILE_BUFFER}`,
    'props:colorKey'
  ].join(':')
}
