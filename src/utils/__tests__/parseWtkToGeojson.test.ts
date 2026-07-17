/// <reference types="jest" />

import { parseWktToGeojson } from '@utils/parseWktToGeojson'

describe('parseWktToGeojson', () => {
  it('parses a polygon into a GeoJSON Feature', () => {
    const input = 'SRID=4326POLYGON((0 0, 10 0, 10 10, 0 0))'

    const feature = parseWktToGeojson(input)

    expect(feature).toBeDefined()
    expect(feature?.type).toBe('Feature')
    expect(feature?.geometry.type).toBe('Polygon')
  })

  it('returns undefined on invalid WKT', () => {
    const input = 'SRID=4326POLYGON((0 0, 10))'

    expect(parseWktToGeojson(input)).toBeUndefined()
  })
})
