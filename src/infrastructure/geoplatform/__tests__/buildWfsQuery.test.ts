import { buildCqlInFilter, buildWfsQuery, toCqlLiteral, WFS_PAGE_SIZE } from '../buildWfsQuery'

const BASE_URL = 'https://data.geopf.fr/private/wfs/'
const LAYER = 'some_workspace:some_layer'

describe('toCqlLiteral', () => {
  it('wraps the value in single quotes', () => {
    expect(toCqlLiteral('Reg. NAMO')).toBe("'Reg. NAMO'")
  })

  it('escapes an embedded quote by doubling it', () => {
    expect(toCqlLiteral("Côtes d'Armor")).toBe("'Côtes d''Armor'")
  })

  it('quotes an empty value rather than producing a bare token', () => {
    expect(toCqlLiteral('')).toBe("''")
  })
})

describe('buildCqlInFilter', () => {
  it('single-quotes every value', () => {
    expect(buildCqlInFilter('type_de_reglementation', ['Reg. NAMO', 'Reg. MEMN'])).toBe(
      "type_de_reglementation IN ('Reg. NAMO','Reg. MEMN')"
    )
  })

  it('returns undefined when there is nothing to filter on', () => {
    expect(buildCqlInFilter('type_de_reglementation', [])).toBeUndefined()
  })
})

describe('buildWfsQuery', () => {
  const buildDefaultQuery = (overrides = {}) =>
    buildWfsQuery({ apiKey: 'a-key', baseUrl: BASE_URL, layer: LAYER, ...overrides })

  it('requests GeoJSON from GetFeature on WFS 2.0.0', () => {
    const parameters = new URL(buildDefaultQuery()).searchParams

    expect(parameters.get('service')).toBe('WFS')
    expect(parameters.get('version')).toBe('2.0.0')
    expect(parameters.get('request')).toBe('GetFeature')
    expect(parameters.get('outputFormat')).toBe('application/json')
    expect(parameters.get('typename')).toBe(LAYER)
  })

  it('encodes the CQL filter so spaces and parentheses survive the query string', () => {
    const cqlFilter = "type_de_reglementation IN ('Reg. NAMO')"
    const url = buildDefaultQuery({ cqlFilter })

    expect(url).not.toContain("IN ('Reg. NAMO')")
    expect(new URL(url).searchParams.get('CQL_FILTER')).toBe(cqlFilter)
  })

  it('omits CQL_FILTER when no filter is given', () => {
    expect(new URL(buildDefaultQuery()).searchParams.has('CQL_FILTER')).toBe(false)
  })

  it('defaults to the advertised page size at the first index', () => {
    const parameters = new URL(buildDefaultQuery()).searchParams

    expect(parameters.get('count')).toBe(String(WFS_PAGE_SIZE))
    expect(parameters.get('startIndex')).toBe('0')
  })

  it('advances startIndex for later pages', () => {
    const parameters = new URL(buildDefaultQuery({ startIndex: 5000 })).searchParams

    expect(parameters.get('startIndex')).toBe('5000')
  })

  it('passes the api key through', () => {
    expect(new URL(buildDefaultQuery()).searchParams.get('apikey')).toBe('a-key')
  })

  it('omits the api key when it is not configured', () => {
    expect(new URL(buildDefaultQuery({ apiKey: undefined })).searchParams.has('apikey')).toBe(false)
  })

  it('produces a URL with no whitespace or newline in it', () => {
    expect(buildDefaultQuery({ cqlFilter: "a IN ('b c')" })).not.toMatch(/\s/)
  })
})
