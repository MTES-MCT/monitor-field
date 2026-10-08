import type { FeatureCollection } from 'geojson'
import type { EnvRegulatoryArea } from '@domain/entities/regulatoryAreas/EnvRegulatoryArea'
import type { EnvRegulatoryAreaRepository } from '@domain/repositories/EnvRegulatoryAreaRepository'
import { ENV_REGULATORY_AREAS_LAYER, GEOPF_API_KEY_ENV, GEOPF_WFS_URL } from './geoplatform.config'
import { logToSentry } from '@utils/sentryLogger'
import { buildCqlInFilter, buildWfsQuery, WFS_PAGE_SIZE } from './buildWfsQuery'
import type { EnvRegulatoryAreaFeature, EnvRegulatoryAreaProperties } from './responses/EnvRegulatoryAreaDataResponse'
import { toEnvRegulatoryArea } from './responses/EnvRegulatoryAreaDataResponse'

const FILTER_PROPERTY = 'facade'

type WfsFeatureCollection = FeatureCollection<EnvRegulatoryAreaFeature['geometry'], EnvRegulatoryAreaProperties> & {
  numberMatched?: number
  numberReturned?: number
}

/**
 * The request must not set `Accept-Encoding`: Android's OkHttp only decompresses gzip
 * transparently when it added that header itself, and would otherwise hand back raw bytes.
 */
export function createWFSEnvRegulatoryAreaRepository(fetchFn: typeof fetch = fetch): EnvRegulatoryAreaRepository {
  return {
    findBySeaFronts: async (seaFronts: string[]): Promise<EnvRegulatoryArea[]> => {
      const cqlFilter = buildCqlInFilter(FILTER_PROPERTY, seaFronts)
      const areas: EnvRegulatoryArea[] = []
      let startIndex = 0

      for (;;) {
        const url = buildWfsQuery({
          apiKey: GEOPF_API_KEY_ENV,
          baseUrl: GEOPF_WFS_URL,
          cqlFilter,
          layer: ENV_REGULATORY_AREAS_LAYER,
          startIndex
        })

        const response = await fetchFn(url)
        if (!response.ok) {
          throw new Error(`Unable to load environmental regulatory areas: ${response.status}`)
        }

        const payload = (await response.json()) as WfsFeatureCollection
        const features = payload.features ?? []

        for (const feature of features) {
          const area = toEnvRegulatoryArea(feature as EnvRegulatoryAreaFeature)

          if (!area) {
            logToSentry(
              `Skipping environmental regulatory area with an unusable id: ${String(feature?.id)}`,
              'warning',
              {
                extra: { label: 'WFSEnvRegulatoryAreaRepository' }
              }
            )
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
