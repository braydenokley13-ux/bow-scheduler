import { google } from "googleapis"

import { getBackendMode, requireGoogleConfig } from "@/lib/env"
import type { AvailabilitySlot, BookingRequest, BookingRecord } from "@/lib/types"

type CalendarEventResult = {
  eventId: string
  meetLink?: string
}

async function getCalendarClient() {
  const { serviceAccountEmail, privateKey, impersonatedUser } =
    requireGoogleConfig()

  const auth = new google.auth.JWT({
    email: serviceAccountEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/calendar"],
    subject: impersonatedUser,
  })

  return google.calendar({ version: "v3", auth })
}

function buildEventDescription(input: BookingRequest) {
  return [
    "BOW Sports Capital selected family interview",
    "",
    `Parent: ${input.parentName}`,
    `Student: ${input.studentName}`,
    `Grade: ${input.grade}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone}`,
    "",
    "Parent reflection",
    input.reflection,
    "",
    "Publication note",
    "BOW may follow up separately for story approval before anything is shared publicly.",
  ].join("\n")
}

export async function createInterviewEvent(
  input: BookingRequest,
  slot: AvailabilitySlot
): Promise<CalendarEventResult> {
  if (getBackendMode() === "mock") {
    return {
      eventId: `mock-${slot.id}`,
      meetLink: `https://meet.google.com/${slot.id.slice(0, 3)}-${slot.id.slice(
        3,
        7
      )}-${slot.id.slice(7, 10)}`,
    }
  }

  const calendar = await getCalendarClient()
  const { calendarId } = requireGoogleConfig()

  const response = await calendar.events.insert({
    calendarId,
    conferenceDataVersion: 1,
    sendUpdates: "all",
    requestBody: {
      summary: `BOW Sports Capital family interview: ${input.studentName}`,
      description: buildEventDescription(input),
      start: {
        dateTime: slot.isoStart,
        timeZone: slot.timezone,
      },
      end: {
        dateTime: slot.isoEnd,
        timeZone: slot.timezone,
      },
      attendees: [{ email: input.email }],
      conferenceData: {
        createRequest: {
          requestId: crypto.randomUUID(),
        },
      },
    },
  })

  return {
    eventId: response.data.id ?? crypto.randomUUID(),
    meetLink:
      response.data.hangoutLink ??
      response.data.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri ??
      undefined,
  }
}

export async function updateInterviewEvent(
  booking: BookingRecord,
  slot: AvailabilitySlot
) {
  if (getBackendMode() === "mock" || !booking.eventId) {
    return {
      eventId: booking.eventId ?? `mock-${slot.id}`,
      meetLink: booking.meetLink,
    }
  }

  const calendar = await getCalendarClient()
  const { calendarId } = requireGoogleConfig()

  const response = await calendar.events.patch({
    calendarId,
    eventId: booking.eventId,
    sendUpdates: "all",
    requestBody: {
      start: {
        dateTime: slot.isoStart,
        timeZone: slot.timezone,
      },
      end: {
        dateTime: slot.isoEnd,
        timeZone: slot.timezone,
      },
    },
  })

  return {
    eventId: response.data.id ?? booking.eventId,
    meetLink:
      response.data.hangoutLink ??
      response.data.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri ??
      booking.meetLink,
  }
}

export async function cancelInterviewEvent(eventId?: string) {
  if (!eventId || getBackendMode() === "mock") {
    return
  }

  const calendar = await getCalendarClient()
  const { calendarId } = requireGoogleConfig()

  await calendar.events.delete({
    calendarId,
    eventId,
    sendUpdates: "all",
  })
}
