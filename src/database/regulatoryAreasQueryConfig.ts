/** Hard upper bound on how many areas a single query may return, to keep the bridge/UI bounded. */
export const MAX_REGULATORY_AREAS_PER_QUERY = 1500

/**
 * Minimum bbox side (in degrees) a feature needs to be worth listing at `zoom` (≈2px).
 * Below this the feature is sub-pixel and is culled, so a country-scale viewport never loads
 * thousands of invisible areas.
 */
export function minimumVisibleBboxSize(zoom: number | undefined): number {
  if (zoom === undefined) {
    return 0
  }

  // 360° of longitude = 512 * 2^zoom px in Web Mercator.
  return 1.40625 / 2 ** zoom
}
