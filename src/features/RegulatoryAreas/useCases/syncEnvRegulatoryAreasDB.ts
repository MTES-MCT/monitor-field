import { getDatabase } from '@database/db'
import { syncEnvRegulatoryAreas } from '@database/env/envRegulatoryAreasSync'

export async function syncEnvRegulatoryAreasDB() {
  const database = await getDatabase()
  return await syncEnvRegulatoryAreas(database)
}
