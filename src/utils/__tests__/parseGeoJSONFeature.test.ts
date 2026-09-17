import { parseGeoJSONFeature } from '../parseGeoJSONFeature'

const POLYGON = {
  coordinates: [
    [
      [-3.4, 48.8],
      [-3.4, 48.9],
      [-3.3, 48.9],
      [-3.4, 48.8]
    ]
  ],
  type: 'Polygon'
}

const MULTI_POLYGON = { coordinates: [POLYGON.coordinates], type: 'MultiPolygon' }

describe('parseGeoJSONFeature', () => {
  it('returns a stored Feature as-is', () => {
    const feature = { geometry: POLYGON, properties: { id: 12 }, type: 'Feature' }

    expect(parseGeoJSONFeature(JSON.stringify(feature))).toEqual(feature)
  })

  // Rows written before the fish dataset stored a Feature.
  it('wraps a bare Polygon into a Feature', () => {
    expect(parseGeoJSONFeature(JSON.stringify(POLYGON))).toEqual({
      geometry: POLYGON,
      properties: {},
      type: 'Feature'
    })
  })

  it('wraps a bare MultiPolygon into a Feature', () => {
    expect(parseGeoJSONFeature(JSON.stringify(MULTI_POLYGON))).toEqual({
      geometry: MULTI_POLYGON,
      properties: {},
      type: 'Feature'
    })
  })

  it('returns undefined for an empty or missing column', () => {
    expect(parseGeoJSONFeature(undefined)).toBeUndefined()
    expect(parseGeoJSONFeature('')).toBeUndefined()
  })

  it('returns undefined for malformed JSON', () => {
    expect(parseGeoJSONFeature('{"type":"Polygon"')).toBeUndefined()
  })

  it('returns undefined for a geometry type the map cannot render', () => {
    expect(parseGeoJSONFeature(JSON.stringify({ coordinates: [0, 0], type: 'Point' }))).toBeUndefined()
  })
})
