import type { EnvRegulatoryArea } from '@domain/entities/regulatoryAreas/EnvRegulatoryArea'

export type EnvRegulatoryAreaRepository = {
  findBySeaFronts: (seaFronts: string[]) => Promise<EnvRegulatoryArea[]>
}
