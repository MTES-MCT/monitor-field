import { getDatabase } from "@database/db";
import { syncFishRegulatoryAreas } from "@database/fish/fishRegulatoryAreasSync";

export async function syncFishRegulatoryAreasDB() {
  const database = await getDatabase();
  return await syncFishRegulatoryAreas(database);
}
