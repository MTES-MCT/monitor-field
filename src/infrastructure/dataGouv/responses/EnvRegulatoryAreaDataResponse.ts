import { bbox } from '@turf/bbox'
import type { EnvRegulatoryArea } from '@domain/entities/regulatoryAreas/EnvRegulatoryArea'
import { parseWktToGeojson } from '@utils/parseWktToGeojson'
import {
  GEOMETRY_COARSE_SIMPLIFICATION_TOLERANCE,
  GEOMETRY_SIMPLIFICATION_TOLERANCE,
  simplifyGeometry
} from '@utils/simplifyGeometry'

export type EnvRegulatoryAreaRow = {
  additional_ref_reg: string
  authorization_periods: string
  date: string
  date_fin: string
  edition: string
  facade: string
  id: number
  layer_name: string
  location: string
  plan: string
  poly_name: string
  prohibition_periods: string
  ref_reg: string
  resume: string
  themes: string
  type: string
  url: string
  wkt: string
}

/** See the `@turf/bbox` note in `FishRegulatoryAreaDataResponse`. */
export function toEnvRegulatoryArea(row: EnvRegulatoryAreaRow): EnvRegulatoryArea {
  const feature = row.wkt ? parseWktToGeojson(row.wkt) : undefined

  return {
    additionalRefReg: row.additional_ref_reg,
    authorizationPeriods: row.authorization_periods,
    boundingBox: toBoundingBox(feature),
    date: row.date,
    dateFin: row.date_fin,
    edition: row.edition ?? undefined,
    facade: row.facade,
    geometry: feature
      ? JSON.stringify({ ...feature, geometry: simplifyGeometry(feature.geometry, GEOMETRY_SIMPLIFICATION_TOLERANCE) })
      : undefined,
    geometryCoarse: feature
      ? JSON.stringify({
          ...feature,
          geometry: simplifyGeometry(feature.geometry, GEOMETRY_COARSE_SIMPLIFICATION_TOLERANCE)
        })
      : undefined,
    id: row.id,
    layerName: row.layer_name,
    location: row.location,
    plan: row.plan,
    polyName: row.poly_name,
    prohibitionPeriods: row.prohibition_periods,
    refReg: row.ref_reg,
    resume: row.resume,
    themes: row.themes,
    type: row.type,
    url: row.url
  }
}

function toBoundingBox(geometry: ReturnType<typeof parseWktToGeojson> | undefined) {
  if (!geometry) {
    return undefined
  }

  const [minLon, minLat, maxLon, maxLat] = bbox(geometry)

  if (![minLon, minLat, maxLon, maxLat].every(Number.isFinite)) {
    return undefined
  }

  return { maxLat, maxLon, minLat, minLon }
}
