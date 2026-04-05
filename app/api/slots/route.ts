import { NextResponse } from "next/server"

import { getDateRange } from "@/lib/date"
import { getErrorMessage, getErrorStatus } from "@/lib/error"
import { slotQuerySchema } from "@/lib/schemas"
import { getAvailableSlots } from "@/lib/services/scheduler"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const parsed = slotQuerySchema.safeParse({
      from: url.searchParams.get("from") ?? undefined,
      to: url.searchParams.get("to") ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid date range." },
        { status: 400 }
      )
    }

    const fallbackRange = getDateRange(45)
    const slots = await getAvailableSlots({
      from: parsed.data.from ?? fallbackRange.from,
      to: parsed.data.to ?? fallbackRange.to,
    })

    return NextResponse.json(
      { slots },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    )
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: getErrorStatus(error) }
    )
  }
}
