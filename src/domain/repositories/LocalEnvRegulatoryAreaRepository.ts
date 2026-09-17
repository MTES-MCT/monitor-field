import type { EnvRegulatoryArea } from '@domain/entities/regulatoryAreas/EnvRegulatoryArea'

export type LocalEnvRegulatoryAreaRepository = {
  countAll: () => Promise<number>
  deleteAll: () => Promise<void>
  /** Makes the stored areas for `seaFronts` exactly `areas`, deleting everything else. */
  replaceForSeaFronts: (seaFronts: string[], areas: EnvRegulatoryArea[]) => Promise<void>
}
