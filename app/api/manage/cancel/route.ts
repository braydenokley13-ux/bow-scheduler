import { NextResponse } from "next/server"

import { getErrorMessage, getErrorStatus } from "@/lib/error"
import { manageCancelSchema } from "@/lib/schemas"
import { cancelBookingByToken } from "@/lib/services/scheduler"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const payload = manageCancelSchema.parse(await request.json())
    const booking = await cancelBookingByToken(payload.token)
    return NextResponse.json({ booking })
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: getErrorStatus(error) }
    )
  }
}
