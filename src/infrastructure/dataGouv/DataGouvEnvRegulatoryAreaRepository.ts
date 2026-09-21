import { ENV_REGULATORY_AREAS_API_URL } from './dataGouv.config'
import type { EnvRegulatoryArea } from '@domain/entities/regulatoryAreas/EnvRegulatoryArea'
import type { EnvRegulatoryAreaRepository } from '@domain/repositories/EnvRegulatoryAreaRepository'
import type { EnvRegulatoryAreaRow } from './responses/EnvRegulatoryAreaDataResponse'
import { toEnvRegulatoryArea } from './responses/EnvRegulatoryAreaDataResponse'

type TabularApiResponse = {
  data: EnvRegulatoryAreaRow[]
  links: {
    next: string | undefined
  }
}

/** Kept until the env dataset is published on the Géoplateforme too. */
export function createDataGouvEnvRegulatoryAreaRepository(fetchFn: typeof fetch = fetch): EnvRegulatoryAreaRepository {
  return {
    findBySeaFronts: async (seaFronts: string[]): Promise<EnvRegulatoryArea[]> => {
      const areas: EnvRegulatoryArea[] = []
      let nextUrl: string | undefined = `${ENV_REGULATORY_AREAS_API_URL}?facade__in=${seaFronts.join(',')}`

      while (nextUrl) {
        const response = await fetchFn(nextUrl)

        if (!response.ok) {
          throw new Error(`Unable to load env regulatory areas: ${response.status}`)
        }

        const payload = (await response.json()) as TabularApiResponse
        areas.push(...(payload.data ?? []).map(toEnvRegulatoryArea))
        nextUrl = payload.links?.next
      }

      return areas
    }
  }
}
