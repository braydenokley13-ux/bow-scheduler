import { describe, expect, it } from "vitest"

import { buildIcsFilename, buildInterviewIcs } from "@/lib/services/ics"
import type { BookingRecord } from "@/lib/types"

const booking: BookingRecord = {
  id: "booking-1",
  slotId: "slot-1",
  parentName: "Jordan Carter",
  studentName: "Maya Carter",
  grade: "9th Grade",
  email: "jordan@example.com",
  phone: "602-555-0142",
  formatPreference: "virtual",
  reflection:
    "Sports Economics reframed how we see incentives, tradeoffs, and long-run decisions.",
  favoriteIdea: "Opportunity cost in practice allocation",
  classTerm: "Fall 2024",
  interviewRole: "both",
  mediaConsent: true,
  bookingStatus: "scheduled",
  storyStatus: "scheduled",
  eventId: "event-1",
  meetLink: "https://meet.google.com/abc-defg-hij",
  createdAt: "2026-03-30T12:00:00.000Z",
  updatedAt: "2026-03-30T12:00:00.000Z",
  notes: "",
  slot: {
    id: "slot-1",
    date: "2026-04-02",
    startTime: "10:00",
    endTime: "10:15",
    timezone: "America/Phoenix",
    active: false,
    notes: "",
    isoStart: "2026-04-02T10:00:00-07:00",
    isoEnd: "2026-04-02T10:15:00-07:00",
    displayDate: "Thursday, April 2",
    displayTime: "10:00 AM - 10:15 AM",
  },
}

describe("buildInterviewIcs", () => {
  it("emits a VEVENT with converted UTC times and the meeting link", () => {
    const ics = buildInterviewIcs(booking)

    expect(ics).toContain("BEGIN:VCALENDAR")
    expect(ics).toContain("BEGIN:VEVENT")
    expect(ics).toContain("UID:booking-1@bow-sports-capital")
    // 10:00 Phoenix (UTC-7) == 17:00 UTC
    expect(ics).toContain("DTSTART:20260402T170000Z")
    expect(ics).toContain("DTEND:20260402T171500Z")
    expect(ics).toContain("SUMMARY:BOW Sports Economics interview")
    expect(ics).toContain("https://meet.google.com/abc-defg-hij")
    expect(ics).toContain("END:VCALENDAR")
  })

  it("escapes special characters in description", () => {
    const customBooking: BookingRecord = {
      ...booking,
      reflection: "Commas, semicolons; and newlines\nall need escaping.",
    }
    const ics = buildInterviewIcs(customBooking)
    // RFC 5545 line folding (73 chars) may split the escaped text, so flatten
    // continuation lines before asserting on the escape sequences.
    const unfolded = ics.replace(/\r\n /g, "")
    expect(unfolded).toContain("Commas\\, semicolons\\; and newlines\\nall need escaping.")
  })

  it("builds a safe filename", () => {
    expect(buildIcsFilename(booking)).toBe("bow-sports-economics-maya-carter.ics")
  })
})
