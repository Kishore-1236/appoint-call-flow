import { useEffect, useState } from "react";
import { Check, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  STATUS_DESCRIPTIONS,
  STATUS_LABELS,
  statusTone,
  type AppointmentStatus,
} from "@/lib/appointments";

const toneClass = {
  neutral: "bg-muted text-foreground",
  active: "bg-primary/10 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning-foreground",
  danger: "bg-destructive/10 text-destructive",
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const tone = statusTone(status);
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", toneClass[tone])}>
      <span className={cn("h-1.5 w-1.5 rounded-full bg-current", tone === "active" && "animate-pulse")} />
      {STATUS_LABELS[status]}
    </span>
  );
}

export function ProgressSteps({ step }: { step: 0 | 1 | 2 }) {
  const steps = ["Request submitted", "Call initiated", "Appointment confirmed"];
  return (
    <ol className="space-y-3">
      {steps.map((s, i) => {
        const done = i < step || (i === 2 && step === 2);
        const current = i === step && step !== 2;
        return (
          <li key={s} className="flex items-center gap-3 text-sm">
            <span
              className={cn(
                "grid h-5 w-5 shrink-0 place-items-center rounded-full border",
                done && "border-success bg-success text-success-foreground",
                current && "border-primary",
                !done && !current && "border-border",
              )}
            >
              {done ? <Check className="h-3 w-3" strokeWidth={3} /> : current ? <span className="h-2 w-2 animate-pulse rounded-full bg-primary" /> : null}
            </span>
            <span className={cn(done || current ? "text-foreground" : "text-muted-foreground")}>{s}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function useTimer(running: boolean, since?: string) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!running) return;
    const start = since ? new Date(since).getTime() : Date.now();
    const tick = () => setSecs(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [running, since]);
  return `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
}

export function CallCard({ status, since, fixedDuration }: { status: AppointmentStatus; since?: string; fixedDuration?: string }) {
  const live = status === "CALLING" || status === "CONNECTED" || status === "COLLECTING_DETAILS";
  const t = useTimer(live && !fixedDuration, since);
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-4">
        <div className="relative grid h-12 w-12 place-items-center">
          {live && <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />}
          <span className={cn("relative grid h-12 w-12 place-items-center rounded-full", live ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
            <Phone className="h-5 w-5" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Caller</p>
          <p className="font-medium">AppointFlow Assistant</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-lg tabular-nums">{live ? fixedDuration ?? t : "--:--"}</p>
          <StatusBadge status={status} />
        </div>
      </div>
      <p className="mt-4 border-t border-border pt-3 text-sm text-muted-foreground">{STATUS_DESCRIPTIONS[status]}</p>
    </div>
  );
}
