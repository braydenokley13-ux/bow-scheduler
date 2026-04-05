"use client"

import { ArrowRight, LoaderCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AdminLoginForm() {
  const router = useRouter()
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to sign in.")
      }

      router.push("/admin")
      router.refresh()
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to sign in.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="glass-card gold-ring w-full max-w-lg rounded-[2rem] border-border/70">
      <CardHeader className="space-y-3">
        <p className="text-xs uppercase tracking-[0.34em] text-gold-300/80">
          Staff Access
        </p>
        <CardTitle className="font-display text-4xl text-cream-100">
          BOW scheduling console
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password">Shared admin password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
              {error}
            </div>
          ) : null}

          <Button type="submit" disabled={loading} className="h-12 w-full rounded-full">
            {loading ? (
              <>
                <LoaderCircle className="mr-2 size-4 animate-spin" />
                Signing in
              </>
            ) : (
              <>
                Enter admin panel
                <ArrowRight className="ml-2 size-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
