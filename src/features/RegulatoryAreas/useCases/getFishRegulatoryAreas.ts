import type { BoundingBox } from '@/types/mapTypes'
import type { Filters } from '@contexts/RegulatoryAreasContext'
import { getFishRegulatoryAreasQuery } from '@database/fish/getFishRegulatoryAreasQuery'
import { getDatabase } from '@database/db'
import type { FishRegulatoryArea } from '@/types/regulatoryAreasTypes'
import { matchesRegulatoryAreaSearch } from '../utils/matchesRegulatoryAreaSearch'
import { mapFishAreaFromDatabase } from './mapRegulatoryAreaFromDatabase'

export async function getFishRegulatoryAreas(
  bbox: BoundingBox,
  filters: Filters,
  zoom?: number
): Promise<FishRegulatoryArea[]> {
  const db = await getDatabase()
  const fetchedAreas = await getFishRegulatoryAreasQuery(db, bbox, zoom)
  const listItems: FishRegulatoryArea[] = []

  for (const area of fetchedAreas) {
    if (!matchesRegulatoryAreaSearch(area, filters.searchQuery, 'MONITORFISH')) {
      continue
    }

    const { props, bbox: areaBbox } = mapFishAreaFromDatabase(area)

    listItems.push({ ...props, bbox: areaBbox })
  }

  return listItems
}
