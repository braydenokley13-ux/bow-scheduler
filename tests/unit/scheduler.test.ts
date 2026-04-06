import { beforeEach, describe, expect, it } from "vitest"

import { AppError } from "@/lib/error"
import { createBooking, getAvailableSlots } from "@/lib/services/scheduler"
import { resetMockStore } from "@/lib/services/store"

describe("scheduler service", () => {
  beforeEach(() => {
    process.env.BOOKING_BACKEND_MODE = "mock"
    resetMockStore()
  })

  it("books an available slot and removes it from the public inventory", async () => {
    const slot = (await getAvailableSlots())[0]

    const result = await createBooking({
      parentName: "Jordan Carter",
      studentName: "Maya Carter",
      grade: "8th Grade",
      email: "jordan@example.com",
      phone: "602-555-0142",
      formatPreference: "virtual",
      reflection:
        "Sports Economics changed the way our student reasons about incentives, tradeoffs, and how decisions ripple across a season.",
      favoriteIdea: "Opportunity cost in practice allocation.",
      classTerm: "Fall 2024",
      interviewRole: "both",
      slotId: slot.id,
      mediaConsent: true,
      honeypot: "",
    })

    const remainingSlots = await getAvailableSlots()

    expect(result.booking.slotId).toBe(slot.id)
    expect(result.booking.meetLink).toContain("https://meet.google.com/")
    expect(remainingSlots.find((candidate) => candidate.id === slot.id)).toBeUndefined()
  })

  it("rejects duplicate bookings for the same slot", async () => {
    const slot = (await getAvailableSlots())[0]

    await createBooking({
      parentName: "Jordan Carter",
      studentName: "Maya Carter",
      grade: "8th Grade",
      email: "jordan@example.com",
      phone: "602-555-0142",
      formatPreference: "virtual",
      reflection:
        "Sports Economics changed the way our student reasons about incentives, tradeoffs, and how decisions ripple across a season.",
      favoriteIdea: "Opportunity cost in practice allocation.",
      classTerm: "Fall 2024",
      interviewRole: "both",
      slotId: slot.id,
      mediaConsent: true,
      honeypot: "",
    })

    await expect(
      createBooking({
        parentName: "Casey Morgan",
        studentName: "Leo Morgan",
        grade: "7th Grade",
        email: "casey@example.com",
        phone: "602-555-0165",
        formatPreference: "virtual",
        reflection:
          "We noticed a real shift in how our student reasons about incentives and risk in games after Sports Economics.",
        favoriteIdea: "Marginal utility in late-game decisions.",
        classTerm: "Spring 2024",
        interviewRole: "parent",
        slotId: slot.id,
        mediaConsent: true,
        honeypot: "",
      })
    ).rejects.toBeInstanceOf(AppError)
  })
})
