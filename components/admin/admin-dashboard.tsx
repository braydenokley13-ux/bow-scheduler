"use client"

import {
  BookOpen,
  CalendarDays,
  Download,
  ExternalLink,
  LayoutGrid,
  LoaderCircle,
  LogOut,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { storyStatuses } from "@/lib/constants"
import type {
  AvailabilitySlot,
  BookingRecord,
  BookingStatus,
  StoryStatus,
} from "@/lib/types"

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

type Tab = "overview" | "slots" | "pipeline"

const emptySlotForm: SlotFormState = {
  date: "",
  startTime: "10:00",
  endTime: "10:15",
  active: true,
  notes: "",
}

const storyStatusLabels: Record<StoryStatus, string> = {
  scheduled: "Scheduled",
  interviewed: "Interviewed",
  drafted: "Draft ready",
  approval_pending: "Approval pending",
  approved: "Approved",
  featured: "Featured",
}

const bookingStatusLabels: Record<BookingStatus, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
}

function exportBookingsCsv(bookings: BookingRecord[]) {
  const headers = [
    "Parent name",
    "Student name",
    "Grade",
    "Email",
    "Phone",
    "Class term",
    "On the call",
    "Date",
    "Time",
    "Booking status",
    "Story stage",
    "Favorite idea",
    "Reflection",
    "Notes",
    "Created at",
  ]

  const rows = bookings.map((b) => [
    b.parentName,
    b.studentName,
    b.grade,
    b.email,
    b.phone,
    b.classTerm,
    b.interviewRole,
    b.slot.displayDate,
    b.slot.displayTime,
    b.bookingStatus,
    b.storyStatus,
    b.favoriteIdea,
    b.reflection,
    b.notes ?? "",
    b.createdAt,
  ])

  const csv =
    [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n") + "\n"

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `bow-bookings-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function AdminDashboard({ bookings, slots }: AdminDashboardProps) {
  const router = useRouter()
  const [busyKey, setBusyKey] = React.useState<string | null>(null)
  const [slotForm, setSlotForm] = React.useState<SlotFormState>(emptySlotForm)
  const [drafts, setDrafts] = React.useState<Record<string, BookingDraft>>({})
  const [activeTab, setActiveTab] = React.useState<Tab>("overview")
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<StoryStatus | "all">("all")

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
    try {
      await callback()
      toast.success(successMessage)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setBusyKey(null)
    }
  }

  async function handleSlotSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const method = slotForm.id ? "PATCH" : "POST"
    const url = slotForm.id
      ? `/api/admin/slots/${slotForm.id}`
      : "/api/admin/slots"

    await runMutation(
      slotForm.id ? `slot-${slotForm.id}` : "create-slot",
      async () => {
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(slotForm),
        })
        const payload = await response.json()
        if (!response.ok)
          throw new Error(payload.error ?? "Unable to save slot.")
        setSlotForm(emptySlotForm)
      },
      slotForm.id ? "Slot updated." : "Slot created."
    )
  }

  async function handleDeleteSlot(slotId: string) {
    if (!window.confirm("Delete this slot?")) return
    await runMutation(
      `delete-slot-${slotId}`,
      async () => {
        const response = await fetch(`/api/admin/slots/${slotId}`, {
          method: "DELETE",
        })
        const payload = await response.json()
        if (!response.ok)
          throw new Error(payload.error ?? "Unable to delete slot.")
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        })
        const payload = await response.json()
        if (!response.ok)
          throw new Error(payload.error ?? "Unable to update booking.")
      },
      "Booking updated."
    )
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
    router.refresh()
  }

  const scheduledCount = bookings.filter(
    (b) => b.bookingStatus === "scheduled"
  ).length
  const completedCount = bookings.filter(
    (b) => b.bookingStatus === "completed"
  ).length
  const approvedCount = bookings.filter(
    (b) => b.storyStatus === "approved" || b.storyStatus === "featured"
  ).length
  const pendingApprovalCount = bookings.filter(
    (b) => b.storyStatus === "approval_pending"
  ).length
  const activeSlots = slots.filter((s) => s.active).length

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      search.trim() === "" ||
      b.parentName.toLowerCase().includes(search.toLowerCase()) ||
      b.studentName.toLowerCase().includes(search.toLowerCase()) ||
      b.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || b.storyStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-border/50 bg-navy-950/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full border border-gold-500/35 bg-gold-500/10 text-xs font-semibold tracking-[0.2em] text-gold-300">
              BOW
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                BOW Sports Capital
              </p>
              <p className="text-sm font-semibold text-cream-100">
                Story Scheduling Admin
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-border/80 bg-transparent"
              asChild
            >
              <Link href="/share-your-bow-story" target="_blank">
                <ExternalLink className="mr-2 size-3.5" />
                Public page
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-border/80 bg-transparent"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 size-3.5" />
              Log out
            </Button>
          </div>
        </div>
      </header>

      {/* Tab navigation */}
      <nav className="border-b border-border/40 bg-navy-900/60">
        <div className="mx-auto flex w-full max-w-7xl gap-1 overflow-x-auto px-5 sm:px-8 lg:px-10">
          {(
            [
              { id: "overview", label: "Overview", Icon: LayoutGrid },
              { id: "slots", label: "Slots", Icon: CalendarDays },
              { id: "pipeline", label: "Booking pipeline", Icon: BookOpen },
            ] as const
          ).map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-5 py-3.5 text-sm font-medium transition-colors ${
                activeTab === id
                  ? "border-gold-500 text-gold-300"
                  : "border-transparent text-muted-foreground hover:text-cream-100"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-gold-300/80">
                At a glance
              </p>
              <h2 className="mt-2 font-display text-4xl text-cream-100">
                Overview
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard label="Active slots" value={String(activeSlots)} />
              <StatCard
                label="Scheduled"
                value={String(scheduledCount)}
              />
              <StatCard
                label="Completed"
                value={String(completedCount)}
              />
              <StatCard
                label="Pending approval"
                value={String(pendingApprovalCount)}
                highlight={pendingApprovalCount > 0}
              />
              <StatCard
                label="Approved / featured"
                value={String(approvedCount)}
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <Card className="glass-card rounded-[1.75rem] border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-cream-100">
                    Story stage breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {storyStatuses.map((status) => {
                    const count = bookings.filter(
                      (b) => b.storyStatus === status
                    ).length
                    return (
                      <div
                        key={status}
                        className="flex items-center justify-between rounded-xl border border-border/50 bg-background/30 px-4 py-2.5 text-sm"
                      >
                        <span className="text-muted-foreground">
                          {storyStatusLabels[status]}
                        </span>
                        <span className="font-semibold text-cream-100">
                          {count}
                        </span>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <Card className="glass-card rounded-[1.75rem] border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-cream-100">
                    Recent bookings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {bookings.slice(0, 5).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-border/50 bg-background/30 px-4 py-3 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-cream-100">
                          {booking.parentName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Student: {booking.studentName} · {booking.classTerm}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full border border-border/50 px-2.5 py-0.5 text-xs text-muted-foreground">
                        {storyStatusLabels[booking.storyStatus]}
                      </span>
                    </div>
                  ))}
                  {bookings.length === 0 && (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      No bookings yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ── SLOTS ── */}
        {activeTab === "slots" && (
          <div className="space-y-8">
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-gold-300/80">
                Availability
              </p>
              <h2 className="mt-2 font-display text-4xl text-cream-100">
                Interview slots
              </h2>
            </div>

            <Card className="glass-card rounded-[2rem] border-border/70">
              <CardHeader>
                <CardTitle className="text-xl text-cream-100">
                  {slotForm.id ? "Edit slot" : "Create slot"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSlotSubmit}
                  className="grid gap-5 lg:grid-cols-5"
                >
                  <div className="space-y-2">
                    <Label htmlFor="slot-date">Date</Label>
                    <Input
                      id="slot-date"
                      type="date"
                      value={slotForm.date}
                      onChange={(e) =>
                        setSlotForm((c) => ({ ...c, date: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slot-start">Start time</Label>
                    <Input
                      id="slot-start"
                      type="time"
                      value={slotForm.startTime}
                      onChange={(e) =>
                        setSlotForm((c) => ({
                          ...c,
                          startTime: e.target.value,
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
                      onChange={(e) =>
                        setSlotForm((c) => ({
                          ...c,
                          endTime: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slot-notes">Notes</Label>
                    <Input
                      id="slot-notes"
                      value={slotForm.notes}
                      onChange={(e) =>
                        setSlotForm((c) => ({ ...c, notes: e.target.value }))
                      }
                      placeholder="Optional"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slot-active">Status</Label>
                    <select
                      id="slot-active"
                      className="flex h-10 w-full rounded-xl border border-border/70 bg-background/45 px-3 text-sm text-cream-100 outline-none"
                      value={slotForm.active ? "active" : "inactive"}
                      onChange={(e) =>
                        setSlotForm((c) => ({
                          ...c,
                          active: e.target.value === "active",
                        }))
                      }
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="flex flex-wrap gap-3 lg:col-span-5">
                    <Button
                      type="submit"
                      className="rounded-full"
                      disabled={Boolean(busyKey)}
                    >
                      {busyKey?.startsWith("slot-") ||
                      busyKey === "create-slot" ? (
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
                        <X className="mr-2 size-4" />
                        Cancel edit
                      </Button>
                    ) : null}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="glass-card rounded-[2rem] border-border/70">
              <CardHeader>
                <CardTitle className="text-xl text-cream-100">
                  All slots ({slots.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {slots.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-8 text-center text-sm text-muted-foreground"
                        >
                          No slots yet. Create the first one above.
                        </TableCell>
                      </TableRow>
                    )}
                    {slots.map((slot) => (
                      <TableRow key={slot.id}>
                        <TableCell>
                          <p className="font-medium text-cream-100">
                            {slot.displayDate}
                          </p>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {slot.displayTime}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              slot.active
                                ? "border border-gold-500/30 bg-gold-500/10 text-gold-300"
                                : "border border-border/50 text-muted-foreground"
                            }`}
                          >
                            {slot.active ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[200px] text-sm text-muted-foreground">
                          {slot.notes || "—"}
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
                              <Pencil className="mr-1.5 size-3" />
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-full border-destructive/30 bg-transparent text-destructive hover:bg-destructive/10"
                              disabled={busyKey === `delete-slot-${slot.id}`}
                              onClick={() => handleDeleteSlot(slot.id)}
                            >
                              {busyKey === `delete-slot-${slot.id}` ? (
                                <LoaderCircle className="size-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="mr-1.5 size-3" />
                              )}
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
          </div>
        )}

        {/* ── PIPELINE ── */}
        {activeTab === "pipeline" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.34em] text-gold-300/80">
                  Bookings
                </p>
                <h2 className="mt-2 font-display text-4xl text-cream-100">
                  Booking pipeline
                </h2>
              </div>
              <Button
                variant="outline"
                className="rounded-full border-border/80 bg-transparent"
                onClick={() => exportBookingsCsv(filteredBookings)}
              >
                <Download className="mr-2 size-4" />
                Export CSV
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search family, email…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select
                className="flex h-10 rounded-xl border border-border/70 bg-background/45 px-3 text-sm text-cream-100 outline-none"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as StoryStatus | "all")
                }
              >
                <option value="all">All story stages</option>
                {storyStatuses.map((s) => (
                  <option key={s} value={s}>
                    {storyStatusLabels[s]}
                  </option>
                ))}
              </select>
              <p className="self-center text-sm text-muted-foreground">
                {filteredBookings.length} of {bookings.length} bookings
              </p>
            </div>

            <Card className="glass-card rounded-[2rem] border-border/70">
              <CardContent className="overflow-x-auto p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Family</TableHead>
                      <TableHead>Class term</TableHead>
                      <TableHead>Interview</TableHead>
                      <TableHead>Booking</TableHead>
                      <TableHead>Story stage</TableHead>
                      <TableHead>Reschedule slot</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="pr-6">Save</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="py-10 text-center text-sm text-muted-foreground"
                        >
                          {bookings.length === 0
                            ? "No bookings yet."
                            : "No bookings match your filters."}
                        </TableCell>
                      </TableRow>
                    )}
                    {filteredBookings.map((booking) => {
                      const draft = drafts[booking.id]
                      const rescheduleOptions = slots.filter(
                        (s) => s.active || s.id === booking.slotId
                      )

                      return (
                        <TableRow key={booking.id} className="align-top">
                          <TableCell className="min-w-[220px] pl-6">
                            <div className="space-y-1 py-1">
                              <p className="font-semibold text-cream-100">
                                {booking.parentName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Student: {booking.studentName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {booking.email}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {booking.phone}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="min-w-[140px]">
                            <div className="space-y-1 text-sm">
                              <p className="text-cream-100">{booking.classTerm}</p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {booking.interviewRole}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="min-w-[180px]">
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p>{booking.slot.displayDate}</p>
                              <p>{booking.slot.displayTime}</p>
                              {booking.meetLink ? (
                                <a
                                  href={booking.meetLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-gold-300 hover:text-gold-300/80"
                                >
                                  <ExternalLink className="size-3" />
                                  Meet
                                </a>
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell className="min-w-[150px]">
                            <select
                              aria-label="Booking status"
                              className="flex h-10 w-full rounded-xl border border-border/70 bg-background/45 px-3 text-sm text-cream-100 outline-none"
                              value={draft?.bookingStatus ?? booking.bookingStatus}
                              onChange={(e) =>
                                setDrafts((cur) => ({
                                  ...cur,
                                  [booking.id]: {
                                    ...cur[booking.id],
                                    bookingStatus: e.target.value as BookingStatus,
                                  },
                                }))
                              }
                            >
                              {Object.entries(bookingStatusLabels).map(
                                ([val, label]) => (
                                  <option key={val} value={val}>
                                    {label}
                                  </option>
                                )
                              )}
                            </select>
                          </TableCell>
                          <TableCell className="min-w-[175px]">
                            <select
                              aria-label="Story stage"
                              className="flex h-10 w-full rounded-xl border border-border/70 bg-background/45 px-3 text-sm text-cream-100 outline-none"
                              value={draft?.storyStatus ?? booking.storyStatus}
                              onChange={(e) =>
                                setDrafts((cur) => ({
                                  ...cur,
                                  [booking.id]: {
                                    ...cur[booking.id],
                                    storyStatus: e.target.value as StoryStatus,
                                  },
                                }))
                              }
                            >
                              {storyStatuses.map((s) => (
                                <option key={s} value={s}>
                                  {storyStatusLabels[s]}
                                </option>
                              ))}
                            </select>
                          </TableCell>
                          <TableCell className="min-w-[220px]">
                            <select
                              aria-label="Reschedule to slot"
                              className="flex h-10 w-full rounded-xl border border-border/70 bg-background/45 px-3 text-sm text-cream-100 outline-none"
                              value={draft?.slotId ?? booking.slotId}
                              onChange={(e) =>
                                setDrafts((cur) => ({
                                  ...cur,
                                  [booking.id]: {
                                    ...cur[booking.id],
                                    slotId: e.target.value,
                                  },
                                }))
                              }
                            >
                              {rescheduleOptions.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.displayDate} · {s.displayTime}
                                </option>
                              ))}
                            </select>
                          </TableCell>
                          <TableCell className="min-w-[220px]">
                            <Textarea
                              aria-label="Staff notes"
                              rows={3}
                              value={draft?.notes ?? booking.notes ?? ""}
                              onChange={(e) =>
                                setDrafts((cur) => ({
                                  ...cur,
                                  [booking.id]: {
                                    ...cur[booking.id],
                                    notes: e.target.value,
                                  },
                                }))
                              }
                            />
                          </TableCell>
                          <TableCell className="pr-6">
                            <Button
                              type="button"
                              size="sm"
                              className="rounded-full"
                              onClick={() => handleSaveBooking(booking.id)}
                              disabled={busyKey === `booking-${booking.id}`}
                            >
                              {busyKey === `booking-${booking.id}` ? (
                                <LoaderCircle className="size-4 animate-spin" />
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
        )}
      </main>
    </div>
  )
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <Card
      className={`glass-card rounded-[1.75rem] border-border/60 ${highlight ? "border-gold-500/40" : ""}`}
    >
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
          {label}
        </p>
        <p
          className={`mt-3 font-display text-4xl ${highlight ? "text-gold-300" : "text-cream-100"}`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  )
}
