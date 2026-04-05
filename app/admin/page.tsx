import { redirect } from "next/navigation"

import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { getAdminSessionFromCookies } from "@/lib/auth"
import { getAdminSnapshot } from "@/lib/services/scheduler"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const session = await getAdminSessionFromCookies()

  if (!session) {
    redirect("/admin/login")
  }

  const snapshot = await getAdminSnapshot()

  return (
    <AdminDashboard bookings={snapshot.bookings} slots={snapshot.slots} />
  )
}
