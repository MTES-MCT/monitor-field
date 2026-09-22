import type { BoundingBox } from '@/types/mapTypes'

export type EnvRegulatoryArea = {
  id: number
  url: string
  layerName: string
  facade: string
  refReg: string
  date: string
  dateFin: string
  type: string
  resume: string
  plan: string
  polyName: string
  authorizationPeriods: string
  prohibitionPeriods: string
  additionalRefReg: string
  themes: string
  location: string
  edition: string | undefined
  geometry: string | undefined
  geometryCoarse: string | undefined
  boundingBox: BoundingBox | undefined
}
