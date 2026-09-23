import type { BoundingBox } from '@/types/mapTypes'
import type { Filters } from '@contexts/RegulatoryAreasContext'
import type { EnvRegulatoryArea } from '@/types/regulatoryAreasTypes'
import { getEnvRegulatoryAreasQuery } from '@database/env/getEnvRegulatoryAreasQuery'
import { getDatabase } from '@database/db'
import { filterEnvRegulatoryArea } from '../utils/matchesRecentlyAddedOrModified'
import { mapEnvAreaFromDatabase } from './mapRegulatoryAreaFromDatabase'

export async function getEnvRegulatoryAreas(
  bbox: BoundingBox,
  filters: Filters,
  zoom?: number
): Promise<EnvRegulatoryArea[]> {
  const db = await getDatabase()
  const fetchedAreas = await getEnvRegulatoryAreasQuery(db, bbox, zoom)
  const listItems: EnvRegulatoryArea[] = []

  for (const area of fetchedAreas) {
    if (!filterEnvRegulatoryArea(area, filters)) {
      continue
    }

    const { props, bbox: areaBbox } = mapEnvAreaFromDatabase(area)

    listItems.push({ ...props, bbox: areaBbox })
  }

  return listItems
}
