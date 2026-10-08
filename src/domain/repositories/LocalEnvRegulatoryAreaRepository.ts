import type { EnvRegulatoryArea } from '@domain/entities/regulatoryAreas/EnvRegulatoryArea'

export type LocalEnvRegulatoryAreaRepository = {
  countAll: () => Promise<number>
  deleteAll: () => Promise<void>
  replaceForSeaFronts: (areas: EnvRegulatoryArea[]) => Promise<void>
}
