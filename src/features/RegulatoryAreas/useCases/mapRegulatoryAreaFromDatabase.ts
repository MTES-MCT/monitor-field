import type {
  EnvRegulatoryArea,
  EnvRegulatoryAreaFromDatabase,
  FishRegulatoryArea,
  FishRegulatoryAreaFromDatabase
} from '@/types/regulatoryAreasTypes'

type MappedArea<T> = {
  props: Omit<T, 'bbox'>
  bbox: T extends { bbox: infer B } ? B : never
}

export function mapEnvAreaFromDatabase(area: EnvRegulatoryAreaFromDatabase): MappedArea<EnvRegulatoryArea> {
  return {
    bbox: {
      maxLat: area.bbox_max_lat,
      maxLon: area.bbox_max_lon,
      minLat: area.bbox_min_lat,
      minLon: area.bbox_min_lon
    },
    props: {
      additionalRefReg: area.additionalRefReg,
      authorizationPeriods: area.authorizationPeriods,
      date: area.date,
      dateFin: area.dateFin,
      edition: area.edition ?? null,
      facade: area.facade,
      fillColor: area.fillColor,
      id: area.id,
      layerName: area.layerName,
      location: area.location,
      plan: area.plan ?? null,
      polyName: area.polyName,
      prohibitionPeriods: area.prohibitionPeriods,
      refReg: area.refReg,
      resume: area.resume,
      themes: area.themes,
      totalByGroup: area.totalByGroup,
      type: area.type,
      url: area.url
    }
  }
}

export function mapFishAreaFromDatabase(area: FishRegulatoryAreaFromDatabase): MappedArea<FishRegulatoryArea> {
  return {
    bbox: {
      maxLat: area.bbox_max_lat,
      maxLon: area.bbox_max_lon,
      minLat: area.bbox_min_lat,
      minLon: area.bbox_min_lon
    },
    props: {
      fillColor: area.fillColor,
      fishingPeriods: area.fishingPeriods,
      gears: area.gears,
      generalRemarks: area.generalRemarks,
      id: area.id,
      regulatoryReferences: area.regulatoryReferences,
      species: area.species,
      theme: area.theme,
      totalByGroup: area.totalByGroup,
      type: area.type,
      zone: area.zone
    }
  }
}
