import { NextResponse } from "next/server"

import { getErrorMessage, getErrorStatus } from "@/lib/error"
import { manageRescheduleSchema } from "@/lib/schemas"
import { rescheduleBookingByToken } from "@/lib/services/scheduler"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const payload = manageRescheduleSchema.parse(await request.json())
    const booking = await rescheduleBookingByToken(payload.token, payload.slotId)
    return NextResponse.json({ booking })
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: getErrorStatus(error) }
    )
  }
}
