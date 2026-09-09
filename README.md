# Tpool

Tpool is a college-focused ride/car-pooling platform. A person travelling somewhere can publish a ride when they have an available seat, and another person travelling on the same or similar route can discover that ride and book/request a seat. It is designed to be realistic, focused, and simple for college use.

## Important Architecture

The application is a full-stack monolithic web application built on Next.js.
- **Frontend**: Server and Client Components using React, Tailwind CSS, and shadcn/ui.
- **Backend**: Next.js API Routes (Route Handlers) handling business logic.
- **Database**: SQLite database accessed via Prisma ORM.
- **Authentication**: JWT-based session strategy using NextAuth.js Credentials provider.
- **Mapping**: Dynamic Client-side importing of Leaflet to bypass SSR window restrictions, integrated with the free OpenStreetMap Nominatim API.

## Data & API Structure

### Data Models (Prisma/SQLite)
- **User**: Stores user details (`id`, `name`, `email`, `password`, `createdAt`).
- **Ride**: Represents a published ride (`id`, `driverId`, `origin`, `destination`, `departure`, `seats`, `price`, `createdAt`).
- **Booking**: Represents a requested or confirmed seat (`id`, `rideId`, `userId`, `seats`, `status`, `createdAt`).
- **Message**: Represents a message in a ride's discussion board (`id`, `rideId`, `userId`, `content`, `createdAt`).
- **Rating**: Represents a post-ride rating and review (`id`, `rideId`, `bookingId`, `reviewerId`, `revieweeId`, `rating` [1-5], `review`, `createdAt`).

### APIs
- `POST /api/auth/register` - Creates a new user in the database.
- `/api/auth/[...nextauth]` - NextAuth endpoints for authentication (login, logout, session verification).
- `POST /api/rides` - Creates a new ride attached to the authenticated user (enforces active-ride publishing restrictions).
- `GET /api/rides/[id]/status` - Fetches ride status for passenger window synchronization.
- `PATCH /api/rides/[id]/status` - Driver endpoint to transition ride status (`SCHEDULED` → `ACTIVE` → `COMPLETED`).
- `DELETE /api/rides/[id]` - Secure endpoint for a driver to cancel their ride and associated bookings.
- `POST /api/bookings` - Requests a seat (`PENDING` status).
- `PATCH /api/bookings/[id]` - Modifies booking state (`CONFIRM`, `REJECT`, `CANCEL`) with safe seat refunding.
- `POST /api/emergency/sos` - Authenticated endpoint for passengers on active rides to trigger emergency SOS alerts with location.
- `GET /api/rides/[id]/messages` - Securely fetches discussion messages for authorized participants.
- `POST /api/rides/[id]/messages` - Allows authorized participants to send messages to the discussion board.
- `POST/GET /api/ratings` - Secure API for submitting and fetching post-ride ratings and reviews.

## Current Routes

- `/` - Landing page with the primary **Find a Ride** search form.
- `/search` - Server Component page displaying dynamic ride search results.
- `/rides/[id]` - Detailed view for a specific ride featuring booking UI, Ride Lifecycle controls, Passenger Window Sync, Emergency SOS, Post-Ride Ratings, Secure Chat, and Interactive Maps.
- `/login` - Sign-in page for existing users.
- `/register` - Sign-up page for new users.
- `/dashboard` - Protected dashboard page acting as the centralized management hub with role-specific Driver & Passenger hubs and completed ride rating prompts.
- `/profile` - Protected page showing user account details, emergency contact setup, and community ratings & reviews summary.
- `/rides/create` - Protected form to publish a new ride.

---

## COMPLETED — RIDE LIFECYCLE, PASSENGER SYNC & SAFETY SYSTEM

### Verified User Flows & Functionality
- **Ride Lifecycle**: `SCHEDULED` → `ACTIVE` → `COMPLETED` (and `CANCELLED`). Controlled strictly by the ride's driver (`▶ Start Ride` and `✓ End Ride`).
- **End Ride Confirmation Modal**: Driver `End Ride` trigger presents confirmation dialog: *"End this ride? This will mark the ride as completed for all passengers."*
- **Passenger Window Synchronization**: Passenger view & dashboard poll status every 4s during active/scheduled rides, automatically re-rendering via Next.js `router.refresh()` when the driver ends the ride in another window.
- **Active Ride Publishing Restriction**: `POST /api/rides` prevents drivers with an `ACTIVE` ride from publishing another ride until current ride is completed or cancelled. Multiple `SCHEDULED` rides remain permitted.
- **Passenger SOS System**: Passengers with confirmed bookings on `ACTIVE` rides can trigger `🚨 SOS / Emergency` with a confirmation modal and optional browser GPS capture (falls back gracefully if location is unavailable/timed out).
- **Emergency Email Notification**: `sendEmergencyEmail()` uses Nodemailer SMTP integration to send real-time emergency alert emails to passenger emergency contacts.
- **Privacy Protection**: Emergency contact details are strictly private to account owners. Public interfaces display only non-sensitive indicators (`🛡️ Emergency contact configured`).

---

## COMPLETED — POST-RIDE RATINGS & REVIEWS SYSTEM

### Verified User Flows & Functionality
- **Completed Ride Rating Eligibility**: Rating submission is permitted ONLY when `ride.status === "COMPLETED"` and the user was a confirmed participant (driver or passenger with confirmed booking).
- **Passenger Rating Driver**: Passengers rate the driver (1–5 stars + optional text review up to 500 characters) directly on the completed ride page or via dashboard prompts.
- **Driver Rating Passengers**: Drivers can rate each individual confirmed passenger on a completed ride.
- **Duplicate Prevention**: Database-level `@@unique([rideId, reviewerId, revieweeId])` and server-side checks ensure each participant can rate each other at most once per completed ride.
- **Immutable Reviews**: Submitted ratings cannot be edited or overwritten.
- **Profile Ratings & Reviews**: User profiles (`/profile`) dynamically display average community rating (`★ X.X / 5`), review count, and a detailed list of received reviews.

---

## COMPLETED — OFFICIAL BRANDING & NAVBAR LOGO INTEGRATION

### Verified User Flows & Functionality
- **Official TPool Logo Asset**: Stored in `public/logo.png`.
- **Responsive Header Branding**: Replaced text branding in `src/components/Navbar.tsx` with a responsive Next.js `Image` component (`alt="TPool"`, priority loaded, maintaining proper aspect ratio).

---

## COMPLETED — RIDE WORKFLOW, BACK NAVIGATION & CHAT STRUCTURE

### Verified User Flows & Functionality
- **Automatic Driver Request Detection**: `DriverRequestSync.tsx` polls `GET /api/bookings` every 4 seconds on the Driver Dashboard to auto-detect incoming passenger requests without full page reloads or memory leaks.
- **Logical Back Navigation**: Integrated `BackButton.tsx` on search results, ride details, publish ride, and verification portal pages.
- **Structured Ride Chat UI**: Re-architected `RideChat.tsx` with a participant header, driver badge indicators, scrollable conversation container with auto-scroll to latest messages, timestamped bubbles, and composer input supporting Enter key submission.

