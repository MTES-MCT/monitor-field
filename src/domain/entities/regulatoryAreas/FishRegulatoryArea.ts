import type { BoundingBox } from '@/types/mapTypes'

export type FishRegulatoryArea = {
  id: number
  type: string
  theme: string
  zone: string
  /**
   * The raw `regulatory_references` JSON array, kept as delivered. The service publishes it
   * under `reglementations`, which used to carry the references flattened to a list.
   */
  regulatoryReferences: string | undefined
  fishingPeriods: string | undefined
  gears: string | undefined
  species: string | undefined
  generalRemarks: string | undefined
  geometry: string | undefined
  boundingBox: BoundingBox | undefined
}

/**
 * Both the filter value sent upstream and the value stored in `fish_regulatory_areas.type`,
 * so the remote and local repositories have to agree on it.
 */
export function toRegulationType(seaFront: string): string {
  return `Reg. ${seaFront}`
}
