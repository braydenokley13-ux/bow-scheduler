import Link from "next/link"
import { ArrowRight, Mail, Sparkles } from "lucide-react"

import { AnimatedSection } from "@/components/animated-section"
import { BookingForm } from "@/components/share-story/booking-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const whyItMatters = [
  {
    tag: "Why now",
    title: "Capture the idea while it's still fresh",
    body: "The concepts from Sports Economics are sharpest a few weeks or months after class — once you've had a chance to test them against a real game, a real decision, a real argument with your friends.",
  },
  {
    tag: "What we're after",
    title: "One idea that changed how you watch sports",
    body: "We're not collecting generic testimonials. We want the specific concept — a model, an incentive, a tradeoff — that shifted the way you look at a roster move, a coach's call, or a front-office decision.",
  },
  {
    tag: "Who it serves",
    title: "The next cohort of students",
    body: "Your 10-minute reflection helps the next student walk into Sports Economics knowing exactly what's possible. That's worth more than any brochure we could ever write.",
  },
]

const sampleQuestions = [
  {
    number: "Q1",
    question: "What's one idea from the class you still think about?",
    hint: "A concept, a framework, a reading, a case study — whatever stuck.",
  },
  {
    number: "Q2",
    question: "Where did you see it show up in the real world after class?",
    hint: "A game you watched, a decision a GM made, a trade, a contract, a coaching move.",
  },
  {
    number: "Q3",
    question: "What do you see differently now?",
    hint: "This is the question that tends to unlock the best interview.",
  },
  {
    number: "Q4",
    question: "What would you tell a student deciding whether to take it?",
    hint: "Short and honest. No marketing voice required.",
  },
]

const expectationSteps = [
  {
    number: "01",
    title: "Pick a 10–15 minute slot",
    body: "Choose any open time on the scheduler. You'll get an email with a Google Meet link and a calendar invite the moment you submit.",
  },
  {
    number: "02",
    title: "Show up with one idea",
    body: "No prep required beyond picking one concept from Sports Economics and being ready to talk about why it stuck. The conversation is guided — we do the work.",
  },
  {
    number: "03",
    title: "You approve before anything runs",
    body: "If your reflection fits a story we're telling, we'll reach out separately. Nothing is published without your explicit approval — student or parent.",
  },
]

const audiences = [
  {
    label: "Student",
    copy: "You took Sports Economics and an idea from class won't leave your head. Come tell us about it.",
  },
  {
    label: "Parent",
    copy: "You noticed a shift in how your student talks about sports, decisions, or tradeoffs at the dinner table. That shift is exactly what we want to hear.",
  },
  {
    label: "Student + parent",
    copy: "The best conversations happen when both voices are in the room. Book the call together if you can.",
  },
]

const faqItems = [
  {
    question: "How long is the interview?",
    answer:
      "Ten to fifteen minutes. Short enough that you can fit it between classes, practice, or a work call. Long enough to get something honest.",
  },
  {
    question: "Do I need to prepare?",
    answer:
      "Come with one idea from Sports Economics that stuck. That's the only prep. We'll ask the rest of the questions, and there's no wrong answer.",
  },
  {
    question: "Will my story be published automatically?",
    answer:
      "No. We'll follow up separately if your reflection is a strong fit for a story, and we won't publish anything — not a quote, not a name — without your explicit approval.",
  },
  {
    question: "Can a student book without a parent?",
    answer:
      "Yes. Students can book solo, parents can book solo, or you can book the interview together. Pick whatever makes the conversation easiest.",
  },
  {
    question: "What if I need to reschedule?",
    answer:
      "Your confirmation email includes a management link. Use it anytime to reschedule or cancel — no email back-and-forth required.",
  },
  {
    question: "I already booked but lost the link.",
    answer:
      "Head to the Find your interview page and enter the email you used. We'll send you a fresh management link.",
  },
]

export function ShareStoryPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Ambient background art */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(183,155,103,0.14),transparent_30%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-[-16rem] top-24 h-[34rem] w-[34rem] rounded-full bg-gold-500/8 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-[-12rem] top-[38rem] h-[28rem] w-[28rem] rounded-full bg-amber-500/6 blur-3xl"
        aria-hidden
      />

      <main className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 pb-16 pt-6 sm:px-8 lg:px-10">
        {/* Nav */}
        <AnimatedSection className="rounded-full border border-border/60 bg-white/4 px-5 py-3">
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
                  Sports Economics · Student & parent interviews
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/manage/lookup"
                className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground hover:text-cream-100"
              >
                <Mail className="size-3" />
                Find your interview
              </Link>
              <Badge className="rounded-full border border-gold-500/25 bg-gold-500/10 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-gold-300">
                Fall 2025 · booking open
              </Badge>
            </div>
          </div>
        </AnimatedSection>

        {/* Hero */}
        <section className="pt-10 lg:pt-16">
          <AnimatedSection>
            <div className="grid gap-10 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-8">
                <Badge className="rounded-full border border-gold-500/25 bg-gold-500/10 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-gold-300">
                  <Sparkles className="mr-1 size-3" />
                  Sports Economics · Share your story
                </Badge>
                <div className="space-y-6">
                  <h1 className="font-display text-balance text-5xl leading-[0.95] text-cream-100 sm:text-7xl lg:text-[5.25rem]">
                    The ideas from
                    <br />
                    <span className="chalkline">Sports Economics</span>
                    <br />
                    changed how you
                    <br />
                    watch the game.
                  </h1>
                  <p className="max-w-2xl text-balance text-lg leading-8 text-muted-foreground">
                    We want to hear about one of them. Students and parents who
                    took BOW Sports Capital&apos;s Sports Economics class are invited
                    to book a short 10–15 minute interview — on video, on your
                    schedule — to share the concepts that stuck, the decisions
                    they reframed, and what you see differently now.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="h-12 rounded-full px-6 text-sm font-semibold"
                  >
                    <Link href="#scheduler">
                      Book your interview
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-full border-border/80 bg-transparent px-6 text-sm font-semibold"
                  >
                    <Link href="#questions">See the kinds of questions</Link>
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <Card className="glass-card rounded-[1.75rem] border-border/60">
                    <CardContent className="p-5">
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                        Length
                      </p>
                      <p className="mt-3 font-display text-4xl text-cream-100">
                        10–15
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-gold-300/80">
                        Minutes
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="glass-card rounded-[1.75rem] border-border/60">
                    <CardContent className="p-5">
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                        Who can book
                      </p>
                      <p className="mt-3 font-display text-2xl text-cream-100">
                        Student, parent, or both
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="glass-card rounded-[1.75rem] border-border/60">
                    <CardContent className="p-5">
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                        Format
                      </p>
                      <p className="mt-3 font-display text-2xl text-cream-100">
                        Virtual · Google Meet
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Photo-placeholder hero column */}
              <div className="relative">
                <div className="absolute -left-10 -top-8 hidden xl:block">
                  <div className="rounded-full border border-gold-500/30 bg-navy-900/70 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-gold-300">
                    BOW · Est. Sports Capital
                  </div>
                </div>

                <div
                  className="photo-placeholder h-72 sm:h-96"
                  data-label="Class photo · Sports Economics lecture"
                  aria-hidden
                />

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div
                    className="photo-placeholder h-40"
                    data-label="Whiteboard · Opportunity cost"
                    aria-hidden
                  />
                  <div
                    className="photo-placeholder h-40"
                    data-label="Student discussion"
                    aria-hidden
                  />
                </div>

                <Card className="glass-card gold-ring mt-5 rounded-[1.75rem] border-border/60">
                  <CardContent className="p-5">
                    <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">
                      A live signal
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Every interview gets logged to a Google Sheet and a
                      calendar invite. You&apos;ll hear back within a day if your
                      reflection is a fit for a story feature — and only then,
                      and only with your approval.
                    </p>
                    <div
                      className="chart-line-bg mt-4 h-20 w-full"
                      aria-hidden
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </AnimatedSection>
        </section>

        {/* Why it matters */}
        <section className="pt-20 lg:pt-28">
          <AnimatedSection className="space-y-8">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs uppercase tracking-[0.34em] text-gold-300/80">
                Why this page exists
              </p>
              <h2 className="font-display text-4xl text-cream-100 sm:text-5xl">
                One idea. Ten minutes.
                <br />
                The next cohort is listening.
              </h2>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {whyItMatters.map((item, index) => (
                <Card
                  key={item.title}
                  className="glass-card relative overflow-hidden rounded-[1.85rem] border-border/60"
                >
                  <div
                    className="hatch pointer-events-none absolute inset-0 opacity-70"
                    aria-hidden
                  />
                  <CardContent className="relative space-y-4 p-6">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.28em] text-gold-300/70">
                        {item.tag}
                      </p>
                      <p className="font-display text-3xl text-gold-300/50">
                        0{index + 1}
                      </p>
                    </div>
                    <h3 className="font-display text-3xl text-cream-100">
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

        {/* Sample questions */}
        <section id="questions" className="pt-20 lg:pt-28">
          <AnimatedSection className="space-y-8">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs uppercase tracking-[0.34em] text-gold-300/80">
                What the conversation sounds like
              </p>
              <h2 className="font-display text-4xl text-cream-100 sm:text-5xl">
                Four questions. That&apos;s it.
              </h2>
              <p className="text-base leading-8 text-muted-foreground">
                We guide the conversation so you don&apos;t have to prep. No trick
                questions, no marketing script. Just four prompts designed to
                surface the idea that actually mattered.
              </p>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {sampleQuestions.map((item) => (
                <Card
                  key={item.number}
                  className="glass-card rounded-[1.85rem] border-border/60"
                >
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-center gap-3">
                      <span className="step-dot" aria-hidden />
                      <p className="text-xs uppercase tracking-[0.28em] text-gold-300/80">
                        {item.number}
                      </p>
                    </div>
                    <h3 className="font-display text-2xl text-cream-100">
                      {item.question}
                    </h3>
                    <p className="text-sm leading-7 text-muted-foreground">
                      {item.hint}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AnimatedSection>
        </section>

        {/* Who should book */}
        <section className="pt-20 lg:pt-28">
          <AnimatedSection className="space-y-8">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs uppercase tracking-[0.34em] text-gold-300/80">
                Who should book
              </p>
              <h2 className="font-display text-4xl text-cream-100 sm:text-5xl">
                Students. Parents. Or both in the same Zoom window.
              </h2>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {audiences.map((audience) => (
                <Card
                  key={audience.label}
                  className="glass-card rounded-[1.85rem] border-border/60"
                >
                  <CardContent className="space-y-4 p-6">
                    <p className="text-xs uppercase tracking-[0.28em] text-gold-300/80">
                      {audience.label}
                    </p>
                    <p className="text-base leading-7 text-muted-foreground">
                      {audience.copy}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AnimatedSection>
        </section>

        {/* What to expect */}
        <section className="pt-20 lg:pt-28">
          <AnimatedSection className="space-y-8">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs uppercase tracking-[0.34em] text-gold-300/80">
                What to expect
              </p>
              <h2 className="font-display text-4xl text-cream-100 sm:text-5xl">
                Three steps. No chase emails.
              </h2>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {expectationSteps.map((step) => (
                <Card
                  key={step.number}
                  className="glass-card rounded-[1.85rem] border-border/60"
                >
                  <CardContent className="space-y-5 p-6">
                    <p className="font-display text-5xl text-gold-300/70">
                      {step.number}
                    </p>
                    <h3 className="font-display text-2xl text-cream-100">
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

        {/* Scheduler */}
        <section id="scheduler" className="scroll-mt-10 pt-20 lg:pt-28">
          <AnimatedSection className="grid gap-8 xl:grid-cols-[0.68fr_1.32fr]">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.34em] text-gold-300/80">
                Book your interview
              </p>
              <h2 className="font-display text-4xl text-cream-100 sm:text-5xl">
                Pick a time.
                <br />
                Bring one idea.
              </h2>
              <p className="text-base leading-8 text-muted-foreground">
                Every open slot is a real time on a real calendar. Pick the one
                that works, and you&apos;ll get a confirmation email, a Google Meet
                link, and an invite you can drop into any calendar app in
                seconds.
              </p>
              <Separator className="bg-border/60" />
              <div className="space-y-4">
                {[
                  "Times show in Phoenix (America/Phoenix) — the email confirmation handles the conversion for you.",
                  "Students can book solo. So can parents. Or book together on one call.",
                  "Need to change it? The confirmation email has a management link for rescheduling or cancelling.",
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

        {/* FAQ */}
        <section className="pt-20 lg:pt-28">
          <AnimatedSection className="space-y-8">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs uppercase tracking-[0.34em] text-gold-300/80">
                FAQ
              </p>
              <h2 className="font-display text-4xl text-cream-100 sm:text-5xl">
                Honest answers before you book.
              </h2>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {faqItems.map((item) => (
                <details
                  key={item.question}
                  className="glass-card group rounded-[1.75rem] border border-border/60 p-6 marker:hidden"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-lg font-semibold text-cream-100">
                    <span>{item.question}</span>
                    <span
                      aria-hidden
                      className="flex size-8 items-center justify-center rounded-full border border-border/70 text-gold-300 transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </AnimatedSection>
        </section>

        <footer className="pt-20">
          <AnimatedSection className="rounded-[2rem] border border-border/60 bg-white/3 px-6 py-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.34em] text-gold-300/80">
                  BOW Sports Capital
                </p>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                  Sports Economics is the class where students stop watching
                  games the same way. If it changed something for you, come
                  tell us which idea — on your terms, with final approval
                  always in your hands.
                </p>
              </div>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:items-end">
                <Link
                  href="/manage/lookup"
                  className="text-gold-300 hover:text-gold-200"
                >
                  Already booked? Find your interview →
                </Link>
                <p>© {new Date().getFullYear()} BOW Sports Capital</p>
              </div>
            </div>
          </AnimatedSection>
        </footer>
      </main>
    </div>
  )
}
