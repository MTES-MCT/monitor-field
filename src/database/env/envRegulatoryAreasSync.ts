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
  tags: string
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
  const tags = normalizeFeatureProperty(row.tags)
  const title = normalizeFeatureProperty(row.layer_name ?? row.resume)

  return `${id}-${title}-${tags}`
}

export async function syncEnvRegulatoryAreas(db: DB, facades: string[]) {
  const palette = monitorEnvConfig?.colors

  const existingCountResult = await db.execute(`SELECT COUNT(*) AS count FROM ${ENV_REGULATORY_AREAS_TABLE}`)
  const existingCount = Number(existingCountResult.rows?.[0]?.count ?? 0)
  const lastUpdate = storage.getString('env-regulatory-areas-last-update')
  const sevenDaysAgo = dayjs().subtract(7, 'day').format('YYYY-MM-DD')
  const shouldSkipFetch = existingCount > 0 && !!lastUpdate && dayjs(lastUpdate) > dayjs(sevenDaysAgo)

  if (shouldSkipFetch) {
    return
  }

  const rows = await fetchAllEnvRegulatoryAreas(facades)

  if (!rows || rows.length === 0) {
    // oxlint-disable-next-line no-console
    console.warn('No env regulatory areas to sync')
    return
  }

  try {
    await db.transaction(async tx => {
      await tx.execute(`DELETE FROM ${ENV_REGULATORY_AREAS_TABLE}`)

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
        INSERT INTO ${ENV_REGULATORY_AREAS_TABLE} (
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
          tags,
          location,
          fill_color,
          edition,
          bbox_min_lon, bbox_min_lat, bbox_max_lon, bbox_max_lat
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            row.tags,
            row.location,
            fillColor ?? null,
            row.edition === undefined ? null : row.edition,
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

  storage.set('env-regulatory-areas-last-update', String(dayjs().format('YYYY-MM-DD')))
}
