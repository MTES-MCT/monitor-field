import type { DB } from '@op-engineering/op-sqlite'
import type { EnvTheme } from '@domain/entities/regulatoryAreas/EnvTheme'
import type { LocalEnvThemesRepository } from '@domain/repositories/LocalEnvThemesRepository'

type ThemeRow = {
  sub_theme_name: string | null
  theme_name: string
}

function toEnvThemes(rows: ThemeRow[]): EnvTheme[] {
  const subThemesByTheme = new Map<string, string[]>()

  for (const row of rows) {
    const subThemes = subThemesByTheme.get(row.theme_name) ?? []

    if (row.sub_theme_name) {
      subThemes.push(row.sub_theme_name)
    }
    subThemesByTheme.set(row.theme_name, subThemes)
  }

  return Array.from(subThemesByTheme.entries()).map(([name, subThemes]) => ({ name, subThemes }))
}

export function createSqliteEnvThemesRepository(db: DB): LocalEnvThemesRepository {
  return {
    findAll: async () => {
      const result = await db.execute(
        `
          SELECT themes.name AS theme_name, sub_themes.name AS sub_theme_name
          FROM themes
          LEFT JOIN sub_themes ON sub_themes.theme_id = themes.id
          ORDER BY themes.name, sub_themes.name
        `
      )

      return toEnvThemes((result.rows ?? []) as unknown as ThemeRow[])
    },

    replaceAll: async (themes: EnvTheme[]) => {
      await db.transaction(async tx => {
        await tx.execute('DELETE FROM sub_themes')
        await tx.execute('DELETE FROM themes')

        for (const theme of themes) {
          const insertResult = await tx.execute('INSERT INTO themes (name) VALUES (?)', [theme.name])
          const themeId = insertResult.insertId

          if (themeId === undefined) {
            continue
          }

          for (const subTheme of theme.subThemes) {
            await tx.execute('INSERT INTO sub_themes (theme_id, name) VALUES (?, ?)', [themeId, subTheme])
          }
        }
      })
    }
  }
}
