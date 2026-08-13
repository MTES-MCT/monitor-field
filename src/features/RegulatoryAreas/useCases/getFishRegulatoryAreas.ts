import type { BoundingBox, GeoJSONCollection, GeoJSONFeature } from '@/types/mapTypes'
import { FishRegulatoryAreaFeatureSchema } from '@/types/schemas'
import { parseGeoJSONFeature } from '@utils/parseGeoJSONFeature'
import { matchesRegulatoryAreaSearch } from '../RegulatoryAreasList/utils'
import type { Filters } from '@contexts/RegulatoryAreasContext'
import { getFishRegulatoryAreasQuery } from '@database/fish/getFishRegulatoryAreasQuery'
import { getDatabase } from '@database/db'
import type { FishRegulatoryArea } from '@/types/regulatoryAreasTypes'
import { logToSentry } from '@utils/sentryLogger'

export type FishRegulatoryAreasResult = {
  geoJSON: GeoJSONCollection
  listItems: FishRegulatoryArea[]
}

export async function getFishRegulatoryAreas(bbox: BoundingBox, filters: Filters): Promise<FishRegulatoryAreasResult> {
  const db = await getDatabase()
  const fetchedAreas = await getFishRegulatoryAreasQuery(db, bbox)

  const features: GeoJSONFeature[] = []
  const listItems: FishRegulatoryArea[] = []

  for (const area of fetchedAreas) {
    if (!matchesRegulatoryAreaSearch(area, filters.searchQuery, 'MONITORFISH')) {
      continue
    }

    const currentArea: Omit<FishRegulatoryArea, 'bbox'> = {
      fillColor: area.fillColor,
      id: area.id,
      regulations: area.regulations,
      theme: area.theme,
      type: area.type,
      zone: area.zone
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

    const validatedFeature = FishRegulatoryAreaFeatureSchema.safeParse(featureWithProperties)

    if (!validatedFeature.success) {
      logToSentry(`Invalid feature for area ${area.id}: ${validatedFeature.error}`, 'warning', {
        extra: { label: 'getFishRegulatoryAreas' }
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
