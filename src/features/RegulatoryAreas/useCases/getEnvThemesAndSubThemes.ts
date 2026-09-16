import { getDatabase } from '@database/db'
import { getEnvThemesAndSubThemesQuery } from '@database/env/getEnvThemesAndSubThemesQuerie'
import { parseThemesAndSubThemes, type ThemesAndSubThemes } from '@utils/parseThemesAndSubThemes'

export async function getEnvThemesAndSubThemes(): Promise<ThemesAndSubThemes> {
  const db = await getDatabase()
  const rows = await getEnvThemesAndSubThemesQuery(db)

  return parseThemesAndSubThemes(rows)
}
