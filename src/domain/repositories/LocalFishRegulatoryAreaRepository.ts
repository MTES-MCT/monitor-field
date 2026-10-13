import type { FishRegulatoryArea } from '@domain/entities/regulatoryAreas/FishRegulatoryArea'

export type LocalFishRegulatoryAreaRepository = {
  countAll: () => Promise<number>
  deleteAll: () => Promise<void>
  replaceAll: (areas: FishRegulatoryArea[]) => Promise<void>
}
