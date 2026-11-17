function toDegreesMinutesSeconds(value: number, degreesWidth: number, positive: string, negative: string): string {
  const totalSeconds = Math.round(Math.abs(value) * 3600)
  const degrees = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const pad = (n: number, width = 2) => String(n).padStart(width, '0')
  const hemisphere = value >= 0 ? positive : negative

  return `${pad(degrees, degreesWidth)}° ${pad(minutes)}′ ${pad(seconds)}″ ${hemisphere}`
}

/**
 * Formats a WGS84 position as degrees/minutes/seconds, latitude first:
 * `47° 12′ 05″ N 002° 03′ 10″ W`.
 */
export function formatCoordinates({ latitude, longitude }: { latitude: number; longitude: number }): string {
  const lat = toDegreesMinutesSeconds(latitude, 2, 'N', 'S')
  const lon = toDegreesMinutesSeconds(longitude, 3, 'E', 'W')

  return `${lat} ${lon}`
}
