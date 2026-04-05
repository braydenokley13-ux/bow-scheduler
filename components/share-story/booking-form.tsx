"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { addDays, format } from "date-fns"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, CalendarClock, LoaderCircle, ShieldCheck } from "lucide-react"
import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import type { z } from "zod"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { bookingRequestSchema } from "@/lib/schemas"
import type { AvailabilitySlot, BookingSuccessResponse } from "@/lib/types"
import { cn } from "@/lib/utils"

type BookingFormValues = z.input<typeof bookingRequestSchema>

const defaultValues: BookingFormValues = {
  parentName: "",
  studentName: "",
  grade: "",
  email: "",
  phone: "",
  formatPreference: "virtual",
  reflection: "",
  slotId: "",
  mediaConsent: false,
  honeypot: "",
}

export function BookingForm() {
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingRequestSchema),
    defaultValues,
  })

  const [slots, setSlots] = React.useState<AvailabilitySlot[]>([])
  const [selectedDate, setSelectedDate] = React.useState<string>()
  const [selectedSlotId, setSelectedSlotId] = React.useState<string>()
  const [loadingSlots, setLoadingSlots] = React.useState(true)
  const [slotError, setSlotError] = React.useState<string | null>(null)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<BookingSuccessResponse | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const loadSlots = React.useEffectEvent(async () => {
    setLoadingSlots(true)
    setSlotError(null)

    const from = format(new Date(), "yyyy-MM-dd")
    const to = format(addDays(new Date(), 45), "yyyy-MM-dd")

    try {
      const response = await fetch(`/api/slots?from=${from}&to=${to}`, {
        cache: "no-store",
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load interview slots.")
      }

      setSlots(payload.slots)
    } catch (error) {
      setSlotError(
        error instanceof Error ? error.message : "Unable to load interview slots."
      )
    } finally {
      setLoadingSlots(false)
    }
  })

  React.useEffect(() => {
    void loadSlots()
  }, [])

  React.useEffect(() => {
    const availableDates = [...new Set(slots.map((slot) => slot.date))].sort()

    if (!availableDates.length) {
      setSelectedDate(undefined)
      setSelectedSlotId(undefined)
      form.setValue("slotId", "")
      return
    }

    if (!selectedDate || !availableDates.includes(selectedDate)) {
      setSelectedDate(availableDates[0])
    }
  }, [form, selectedDate, slots])

  React.useEffect(() => {
    if (!selectedDate) {
      setSelectedSlotId(undefined)
      form.setValue("slotId", "")
      return
    }

    const daySlots = slots.filter((slot) => slot.date === selectedDate)
    const nextSelection =
      daySlots.find((slot) => slot.id === selectedSlotId)?.id ?? daySlots[0]?.id

    setSelectedSlotId(nextSelection)
    form.setValue("slotId", nextSelection ?? "", { shouldValidate: true })
  }, [form, selectedDate, selectedSlotId, slots])

  const availableDates = new Set(slots.map((slot) => slot.date))
  const selectedDateSlots = slots.filter((slot) => slot.date === selectedDate)
  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId)

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to reserve this interview.")
      }

      setSuccess(payload)
      form.reset(defaultValues)
      setSelectedSlotId(undefined)
      await loadSlots()
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Unable to reserve this interview."
      )
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <Card className="glass-card gold-ring border-border/70 relative overflow-hidden rounded-[2rem]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(183,155,103,0.12),transparent_24%)]" />
      <CardHeader className="space-y-4 border-b border-border/50 pb-6 sm:px-8 sm:pt-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold-300/80">
              Premium Scheduler
            </p>
            <CardTitle className="font-display text-3xl text-cream-100 sm:text-4xl">
              Reserve a 10-15 minute family interview
            </CardTitle>
          </div>
          <div className="rounded-full border border-gold-500/25 bg-gold-500/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-gold-300">
            Selected family interviews
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-white/3 p-4">
            <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">
              Format
            </p>
            <p className="mt-2 text-sm font-semibold text-cream-100">
              Virtual interview
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Scheduled with a live calendar invite and meeting link.
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white/3 p-4">
            <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">
              Conversation
            </p>
            <p className="mt-2 text-sm font-semibold text-cream-100">
              Short, parent-led reflection
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Focused on growth, perspective, and real impact.
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white/3 p-4">
            <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">
              Approval
            </p>
            <p className="mt-2 text-sm font-semibold text-cream-100">
              Nothing is published without follow-up
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              BOW asks for approval before any family story is shared.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="sm:px-8 sm:pb-8">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.35 }}
              className="space-y-6 py-8"
            >
              <div className="flex items-start gap-4 rounded-[1.75rem] border border-gold-500/25 bg-gold-500/8 p-5">
                <ShieldCheck className="mt-1 size-5 text-gold-300" />
                <div className="space-y-2">
                  <h3 className="font-display text-3xl text-cream-100">
                    {success.summary.title}
                  </h3>
                  <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                    {success.summary.message}
                  </p>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-[1.75rem] border border-border/60 bg-white/3 p-6">
                  <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">
                    Reserved interview
                  </p>
                  <h4 className="mt-3 text-xl font-semibold text-cream-100">
                    {success.booking.slot.displayDate}
                  </h4>
                  <p className="mt-2 text-base text-gold-300">
                    {success.booking.slot.displayTime}
                  </p>
                  <div className="mt-5 space-y-2 text-sm text-muted-foreground">
                    <p>Parent: {success.booking.parentName}</p>
                    <p>Student: {success.booking.studentName}</p>
                    <p>Grade: {success.booking.grade}</p>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-border/60 bg-white/3 p-6">
                  <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">
                    Next steps
                  </p>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                    {success.summary.nextSteps.map((step) => (
                      <li key={step} className="flex gap-3">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold-300" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {success.booking.meetLink ? (
                      <Button asChild className="rounded-full px-5">
                        <a href={success.booking.meetLink} target="_blank" rel="noreferrer">
                          Open meeting link
                        </a>
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full border-border/80 bg-transparent px-5"
                      onClick={() => setSuccess(null)}
                    >
                      Reserve another time
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.35 }}
              onSubmit={handleSubmit}
              className="space-y-8 py-8"
            >
              <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="space-y-5 rounded-[1.75rem] border border-border/60 bg-white/3 p-5">
                  <div>
                    <Label className="text-xs uppercase tracking-[0.26em] text-muted-foreground">
                      Choose a date
                    </Label>
                    <div className="mt-4 rounded-[1.5rem] border border-border/70 bg-background/40 p-3">
                      <Calendar
                        mode="single"
                        selected={
                          selectedDate
                            ? new Date(`${selectedDate}T12:00:00-07:00`)
                            : undefined
                        }
                        onSelect={(date) =>
                          setSelectedDate(
                            date ? format(date, "yyyy-MM-dd") : undefined
                          )
                        }
                        disabled={(date) =>
                          !availableDates.has(format(date, "yyyy-MM-dd"))
                        }
                        className="mx-auto"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs uppercase tracking-[0.26em] text-muted-foreground">
                        Time slots
                      </Label>
                      {selectedDate ? (
                        <span className="text-sm text-cream-100">
                          {selectedDateSlots.length} available
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {loadingSlots ? (
                        <div className="col-span-full flex items-center gap-3 rounded-2xl border border-border/60 bg-background/40 px-4 py-5 text-sm text-muted-foreground">
                          <LoaderCircle className="size-4 animate-spin" />
                          Loading interview times
                        </div>
                      ) : null}

                      {!loadingSlots && slotError ? (
                        <div className="col-span-full rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-5 text-sm text-destructive-foreground">
                          {slotError}
                        </div>
                      ) : null}

                      {!loadingSlots && !slotError && !selectedDateSlots.length ? (
                        <div className="col-span-full rounded-2xl border border-border/60 bg-background/40 px-4 py-5 text-sm text-muted-foreground">
                          Choose a highlighted date to see available interview times.
                        </div>
                      ) : null}

                      {selectedDateSlots.map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => {
                            setSelectedSlotId(slot.id)
                            form.setValue("slotId", slot.id, {
                              shouldValidate: true,
                            })
                          }}
                          className={cn(
                            "rounded-2xl border px-4 py-4 text-left",
                            selectedSlotId === slot.id
                              ? "border-gold-500/80 bg-gold-500/14 shadow-[0_0_0_1px_rgba(183,155,103,0.28)]"
                              : "border-border/60 bg-background/40 hover:border-gold-500/40 hover:bg-white/5"
                          )}
                        >
                          <p className="text-sm font-semibold text-cream-100">
                            {slot.displayTime}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                            Virtual interview
                          </p>
                        </button>
                      ))}
                    </div>
                    {form.formState.errors.slotId ? (
                      <p className="mt-3 text-sm text-destructive">
                        {form.formState.errors.slotId.message}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-5 rounded-[1.75rem] border border-border/60 bg-white/3 p-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="parentName">Parent name</Label>
                      <Input id="parentName" {...form.register("parentName")} />
                      <FieldError message={form.formState.errors.parentName?.message} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="studentName">Student name</Label>
                      <Input id="studentName" {...form.register("studentName")} />
                      <FieldError message={form.formState.errors.studentName?.message} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="grade">Grade</Label>
                      <Input id="grade" placeholder="8th Grade" {...form.register("grade")} />
                      <FieldError message={form.formState.errors.grade?.message} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" {...form.register("phone")} />
                      <FieldError message={form.formState.errors.phone?.message} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" {...form.register("email")} />
                      <FieldError message={form.formState.errors.email?.message} />
                    </div>
                  </div>

                  <Separator className="bg-border/60" />

                  <div className="rounded-[1.5rem] border border-border/60 bg-background/45 p-4">
                    <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">
                      Interview format preference
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-cream-100">
                          Virtual family interview
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          The invitation includes a live meeting link and calendar hold.
                        </p>
                      </div>
                      <div className="rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-gold-300">
                        10-15 min
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reflection">
                      Share one shift you have noticed in how your student thinks
                      about sports, leadership, or growth.
                    </Label>
                    <Textarea
                      id="reflection"
                      rows={6}
                      placeholder="For example: more curiosity, better questions, stronger discipline, healthier confidence, or a more thoughtful relationship with competition."
                      {...form.register("reflection")}
                    />
                    <FieldError message={form.formState.errors.reflection?.message} />
                  </div>

                  <div className="rounded-[1.5rem] border border-border/60 bg-background/45 p-4">
                    <div className="flex items-start gap-3">
                      <Controller
                        control={form.control}
                        name="mediaConsent"
                        render={({ field }) => (
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                            className="mt-1"
                          />
                        )}
                      />
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-cream-100">
                          I understand that BOW may contact me for publication approval
                          before sharing any part of our story publicly.
                        </p>
                        <p className="text-sm leading-6 text-muted-foreground">
                          This form does not authorize publication by itself. It simply
                          allows BOW to follow up if our interview is selected for a
                          website feature.
                        </p>
                        <FieldError
                          message={form.formState.errors.mediaConsent?.message}
                        />
                      </div>
                    </div>
                  </div>

                  <input
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                    {...form.register("honeypot")}
                  />

                  {selectedSlot ? (
                    <div className="rounded-[1.5rem] border border-border/60 bg-background/45 p-4">
                      <div className="flex items-start gap-3">
                        <CalendarClock className="mt-1 size-4 text-gold-300" />
                        <div>
                          <p className="text-sm font-semibold text-cream-100">
                            Selected interview time
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {selectedSlot.displayDate} at {selectedSlot.displayTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {submitError ? (
                    <div className="rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
                      {submitError}
                    </div>
                  ) : null}

                  <Button
                    type="submit"
                    disabled={isSubmitting || loadingSlots}
                    className="h-12 w-full rounded-full text-base font-semibold"
                  >
                    {isSubmitting ? (
                      <>
                        <LoaderCircle className="mr-2 size-4 animate-spin" />
                        Reserving your interview
                      </>
                    ) : (
                      <>
                        Submit interview request
                        <ArrowRight className="ml-2 size-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="text-sm text-destructive">{message}</p>
}
