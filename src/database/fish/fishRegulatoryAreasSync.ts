import type { DB } from '@op-engineering/op-sqlite'

import { monitorFishConfig } from '@config/appModes/monitorfish.config'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { calculateBboxFromWkt } from '@utils/calculateBboxFromWkt'
import { normalizeFeatureProperty, stringToArrayItem } from '@utils/layersStyle'
import { parseWktToGeojson } from '@utils/parseWktToGeojson'
import dayjs from 'dayjs'
import { FISH_REGULATORY_AREAS_API_URL, FISH_REGULATORY_AREAS_TABLE } from '../db.schema'

type ApiRow = {
  id: number
  type_de_reglementation: string
  thematique: string
  zone: string
  reglementations: string
  wkt: string
}

type ApiResponse = {
  data: ApiRow[]
  links: {
    next: string | undefined
  }
}

async function fetchAllFishRegulatoryAreas() {
  const rows: ApiRow[] = []
  let nextUrl: string | undefined = FISH_REGULATORY_AREAS_API_URL
  while (nextUrl) {
    const response = await fetch(nextUrl)

    if (!response.ok) {
      throw new Error(`Unable to load fish regulatory areas: ${response.status}`)
    }

    const payload = (await response.json()) as ApiResponse
    rows.push(...payload.data)
    nextUrl = payload.links.next
  }

  return rows
}

function buildFeatureColorKey(row: ApiRow): string {
  const id = normalizeFeatureProperty(row.id)
  const type = normalizeFeatureProperty(row.type_de_reglementation)
  const regulatoryAreaTheme = normalizeFeatureProperty(row.thematique)

  return `${id}-${type}-${regulatoryAreaTheme}`
}

export async function syncFishRegulatoryAreas(db: DB) {
  const palette = monitorFishConfig?.colors

  const existingCountResult = await db.execute(`SELECT COUNT(*) AS count FROM ${FISH_REGULATORY_AREAS_TABLE}`)
  const existingCount = Number(existingCountResult.rows?.[0]?.count ?? 0)
  const lastUpdate = await AsyncStorage.getItem('fish-regulatory-areas-last-update')
  const sevenDaysAgo = dayjs().subtract(7, 'day').format('YYYY-MM-DD')
  const shouldSkipFetch = existingCount > 0 && !!lastUpdate && dayjs(lastUpdate) > dayjs(sevenDaysAgo)

  if (shouldSkipFetch) {
    return
  }

  const rows = await fetchAllFishRegulatoryAreas()
  if (!rows || rows.length === 0) {
    // oxlint-disable-next-line no-console
    console.warn('No fish regulatory areas to sync')
    return
  }

  try {
    await db.transaction(async tx => {
      await tx.execute(`DELETE FROM ${FISH_REGULATORY_AREAS_TABLE}`)

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
        INSERT INTO ${FISH_REGULATORY_AREAS_TABLE} (
          id, type, theme, zone, fill_color,
          regulations, geojson,
          bbox_min_lon, bbox_min_lat, bbox_max_lon, bbox_max_lat
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
          [
            row.id,
            row.type_de_reglementation,
            row.thematique,
            row.zone,
            fillColor ?? null,
            row.reglementations,
            geojson ? JSON.stringify(geojson) : null,
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
    console.error('Transaction failed during fish sync:', error)
    throw error
  }

  await AsyncStorage.setItem('fish-regulatory-areas-last-update', String(dayjs().format('YYYY-MM-DD')))
}
