import { NextResponse } from "next/server"

import { assertAdminRequest } from "@/lib/auth"
import { getErrorMessage, getErrorStatus } from "@/lib/error"
import { slotMutationSchema } from "@/lib/schemas"
import { createAdminSlot, getAdminSnapshot } from "@/lib/services/scheduler"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    await assertAdminRequest(request)
    const snapshot = await getAdminSnapshot()
    return NextResponse.json({ slots: snapshot.slots })
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: getErrorStatus(error) }
    )
  }
}

export async function POST(request: Request) {
  try {
    await assertAdminRequest(request)
    const payload = slotMutationSchema.parse(await request.json())
    const slot = await createAdminSlot(payload)
    return NextResponse.json({ slot })
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: getErrorStatus(error) }
    )
  }
}
