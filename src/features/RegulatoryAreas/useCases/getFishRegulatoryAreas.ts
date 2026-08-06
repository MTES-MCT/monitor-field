import type { BoundingBox, GeoJSONCollection, GeoJSONFeature } from '@/types/mapTypes'
import { FishRegulatoryAreaFeatureSchema } from '@/types/schemas'
import { parseGeoJSONFeature } from '@utils/parseGeoJSONFeature'
import { matchesRegulatoryAreaSearch } from '../RegulatoryAreasList/utils'
import type { Filters } from '@contexts/RegulatoryAreasContext'
import { getFishRegulatoryAreasQuery } from '@database/fish/getFishRegulatoryAreasQuery'
import { getDatabase } from '@database/db'
import type { FishRegulatoryArea } from '@/types/regulatoryAreasTypes'

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

    listItems.push({
      bbox: {
        maxLat: area.bbox_max_lat,
        maxLon: area.bbox_max_lon,
        minLat: area.bbox_min_lat,
        minLon: area.bbox_min_lon
      },
      fillColor: area.fillColor,
      id: area.id,
      regulations: area.regulations,
      theme: area.theme,
      type: area.type,
      zone: area.zone
    })

    const feature = parseGeoJSONFeature(area.geojson)

    if (!feature) {
      continue
    }

    const featureWithProperties = {
      ...feature,
      properties: {
        fillColor: area.fillColor,
        id: area.id,
        regulations: area.regulations,
        theme: area.theme,
        type: area.type,
        zone: area.zone
      }
    }

    const validatedFeature = FishRegulatoryAreaFeatureSchema.safeParse(featureWithProperties)

    if (!validatedFeature.success) {
      // oxlint-disable-next-line no-console
      console.warn('Invalid feature for area', area.id, validatedFeature.error)
      continue
    }

    features.push(validatedFeature.data as GeoJSONFeature)
  }

  return {
    geoJSON: { features, type: 'FeatureCollection' },
    listItems
  }
}
