# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hair by Noella is a Next.js 15 booking application for a hair salon business. It features a public-facing website for browsing services and making bookings, plus an admin panel for managing bookings, services, and availability.

## Development Commands

### Starting Development
```bash
npm run dev          # Starts Docker Compose (PostgreSQL) and Next.js dev server with Turbopack
npm run db:up        # Start PostgreSQL container only
npm run db:down      # Stop PostgreSQL container
```

### Database Management
```bash
npx drizzle-kit generate  # Generate migration files from schema changes
npx drizzle-kit migrate   # Apply pending migrations to database
npx drizzle-kit studio    # Open Drizzle Studio GUI for database inspection
```

### Production
```bash
npm run build        # Build production bundle with Turbopack
npm start            # Start production server
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15 (App Router with Turbopack)
- **Database**: PostgreSQL (Docker container on port 5433)
- **ORM**: Drizzle ORM
- **Authentication**: Better Auth with email/password
- **Forms**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS 4 with custom gold/dark color scheme
- **UI Components**: Radix UI primitives + custom components

### Database Schema (lib/schema.ts)

The application has two main domain areas:

**Auth Tables** (managed by Better Auth):
- `user` - User accounts with role field (default: "user", admin: "admin")
- `session` - Active user sessions
- `account` - OAuth/credential providers
- `verification` - Email verification tokens

**Application Tables**:
- `services` - Hair services with name, category, price, duration, description
- `availabilitySlots` - Time slots with startTime and isBooked flag
- `bookings` - Customer bookings linking users, services, slots with customer contact info

### Key Architecture Patterns

**Route Groups**: The app uses route groups for layout organization:
- `app/(root)/*` - Public pages using minimal layout
- `app/admin/*` - Protected admin dashboard with sidebar navigation

**Authentication Flow**:
- Better Auth configured in `lib/auth.ts` with Drizzle adapter
- Admin routes check `session.user.role === "admin"` in layout
- Session retrieved via `auth.api.getSession({ headers: await headers() })`
- Auth API exposed at `/api/auth/[...all]`

**Database Connection**:
- Connection pooling via `pg` Pool in `lib/db.ts`
- `DATABASE_URL` environment variable required (default: PostgreSQL on port 5433)
- Drizzle client exported as `db` with schema imported

**API Routes Pattern**:
- `POST /api/bookings` - Creates booking, marks slot as booked (accepts both authenticated and guest bookings)
- `GET /api/bookings` - Returns current user's bookings (requires auth)
- `GET /api/services` - Returns all available services
- `GET /api/availability?date=YYYY-MM-DD` - Returns available slots for date

**Form Handling**:
- Client components use React Hook Form with Zod schemas
- Matching Zod schemas on API routes for validation
- Example: BookingForm.tsx demonstrates full flow with service selection, date picker, slot selection, and customer details

### Component Organization

- `components/` - Reusable UI components (Hero, Services, Testimonials, etc.)
- `components/ui/` - Radix UI-based primitives (Button, Calendar, Popover)
- `app/` - Pages following Next.js App Router conventions

### Environment Variables

Required in `.env`:
```
DATABASE_URL=postgresql://postgres:password@localhost:5433/hairbynoella
BETTER_AUTH_SECRET=<generate-random-secret>
BETTER_AUTH_URL=http://localhost:3000
```

## Important Notes

### Admin Access
- First user must be manually set to `role = 'admin'` in database
- Admin layout has a commented redirect that should be uncommented after admin user is created
- Check line 17 in `app/admin/layout.tsx`

### Booking Flow
- Bookings can be made by authenticated users or guests
- Slot booking is atomic: slot marked as booked when booking created
- Date handling: API accepts both string and Date objects, converts to Date internally

### Database Port
- PostgreSQL runs on port **5433** (not default 5432) to avoid conflicts
- Docker container name: `hairbynoella-db`

### Styling Theme
- Custom color palette: gold (#EAB308 family) and dark gray (#1F2937 family)
- Uses Tailwind with custom classes: `gold-400`, `gold-500`, `dark-400`, `dark-800`, etc.
- Typography: Default sans-serif for body, serif for headings (Geist font family)
