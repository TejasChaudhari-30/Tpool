# Project Context & Reference — TPool

## 1. Project Overview

**TPool** is a full-stack, college-focused ride-sharing and carpooling web platform. It enables students, faculty, and campus commuters traveling on identical or overlapping transit corridors to discover available rides, offer empty vehicle seats, split travel expenses, coordinate via in-app chat, trigger emergency SOS safety alerts, and rate co-travelers after completed rides.

- **Primary Goal**: Facilitate safe, affordable, and convenient carpooling for college commutes and regional travel (campus, railway/bus hubs, home towns).
- **Target Audience**: College students, faculty, and verified campus commuters.
- **Key Value Proposition**: Lowers travel costs, simplifies proximity-based route matching, enforces role-gated safety controls, and provides post-ride community accountability.
- **Role Separation**: Explicitly separates **DRIVER** responsibilities (publishing rides, starting/ending rides, managing passenger bookings, rating passengers) and **PASSENGER** responsibilities (searching rides, reserving seats, configuring safety contacts, triggering SOS alerts, rating drivers).

---

## 2. Current Tech Stack

| Component | Technology | Description / Usage |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14.2.35 (App Router) | Server & Client Components (`src/app`) |
| **UI Library & Styling** | Tailwind CSS v3.4.1 + Radix UI | Utility styling with Radix UI dialogs, select, labels, and badges |
| **Icons** | Lucide React v1.42.0 | Standard UI icons throughout the application |
| **Mapping & Geocoding** | Leaflet v1.9.4 & React-Leaflet v4.2.1 | Client-side Leaflet rendering (`RouteMapClient.tsx`) |
| **Place Autocomplete** | Photon API (by Komoot) | Location search autocomplete (`LocationInput.tsx`) |
| **Geocoding Fallback** | OpenStreetMap Nominatim | Address-to-coordinate resolution |
| **Routing Engine** | Valhalla API (`valhalla1.openstreetmap.de`) | Polyline shape decoding (Precision 6) and route distance calculation |
| **Backend Framework** | Next.js API Routes (Route Handlers) | Business logic and REST endpoints (`src/app/api`) |
| **Database** | SQLite (`prisma/dev.db`) | Relational database storage |
| **ORM** | Prisma ORM v7.10.0 | Database access layer with `@prisma/adapter-libsql` adapter |
| **Authentication** | NextAuth.js v4.24.15 | Credentials provider with JWT session strategy |
| **Password Hashing** | bcryptjs v3.0.3 | Password hashing during registration & authentication verification |
| **Email Service** | Nodemailer v7.0.13 | SMTP integration for real-time emergency contact email notifications |
| **Language** | TypeScript v5 | Static typing across frontend and backend |

---

## 3. Project Architecture

### General Request Flow

```
Browser (User Client)
    │
    ├── Next.js Server Components (Server Page Rendering & DB Fetching)
    └── Next.js Client Components (React 18, Radix UI, Leaflet, Geolocation)
            │
            ├── NextAuth.js JWT Middleware & Auth (`src/lib/auth.ts`)
            ├── Next.js API Route Handlers (`src/app/api/...`)
            │       ├── Prisma ORM (`@prisma/client` + `@prisma/adapter-libsql`)
            │       └── SQLite Relational Database (`prisma/dev.db`)
            └── External Web Services
                    ├── Photon API by Komoot (`photon.komoot.io`) - Place Autocomplete
                    ├── OpenStreetMap Nominatim - Reverse/Forward Geocoding
                    ├── Valhalla Routing Engine - Polyline & Route Distance Calculation
                    └── SMTP Server (Nodemailer) - Emergency Alert Email Delivery
```

### Architectural Principles

1. **Monolithic App Router Architecture**: Page views and REST API endpoints reside unified inside `src/app`.
2. **Server-Side Authorization**: Security & role checks are enforced in API handlers using `getServerSession(authOptions)`, not merely by hiding UI elements.
3. **SSR-Safe Dynamic Mapping**: `RouteMap.tsx` dynamically loads Leaflet components with `{ ssr: false }` to avoid SSR `window` reference errors.
4. **Transactional Seat Management**: Booking status transitions and seat counts use `prisma.$transaction` to guarantee capacity integrity.
5. **Spatial Proximity Algorithm**: Search matches passenger pickup/drop points against the driver's polyline shape within a 1.0 km buffer, enforcing correct direction of travel (`startIndex < endIndex`).

---

## 4. Folder Structure

```
tpool/
├── .env.example              # Sample environment variable declarations
├── .eslintrc.json            # ESLint configuration
├── .gitignore                # Git exclusion rules
├── README.md                 # Public documentation and release summary
├── components.json           # Shadcn/ui component configuration
├── next.config.mjs           # Next.js configuration
├── package.json              # Dependencies and scripts
├── prisma.config.ts          # Prisma CLI configuration
├── tailwind.config.ts        # Tailwind CSS styling rules
├── tsconfig.json             # TypeScript compiler settings
├── prisma/
│   ├── dev.db                # SQLite database file
│   └── schema.prisma         # Prisma data models (User, Ride, Booking, Message, EmergencyAlert, Rating, Verification, Report)
└── src/
    ├── app/                  # Next.js App Router pages and API handlers
    │   ├── api/              # API Route Handlers
    │   │   ├── auth/         # NextAuth endpoint & user registration API
    │   │   ├── bookings/     # Booking creation & status management APIs
    │   │   ├── emergency/    # Emergency SOS alert API (`sos/route.ts`)
    │   │   ├── ratings/      # Post-ride ratings & directional reviews API (`route.ts`)
    │   │   ├── rides/        # Ride creation, deletion, status controls, & messaging APIs
    │   │   ├── user/         # User profile APIs
    │   │   └── verifications/# Document upload APIs
    │   ├── dashboard/        # Centralized dashboard page with Driver & Passenger sections
    │   ├── login/            # Authentication sign-in page
    │   ├── profile/          # User profile, safety contact setup, & directional reviews page
    │   ├── register/         # Account registration page
    │   ├── rides/            # Ride detail & ride creation pages
    │   ├── search/           # Search results page
    │   ├── layout.tsx        # Root layout with Providers & Navbar
    │   └── page.tsx          # Landing page with hero section & SearchForm
    ├── components/           # Reusable UI components
    │   ├── ui/               # Radix UI primitives (button, card, input, badge, label, select)
    │   ├── BookingButton.tsx # Client CTA for seat reservations with gender rules
    │   ├── CancelBooking.tsx # Client button for passenger booking cancellation
    │   ├── DeleteRide.tsx    # Client button for driver ride deletion
    │   ├── DriverPassengerRatings.tsx # Driver control to rate confirmed passengers
    │   ├── LocationInput.tsx # Autocomplete input fetching from Photon API
    │   ├── ManageBooking.tsx # Driver confirm/reject booking controls
    │   ├── Navbar.tsx        # Top navigation bar with session awareness
    │   ├── PassengerWindowSync.tsx # Real-time 4s status polling & window sync component
    │   ├── ProfileSafetyForm.tsx # Emergency contact configuration form
    │   ├── Providers.tsx     # NextAuth SessionProvider wrapper
    │   ├── RatingForm.tsx    # Interactive 1–5 star rating & review selector
    │   ├── RideChat.tsx      # In-app ride discussion board component
    │   ├── RideStatusControl.tsx # Driver Start Ride / End Ride controls with modal
    │   ├── RouteMap.tsx      # SSR-safe dynamic map wrapper
    │   ├── RouteMapClient.tsx# Leaflet route polyline & marker map component
    │   ├── SearchForm.tsx    # Ride search input form
    │   └── SosButton.tsx     # Emergency SOS button with GPS capture & modal
    └── lib/                  # Shared utility modules
        ├── auth.ts           # NextAuth configuration and credentials provider logic
        ├── fareCalculator.ts # Distance & detour fare estimation logic
        ├── geo.ts            # Haversine distance, polyline decoding, & spatial math
        ├── notifications.ts  # Nodemailer SMTP emergency email delivery service
        ├── prisma.ts         # Prisma Client singleton initialization
        └── utils.ts          # Classname merger utility (clsx + tailwind-merge)
```

---

## 5. Authentication and Roles

### Authentication System
- **Registration**: `POST /api/auth/register` validates unique email, hashes password using `bcrypt.hash(password, 10)`, and creates a `User` record.
- **Login**: `signIn("credentials", { email, password })` calls NextAuth `authorize()` in `src/lib/auth.ts`.
- **Session Strategy**: Uses NextAuth JWT sessions (`strategy: "jwt"`). The session callback attaches `token.sub` as `session.user.id`.
- **Server Authorization**: Server pages and API routes inspect `getServerSession(authOptions)` and enforce HTTP 401/403 status codes on unauthorized attempts.

### Application Roles
The application defines two active operational user roles:

1. **`DRIVER`**:
   - Publishes rides (`POST /api/rides`).
   - Manages incoming booking requests (`CONFIRM` / `REJECT`).
   - Controls ride state transitions (`▶ Start Ride` to `ACTIVE`, `✓ End Ride` to `COMPLETED`).
   - Rates confirmed passengers after ride completion.
2. **`PASSENGER`**:
   - Searches available rides along transit corridors.
   - Requests seat bookings (`PENDING` status).
   - Configures private emergency safety contacts.
   - Triggers `🚨 SOS / Emergency` alerts during `ACTIVE` rides.
   - Rates the driver after ride completion.

> [!IMPORTANT]
> **Admin Role Status**: The `Role.ADMIN` enum exists in the database schema for future expansion, but **NO admin dashboard or workflow is implemented in the primary user application**. Admin functionality is explicitly planned for a future phase.

---

## 6. User Profile and Safety Data

- **Private Safety Data**:
  - `gender`: Stores user gender (`MALE`, `FEMALE`, `OTHER`, `PREFER_NOT_TO_SAY`).
  - `emergencyContactName`, `emergencyContactEmail`, `emergencyContactPhone`: Emergency contact configuration for safety alerts.
- **Privacy Rule**: Emergency contact details are strictly private to the account owner and are **NEVER** exposed on public ride cards, to drivers, to passengers, or on public profiles. Public interfaces display only a non-sensitive indicator (`🛡️ Emergency contact configured`).
- **Verification Status**:
  - `studentVerificationStatus` and `driverVerificationStatus` track verification state (`NOT_SUBMITTED`, `PENDING`, `APPROVED`, `REJECTED`).
  - Statuses render as UI badges on profiles and ride details (`✓ Verified Student`, `✓ Verified Driver`).
  - *Document approval workflows and reviewer interfaces are reserved for future Admin implementation.*

---

## 7. Gender & Passenger Preference Logic

- **Co-Passenger Preference Rule**: The safety preference is specifically for **OTHER PASSENGERS / CO-PASSENGERS**, NOT the driver's gender.
- **Gender Selection Constraints**:
  - Only female passengers (`gender === "FEMALE"`) can choose `"Prefer Female Passengers"` (`preferredPassengerGender: "FEMALE"`).
  - Male, Other, or Prefer not to say users are locked to `"No Preference"` (`"ANY"`).
  - Backend API (`POST /api/bookings`) rejects invalid female-only requests from non-female accounts.
- **Compatibility Restrictions**:
  - A female passenger with `FEMALE` preference cannot join a ride if a non-female passenger already has an active (`PENDING` or `CONFIRMED`) booking.
  - Non-female passengers cannot join a ride if an active female passenger has a `FEMALE` preference.
  - `CANCELLED` and `REJECTED` bookings do not count as active co-passengers.
  - Driver gender is completely irrelevant to passenger gender preference matching.

---

## 8. Ride Lifecycle

```
SCHEDULED  ──(Driver clicks "Start Ride")──>  ACTIVE  ──(Driver clicks "End Ride")──>  COMPLETED
    │                                            │
    └──(Driver deletes ride)──> CANCELLED <──────┘
```

1. **`SCHEDULED`**:
   - Initial state when published by the driver.
   - Passengers can search, request, confirm, or cancel bookings.
   - Driver can start the ride at any time.
2. **`ACTIVE`**:
   - Driver has started the trip.
   - Passenger active-ride UI enables the `🚨 SOS / Emergency` button.
   - Driver is restricted from publishing additional rides.
3. **`COMPLETED`**:
   - Driver has ended the trip via confirmation modal.
   - SOS button is automatically disabled and removed.
   - Ride moves to history and unlocks post-ride ratings for participants.
4. **`CANCELLED`**:
   - Driver cancelled/deleted the ride; associated bookings are updated and refunded.

---

## 9. Active Ride Restriction

- **Rule**: A driver with an `ACTIVE` ride is blocked from publishing another ride.
- **API Enforcement**: `POST /api/rides` checks if `driverId` currently has a ride with `status === "ACTIVE"`. If true, returns `400 Bad Request`.
- **Scheduled Rides**: Drivers holding multiple `SCHEDULED` rides are permitted to publish additional rides.

---

## 10. Driver Start/End Ride Controls

- **Start Ride (`SCHEDULED` → `ACTIVE`)**:
  - Actionable only by the ride's driver via `RideStatusControl.tsx`.
  - Backend route `PATCH /api/rides/[id]/status` verifies `ride.driverId === session.user.id`.
- **End Ride (`ACTIVE` → `COMPLETED`)**:
  - Actionable only by the ride's driver via `RideStatusControl.tsx`.
  - Triggers a Radix UI confirmation modal: *"End this ride? This will mark the ride as completed for all passengers."*
  - Transitioning to `COMPLETED` closes active ride tracking and enables rating options.

---

## 11. Passenger Window Synchronization

- **Mechanism**: `PassengerWindowSync.tsx` polls `GET /api/rides/[id]/status` every 4 seconds when a ride is `SCHEDULED` or `ACTIVE`.
- **Behavior**: When the driver clicks `✓ End Ride` in Window A, passenger Window B automatically detects the state transition to `COMPLETED` and executes Next.js `router.refresh()`.
- **UI Update**: Passenger UI updates automatically without a manual page reload—hiding the SOS button, updating badges, and rendering the rating form.

---

## 12. Booking and Pooling Management

- **Booking Flow**: Passenger requests seat → `PENDING` booking created → Ride seats decremented → Driver reviews request (`CONFIRM` or `REJECT`) → On `REJECT` or passenger `CANCEL`, seats are automatically refunded.
- **Statuses**: `PENDING`, `CONFIRMED`, `REJECTED`, `CANCELLED`.
- **Atomic Transactions**: `prisma.$transaction` wraps booking status updates and seat adjustments to prevent race conditions.

---

## 13. Fare Calculation System

- **Location**: `src/lib/fareCalculator.ts`.
- **Components**:
  - **Segment Fare**: Pro-rated fare based on passenger distance vs. total route distance.
  - **Detour Fee**: Distance overhead added if pickup/drop requires driver route detour.
  - **Platform Fee**: Nominal platform operating fee.
- **Scope**: Estimates passenger fare in UI and stores total calculated booking fare (`booking.fare`). Digital payment gateway or escrow processing is not integrated (offline/cash settlement assumed).

---

## 14. Search, Routing, and Map Integration

- **Proximity Engine**: `src/app/search/page.tsx` decodes driver route polylines using Valhalla Precision-6 shape decoding and evaluates passenger pickup/drop points against polyline segments using Haversine distance math within a 1.0 km buffer.
- **Autocomplete**: `LocationInput.tsx` queries Komoot Photon API (`photon.komoot.io`).
- **Route Rendering**: `RouteMapClient.tsx` renders OpenStreetMap tiles, driver polyline shapes, and pickup/drop markers via `react-leaflet`.

---

## 15. Live GPS & Emergency SOS System

- **Eligibility**: Available exclusively to passengers holding a `CONFIRMED` booking on an `ACTIVE` ride.
- **Flow**:
  1. Passenger clicks `🚨 SOS / Emergency`.
  2. Modal opens requesting confirmation.
  3. Client attempts browser GPS capture via `navigator.geolocation.getCurrentPosition` (10s timeout).
  4. Calls `POST /api/emergency/sos`.
  5. `EmergencyAlert` record created in database with `latitude` and `longitude` (or `null` if GPS unavailable/timed out).
  6. `sendEmergencyEmail()` triggers Nodemailer SMTP email to the passenger's emergency contact including Google Maps link (if GPS captured).
- **GPS Failure Resilience**: GPS timeout or denial **NEVER** cancels or blocks SOS alert creation or email delivery. The alert proceeds with `locationUnavailable: true`.

---

## 16. Post-Ride Ratings & Reviews System

- **Eligibility**: Permitted ONLY when `ride.status === "COMPLETED"` for confirmed participants.
- **Inputs**: 1–5 star integer score + optional 500-character text review.
- **Database Model**: `Rating` model with `@@unique([rideId, reviewerId, revieweeId])` constraint to prevent duplicate ratings.
- **Rating Directions**:
  - Passenger rating Driver (Passenger → Driver).
  - Driver rating individual confirmed Passengers (Driver → Passenger).

---

## 17. Directional Profile Reviews Display

Profile review displays and average rating calculations are strictly **DIRECTIONAL**:

- **Driver Profile (`userType === "DRIVER"`)**:
  - Renders ONLY reviews received from passengers (`Passenger → Driver`).
  - Label: `"⭐ Reviews from Passengers"`.
  - Average rating calculates strictly from passenger ratings received.
- **Passenger Profile (`userType === "PASSENGER"`)**:
  - Renders ONLY reviews received from drivers (`Driver → Passenger`).
  - Label: `"⭐ Reviews from Drivers"`.
  - Average rating calculates strictly from driver ratings received.
- **Dual Role Profile (`userType === "BOTH"`)**:
  - Renders separate sections for `"Reviews from Passengers"` and `"Reviews from Drivers"`.
- **Exclusion Rule**: Ratings GIVEN by the profile owner to others are **NEVER** displayed on their profile or included in their average rating.

---

## 18. Dashboard Structure

The dashboard (`src/app/dashboard/page.tsx`) provides role-specific management without unnecessary "Hub" headers:

- **Passenger Section**:
  - Upcoming & Active Bookings.
  - Past & Cancelled Bookings (with `★ Rate Driver →` prompts for completed rides).
- **Driver Section**:
  - Active Ride in Progress banner with status controls.
  - Upcoming & Active Published Rides (with booking request management).
  - Past Published Rides (with `★ Rate Passengers →` prompts for completed rides).

---

## 19. Ride Discussion Board (Chat)

- **Access**: Restricted to ride driver and passengers with `CONFIRMED` or `PENDING` bookings (`src/app/api/rides/[id]/messages/route.ts`).
- **Persistence**: Messages stored in `Message` model.
- **Polling**: `RideChat.tsx` fetches new messages every 5 seconds.

---

## 20. Environment Variables

```env
# Database connection string (SQLite file path)
DATABASE_URL="file:./prisma/dev.db"

# NextAuth configuration
NEXTAUTH_SECRET="your-super-secret-jwt-key"
NEXTAUTH_URL="http://localhost:3000"

# SMTP Email Configuration (Nodemailer Emergency Emails)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-gmail-app-password"
EMAIL_FROM="\"TPool Emergency Alert\" <no-reply@tpool.local>"
```

> [!CAUTION]
> **Secrets Security**: Never commit real passwords or API keys to repository files or markdown documents. Use `.env.example` with clean placeholders.

---

## 21. API Endpoints Table

| Method | Endpoint | Auth Required | Role / Requirement | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | No | Public | Registers a new user account with hashed password. |
| `POST/GET`| `/api/auth/[...nextauth]`| Mixed | Public | NextAuth sign-in, sign-out, and session verification endpoints. |
| `POST` | `/api/rides` | Yes | Driver | Publishes a new ride (enforces active ride restriction). |
| `DELETE`| `/api/rides/[id]` | Yes | Driver (Owner) | Deletes a ride and cascades deletion to bookings. |
| `GET` | `/api/rides/[id]/status` | Yes | Participant | Returns current ride status for passenger window sync. |
| `PATCH` | `/api/rides/[id]/status` | Yes | Driver (Owner) | Transitions ride state (`SCHEDULED` → `ACTIVE` → `COMPLETED`). |
| `POST` | `/api/bookings` | Yes | Passenger | Requests a seat (`PENDING` status) with gender preference checks. |
| `PATCH` | `/api/bookings/[id]` | Yes | Driver / Passenger | Driver confirms/rejects; passenger cancels booking. |
| `POST` | `/api/emergency/sos` | Yes | Confirmed Passenger | Creates `EmergencyAlert` and sends SMTP emergency email. |
| `POST` | `/api/ratings` | Yes | Confirmed Participant| Submits 1–5 star rating and review for completed rides. |
| `GET` | `/api/ratings` | Yes | Participant | Fetches ratings (supports `type=as_driver` and `type=as_passenger`). |
| `GET` | `/api/rides/[id]/messages` | Yes | Participant | Fetches discussion messages for a ride. |
| `POST` | `/api/rides/[id]/messages` | Yes | Participant | Posts a message to the ride discussion board. |

---

## 22. Database Schema (Prisma Models)

- **`User`**: Accounts (`id`, `name`, `email`, `password`, `userType`, `gender`, `emergencyContactName`, `emergencyContactEmail`, `emergencyContactPhone`, `studentVerificationStatus`, `driverVerificationStatus`).
- **`Ride`**: Published rides (`id`, `driverId`, `origin`, `destination`, `departure`, `seats`, `price`, `status`: `SCHEDULED`/`ACTIVE`/`COMPLETED`/`CANCELLED`).
- **`Booking`**: Seat reservations (`id`, `rideId`, `userId`, `seats`, `fare`, `status`: `PENDING`/`CONFIRMED`/`CANCELLED`/`REJECTED`, `preferredPassengerGender`).
- **`EmergencyAlert`**: SOS incidents (`id`, `userId`, `rideId`, `bookingId`, `status`, `latitude`, `longitude`, `createdAt`).
- **`Rating`**: Post-ride reviews (`id`, `rideId`, `bookingId`, `reviewerId`, `revieweeId`, `rating`, `review`, `createdAt`, `@@unique([rideId, reviewerId, revieweeId])`).
- **`Message`**: Ride chat (`id`, `content`, `rideId`, `userId`, `createdAt`).
- **`Verification`**: Document uploads (`id`, `userId`, `documentType`, `filePath`, `status`).
- **`Report`**: User reports (`id`, `reporterId`, `reportedUserId`, `reason`, `status`).

---

## 23. Current Feature Status Inventory

### ✅ COMPLETED
- NextAuth authentication with JWT sessions & bcrypt hashing.
- Role-based capabilities (Driver vs. Passenger).
- Ride publishing with active ride restrictions.
- Spatial proximity ride search (Valhalla polyline + Haversine 1 km buffer).
- Booking creation transaction with seat decrement/refund.
- Driver Start Ride / End Ride controls with confirmation modal.
- Real-time 4-second passenger window state synchronization.
- Passenger Emergency SOS with GPS capture and Nodemailer SMTP email delivery.
- GPS timeout/failure graceful fallback.
- Post-ride ratings & reviews system.
- Directional profile review display & directional average rating calculations.
- In-app ride discussion board.

### 🟡 PARTIALLY IMPLEMENTED
- **Profile Management**: Profile views render details, safety info, and directional reviews, but inline profile editing forms remain partial.
- **Ride Chat**: Polling-based HTTP interval (5s) instead of WebSockets.
- **Verification Badges**: Displayed based on DB status, but admin review portal is unbuilt.

### 🔴 NOT IMPLEMENTED / FUTURE ROADMAP
- Digital payment gateways (Razorpay/Stripe) & fund escrow.
- Real-time WebSockets / Push Notifications / SMS gateway.
- Admin dashboard & document verification portal.
- Automated test suites (Jest, Cypress, Playwright).

---

## 24. Future Development Roadmap

### Phase 1 — Core Stabilization & Testing
- Implement automated unit and integration tests (`npm test`).
- Add Zod schema validation to API request payloads.

### Phase 2 — Student Identity Verification
- Document upload UI for Student IDs and Driver Licenses.
- Secure cloud object storage for verification documents.

### Phase 3 — Admin & Moderation Panel
- Build `ADMIN` role dashboard.
- Document review portal to approve/reject student verification submissions.
- Reported user review and emergency alert monitoring panel.

### Phase 4 — Real-time WebSockets & Push Notifications
- Replace 5s chat polling with WebSockets or Server-Sent Events.
- Browser push notifications for booking confirmations and ride status changes.

### Phase 5 — Digital Payments
- Razorpay / Stripe integration.
- Automated fare escrow and driver payouts upon ride completion.

---

## 25. Important Product Decisions for Future Teammates

1. **Role Separation**: `DRIVER` and `PASSENGER` responsibilities must remain distinct.
2. **Admin Status**: Admin features are future work; do not claim admin functionality exists in current user flows.
3. **Emergency Contact Privacy**: Emergency contact info is private and must never be exposed publicly.
4. **Co-Passenger Preference**: Female passenger preference applies to **co-passengers**, never driver gender.
5. **GPS Fallback**: SOS alert creation and emergency email delivery must proceed even if GPS times out or is denied.
6. **Active Ride Lockout**: Drivers holding an `ACTIVE` ride cannot publish new rides until the active ride ends.
7. **Driver-Controlled End Ride**: Ride completion is controlled strictly by the driver via a confirmation modal.
8. **Passenger Window Sync**: Passenger views poll status to update state automatically when a ride is completed.
9. **Post-Ride Ratings**: Ratings are enabled strictly for `COMPLETED` rides.
10. **Directional Reviews**: Profile review sections and average ratings must remain directional (Driver shows Passenger reviews; Passenger shows Driver reviews).

---

## 26. Data Flow Diagrams

### Ride & SOS Lifecycle Flow

```
Driver publishes Ride (SCHEDULED)
         │
Passenger requests Seat (PENDING) ──> Driver confirms Seat (CONFIRMED)
         │
Driver clicks "Start Ride" (ACTIVE)
         │
    ┌────┴────────────────────────────────────────┐
    ▼                                             ▼
Passenger presses SOS             Driver clicks "End Ride" (COMPLETED)
    │                                             │
Capture GPS (or fallback null)                    ├── Passenger Sync detects COMPLETED
    │                                             │
Create EmergencyAlert                             └── Rating options unlocked
    │
Send Nodemailer Emergency Email
```

---

## 27. Rules for Future Development

1. **Inspect Before Modifying**: Inspect existing components and schema before making structural edits.
2. **Preserve Working Features**: Do not break or rewrite SOS, email notifications, passenger sync, or ratings.
3. **Enforce Server-Side Authorization**: Validate session IDs and roles on the backend for every sensitive action.
4. **Transactional Database Edits**: Wrap seat count modifications and status changes in `prisma.$transaction`.
5. **Keep Secrets Secret**: Never commit `.env` files or API credentials.

---

## 28. Setup & Development Instructions

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Synchronize database schema
npx prisma db push

# 4. Start development server
npm run dev

# 5. Run ESLint code quality checks
npm run lint

# 6. Build for production
npm run build
```

Application will run at `http://localhost:3000`.

---

## 29. Recent Major Updates

- **Automatic Driver Ride Request Sync**: Implemented `DriverRequestSync.tsx` with lightweight 4-second polling to update driver dashboard requests without page reloads.
- **Search Page Ride Filtering**: Enforced database-level filtering (`status: "SCHEDULED"`, `seats: { gt: 0 }`, `departure: { gt: new Date() }`) in `src/app/search/page.tsx` to automatically exclude completed, cancelled, active, and full rides.
- **Compact Route Map Layout**: Refactored `/rides/[id]` into a 3-column card grid with `h-56 sm:h-64` map container to keep map preview compact alongside driver details.
- **Modal Chat Container (`RideChatModal.tsx`)**: Replaced full inline ride chat on `/rides/[id]` with a compact CTA button opening a modal with structured header, message bubbles, role badges, and auto-scroll.
- **Reusable Back Navigation (`BackButton.tsx`)**: Added `BackButton` component (`router.back()` with fallback) across Search, Ride Details, Publish Ride, and Verification portal pages.
- **Post-Ride Ratings & Reviews**: Implemented database model, rating submission APIs, rating components, dashboard prompts, and directional profile reviews.
- **Dashboard Heading Cleanup**: Removed `"Passenger Hub"` and `"Driver Hub"` headings and subtitles to streamline dashboard UI.
- **Ride Lifecycle & Passenger Sync**: Implemented `SCHEDULED` → `ACTIVE` → `COMPLETED` lifecycle controls with automatic 4-second passenger window synchronization.
- **Active Ride Restrictions**: Restricted drivers with an active ride from publishing additional rides.
- **Emergency SOS & Email Notification**: Implemented passenger SOS alert creation with live GPS capture and Nodemailer SMTP emergency contact email delivery.
