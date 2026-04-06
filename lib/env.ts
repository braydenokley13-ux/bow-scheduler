import { z } from "zod"

import type { BackendMode } from "@/lib/types"

const envSchema = z.object({
  ADMIN_PASSWORD: z.string().min(8).optional(),
  AUTH_SECRET: z.string().min(16).optional(),
  BOOKING_BACKEND_MODE: z.enum(["mock", "google"]).optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().email().optional(),
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: z.string().min(1).optional(),
  GOOGLE_SHEETS_SPREADSHEET_ID: z.string().min(1).optional(),
  GOOGLE_CALENDAR_ID: z.string().min(1).optional(),
  GOOGLE_WORKSPACE_IMPERSONATED_USER: z.string().email().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().min(1).optional(),
  EMAIL_REPLY_TO: z.string().email().optional(),
  EMAIL_ADMIN_NOTIFY: z.string().email().optional(),
})

const parsedEnv = envSchema.parse({
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  AUTH_SECRET: process.env.AUTH_SECRET,
  BOOKING_BACKEND_MODE: process.env.BOOKING_BACKEND_MODE,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY:
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
  GOOGLE_SHEETS_SPREADSHEET_ID: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
  GOOGLE_CALENDAR_ID: process.env.GOOGLE_CALENDAR_ID,
  GOOGLE_WORKSPACE_IMPERSONATED_USER:
    process.env.GOOGLE_WORKSPACE_IMPERSONATED_USER,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  EMAIL_REPLY_TO: process.env.EMAIL_REPLY_TO,
  EMAIL_ADMIN_NOTIFY: process.env.EMAIL_ADMIN_NOTIFY,
})

export function isProduction() {
  return process.env.NODE_ENV === "production"
}

export function hasGoogleConfig() {
  return Boolean(
    parsedEnv.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      parsedEnv.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
      parsedEnv.GOOGLE_SHEETS_SPREADSHEET_ID &&
      parsedEnv.GOOGLE_CALENDAR_ID
  )
}

export function hasRedisConfig() {
  return Boolean(
    parsedEnv.UPSTASH_REDIS_REST_URL && parsedEnv.UPSTASH_REDIS_REST_TOKEN
  )
}

export function getBackendMode(): BackendMode {
  if (parsedEnv.BOOKING_BACKEND_MODE) {
    return parsedEnv.BOOKING_BACKEND_MODE
  }

  return hasGoogleConfig() ? "google" : "mock"
}

export function getAdminPassword() {
  if (parsedEnv.ADMIN_PASSWORD) {
    return parsedEnv.ADMIN_PASSWORD
  }

  if (isProduction()) {
    throw new Error("Missing ADMIN_PASSWORD environment variable.")
  }

  return "preview-access"
}

export function getAuthSecret() {
  if (parsedEnv.AUTH_SECRET) {
    return parsedEnv.AUTH_SECRET
  }

  if (isProduction()) {
    throw new Error("Missing AUTH_SECRET environment variable.")
  }

  return "dev-only-bow-secret-change-before-production"
}

export function getAppOrigin() {
  return parsedEnv.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
}

export function requireGoogleConfig() {
  if (!hasGoogleConfig()) {
    throw new Error(
      "Google Sheets and Calendar credentials are not configured. Set BOOKING_BACKEND_MODE=mock for local preview or provide the required Google env vars."
    )
  }

  return {
    serviceAccountEmail: parsedEnv.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    privateKey: parsedEnv.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(
      /\\n/g,
      "\n"
    ),
    spreadsheetId: parsedEnv.GOOGLE_SHEETS_SPREADSHEET_ID!,
    calendarId: parsedEnv.GOOGLE_CALENDAR_ID!,
    impersonatedUser: parsedEnv.GOOGLE_WORKSPACE_IMPERSONATED_USER,
  }
}

export function hasResendConfig() {
  return Boolean(parsedEnv.RESEND_API_KEY && parsedEnv.EMAIL_FROM)
}

export function getEmailConfig() {
  return {
    apiKey: parsedEnv.RESEND_API_KEY,
    from: parsedEnv.EMAIL_FROM ?? "BOW Sports Capital <no-reply@localhost>",
    replyTo: parsedEnv.EMAIL_REPLY_TO,
    adminNotify: parsedEnv.EMAIL_ADMIN_NOTIFY,
  }
}

export function requireRedisConfig() {
  if (!hasRedisConfig()) {
    throw new Error(
      "Missing Vercel KV / Upstash Redis credentials. Provide UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN."
    )
  }

  return {
    url: parsedEnv.UPSTASH_REDIS_REST_URL!,
    token: parsedEnv.UPSTASH_REDIS_REST_TOKEN!,
  }
}
