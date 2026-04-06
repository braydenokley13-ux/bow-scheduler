import type { Metadata } from "next"

import { RescheduleForm } from "@/components/manage/reschedule-form"
import { AppError } from "@/lib/error"
import {
  getAvailableSlots,
  getBookingFromToken,
} from "@/lib/services/scheduler"
import type { AvailabilitySlot, BookingRecord } from "@/lib/types"

export const metadata: Metadata = {
  title: "Reschedule your interview",
  robots: { index: false, follow: false },
}

type PageProps = {
  params: Promise<{ token: string }>
}

type LoadResult =
  | { ok: true; booking: BookingRecord; slots: AvailabilitySlot[] }
  | { ok: false; message: string }

async function loadContext(token: string): Promise<LoadResult> {
  try {
    const { booking } = await getBookingFromToken(token)
    const slots = await getAvailableSlots()
    return { ok: true, booking, slots }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof AppError
          ? error.message
          : "This reschedule link is invalid or has expired.",
    }
  }
}

export default async function ReschedulePage({ params }: PageProps) {
  const { token } = await params
  const result = await loadContext(token)

  if (result.ok) {
    return (
      <RescheduleForm
        booking={result.booking}
        token={token}
        slots={result.slots}
      />
    )
  }

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
      <div className="glass-card rounded-[2rem] border border-border/60 px-8 py-10">
        <h1 className="font-display text-4xl text-cream-100">
          Link unavailable
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          {result.message}
        </p>
      </div>
    </main>
  )
}
