import type { BoundingBox, GeoJSONCollection, GeoJSONFeature } from '@/types/mapTypes'
import type { Filters } from '@contexts/RegulatoryAreasContext'
import type { EnvRegulatoryArea, EnvRegulatoryAreaFromDatabase } from '@/types/regulatoryAreasTypes'
import { resolveStoredFeature } from '@utils/geometryCache'
import { doesGeometryIntersectBbox } from '@utils/doesGeometryIntersectBbox'
import { filterEnvRegulatoryArea } from '../utils/matchesRecentlyAddedOrModified'

export type EnvRegulatoryAreasResult = {
  geoJSON: GeoJSONCollection
  listItems: EnvRegulatoryArea[]
}

/**
 * Builds the result for a set of already-fetched env areas. Split out from the SQL query so the
 * benchmark can run this exact processing code with synthetic `fetchedAreas` as input.
 */
export function buildEnvRegulatoryAreas(
  fetchedAreas: EnvRegulatoryAreaFromDatabase[],
  bbox: BoundingBox,
  filters: Filters
): EnvRegulatoryAreasResult {
  const features: GeoJSONFeature[] = []
  const listItems: EnvRegulatoryArea[] = []

  for (const area of fetchedAreas) {
    if (!filterEnvRegulatoryArea(area, filters)) {
      continue
    }

    const feature = resolveStoredFeature('MONITORENV', area.id, area.geojson)

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
