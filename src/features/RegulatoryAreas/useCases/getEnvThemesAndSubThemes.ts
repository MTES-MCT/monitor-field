import type { EnvTheme } from '@domain/entities/regulatoryAreas/EnvTheme'
import { getThemes } from '@domain/useCases/regulatoryAreas/getThemes'
import { getRegulatoryAreasDependencies } from '@infrastructure/di/regulatoryAreas'

export async function getEnvThemesAndSubThemes(): Promise<EnvTheme[]> {
  const dependencies = await getRegulatoryAreasDependencies()

  return getThemes(dependencies)
}
