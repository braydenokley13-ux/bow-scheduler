import type { Metadata } from "next"

import { ShareStoryPage } from "@/components/share-story/page"

export const metadata: Metadata = {
  title: "Share Your Sports Economics Story",
  description:
    "Students and parents from BOW Sports Capital's Sports Economics class: book a short 10–15 minute interview to share the ideas that stuck and what you see differently now.",
  openGraph: {
    title: "Share Your Sports Economics Story · BOW Sports Capital",
    description:
      "Book a short 10–15 minute interview to tell us which idea from Sports Economics stuck — and what you see differently now.",
  },
}

export default function ShareYourBowStoryPage() {
  return <ShareStoryPage />
}

