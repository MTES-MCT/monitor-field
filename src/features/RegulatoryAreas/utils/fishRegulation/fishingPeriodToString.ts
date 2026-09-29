import type { DateInterval, FishingPeriod, TimeInterval } from '@domain/entities/regulatoryAreas/FishRegulation'
import dayjs from 'dayjs'
import 'dayjs/locale/fr'

export function fishingPeriodToString(fishingPeriod: FishingPeriod | undefined): string | undefined {
  if (!fishingPeriod) {
    return undefined
  }

  const clauses = [
    describeAlways(fishingPeriod.always),
    describeDateRanges(fishingPeriod.dateRanges, !!fishingPeriod.annualRecurrence),
    describeDates(fishingPeriod.dates),
    describeWeekdays(fishingPeriod.weekdays),
    describeHolidays(fishingPeriod.holidays),
    describeHours(fishingPeriod.timeIntervals, fishingPeriod.daytime)
  ].filter(isDefined)

  if (clauses.length === 0) {
    return undefined
  }

  return `Pêche ${fishingPeriod.authorized ? 'autorisée' : 'interdite'} ${clauses.join(', ')}`
}

export function joinAsFrenchList(words: string[]): string | undefined {
  if (words.length <= 1) {
    return words[0]
  }

  return `${words.slice(0, -1).join(', ')} et ${words[words.length - 1]}`
}

function describeAlways(always: boolean | null | undefined): string | undefined {
  return always ? 'en tous temps' : undefined
}

function describeDateRanges(dateRanges: DateInterval[], isYearly: boolean): string | undefined {
  const ranges = joinAsFrenchList(dateRanges.map(range => describeDateRange(range, isYearly)).filter(isDefined))
  if (!ranges) {
    return undefined
  }

  return isYearly ? `tous les ans ${ranges}` : ranges
}

function describeDateRange({ endDate, startDate }: DateInterval, isYearly: boolean): string | undefined {
  const start = formatDate(startDate, isYearly)
  const end = formatDate(endDate, isYearly)

  return start && end ? `du ${start} au ${end}` : undefined
}

function describeDates(dates: string[]): string | undefined {
  return joinAsFrenchList(
    dates
      .map(date => formatDate(date, false))
      .filter(isDefined)
      .map(date => `le ${date}`)
  )
}

function describeWeekdays(weekdays: string[]): string | undefined {
  const days = weekdays.filter(Boolean)
  if (days.length === 0) {
    return undefined
  }

  return `le${days.length > 1 ? 's' : ''} ${joinAsFrenchList(days)}`
}

function describeHolidays(holidays: boolean | null | undefined): string | undefined {
  return holidays ? 'les jours fériés' : undefined
}

// Explicit time intervals take precedence over daytime, as in MonitorFish.
function describeHours(timeIntervals: TimeInterval[], daytime: boolean | null | undefined): string | undefined {
  if (timeIntervals.length > 0) {
    return joinAsFrenchList(timeIntervals.map(describeTimeInterval).filter(isDefined))
  }

  return daytime ? 'du lever au coucher du soleil' : undefined
}

function describeTimeInterval({ from, to }: TimeInterval): string | undefined {
  return from && to ? `de ${from} à ${to}` : undefined
}

// `Intl` is unreliable on Hermes, hence `dayjs`.
function formatDate(date: string | null | undefined, isYearly: boolean): string | undefined {
  if (!date) {
    return undefined
  }

  const day = dayjs(date)
  if (!day.isValid()) {
    return undefined
  }

  return day.locale('fr').format(isYearly ? 'D MMMM' : 'D MMMM YYYY')
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined
}
