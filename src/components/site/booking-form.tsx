import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AlertCircle, CalendarIcon, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  APPOINTMENT_TYPES,
  MODE_KEY,
  TIME_RANGES,
  TIMEZONE,
  formatDateRaw,
  formatPhone,
  formatTime24,
  generateAppointmentId,
  normalizePhone,
  store,
  todayRaw,
  type Appointment,
} from "@/lib/appointments";
import { submitToWebhook } from "@/lib/webhook.functions";
import { StatusBadge } from "./status-ui";

type Form = {
  name: string;
  phone: string;
  email: string;
  type: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  range: string;
  notes: string;
};
const empty: Form = { name: "", phone: "", email: "", type: "", date: "", time: "", range: "", notes: "" };

function rawFromDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function dateFromRaw(raw: string) {
  const [y, m, d] = raw.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function validate(f: Form): Partial<Record<keyof Form, string>> {
  const e: Partial<Record<keyof Form, string>> = {};
  if (f.name.trim().length < 2) e.name = "Please enter your full name.";
  if (!normalizePhone(f.phone)) e.phone = "Enter a valid phone number, e.g. 98765 43210.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "Enter a valid email address.";
  if (!f.type) e.type = "Choose an appointment type.";
  if (!f.date) e.date = "Pick a preferred date.";
  else if (f.date < todayRaw()) e.date = "Please choose today or a future date.";
  if (!f.time) e.time = "Pick a preferred time.";
  if (!f.range) e.range = "Choose a time range.";
  if (f.notes.length > 1000) e.notes = "Keep notes under 1000 characters.";
  return e;
}

export function BookingForm() {
  const submit = useServerFn(submitToWebhook);
  const [form, setForm] = useState<Form>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [loading, setLoading] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [done, setDone] = useState<Appointment | null>(null);
  const [demo, setDemo] = useState(true);
  const [dateOpen, setDateOpen] = useState(false);

  useEffect(() => {
    const m = localStorage.getItem(MODE_KEY);
    if (m) setDemo(m === "demo");
  }, []);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const normalized = normalizePhone(form.phone);

  async function onSubmit(ev?: React.FormEvent) {
    ev?.preventDefault();
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setFailure(null);
    const payload = {
      appointment_id: generateAppointmentId(),
      name: form.name.trim(),
      phone: normalized!,
      email: form.email.trim(),
      appointment_type: form.type,
      preferred_date: formatDateRaw(form.date),
      preferred_date_raw: form.date,
      preferred_time: formatTime24(form.time),
      preferred_time_range: form.range,
      timezone: TIMEZONE,
      notes: form.notes.trim(),
    };
    try {
      const res = await submit({ data: payload });
      if (!res.ok) {
        setFailure(res.error);
        return;
      }
      const now = new Date().toISOString();
      const appt: Appointment = {
        ...payload,
        appointment_id: res.appointment_id ?? payload.appointment_id,
        status: "REQUEST_RECEIVED",
        mode: demo ? "demo" : "real",
        timeline: [{ status: "REQUEST_RECEIVED", at: now }],
        created_at: now,
        updated_at: now,
      };
      store.save(appt);
      setDone(appt);
      setForm(empty);
    } catch {
      setFailure("Something went wrong while sending your request.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
        <CheckCircle2 className="h-9 w-9 text-success" />
        <h3 className="mt-4 text-2xl font-semibold tracking-tight">Appointment request received</h3>
        <p className="mt-2 text-muted-foreground">
          We've received your request. You'll receive an automated call shortly to confirm the details.
        </p>
        <dl className="mt-6 grid gap-x-6 gap-y-4 rounded-xl border border-border bg-background p-5 text-sm sm:grid-cols-2">
          <Row k="Appointment ID" v={<span className="font-mono">{done.appointment_id}</span>} />
          <Row k="Status" v={<StatusBadge status={done.status} />} />
          <Row k="Name" v={done.name} />
          <Row k="Phone" v={formatPhone(done.phone)} />
          <Row k="Type" v={done.appointment_type} />
          <Row k="Date & time" v={`${done.preferred_date}, ${done.preferred_time}`} />
          <Row k="Time range" v={done.preferred_time_range} />
          <Row k="Email" v={done.email} />
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/status" search={{ id: done.appointment_id }}>View Appointment Status</Link>
          </Button>
          <Button variant="outline" onClick={() => setDone(null)}>Book another</Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-2xl border border-border bg-card p-6 md:p-8">
      {failure && (
        <div role="alert" className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div className="flex-1">
            <p className="font-medium text-destructive">Your request wasn't sent</p>
            <p className="mt-1 text-muted-foreground">{failure} Your details are still here.</p>
          </div>
          <Button type="button" size="sm" variant="outline" onClick={() => onSubmit()} disabled={loading}>
            Try Again
          </Button>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Full Name" error={errors.name}>
          <Input id="name" autoComplete="name" placeholder="Rahul Kumar" value={form.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors.name} />
        </Field>
        <Field
          id="phone"
          label="Phone Number"
          error={errors.phone}
          hint={normalized ? `We'll call ${formatPhone(normalized)}` : "10-digit Indian numbers get +91 automatically."}
        >
          <Input id="phone" type="tel" autoComplete="tel" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => set("phone", e.target.value)} aria-invalid={!!errors.phone} />
        </Field>
        <Field id="email" label="Email Address" error={errors.email}>
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} aria-invalid={!!errors.email} />
        </Field>
        <Field id="type" label="Appointment Type" error={errors.type}>
          <Select value={form.type} onValueChange={(v) => set("type", v)}>
            <SelectTrigger id="type" aria-invalid={!!errors.type}><SelectValue placeholder="Select a service" /></SelectTrigger>
            <SelectContent>
              {APPOINTMENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field id="date" label="Preferred Date" error={errors.date}>
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <Button id="date" type="button" variant="outline" className={cn("w-full justify-start font-normal", !form.date && "text-muted-foreground")} aria-invalid={!!errors.date}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.date ? formatDateRaw(form.date) : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={form.date ? dateFromRaw(form.date) : undefined}
                onSelect={(d) => { if (d) { set("date", rawFromDate(d)); setDateOpen(false); } }}
                disabled={(d) => rawFromDate(d) < todayRaw()}
                className="pointer-events-auto p-3"
              />
            </PopoverContent>
          </Popover>
        </Field>
        <Field id="time" label="Preferred Time" error={errors.time}>
          <Input id="time" type="time" step={900} value={form.time} onChange={(e) => set("time", e.target.value)} aria-invalid={!!errors.time} />
        </Field>
        <div className="sm:col-span-2">
          <Label className="mb-2 block">Preferred Time Range</Label>
          <div className="grid gap-2 sm:grid-cols-3" role="radiogroup">
            {TIME_RANGES.map((r) => {
              const [title, span] = r.split(" (");
              const on = form.range === r;
              return (
                <button
                  type="button"
                  role="radio"
                  aria-checked={on}
                  key={r}
                  onClick={() => set("range", r)}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    on ? "border-primary bg-primary/5" : "border-input hover:bg-muted",
                  )}
                >
                  <span className="block font-medium">{title}</span>
                  <span className="text-xs text-muted-foreground">{span.replace(")", "")}</span>
                </button>
              );
            })}
          </div>
          {errors.range && <p className="mt-1.5 text-xs text-destructive">{errors.range}</p>}
        </div>
        <div className="sm:col-span-2">
          <Field id="notes" label="Additional Notes" error={errors.notes} optional>
            <Textarea id="notes" rows={3} placeholder="Anything we should know before the call?" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </Field>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-lg bg-muted/60 px-4 py-3">
        <div>
          <p className="text-sm font-medium">{demo ? "Demo mode" : "Real mode"}</p>
          <p className="text-xs text-muted-foreground">
            {demo ? "Status updates are simulated after you submit." : "Status waits for real call updates."}
          </p>
        </div>
        <Switch checked={demo} onCheckedChange={(v) => { setDemo(v); localStorage.setItem(MODE_KEY, v ? "demo" : "real"); }} aria-label="Demo mode" />
      </div>

      <Button type="submit" size="lg" className="mt-6 w-full" disabled={loading}>
        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending request…</> : "Request Appointment"}
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        By submitting this form, you agree to receive an appointment-related call.
      </p>
    </form>
  );
}

function Field({ id, label, error, hint, optional, children }: { id: string; label: string; error?: string; hint?: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <Label htmlFor={id} className="mb-2 block">
        {label} {optional && <span className="font-normal text-muted-foreground">(optional)</span>}
      </Label>
      {children}
      {error ? <p className="mt-1.5 text-xs text-destructive">{error}</p> : hint ? <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{k}</dt>
      <dd className="mt-0.5 font-medium">{v}</dd>
    </div>
  );
}
