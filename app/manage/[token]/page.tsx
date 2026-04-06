import type { Metadata } from "next"
import Link from "next/link"

import { ManagePanel } from "@/components/manage/manage-panel"
import type { BookingRecord } from "@/lib/types"
import { getAppOrigin } from "@/lib/env"
import { AppError } from "@/lib/error"
import { getBookingFromToken } from "@/lib/services/scheduler"

export const metadata: Metadata = {
  title: "Manage your interview",
  robots: { index: false, follow: false },
}

type PageProps = {
  params: Promise<{ token: string }>
}

type LoadResult =
  | { ok: true; booking: BookingRecord; icsUrl: string }
  | { ok: false; message: string }

async function loadBookingForToken(token: string): Promise<LoadResult> {
  try {
    const { booking } = await getBookingFromToken(token)
    const icsUrl = `${getAppOrigin()}/api/bookings/${booking.id}/ics?token=${token}`
    return { ok: true, booking, icsUrl }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof AppError
          ? error.message
          : "This management link is invalid or has expired.",
    }
  }
}

export default async function ManagePage({ params }: PageProps) {
  const { token } = await params
  const result = await loadBookingForToken(token)

  if (result.ok) {
    return (
      <ManagePanel
        booking={result.booking}
        token={token}
        icsUrl={result.icsUrl}
      />
    )
  }

  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
      <div className="glass-card rounded-[2rem] border border-border/60 px-8 py-10">
        <p className="text-xs uppercase tracking-[0.34em] text-gold-300/80">
          BOW Sports Capital
        </p>
        <h1 className="mt-4 font-display text-4xl text-cream-100">
          Link unavailable
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          {result.message}
        </p>
        <Link
          href="/manage/lookup"
          className="mt-8 inline-flex items-center justify-center rounded-full border border-gold-500/40 bg-gold-500/10 px-6 py-3 text-sm font-semibold text-cream-100 hover:bg-gold-500/15"
        >
          Request a new link
        </Link>
      </div>
    </main>
  )
}
