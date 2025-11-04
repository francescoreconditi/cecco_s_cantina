# Cantina Vini - Codebase Structure Analysis

## Quick Summary

**Framework:** Next.js 15 with TypeScript and App Router
**Type:** Progressive Web App (PWA) for wine cellar management
**Backend:** Supabase (PostgreSQL, Auth, Storage)
**State Management:** TanStack Query + Dexie (IndexedDB)
**Styling:** TailwindCSS with wine-themed colors

## Project Structure

Tree command not available
## Routes Overview

The project uses Next.js App Router where page.tsx files become routes:

### Main Routes:
- GET  /                           Redirect to /dashboard or /accedi
- GET  /(auth)/accedi             Login page
- GET  /(auth)/registrati         Sign-up page
- POST /(auth)/callback           OAuth callback handler
- GET  /dashboard                 Main dashboard (protected)
- GET  /vini                      List wines with filters
- GET  /vini/nuovo                Create wine form
- GET  /vini/[id]                 Wine detail
- GET  /vini/[id]/modifica        Edit wine
- GET  /bottiglie                 List bottles
- GET  /degustazioni              List tastings
- GET  /ubicazioni                Storage locations (WIP)

## Data Architecture

React Components ↓ Custom Hooks ↓ API Functions ↓ Supabase Client ↓ Supabase Backend

## Key Technologies

Frontend: Next.js 15, React 19, TypeScript, TailwindCSS
Backend: Supabase (PostgreSQL + Auth)
State: TanStack Query, Dexie/IndexedDB
Features: next-pwa, @zxing/library, recharts

## Database Tables

wines: id, owner_id, nome, produttore, denominazione, annata, vitigni[], regione, paese, formato_ml, grado_alcolico, tipologia, note
bottles: id, owner_id, wine_id, quantita, data_acquisto, prezzo_acquisto, fornitore, location_id, stato_maturita, barcode (unique), foto_etichetta_url
tastings: id, owner_id, wine_id, data, punteggio, aspetto_visivo, profumo, gusto, note_generali, occasione, abbinamento_cibo
locations: id, owner_id, nome, descrizione, parent_id, temperatura, umidita, capacita_massima

All tables have Row-Level Security (RLS) enabled.

## Component Patterns

List Pages: Use "use client", fetch with hooks, show loading/error states, include Header
Forms: "use client", mutation hooks, controlled components (useState), redirect on success
Cards: Accept data/callbacks props, display formatted data with action links

## API Functions (lib/api/)

lib/api/wines.ts:
- getWines(), getWine(id), searchWines(query)
- createWine(data), updateWine(id, data), deleteWine(id)
- getWineStats()

Similar for bottles.ts, tastings.ts, locations.ts

## Custom Hooks (lib/hooks/)

lib/hooks/use-wines.ts:
- useWines(): Query all wines
- useWine(id): Query single wine
- useCreateWine(): Mutation for create
- useUpdateWine(): Mutation for update
- useDeleteWine(): Mutation for delete

## Authentication

1. User visits /accedi or /registrati
2. Form submits to Supabase Auth
3. Callback handler at /(auth)/callback processes auth code
4. Session stored in httpOnly cookie
5. middleware.ts refreshes session on every request
6. Protected routes check supabase.auth.getUser()

## How to Add Features

Step 1: Create API Functions (lib/api/feature.ts)
Step 2: Create Custom Hooks (lib/hooks/use-feature.ts)
Step 3: Create Pages (app/feature/page.tsx)
Step 4: Create Components (components/feature/*.tsx)

## Templates to Reference

/vini/page.tsx - List with search/filter
/vini/nuovo/page.tsx - Create form
/dashboard/page.tsx - Dashboard with stats
/(auth)/accedi/page.tsx - Login form
/components/vini/wine-card.tsx - Card component

## Conventions

- Path alias: @/* points to root
- TypeScript strict mode enabled
- Secrets in .env.local (not in git)
- TailwindCSS utilities + wine colors
- Protected routes redirect unauthenticated users
- Forms use controlled components

## No API Routes

No /app/api/* routes used. Instead:
- Direct Supabase client calls from components
- RLS policies enforce security
- All CRUD operations client-side

## Environment Variables

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://...

## Running the Project

npm install - Install dependencies
npm run dev - Start dev server at localhost:3000
npm run build - Build for production
npm run db:generate - Generate Prisma Client
npm run db:push - Push schema to DB
npm run db:migrate - Create/apply migrations
npm run lint - Lint code

## Status

Implemented: Auth, Wine CRUD, Bottle inventory, Tastings, Locations, Search, Dashboard, PWA, TypeScript
In Development: Barcode scanner, Offline-first, Charts, Full-text search
Planned: Background sync, Push notifications, Vercel deploy, CI/CD

## Summary

Cantina Vini is a Next.js 15 PWA with:
- App Router for clean routes
- Supabase backend (no custom API)
- TanStack Query for caching
- TypeScript for safety
- TailwindCSS for responsive UI
- Dexie for offline support

Scalable, follows React best practices, new features added via established patterns.
PROJECT DIRECTORY STRUCTURE
================================================================================

tvini/
├── app/                              (Next.js App Router - Pages)
│   ├── (auth)/                       (Route group for auth pages)
│   │   ├── accedi/
│   │   │   └── page.tsx             (Login page)
│   │   ├── registrati/
│   │   │   └── page.tsx             (Sign-up page)
│   │   └── callback/
│   │       └── route.ts             (OAuth callback handler - API route)
│   ├── dashboard/
│   │   └── page.tsx                 (Main dashboard - protected)
│   ├── vini/                        (Wine management)
│   │   ├── page.tsx                 (List wines with filters)
│   │   ├── nuovo/
│   │   │   └── page.tsx             (Create wine form)
│   │   └── [id]/
│   │       ├── page.tsx             (Wine detail view)
│   │       └── modifica/
│   │           └── page.tsx         (Edit wine form)
│   ├── bottiglie/                   (Bottle inventory)
│   │   ├── page.tsx                 (List bottles)
│   │   ├── nuova/
│   │   │   └── page.tsx             (Create bottle)
│   │   └── [id]/
│   │       ├── page.tsx             (Bottle detail)
│   │       └── modifica/
│   │           └── page.tsx         (Edit bottle)
│   ├── degustazioni/                (Wine tastings)
│   │   ├── page.tsx                 (List tastings)
│   │   ├── nuova/
│   │   │   └── page.tsx             (Create tasting)
│   │   └── [id]/
│   │       ├── page.tsx             (Tasting detail)
│   │       └── modifica/
│   │           └── page.tsx         (Edit tasting)
│   ├── ubicazioni/                  (Storage locations - WIP)
│   ├── layout.tsx                   (Root layout with metadata)
│   ├── page.tsx                     (Homepage - redirects based on auth)
│   ├── providers.tsx                (TanStack Query provider setup)
│   └── globals.css                  (Global styles)
│
├── components/                      (Reusable React components)
│   ├── auth/
│   │   ├── accedi-form.tsx         (Login form component)
│   │   ├── registrati-form.tsx     (Sign-up form component)
│   │   └── logout-button.tsx       (Logout button)
│   ├── layout/
│   │   └── header.tsx              (Navigation header)
│   ├── vini/
│   │   ├── wine-card.tsx           (Wine card for grid display)
│   │   ├── wine-filters.tsx        (Search & filter controls)
│   │   └── wine-edit-form.tsx      (Create/edit form)
│   └── bottiglie/
│       └── barcode-scanner.tsx     (QR/barcode scanner)
│
├── lib/                            (Utility functions)
│   ├── api/                        (Supabase REST API clients)
│   │   ├── wines.ts               (Wine CRUD: get, create, update, delete, search)
│   │   ├── bottles.ts             (Bottle CRUD operations)
│   │   ├── tastings.ts            (Tasting CRUD operations)
│   │   └── locations.ts           (Location CRUD operations)
│   │
│   ├── hooks/                      (React custom hooks - TanStack Query)
│   │   ├── use-wines.ts           (useWines, useWine, useCreateWine, etc.)
│   │   ├── use-bottles.ts         (useBottles, useCreateBottle, etc.)
│   │   ├── use-tastings.ts        (useTastings, useCreateTasting, etc.)
│   │   └── use-locations.ts       (useLocations, useCreateLocation, etc.)
│   │
│   ├── supabase/
│   │   ├── client.ts              (Supabase client for browser)
│   │   ├── server.ts              (Supabase client for server components)
│   │   └── middleware.ts          (Middleware helper functions)
│   │
│   ├── dexie/
│   │   └── db.ts                  (IndexedDB setup for offline caching)
│   │
│   └── types/
│       └── database.ts            (TypeScript types - auto-generated)
│
├── prisma/
│   └── schema.prisma              (PostgreSQL database schema)
│
├── public/
│   └── manifest.json              (PWA manifest)
│
├── middleware.ts                   (Next.js middleware - session refresh)
├── next.config.js                  (Next.js configuration)
├── tsconfig.json                   (TypeScript configuration)
├── tailwind.config.ts             (TailwindCSS configuration)
├── postcss.config.js              (PostCSS configuration)
├── package.json                   (Node dependencies)
├── package-lock.json              (Dependency lock file)
├── .env.local                     (Environment variables - not in git)
├── .env.example                   (Template for env vars)
└── .gitignore                     (Git ignore rules)

================================================================================
KEY FILE LOCATIONS FOR COMMON TASKS
================================================================================

ADDING A NEW PAGE:
  1. Create: app/feature/page.tsx
  2. Make it a client component: "use client"
  3. Import: useFeature() hook from lib/hooks/
  4. Render data with loading/error states

ADDING A NEW ROUTE WITH DYNAMIC ID:
  1. Create: app/feature/[id]/page.tsx
  2. Get ID from props: const { params } = props
  3. Use: useFeature(params.id) hook
  4. Display details

CREATING A FORM:
  1. Page: app/feature/new/page.tsx
  2. Component: components/feature/feature-form.tsx
  3. Hook: useCreateFeature() mutation
  4. Redirect on success

ADDING API OPERATIONS:
  1. Create: lib/api/feature.ts
  2. Export functions: getFeature, createFeature, updateFeature, deleteFeature
  3. Use Supabase client from lib/supabase/client.ts

ADDING REACT HOOKS:
  1. Create: lib/hooks/use-feature.ts
  2. Wrap TanStack Query: useQuery, useMutation
  3. Use API functions from lib/api/feature.ts
  4. Handle cache invalidation on mutations

STYLING:
  1. Use TailwindCSS classes in JSX
  2. Custom wine colors: wine-50, wine-600, wine-900
  3. Responsive: sm:, lg: breakpoints
  4. Global styles: app/globals.css

AUTHENTICATION CHECK:
  Location: /(auth)/callback/route.ts (OAuth callback)
  Session: middleware.ts (auto-refresh)
  Protected routes: Check in useEffect, redirect if no user

================================================================================
FILE SIZES & COMPLEXITY
================================================================================

Small/Simple Files (< 100 lines):
  - lib/api/*.ts - Direct CRUD operations
  - lib/hooks/use-*.ts - TanStack Query wrappers
  - components/*/layout/header.tsx - Navigation

Medium Files (100-300 lines):
  - app/*/page.tsx - List pages with filters
  - components/*/forms - Form components
  - app/dashboard/page.tsx - Dashboard with stats

No files exceed 500 lines (good practice maintained).

================================================================================
PATTERNS TO FOLLOW
================================================================================

API Function Pattern:
  1. Import createClient
  2. Get current user if needed
  3. Call supabase.from("table").select/insert/update/delete()
  4. Throw error if present
  5. Return typed data

Hook Pattern:
  1. Import useQuery/useMutation from TanStack Query
  2. Wrap API function
  3. Set query/mutation key
  4. Return hook for use in components

Page Pattern:
  1. "use client" at top
  2. Import hook and components
  3. Handle user auth in useEffect
  4. Show loading/error states
  5. Render with Header + main content

Component Pattern:
  1. Accept props (data, callbacks)
  2. Optional "use client" if interactive
  3. Render JSX with TailwindCSS
  4. Pass event handlers to parent

