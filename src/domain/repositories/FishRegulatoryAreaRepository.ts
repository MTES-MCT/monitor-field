import type { FishRegulatoryArea } from '@domain/entities/regulatoryAreas/FishRegulatoryArea'

export type FishRegulatoryAreaRepository = {
  findBySeaFronts: (seaFronts: string[]) => Promise<FishRegulatoryArea[]>
}
