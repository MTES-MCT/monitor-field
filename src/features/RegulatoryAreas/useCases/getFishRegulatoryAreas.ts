import type { Filters, RegulatoryAreaListItem } from '@contexts/RegulatoryAreasContext'
import { getFishRegulatoryAreasQuery } from '@database/fish/getFishRegulatoryAreasQuery'
import { matchesRegulatoryAreaSearch } from '@features/RegulatoryAreas/RegulatoryAreasList/utils'

import type { BoundingBox, GeoJSONCollection, GeoJSONFeature } from '@/types/mapTypes'
import { getDatabase } from '@database/db'

export type FishRegulatoryAreasResult = {
  geoJSON: GeoJSONCollection
  listItems: RegulatoryAreaListItem[]
}

export async function getFishRegulatoryAreas(bbox: BoundingBox, filters: Filters): Promise<FishRegulatoryAreasResult> {
  const db = await getDatabase()

  const fetchedAreas = await getFishRegulatoryAreasQuery(db, bbox)

  const features: GeoJSONFeature[] = []
  const listItems: RegulatoryAreaListItem[] = []

  for (const area of fetchedAreas) {
    if (matchesRegulatoryAreaSearch(area, filters.searchQuery)) {
      listItems.push({
        bbox: {
          maxLat: area.bbox_max_lat,
          maxLon: area.bbox_max_lon,
          minLat: area.bbox_min_lat,
          minLon: area.bbox_min_lon
        },
        fillColor: area.fill_color,
        id: area.id,
        theme: area.theme,
        type: area.type,
        zone: area.zone
      })
      // TODO(13/07/2026): add schema for regulatory areas
      const feature = JSON.parse(area.geojson ?? '')
      if (!feature) {
        continue
      }

      feature.properties = {
        fillColor: area.fill_color,
        id: area.id,
        theme: area.theme,
        type: area.type,
        zone: area.zone
      }
      features.push(feature)
    }
  }

  return {
    geoJSON: { features, type: 'FeatureCollection' },
    listItems
  }
}
