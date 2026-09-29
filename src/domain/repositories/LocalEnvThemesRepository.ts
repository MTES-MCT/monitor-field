import type { EnvTheme } from '@domain/entities/regulatoryAreas/EnvTheme'

export type LocalEnvThemesRepository = {
  findAll: () => Promise<EnvTheme[]>
  /** Makes the stored themes exactly `themes`, deleting everything else. */
  replaceAll: (themes: EnvTheme[]) => Promise<void>
}
