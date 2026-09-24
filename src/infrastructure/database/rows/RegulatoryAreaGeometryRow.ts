import type { RegulatoryAreaGeometry } from '@domain/entities/regulatoryAreas/RegulatoryAreaGeometry'

export const REGULATORY_AREA_GEOMETRY_COLUMNS = 'id, fill_color AS colorKey, geojson'

export type RegulatoryAreaGeometryRow = {
  id: number
  colorKey: string | null
  geojson: string | null
}

export function toRegulatoryAreaGeometry(row: RegulatoryAreaGeometryRow): RegulatoryAreaGeometry {
  return {
    colorKey: row.colorKey,
    geometry: row.geojson ?? undefined,
    id: row.id
  }
}
