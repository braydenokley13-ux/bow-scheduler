export const BOW_TIMEZONE = "America/Phoenix"
export const BOW_OFFSET = "-07:00"
export const PUBLIC_PAGE_PATH = "/share-your-bow-story"
export const ADMIN_SESSION_COOKIE = "bow_admin_session"

export const bookingStatuses = ["scheduled", "completed", "cancelled"] as const
export const storyStatuses = [
  "scheduled",
  "approval_pending",
  "approved",
  "featured",
] as const

export const interviewFormats = ["virtual"] as const

export const availabilityHeaders = [
  "slotId",
  "date",
  "startTime",
  "endTime",
  "active",
  "notes",
] as const

export const bookingHeaders = [
  "bookingId",
  "slotId",
  "parentName",
  "studentName",
  "grade",
  "email",
  "phone",
  "formatPreference",
  "reflection",
  "mediaConsent",
  "bookingStatus",
  "storyStatus",
  "eventId",
  "meetLink",
  "createdAt",
  "updatedAt",
  "notes",
] as const
