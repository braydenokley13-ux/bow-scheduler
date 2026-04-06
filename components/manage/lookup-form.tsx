"use client"

import { LoaderCircle, Mail } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LookupForm() {
  const [email, setEmail] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch("/api/manage/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to send the link.")
      }

      setMessage(payload.message)
      toast.success("Check your inbox.")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to send the link."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="glass-card gold-ring rounded-[2rem] border-border/60">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="lookup-email">Your email</Label>
            <Input
              id="lookup-email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <Button
            type="submit"
            disabled={submitting}
            className="h-12 w-full justify-center rounded-full text-sm font-semibold"
          >
            {submitting ? (
              <>
                <LoaderCircle className="mr-2 size-4 animate-spin" />
                Sending link
              </>
            ) : (
              <>
                <Mail className="mr-2 size-4" />
                Send me my management link
              </>
            )}
          </Button>
          {message && (
            <p className="rounded-2xl border border-gold-500/30 bg-gold-500/10 px-4 py-3 text-sm leading-6 text-cream-100">
              {message}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
