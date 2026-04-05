import Link from "next/link"

import { AnimatedSection } from "@/components/animated-section"
import { BookingForm } from "@/components/share-story/booking-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const whyFamiliesParticipate = [
  {
    title: "Show how students are thinking differently",
    body: "BOW is interested in the moments when a student begins asking sharper questions, training with more intention, and approaching competition with more maturity.",
  },
  {
    title: "Add the parent perspective",
    body: "Parents often notice the deeper changes first: confidence, discipline, intellectual curiosity, and the language students start using around sport and growth.",
  },
  {
    title: "Help the public see the real impact",
    body: "Thoughtful family interviews help BOW tell a more accurate story about the program's influence, beyond wins, highlights, or surface-level praise.",
  },
]

const expectationSteps = [
  {
    number: "01",
    title: "Choose a short interview window",
    body: "Reserve a 10-15 minute time that works for your family. The scheduler is designed to feel simple, quick, and polished.",
  },
  {
    number: "02",
    title: "Share the moments that mattered",
    body: "A BOW team member will ask a few focused questions about your student's growth, decision-making, leadership, and relationship with sport.",
  },
  {
    number: "03",
    title: "Review comes before publication",
    body: "If your family's perspective is selected for the website, BOW will follow up separately for approval before anything is shared publicly.",
  },
]

const faqItems = [
  {
    question: "Who is this intended for?",
    answer:
      "This page is for parents or guardians of students whose experience reflects the depth, discipline, and long-term growth BOW is known for.",
  },
  {
    question: "How long is the interview?",
    answer:
      "The conversation is intentionally brief. Most interviews take about 10 to 15 minutes.",
  },
  {
    question: "Will our story be published automatically?",
    answer:
      "No. BOW may follow up if your story is selected, and publication happens only after explicit approval.",
  },
  {
    question: "What kind of perspective helps most?",
    answer:
      "The strongest interviews usually include concrete moments: a shift in mindset, stronger discipline, improved curiosity, better decision-making, or a healthier relationship with competition.",
  },
]

const quotePlaceholders = [
  "Reserved for an approved family perspective on student discipline and confidence.",
  "Reserved for an approved family perspective on curiosity, growth, and maturity.",
  "Reserved for an approved family perspective on how BOW changed the way a student approaches sport.",
]

export function ShareStoryPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(183,155,103,0.12),transparent_28%)]" />
      <div className="pointer-events-none absolute right-[-16rem] top-24 h-[32rem] w-[32rem] rounded-full bg-gold-500/8 blur-3xl" />
      <div className="pointer-events-none absolute left-[-12rem] top-[34rem] h-[28rem] w-[28rem] rounded-full bg-blue-500/8 blur-3xl" />

      <main className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 pb-16 pt-6 sm:px-8 lg:px-10">
        <AnimatedSection className="rounded-full border border-border/60 bg-white/4 px-5 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-full border border-gold-500/35 bg-gold-500/10 text-sm font-semibold tracking-[0.2em] text-gold-300">
                BOW
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.34em] text-muted-foreground">
                  BOW Sports Capital
                </p>
                <p className="mt-1 text-sm text-cream-100">
                  Selected family interviews
                </p>
              </div>
            </div>
            <Badge className="rounded-full border border-gold-500/25 bg-gold-500/10 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-gold-300">
              Mission-driven storytelling
            </Badge>
          </div>
        </AnimatedSection>

        <section className="pt-10 lg:pt-14">
          <AnimatedSection>
            <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
              <div className="space-y-8">
                <Badge className="rounded-full border border-gold-500/25 bg-gold-500/10 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-gold-300">
                  Share Your BOW Story
                </Badge>
                <div className="space-y-6">
                  <h1 className="font-display text-balance text-5xl leading-none text-cream-100 sm:text-6xl lg:text-7xl">
                    Share Your BOW Story
                  </h1>
                  <p className="max-w-3xl text-balance text-lg leading-8 text-muted-foreground sm:text-xl">
                    BOW is curating a limited set of parent interviews to
                    spotlight the families who have seen real student growth:
                    sharper thinking, stronger discipline, greater intellectual
                    curiosity, and a more thoughtful approach to sports.
                  </p>
                  <p className="max-w-3xl text-balance text-base leading-8 text-muted-foreground">
                    This is not a general testimonial request. It is a selective
                    storytelling initiative designed to help BOW show the depth
                    of its impact through the families who know that change best.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" className="rounded-full px-6">
                    <Link href="#scheduler">Schedule a short interview</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="rounded-full border-border/80 bg-transparent px-6"
                  >
                    <Link href="#expect">See what to expect</Link>
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <Card className="glass-card rounded-[1.75rem] border-border/60">
                    <CardContent className="p-5">
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                        Interview length
                      </p>
                      <p className="mt-3 text-2xl font-semibold text-cream-100">
                        10-15 min
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="glass-card rounded-[1.75rem] border-border/60">
                    <CardContent className="p-5">
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                        Perspective
                      </p>
                      <p className="mt-3 text-2xl font-semibold text-cream-100">
                        Parent-led
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="glass-card rounded-[1.75rem] border-border/60">
                    <CardContent className="p-5">
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                        Publication
                      </p>
                      <p className="mt-3 text-2xl font-semibold text-cream-100">
                        Approval first
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Card className="glass-card gold-ring rounded-[2rem] border-border/70">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs uppercase tracking-[0.34em] text-gold-300/80">
                        Why this page exists
                      </p>
                      <h2 className="mt-4 font-display text-4xl text-cream-100">
                        Help tell the story of BOW Sports Capital
                      </h2>
                    </div>
                    <p className="text-base leading-8 text-muted-foreground">
                      Parent voices help BOW show what thoughtful sports
                      development really looks like: students who are more
                      reflective, more responsible, and more capable because they
                      are learning to think differently.
                    </p>
                    <Separator className="bg-border/60" />
                    <div className="space-y-4">
                      {[
                        "Selected families may be featured on the website with approval.",
                        "The strongest interviews center on student growth, not generic praise.",
                        "Short reflections from parents help BOW communicate depth and credibility.",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex gap-3 rounded-[1.5rem] border border-border/60 bg-white/3 px-4 py-4"
                        >
                          <span className="mt-2 size-2 shrink-0 rounded-full bg-gold-300" />
                          <p className="text-sm leading-7 text-muted-foreground">
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AnimatedSection>
        </section>

        <section className="pt-18 lg:pt-24">
          <AnimatedSection className="space-y-8">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs uppercase tracking-[0.34em] text-gold-300/80">
                Why Families Participate
              </p>
              <h2 className="font-display text-4xl text-cream-100 sm:text-5xl">
                A more complete picture of student impact
              </h2>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {whyFamiliesParticipate.map((item, index) => (
                <Card
                  key={item.title}
                  className="glass-card rounded-[1.85rem] border-border/60"
                >
                  <CardContent className="space-y-4 p-6">
                    <p className="text-xs uppercase tracking-[0.28em] text-gold-300/70">
                      0{index + 1}
                    </p>
                    <h3 className="text-2xl font-semibold text-cream-100">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-7 text-muted-foreground">
                      {item.body}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AnimatedSection>
        </section>

        <section id="expect" className="pt-18 lg:pt-24">
          <AnimatedSection className="space-y-8">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs uppercase tracking-[0.34em] text-gold-300/80">
                What To Expect
              </p>
              <h2 className="font-display text-4xl text-cream-100 sm:text-5xl">
                Thoughtful, brief, and guided with care
              </h2>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {expectationSteps.map((step) => (
                <Card
                  key={step.number}
                  className="glass-card rounded-[1.85rem] border-border/60"
                >
                  <CardContent className="space-y-5 p-6">
                    <p className="font-display text-4xl text-gold-300/75">
                      {step.number}
                    </p>
                    <h3 className="text-2xl font-semibold text-cream-100">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-7 text-muted-foreground">
                      {step.body}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AnimatedSection>
        </section>

        <section className="pt-18 lg:pt-24">
          <AnimatedSection className="space-y-8">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs uppercase tracking-[0.34em] text-gold-300/80">
                Sample Parent Quotes
              </p>
              <h2 className="font-display text-4xl text-cream-100 sm:text-5xl">
                Reserved for approved family voices
              </h2>
              <p className="text-base leading-8 text-muted-foreground">
                These cards are intentionally held as premium placeholders until
                approved reflections are ready. No temporary testimonials are
                being invented or implied.
              </p>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {quotePlaceholders.map((placeholder) => (
                <Card
                  key={placeholder}
                  className="glass-card rounded-[1.85rem] border-border/60"
                >
                  <CardContent className="space-y-5 p-6">
                    <p className="font-display text-5xl leading-none text-gold-300/55">
                      &ldquo;
                    </p>
                    <p className="text-sm leading-7 text-muted-foreground">
                      {placeholder}
                    </p>
                    <p className="text-xs uppercase tracking-[0.28em] text-gold-300/70">
                      Placeholder only
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AnimatedSection>
        </section>

        <section className="pt-18 lg:pt-24">
          <AnimatedSection className="space-y-8">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs uppercase tracking-[0.34em] text-gold-300/80">
                FAQ
              </p>
              <h2 className="font-display text-4xl text-cream-100 sm:text-5xl">
                Clear expectations before you book
              </h2>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {faqItems.map((item) => (
                <details
                  key={item.question}
                  className="glass-card group rounded-[1.75rem] border border-border/60 p-6"
                >
                  <summary className="cursor-pointer list-none text-lg font-semibold text-cream-100">
                    {item.question}
                  </summary>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </AnimatedSection>
        </section>

        <section id="scheduler" className="pt-18 lg:pt-24">
          <AnimatedSection className="grid gap-8 xl:grid-cols-[0.7fr_1.3fr]">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.34em] text-gold-300/80">
                Premium Scheduler Form
              </p>
              <h2 className="font-display text-4xl text-cream-100 sm:text-5xl">
                Reserve a conversation that reflects the quality of the program
              </h2>
              <p className="text-base leading-8 text-muted-foreground">
                The form on this page is designed to feel more like a startup
                product than a generic school sign-up. It is quick to complete,
                selective in tone, and built to respect your time.
              </p>
              <div className="space-y-4">
                {[
                  "Choose from live interview slots managed through BOW's scheduling system.",
                  "Share one brief reflection about how your student is thinking differently because of the program.",
                  "Receive a polished confirmation state plus a live calendar invite once your interview is reserved.",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.5rem] border border-border/60 bg-white/3 px-4 py-4"
                  >
                    <p className="text-sm leading-7 text-muted-foreground">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <BookingForm />
          </AnimatedSection>
        </section>

        <footer className="pt-18">
          <AnimatedSection className="rounded-[2rem] border border-border/60 bg-white/3 px-6 py-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.34em] text-gold-300/80">
                  BOW Sports Capital
                </p>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                  Selected family interviews are designed to highlight student
                  growth, intellectual curiosity, and real program impact with
                  care and approval.
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} BOW Sports Capital
              </p>
            </div>
          </AnimatedSection>
        </footer>
      </main>
    </div>
  )
}
