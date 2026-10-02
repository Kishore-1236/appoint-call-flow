import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  CalendarClock,
  CalendarSync,
  ClipboardList,
  GraduationCap,
  Hotel,
  ListChecks,
  MessageSquare,
  MousePointerClick,
  PhoneCall,
  PhoneOutgoing,
  Scale,
  Send,
  Settings2,
  Stethoscope,
  Timer,
  CheckCircle2,
  FolderKanban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Footer, Navbar } from "@/components/site/chrome";
import { BookingForm } from "@/components/site/booking-form";
import { CallCard, ProgressSteps, StatusBadge } from "@/components/site/status-ui";

const TITLE = "AppointFlow — Book an appointment. We'll handle the call.";
const DESC =
  "Submit an appointment request in a minute. Our automated calling assistant calls you to confirm or reschedule a convenient time.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Section({ id, eyebrow, title, intro, children, className = "" }: { id?: string; eyebrow?: string; title: string; intro?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`py-20 md:py-24 ${className}`}>
      <div className="mx-auto max-w-6xl px-5">
        <div className="max-w-2xl">
          {eyebrow && <p className="text-sm font-medium text-primary">{eyebrow}</p>}
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
          {intro && <p className="mt-3 text-muted-foreground">{intro}</p>}
        </div>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}

function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="border-b border-border">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-[1.1fr_1fr] md:py-24">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
                <PhoneOutgoing className="h-3.5 w-3.5 text-primary" /> Automated confirmation calls
              </p>
              <h1 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
                Book your appointment. We'll take care of the rest.
              </h1>
              <p className="mt-5 max-w-lg text-lg text-muted-foreground">
                Submit your request in a minute. Our automated calling assistant will contact you, discuss the details, and help confirm a convenient time.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/" hash="book">Book an Appointment <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/" hash="how-it-works">How It Works</Link>
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Appointment</p>
                    <p className="mt-0.5 font-mono text-sm">APT-20261002-8492</p>
                  </div>
                  <StatusBadge status="CALLING" />
                </div>
                <div className="mt-5 grid grid-cols-3 gap-4 border-y border-border py-4 text-sm">
                  <div><p className="text-xs text-muted-foreground">Name</p><p className="mt-0.5 font-medium">Rahul Kumar</p></div>
                  <div><p className="text-xs text-muted-foreground">Service</p><p className="mt-0.5 font-medium">Consultation</p></div>
                  <div><p className="text-xs text-muted-foreground">When</p><p className="mt-0.5 font-medium">Oct 2, 10:30 AM</p></div>
                </div>
                <div className="mt-5"><ProgressSteps step={1} /></div>
              </div>
              <div className="md:ml-10"><CallCard status="COLLECTING_DETAILS" /></div>
            </div>
          </div>
        </section>

        {/* Value strip */}
        <section className="border-b border-border bg-card">
          <div className="mx-auto grid max-w-6xl gap-6 px-5 py-8 sm:grid-cols-3">
            {[
              [MousePointerClick, "Easy to Book", "A short form, no account needed."],
              [PhoneCall, "Automated Calling", "We call you to confirm the details."],
              [CalendarClock, "Flexible Scheduling", "Pick a time, or reschedule on the call."],
            ].map(([I, t, d]) => {
              const Icon = I as typeof PhoneCall;
              return (
                <div key={t as string} className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-5 w-5 text-primary" strokeWidth={1.75} />
                  <div><p className="font-medium">{t as string}</p><p className="text-sm text-muted-foreground">{d as string}</p></div>
                </div>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <Section id="how-it-works" eyebrow="How it works" title="From request to confirmed, in four steps">
          <ol className="relative grid gap-8 md:grid-cols-4">
            <div aria-hidden className="absolute left-5 right-5 top-5 hidden h-px bg-border md:block" />
            {[
              [Send, "Submit your request", "Tell us who you are, what you need, and when suits you."],
              [Settings2, "We process your request", "Your details are passed to our scheduling workflow."],
              [PhoneCall, "You receive a call", "Our assistant calls to discuss and confirm the time."],
              [CheckCircle2, "Appointment gets confirmed", "Track the final status anytime on the status page."],
            ].map(([I, t, d], i) => {
              const Icon = I as typeof Send;
              return (
                <li key={t as string} className="relative">
                  <span className="relative grid h-10 w-10 place-items-center rounded-full border border-border bg-background text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="mt-4 text-xs font-medium text-muted-foreground">Step {i + 1}</p>
                  <p className="mt-1 font-semibold">{t as string}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{d as string}</p>
                </li>
              );
            })}
          </ol>
        </Section>

        {/* Booking */}
        <section id="book" className="border-y border-border bg-secondary/50 py-20 md:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-[1fr_1.5fr]">
            <div>
              <p className="text-sm font-medium text-primary">Book</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Book an appointment</h2>
              <p className="mt-3 text-muted-foreground">
                Fill in your details and preferred time. You'll get a call shortly after to confirm everything.
              </p>
              <ul className="mt-8 space-y-4 text-sm">
                <li className="flex gap-3"><Timer className="h-4 w-4 text-primary" /> Takes about a minute</li>
                <li className="flex gap-3"><PhoneCall className="h-4 w-4 text-primary" /> Calls come from "AppointFlow Assistant"</li>
                <li className="flex gap-3"><ListChecks className="h-4 w-4 text-primary" /> Track your request with your appointment ID</li>
              </ul>
            </div>
            <BookingForm />
          </div>
        </section>

        {/* Features */}
        <Section eyebrow="Features" title="Everything needed to get appointments confirmed">
          <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {[
              [PhoneOutgoing, "Automated Appointment Calls", "Every request triggers a call, so nothing waits in an inbox."],
              [MessageSquare, "Natural Conversations", "The assistant speaks clearly and listens to what you need."],
              [CalendarClock, "Date & Time Confirmation", "Your preferred slot is read back and confirmed on the call."],
              [CalendarSync, "Rescheduling", "Need another time? Say so and it's noted right away."],
              [BarChart3, "Status Tracking", "See each step, with timestamps, on the status page."],
              [FolderKanban, "Workflow Automation", "Requests flow into your existing tools automatically."],
            ].map(([I, t, d]) => {
              const Icon = I as typeof Send;
              return (
                <div key={t as string} className="bg-card p-6">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
                  <p className="mt-4 font-semibold">{t as string}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{d as string}</p>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Use cases */}
        <Section eyebrow="Use cases" title="Built for teams that run on appointments" className="pt-0 md:pt-0">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              [Stethoscope, "Healthcare", "Clinic visits and check-ups."],
              [GraduationCap, "Education", "Admissions and counselling."],
              [Scale, "Consulting", "Discovery and strategy calls."],
              [Hotel, "Hospitality", "Reservations and site visits."],
              [Briefcase, "Professional Services", "Client meetings and reviews."],
            ].map(([I, t, d]) => {
              const Icon = I as typeof Send;
              return (
                <div key={t as string} className="rounded-xl border border-border bg-card p-5">
                  <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
                  <p className="mt-3 font-medium">{t as string}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{d as string}</p>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Why */}
        <section className="border-y border-border bg-card py-20 md:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-primary">Why this approach</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Less coordination. More confirmed appointments.</h2>
            </div>
            <div className="divide-y divide-border">
              {[
                [PhoneCall, "Reduce manual calling", "Your team stops chasing confirmations one number at a time."],
                [Timer, "Respond faster", "People hear back within minutes, while the request is fresh."],
                [ClipboardList, "Keep everything organized", "Every request has an ID, a status, and a history."],
              ].map(([I, t, d]) => {
                const Icon = I as typeof Send;
                return (
                  <div key={t as string} className="flex gap-4 py-5 first:pt-0">
                    <Icon className="mt-0.5 h-5 w-5 text-success" strokeWidth={1.75} />
                    <div><p className="font-semibold">{t as string}</p><p className="mt-1 text-sm text-muted-foreground">{d as string}</p></div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <Section eyebrow="FAQ" title="Common questions">
          <Accordion type="single" collapsible className="max-w-3xl">
            {[
              ["How soon will I get a call?", "Usually within a few minutes of submitting your request."],
              ["Who will be calling me?", "The call comes from the AppointFlow Assistant, an automated calling assistant that confirms your appointment details."],
              ["What if I miss the call?", "Your status will show \"No Answer\" and we'll try reaching you again."],
              ["Can I change my appointment time?", "Yes. Just tell the assistant during the call and your request will be marked for rescheduling."],
              ["How do I check my appointment status?", "Open the Status page and search by your appointment ID or phone number."],
              ["Is my information kept private?", "Your details are only used to schedule and confirm your appointment."],
            ].map(([q, a]) => (
              <AccordionItem key={q} value={q}>
                <AccordionTrigger className="text-left">{q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
