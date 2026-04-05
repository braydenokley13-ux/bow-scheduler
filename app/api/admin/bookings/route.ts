import { NextResponse } from "next/server"

import { assertAdminRequest } from "@/lib/auth"
import { getErrorMessage, getErrorStatus } from "@/lib/error"
import { getAdminSnapshot } from "@/lib/services/scheduler"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    await assertAdminRequest(request)
    const snapshot = await getAdminSnapshot()
    return NextResponse.json({ bookings: snapshot.bookings })
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: getErrorStatus(error) }
    )
  }
}
