import type { BoundingBox } from '@/types/mapTypes'

// What the list and details show: no geometry (the map draws it from vector tiles), plus what is
// computed when storing the area.
export type FishRegulatoryAreaSummary = {
  id: number
  type: string
  theme: string
  zone: string
  /** The raw `regulatory_references` JSON array, kept as delivered. */
  regulatoryReferences: string | null
  fishingPeriods: string | null
  gears: string | null
  species: string | null
  generalRemarks: string | null
  bbox: BoundingBox
  /** A key of the app mode palette. */
  colorKey: string
  totalByGroup: number
}

export type EnvRegulatoryAreaSummary = {
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
  bbox: BoundingBox
  /** A key of the app mode palette. */
  colorKey: string
  totalByGroup: number
}

export type RegulatoryAreaSummary = FishRegulatoryAreaSummary | EnvRegulatoryAreaSummary

export function computeBoundingBoxSurface({ maxLat, maxLon, minLat, minLon }: BoundingBox): number {
  return (maxLon - minLon) * (maxLat - minLat)
}
