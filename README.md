# AppointFlow: Smart Booking

Build a polished, production-quality appointment booking website with an automated AI voice calling workflow.

IMPORTANT:
This website should NOT look AI-generated.
Do NOT use generic AI aesthetics such as:
- glowing neon gradients
- floating 3D robots
- abstract AI brains
- excessive glassmorphism
- purple/blue gradient backgrounds everywhere
- giant decorative blobs
- excessive animations
- random futuristic illustrations

The design should look like a real modern product designed by an experienced UI/UX designer.
The overall visual direction should be:
Clean + trustworthy + modern + human + professional + minimal.

PROJECT CONCEPT & WORKFLOW:
The website allows a user to submit an appointment request.
After the form is submitted:
1. The website sends the appointment information to an n8n webhook: https://n8n-pza0.onrender.com/webhook-test/bec12aa3-d59a-44e5-b685-5a67dbb8a56c
2. n8n processes the request and triggers an outbound AI voice call through Dograh.
3. The AI voice agent calls the user to confirm/reschedule.
4. The website displays appointment status.

1. BRAND / PRODUCT IDENTITY
- Brand Name: AppointFlow
- Tagline: "Book an appointment. We’ll handle the call."
- Background: warm white or light neutral; dark charcoal text
- Primary accent: deep blue / indigo used sparingly
- Secondary accent: soft green for confirmed/success states
- Typography: clean modern sans-serif (Inter / Geist), strong hierarchy, clear labels and buttons

2. HEADER / NAVBAR
- Compact, sticky navbar on desktop, responsive on mobile
- Logo icon + "AppointFlow"
- Navigation links: Home, How It Works, Book Appointment, Status
- Right CTA button: "Book Appointment"

3. HERO SECTION
- Two-column hero on desktop
- Headline: "Book your appointment. We’ll take care of the rest."
- Supporting text: "Submit your request in a minute. Our automated calling assistant will contact you, discuss the details, and help confirm a convenient time."
- Primary CTA: "Book an Appointment", Secondary CTA: "How It Works"
- Right side: Realistic appointment status card (Rahul Kumar, Consultation, Oct 2, 10:30 AM, Status Calling... with subtle progress steps: Request submitted -> Call initiated -> Appointment confirmed)

4. TRUST / VALUE STRIP
- 3 clean line-icon items: "Easy to Book", "Automated Calling", "Flexible Scheduling"

5. HOW IT WORKS
- 4-step workflow (Submit your request -> We process your request -> You receive a call -> Appointment gets confirmed) connected visually with subtle lines

6. APPOINTMENT BOOKING SECTION
- Heading: "Book an appointment"
- Fields: Full Name, Phone Number (with Indian +91 normalization and helper), Email Address, Service / Appointment Type dropdown (Consultation, Demo, Meeting, Follow-up, General Appointment), Preferred Date (clean calendar picker), Preferred Time (clean time picker), Preferred Time Range (e.g. Morning, Afternoon, Evening), Additional Notes (textarea)
- Clear field labels, visible focus states, helpful validation messages
- CTA: "Request Appointment"
- Disclaimer: "By submitting this form, you agree to receive an appointment-related call."

7. SUCCESS STATE
- Title: "Appointment request received"
- Message: "We’ve received your request. You’ll receive an automated call shortly to confirm the details."
- Summary card with booking details and Status: "Request Received"
- Action: "View Appointment Status" (navigates to `/status?id=...`)

8. DEDICATED STATUS ROUTE (/status)
- Title: "Appointment status"
- Search by Appointment ID or Phone Number
- Direct URL support: `/status?id=APT-20261002-8492` or `/status?phone=919876543210`
- If no matching appointment is found, clean empty state:
  "Appointment not found"
  "Please check your appointment ID or phone number and try again."
  with button to book an appointment.
- Timestamped history timeline

9. REALISTIC CALLING EXPERIENCE COMPONENT
- Status card representing phone call:
  Calling...
  Caller: "AppointFlow Assistant"
  Duration timer (e.g. 00:18), pulsing ring around phone icon
  Status explanation ("Discussing appointment details")

10. SUPPORTING SECTIONS
- Features: 6 cards (Automated Appointment Calls, Natural Conversations, Date & Time Confirmation, Rescheduling, Status Tracking, Workflow Automation)
- Use Cases: 5 cards (Healthcare, Education, Consulting, Hospitality, Professional Services)
- Why This Approach: "Less coordination. More confirmed appointments." (Reduce manual calling, Respond faster, Keep everything organized)
- FAQ: 6 accordion items
- Footer: AppointFlow branding, navigation links, copyright

11. WEBHOOK PAYLOAD SPECIFICATION
- Webhook URL: `https://n8n-pza0.onrender.com/webhook-test/bec12aa3-d59a-44e5-b685-5a67dbb8a56c`
- Method: POST with Content-Type: application/json
- Payload format:
{
  "appointment_id": "APT-20261002-8492",
  "name": "Rahul Kumar",
  "phone": "+919876543210",
  "email": "rahul@example.com",
  "appointment_type": "Consultation",
  "preferred_date": "October 2, 2026",
  "preferred_date_raw": "2026-10-02",
  "preferred_time": "10:30 AM",
  "preferred_time_range": "Morning (9:00 AM - 12:00 PM)",
  "timezone": "Asia/Kolkata",
  "notes": "Discussing Q4 roadmap"
}
- Always preserve selected appointment date without timezone day-shift bugs. Keep preferred_date for display and preferred_date_raw for backend.
- Timezone: Asia/Kolkata.

12. APPOINTMENT ID GENERATION
- Format: `APT-YYYYMMDD-XXXX` (e.g. `APT-20261002-4819`) generated immediately on submission.
- Shown on confirmation screen, status page, lookup drawer, and URL `/status?id=...`.
- If n8n returns an `appointment_id` in its HTTP 200/201 response, adopt that returned ID.

13. CANONICAL INTERNAL STATUS VALUES & LABELS
- REQUEST_RECEIVED -> "Request Received"
- CALLING -> "Calling..."
- CONNECTED -> "Connected"
- COLLECTING_DETAILS -> "Discussing Details"
- CONFIRMED -> "Confirmed"
- RESCHEDULE_REQUESTED -> "Reschedule Requested"
- CONFIRMATION_NEEDED -> "Confirmation Needed"
- NO_ANSWER -> "No Answer"
- CANCELLED -> "Cancelled"

14. DEMO MODE & SIMULATION
- Toggleable Mode (Demo Mode vs Real Mode).
- In Demo Mode: simulate progression:
  0s: REQUEST_RECEIVED
  3s: CALLING
  8s: CONNECTED
  15s: COLLECTING_DETAILS
  25s: CONFIRMED
- Display calling interface with live timer, pulsing phone indicator, and "AppointFlow Assistant".
- Real Mode waits for actual webhook/workflow updates without simulated timers.

15. N8N RESPONSE & STRICT VALIDATION
- When webhook responds with HTTP 200 or 201: mark appointment as submitted and transition to status.
- If webhook fails, times out, rejects, or returns an error: do not mark as successful; show a clear error banner, keep submitted form data intact, and provide a "Try Again" retry action.

16. PHONE NORMALIZATION
- E.164 format normalization. Default to +91 when given a 10-digit Indian number without country code.
- Normalize on status lookup as well (+91 98765 43210, +919876543210, 919876543210, 09876543210 resolve to same record).

17. LOCAL STORAGE PERSISTENCE
- Store appointment records with ID, contact info, date/time, status, timeline, created and updated timestamps.
- Architecture modular so it can be swapped with a real backend later.

18. DEVELOPER / TESTER TOOLBAR
- Subtle toolbar on the /status page allowing preview of all 9 canonical statuses, cleanly separated from the public user experience.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bcb4e83c-48db-4660-8481-0b12967e9344).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
