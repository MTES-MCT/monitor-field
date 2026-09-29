import type { EnvRegulatoryArea } from '@domain/entities/regulatoryAreas/EnvRegulatoryArea'
import type { EnvTheme } from '@domain/entities/regulatoryAreas/EnvTheme'

// Convertit le repr Python (quotes mixtes, simples ou doubles) en JSON valide,
// puis parse. Gère les apostrophes échappées (\') et les valeurs entre guillemets doubles.
function pythonDictToJson(raw: string): string {
  return raw.replace(/'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"/g, (_match, single, double) =>
    JSON.stringify(single !== undefined ? single.replace(/\\'/g, "'") : double)
  )
}

function parseAreaThemes(rawThemes: string): EnvTheme[] {
  const parsed: Record<string, string[]> = JSON.parse(pythonDictToJson(rawThemes))

  return Object.entries(parsed).map(([name, subThemes]) => ({
    name,
    subThemes
  }))
}

/** Aggregates the themes/sub-themes found across all areas into a deduplicated, sorted list. */
export function extractEnvThemesFromAreas(areas: Pick<EnvRegulatoryArea, 'themes'>[]): EnvTheme[] {
  const subThemesByTheme = new Map<string, Set<string>>()

  for (const area of areas) {
    if (!area.themes) {
      continue
    }

    for (const { name, subThemes } of parseAreaThemes(area.themes)) {
      const existingSubThemes = subThemesByTheme.get(name) ?? new Set<string>()

      subThemes.forEach(subTheme => existingSubThemes.add(subTheme))
      subThemesByTheme.set(name, existingSubThemes)
    }
  }

  return Array.from(subThemesByTheme.entries())
    .map(([name, subThemes]) => ({ name, subThemes: Array.from(subThemes).sort() }))
    .sort((a, b) => a.name.localeCompare(b.name))
}
