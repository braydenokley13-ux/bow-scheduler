"use client"

import { LoaderCircle, LogOut, Pencil, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import type { AvailabilitySlot, BookingRecord, BookingStatus, StoryStatus } from "@/lib/types"

type AdminDashboardProps = {
  bookings: BookingRecord[]
  slots: AvailabilitySlot[]
}

type BookingDraft = {
  bookingStatus: BookingStatus
  storyStatus: StoryStatus
  slotId: string
  notes: string
}

type SlotFormState = {
  id?: string
  date: string
  startTime: string
  endTime: string
  active: boolean
  notes: string
}

const emptySlotForm: SlotFormState = {
  date: "",
  startTime: "10:00",
  endTime: "10:15",
  active: true,
  notes: "",
}

export function AdminDashboard({ bookings, slots }: AdminDashboardProps) {
  const router = useRouter()
  const [message, setMessage] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [busyKey, setBusyKey] = React.useState<string | null>(null)
  const [slotForm, setSlotForm] = React.useState<SlotFormState>(emptySlotForm)
  const [drafts, setDrafts] = React.useState<Record<string, BookingDraft>>({})

  React.useEffect(() => {
    setDrafts(
      Object.fromEntries(
        bookings.map((booking) => [
          booking.id,
          {
            bookingStatus: booking.bookingStatus,
            storyStatus: booking.storyStatus,
            slotId: booking.slotId,
            notes: booking.notes ?? "",
          },
        ])
      )
    )
  }, [bookings])

  async function runMutation(
    key: string,
    callback: () => Promise<void>,
    successMessage: string
  ) {
    setBusyKey(key)
    setMessage(null)
    setError(null)

    try {
      await callback()
      setMessage(successMessage)
      router.refresh()
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Something went wrong.")
    } finally {
      setBusyKey(null)
    }
  }

  async function handleSlotSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const method = slotForm.id ? "PATCH" : "POST"
    const url = slotForm.id ? `/api/admin/slots/${slotForm.id}` : "/api/admin/slots"

    await runMutation(
      slotForm.id ? `slot-${slotForm.id}` : "create-slot",
      async () => {
        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(slotForm),
        })

        const payload = await response.json()

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to save slot.")
        }

        setSlotForm(emptySlotForm)
      },
      slotForm.id ? "Slot updated." : "Slot created."
    )
  }

  async function handleDeleteSlot(slotId: string) {
    if (!window.confirm("Delete this slot?")) {
      return
    }

    await runMutation(
      `delete-slot-${slotId}`,
      async () => {
        const response = await fetch(`/api/admin/slots/${slotId}`, {
          method: "DELETE",
        })
        const payload = await response.json()

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to delete slot.")
        }
      },
      "Slot removed."
    )
  }

  async function handleSaveBooking(bookingId: string) {
    const draft = drafts[bookingId]

    await runMutation(
      `booking-${bookingId}`,
      async () => {
        const response = await fetch(`/api/admin/bookings/${bookingId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(draft),
        })
        const payload = await response.json()

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to update booking.")
        }
      },
      "Booking updated."
    )
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", {
      method: "POST",
    })
    router.push("/admin/login")
    router.refresh()
  }

  const scheduledCount = bookings.filter(
    (booking) => booking.bookingStatus === "scheduled"
  ).length
  const approvedCount = bookings.filter(
    (booking) => booking.storyStatus === "approved" || booking.storyStatus === "featured"
  ).length
  const activeSlots = slots.filter((slot) => slot.active).length

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.34em] text-gold-300/80">
            BOW Sports Capital
          </p>
          <h1 className="font-display text-5xl text-cream-100">
            Story scheduling admin
          </h1>
          <p className="max-w-3xl text-base leading-8 text-muted-foreground">
            Manage interview availability, bookings, reschedules, publication
            stages, and staff notes from one console.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="rounded-full border-border/80 bg-transparent"
            asChild
          >
            <Link href="/share-your-bow-story" target="_blank">
              Open public page
            </Link>
          </Button>
          <Button
            variant="outline"
            className="rounded-full border-border/80 bg-transparent"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 size-4" />
            Log out
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <StatCard label="Active slots" value={String(activeSlots)} />
        <StatCard label="Scheduled interviews" value={String(scheduledCount)} />
        <StatCard label="Approved or featured stories" value={String(approvedCount)} />
      </div>

      {message ? (
        <div className="rounded-2xl border border-gold-500/25 bg-gold-500/10 px-4 py-3 text-sm text-gold-300">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
          {error}
        </div>
      ) : null}

      <Card className="glass-card rounded-[2rem] border-border/70">
        <CardHeader>
          <CardTitle className="text-2xl text-cream-100">
            {slotForm.id ? "Edit interview slot" : "Create interview slot"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSlotSubmit} className="grid gap-5 lg:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="slot-date">Date</Label>
              <Input
                id="slot-date"
                type="date"
                value={slotForm.date}
                onChange={(event) =>
                  setSlotForm((current) => ({ ...current, date: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slot-start">Start time</Label>
              <Input
                id="slot-start"
                type="time"
                value={slotForm.startTime}
                onChange={(event) =>
                  setSlotForm((current) => ({
                    ...current,
                    startTime: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slot-end">End time</Label>
              <Input
                id="slot-end"
                type="time"
                value={slotForm.endTime}
                onChange={(event) =>
                  setSlotForm((current) => ({ ...current, endTime: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slot-notes">Notes</Label>
              <Input
                id="slot-notes"
                value={slotForm.notes}
                onChange={(event) =>
                  setSlotForm((current) => ({ ...current, notes: event.target.value }))
                }
                placeholder="Optional context"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slot-active">Status</Label>
              <select
                id="slot-active"
                className="flex h-10 w-full rounded-xl border border-border/70 bg-background/45 px-3 text-sm text-cream-100 outline-none"
                value={slotForm.active ? "active" : "inactive"}
                onChange={(event) =>
                  setSlotForm((current) => ({
                    ...current,
                    active: event.target.value === "active",
                  }))
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-3 lg:col-span-5">
              <Button type="submit" className="rounded-full" disabled={Boolean(busyKey)}>
                {busyKey?.startsWith("slot-") || busyKey === "create-slot" ? (
                  <>
                    <LoaderCircle className="mr-2 size-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 size-4" />
                    {slotForm.id ? "Save slot" : "Create slot"}
                  </>
                )}
              </Button>
              {slotForm.id ? (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-border/80 bg-transparent"
                  onClick={() => setSlotForm(emptySlotForm)}
                >
                  Cancel edit
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-8 xl:grid-cols-[0.78fr_1.22fr]">
        <Card className="glass-card rounded-[2rem] border-border/70">
          <CardHeader>
            <CardTitle className="text-2xl text-cream-100">
              Availability slots
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slots.map((slot) => (
                  <TableRow key={slot.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-cream-100">{slot.displayDate}</p>
                        {slot.notes ? (
                          <p className="mt-1 text-xs text-muted-foreground">{slot.notes}</p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {slot.displayTime}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {slot.active ? "Active" : "Inactive"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-full border-border/80 bg-transparent"
                          onClick={() =>
                            setSlotForm({
                              id: slot.id,
                              date: slot.date,
                              startTime: slot.startTime,
                              endTime: slot.endTime,
                              active: slot.active,
                              notes: slot.notes ?? "",
                            })
                          }
                        >
                          <Pencil className="mr-2 size-3.5" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-full border-destructive/30 bg-transparent text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteSlot(slot.id)}
                        >
                          <Trash2 className="mr-2 size-3.5" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-[2rem] border-border/70">
          <CardHeader>
            <CardTitle className="text-2xl text-cream-100">
              Booking pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Family</TableHead>
                  <TableHead>Slot</TableHead>
                  <TableHead>Booking</TableHead>
                  <TableHead>Story stage</TableHead>
                  <TableHead>Reschedule</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => {
                  const draft = drafts[booking.id]
                  const rescheduleOptions = slots.filter(
                    (slot) => slot.active || slot.id === booking.slotId
                  )

                  return (
                    <TableRow key={booking.id} className="align-top">
                      <TableCell className="min-w-[240px]">
                        <div className="space-y-2">
                          <p className="font-semibold text-cream-100">
                            {booking.parentName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Student: {booking.studentName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {booking.email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {booking.phone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[180px] text-sm text-muted-foreground">
                        <p>{booking.slot.displayDate}</p>
                        <p>{booking.slot.displayTime}</p>
                        {booking.meetLink ? (
                          <a
                            href={booking.meetLink}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex text-gold-300 hover:text-gold-300/80"
                          >
                            Open meeting link
                          </a>
                        ) : null}
                      </TableCell>
                      <TableCell className="min-w-[150px]">
                        <select
                          className="flex h-10 w-full rounded-xl border border-border/70 bg-background/45 px-3 text-sm text-cream-100 outline-none"
                          value={draft?.bookingStatus ?? booking.bookingStatus}
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [booking.id]: {
                                ...(current[booking.id] ?? {
                                  bookingStatus: booking.bookingStatus,
                                  storyStatus: booking.storyStatus,
                                  slotId: booking.slotId,
                                  notes: booking.notes ?? "",
                                }),
                                bookingStatus: event.target.value as BookingStatus,
                              },
                            }))
                          }
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </TableCell>
                      <TableCell className="min-w-[170px]">
                        <select
                          className="flex h-10 w-full rounded-xl border border-border/70 bg-background/45 px-3 text-sm text-cream-100 outline-none"
                          value={draft?.storyStatus ?? booking.storyStatus}
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [booking.id]: {
                                ...(current[booking.id] ?? {
                                  bookingStatus: booking.bookingStatus,
                                  storyStatus: booking.storyStatus,
                                  slotId: booking.slotId,
                                  notes: booking.notes ?? "",
                                }),
                                storyStatus: event.target.value as StoryStatus,
                              },
                            }))
                          }
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="approval_pending">Approval pending</option>
                          <option value="approved">Approved</option>
                          <option value="featured">Featured</option>
                        </select>
                      </TableCell>
                      <TableCell className="min-w-[220px]">
                        <select
                          className="flex h-10 w-full rounded-xl border border-border/70 bg-background/45 px-3 text-sm text-cream-100 outline-none"
                          value={draft?.slotId ?? booking.slotId}
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [booking.id]: {
                                ...(current[booking.id] ?? {
                                  bookingStatus: booking.bookingStatus,
                                  storyStatus: booking.storyStatus,
                                  slotId: booking.slotId,
                                  notes: booking.notes ?? "",
                                }),
                                slotId: event.target.value,
                              },
                            }))
                          }
                        >
                          {rescheduleOptions.map((slot) => (
                            <option key={slot.id} value={slot.id}>
                              {slot.displayDate} | {slot.displayTime}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell className="min-w-[220px]">
                        <Textarea
                          rows={4}
                          value={draft?.notes ?? booking.notes ?? ""}
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [booking.id]: {
                                ...(current[booking.id] ?? {
                                  bookingStatus: booking.bookingStatus,
                                  storyStatus: booking.storyStatus,
                                  slotId: booking.slotId,
                                  notes: booking.notes ?? "",
                                }),
                                notes: event.target.value,
                              },
                            }))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          size="sm"
                          className="rounded-full"
                          onClick={() => handleSaveBooking(booking.id)}
                          disabled={busyKey === `booking-${booking.id}`}
                        >
                          {busyKey === `booking-${booking.id}` ? (
                            <>
                              <LoaderCircle className="mr-2 size-4 animate-spin" />
                              Saving
                            </>
                          ) : (
                            "Save"
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="glass-card rounded-[1.75rem] border-border/60">
      <CardContent className="p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-3 font-display text-5xl text-cream-100">{value}</p>
      </CardContent>
    </Card>
  )
}
