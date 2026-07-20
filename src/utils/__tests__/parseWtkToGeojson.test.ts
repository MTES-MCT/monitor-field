/// <reference types="jest" />

import { parseWktToGeojson } from '@utils/parseWktToGeojson'

describe('parseWktToGeojson', () => {
  it('parses a multipolygon into a GeoJSON Feature', () => {
    const input =
      'MULTIPOLYGON(((-3.43414 48.83543,-3.41475 48.83543,-3.41475 48.83016,-3.43414 48.83016,-3.43414 48.83543)))'

    const feature = parseWktToGeojson(input)

    expect(feature).toBeDefined()
    expect(feature?.type).toBe('Feature')
    expect(feature?.geometry.type).toBe('MultiPolygon')
  })

  it('returns undefined on invalid WKT', () => {
    const input = 'POLYGON((0 0, 10))'

    expect(parseWktToGeojson(input)).toBeUndefined()
  })
})
