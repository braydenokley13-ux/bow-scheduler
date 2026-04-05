import { describe, expect, it } from "vitest"

import { bookingRequestSchema } from "@/lib/schemas"

const basePayload = {
  parentName: "Jordan Carter",
  studentName: "Maya Carter",
  grade: "8th Grade",
  email: "jordan@example.com",
  phone: "602-555-0142",
  formatPreference: "virtual" as const,
  reflection:
    "BOW changed the way our student thinks about preparation, discipline, and how to ask better questions after each competition.",
  slotId: "slot-123",
  mediaConsent: true,
  honeypot: "",
}

describe("bookingRequestSchema", () => {
  it("accepts a complete valid booking payload", () => {
    const result = bookingRequestSchema.safeParse(basePayload)
    expect(result.success).toBe(true)
  })

  it("rejects submissions without consent", () => {
    const result = bookingRequestSchema.safeParse({
      ...basePayload,
      mediaConsent: false,
    })

    expect(result.success).toBe(false)
  })
})
