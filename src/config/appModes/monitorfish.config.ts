import type { AppModeConfig } from './types'

export const monitorFishConfig: AppModeConfig = {
  colors: [
    'yaleBlue',
    'queenBlue',
    'glaucous',
    'blueNcs',
    'iceberg',
    'lightSteelBlue',
    'lightPeriwinkle',
    'aliceBlue',
    'lightBlue',
    'skyBlue',
    'frenchBlue',
    'prussianBlue'
  ],
  dataLayers: ['fish_regulatory_areas'],
  features: {
    hasRegulatoryAreasFilters: false
  },
  mode: 'MONITORFISH'
}
