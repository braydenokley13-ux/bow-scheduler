import type {
  bookingStatuses,
  interviewFormats,
  storyStatuses,
} from "@/lib/constants"

export type BackendMode = "mock" | "google"

export type BookingStatus = (typeof bookingStatuses)[number]
export type StoryStatus = (typeof storyStatuses)[number]
export type InterviewFormat = (typeof interviewFormats)[number]

export type AvailabilitySlot = {
  id: string
  date: string
  startTime: string
  endTime: string
  timezone: string
  active: boolean
  notes?: string
  isoStart: string
  isoEnd: string
  displayDate: string
  displayTime: string
}

export type BookingRequest = {
  parentName: string
  studentName: string
  grade: string
  email: string
  phone: string
  formatPreference: InterviewFormat
  reflection: string
  slotId: string
  mediaConsent: boolean
  honeypot?: string
}

export type BookingRecord = {
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
  slot: AvailabilitySlot
}

export type BookingSuccessResponse = {
  booking: BookingRecord
  summary: {
    title: string
    message: string
    nextSteps: string[]
  }
}

export type AdminSession = {
  role: "admin"
  issuedAt: number
}

export type SlotMutationInput = {
  date: string
  startTime: string
  endTime: string
  active: boolean
  notes?: string
}

export type BookingMutationInput = {
  bookingStatus?: BookingStatus
  storyStatus?: StoryStatus
  notes?: string
  slotId?: string
}

export type SchedulerSnapshot = {
  slots: AvailabilitySlot[]
  bookings: BookingRecord[]
}
