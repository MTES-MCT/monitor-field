export function getRegulatoryAreaLabel(id: number, featureTheme?: string, type?: string) {
  return featureTheme || type || `Zone #${id}`
}
