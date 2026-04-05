import { describe, expect, it } from "vitest"

import { normalizeSlot } from "@/lib/date"

describe("normalizeSlot", () => {
  it("maps a raw slot into iso and display fields", () => {
    const slot = normalizeSlot({
      id: "slot-1",
      date: "2026-04-02",
      startTime: "10:00",
      endTime: "10:15",
      active: true,
      notes: "Reserved for growth story interviews.",
    })

    expect(slot.isoStart).toBe("2026-04-02T10:00:00-07:00")
    expect(slot.isoEnd).toBe("2026-04-02T10:15:00-07:00")
    expect(slot.displayDate).toContain("April")
    expect(slot.displayTime).toContain("10:00 AM")
  })
})
