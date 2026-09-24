import type { EnvRegulatoryAreaSummary } from '@domain/entities/regulatoryAreas/RegulatoryAreaSummary'

export const ENV_REGULATORY_AREA_SUMMARY_COLUMNS = `
  id, url, layer_name AS layerName, facade, ref_reg AS refReg, date, date_fin AS dateFin, type,
  resume, plan, poly_name AS polyName, authorization_periods AS authorizationPeriods,
  prohibition_periods AS prohibitionPeriods, additional_ref_reg AS additionalRefReg, themes,
  location, edition, bbox_min_lon, bbox_min_lat, bbox_max_lon, bbox_max_lat, fill_color AS colorKey,
  total_by_group AS totalByGroup
`

export type EnvRegulatoryAreaSummaryRow = {
  id: number
  edition: string | null
  url: string
  layerName: string
  facade: string
  refReg: string
  date: string
  dateFin: string
  location: string
  type: string
  resume: string
  plan: string | null
  polyName: string
  authorizationPeriods: string
  prohibitionPeriods: string
  additionalRefReg: string
  themes: string
  bbox_min_lon: number
  bbox_min_lat: number
  bbox_max_lon: number
  bbox_max_lat: number
  colorKey: string
  totalByGroup: number
}

export function toEnvRegulatoryAreaSummary(row: EnvRegulatoryAreaSummaryRow): EnvRegulatoryAreaSummary {
  return {
    additionalRefReg: row.additionalRefReg,
    authorizationPeriods: row.authorizationPeriods,
    bbox: {
      maxLat: row.bbox_max_lat,
      maxLon: row.bbox_max_lon,
      minLat: row.bbox_min_lat,
      minLon: row.bbox_min_lon
    },
    colorKey: row.colorKey,
    date: row.date,
    dateFin: row.dateFin,
    edition: row.edition ?? null,
    facade: row.facade,
    id: row.id,
    layerName: row.layerName,
    location: row.location,
    plan: row.plan ?? null,
    polyName: row.polyName,
    prohibitionPeriods: row.prohibitionPeriods,
    refReg: row.refReg,
    resume: row.resume,
    themes: row.themes,
    totalByGroup: row.totalByGroup,
    type: row.type,
    url: row.url
  }
}
