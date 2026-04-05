import type { Metadata } from "next"

import { ShareStoryPage } from "@/components/share-story/page"

export const metadata: Metadata = {
  title: "Share Your BOW Story | BOW Sports Capital",
  description:
    "Schedule a short family interview to help BOW Sports Capital highlight student growth and real program impact.",
}

export default function ShareYourBowStoryPage() {
  return <ShareStoryPage />
}
