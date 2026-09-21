import type { BoundingBox } from '@/types/mapTypes'

export type FishRegulatoryArea = {
  id: number
  type: string
  theme: string
  zone: string
  regulations: string
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
