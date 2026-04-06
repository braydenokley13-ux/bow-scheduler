import { NextResponse } from "next/server"

import { verifyManagementToken } from "@/lib/auth"
import { getErrorMessage, getErrorStatus, AppError } from "@/lib/error"
import { getBookingFromToken } from "@/lib/services/scheduler"
import { buildInterviewIcs, buildIcsFilename } from "@/lib/services/ics"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type RouteContext = {
  params: Promise<{ bookingId: string }>
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { bookingId } = await context.params
    const url = new URL(request.url)
    const token = url.searchParams.get("token")

    if (!token) {
      throw new AppError("Missing management token.", 401)
    }

    const payload = await verifyManagementToken(token)
    if (!payload || payload.bookingId !== bookingId) {
      throw new AppError("Invalid or expired calendar link.", 401)
    }

    const { booking } = await getBookingFromToken(token)
    const ics = buildInterviewIcs(booking)

    return new NextResponse(ics, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${buildIcsFilename(booking)}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: getErrorStatus(error) }
    )
  }
}
