import type { FishRegulatoryAreaSummary } from '@domain/entities/regulatoryAreas/RegulatoryAreaSummary'

export const FISH_REGULATORY_AREA_SUMMARY_COLUMNS = `
  id, type, theme, zone, regulatory_references AS regulatoryReferences,
  fishing_periods AS fishingPeriods, gears, species, general_remarks AS generalRemarks,
  bbox_min_lon, bbox_min_lat, bbox_max_lon, bbox_max_lat, fill_color AS colorKey,
  total_by_group AS totalByGroup
`

export type FishRegulatoryAreaSummaryRow = {
  id: number
  type: string
  theme: string
  zone: string
  regulatoryReferences: string | null
  fishingPeriods: string | null
  gears: string | null
  species: string | null
  generalRemarks: string | null
  bbox_min_lon: number
  bbox_min_lat: number
  bbox_max_lon: number
  bbox_max_lat: number
  colorKey: string
  totalByGroup: number
}

export function toFishRegulatoryAreaSummary(row: FishRegulatoryAreaSummaryRow): FishRegulatoryAreaSummary {
  return {
    bbox: {
      maxLat: row.bbox_max_lat,
      maxLon: row.bbox_max_lon,
      minLat: row.bbox_min_lat,
      minLon: row.bbox_min_lon
    },
    colorKey: row.colorKey,
    fishingPeriods: row.fishingPeriods,
    gears: row.gears,
    generalRemarks: row.generalRemarks,
    id: row.id,
    regulatoryReferences: row.regulatoryReferences,
    species: row.species,
    theme: row.theme,
    totalByGroup: row.totalByGroup,
    type: row.type,
    zone: row.zone
  }
}
