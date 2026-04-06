import type { Metadata } from "next"

import { LookupForm } from "@/components/manage/lookup-form"

export const metadata: Metadata = {
  title: "Find your interview",
  robots: { index: false, follow: false },
}

export default function LookupPage() {
  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-3xl flex-col items-center justify-center px-6 py-16">
      <div className="w-full space-y-6">
        <div className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-[0.34em] text-gold-300/80">
            BOW Sports Capital · Sports Economics
          </p>
          <h1 className="font-display text-5xl text-cream-100 sm:text-6xl">
            Find your interview
          </h1>
          <p className="mx-auto max-w-xl text-base leading-7 text-muted-foreground">
            Already booked and need the management link? Enter the email you
            used when you signed up and we&apos;ll send it to you.
          </p>
        </div>

        <LookupForm />
      </div>
    </main>
  )
}
