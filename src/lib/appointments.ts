// Appointment domain: types, status labels, phone normalization, ID generation,
// and a storage adapter (localStorage today, swappable for a real backend).

export const STATUSES = [
  "REQUEST_RECEIVED",
  "CALLING",
  "CONNECTED",
  "COLLECTING_DETAILS",
  "CONFIRMED",
  "RESCHEDULE_REQUESTED",
  "CONFIRMATION_NEEDED",
  "NO_ANSWER",
  "CANCELLED",
] as const;
export type AppointmentStatus = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  REQUEST_RECEIVED: "Request Received",
  CALLING: "Calling...",
  CONNECTED: "Connected",
  COLLECTING_DETAILS: "Discussing Details",
  CONFIRMED: "Confirmed",
  RESCHEDULE_REQUESTED: "Reschedule Requested",
  CONFIRMATION_NEEDED: "Confirmation Needed",
  NO_ANSWER: "No Answer",
  CANCELLED: "Cancelled",
};

export const STATUS_DESCRIPTIONS: Record<AppointmentStatus, string> = {
  REQUEST_RECEIVED: "Your request is in. We'll call you shortly.",
  CALLING: "Our assistant is calling your phone now.",
  CONNECTED: "You're connected with the AppointFlow Assistant.",
  COLLECTING_DETAILS: "Discussing appointment details.",
  CONFIRMED: "Your appointment is confirmed.",
  RESCHEDULE_REQUESTED: "You asked for a different time. We'll follow up.",
  CONFIRMATION_NEEDED: "We need a quick confirmation from you.",
  NO_ANSWER: "We couldn't reach you. We'll try again soon.",
  CANCELLED: "This appointment has been cancelled.",
};

export type StatusTone = "neutral" | "active" | "success" | "warning" | "danger";
export function statusTone(s: AppointmentStatus): StatusTone {
  if (s === "CONFIRMED") return "success";
  if (s === "CALLING" || s === "CONNECTED" || s === "COLLECTING_DETAILS") return "active";
  if (s === "RESCHEDULE_REQUESTED" || s === "CONFIRMATION_NEEDED" || s === "NO_ANSWER") return "warning";
  if (s === "CANCELLED") return "danger";
  return "neutral";
}

export const APPOINTMENT_TYPES = [
  "Consultation",
  "Demo",
  "Meeting",
  "Follow-up",
  "General Appointment",
] as const;

export const TIME_RANGES = [
  "Morning (9:00 AM - 12:00 PM)",
  "Afternoon (12:00 PM - 4:00 PM)",
  "Evening (4:00 PM - 7:00 PM)",
] as const;

export const TIMEZONE = "Asia/Kolkata";

export type TimelineEntry = { status: AppointmentStatus; at: string };

export type Appointment = {
  appointment_id: string;
  name: string;
  phone: string;
  email: string;
  appointment_type: string;
  preferred_date: string;
  preferred_date_raw: string;
  preferred_time: string;
  preferred_time_range: string;
  timezone: string;
  notes: string;
  status: AppointmentStatus;
  mode: "demo" | "real";
  timeline: TimelineEntry[];
  created_at: string;
  updated_at: string;
};

/** Normalize to E.164. 10-digit Indian numbers default to +91. Returns null if invalid. */
export function normalizePhone(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const hasPlus = trimmed.startsWith("+");
  let digits = trimmed.replace(/\D/g, "");
  if (!hasPlus) {
    if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
    if (digits.length === 10) return /^[6-9]/.test(digits) ? `+91${digits}` : null;
    if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
    return null;
  }
  if (digits.startsWith("91")) return digits.length === 12 && /^91[6-9]/.test(digits) ? `+${digits}` : null;
  return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
}

export function formatPhone(e164: string): string {
  const m = e164.match(/^\+91(\d{5})(\d{5})$/);
  return m ? `+91 ${m[1]} ${m[2]}` : e164;
}

/** Today's date as YYYY-MM-DD in Asia/Kolkata. */
export function todayRaw(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(new Date());
}

/** Format a YYYY-MM-DD string without any timezone shifting. */
export function formatDateRaw(raw: string): string {
  const [y, m, d] = raw.split("-").map(Number);
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${months[m! - 1]} ${d}, ${y}`;
}

/** "14:30" -> "2:30 PM" */
export function formatTime24(t: string): string {
  const [h = 0, m = 0] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function generateAppointmentId(): string {
  const ymd = todayRaw().replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `APT-${ymd}-${rand}`;
}

export function formatTimestamp(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: TIMEZONE,
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(iso));
}

// ---------- Storage adapter ----------
export interface AppointmentStore {
  list(): Appointment[];
  get(id: string): Appointment | undefined;
  findByPhone(phone: string): Appointment | undefined;
  save(a: Appointment): void;
  setStatus(id: string, status: AppointmentStatus): Appointment | undefined;
}

const KEY = "appointflow.appointments.v1";
const EVENT = "appointflow:change";

function read(): Appointment[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
function write(list: Appointment[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

export const localStore: AppointmentStore = {
  list: read,
  get: (id) => read().find((a) => a.appointment_id.toUpperCase() === id.trim().toUpperCase()),
  findByPhone: (phone) => {
    const n = normalizePhone(phone);
    if (!n) return undefined;
    return read()
      .filter((a) => a.phone === n)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  },
  save: (a) => {
    const list = read().filter((x) => x.appointment_id !== a.appointment_id);
    write([a, ...list]);
  },
  setStatus: (id, status) => {
    const list = read();
    const a = list.find((x) => x.appointment_id === id);
    if (!a) return undefined;
    if (a.status === status) return a;
    const now = new Date().toISOString();
    a.status = status;
    a.updated_at = now;
    a.timeline = [...a.timeline, { status, at: now }];
    write(list);
    return a;
  },
};

export const store: AppointmentStore = localStore;
export const STORE_EVENT = EVENT;

// ---------- Demo simulation ----------
const DEMO_SCHEDULE: [number, AppointmentStatus][] = [
  [3000, "CALLING"],
  [8000, "CONNECTED"],
  [15000, "COLLECTING_DETAILS"],
  [25000, "CONFIRMED"],
];

/** Advances a demo appointment based on elapsed time since creation. Resumable across reloads. */
export function tickDemo(a: Appointment): void {
  if (a.mode !== "demo") return;
  const elapsed = Date.now() - new Date(a.created_at).getTime();
  const order = STATUSES.indexOf(a.status);
  for (const [ms, s] of DEMO_SCHEDULE) {
    if (elapsed >= ms && STATUSES.indexOf(s) > order && order < STATUSES.indexOf("CONFIRMED")) {
      store.setStatus(a.appointment_id, s);
    }
  }
}

export const MODE_KEY = "appointflow.mode";
