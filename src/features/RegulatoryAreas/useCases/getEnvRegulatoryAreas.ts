import type { BoundingBox } from '@/types/mapTypes'
import type { Filters } from '@contexts/RegulatoryAreasContext'
import { getEnvRegulatoryAreasQuery } from '@database/env/getEnvRegulatoryAreasQuery'
import { getDatabase } from '@database/db'
import { buildEnvRegulatoryAreas } from './buildEnvRegulatoryAreas'
import type { EnvRegulatoryAreasResult } from './buildEnvRegulatoryAreas'

export type { EnvRegulatoryAreasResult }

export async function getEnvRegulatoryAreas(bbox: BoundingBox, filters: Filters): Promise<EnvRegulatoryAreasResult> {
  const db = await getDatabase()
  const fetchedAreas = await getEnvRegulatoryAreasQuery(db, bbox)

  return buildEnvRegulatoryAreas(fetchedAreas, bbox, filters)
}
