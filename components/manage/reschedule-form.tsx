"use client"

import { format } from "date-fns"
import { ArrowLeft, CalendarClock, LoaderCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { AvailabilitySlot, BookingRecord } from "@/lib/types"

type Props = {
  booking: BookingRecord
  token: string
  slots: AvailabilitySlot[]
}

export function RescheduleForm({ booking, token, slots }: Props) {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = React.useState<string | undefined>()
  const [selectedSlotId, setSelectedSlotId] = React.useState<string | undefined>()
  const [submitting, setSubmitting] = React.useState(false)

  const availableDates = React.useMemo(
    () => new Set(slots.map((slot) => slot.date)),
    [slots]
  )

  const selectedDateSlots = React.useMemo(
    () => slots.filter((slot) => slot.date === selectedDate),
    [slots, selectedDate]
  )

  React.useEffect(() => {
    if (!selectedDate && slots.length > 0) {
      setSelectedDate(slots[0].date)
    }
  }, [slots, selectedDate])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedSlotId) {
      toast.error("Pick a new time first.")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/manage/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, slotId: selectedSlotId }),
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to reschedule.")
      }

      toast.success("Your interview has been rescheduled.")
      router.push(`/manage/${token}`)
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to reschedule."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-12 sm:px-8">
      <div className="space-y-3">
        <Link
          href={`/manage/${token}`}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-gold-300/80 hover:text-gold-300"
        >
          <ArrowLeft className="size-3" />
          Back to your interview
        </Link>
        <h1 className="font-display text-5xl text-cream-100 sm:text-6xl">
          Pick a new time
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          Your current interview is on{" "}
          <span className="text-cream-100">{booking.slot.displayDate}</span>{" "}
          at{" "}
          <span className="text-cream-100">{booking.slot.displayTime}</span>.
          Choose any open slot below and we&apos;ll move everything for you.
        </p>
      </div>

      <Card className="glass-card gold-ring rounded-[2rem] border-border/60">
        <CardHeader className="border-b border-border/50 pb-5">
          <CardTitle className="font-display text-3xl text-cream-100">
            Available interview times
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-7">
            <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[1.75rem] border border-border/60 bg-white/3 p-5">
                <Label className="text-xs uppercase tracking-[0.26em] text-muted-foreground">
                  Date
                </Label>
                <div className="mt-4 rounded-[1.5rem] border border-border/70 bg-background/40 p-3">
                  <Calendar
                    mode="single"
                    selected={
                      selectedDate
                        ? new Date(`${selectedDate}T12:00:00-07:00`)
                        : undefined
                    }
                    onSelect={(date) => {
                      setSelectedDate(
                        date ? format(date, "yyyy-MM-dd") : undefined
                      )
                      setSelectedSlotId(undefined)
                    }}
                    disabled={(date) =>
                      !availableDates.has(format(date, "yyyy-MM-dd"))
                    }
                    className="mx-auto"
                  />
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-border/60 bg-white/3 p-5">
                <Label className="text-xs uppercase tracking-[0.26em] text-muted-foreground">
                  Time slots
                </Label>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {selectedDateSlots.length === 0 ? (
                    <div className="col-span-full rounded-2xl border border-border/60 bg-background/40 px-4 py-5 text-sm text-muted-foreground">
                      No times left on this day. Pick another date.
                    </div>
                  ) : (
                    selectedDateSlots.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={cn(
                          "rounded-2xl border px-4 py-4 text-left",
                          selectedSlotId === slot.id
                            ? "border-gold-500/80 bg-gold-500/14"
                            : "border-border/60 bg-background/40 hover:border-gold-500/40"
                        )}
                      >
                        <p className="text-sm font-semibold text-cream-100">
                          {slot.displayTime}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                          Virtual interview
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting || !selectedSlotId}
              className="h-12 w-full justify-center rounded-full text-base font-semibold"
            >
              {submitting ? (
                <>
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                  Rescheduling
                </>
              ) : (
                <>
                  <CalendarClock className="mr-2 size-4" />
                  Confirm new time
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
