import { NextResponse } from "next/server"

import { getSessionCookieName, getSessionCookieOptions } from "@/lib/auth"

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set({
    ...getSessionCookieOptions(),
    name: getSessionCookieName(),
    value: "",
    maxAge: 0,
  })

  return response
}
