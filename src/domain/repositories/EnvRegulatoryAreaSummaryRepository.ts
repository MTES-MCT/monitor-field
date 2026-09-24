import type { EnvRegulatoryAreaSummary } from '@domain/entities/regulatoryAreas/RegulatoryAreaSummary'
import type { BoundingBox } from '@/types/mapTypes'

export type EnvRegulatoryAreaSummaryRepository = {
  findAll: () => Promise<EnvRegulatoryAreaSummary[]>
  findOverlapping: (boundingBox: BoundingBox) => Promise<EnvRegulatoryAreaSummary[]>
  findByIds: (ids: number[]) => Promise<EnvRegulatoryAreaSummary[]>
}
