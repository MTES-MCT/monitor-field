import type { BoundingBox, GeoJSONCollection, GeoJSONFeature } from '@/types/mapTypes'
import { EnvFeaturePropertiesSchema } from '@/types/schemas'
import { parseGeoJSONFeature } from '@utils/parseGeoJSONFeature'
import type { Filters } from '@contexts/RegulatoryAreasContext'
import type { EnvRegulatoryArea } from '@/types/regulatoryAreasTypes'
import { getEnvRegulatoryAreasQuery } from '@database/env/getEnvRegulatoryAreasQuery'
import { getDatabase } from '@database/db'
import { logToSentry } from '@utils/sentryLogger'
import { doesGeometryIntersectBbox } from '@utils/doesGeometryIntersectBbox'
import { filterEnvRegulatoryArea } from '../utils/matchesRecentlyAddedOrModified'

export type EnvRegulatoryAreasResult = {
  geoJSON: GeoJSONCollection
  listItems: EnvRegulatoryArea[]
}

export async function getEnvRegulatoryAreas(bbox: BoundingBox, filters: Filters): Promise<EnvRegulatoryAreasResult> {
  const db = await getDatabase()
  const fetchedAreas = await getEnvRegulatoryAreasQuery(db, bbox)
  const features: GeoJSONFeature[] = []
  const listItems: EnvRegulatoryArea[] = []

  for (const area of fetchedAreas) {
    if (!filterEnvRegulatoryArea(area, filters)) {
      continue
    }

    const feature = parseGeoJSONFeature(area.geojson)

    if (!feature) {
      continue
    }

    // the area's bbox can overlap the search bbox while its actual shape doesn't
    if (!doesGeometryIntersectBbox(feature.geometry, bbox)) {
      continue
    }

    const currentArea: Omit<EnvRegulatoryArea, 'bbox'> = {
      additionalRefReg: area.additionalRefReg,
      authorizationPeriods: area.authorizationPeriods,
      date: area.date,
      dateFin: area.dateFin,
      edition: area.edition ?? null,
      facade: area.facade,
      fillColor: area.fillColor,
      id: area.id,
      layerName: area.layerName,
      location: area.location,
      plan: area.plan ?? null,
      polyName: area.polyName,
      prohibitionPeriods: area.prohibitionPeriods,
      refReg: area.refReg,
      resume: area.resume,
      themes: area.themes,
      totalByGroup: area.totalByGroup,
      type: area.type,
      url: area.url
    }

    listItems.push({
      ...currentArea,
      bbox: {
        maxLat: area.bbox_max_lat,
        maxLon: area.bbox_max_lon,
        minLat: area.bbox_min_lat,
        minLon: area.bbox_min_lon
      }
    })

    // `feature` is already a validated GeoJSON feature from `parseGeoJSONFeature`; only the
    // properties we just built still need validating. Re-validating the geometry here would walk
    // every coordinate a second time for no benefit.
    const validatedProperties = EnvFeaturePropertiesSchema.safeParse(currentArea)

    if (!validatedProperties.success) {
      logToSentry(`Invalid feature for area ${area.id}: ${validatedProperties.error}`, 'warning', {
        extra: { label: 'getEnvRegulatoryAreas' }
      })
      continue
    }

    features.push({
      ...feature,
      properties: validatedProperties.data
    } as GeoJSONFeature)
  }

  return {
    geoJSON: { features, type: 'FeatureCollection' },
    listItems
  }
}
