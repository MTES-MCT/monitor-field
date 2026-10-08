import type { FishRegulatoryArea } from '@domain/entities/regulatoryAreas/FishRegulatoryArea'

export type LocalFishRegulatoryAreaRepository = {
  countAll: () => Promise<number>
  deleteAll: () => Promise<void>
  replaceForSeaFronts: (areas: FishRegulatoryArea[]) => Promise<void>
}
