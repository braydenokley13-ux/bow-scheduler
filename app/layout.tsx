import type { Metadata } from "next"
import { Toaster } from "sonner"

import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "BOW Sports Capital · Share Your Sports Economics Story",
    template: "%s · BOW Sports Capital",
  },
  description:
    "Students who took BOW Sports Capital's Sports Economics class — and their parents — can book a short 10–15 minute interview to share the ideas that stuck, the moments that changed them, and what they see differently now.",
  openGraph: {
    title: "Share Your BOW Sports Economics Story",
    description:
      "Tell us which ideas from BOW Sports Capital's Sports Economics class stuck with you — and how the class changed the way you think about sports, decisions, and incentives.",
    siteName: "BOW Sports Capital",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Share Your BOW Sports Economics Story",
    description:
      "A short 10–15 minute interview for students and parents from BOW Sports Capital's Sports Economics class.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        {/*
          Fonts are loaded at runtime from Google Fonts so the production build
          does not need outbound network access during compilation. If the
          stylesheet fails to load, the system font stack in globals.css takes
          over seamlessly.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster
          position="top-right"
          theme="dark"
          richColors
          closeButton
          toastOptions={{
            classNames: {
              toast:
                "border border-border/60 bg-card/95 text-foreground backdrop-blur-xl",
            },
          }}
        />
      </body>
    </html>
  )
}
