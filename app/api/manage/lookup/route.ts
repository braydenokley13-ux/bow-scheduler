import { NextResponse } from "next/server"

import { getErrorMessage, getErrorStatus } from "@/lib/error"
import { lookupRequestSchema } from "@/lib/schemas"
import { issueManagementLinkForEmail } from "@/lib/services/scheduler"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const payload = lookupRequestSchema.parse(await request.json())
    // Do not surface whether the email matched a booking.
    await issueManagementLinkForEmail(payload.email)
    return NextResponse.json({
      success: true,
      message:
        "If that email has an interview on file, we just sent a management link. Check your inbox (and spam folder).",
    })
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: getErrorStatus(error) }
    )
  }
}
