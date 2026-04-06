"use client"

import {
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Download,
  LoaderCircle,
  Pencil,
  X,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { BookingRecord } from "@/lib/types"

type ManagePanelProps = {
  booking: BookingRecord
  token: string
  icsUrl: string
}

export function ManagePanel({ booking, token, icsUrl }: ManagePanelProps) {
  const router = useRouter()
  const [isCancelling, setIsCancelling] = React.useState(false)
  const [cancelled, setCancelled] = React.useState(
    booking.bookingStatus === "cancelled"
  )

  const handleCancel = async () => {
    if (
      !window.confirm(
        "Are you sure you want to cancel your BOW Sports Economics interview?"
      )
    ) {
      return
    }

    setIsCancelling(true)
    try {
      const response = await fetch("/api/manage/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to cancel this interview.")
      }

      setCancelled(true)
      toast.success("Your interview has been cancelled.")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to cancel this interview."
      )
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-4xl flex-col gap-8 px-5 py-12 sm:px-8">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.34em] text-gold-300/80">
          BOW Sports Capital · Sports Economics
        </p>
        <h1 className="font-display text-5xl text-cream-100 sm:text-6xl">
          Manage your interview
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          Everything about your booking lives here. Download the invite, change
          the time, or cancel if life happens.
        </p>
      </div>

      <Card className="glass-card gold-ring rounded-[2rem] border-border/60">
        <CardHeader className="space-y-3 border-b border-border/50 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="font-display text-3xl text-cream-100">
              {cancelled
                ? "This interview is cancelled"
                : "You're on the schedule"}
            </CardTitle>
            <span
              className={
                cancelled
                  ? "rounded-full border border-destructive/40 bg-destructive/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-destructive-foreground"
                  : "rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-gold-300"
              }
            >
              {cancelled ? "Cancelled" : "Confirmed"}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-7 pt-7">
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4 rounded-[1.75rem] border border-border/60 bg-white/3 p-6">
              <div className="flex items-start gap-3">
                <CalendarClock className="mt-1 size-5 text-gold-300" />
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">
                    When
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-cream-100">
                    {booking.slot.displayDate}
                  </p>
                  <p className="text-base text-gold-300">
                    {booking.slot.displayTime}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/45 p-4 text-sm leading-7 text-muted-foreground">
                <p>
                  <strong className="text-cream-100">Student:</strong>{" "}
                  {booking.studentName}
                </p>
                <p>
                  <strong className="text-cream-100">Parent:</strong>{" "}
                  {booking.parentName}
                </p>
                <p>
                  <strong className="text-cream-100">Class term:</strong>{" "}
                  {booking.classTerm}
                </p>
                <p>
                  <strong className="text-cream-100">On the call:</strong>{" "}
                  {booking.interviewRole}
                </p>
              </div>
            </div>

            <div className="space-y-4 rounded-[1.75rem] border border-border/60 bg-white/3 p-6">
              <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">
                Actions
              </p>
              {!cancelled && (
                <>
                  <Button
                    asChild
                    className="h-12 w-full justify-center rounded-full text-sm font-semibold"
                  >
                    <Link href={`/manage/${token}/reschedule`}>
                      <Pencil className="mr-2 size-4" />
                      Reschedule to a new time
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-12 w-full justify-center rounded-full border-border/80 bg-transparent text-sm font-semibold"
                  >
                    <a href={icsUrl}>
                      <Download className="mr-2 size-4" />
                      Download calendar invite (.ics)
                    </a>
                  </Button>
                  {booking.meetLink && (
                    <Button
                      asChild
                      variant="outline"
                      className="h-12 w-full justify-center rounded-full border-border/80 bg-transparent text-sm font-semibold"
                    >
                      <a
                        href={booking.meetLink}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <CalendarDays className="mr-2 size-4" />
                        Open meeting link
                      </a>
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isCancelling}
                    className="h-12 w-full justify-center rounded-full text-sm font-semibold"
                    onClick={handleCancel}
                  >
                    {isCancelling ? (
                      <>
                        <LoaderCircle className="mr-2 size-4 animate-spin" />
                        Cancelling
                      </>
                    ) : (
                      <>
                        <X className="mr-2 size-4" />
                        Cancel this interview
                      </>
                    )}
                  </Button>
                </>
              )}
              {cancelled && (
                <div className="space-y-3 rounded-2xl border border-border/60 bg-background/45 p-4 text-sm leading-7 text-muted-foreground">
                  <div className="flex items-center gap-2 text-cream-100">
                    <CheckCircle2 className="size-4 text-gold-300" /> Cancelled
                  </div>
                  <p>
                    The calendar invite has been withdrawn. If you change your
                    mind, you can book a new time anytime.
                  </p>
                  <Button
                    asChild
                    className="h-10 w-full justify-center rounded-full text-sm font-semibold"
                    onClick={() => router.refresh()}
                  >
                    <Link href="/share-your-bow-story">
                      Book another time
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-border/60 bg-background/45 p-5 text-sm leading-7 text-muted-foreground">
            <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">
              One idea you want to talk about
            </p>
            <p className="mt-2 text-cream-100">{booking.favoriteIdea}</p>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
