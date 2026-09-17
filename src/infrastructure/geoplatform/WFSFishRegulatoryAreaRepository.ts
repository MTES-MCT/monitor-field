import type { FeatureCollection } from 'geojson'
import { toRegulationType } from '@domain/entities/regulatoryAreas/FishRegulatoryArea'
import type { FishRegulatoryArea } from '@domain/entities/regulatoryAreas/FishRegulatoryArea'
import type { FishRegulatoryAreaRepository } from '@domain/repositories/FishRegulatoryAreaRepository'
import { FISH_REGULATORY_AREAS_LAYER, GEOPF_API_KEY, GEOPF_WFS_URL } from './geoplatform.config'
import { logToSentry } from '@utils/sentryLogger'
import { buildCqlInFilter, buildWfsQuery, WFS_PAGE_SIZE } from './buildWfsQuery'
import type {
  FishRegulatoryAreaFeature,
  FishRegulatoryAreaProperties
} from './responses/FishRegulatoryAreaDataResponse'
import { toFishRegulatoryArea } from './responses/FishRegulatoryAreaDataResponse'

const FILTER_PROPERTY = 'type_de_reglementation'

type WfsFeatureCollection = FeatureCollection<FishRegulatoryAreaFeature['geometry'], FishRegulatoryAreaProperties> & {
  numberMatched?: number
  numberReturned?: number
}

/**
 * The request must not set `Accept-Encoding`: Android's OkHttp only decompresses gzip
 * transparently when it added that header itself, and would otherwise hand back raw bytes.
 */
export function createWFSFishRegulatoryAreaRepository(fetchFn: typeof fetch = fetch): FishRegulatoryAreaRepository {
  return {
    findBySeaFronts: async (seaFronts: string[]): Promise<FishRegulatoryArea[]> => {
      const cqlFilter = buildCqlInFilter(FILTER_PROPERTY, seaFronts.map(toRegulationType))
      const areas: FishRegulatoryArea[] = []
      let startIndex = 0

      for (;;) {
        const url = buildWfsQuery({
          apiKey: GEOPF_API_KEY,
          baseUrl: GEOPF_WFS_URL,
          cqlFilter,
          layer: FISH_REGULATORY_AREAS_LAYER,
          startIndex
        })

        const response = await fetchFn(url)

        if (!response.ok) {
          throw new Error(`Unable to load fish regulatory areas: ${response.status}`)
        }

        const payload = (await response.json()) as WfsFeatureCollection
        const features = payload.features ?? []

        for (const feature of features) {
          const area = toFishRegulatoryArea(feature as FishRegulatoryAreaFeature)

          if (!area) {
            logToSentry(`Skipping fish regulatory area with an unusable id: ${String(feature?.id)}`, 'warning', {
              extra: { label: 'WFSFishRegulatoryAreaRepository' }
            })
            continue
          }

          areas.push(area)
        }

        if (features.length < WFS_PAGE_SIZE) {
          return areas
        }

        startIndex += features.length
      }
    }
  }
}
