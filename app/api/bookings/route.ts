import { NextResponse } from "next/server"

import { getErrorMessage, getErrorStatus, AppError } from "@/lib/error"
import { bookingRequestSchema } from "@/lib/schemas"
import { createBooking } from "@/lib/services/scheduler"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const payload = bookingRequestSchema.parse(await request.json())

    if (payload.honeypot) {
      throw new AppError("Unable to process this booking.", 400)
    }

    const booking = await createBooking(payload)
    return NextResponse.json(booking)
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: getErrorStatus(error) }
    )
  }
}
