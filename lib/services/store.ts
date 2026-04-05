import { google } from "googleapis"

import { bookingHeaders, availabilityHeaders } from "@/lib/constants"
import { normalizeSlot } from "@/lib/date"
import { requireGoogleConfig } from "@/lib/env"
import { AppError } from "@/lib/error"
import type {
  BookingMutationInput,
  BookingStatus,
  InterviewFormat,
  SlotMutationInput,
  StoryStatus,
} from "@/lib/types"

type StoredSlot = {
  id: string
  date: string
  startTime: string
  endTime: string
  active: boolean
  notes?: string
}

type StoredBooking = {
  id: string
  slotId: string
  parentName: string
  studentName: string
  grade: string
  email: string
  phone: string
  formatPreference: InterviewFormat
  reflection: string
  mediaConsent: boolean
  bookingStatus: BookingStatus
  storyStatus: StoryStatus
  eventId?: string
  meetLink?: string
  createdAt: string
  updatedAt: string
  notes?: string
}

type RowResult<T> = {
  rowNumber: number
  value: T
}

type SchedulerStore = {
  listSlots(range?: { from?: string; to?: string }): Promise<StoredSlot[]>
  findSlot(id: string): Promise<StoredSlot | null>
  createSlot(input: SlotMutationInput): Promise<StoredSlot>
  updateSlot(id: string, input: SlotMutationInput): Promise<StoredSlot>
  deleteSlot(id: string): Promise<void>
  listBookings(): Promise<StoredBooking[]>
  findBooking(id: string): Promise<StoredBooking | null>
  createBooking(
    input: Omit<StoredBooking, "id" | "createdAt" | "updatedAt"> & {
      createdAt?: string
      updatedAt?: string
    }
  ): Promise<StoredBooking>
  updateBooking(id: string, updates: BookingMutationInput & Partial<StoredBooking>): Promise<StoredBooking>
}

type MockStoreState = {
  slots: StoredSlot[]
  bookings: StoredBooking[]
}

const slotTimes = [
  ["10:00", "10:15"],
  ["13:30", "13:45"],
  ["16:00", "16:15"],
] as const

declare global {
  var __bowMockStore: MockStoreState | undefined
}

function isWithinRange(value: string, from?: string, to?: string) {
  if (from && value < from) {
    return false
  }

  if (to && value > to) {
    return false
  }

  return true
}

function createInitialMockStore(): MockStoreState {
  const now = new Date()
  const slots: StoredSlot[] = []
  const bookings: StoredBooking[] = []

  for (let dayOffset = 1; slots.length < 18; dayOffset += 1) {
    const cursor = new Date(now)
    cursor.setDate(now.getDate() + dayOffset)
    const weekday = cursor.getDay()

    if (weekday === 0 || weekday === 6) {
      continue
    }

    const date = cursor.toISOString().slice(0, 10)

    for (const [startTime, endTime] of slotTimes) {
      slots.push({
        id: crypto.randomUUID(),
        date,
        startTime,
        endTime,
        active: true,
        notes:
          startTime === "16:00"
            ? "Reserved for East Coast families when needed."
            : "",
      })
    }
  }

  return { slots, bookings }
}

function getMockStoreState() {
  if (!globalThis.__bowMockStore) {
    globalThis.__bowMockStore = createInitialMockStore()
  }

  return globalThis.__bowMockStore
}

export function resetMockStore() {
  globalThis.__bowMockStore = createInitialMockStore()
}

const mockStore: SchedulerStore = {
  async listSlots(range) {
    const state = getMockStoreState()
    return state.slots.filter((slot) =>
      isWithinRange(slot.date, range?.from, range?.to)
    )
  },

  async findSlot(id) {
    return getMockStoreState().slots.find((slot) => slot.id === id) ?? null
  },

  async createSlot(input) {
    const created: StoredSlot = {
      id: crypto.randomUUID(),
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      active: input.active,
      notes: input.notes,
    }

    getMockStoreState().slots.push(created)
    return created
  },

  async updateSlot(id, input) {
    const state = getMockStoreState()
    const index = state.slots.findIndex((slot) => slot.id === id)

    if (index === -1) {
      throw new AppError("We could not find that slot.", 404)
    }

    state.slots[index] = {
      ...state.slots[index],
      ...input,
    }

    return state.slots[index]
  },

  async deleteSlot(id) {
    const state = getMockStoreState()
    state.slots = state.slots.filter((slot) => slot.id !== id)
  },

  async listBookings() {
    return getMockStoreState().bookings
  },

  async findBooking(id) {
    return getMockStoreState().bookings.find((booking) => booking.id === id) ?? null
  },

  async createBooking(input) {
    const booking: StoredBooking = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: input.createdAt ?? new Date().toISOString(),
      updatedAt: input.updatedAt ?? new Date().toISOString(),
    }

    getMockStoreState().bookings.unshift(booking)
    return booking
  },

  async updateBooking(id, updates) {
    const state = getMockStoreState()
    const index = state.bookings.findIndex((booking) => booking.id === id)

    if (index === -1) {
      throw new AppError("We could not find that booking.", 404)
    }

    state.bookings[index] = {
      ...state.bookings[index],
      ...updates,
      updatedAt: updates.updatedAt ?? new Date().toISOString(),
    }

    return state.bookings[index]
  },
}

function parseBoolean(value: string) {
  return value === "true"
}

function formatBoolean(value: boolean) {
  return value ? "true" : "false"
}

function columnLabel(index: number) {
  let value = index
  let result = ""

  while (value > 0) {
    const remainder = (value - 1) % 26
    result = String.fromCharCode(65 + remainder) + result
    value = Math.floor((value - 1) / 26)
  }

  return result
}

async function getSheetsClient() {
  const { serviceAccountEmail, privateKey, impersonatedUser } =
    requireGoogleConfig()

  const auth = new google.auth.JWT({
    email: serviceAccountEmail,
    key: privateKey,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/calendar",
    ],
    subject: impersonatedUser,
  })

  return google.sheets({ version: "v4", auth })
}

async function ensureSheetHeaders(sheetName: string, headers: readonly string[]) {
  const sheets = await getSheetsClient()
  const { spreadsheetId } = requireGoogleConfig()
  const lastColumn = columnLabel(headers.length)
  const headerRange = `${sheetName}!A1:${lastColumn}1`
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: headerRange,
  })

  const currentHeaders = response.data.values?.[0] ?? []
  const needsWrite =
    currentHeaders.length !== headers.length ||
    headers.some((header, index) => currentHeaders[index] !== header)

  if (!needsWrite) {
    return
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: headerRange,
    valueInputOption: "RAW",
    requestBody: {
      values: [headers as unknown as string[]],
    },
  })
}

async function readRows(
  sheetName: string,
  headers: readonly string[]
): Promise<RowResult<Record<string, string>>[]> {
  await ensureSheetHeaders(sheetName, headers)
  const sheets = await getSheetsClient()
  const { spreadsheetId } = requireGoogleConfig()
  const lastColumn = columnLabel(headers.length)
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A2:${lastColumn}`,
  })

  return (response.data.values ?? [])
    .map((row, index) => ({
      rowNumber: index + 2,
      value: Object.fromEntries(
        headers.map((header, headerIndex) => [header, row[headerIndex] ?? ""])
      ),
    }))
    .filter((row) => Object.values(row.value).some(Boolean))
}

async function appendRow(
  sheetName: string,
  headers: readonly string[],
  values: string[]
) {
  await ensureSheetHeaders(sheetName, headers)
  const sheets = await getSheetsClient()
  const { spreadsheetId } = requireGoogleConfig()

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:${columnLabel(headers.length)}`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [values],
    },
  })
}

async function updateRow(
  sheetName: string,
  headers: readonly string[],
  rowNumber: number,
  values: string[]
) {
  await ensureSheetHeaders(sheetName, headers)
  const sheets = await getSheetsClient()
  const { spreadsheetId } = requireGoogleConfig()
  const lastColumn = columnLabel(headers.length)

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A${rowNumber}:${lastColumn}${rowNumber}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [values],
    },
  })
}

async function clearRow(sheetName: string, headers: readonly string[], rowNumber: number) {
  const sheets = await getSheetsClient()
  const { spreadsheetId } = requireGoogleConfig()
  const lastColumn = columnLabel(headers.length)

  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `${sheetName}!A${rowNumber}:${lastColumn}${rowNumber}`,
  })
}

function mapSheetSlot(row: Record<string, string>): StoredSlot {
  return {
    id: row.slotId,
    date: row.date,
    startTime: row.startTime,
    endTime: row.endTime,
    active: parseBoolean(row.active || "false"),
    notes: row.notes,
  }
}

function slotToSheetRow(slot: StoredSlot) {
  return [
    slot.id,
    slot.date,
    slot.startTime,
    slot.endTime,
    formatBoolean(slot.active),
    slot.notes ?? "",
  ]
}

function mapSheetBooking(row: Record<string, string>): StoredBooking {
  return {
    id: row.bookingId,
    slotId: row.slotId,
    parentName: row.parentName,
    studentName: row.studentName,
    grade: row.grade,
    email: row.email,
    phone: row.phone,
    formatPreference: row.formatPreference as InterviewFormat,
    reflection: row.reflection,
    mediaConsent: parseBoolean(row.mediaConsent || "false"),
    bookingStatus: row.bookingStatus as BookingStatus,
    storyStatus: row.storyStatus as StoryStatus,
    eventId: row.eventId,
    meetLink: row.meetLink,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    notes: row.notes,
  }
}

function bookingToSheetRow(booking: StoredBooking) {
  return [
    booking.id,
    booking.slotId,
    booking.parentName,
    booking.studentName,
    booking.grade,
    booking.email,
    booking.phone,
    booking.formatPreference,
    booking.reflection,
    formatBoolean(booking.mediaConsent),
    booking.bookingStatus,
    booking.storyStatus,
    booking.eventId ?? "",
    booking.meetLink ?? "",
    booking.createdAt,
    booking.updatedAt,
    booking.notes ?? "",
  ]
}

const googleStore: SchedulerStore = {
  async listSlots(range) {
    const rows = await readRows("availability", availabilityHeaders)

    return rows
      .map((row) => mapSheetSlot(row.value))
      .filter((slot) => isWithinRange(slot.date, range?.from, range?.to))
  },

  async findSlot(id) {
    const rows = await readRows("availability", availabilityHeaders)
    const found = rows.find((row) => row.value.slotId === id)

    return found ? mapSheetSlot(found.value) : null
  },

  async createSlot(input) {
    const slot: StoredSlot = {
      id: crypto.randomUUID(),
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      active: input.active,
      notes: input.notes,
    }

    await appendRow("availability", availabilityHeaders, slotToSheetRow(slot))
    return slot
  },

  async updateSlot(id, input) {
    const rows = await readRows("availability", availabilityHeaders)
    const found = rows.find((row) => row.value.slotId === id)

    if (!found) {
      throw new AppError("We could not find that slot.", 404)
    }

    const nextSlot = {
      ...mapSheetSlot(found.value),
      ...input,
    }

    await updateRow(
      "availability",
      availabilityHeaders,
      found.rowNumber,
      slotToSheetRow(nextSlot)
    )

    return nextSlot
  },

  async deleteSlot(id) {
    const rows = await readRows("availability", availabilityHeaders)
    const found = rows.find((row) => row.value.slotId === id)

    if (!found) {
      return
    }

    await clearRow("availability", availabilityHeaders, found.rowNumber)
  },

  async listBookings() {
    const rows = await readRows("bookings", bookingHeaders)
    return rows.map((row) => mapSheetBooking(row.value))
  },

  async findBooking(id) {
    const rows = await readRows("bookings", bookingHeaders)
    const found = rows.find((row) => row.value.bookingId === id)

    return found ? mapSheetBooking(found.value) : null
  },

  async createBooking(input) {
    const booking: StoredBooking = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: input.createdAt ?? new Date().toISOString(),
      updatedAt: input.updatedAt ?? new Date().toISOString(),
    }

    await appendRow("bookings", bookingHeaders, bookingToSheetRow(booking))
    return booking
  },

  async updateBooking(id, updates) {
    const rows = await readRows("bookings", bookingHeaders)
    const found = rows.find((row) => row.value.bookingId === id)

    if (!found) {
      throw new AppError("We could not find that booking.", 404)
    }

    const nextBooking = {
      ...mapSheetBooking(found.value),
      ...updates,
      updatedAt: updates.updatedAt ?? new Date().toISOString(),
    } as StoredBooking

    await updateRow(
      "bookings",
      bookingHeaders,
      found.rowNumber,
      bookingToSheetRow(nextBooking)
    )

    return nextBooking
  },
}

export function getSchedulerStore() {
  return process.env.BOOKING_BACKEND_MODE === "google" ||
    (!process.env.BOOKING_BACKEND_MODE && process.env.GOOGLE_SHEETS_SPREADSHEET_ID)
    ? googleStore
    : mockStore
}

export function toDisplaySlot(slot: StoredSlot) {
  return normalizeSlot(slot)
}

export type { SchedulerStore, StoredBooking, StoredSlot }
