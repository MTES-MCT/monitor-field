import type { DB } from '@op-engineering/op-sqlite'
import type { RegulatoryAreaListItem } from '@contexts/RegulatoryAreasContext'
import { getDatabase } from '@database/db'
import { ENV_REGULATORY_AREAS_TABLE, FISH_REGULATORY_AREAS_TABLE } from '@database/db.schema'
import type { EnvRegulatoryAreaFromDatabase, FishRegulatoryAreaFromDatabase } from '@/types/regulatoryAreasTypes'
import { mapEnvAreaFromDatabase, mapFishAreaFromDatabase } from './mapRegulatoryAreaFromDatabase'

const ENV_COLUMNS = `
  id, url, layer_name AS layerName, facade, ref_reg AS refReg, date, date_fin AS dateFin, type,
  resume, plan, poly_name AS polyName, authorization_periods AS authorizationPeriods,
  prohibition_periods AS prohibitionPeriods, additional_ref_reg AS additionalRefReg, themes,
  location, edition, bbox_min_lon, bbox_min_lat, bbox_max_lon, bbox_max_lat, fill_color AS fillColor,
  total_by_group AS totalByGroup
`

const FISH_COLUMNS = `
  id, type, theme, zone, regulatory_references AS regulatoryReferences,
  fishing_periods AS fishingPeriods, gears, species, general_remarks AS generalRemarks,
  bbox_min_lon, bbox_min_lat, bbox_max_lon, bbox_max_lat, fill_color AS fillColor,
  total_by_group AS totalByGroup
`

async function getEnvAreaById(db: DB, id: number): Promise<RegulatoryAreaListItem | null> {
  const result = await db.execute(`SELECT ${ENV_COLUMNS} FROM ${ENV_REGULATORY_AREAS_TABLE} WHERE id = ?`, [id])
  const row = result.rows?.[0] as EnvRegulatoryAreaFromDatabase | undefined

  if (!row) {
    return null
  }

  const { props, bbox } = mapEnvAreaFromDatabase(row)

  return { ...props, bbox }
}

async function getFishAreaById(db: DB, id: number): Promise<RegulatoryAreaListItem | null> {
  const result = await db.execute(`SELECT ${FISH_COLUMNS} FROM ${FISH_REGULATORY_AREAS_TABLE} WHERE id = ?`, [id])
  const row = result.rows?.[0] as FishRegulatoryAreaFromDatabase | undefined

  if (!row) {
    return null
  }

  const { props, bbox } = mapFishAreaFromDatabase(row)

  return { ...props, bbox }
}

/** Fetches a full list item by its area id, used to resolve a map tap independent of the search bbox. */
export async function getRegulatoryAreaById(id: number, mode: string): Promise<RegulatoryAreaListItem | null> {
  const db = await getDatabase()

  return mode === 'MONITORFISH' ? getFishAreaById(db, id) : getEnvAreaById(db, id)
}
