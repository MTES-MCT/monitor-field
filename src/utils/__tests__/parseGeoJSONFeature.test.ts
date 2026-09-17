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

describe('parseGeoJSONFeature', () => {
  it('returns a stored Feature as-is', () => {
    const feature = { geometry: POLYGON, properties: { id: 12 }, type: 'Feature' }

    expect(parseGeoJSONFeature(JSON.stringify(feature))).toEqual(feature)
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
