import { NextResponse } from "next/server"

import { assertAdminRequest } from "@/lib/auth"
import { getErrorMessage, getErrorStatus } from "@/lib/error"
import { slotMutationSchema } from "@/lib/schemas"
import { deleteAdminSlot, updateAdminSlot } from "@/lib/services/scheduler"

export const runtime = "nodejs"

type RouteContext = {
  params: Promise<{
    slotId: string
  }>
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await assertAdminRequest(request)
    const { slotId } = await context.params
    const payload = slotMutationSchema.parse(await request.json())
    const slot = await updateAdminSlot(slotId, payload)
    return NextResponse.json({ slot })
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: getErrorStatus(error) }
    )
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    await assertAdminRequest(request)
    const { slotId } = await context.params
    await deleteAdminSlot(slotId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: getErrorStatus(error) }
    )
  }
}
