import type { BoundingBox, GeoJSONCollection, GeoJSONFeature } from '@/types/mapTypes'
import { FishFeaturePropertiesSchema } from '@/types/schemas'
import { parseStoredFeature } from '@utils/parseGeoJSONFeature'
import type { Filters } from '@contexts/RegulatoryAreasContext'
import { getFishRegulatoryAreasQuery } from '@database/fish/getFishRegulatoryAreasQuery'
import { getDatabase } from '@database/db'
import { cacheGeometry, getCachedGeometry } from '@utils/geometryCache'
import type { FishRegulatoryArea } from '@/types/regulatoryAreasTypes'
import { logToSentry } from '@utils/sentryLogger'
import { doesGeometryIntersectBbox } from '@utils/doesGeometryIntersectBbox'
import { matchesRegulatoryAreaSearch } from '../utils/matchesRegulatoryAreaSearch'

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

    const cacheKey = `MONITORFISH:${area.id}`
    let feature = getCachedGeometry(cacheKey)

    if (!feature) {
      feature = parseStoredFeature(area.geojson)

      if (feature) {
        cacheGeometry(cacheKey, feature)
      }
    }

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

    // `feature` comes from `parseStoredFeature`; its geometry was validated once at ingest, so
    // only the properties we just built still need validating here.
    const validatedProperties = FishFeaturePropertiesSchema.safeParse(currentArea)

    if (!validatedProperties.success) {
      logToSentry(`Invalid feature for area ${area.id}: ${validatedProperties.error}`, 'warning', {
        extra: { label: 'getFishRegulatoryAreas' }
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
