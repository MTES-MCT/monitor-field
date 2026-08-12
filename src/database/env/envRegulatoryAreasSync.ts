import type { DB } from '@op-engineering/op-sqlite'

import { monitorEnvConfig } from '@config/appModes/monitorenv.config'
import { calculateBboxFromWkt } from '@utils/calculateBboxFromWkt'
import { normalizeFeatureProperty, stringToArrayItem } from '@utils/layersStyle'
import { parseWktToGeojson } from '@utils/parseWktToGeojson'
import dayjs from 'dayjs'
import { ENV_REGULATORY_AREAS_API_URL, ENV_REGULATORY_AREAS_TABLE } from '../db.schema'
import { storage } from '@storage'

type ApiRow = {
  id: number
  edition: string
  url: string
  layer_name: string
  facade: string
  ref_reg: string
  date: string
  date_fin: string
  location: string
  type: string
  wkt: string
  resume: string
  plan: string
  poly_name: string
  authorization_periods: string
  prohibition_periods: string
  additional_ref_reg: string
  themes: string
}

type ApiResponse = {
  data: ApiRow[]
  links: {
    next: string | undefined
  }
}

async function fetchAllEnvRegulatoryAreas(facades: string[]) {
  const rows: ApiRow[] = []
  let nextUrl: string | undefined = `${ENV_REGULATORY_AREAS_API_URL}?facade__in=${facades.join(',')}`

  while (nextUrl) {
    const response = await fetch(nextUrl)

    if (!response.ok) {
      throw new Error(`Unable to load env regulatory areas: ${response.status}`)
    }

    const payload = (await response.json()) as ApiResponse
    rows.push(...payload.data)
    nextUrl = payload.links.next
  }

  return rows
}

function buildFeatureColorKey(row: ApiRow): string {
  const id = normalizeFeatureProperty(row.id)
  const themes = normalizeFeatureProperty(row.themes)
  const title = normalizeFeatureProperty(row.poly_name ?? row.resume)

  return `${id}-${title}-${themes}`
}

export async function syncEnvRegulatoryAreas(db: DB, facades: string[], forceRefresh = false) {
  const palette = monitorEnvConfig?.colors
  const selectedFacades = facades.filter(Boolean)

  if (selectedFacades.length === 0) {
    await db.execute(`DELETE FROM ${ENV_REGULATORY_AREAS_TABLE}`)
    storage.set('regulatory-areas-last-update', String(dayjs().format('YYYY-MM-DD HH:mm')))
    return
  }

  const existingCountResult = await db.execute(`SELECT COUNT(*) AS count FROM ${ENV_REGULATORY_AREAS_TABLE}`)
  const existingCount = Number(existingCountResult.rows?.[0]?.count ?? 0)
  const lastUpdate = storage.getString('regulatory-areas-last-update')
  const sevenDaysAgo = dayjs().subtract(7, 'day').format('YYYY-MM-DD')
  const shouldSkipFetch = !forceRefresh && existingCount > 0 && !!lastUpdate && dayjs(lastUpdate) > dayjs(sevenDaysAgo)

  if (shouldSkipFetch) {
    return
  }

  const rows = await fetchAllEnvRegulatoryAreas(selectedFacades)

  if (!rows || rows.length === 0) {
    // oxlint-disable-next-line no-console
    console.warn('No env regulatory areas to sync')
    return
  }

  try {
    await db.transaction(async tx => {
      await tx.execute('CREATE TEMP TABLE IF NOT EXISTS tmp_env_synced_ids (id INTEGER PRIMARY KEY)')
      await tx.execute('DELETE FROM tmp_env_synced_ids')

      for (let idx = 0; idx < rows.length; idx++) {
        const row = rows[idx]
        if (row) {
          await tx.execute('INSERT OR IGNORE INTO tmp_env_synced_ids (id) VALUES (?)', [row.id])
        }
      }

      const selectedFacadePlaceholders = selectedFacades.map(() => '?').join(',')

      await tx.execute(
        `DELETE FROM ${ENV_REGULATORY_AREAS_TABLE} WHERE facade NOT IN (${selectedFacadePlaceholders})`,
        selectedFacades
      )
      await tx.execute(
        `DELETE FROM ${ENV_REGULATORY_AREAS_TABLE}
         WHERE facade IN (${selectedFacadePlaceholders})
         AND id NOT IN (SELECT id FROM tmp_env_synced_ids)`,
        selectedFacades
      )

      for (let idx = 0; idx < rows.length; idx++) {
        const row = rows[idx]
        if (!row) {
          // oxlint-disable-next-line no-console
          console.warn(`Skipping null row at index ${idx}`)
          continue
        }

        const bbox = calculateBboxFromWkt(row.wkt)

        const colorKey = buildFeatureColorKey(row)
        const fillColor = stringToArrayItem(colorKey, palette) ?? palette[0]

        const geojson = row.wkt ? parseWktToGeojson(row.wkt) : undefined

        await tx.execute(
          `
        INSERT OR REPLACE INTO ${ENV_REGULATORY_AREAS_TABLE} (
          id,
          url,
          layer_name,
          facade,
          ref_reg,
          date,
          date_fin,
          type,
          geojson,
          resume,
          plan,
          poly_name,
          authorization_periods,
          prohibition_periods,
          additional_ref_reg,
          themes,
          location,
          fill_color,
          edition,
          bbox_min_lon, bbox_min_lat, bbox_max_lon, bbox_max_lat
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
          [
            row.id,
            row.url,
            row.layer_name,
            row.facade,
            row.ref_reg,
            row.date,
            row.date_fin,
            row.type,
            geojson ? JSON.stringify(geojson) : null,
            row.resume,
            row.plan,
            row.poly_name,
            row.authorization_periods,
            row.prohibition_periods,
            row.additional_ref_reg,
            row.themes,
            row.location,
            fillColor ?? null,
            row.edition ?? null,
            bbox?.minLon ?? null,
            bbox?.minLat ?? null,
            bbox?.maxLon ?? null,
            bbox?.maxLat ?? null
          ]
        )
      }
    })
  } catch (error) {
    // oxlint-disable-next-line no-console
    console.error('Transaction failed during env sync:', error)
    throw error
  }

  storage.set('regulatory-areas-last-update', String(dayjs().format('YYYY-MM-DD HH:mm')))
}
