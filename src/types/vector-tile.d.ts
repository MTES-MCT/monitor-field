declare module '@mapbox/vector-tile' {
  export interface VectorTilePoint {
    x: number
    y: number
  }

  export interface VectorTileFeature {
    loadGeometry(): VectorTilePoint[][]
  }

  export interface VectorTileLayer {
    length: number
    feature(index: number): VectorTileFeature
  }

  export class VectorTile {
    layers: Record<string, VectorTileLayer>
    constructor(pbf: unknown)
  }
}

declare module 'pbf' {
  export default class Pbf {
    constructor(buffer: Uint8Array)
  }
}
