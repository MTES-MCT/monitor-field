import type { BoundingBox } from '@/types/mapTypes'
import type { Filters } from '@contexts/RegulatoryAreasContext'
import { getFishRegulatoryAreasQuery } from '@database/fish/getFishRegulatoryAreasQuery'
import { getDatabase } from '@database/db'
import { buildFishRegulatoryAreas } from './buildFishRegulatoryAreas'
import type { FishRegulatoryAreasResult } from './buildFishRegulatoryAreas'

export type { FishRegulatoryAreasResult }

export async function getFishRegulatoryAreas(bbox: BoundingBox, filters: Filters): Promise<FishRegulatoryAreasResult> {
  const db = await getDatabase()
  const fetchedAreas = await getFishRegulatoryAreasQuery(db, bbox)

  return buildFishRegulatoryAreas(fetchedAreas, bbox, filters)
}
