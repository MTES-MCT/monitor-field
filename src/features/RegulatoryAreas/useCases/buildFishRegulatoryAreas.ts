import type { BoundingBox, GeoJSONCollection, GeoJSONFeature } from '@/types/mapTypes'
import type { Filters } from '@contexts/RegulatoryAreasContext'
import type { FishRegulatoryArea, FishRegulatoryAreaFromDatabase } from '@/types/regulatoryAreasTypes'
import { resolveStoredFeature } from '@utils/geometryCache'
import { doesGeometryIntersectBbox } from '@utils/doesGeometryIntersectBbox'
import { matchesRegulatoryAreaSearch } from '../utils/matchesRegulatoryAreaSearch'

export type FishRegulatoryAreasResult = {
  geoJSON: GeoJSONCollection
  listItems: FishRegulatoryArea[]
}

/**
 * Builds the result for a set of already-fetched fish areas. Split out from the SQL query so the
 * benchmark can run this exact processing code with synthetic `fetchedAreas` as input.
 */
export function buildFishRegulatoryAreas(
  fetchedAreas: FishRegulatoryAreaFromDatabase[],
  bbox: BoundingBox,
  filters: Filters
): FishRegulatoryAreasResult {
  const features: GeoJSONFeature[] = []
  const listItems: FishRegulatoryArea[] = []

  for (const area of fetchedAreas) {
    if (!matchesRegulatoryAreaSearch(area, filters.searchQuery, 'MONITORFISH')) {
      continue
    }

    const feature = resolveStoredFeature('MONITORFISH', area.id, area.geojson)

    if (!feature) {
      continue
    }

    // the area's bbox can overlap the search bbox while its actual shape doesn't
    if (!doesGeometryIntersectBbox(feature.geometry, bbox)) {
      continue
    }

    const currentArea: Omit<FishRegulatoryArea, 'bbox'> = {
      fillColor: area.fillColor,
      id: area.id,
      regulations: area.regulations,
      theme: area.theme,
      totalByGroup: area.totalByGroup,
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

    features.push({
      ...feature,
      properties: currentArea
    } as GeoJSONFeature)
  }

  return {
    geoJSON: { features, type: 'FeatureCollection' },
    listItems
  }
}
