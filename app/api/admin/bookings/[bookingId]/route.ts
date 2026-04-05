import { NextResponse } from "next/server"

import { assertAdminRequest } from "@/lib/auth"
import { getErrorMessage, getErrorStatus } from "@/lib/error"
import { bookingMutationSchema } from "@/lib/schemas"
import { updateAdminBooking } from "@/lib/services/scheduler"

export const runtime = "nodejs"

type RouteContext = {
  params: Promise<{
    bookingId: string
  }>
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await assertAdminRequest(request)
    const { bookingId } = await context.params
    const payload = bookingMutationSchema.parse(await request.json())
    const booking = await updateAdminBooking(bookingId, payload)
    return NextResponse.json({ booking })
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: getErrorStatus(error) }
    )
  }
}
