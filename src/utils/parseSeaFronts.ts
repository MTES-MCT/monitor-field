export function parseSeaFronts(value: string | undefined) {
  return value?.split(',').filter(Boolean) ?? []
}
