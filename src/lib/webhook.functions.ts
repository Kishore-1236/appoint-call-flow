import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const WEBHOOK_URL =
  "https://n8n-pza0.onrender.com/webhook-test/bec12aa3-d59a-44e5-b685-5a67dbb8a56c";

const Payload = z.object({
  appointment_id: z.string().max(40),
  name: z.string().min(1).max(120),
  phone: z.string().max(20),
  email: z.string().email().max(200),
  appointment_type: z.string().max(60),
  preferred_date: z.string().max(40),
  preferred_date_raw: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  preferred_time: z.string().max(20),
  preferred_time_range: z.string().max(60),
  timezone: z.string().max(40),
  notes: z.string().max(1000),
});

export type WebhookResult =
  | { ok: true; status: number; appointment_id?: string }
  | { ok: false; status: number; error: string };

export const submitToWebhook = createServerFn({ method: "POST" })
  .inputValidator((d) => Payload.parse(d))
  .handler(async ({ data }): Promise<WebhookResult> => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: ctrl.signal,
      });
      const text = await res.text();
      if (res.status !== 200 && res.status !== 201) {
        return {
          ok: false,
          status: res.status,
          error:
            res.status === 404
              ? "The scheduling service isn't accepting requests right now."
              : `The scheduling service returned an error (${res.status}).`,
        };
      }
      let returnedId: string | undefined;
      try {
        const j = JSON.parse(text);
        const obj = Array.isArray(j) ? j[0] : j;
        if (obj && typeof obj.appointment_id === "string" && obj.appointment_id.trim())
          returnedId = obj.appointment_id.trim();
      } catch {
        /* non-JSON body is fine */
      }
      return { ok: true, status: res.status, appointment_id: returnedId };
    } catch (e) {
      const aborted = e instanceof Error && e.name === "AbortError";
      return {
        ok: false,
        status: 0,
        error: aborted
          ? "The scheduling service took too long to respond."
          : "We couldn't reach the scheduling service.",
      };
    } finally {
      clearTimeout(timer);
    }
  });
