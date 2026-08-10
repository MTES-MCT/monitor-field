import { getDatabase } from '@database/db'
import { syncEnvRegulatoryAreas } from '@database/env/envRegulatoryAreasSync'
import { syncFishRegulatoryAreas } from '@database/fish/fishRegulatoryAreasSync'

export async function syncRegulatoryAreasDB(facades: string[]) {
  const database = await getDatabase()
  await Promise.allSettled([
    // oxlint-disable-next-line no-console
    syncFishRegulatoryAreas(database, facades).catch(e => console.warn('Unable to sync fish regulatory areas', e)),
    // oxlint-disable-next-line no-console
    syncEnvRegulatoryAreas(database, facades).catch(e => console.warn('Unable to sync env regulatory areas', e))
  ])
}
