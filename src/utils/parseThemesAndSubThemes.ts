import type { EnvThemesAndSubThemesRow } from '@database/env/getEnvThemesAndSubThemesQuerie'
import { flatMap, sortBy, uniq } from 'lodash'

export type ThemesAndSubThemes = {
  themes: string[]
  subThemes: string[]
}

function splitToUniqueValues(rows: EnvThemesAndSubThemesRow[], key: keyof EnvThemesAndSubThemesRow): string[] {
  const values = flatMap(rows, row => (row[key] ?? '').split(','))
    .map(value => value.trim())
    .filter(Boolean)

  return sortBy(uniq(values), value => value.toLowerCase())
}

export function parseThemesAndSubThemes(rows: EnvThemesAndSubThemesRow[]): ThemesAndSubThemes {
  return {
    subThemes: splitToUniqueValues(rows, 'subThemes'),
    themes: splitToUniqueValues(rows, 'themes')
  }
}
