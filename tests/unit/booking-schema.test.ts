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
    "Sports Economics changed the way our student reasons about incentives, tradeoffs, and how decisions ripple through a team over a season.",
  favoriteIdea:
    "Opportunity cost in how coaches allocate practice minutes.",
  classTerm: "Fall 2024" as const,
  interviewRole: "both" as const,
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
