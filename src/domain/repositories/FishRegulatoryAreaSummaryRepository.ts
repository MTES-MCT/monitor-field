import type { FishRegulatoryAreaSummary } from '@domain/entities/regulatoryAreas/RegulatoryAreaSummary'
import type { BoundingBox } from '@/types/mapTypes'

export type FishRegulatoryAreaSummaryRepository = {
  findAll: () => Promise<FishRegulatoryAreaSummary[]>
  findOverlapping: (boundingBox: BoundingBox) => Promise<FishRegulatoryAreaSummary[]>
  findByIds: (ids: number[]) => Promise<FishRegulatoryAreaSummary[]>
}
