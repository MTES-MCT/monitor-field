import { ENV_REGULATORY_AREAS_TABLE } from '@database/db.schema'
import type { DB } from '@op-engineering/op-sqlite'
import { logSentryError } from '@utils/sentryLogger'

export type EnvThemesAndSubThemesRow = {
  themes: string | null
  subThemes: string | null
}

export async function getEnvThemesAndSubThemesQuery(db: DB): Promise<EnvThemesAndSubThemesRow[]> {
  try {
    const result = await db.execute(
      `
          SELECT DISTINCT
            env.themes,
            env.sub_themes as subThemes
          FROM ${ENV_REGULATORY_AREAS_TABLE} AS env
        `,
      []
    )

    return result.rows as EnvThemesAndSubThemesRow[]
  } catch (error) {
    logSentryError(error, 'Error fetching Env themes and sub-themes')
    return []
  }
}
