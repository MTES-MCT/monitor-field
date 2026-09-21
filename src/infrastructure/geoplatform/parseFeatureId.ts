/**
 * GeoServer emits `<layer>.<n>`, and a layer name may itself contain dots and colons
 * (`reglementation_des_peches_cartographiee.79`), hence the split on the last dot.
 */
export function parseFeatureId(featureId: string | number | undefined): number | undefined {
  if (typeof featureId === 'number') {
    return Number.isInteger(featureId) ? featureId : undefined
  }

  if (!featureId) {
    return undefined
  }

  const lastDotIndex = featureId.lastIndexOf('.')
  const rawId = lastDotIndex === -1 ? featureId : featureId.slice(lastDotIndex + 1)

  if (!/^\d+$/.test(rawId)) {
    return undefined
  }

  return Number(rawId)
}
