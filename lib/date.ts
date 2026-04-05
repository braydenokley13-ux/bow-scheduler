import { addDays, format, isWeekend, startOfDay } from "date-fns"

import { BOW_OFFSET, BOW_TIMEZONE } from "@/lib/constants"
import type { AvailabilitySlot } from "@/lib/types"

export function buildPhoenixDate(date: string, time = "12:00") {
  return new Date(`${date}T${time}:00${BOW_OFFSET}`)
}

export function toIsoStart(date: string, time: string) {
  return `${date}T${time}:00${BOW_OFFSET}`
}

export function normalizeSlot(slot: {
  id: string
  date: string
  startTime: string
  endTime: string
  active: boolean
  notes?: string
}): AvailabilitySlot {
  return {
    ...slot,
    timezone: BOW_TIMEZONE,
    isoStart: toIsoStart(slot.date, slot.startTime),
    isoEnd: toIsoStart(slot.date, slot.endTime),
    displayDate: format(buildPhoenixDate(slot.date), "EEEE, MMMM d"),
    displayTime: `${format(buildPhoenixDate(slot.date, slot.startTime), "h:mm a")} - ${format(
      buildPhoenixDate(slot.date, slot.endTime),
      "h:mm a"
    )}`,
  }
}

export function sortSlots(slots: AvailabilitySlot[]) {
  return [...slots].sort((left, right) => left.isoStart.localeCompare(right.isoStart))
}

export function getDateRange(daysAhead = 30) {
  const from = format(startOfDay(new Date()), "yyyy-MM-dd")
  const to = format(addDays(startOfDay(new Date()), daysAhead), "yyyy-MM-dd")

  return { from, to }
}

export function buildUpcomingWeekdayDates(count = 10) {
  const dates: string[] = []
  let cursor = startOfDay(new Date())

  while (dates.length < count) {
    if (!isWeekend(cursor)) {
      dates.push(format(cursor, "yyyy-MM-dd"))
    }

    cursor = addDays(cursor, 1)
  }

  return dates
}
