import { redirect } from "next/navigation"

import { AdminLoginForm } from "@/components/admin/admin-login-form"
import { getAdminSessionFromCookies } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function AdminLoginPage() {
  const session = await getAdminSessionFromCookies()

  if (session) {
    redirect("/admin")
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-5 py-12 sm:px-8 lg:px-10">
      <div className="grid w-full items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.34em] text-gold-300/80">
            Internal access
          </p>
          <h1 className="font-display text-5xl text-cream-100 sm:text-6xl">
            Manage interviews, approvals, and story follow-up
          </h1>
          <p className="max-w-2xl text-base leading-8 text-muted-foreground">
            This shared-password screen unlocks the BOW scheduling console for
            staff. From there, the team can create slots, track bookings,
            reschedule families, and manage the story pipeline.
          </p>
        </div>
        <div className="flex justify-center lg:justify-end">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  )
}
