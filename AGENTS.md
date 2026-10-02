<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Appointment data goes through the `AppointmentStore` interface in src/lib/appointments.ts (localStorage today) — so a real backend can replace it without touching the UI.
- The n8n webhook is called from a server function (src/lib/webhook.functions.ts), not the browser — avoids CORS and keeps one place for strict 200/201 validation.
