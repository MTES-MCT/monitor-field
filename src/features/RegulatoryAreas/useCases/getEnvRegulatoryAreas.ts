import type { BoundingBox, GeoJSONCollection, GeoJSONFeature } from '@/types/mapTypes'
import { parseGeoJSONFeature } from '@utils/parseGeoJSONFeature'
import type { Filters } from '@contexts/RegulatoryAreasContext'
import type { EnvRegulatoryArea } from '@/types/regulatoryAreasTypes'
import { getEnvRegulatoryAreasQuery } from '@database/env/getEnvRegulatoryAreasQuery'
import { getDatabase } from '@database/db'
import { doesGeometryIntersectBbox } from '@utils/doesGeometryIntersectBbox'
import { filterEnvRegulatoryArea } from '../utils/matchesRecentlyAddedOrModified'

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

    // `feature` is already structurally validated in parseGeoJSONFeature and `currentArea` is
    // built from typed database fields, so no additional runtime validation is needed here.
    features.push({
      ...feature,
      properties: { ...currentArea }
    } as GeoJSONFeature)
  }

  return {
    geoJSON: { features, type: 'FeatureCollection' },
    listItems
  }
}
