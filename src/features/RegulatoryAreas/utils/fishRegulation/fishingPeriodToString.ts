import type { FishingPeriod } from '@domain/entities/regulatoryAreas/FishRegulation'
import dayjs from 'dayjs'
import 'dayjs/locale/fr'

export function toArrayString(array: string[]): string | undefined {
  if (array.length === 0) {
    return undefined
  }
  if (array.length === 1) {
    return array[0]
  }

  return `${array.slice(0, -1).join(', ')} et ${array[array.length - 1]}`
}

// `Intl` is unreliable on Hermes, hence `dayjs`.
function dateToString(date: string, isYearly = false): string | undefined {
  const day = dayjs(date)
  if (!day.isValid()) {
    return undefined
  }

  return day.locale('fr').format(isYearly ? 'D MMMM' : 'D MMMM YYYY')
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined
}

export function fishingPeriodToString(fishingPeriod: FishingPeriod | undefined): string | undefined {
  if (!fishingPeriod) {
    return undefined
  }

  const { always, annualRecurrence, authorized, dateRanges, dates, daytime, holidays, timeIntervals, weekdays } =
    fishingPeriod

  const textArray: string[] = []
  if (always) {
    textArray.push('en tous temps')
  }

  const dateRangesText = toArrayString(
    dateRanges
      .map(({ endDate, startDate }) => {
        const start = startDate ? dateToString(startDate, !!annualRecurrence) : undefined
        const end = endDate ? dateToString(endDate, !!annualRecurrence) : undefined

        return start && end ? `du ${start} au ${end}` : undefined
      })
      .filter(isDefined)
  )
  if (dateRangesText) {
    textArray.push(annualRecurrence ? `tous les ans ${dateRangesText}` : dateRangesText)
  }

  const datesText = toArrayString(
    dates
      .map(date => dateToString(date))
      .filter(isDefined)
      .map(date => `le ${date}`)
  )
  if (datesText) {
    textArray.push(datesText)
  }

  const validWeekdays = weekdays.filter(Boolean)
  if (validWeekdays.length > 0) {
    textArray.push(`le${validWeekdays.length > 1 ? 's' : ''} ${toArrayString(validWeekdays)}`)
  }

  if (holidays) {
    textArray.push('les jours fériés')
  }

  if (timeIntervals.length > 0) {
    const timeIntervalsText = toArrayString(
      timeIntervals.map(({ from, to }) => (from && to ? `de ${from} à ${to}` : undefined)).filter(isDefined)
    )
    if (timeIntervalsText) {
      textArray.push(timeIntervalsText)
    }
  } else if (daytime) {
    textArray.push('du lever au coucher du soleil')
  }

  if (textArray.length === 0) {
    return undefined
  }

  return `Pêche ${authorized ? 'autorisée' : 'interdite'} ${textArray.join(', ')}`
}
