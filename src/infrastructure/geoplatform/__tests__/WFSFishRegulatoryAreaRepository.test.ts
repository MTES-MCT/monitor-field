import { WFS_PAGE_SIZE } from '../buildWfsQuery'
import { createWFSFishRegulatoryAreaRepository } from '../WFSFishRegulatoryAreaRepository'
import { FISH_REGULATORY_AREAS_RESPONSE } from './__fixtures__/fishRegulatoryAreasResponse'

jest.mock('@utils/sentryLogger', () => ({
  logSentryError: jest.fn(),
  logToSentry: jest.fn()
}))

function jsonResponse(body: unknown) {
  return { json: async () => body, ok: true, status: 200 } as Response
}

function createFetchStub(pages: unknown[]) {
  const urls: string[] = []

  const fetchFn = (async (url: string) => {
    urls.push(url)

    return jsonResponse(pages[urls.length - 1] ?? { features: [] })
  }) as unknown as typeof fetch

  return { fetchFn, urls }
}

function buildPage(featureCount: number, startId = 0) {
  return {
    features: Array.from({ length: featureCount }, (_, index) => ({
      geometry: {
        coordinates: [
          [
            [0, 0],
            [0, 1],
            [1, 1],
            [0, 0]
          ]
        ],
        type: 'Polygon'
      },
      id: `layer.${startId + index}`,
      properties: { reglementations: '', thematique: '', type_de_reglementation: 'Reg. NAMO', zone: '' },
      type: 'Feature'
    })),
    numberReturned: featureCount,
    type: 'FeatureCollection'
  }
}

describe('createWFSFishRegulatoryAreaRepository', () => {
  describe('findBySeaFronts', () => {
    it('maps a recorded response onto domain entities', async () => {
      const { fetchFn } = createFetchStub([FISH_REGULATORY_AREAS_RESPONSE])

      const areas = await createWFSFishRegulatoryAreaRepository(fetchFn).findBySeaFronts(['NAMO'])

      expect(areas).toHaveLength(2)
      expect(areas[0]).toMatchObject({ id: 1, type: 'Reg. NAMO', zone: 'Banc de Maërl - Zone interdite à la pêche' })
      expect(areas[1]).toMatchObject({ id: 2, zone: 'Gisement Rance Côte d’Armor' })
    })

    it('skips a feature whose id has no numeric suffix rather than failing the sync', async () => {
      const { fetchFn } = createFetchStub([FISH_REGULATORY_AREAS_RESPONSE])

      const areas = await createWFSFishRegulatoryAreaRepository(fetchFn).findBySeaFronts(['NAMO'])

      expect(areas.map(area => area.id)).toEqual([1, 2])
    })

    it('filters on the prefixed regulation type, single-quoted', async () => {
      const { fetchFn, urls } = createFetchStub([FISH_REGULATORY_AREAS_RESPONSE])

      await createWFSFishRegulatoryAreaRepository(fetchFn).findBySeaFronts(['NAMO', 'MEMN'])

      expect(new URL(urls[0]!).searchParams.get('CQL_FILTER')).toBe(
        "type_de_reglementation IN ('Reg. NAMO','Reg. MEMN')"
      )
    })

    describe('paging', () => {
      it('stops after a single short page', async () => {
        const { fetchFn, urls } = createFetchStub([FISH_REGULATORY_AREAS_RESPONSE])

        await createWFSFishRegulatoryAreaRepository(fetchFn).findBySeaFronts(['NAMO'])

        expect(urls).toHaveLength(1)
      })

      it('follows on to the next page when a page comes back full', async () => {
        const { fetchFn, urls } = createFetchStub([buildPage(WFS_PAGE_SIZE), buildPage(3, WFS_PAGE_SIZE)])

        const areas = await createWFSFishRegulatoryAreaRepository(fetchFn).findBySeaFronts(['NAMO'])

        expect(areas).toHaveLength(WFS_PAGE_SIZE + 3)
        expect(urls).toHaveLength(2)
        expect(new URL(urls[0]!).searchParams.get('startIndex')).toBe('0')
        expect(new URL(urls[1]!).searchParams.get('startIndex')).toBe(String(WFS_PAGE_SIZE))
      })

      it('stops on an empty page', async () => {
        const { fetchFn, urls } = createFetchStub([buildPage(WFS_PAGE_SIZE), buildPage(0)])

        const areas = await createWFSFishRegulatoryAreaRepository(fetchFn).findBySeaFronts(['NAMO'])

        expect(areas).toHaveLength(WFS_PAGE_SIZE)
        expect(urls).toHaveLength(2)
      })
    })

    it('throws on a non-2xx response', async () => {
      const fetchFn = (async () => ({ json: async () => ({}), ok: false, status: 400 })) as unknown as typeof fetch

      await expect(createWFSFishRegulatoryAreaRepository(fetchFn).findBySeaFronts(['NAMO'])).rejects.toThrow(
        'Unable to load fish regulatory areas: 400'
      )
    })

    it('never sets Accept-Encoding, which would stop OkHttp decompressing gzip', async () => {
      const calls: unknown[] = []
      const fetchFn = (async (_url: string, init?: RequestInit) => {
        calls.push(init)

        return jsonResponse(FISH_REGULATORY_AREAS_RESPONSE)
      }) as unknown as typeof fetch

      await createWFSFishRegulatoryAreaRepository(fetchFn).findBySeaFronts(['NAMO'])

      expect(calls).toEqual([undefined])
    })
  })
})
