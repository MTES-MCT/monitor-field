import type { EnvTheme } from '@domain/entities/regulatoryAreas/EnvTheme'
import type { LocalEnvThemesRepository } from '@domain/repositories/LocalEnvThemesRepository'

export type GetThemesDependencies = {
  envThemesRepository: LocalEnvThemesRepository
}

export async function getThemes({ envThemesRepository }: GetThemesDependencies): Promise<EnvTheme[]> {
  return envThemesRepository.findAll()
}
