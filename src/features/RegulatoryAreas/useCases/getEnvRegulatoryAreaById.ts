import type { GeoJSONFeature } from '@/types/mapTypes'
import { EnvRegulatoryAreaFeatureSchema } from '@/types/schemas'
import { parseGeoJSONFeature } from '@utils/parseGeoJSONFeature'

import type { EnvRegulatoryArea } from '@/types/regulatoryAreasTypes'
import { getDatabase } from '@database/db'
import { logToSentry } from '@utils/sentryLogger'
import { getEnvRegulatoryAreaQuery } from '@database/env/getEnvRegulatoryAreaQuery'

export type EnvRegulatoryAreasResult = {
  geoJSON: GeoJSONFeature | undefined
}

export async function getEnvRegulatoryAreaById(id: number): Promise<EnvRegulatoryAreasResult> {
  const db = await getDatabase()
  const fetchedArea = await getEnvRegulatoryAreaQuery(db, id)

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

  const area: Omit<EnvRegulatoryArea, 'bbox'> = {
    additionalRefReg: fetchedArea.additionalRefReg,
    authorizationPeriods: fetchedArea.authorizationPeriods,
    date: fetchedArea.date,
    dateFin: fetchedArea.dateFin,
    edition: fetchedArea.edition ?? null,
    facade: fetchedArea.facade,
    fillColor: fetchedArea.fillColor,
    id: fetchedArea.id,
    layerName: fetchedArea.layerName,
    location: fetchedArea.location,
    plan: fetchedArea.plan ?? null,
    polyName: fetchedArea.polyName,
    prohibitionPeriods: fetchedArea.prohibitionPeriods,
    refReg: fetchedArea.refReg,
    resume: fetchedArea.resume,
    themes: fetchedArea.themes,
    totalByGroup: fetchedArea.totalByGroup,
    type: fetchedArea.type,
    url: fetchedArea.url
  }

  const featureWithProperties = {
    ...feature,
    properties: { ...area }
  }

  const validatedFeature = EnvRegulatoryAreaFeatureSchema.safeParse(featureWithProperties)

  if (!validatedFeature.success) {
    logToSentry(`Invalid feature for area ${area.id}: ${validatedFeature.error}`, 'warning', {
      extra: { label: 'getEnvRegulatoryArea' }
    })
    return {
      geoJSON: undefined
    }
  }

  return {
    geoJSON: validatedFeature.data as GeoJSONFeature
  }
}
