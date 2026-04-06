import { describe, expect, it } from "vitest"

import { createManagementToken, verifyManagementToken } from "@/lib/auth"

describe("management tokens", () => {
  it("round-trips a payload", async () => {
    const token = await createManagementToken({
      bookingId: "booking-abc",
      email: "family@example.com",
      purpose: "manage",
    })
    const payload = await verifyManagementToken(token)
    expect(payload).toEqual({
      bookingId: "booking-abc",
      email: "family@example.com",
      purpose: "manage",
    })
  })

  it("rejects garbage tokens", async () => {
    expect(await verifyManagementToken("not-a-token")).toBeNull()
    expect(await verifyManagementToken(undefined)).toBeNull()
  })
})
