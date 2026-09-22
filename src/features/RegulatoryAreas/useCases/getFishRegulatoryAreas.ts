import type { BoundingBox, GeoJSONCollection, GeoJSONFeature } from '@/types/mapTypes'
import { parseGeoJSONFeature } from '@utils/parseGeoJSONFeature'
import type { Filters } from '@contexts/RegulatoryAreasContext'
import { getFishRegulatoryAreasQuery } from '@database/fish/getFishRegulatoryAreasQuery'
import { getDatabase } from '@database/db'
import type { FishRegulatoryArea } from '@/types/regulatoryAreasTypes'
import { doesGeometryIntersectBbox } from '@utils/doesGeometryIntersectBbox'
import { matchesRegulatoryAreaSearch } from '../utils/matchesRegulatoryAreaSearch'
import { mapFishAreaFromDatabase } from './mapRegulatoryAreaFromDatabase'

export type FishRegulatoryAreasResult = {
  geoJSON: GeoJSONCollection
  listItems: FishRegulatoryArea[]
}

export async function getFishRegulatoryAreas(
  bbox: BoundingBox,
  filters: Filters,
  zoom?: number
): Promise<FishRegulatoryAreasResult> {
  const db = await getDatabase()
  const fetchedAreas = await getFishRegulatoryAreasQuery(db, bbox, zoom)

  const features: GeoJSONFeature[] = []
  const listItems: FishRegulatoryArea[] = []

  for (const area of fetchedAreas) {
    if (!matchesRegulatoryAreaSearch(area, filters.searchQuery, 'MONITORFISH')) {
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

    const { props, bbox: areaBbox } = mapFishAreaFromDatabase(area)

    listItems.push({ ...props, bbox: areaBbox })

    // `feature` is already structurally validated in parseGeoJSONFeature and `props` is
    // built from typed database fields, so no additional runtime validation is needed here.
    features.push({
      ...feature,
      properties: props
    } as GeoJSONFeature)
  }

  return {
    geoJSON: { features, type: 'FeatureCollection' },
    listItems
  }
}
