import { NextResponse } from "next/server"

import {
  createAdminSessionToken,
  getSessionCookieOptions,
} from "@/lib/auth"
import { getAdminPassword } from "@/lib/env"
import { getErrorMessage, getErrorStatus, AppError } from "@/lib/error"
import { adminLoginSchema } from "@/lib/schemas"

export async function POST(request: Request) {
  try {
    const payload = adminLoginSchema.parse(await request.json())

    if (payload.password !== getAdminPassword()) {
      throw new AppError("Incorrect password.", 401)
    }

    const token = await createAdminSessionToken()
    const response = NextResponse.json({ success: true })
    response.cookies.set({
      ...getSessionCookieOptions(),
      value: token,
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: getErrorStatus(error) }
    )
  }
}
