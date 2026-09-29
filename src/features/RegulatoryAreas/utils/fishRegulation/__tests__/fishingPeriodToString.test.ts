import type { FishingPeriod } from '@domain/entities/regulatoryAreas/FishRegulation'
import { fishingPeriodToString, toArrayString } from '../fishingPeriodToString'

const EMPTY_PERIOD: FishingPeriod = { dateRanges: [], dates: [], timeIntervals: [], weekdays: [] }

describe('toArrayString', () => {
  it('joins words as a French enumeration', () => {
    expect(toArrayString([])).toBeUndefined()
    expect(toArrayString(['a'])).toBe('a')
    expect(toArrayString(['a', 'b'])).toBe('a et b')
    expect(toArrayString(['a', 'b', 'c'])).toBe('a, b et c')
  })
})

describe('fishingPeriodToString', () => {
  it('returns undefined without content', () => {
    expect(fishingPeriodToString(undefined)).toBeUndefined()
    expect(fishingPeriodToString({ ...EMPTY_PERIOD, authorized: true })).toBeUndefined()
  })

  it('describes a forbidden period in all times', () => {
    expect(fishingPeriodToString({ ...EMPTY_PERIOD, always: true, authorized: false })).toBe(
      'Pêche interdite en tous temps'
    )
  })

  it('describes yearly date ranges and time intervals', () => {
    expect(
      fishingPeriodToString({
        ...EMPTY_PERIOD,
        annualRecurrence: true,
        authorized: true,
        dateRanges: [{ endDate: '2026-12-31T00:00:00.000', startDate: '2026-10-15T00:00:00.000' }],
        timeIntervals: [{ from: '08h00', to: '20h00' }]
      })
    ).toBe('Pêche autorisée tous les ans du 15 octobre au 31 décembre, de 08h00 à 20h00')
  })

  it('describes dates, weekdays, holidays and daytime', () => {
    expect(
      fishingPeriodToString({
        ...EMPTY_PERIOD,
        authorized: false,
        dates: ['2026-07-14T00:00:00.000'],
        daytime: true,
        holidays: true,
        weekdays: ['samedi', 'dimanche']
      })
    ).toBe(
      'Pêche interdite le 14 juillet 2026, les samedi et dimanche, les jours fériés, du lever au coucher du soleil'
    )
  })

  it('ignores invalid dates', () => {
    expect(
      fishingPeriodToString({
        ...EMPTY_PERIOD,
        authorized: false,
        dateRanges: [{ endDate: '2026-12-31T00:00:00.000', startDate: 'not a date' }],
        dates: ['not a date', '2026-07-14T00:00:00.000']
      })
    ).toBe('Pêche interdite le 14 juillet 2026')
  })

  it('ignores empty weekdays', () => {
    expect(fishingPeriodToString({ ...EMPTY_PERIOD, authorized: true, weekdays: ['', 'lundi'] })).toBe(
      'Pêche autorisée le lundi'
    )
    expect(fishingPeriodToString({ ...EMPTY_PERIOD, authorized: true, weekdays: [''] })).toBeUndefined()
  })
})
