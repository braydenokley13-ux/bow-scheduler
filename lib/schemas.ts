import { z } from "zod"

import {
  bookingStatuses,
  interviewFormats,
  storyStatuses,
} from "@/lib/constants"

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.")
const timeString = z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM.")

export const slotQuerySchema = z.object({
  from: dateString.optional(),
  to: dateString.optional(),
})

export const bookingRequestSchema = z.object({
  parentName: z.string().trim().min(2).max(80),
  studentName: z.string().trim().min(2).max(80),
  grade: z.string().trim().min(1).max(32),
  email: z.string().trim().email(),
  phone: z
    .string()
    .trim()
    .min(10)
    .max(24)
    .regex(/^[0-9+()\-\s]+$/, "Enter a valid phone number."),
  formatPreference: z.enum(interviewFormats),
  reflection: z.string().trim().min(20).max(700),
  slotId: z.string().trim().min(1),
  mediaConsent: z.boolean().refine((value) => value, {
    message:
      "Please confirm that BOW may contact you for publication approval before sharing any story publicly.",
  }),
  honeypot: z.string().trim().max(0).optional().default(""),
})

export const adminLoginSchema = z.object({
  password: z.string().min(1),
})

export const slotMutationSchema = z
  .object({
    date: dateString,
    startTime: timeString,
    endTime: timeString,
    active: z.boolean().default(true),
    notes: z.string().trim().max(240).optional().default(""),
  })
  .refine((value) => value.endTime > value.startTime, {
    message: "End time must be after the start time.",
    path: ["endTime"],
  })

export const bookingMutationSchema = z
  .object({
    bookingStatus: z.enum(bookingStatuses).optional(),
    storyStatus: z.enum(storyStatuses).optional(),
    notes: z.string().trim().max(1000).optional(),
    slotId: z.string().trim().min(1).optional(),
  })
  .refine(
    (value) =>
      Boolean(
        value.bookingStatus ||
          value.storyStatus ||
          value.notes !== undefined ||
          value.slotId
      ),
    {
      message: "Provide at least one booking update.",
    }
  )
