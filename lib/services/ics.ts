import type { BookingRecord } from "@/lib/types"

/**
 * Minimal RFC 5545 ICS VEVENT builder for BOW Sports Economics interviews.
 * We keep this dependency-free so it works in any runtime.
 */

function escapeText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
}

function toIcsDate(isoWithOffset: string) {
  // Input looks like "2026-04-02T10:00:00-07:00". We convert to UTC and format as
  // YYYYMMDDTHHMMSSZ per RFC 5545.
  const date = new Date(isoWithOffset)
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  )
}

function foldLine(line: string) {
  // RFC 5545 recommends folding at 75 octets. Be conservative.
  if (line.length <= 73) return line
  const chunks: string[] = []
  let index = 0
  while (index < line.length) {
    const chunk = line.slice(index, index + 73)
    chunks.push(index === 0 ? chunk : ` ${chunk}`)
    index += 73
  }
  return chunks.join("\r\n")
}

export function buildInterviewIcs(booking: BookingRecord) {
  const dtStamp = toIcsDate(new Date().toISOString())
  const dtStart = toIcsDate(booking.slot.isoStart)
  const dtEnd = toIcsDate(booking.slot.isoEnd)
  const uid = `${booking.id}@bow-sports-capital`

  const summary = `BOW Sports Economics interview — ${booking.studentName}`
  const description = [
    "BOW Sports Capital · Sports Economics Story Interview",
    "",
    `Student: ${booking.studentName}`,
    `Parent: ${booking.parentName}`,
    `Grade: ${booking.grade}`,
    `Class term: ${booking.classTerm}`,
    `On the call: ${booking.interviewRole}`,
    "",
    "One idea from class you want to talk about:",
    booking.favoriteIdea,
    "",
    "Longer reflection:",
    booking.reflection,
    booking.meetLink ? `\nMeeting link: ${booking.meetLink}` : "",
  ]
    .filter(Boolean)
    .join("\n")

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BOW Sports Capital//Sports Economics Scheduler//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:${escapeText(description)}`,
    booking.meetLink ? `URL:${booking.meetLink}` : null,
    `ORGANIZER;CN=BOW Sports Capital:mailto:bow@bowsportscapital.com`,
    `ATTENDEE;CN=${escapeText(
      booking.parentName
    )};RSVP=TRUE:mailto:${booking.email}`,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter((line): line is string => Boolean(line))
    .map(foldLine)

  return lines.join("\r\n") + "\r\n"
}

export function buildIcsFilename(booking: BookingRecord) {
  const safe = booking.studentName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()
  return `bow-sports-economics-${safe || booking.id}.ics`
}
