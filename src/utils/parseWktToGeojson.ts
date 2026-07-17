// based on https://github.com/mapbox/wellknown

import type { GeoJSONFeature, Geometry, MultiPolygonGeometry, PolygonGeometry, Position } from '@/types/mapTypes'

// ---- Regex de base ----
const numberRegexp = /[-+]?([0-9]*\.[0-9]+|[0-9]+)([eE][-+]?[0-9]+)?/

const tuples = new RegExp('^' + numberRegexp.source + '(\\s' + numberRegexp.source + '){1,}')

// ---- Regex sticky (parsing sans copie de string) ----
function makeSticky(re: RegExp): RegExp {
  return new RegExp(re.source.replace(/^\^/, ''), 'y')
}

const whiteRe: RegExp = makeSticky(/^\s*/)
const openRe: RegExp = makeSticky(/^\(/)
const closeRe: RegExp = makeSticky(/^\)/)
const commaRe: RegExp = makeSticky(/^,/)
const tuplesRe: RegExp = makeSticky(tuples)
const polygonHeaderRe: RegExp = makeSticky(/^(POLYGON(\sz)?)/i)
const multipolygonHeaderRe: RegExp = makeSticky(/^(MULTIPOLYGON)/i)

// ---- Types ----
type CoordAccumulator = (CoordAccumulator | number)[]
type Token = '(' | ')' | ',' | string

/*
 * Parse WKT and return a GeoJSON Feature.
 */
export function parseWktToGeojson(input: string | undefined): GeoJSONFeature | undefined {
  if (!input) return undefined

  const parts: string[] = input.split('')
  const _: string = parts.pop() ?? ''

  let i: number = 0

  function $(re: RegExp): string | undefined {
    re.lastIndex = i
    const match = re.exec(_)
    if (!match) return undefined
    i += match[0].length
    return match[0]
  }

  function crs(geom: Geometry | undefined): GeoJSONFeature | undefined {
    if (geom) {
      return { geometry: geom, properties: {}, type: 'Feature' }
    }
    return undefined
  }

  function white(): void {
    $(whiteRe)
  }

  function multicoords(): CoordAccumulator | undefined {
    white()
    let depth: number = 0
    const rings: CoordAccumulator = []
    const stack: CoordAccumulator[] = [rings]
    let pointer: CoordAccumulator = rings
    let elem: Token | undefined

    while ((elem = $(openRe) || $(closeRe) || $(commaRe) || $(tuplesRe))) {
      if (elem === '(') {
        stack.push(pointer)
        pointer = []
        stack[stack.length - 1]?.push(pointer)
        depth++
      } else if (elem === ')') {
        if (pointer.length === 0) return undefined
        const parentPointer: CoordAccumulator | undefined = stack.pop()
        if (!parentPointer) return undefined
        pointer = parentPointer
        depth--
        if (depth === 0) break
      } else if (elem === ',') {
        pointer = []
        stack[stack.length - 1]?.push(pointer)
      } else {
        const values: number[] = []
        let start: number = 0
        for (let j = 0; j <= elem.length; j++) {
          const stringToTest = elem[j]
          if (j === elem.length || (stringToTest && /\s/.test(stringToTest))) {
            if (j > start) {
              const num: number = Number(elem.slice(start, j))
              if (Number.isNaN(num)) return undefined
              values.push(num)
            }
            start = j + 1
          }
        }
        pointer.push(...values)
      }
      white()
    }

    if (depth !== 0) return undefined
    return rings
  }

  function polygon(): PolygonGeometry | undefined {
    if (!$(polygonHeaderRe)) return undefined
    white()
    const c: CoordAccumulator | undefined = multicoords()
    if (!c) return undefined
    return { coordinates: c as Position[][], type: 'Polygon' }
  }

  function multipolygon(): MultiPolygonGeometry | undefined {
    if (!$(multipolygonHeaderRe)) return undefined
    white()
    const coordinates: CoordAccumulator | undefined = multicoords()
    if (!coordinates) return undefined
    return { coordinates: coordinates as Position[][][], type: 'MultiPolygon' }
  }

  function root(): Geometry | undefined {
    return polygon() || multipolygon()
  }

  return crs(root())
}
