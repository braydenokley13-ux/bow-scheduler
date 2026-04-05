import { sortSlots } from "@/lib/date"
import { AppError } from "@/lib/error"
import type {
  AvailabilitySlot,
  BookingMutationInput,
  BookingRecord,
  BookingRequest,
  BookingSuccessResponse,
  SlotMutationInput,
} from "@/lib/types"
import { createInterviewEvent, cancelInterviewEvent, updateInterviewEvent } from "@/lib/services/calendar"
import { acquireSlotLock } from "@/lib/services/locks"
import {
  getSchedulerStore,
  toDisplaySlot,
  type StoredBooking,
  type StoredSlot,
} from "@/lib/services/store"

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

function buildSuccessResponse(booking: BookingRecord): BookingSuccessResponse {
  return {
    booking,
    summary: {
      title: "Your BOW story interview is reserved",
      message:
        "We have reserved your family interview and sent the calendar invitation. Thank you for helping us highlight the growth, curiosity, and discipline BOW brings to student-athletes.",
      nextSteps: [
        "Check your inbox for the calendar invitation and meeting link.",
        "Bring one or two moments that best capture how BOW changed the way your student thinks about sports.",
        "If your story is selected for publication, BOW will follow up for approval before anything is shared publicly.",
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
      booking.slotId === slotId &&
      booking.bookingStatus === "scheduled"
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

export async function createBooking(input: BookingRequest): Promise<BookingSuccessResponse> {
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
      })

      const hydrated = hydrateBooking(booking, [
        {
          ...slot,
          active: false,
        },
      ])

      return buildSuccessResponse(hydrated)
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
