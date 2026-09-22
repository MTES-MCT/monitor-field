declare module 'vt-pbf' {
  export interface FromGeojsonVtOptions {
    /** Vector-tile spec version to emit (1 or 2). */
    version?: number
    /** Tile extent used when generating the geojson-vt tiles. */
    extent?: number
  }

  /**
   * Serialize geojson-vt tile objects (one per layer) into an MVT (`.pbf`) buffer.
   */
  export function fromGeojsonVt(
    layers: Record<string, { features: unknown[] }>,
    options?: FromGeojsonVtOptions
  ): Uint8Array
}
