import { bbox } from '@turf/bbox'
import type { Feature, MultiPolygon, Polygon } from 'geojson'
import { parseFeatureId } from '../parseFeatureId'
import type { EnvRegulatoryArea } from '@domain/entities/regulatoryAreas/EnvRegulatoryArea'

export type EnvRegulatoryAreaProperties = {
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
}

/** GeoServer emits `Polygon` for a single-ring geometry and `MultiPolygon` otherwise. */
export type EnvRegulatoryAreaFeature = Feature<Polygon | MultiPolygon | null, EnvRegulatoryAreaProperties>

/**
 * `@turf/bbox` folds with `coordEach`. It must not be replaced by `Math.max(...coordinates)`:
 * the spread's argument limit is engine-dependent and geometries here reach ~118 000 vertices.
 */
export function toEnvRegulatoryArea(feature: EnvRegulatoryAreaFeature): EnvRegulatoryArea | undefined {
  const id = parseFeatureId(feature.id)

  if (id === undefined) {
    return undefined
  }

  const properties = feature.properties ?? ({} as EnvRegulatoryAreaProperties)

  return {
    additionalRefReg: properties.additional_ref_reg ?? undefined,
    authorizationPeriods: properties.authorization_periods ?? undefined,
    boundingBox: toBoundingBox(feature),
    date: properties.date ?? undefined,
    dateFin: properties.date_fin ?? undefined,
    edition: properties.edition ?? undefined,
    facade: properties.facade ?? undefined,
    geometry: feature.geometry
      ? JSON.stringify({
          geometry: feature.geometry,
          properties: {},
          type: 'Feature'
        })
      : undefined,
    id: properties.id ?? undefined,
    layerName: properties.layer_name ?? undefined,
    location: properties.location ?? undefined,
    plan: properties.plan ?? undefined,
    polyName: properties.poly_name ?? undefined,
    prohibitionPeriods: properties.prohibition_periods ?? undefined,
    refReg: properties.ref_reg ?? undefined,
    resume: properties.resume ?? undefined,
    themes: properties.themes ?? undefined,
    type: properties.type ?? undefined,
    url: properties.url ?? undefined
  }
}

function toBoundingBox(feature: EnvRegulatoryAreaFeature) {
  if (!feature.geometry) {
    return undefined
  }

  const [minLon, minLat, maxLon, maxLat] = bbox(feature.geometry)

  if (![minLon, minLat, maxLon, maxLat].every(Number.isFinite)) {
    return undefined
  }

  return { maxLat, maxLon, minLat, minLon }
}
