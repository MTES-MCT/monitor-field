import type { GeoJSONFeature } from '@/types/mapTypes'
import { FishRegulatoryAreaFeatureSchema } from '@/types/schemas'
import { parseGeoJSONFeature } from '@utils/parseGeoJSONFeature'
import { getDatabase } from '@database/db'
import type { FishRegulatoryArea } from '@/types/regulatoryAreasTypes'
import { logToSentry } from '@utils/sentryLogger'
import { getFishRegulatoryAreaQuery } from '@database/fish/getFishRegulatoryAreaQuery'

export type FishRegulatoryAreasResult = {
  geoJSON: GeoJSONFeature | undefined
}

export async function getFishRegulatoryAreaById(id: number): Promise<FishRegulatoryAreasResult> {
  const db = await getDatabase()
  const fetchedArea = await getFishRegulatoryAreaQuery(db, id)

  if (!fetchedArea) {
    return {
      geoJSON: undefined
    }
  }

  let feature = parseGeoJSONFeature(fetchedArea.geojson)

  if (!feature) {
    return {
      geoJSON: undefined
    }
  }

  const area: Omit<FishRegulatoryArea, 'bbox'> = {
    fillColor: fetchedArea.fillColor,
    id: fetchedArea.id,
    regulations: fetchedArea.regulations,
    theme: fetchedArea.theme,
    totalByGroup: fetchedArea.totalByGroup,
    type: fetchedArea.type,
    zone: fetchedArea.zone
  }
  const featureWithProperties = {
    ...feature,
    properties: { ...area }
  }

  const validatedFeature = FishRegulatoryAreaFeatureSchema.safeParse(featureWithProperties)

  if (!validatedFeature.success) {
    logToSentry(`Invalid feature for area ${fetchedArea.id}: ${validatedFeature.error}`, 'warning', {
      extra: { label: 'getFishRegulatoryArea' }
    })
    return {
      geoJSON: undefined
    }
  }

  return {
    geoJSON: validatedFeature.data as GeoJSONFeature
  }
}
