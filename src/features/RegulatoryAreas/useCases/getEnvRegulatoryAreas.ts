import type { BoundingBox, GeoJSONCollection, GeoJSONFeature } from '@/types/mapTypes'
import { parseGeoJSONFeature } from '@utils/parseGeoJSONFeature'
import type { Filters } from '@contexts/RegulatoryAreasContext'
import type { EnvRegulatoryArea } from '@/types/regulatoryAreasTypes'
import { getEnvRegulatoryAreasQuery } from '@database/env/getEnvRegulatoryAreasQuery'
import { getDatabase } from '@database/db'
import { doesGeometryIntersectBbox } from '@utils/doesGeometryIntersectBbox'
import { filterEnvRegulatoryArea } from '../utils/matchesRecentlyAddedOrModified'
import { mapEnvAreaFromDatabase } from './mapRegulatoryAreaFromDatabase'

export type EnvRegulatoryAreasResult = {
  geoJSON: GeoJSONCollection
  listItems: EnvRegulatoryArea[]
}

export async function getEnvRegulatoryAreas(
  bbox: BoundingBox,
  filters: Filters,
  zoom?: number
): Promise<EnvRegulatoryAreasResult> {
  const db = await getDatabase()
  const fetchedAreas = await getEnvRegulatoryAreasQuery(db, bbox, zoom)
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

    const { props, bbox: areaBbox } = mapEnvAreaFromDatabase(area)

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
