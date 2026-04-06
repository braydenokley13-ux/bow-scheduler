import {
  createManagementToken,
  verifyManagementToken,
} from "@/lib/auth"
import { sortSlots } from "@/lib/date"
import { getAppOrigin } from "@/lib/env"
import { AppError } from "@/lib/error"
import {
  cancelInterviewEvent,
  createInterviewEvent,
  updateInterviewEvent,
} from "@/lib/services/calendar"
import {
  sendBookingConfirmationEmail,
  sendCancellationEmail,
  sendManagementLinkEmail,
  sendRescheduleConfirmationEmail,
} from "@/lib/services/email"
import { acquireSlotLock } from "@/lib/services/locks"
import {
  getSchedulerStore,
  toDisplaySlot,
  type StoredBooking,
  type StoredSlot,
} from "@/lib/services/store"
import type {
  AvailabilitySlot,
  BookingMutationInput,
  BookingRecord,
  BookingRequest,
  BookingSuccessResponse,
  SlotMutationInput,
} from "@/lib/types"

function hydrateBooking(booking: StoredBooking, slots: StoredSlot[]): BookingRecord {
  const slot = slots.find((candidate) => candidate.id === booking.slotId)

  if (!slot) {
    throw new AppError("The booking references a slot that no longer exists.", 500)
  }

  return {
    ...booking,
    slot: toDisplaySlot(slot),
  }
}

async function buildSuccessResponse(
  booking: BookingRecord
): Promise<BookingSuccessResponse> {
  const manageToken = await createManagementToken({
    bookingId: booking.id,
    email: booking.email,
    purpose: "manage",
  })

  const origin = getAppOrigin()
  const manageUrl = `${origin}/manage/${manageToken}`
  const icsUrl = `${origin}/api/bookings/${booking.id}/ics?token=${manageToken}`

  return {
    booking,
    manageToken,
    manageUrl,
    icsUrl,
    summary: {
      title: "You're on the schedule",
      message:
        "We reserved your Sports Economics interview and sent a calendar invitation to your email. Come ready with one idea from class that stuck with you — that's the conversation we want to have.",
      nextSteps: [
        "Check your inbox for the confirmation email and calendar invite.",
        "Think of one concept from Sports Economics that changed the way you look at a game, an incentive, or a decision.",
        "Use the management link in the email if you ever need to reschedule or cancel.",
      ],
    },
  }
}

export async function getAvailableSlots(range?: {
  from?: string
  to?: string
}): Promise<AvailabilitySlot[]> {
  const store = getSchedulerStore()
  const slots = await store.listSlots(range)

  return sortSlots(slots.filter((slot) => slot.active).map((slot) => toDisplaySlot(slot)))
}

export async function getAdminSnapshot() {
  const store = getSchedulerStore()
  const [slots, bookings] = await Promise.all([store.listSlots(), store.listBookings()])

  return {
    slots: sortSlots(slots.map((slot) => toDisplaySlot(slot))),
    bookings: bookings
      .map((booking) => hydrateBooking(booking, slots))
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
  }
}

export async function createAdminSlot(input: SlotMutationInput) {
  const store = getSchedulerStore()
  const slot = await store.createSlot(input)
  return toDisplaySlot(slot)
}

export async function updateAdminSlot(slotId: string, input: SlotMutationInput) {
  const store = getSchedulerStore()
  const bookings = await store.listBookings()
  const hasActiveBooking = bookings.some(
    (booking) =>
      booking.slotId === slotId && booking.bookingStatus === "scheduled"
  )

  if (hasActiveBooking) {
    throw new AppError(
      "This slot is already tied to a scheduled interview. Use the booking reschedule flow instead.",
      409
    )
  }

  const slot = await store.updateSlot(slotId, input)
  return toDisplaySlot(slot)
}

export async function deleteAdminSlot(slotId: string) {
  const store = getSchedulerStore()
  const bookings = await store.listBookings()
  const linkedBooking = bookings.some((booking) => booking.slotId === slotId)

  if (linkedBooking) {
    throw new AppError(
      "This slot is linked to an interview record and cannot be removed.",
      409
    )
  }

  await store.deleteSlot(slotId)
}

export async function createBooking(
  input: BookingRequest
): Promise<BookingSuccessResponse> {
  const store = getSchedulerStore()
  const lock = await acquireSlotLock(input.slotId)

  try {
    const slot = await store.findSlot(input.slotId)

    if (!slot || !slot.active) {
      throw new AppError(
        "That interview slot is no longer available. Please choose another time.",
        409
      )
    }

    const displaySlot = toDisplaySlot(slot)
    const event = await createInterviewEvent(input, displaySlot)

    try {
      await store.updateSlot(slot.id, {
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        active: false,
        notes: slot.notes,
      })

      const booking = await store.createBooking({
        slotId: slot.id,
        parentName: input.parentName,
        studentName: input.studentName,
        grade: input.grade,
        email: input.email,
        phone: input.phone,
        formatPreference: input.formatPreference,
        reflection: input.reflection,
        mediaConsent: input.mediaConsent,
        bookingStatus: "scheduled",
        storyStatus: "scheduled",
        eventId: event.eventId,
        meetLink: event.meetLink,
        notes: "",
        classTerm: input.classTerm,
        interviewRole: input.interviewRole,
        favoriteIdea: input.favoriteIdea,
      })

      const hydrated = hydrateBooking(booking, [
        {
          ...slot,
          active: false,
        },
      ])

      const response = await buildSuccessResponse(hydrated)

      await sendBookingConfirmationEmail(hydrated, response.manageUrl).catch(
        (error) => console.warn("[email] confirmation failed:", error)
      )

      return response
    } catch (error) {
      await cancelInterviewEvent(event.eventId).catch(() => undefined)
      await store.updateSlot(slot.id, {
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        active: true,
        notes: slot.notes,
      })
      throw error
    }
  } finally {
    await lock.release()
  }
}

export async function updateAdminBooking(
  bookingId: string,
  updates: BookingMutationInput
) {
  const store = getSchedulerStore()
  const booking = await store.findBooking(bookingId)

  if (!booking) {
    throw new AppError("We could not find that booking.", 404)
  }

  const slots = await store.listSlots()
  const currentSlot = slots.find((slot) => slot.id === booking.slotId)

  if (!currentSlot) {
    throw new AppError("The current booking slot could not be found.", 500)
  }

  if (updates.slotId && updates.slotId !== booking.slotId) {
    const lock = await acquireSlotLock(updates.slotId)

    try {
      const nextSlot = await store.findSlot(updates.slotId)

      if (!nextSlot || !nextSlot.active) {
        throw new AppError("The new slot is no longer available.", 409)
      }

      const hydrated = hydrateBooking(booking, slots)
      await updateInterviewEvent(hydrated, toDisplaySlot(nextSlot))

      await store.updateSlot(currentSlot.id, {
        date: currentSlot.date,
        startTime: currentSlot.startTime,
        endTime: currentSlot.endTime,
        active: true,
        notes: currentSlot.notes,
      })

      await store.updateSlot(nextSlot.id, {
        date: nextSlot.date,
        startTime: nextSlot.startTime,
        endTime: nextSlot.endTime,
        active: false,
        notes: nextSlot.notes,
      })

      const updated = await store.updateBooking(bookingId, {
        ...updates,
        slotId: nextSlot.id,
      })

      const snapshot = await store.listSlots()
      return hydrateBooking(updated, snapshot)
    } finally {
      await lock.release()
    }
  }

  if (updates.bookingStatus === "cancelled") {
    await cancelInterviewEvent(booking.eventId).catch(() => undefined)
    await store.updateSlot(currentSlot.id, {
      date: currentSlot.date,
      startTime: currentSlot.startTime,
      endTime: currentSlot.endTime,
      active: true,
      notes: currentSlot.notes,
    })
  }

  const updated = await store.updateBooking(bookingId, updates)
  const snapshot = await store.listSlots()

  return hydrateBooking(updated, snapshot)
}

async function findBookingRecordById(bookingId: string) {
  const store = getSchedulerStore()
  const booking = await store.findBooking(bookingId)

  if (!booking) {
    throw new AppError("We could not find that booking.", 404)
  }

  const slots = await store.listSlots()
  return hydrateBooking(booking, slots)
}

export async function getBookingFromToken(token: string) {
  const payload = await verifyManagementToken(token)
  if (!payload) {
    throw new AppError(
      "This management link is invalid or has expired. Request a new one from the lookup page.",
      401
    )
  }

  const booking = await findBookingRecordById(payload.bookingId)

  if (booking.email.toLowerCase() !== payload.email.toLowerCase()) {
    throw new AppError("This management link is no longer valid.", 401)
  }

  return { booking, token }
}

export async function rescheduleBookingByToken(token: string, newSlotId: string) {
  const { booking } = await getBookingFromToken(token)

  if (booking.bookingStatus === "cancelled") {
    throw new AppError(
      "This interview was already cancelled. Book a new time from the main page.",
      409
    )
  }

  if (booking.slotId === newSlotId) {
    return booking
  }

  const updated = await updateAdminBooking(booking.id, { slotId: newSlotId })
  const origin = getAppOrigin()
  const manageUrl = `${origin}/manage/${token}`

  await sendRescheduleConfirmationEmail(updated, manageUrl).catch((error) =>
    console.warn("[email] reschedule notice failed:", error)
  )

  return updated
}

export async function cancelBookingByToken(token: string) {
  const { booking } = await getBookingFromToken(token)

  if (booking.bookingStatus === "cancelled") {
    return booking
  }

  const updated = await updateAdminBooking(booking.id, {
    bookingStatus: "cancelled",
  })

  await sendCancellationEmail(updated).catch((error) =>
    console.warn("[email] cancellation notice failed:", error)
  )

  return updated
}

export async function issueManagementLinkForEmail(email: string) {
  // We always report success to avoid account enumeration.
  const normalized = email.toLowerCase().trim()
  const store = getSchedulerStore()
  const bookings = await store.listBookings()
  const matching = bookings
    .filter((booking) => booking.email.toLowerCase() === normalized)
    .filter((booking) => booking.bookingStatus !== "cancelled")

  if (matching.length === 0) {
    return { sent: 0 }
  }

  for (const booking of matching) {
    const token = await createManagementToken({
      bookingId: booking.id,
      email: booking.email,
      purpose: "manage",
    })
    const manageUrl = `${getAppOrigin()}/manage/${token}`
    const slots = await store.listSlots()
    const hydrated = hydrateBooking(booking, slots)

    await sendManagementLinkEmail(hydrated, manageUrl).catch((error) =>
      console.warn("[email] management link failed:", error)
    )
  }

  return { sent: matching.length }
}
