# Cantina Vini - Codebase Structure Analysis

## Project Overview

**Project Name:** Cantina Vini (Wine Cellar Management)
**Framework:** Next.js 15 with TypeScript
**Type:** PWA (Progressive Web App) for personal wine cellar management
**Status:** MVP in development (v0.1.0)

---

## Framework: Next.js 15

This is a **Next.js 15** application using the **App Router** pattern (not Pages Router).

### Key Framework Features Used:
- **App Router** (`/app` directory) - Modern routing system
- **Server Components** - Default in App Router
- **Client Components** - Using "use client" directive where needed
- **API Routes** - Only one callback route currently (`/app/(auth)/callback/route.ts`)
- **Middleware** - `middleware.ts` for session refresh via Supabase
- **Type Safety** - Full TypeScript support with `tsconfig.json`
- **CSS Framework** - TailwindCSS with custom wine-themed color scheme

---

## Project Structure

