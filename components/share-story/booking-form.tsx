"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { addDays, format } from "date-fns"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowRight,
  CalendarClock,
  CalendarPlus,
  Copy,
  Download,
  LoaderCircle,
  Settings2,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { classTerms, interviewRoles } from "@/lib/constants"
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
  favoriteIdea: "",
  classTerm: "Fall 2024",
  interviewRole: "both",
  slotId: "",
  mediaConsent: false,
  honeypot: "",
}

const roleCopy: Record<
  (typeof interviewRoles)[number],
  { title: string; body: string }
> = {
  student: {
    title: "Just the student",
    body: "Student will join the call alone and share their own reflections.",
  },
  parent: {
    title: "Just the parent",
    body: "Parent will join alone to share the shift they noticed at home.",
  },
  both: {
    title: "Student + parent",
    body: "Student and parent join together. This is usually the richest conversation.",
  },
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
  const [success, setSuccess] = React.useState<BookingSuccessResponse | null>(
    null
  )
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const loadSlots = React.useCallback(async () => {
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
        error instanceof Error
          ? error.message
          : "Unable to load interview slots."
      )
    } finally {
      setLoadingSlots(false)
    }
  }, [])

  React.useEffect(() => {
    void loadSlots()
  }, [loadSlots])

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

      setSuccess(payload as BookingSuccessResponse)
      toast.success("You're on the schedule", {
        description: `${payload.booking.slot.displayDate} at ${payload.booking.slot.displayTime}`,
      })
      form.reset(defaultValues)
      setSelectedSlotId(undefined)
      await loadSlots()
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to reserve this interview."
      setSubmitError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  })

  const handleCopyManageLink = async () => {
    if (!success) return
    try {
      await navigator.clipboard.writeText(success.manageUrl)
      toast.success("Management link copied")
    } catch {
      toast.error("Copy failed. Please copy the link manually.")
    }
  }

  return (
    <Card
      id="scheduler-card"
      className="glass-card gold-ring border-border/70 relative overflow-hidden rounded-[2rem]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,162,76,0.1),transparent_28%)]" />
      <div className="pointer-events-none absolute -right-24 top-6 h-40 w-40 rounded-full bg-gold-500/10 blur-3xl" />
      <CardHeader className="space-y-4 border-b border-border/50 pb-6 sm:px-8 sm:pt-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.34em] text-gold-300/80">
              <Sparkles className="size-3" />
              BOW Sports Economics · Interview booking
            </p>
            <CardTitle className="font-display text-3xl text-cream-100 sm:text-4xl">
              Reserve a 10–15 minute interview
            </CardTitle>
          </div>
          <div className="rounded-full border border-gold-500/25 bg-gold-500/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-gold-300">
            Student + parent welcome
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-white/3 p-4">
            <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">
              Length
            </p>
            <p className="mt-2 text-sm font-semibold text-cream-100">
              10–15 minutes
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Short and sharp. Come with one idea from class.
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white/3 p-4">
            <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">
              Format
            </p>
            <p className="mt-2 text-sm font-semibold text-cream-100">
              Virtual on Google Meet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Live link and calendar invite arrive in your inbox.
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white/3 p-4">
            <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">
              Approval
            </p>
            <p className="mt-2 text-sm font-semibold text-cream-100">
              Nothing is published without you
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              BOW follows up for approval before anything goes live.
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
                    <p>
                      <span className="text-cream-100">Parent:</span>{" "}
                      {success.booking.parentName}
                    </p>
                    <p>
                      <span className="text-cream-100">Student:</span>{" "}
                      {success.booking.studentName}
                    </p>
                    <p>
                      <span className="text-cream-100">On the call:</span>{" "}
                      {success.booking.interviewRole}
                    </p>
                    <p>
                      <span className="text-cream-100">Class term:</span>{" "}
                      {success.booking.classTerm}
                    </p>
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
                    <Button asChild className="h-10 rounded-full px-5">
                      <a href={success.icsUrl}>
                        <Download className="mr-2 size-4" />
                        Add to calendar (.ics)
                      </a>
                    </Button>
                    {success.booking.meetLink ? (
                      <Button
                        asChild
                        variant="outline"
                        className="h-10 rounded-full border-border/80 bg-transparent px-5"
                      >
                        <a
                          href={success.booking.meetLink}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <CalendarPlus className="mr-2 size-4" />
                          Open meeting link
                        </a>
                      </Button>
                    ) : null}
                    <Button
                      asChild
                      variant="outline"
                      className="h-10 rounded-full border-border/80 bg-transparent px-5"
                    >
                      <Link href={`/manage/${success.manageToken}`}>
                        <Settings2 className="mr-2 size-4" />
                        Manage booking
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-10 rounded-full px-4 text-muted-foreground hover:text-cream-100"
                      onClick={handleCopyManageLink}
                    >
                      <Copy className="mr-2 size-4" />
                      Copy link
                    </Button>
                  </div>
                  <div className="mt-5">
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-9 rounded-full px-3 text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-cream-100"
                      onClick={() => setSuccess(null)}
                    >
                      Book another interview
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
                        Time slots (Phoenix time)
                      </Label>
                      {selectedDate ? (
                        <span className="text-sm text-cream-100">
                          {selectedDateSlots.length} available
                        </span>
                      ) : null}
                    </div>
                    <div
                      className="mt-4 grid gap-3 sm:grid-cols-2"
                      role="radiogroup"
                      aria-label="Interview time slots"
                    >
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
                          Pick a highlighted date to see open interview times.
                        </div>
                      ) : null}

                      {selectedDateSlots.map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          role="radio"
                          aria-checked={selectedSlotId === slot.id}
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
                      <Label htmlFor="studentName">Student name</Label>
                      <Input
                        id="studentName"
                        {...form.register("studentName")}
                      />
                      <FieldError
                        message={form.formState.errors.studentName?.message}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parentName">Parent name</Label>
                      <Input id="parentName" {...form.register("parentName")} />
                      <FieldError
                        message={form.formState.errors.parentName?.message}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="grade">Grade or year</Label>
                      <Input
                        id="grade"
                        placeholder="e.g. 11th grade, College sophomore"
                        {...form.register("grade")}
                      />
                      <FieldError
                        message={form.formState.errors.grade?.message}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" {...form.register("phone")} />
                      <FieldError
                        message={form.formState.errors.phone?.message}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...form.register("email")}
                      />
                      <FieldError
                        message={form.formState.errors.email?.message}
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="classTerm">
                        When did you take Sports Economics?
                      </Label>
                      <Controller
                        control={form.control}
                        name="classTerm"
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger
                              id="classTerm"
                              className="h-10 w-full rounded-xl border-border/70 bg-background/50 px-3 text-sm"
                            >
                              <SelectValue placeholder="Pick the term you took class" />
                            </SelectTrigger>
                            <SelectContent className="max-h-72">
                              {classTerms.map((term) => (
                                <SelectItem key={term} value={term}>
                                  {term}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FieldError
                        message={form.formState.errors.classTerm?.message}
                      />
                    </div>
                  </div>

                  <Separator className="bg-border/60" />

                  <div>
                    <Label className="text-xs uppercase tracking-[0.26em] text-muted-foreground">
                      Who will be on the call?
                    </Label>
                    <Controller
                      control={form.control}
                      name="interviewRole"
                      render={({ field }) => (
                        <div
                          className="mt-3 grid gap-3 sm:grid-cols-3"
                          role="radiogroup"
                          aria-label="Who will join the call"
                        >
                          {interviewRoles.map((role) => {
                            const copy = roleCopy[role]
                            const active = field.value === role
                            return (
                              <button
                                key={role}
                                type="button"
                                role="radio"
                                aria-checked={active}
                                onClick={() => field.onChange(role)}
                                className={cn(
                                  "rounded-2xl border px-4 py-4 text-left",
                                  active
                                    ? "border-gold-500/80 bg-gold-500/14 shadow-[0_0_0_1px_rgba(183,155,103,0.28)]"
                                    : "border-border/60 bg-background/40 hover:border-gold-500/40"
                                )}
                              >
                                <p className="text-sm font-semibold text-cream-100">
                                  {copy.title}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                  {copy.body}
                                </p>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    />
                    <FieldError
                      message={form.formState.errors.interviewRole?.message}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="favoriteIdea">
                      One idea from Sports Economics you want to talk about
                    </Label>
                    <Input
                      id="favoriteIdea"
                      placeholder="e.g. Opportunity cost in late-game playcalling"
                      {...form.register("favoriteIdea")}
                    />
                    <p className="text-xs leading-5 text-muted-foreground">
                      A concept, a model, a moment from class, or a decision it
                      changed the way you look at.
                    </p>
                    <FieldError
                      message={form.formState.errors.favoriteIdea?.message}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reflection">
                      Tell us a bit more (2–4 sentences is perfect)
                    </Label>
                    <Textarea
                      id="reflection"
                      rows={6}
                      placeholder="What changed in how you see games, decisions, incentives, or the economics of sport after taking this class?"
                      {...form.register("reflection")}
                    />
                    <FieldError
                      message={form.formState.errors.reflection?.message}
                    />
                  </div>

                  <div className="rounded-[1.5rem] border border-border/60 bg-background/45 p-4">
                    <div className="flex items-start gap-3">
                      <Controller
                        control={form.control}
                        name="mediaConsent"
                        render={({ field }) => (
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) =>
                              field.onChange(Boolean(checked))
                            }
                            className="mt-1"
                          />
                        )}
                      />
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-cream-100">
                          BOW may follow up for approval before publishing any
                          part of this conversation.
                        </p>
                        <p className="text-sm leading-6 text-muted-foreground">
                          This form does not authorize publication. It only
                          lets BOW reach out if your reflection is a strong fit
                          for a story feature — and you still get final say.
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
                            {selectedSlot.displayDate} at{" "}
                            {selectedSlot.displayTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {submitError ? (
                    <div
                      role="alert"
                      className="rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground"
                    >
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
                        Lock in my interview
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

  return (
    <p className="text-sm text-destructive" role="alert">
      {message}
    </p>
  )
}
