import { formatCoordinates } from '../formatCoordinates'

describe('formatCoordinates', () => {
  it('formats a position in the north-west quadrant', () => {
    expect(formatCoordinates({ latitude: 47.2014, longitude: -2.0528 })).toBe('47° 12′ 05″ N 002° 03′ 10″ W')
  })

  it('formats a position in the south-east quadrant', () => {
    expect(formatCoordinates({ latitude: -21.115, longitude: 55.5364 })).toBe('21° 06′ 54″ S 055° 32′ 11″ E')
  })

  it('pads degrees to 2 digits for latitude and 3 digits for longitude', () => {
    expect(formatCoordinates({ latitude: 5, longitude: 7 })).toBe('05° 00′ 00″ N 007° 00′ 00″ E')
  })

  it('does not pad longitude degrees above 99', () => {
    expect(formatCoordinates({ latitude: 0, longitude: -151.5 })).toBe('00° 00′ 00″ N 151° 30′ 00″ W')
  })

  it('treats zero as north and east', () => {
    expect(formatCoordinates({ latitude: 0, longitude: 0 })).toBe('00° 00′ 00″ N 000° 00′ 00″ E')
  })

  it('formats the extreme values', () => {
    expect(formatCoordinates({ latitude: 90, longitude: 180 })).toBe('90° 00′ 00″ N 180° 00′ 00″ E')
    expect(formatCoordinates({ latitude: -90, longitude: -180 })).toBe('90° 00′ 00″ S 180° 00′ 00″ W')
  })

  it('rounds to the nearest second', () => {
    // 10.00013888… = 10° 00′ 00.5″ → rounds up to 01″
    expect(formatCoordinates({ latitude: 10 + 0.5 / 3600, longitude: 0 })).toBe('10° 00′ 01″ N 000° 00′ 00″ E')
    // 10.0000416… = 10° 00′ 00.15″ → rounds down to 00″
    expect(formatCoordinates({ latitude: 10 + 0.15 / 3600, longitude: 0 })).toBe('10° 00′ 00″ N 000° 00′ 00″ E')
  })

  it('carries rounded seconds over to minutes and degrees', () => {
    // 59′ 59.9″ rounds to 60″, which must become the next degree
    expect(formatCoordinates({ latitude: 47 + 3599.9 / 3600, longitude: 0 })).toBe('48° 00′ 00″ N 000° 00′ 00″ E')
  })
})
