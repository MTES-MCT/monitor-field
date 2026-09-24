import { bbox } from '@turf/bbox'
import type { Feature, MultiPolygon, Polygon } from 'geojson'
import type { FishRegulatoryArea } from '@domain/entities/regulatoryAreas/FishRegulatoryArea'
import { parseFeatureId } from '../parseFeatureId'

export type FishRegulatoryAreaProperties = {
  engins: string | null
  especes: string | null
  periodes: string | null
  /** The raw `regulatory_references` JSON array, no longer the flat list it used to hold. */
  reglementations: string | null
  remarques_generales: string | null
  thematique: string
  type_de_reglementation: string
  zone: string
}

/** GeoServer emits `Polygon` for a single-ring geometry and `MultiPolygon` otherwise. */
export type FishRegulatoryAreaFeature = Feature<Polygon | MultiPolygon | null, FishRegulatoryAreaProperties>

/**
 * `@turf/bbox` folds with `coordEach`. It must not be replaced by `Math.max(...coordinates)`:
 * the spread's argument limit is engine-dependent and geometries here reach ~118 000 vertices.
 */
export function toFishRegulatoryArea(feature: FishRegulatoryAreaFeature): FishRegulatoryArea | undefined {
  const id = parseFeatureId(feature.id)

  if (id === undefined) {
    return undefined
  }

  const properties = feature.properties ?? ({} as FishRegulatoryAreaProperties)

  return {
    boundingBox: toBoundingBox(feature),
    fishingPeriods: properties.periodes ?? undefined,
    gears: properties.engins ?? undefined,
    generalRemarks: properties.remarques_generales ?? undefined,
    // Stored as a Feature, like the Env dataset
    geometry: feature.geometry
      ? JSON.stringify({
          geometry: feature.geometry,
          properties: {},
          type: 'Feature'
        })
      : undefined,
    id,
    regulatoryReferences: properties.reglementations ?? undefined,
    species: properties.especes ?? undefined,
    theme: properties.thematique,
    type: properties.type_de_reglementation,
    zone: properties.zone
  }
}

function toBoundingBox(feature: FishRegulatoryAreaFeature) {
  if (!feature.geometry) {
    return undefined
  }

  const [minLon, minLat, maxLon, maxLat] = bbox(feature.geometry)

  if (![minLon, minLat, maxLon, maxLat].every(Number.isFinite)) {
    return undefined
  }

  return { maxLat, maxLon, minLat, minLon }
}
