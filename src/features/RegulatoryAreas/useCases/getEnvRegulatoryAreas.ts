import type { BoundingBox, GeoJSONCollection, GeoJSONFeature } from '@/types/mapTypes'
import { EnvRegulatoryAreaFeatureSchema } from '@/types/schemas'
import { parseGeoJSONFeature } from '@utils/parseGeoJSONFeature'
import { filterEnvRegulatoryArea } from '../RegulatoryAreasList/utils'
import type { Filters } from '@contexts/RegulatoryAreasContext'
import type { EnvRegulatoryArea } from '@/types/regulatoryAreasTypes'
import { getEnvRegulatoryAreasQuery } from '@database/env/getEnvRegulatoryAreasQuery'
import { getDatabase } from '@database/db'
import { logToSentry } from '@utils/sentryLogger'

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

    const feature = parseGeoJSONFeature(area.geojson)

    if (!feature) {
      continue
    }

    const featureWithProperties = {
      ...feature,
      properties: { ...currentArea }
    }

    const validatedFeature = EnvRegulatoryAreaFeatureSchema.safeParse(featureWithProperties)

    if (!validatedFeature.success) {
      logToSentry(`Invalid feature for area ${area.id}: ${validatedFeature.error}`, 'warning', {
        extra: { label: 'getEnvRegulatoryAreas' }
      })
      continue
    }

    features.push(validatedFeature.data as GeoJSONFeature)
  }

  return {
    geoJSON: { features, type: 'FeatureCollection' },
    listItems
  }
}
