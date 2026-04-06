import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

import {
  ADMIN_SESSION_COOKIE,
  MANAGEMENT_TOKEN_AUDIENCE,
  MANAGEMENT_TOKEN_TTL_DAYS,
} from "@/lib/constants"
import { getAuthSecret } from "@/lib/env"
import { AppError } from "@/lib/error"
import type { AdminSession, ManagementTokenPayload } from "@/lib/types"

const sessionDurationSeconds = 60 * 60 * 12
const managementTokenTtlSeconds = MANAGEMENT_TOKEN_TTL_DAYS * 24 * 60 * 60

function getSecretKey() {
  return new TextEncoder().encode(getAuthSecret())
}

export async function createAdminSessionToken() {
  const now = Math.floor(Date.now() / 1000)

  return new SignJWT({ role: "admin", issuedAt: now } satisfies AdminSession)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime(now + sessionDurationSeconds)
    .sign(getSecretKey())
}

export async function verifyAdminSessionToken(token?: string | null) {
  if (!token) {
    return null
  }

  try {
    const result = await jwtVerify(token, getSecretKey())
    const payload = result.payload as AdminSession & { exp?: number }

    if (payload.role !== "admin") {
      return null
    }

    return payload
  } catch {
    return null
  }
}

export function getSessionCookieName() {
  return ADMIN_SESSION_COOKIE
}

export function getSessionCookieOptions() {
  return {
    name: ADMIN_SESSION_COOKIE,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionDurationSeconds,
  }
}

export function getCookieValueFromHeader(cookieHeader: string | null, name: string) {
  if (!cookieHeader) {
    return null
  }

  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))

  if (!match) {
    return null
  }

  return decodeURIComponent(match.slice(name.length + 1))
}

export async function getAdminSessionFromRequest(request: Request) {
  const token = getCookieValueFromHeader(
    request.headers.get("cookie"),
    ADMIN_SESSION_COOKIE
  )

  return verifyAdminSessionToken(token)
}

export async function getAdminSessionFromCookies() {
  const cookieStore = await cookies()
  return verifyAdminSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)
}

export async function assertAdminRequest(request: Request) {
  const session = await getAdminSessionFromRequest(request)

  if (!session) {
    throw new AppError("Unauthorized", 401)
  }

  return session
}

export async function createManagementToken(payload: ManagementTokenPayload) {
  const now = Math.floor(Date.now() / 1000)

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience(MANAGEMENT_TOKEN_AUDIENCE)
    .setIssuedAt(now)
    .setExpirationTime(now + managementTokenTtlSeconds)
    .sign(getSecretKey())
}

export async function verifyManagementToken(
  token?: string | null
): Promise<ManagementTokenPayload | null> {
  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      audience: MANAGEMENT_TOKEN_AUDIENCE,
    })

    if (
      !payload ||
      payload.purpose !== "manage" ||
      typeof payload.bookingId !== "string" ||
      typeof payload.email !== "string"
    ) {
      return null
    }

    return {
      bookingId: payload.bookingId,
      email: payload.email,
      purpose: "manage",
    }
  } catch {
    return null
  }
}
