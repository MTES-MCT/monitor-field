import type { FishRegulatoryArea } from '@domain/entities/regulatoryAreas/FishRegulatoryArea'

export type LocalFishRegulatoryAreaRepository = {
  countAll: () => Promise<number>
  deleteAll: () => Promise<void>
  /** Makes the stored areas for `seaFronts` exactly `areas`, deleting everything else. */
  replaceForSeaFronts: (seaFronts: string[], areas: FishRegulatoryArea[]) => Promise<void>
}
