import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Search, SearchX, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Footer, Navbar } from "@/components/site/chrome";
import { CallCard, ProgressSteps, StatusBadge } from "@/components/site/status-ui";
import { cn } from "@/lib/utils";
import {
  STATUSES,
  STATUS_DESCRIPTIONS,
  STATUS_LABELS,
  STORE_EVENT,
  formatPhone,
  formatTimestamp,
  normalizePhone,
  statusTone,
  store,
  tickDemo,
  type Appointment,
  type AppointmentStatus,
} from "@/lib/appointments";

const searchSchema = z.object({
  id: z.string().optional(),
  phone: z.string().optional(),
  dev: z.union([z.string(), z.number(), z.boolean()]).optional(),
});

export const Route = createFileRoute("/status")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Appointment status — AppointFlow" },
      { name: "description", content: "Look up your appointment by ID or phone number and follow each step of your confirmation call." },
      { property: "og:title", content: "Appointment status — AppointFlow" },
      { property: "og:description", content: "Track your AppointFlow appointment and confirmation call in real time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StatusPage,
});

function useAppointment(id?: string, phone?: string) {
  const [appt, setAppt] = useState<Appointment | null | undefined>(undefined);
  useEffect(() => {
    const load = () => {
      let a = id ? store.get(id) : phone ? store.findByPhone(phone) : undefined;
      if (a) {
        tickDemo(a);
        a = store.get(a.appointment_id);
      }
      setAppt(id || phone ? a ?? null : undefined);
    };
    load();
    const t = setInterval(load, 1000);
    window.addEventListener(STORE_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      clearInterval(t);
      window.removeEventListener(STORE_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, [id, phone]);
  return appt;
}

function StatusPage() {
  const { id, phone, dev } = Route.useSearch();
  const navigate = useNavigate({ from: "/status" });
  const appt = useAppointment(id, phone);
  const [q, setQ] = useState(id ?? phone ?? "");
  const [preview, setPreview] = useState<AppointmentStatus | null>(null);
  const [showDev, setShowDev] = useState(dev !== undefined);

  useEffect(() => setQ(id ?? phone ?? ""), [id, phone]);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const v = q.trim();
    if (!v) return;
    if (/^apt-/i.test(v)) navigate({ search: { id: v.toUpperCase() } });
    else {
      const n = normalizePhone(v);
      navigate({ search: { phone: n ? n.replace("+", "") : v } });
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-4xl px-5 py-14">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Appointment status</h1>
        <p className="mt-2 text-muted-foreground">Search by your appointment ID or the phone number you booked with.</p>

        <form onSubmit={onSearch} className="mt-6 flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input aria-label="Appointment ID or phone number" className="h-11 pl-9" placeholder="APT-20261002-8492 or +91 98765 43210" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Button type="submit" className="h-11">Search</Button>
        </form>

        <div className="mt-10">
          {appt === undefined && !(id || phone) && (
            <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              Enter your appointment ID or phone number above to see its status.
            </p>
          )}
          {appt === null && <NotFound />}
          {appt && <Details appt={appt} preview={preview} />}
        </div>

        <div className="mt-16 border-t border-dashed border-border pt-4">
          <button onClick={() => setShowDev(!showDev)} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Wrench className="h-3.5 w-3.5" /> {showDev ? "Hide" : "Show"} developer tools
          </button>
          {showDev && (
            <div className="mt-3 rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status preview (testing only)</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <DevChip active={preview === null} onClick={() => setPreview(null)}>Live</DevChip>
                {STATUSES.map((s) => (
                  <DevChip key={s} active={preview === s} onClick={() => setPreview(s)}>{s}</DevChip>
                ))}
              </div>
              {appt && preview && (
                <Button size="sm" variant="outline" className="mt-3" onClick={() => store.setStatus(appt.appointment_id, preview)}>
                  Write "{STATUS_LABELS[preview]}" to this appointment
                </Button>
              )}
              {!appt && <p className="mt-3 text-xs text-muted-foreground">Previewing without an appointment shows sample data.</p>}
              {!appt && preview && <div className="mt-4"><Details appt={sample} preview={preview} /></div>}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function DevChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn("rounded-md border px-2 py-1 font-mono text-[11px]", active ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:bg-muted")}>
      {children}
    </button>
  );
}

function NotFound() {
  return (
    <div className="rounded-xl border border-border bg-card p-10 text-center">
      <SearchX className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
      <p className="mt-4 text-lg font-semibold">Appointment not found</p>
      <p className="mt-1 text-sm text-muted-foreground">Please check your appointment ID or phone number and try again.</p>
      <Button asChild className="mt-6"><Link to="/" hash="book">Book an appointment</Link></Button>
    </div>
  );
}

function Details({ appt, preview }: { appt: Appointment; preview: AppointmentStatus | null }) {
  const status = preview ?? appt.status;
  const tone = statusTone(status);
  const step: 0 | 1 | 2 = status === "CONFIRMED" ? 2 : status === "REQUEST_RECEIVED" ? 0 : 1;
  const callStart = appt.timeline.find((t) => t.status === "CALLING")?.at;
  const showCall = tone === "active" || status === "NO_ANSWER";

  return (
    <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Appointment ID</p>
              <p className="font-mono">{appt.appointment_id}</p>
            </div>
            <StatusBadge status={status} />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{STATUS_DESCRIPTIONS[status]}</p>
          <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-5 text-sm">
            <Item k="Name" v={appt.name} />
            <Item k="Phone" v={formatPhone(appt.phone)} />
            <Item k="Type" v={appt.appointment_type} />
            <Item k="Date & time" v={`${appt.preferred_date}, ${appt.preferred_time}`} />
            <Item k="Time range" v={appt.preferred_time_range} />
            <Item k="Mode" v={appt.mode === "demo" ? "Demo (simulated)" : "Real"} />
          </dl>
          <div className="mt-5 border-t border-border pt-5"><ProgressSteps step={step} /></div>
        </div>
        {showCall && <CallCard status={status} since={callStart} />}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <p className="font-semibold">History</p>
        <ol className="mt-4 space-y-0">
          {[...appt.timeline].reverse().map((t, i) => (
            <li key={t.at + t.status} className="relative flex gap-3 pb-5 last:pb-0">
              {i < appt.timeline.length - 1 && <span className="absolute left-[5px] top-4 h-full w-px bg-border" />}
              <span className={cn("relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border-2 border-card", i === 0 ? "bg-primary" : "bg-muted-foreground/40")} />
              <div>
                <p className="text-sm font-medium">{STATUS_LABELS[t.status]}</p>
                <p className="text-xs text-muted-foreground">{formatTimestamp(t.at)} IST</p>
              </div>
            </li>
          ))}
        </ol>
        {appt.mode === "real" && tone !== "success" && (
          <p className="mt-6 rounded-md bg-muted p-3 text-xs text-muted-foreground">
            Updates appear here as the call progresses.
          </p>
        )}
      </div>
    </div>
  );
}

function Item({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{k}</dt>
      <dd className="mt-0.5 font-medium">{v}</dd>
    </div>
  );
}

const sample: Appointment = {
  appointment_id: "APT-20261002-8492",
  name: "Rahul Kumar",
  phone: "+919876543210",
  email: "rahul@example.com",
  appointment_type: "Consultation",
  preferred_date: "October 2, 2026",
  preferred_date_raw: "2026-10-02",
  preferred_time: "10:30 AM",
  preferred_time_range: "Morning (9:00 AM - 12:00 PM)",
  timezone: "Asia/Kolkata",
  notes: "",
  status: "REQUEST_RECEIVED",
  mode: "demo",
  timeline: [{ status: "REQUEST_RECEIVED", at: "2026-10-02T05:00:00.000Z" }],
  created_at: "2026-10-02T05:00:00.000Z",
  updated_at: "2026-10-02T05:00:00.000Z",
};
