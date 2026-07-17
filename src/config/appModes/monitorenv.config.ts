import type { AppModeConfig } from './types'

export const monitorEnvConfig: AppModeConfig = {
  colors: ['blueSapphire', 'skobeloff', 'basicGreen', 'opal', 'sage', 'lightGreen'],
  dataLayers: ['env_regulatory_areas'],
  features: {
    hasRegulatoryAreasFilters: true
  },
  mode: 'MONITORENV'
}
