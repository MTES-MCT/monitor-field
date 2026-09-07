import { OfflineManager } from '@maplibre/maplibre-react-native'
import { useEffect, useState } from 'react'
import { useMMKVString } from 'react-native-mmkv'
import { storage } from '@storage'
import { parseSeaFronts } from '@utils/parseSeaFronts'

const MAP_STYLE_URL = process.env.EXPO_PUBLIC_MAP_STYLE_URL || ''

const OFFLINE_PACKS: { bounds: [number, number, number, number]; name: string; seaFronts: string[] }[] = [
  { bounds: [-5.5, 41.0, 10.0, 51.5], name: 'france-metropolitaine', seaFronts: ['MED', 'MEMN', 'NAMO', 'SA'] },
  { bounds: [-61.9, 15.8, -61.0, 16.6], name: 'guadeloupe', seaFronts: ['Guadeloupe'] },
  {
    bounds: [-63.2, 17.8, -62.8, 18.2],
    name: 'saint-barthelemy-saint-martin',
    seaFronts: ['Saint-Barthélemy', 'Saint-Martin']
  },
  { bounds: [-61.3, 14.3, -60.8, 14.9], name: 'martinique', seaFronts: ['Martinique'] },
  { bounds: [-54.6, 2.1, -51.6, 5.8], name: 'guyane', seaFronts: ['Guyane'] },
  { bounds: [55.2, -21.4, 55.9, -20.8], name: 'reunion', seaFronts: ['La Réunion'] },
  { bounds: [44.9, -13.1, 45.3, -12.6], name: 'mayotte', seaFronts: ['Mayotte'] },
  { bounds: [-56.5, 46.7, -56.1, 47.2], name: 'saint-pierre-miquelon', seaFronts: ['Saint-Pierre et Miquelon'] },
  { bounds: [-110.1, 10.1, -109.1, 10.4], name: 'clipperton', seaFronts: ['Clipperton'] },
  { bounds: [163.0, -22.7, 167.5, -20.0], name: 'nouvelle-caledonie', seaFronts: ['Nouvelle-Calédonie'] },
  { bounds: [-149.7, -17.9, -149.1, -17.4], name: 'polynesie-francaise', seaFronts: ['Polynésie Française'] },
  { bounds: [-178.2, -14.4, -176.1, -13.1], name: 'wallis-et-futuna', seaFronts: ['Wallis-et-Futuna'] },
  { bounds: [68.0, -50.0, 70.5, -48.5], name: 'taaf', seaFronts: ['TAAF'] },
  { bounds: [39.6, -22.4, 47.4, -11.5], name: 'ocean-indien', seaFronts: ['Océan Indien Hors ZEE'] }
]

export const BASE_MAP_STYLE = {
  layers: [{ id: 'cartoLight', source: 'cartoLight', type: 'raster' as const }],
  sources: {
    cartoLight: {
      attribution: '&copy OpenStreetMap contributors &copy CARTO',
      tileSize: 256,
      tiles: ['https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'],
      type: 'raster' as const
    }
  },
  version: 8 as const
}

// 300 MB ambient cache for tiles visited while connected
const AMBIENT_CACHE_SIZE = 300 * 1024 * 1024

type OfflineStatus = 'idle' | 'downloading' | 'complete' | 'error'

export function useOfflineMap() {
  const [status, setStatus] = useState<OfflineStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [selectedSeaFrontsRaw] = useMMKVString('selectedSeaFronts', storage)

  useEffect(() => {
    const selectedSeaFronts = parseSeaFronts(selectedSeaFrontsRaw)
    const packsToDownload = OFFLINE_PACKS.filter(pack =>
      pack.seaFronts.some(seaFront => selectedSeaFronts.includes(seaFront))
    )
    OfflineManager.setMaximumAmbientCacheSize(AMBIENT_CACHE_SIZE).catch(() => {})
    OfflineManager.setTileCountLimit(75000)

    async function initOfflinePacks() {
      const existingPacks = await OfflineManager.getPacks()
      const existingNames = existingPacks.map(p => p.metadata?.['name'])

      let totalProgress = 0
      const packCount = packsToDownload.length

      if (packCount === 0) {
        setStatus('complete')
        return
      }

      for (const packDef of packsToDownload) {
        const existing = existingPacks.find(p => p.metadata?.['name'] === packDef.name)

        if (existing) {
          const packStatus = await existing.status()
          if (packStatus.state === 'complete') {
            totalProgress += 1 / packCount
            setProgress(totalProgress)
            continue
          }

          setStatus('downloading')
          await existing.resume()
          await new Promise<void>(resolve => {
            OfflineManager.addListener(
              existing.id,
              (_pack, progress) => {
                setProgress(totalProgress + progress.percentage / 100 / packCount)
                if (progress.state === 'complete') {
                  totalProgress += 1 / packCount
                  resolve()
                }
              },
              () => {
                setStatus('error')
                resolve()
              }
            )
          })
          continue
        }

        if (existingNames.includes(packDef.name)) continue

        setStatus('downloading')
        await OfflineManager.createPack(
          {
            bounds: packDef.bounds,
            mapStyle: MAP_STYLE_URL,
            maxZoom: 10,
            metadata: { name: packDef.name },
            minZoom: 0
          },
          (_pack, packStatus) => {
            setProgress(totalProgress + packStatus.percentage / 100 / packCount)
            if (packStatus.state === 'complete') {
              totalProgress += 1 / packCount
            }
          },
          () => {
            setStatus('error')
          }
        )
      }

      setStatus('complete')
      setProgress(1)
    }

    initOfflinePacks().catch(() => {
      setStatus('error')
    })
  }, [selectedSeaFrontsRaw])

  return { progress, status }
}
