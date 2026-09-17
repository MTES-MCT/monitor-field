/** The Géoplateforme's advertised `CountDefault`. Asking for more silently truncates. */
export const WFS_PAGE_SIZE = 5000

type BuildWfsQueryArgs = {
  apiKey: string | undefined
  baseUrl: string
  cqlFilter?: string
  layer: string
  pageSize?: number
  startIndex?: number
}

/** An unquoted value is parsed as a property name and the server answers 400. */
export function toCqlLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`
}

export function buildCqlInFilter(property: string, values: string[]): string | undefined {
  if (values.length === 0) {
    return undefined
  }

  return `${property} IN (${values.map(toCqlLiteral).join(',')})`
}

export function buildWfsQuery({
  apiKey,
  baseUrl,
  cqlFilter,
  layer,
  pageSize = WFS_PAGE_SIZE,
  startIndex = 0
}: BuildWfsQueryArgs): string {
  const parameters = new URLSearchParams({
    count: String(pageSize),
    outputFormat: 'application/json',
    request: 'GetFeature',
    service: 'WFS',
    startIndex: String(startIndex),
    typename: layer,
    version: '2.0.0'
  })

  if (cqlFilter) {
    parameters.set('CQL_FILTER', cqlFilter)
  }

  if (apiKey) {
    parameters.set('apikey', apiKey)
  }

  return `${baseUrl}?${parameters.toString()}`
}
