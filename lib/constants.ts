export const BOW_TIMEZONE = "America/Phoenix"
export const BOW_OFFSET = "-07:00"
export const PUBLIC_PAGE_PATH = "/share-your-bow-story"
export const ADMIN_SESSION_COOKIE = "bow_admin_session"

export const MANAGEMENT_TOKEN_AUDIENCE = "bow-scheduler:manage"
export const MANAGEMENT_TOKEN_TTL_DAYS = 45

export const bookingStatuses = ["scheduled", "completed", "cancelled"] as const
export const storyStatuses = [
  "scheduled",
  "interviewed",
  "drafted",
  "approval_pending",
  "approved",
  "featured",
] as const

export const interviewFormats = ["virtual"] as const

export const interviewRoles = ["student", "parent", "both"] as const

export const classTerms = [
  "Fall 2022",
  "Spring 2023",
  "Summer 2023",
  "Fall 2023",
  "Spring 2024",
  "Summer 2024",
  "Fall 2024",
  "Spring 2025",
  "Summer 2025",
  "Fall 2025",
  "Other / I don't remember",
] as const

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
  "classTerm",
  "interviewRole",
  "favoriteIdea",
] as const
