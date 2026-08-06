export type FishRegulatoryAreaFromDatabase = {
  id: number
  type: string
  theme: string
  zone: string
  regulations: string
  geojson?: string
  bbox_min_lon: number
  bbox_min_lat: number
  bbox_max_lon: number
  bbox_max_lat: number
  fillColor: string
}

export type FishRegulatoryArea = Omit<
  FishRegulatoryAreaFromDatabase,
  'bbox_min_lon' | 'bbox_min_lat' | 'bbox_max_lon' | 'bbox_max_lat'
> & {
  bbox: {
    minLon: number
    minLat: number
    maxLon: number
    maxLat: number
  }
}

export type EnvRegulatoryAreaFromDatabase = {
  id: number
  url: string
  layerName: string
  facade: string
  refReg: string
  date: string
  dateFin: string
  location: string
  type: string
  resume: string
  plan: string
  polyName: string
  authorizationPeriods: string
  prohibitionPeriods: string
  additionalRefReg: string
  themes: string
  tags: string
  geojson?: string
  bbox_min_lon: number
  bbox_min_lat: number
  bbox_max_lon: number
  bbox_max_lat: number
  fillColor: string
}

export type EnvRegulatoryArea = Omit<
  EnvRegulatoryAreaFromDatabase,
  'bbox_min_lon' | 'bbox_min_lat' | 'bbox_max_lon' | 'bbox_max_lat'
> & {
  bbox: {
    minLon: number
    minLat: number
    maxLon: number
    maxLat: number
  }
}
