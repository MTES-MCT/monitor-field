import type { AppMode } from '@config/appModes'
import { getRegulatoryAreaTileRepository } from '@infrastructure/di/regulatoryAreas'
import { toRegulatoryAreaDataset } from '../utils/toRegulatoryAreaDataset'

export function getRegulatoryAreaTilesUrlTemplate(mode: AppMode): string {
  return getRegulatoryAreaTileRepository().getUrlTemplate(toRegulatoryAreaDataset(mode))
}
