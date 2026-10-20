# Outdoor E-commerce Platform — Architecture Decision Records & Technical Specifications

## Document Control

* **Document Version:** 1.0.0
* **Lifecycle Phase:** Phase 03 — Technical Planning and Architecture
* **Status:** `APPROVED` (Approved by User on 2026-10-18)
* **Application Scope:** Full-stack Outdoor E-commerce Web Application (`outdoor-ecommerce/`)
* **Authoritative Governance:**
  * [`GEMINI.md`](file:///C:/Users/Rezvan/.gemini/GEMINI.md) — Senior Frontend Engineering — Global Rules
  * [`AGENTS.md`](file:///d:/A-creat%20skills-/AGENTS.md) — Operational Guidelines & Approval Policy
  * [`PROJECT_WORKFLOW.md`](file:///d:/A-creat%20skills-/PROJECT_WORKFLOW.md) — Standard Frontend Project Lifecycle
  * [`PROJECT_BRIEF.md`](file:///d:/A-creat%20skills-/outdoor-ecommerce/PROJECT_BRIEF.md) — Project Charter & Core Requirements
  * [`docs/REQUIREMENTS.md`](file:///d:/A-creat%20skills-/outdoor-ecommerce/docs/REQUIREMENTS.md) — Functional, Catalog, and Acceptance Specifications

---

## 1. Executive Summary & Architecture Overview

The Outdoor E-commerce Platform is a full-stack, production-grade e-commerce application built for online public deployment and evaluation by external reviewers. The architecture is engineered around high performance, strong type safety, strict relational data integrity, defense-in-depth security, and a rich Classic Technical Outdoor aesthetic.

### System Architecture Diagram

```mermaid
graph TD
    subgraph Client Browser
        UI[React 19 Presentation Layer]
        Storage[Local Storage Guest Cart]
        Cookie[__Host-auth_session HttpOnly Cookie]
    end

    subgraph Edge / Proxy Layer
        CDN[CDN / Reverse Proxy - Vercel / Cloudflare]
        Middleware[Next.js Edge Middleware - Route Guards]
    end

    subgraph Server Application - Next.js 16 App Router
        Actions[Server Actions - UI Mutations]
        Routes[Restricted Route Handlers - API Contracts]
        Auth[Auth & Rate Limiting Engine]
        Services[Shared Domain Services - Single Source of Truth]
    end

    subgraph Relational Database - PostgreSQL
        Pooler[Connection Pooler - PgBouncer / Neon Pooler]
        DB[(PostgreSQL 16+ Database)]
        DirectConn[Direct TCP Port 5432 - Migration Runner]
    end

    UI -->|HTTPS Navigation / RSC Request| CDN
    UI -->|Server Action Form Mutation| Actions
    UI -->|Client Bootstrap JSON Fetch| Routes
    Storage -.->|Guest Cart Merge| Routes

    CDN --> Middleware
    Middleware --> Actions
    Middleware --> Routes

    Actions --> Auth
    Routes --> Auth
    Actions --> Services
    Routes --> Services

    Services -->|Runtime Queries - DATABASE_URL| Pooler
    Pooler --> DB
    DirectConn -->|Prisma Migrations - DIRECT_URL| DB
```

### Core Technology Stack Summary

| Layer | Selected Technology | Version Baseline | Architectural Role |
| :--- | :--- | :---: | :--- |
| **Framework & App Server** | **Next.js (App Router)** | `^16.4.0` (Active LTS) | Server Components (SSR/RSC), Server Actions, metadata, and routing. |
| **UI Library & Runtime** | **React & React DOM** | `^19.0.0` (GA) | Asynchronous Server Components, `useActionState`, progressive enhancement. |
| **Language & Typing** | **TypeScript** | `^5.6.0` | Strict static type checking, shared domain interfaces, DTOs. |
| **Styling & Design System** | **Tailwind CSS v4** | `^4.3.0` | `@tailwindcss/postcss`, `@theme` custom properties, zero runtime JS. |
| **Database & ORM** | **PostgreSQL + Prisma** | `Prisma ^7.10.0` | Relational persistence, MVCC row-level locking, migrations, type-safe queries. |
| **Validation Engine** | **Zod** | `^3.24.0` | Schema validation at runtime boundaries (form inputs, JSON payloads). |
| **Password Security** | **bcryptjs** | `^2.4.3` | Pure JavaScript password hashing (12 salt rounds, zero C++ compilation). |
| **Test Runners** | **Vitest / Playwright** | `latest` | Vitest for domain services/actions; Playwright for end-to-end browser flows. |

---

## 2. Architecture Decision Records (ADRs)

### ADR-001: Framework Baseline — Next.js 16 (Active LTS) with React 19

* **Status:** `APPROVED`
* **Context:**
  The project requires a full-stack framework providing server-side rendering for product discovery, fast client interactions, SEO metadata, and secure server-executed mutations. Next.js 16 is the official Active LTS release line, while Next.js 15 has moved to Maintenance LTS.
* **Decision:**
  Standardize on **Next.js 16 (`^16.4.0`)** running on **React 19 (`^19.0.0`)** and **Node.js 22 LTS (`>=20.9.0`)**.
* **Rationale:**
  1. **Active LTS Support:** Next.js 16 actively receives performance optimizations, compiler upgrades, and Turbopack enhancements. Next.js 15 receives only critical security backports.
  2. **Zero Verified Blockers:** Rigorous dependency audits confirm 100% peer-dependency compatibility across React 19.3.1, `@prisma/client`, `tailwindcss@4`, and `bcryptjs`.
  3. **E-Commerce Data Freshness by Default:** Next.js 16 enforces `no-store` (uncached) default semantics for dynamic `fetch` and Route Handlers, completely eliminating stale product inventory, ghost cart items, or delayed order status updates.
  4. **Standardized Async Request APIs:** Native adoption of asynchronous APIs (`await cookies()`, `await headers()`, `await params`), aligning with React 19 server patterns.
* **Trade-offs & Mitigations:**
  * *Trade-off:* Hosting platforms must run Node.js `>=20.9.0`.
  * *Mitigation:* System Node is `v22.17.0`; modern deployment platforms (Vercel, Railway, Render) support Node 20+ out of the box. Next.js 15 (`^15.5.0`) serves as a documented Maintenance LTS fallback if an environment constraint ever demands it.

---

### ADR-002: Persistence & ORM — PostgreSQL with Prisma 7 (Dual-Connection Architecture)

* **Status:** `APPROVED`
* **Context:**
  The application will be deployed online and accessible to external reviewers. Reviewers will register accounts, add products to cart, and execute simulated checkouts. The persistence strategy must guarantee durability across serverless container restarts and provide atomic transaction guarantees during concurrent checkouts.
* **Decision:**
  Standardize directly on **PostgreSQL with Prisma 7 (`^7.10.0`)** from Phase 04 Bootstrap forward. SQLite will **not** be used as an interim local store.
* **Rationale:**
  1. **Online Deployment Viability:** Serverless hosts (Vercel, Netlify) operate on ephemeral filesystems where local SQLite writes vanish on container recycling. A network-accessible PostgreSQL database is required.
  2. **Migration Incompatibility Fallacy:** Switching from SQLite to PostgreSQL later is **not** a one-line schema change. Prisma generates dialect-specific SQL migrations (`prisma/migrations/`). SQLite migrations use table recreation routines, whereas PostgreSQL uses native DDL (`CREATE TYPE ... AS ENUM`, `ALTER TABLE`, foreign key constraints). SQLite migration histories cannot be executed against PostgreSQL.
  3. **Native Data Types:** PostgreSQL natively supports `ENUM` types (enforcing `OrderStatus` and `Role` integrity at the database engine level), native `UUID` generation, and native `JSONB`.
  4. **Concurrency & Locking:** SQLite locks the entire database file during writes, creating severe `SQLITE_BUSY` bottlenecks under reviewer concurrency. PostgreSQL provides Multi-Version Concurrency Control (MVCC) with row-level locking (`SELECT ... FOR UPDATE` or atomic decrement queries), isolating concurrent checkouts.
* **Implementation Constraints (Mandatory):**
  > [!IMPORTANT]
  > **Constraint 1: Dual-Connection Separation (Pooled Runtime vs. Direct Migration)**
  > Follow official Prisma 7 configuration and migration guidance. Transaction-mode connection poolers (e.g., PgBouncer, Neon connection pooler on port 6543) do not support the session-level advisory locks (`pg_advisory_lock`) or DDL statements required by Prisma migrations.
  > `prisma/schema.prisma` must strictly declare dual connections:
  > ```prisma
  > datasource db {
  >   provider  = "postgresql"
  >   url       = env("DATABASE_URL") // Pooled connection URL for runtime application queries
  >   directUrl = env("DIRECT_URL")   // Direct unpooled TCP connection URL (port 5432) for DDL migrations
  > }
  > ```
  > Developers must verify pooled runtime and direct migration connection settings against the selected database provider (e.g. Neon, Supabase, Railway Postgres).

---

### ADR-003: Monetary Precision — Integer Cents Standard

* **Status:** `APPROVED`
* **Context:**
  E-commerce applications process item prices, sub-totals, discounts, sales taxes, and shipping fees. Storing monetary values as floating-point numbers (`Float` / `Double`) introduces IEEE 754 precision errors (e.g. `0.1 + 0.2 = 0.30000000000000004`). Mapping database `Decimal` types across ORMs and client JavaScript often requires specialized string serialization.
* **Decision:**
  All monetary attributes across the schema, domain services, DTOs, and API contracts will be represented as **Integer Cents** (`Int`):
  * Example: `$129.99` $\to$ `12999` cents; `$5.00` $\to$ `500` cents.
* **Rationale:**
  1. **Zero Rounding Bugs:** Integer arithmetic is 100% exact in JavaScript and PostgreSQL, preventing fractional penny drift during tax or discount calculation.
  2. **Type Safety & Portability:** Native integer values serialize seamlessly into JSON without custom decimal parser libraries.
  3. **Presentation Layer Decoupling:** Formatting is handled exclusively at the presentation edge by a shared utility:
     ```ts
     export function formatCurrency(cents: number): string {
       return new Intl.NumberFormat('en-US', {
         style: 'currency',
         currency: 'USD',
       }).format(cents / 100);
     }
     ```

---

### ADR-004: Styling Architecture — Tailwind CSS v4 with Modern Theme Custom Properties

* **Status:** `APPROVED`
* **Context:**
  The project requires a high-fidelity Classic Technical Outdoor visual aesthetic (forest green, warm sand, amber accents, editorial serif headings) with responsive layouts, accessible contrast, and zero runtime performance overhead.
* **Decision:**
  Adopt **Tailwind CSS v4 (`^4.3.0`)** using `@tailwindcss/postcss` and native `@theme` CSS custom properties.
* **Rationale:**
  1. **Zero Runtime JavaScript:** Compiles directly to static CSS at build time with no client-side runtime penalty.
  2. **Native CSS Variables via `@theme`:** Replaces the legacy JavaScript `tailwind.config.js` file with standard CSS `@theme` declarations in `globals.css`:
     ```css
     @import "tailwindcss";

     @theme {
       --color-forest-primary: #1C3323;
       --color-forest-secondary: #2E4D36;
       --color-forest-light: #4A6B53;
       --color-warm-sand: #F7F5F0;
       --color-warm-cream: #EDE8DE;
       --color-accent-amber: #D97706;
       --color-accent-rust: #B45309;
       --font-serif: var(--font-playfair), Georgia, serif;
       --font-sans: var(--font-inter), system-ui, sans-serif;
     }
     ```
  3. **Verified PostCSS Compatibility:** Builds cleanly via PostCSS 8 with Next.js 16; no bundler conflicts.
  4. **Reusable UI Composition:** Uses `clsx` and `tailwind-merge` in a shared `cn()` helper for conflict-free class composition in design system primitives (`Button`, `Input`, `Badge`, `Dialog`).

---

### ADR-005: Transport & Mutation Boundaries — Server Actions for UI, Restricted Route Handlers

* **Status:** `APPROVED`
* **Context:**
  Full-stack Next.js applications risk architectural confusion when duplicate mutation paths are created (e.g. having both a Server Action and a Route Handler performing the same operation). Adding production HTTP endpoints solely to simplify test assertions violates security and maintenance principles.
* **Decision:**
  1. **Server Actions** are the **primary and exclusive** mutation mechanism for all user-initiated UI interactions.
  2. **Route Handlers** exist **only** where real external HTTP access or explicit client background synchronization requires them.
  3. **Zero Test-Only Production Route Handlers:** Production code will **not** include endpoints (such as `POST /api/orders` or `PATCH /api/orders/:id/status`) solely for testing. Integration tests will test the domain service layer directly.
* **Mutation Allocation Matrix:**

| Feature Area | Mechanism | Endpoint / Action Path | Justification |
| :--- | :--- | :--- | :--- |
| **User Authentication** | Server Action | `src/lib/actions/authActions.ts` | Form submission, automatic CSRF origin check, cookie management. |
| **Cart Mutations** | Server Action | `src/lib/actions/cartActions.ts` | Add/update/remove items, automatic cart revalidation. |
| **Guest Cart Merge** | Route Handler | `POST /api/cart/merge` | Programmatic client bootstrap call transferring `localStorage` items upon sign-in. |
| **Checkout Submission** | Server Action | `src/lib/actions/checkoutActions.ts` | Validates stock, executes atomic decrement, creates order, revalidates cache. |
| **Order Cancellation** | Server Action | `src/lib/actions/orderActions.ts` | Customer/admin order cancellation with automatic stock restoration. |
| **Session Hydration** | Route Handler | `GET /api/auth/me` | Client components (navbar user avatar, badge) hydrate session state. |
| **Uptime & Health Probes** | Route Handler | `GET /api/health` | Deployment platform health check verifying database connectivity. |
| **Maintenance Cleanup** | Route Handler | `POST /api/cron/cleanup` | Authenticated scheduled maintenance hook for cron triggers. |

---

### ADR-006: Business Logic Layer — Shared Pure Domain Services

* **Status:** `APPROVED`
* **Context:**
  Business logic must remain isolated from HTTP transport mechanisms (Server Actions, Route Handlers) and presentation components to enable comprehensive automated testing, maintainability, and transaction consistency.
* **Decision:**
  All business domain logic, atomic Prisma transactions, state machine transitions, and stock reservation invariants reside in **pure domain services** (`src/lib/services/`):
  * `orderService.ts`: Order creation, state transitions, customer/admin cancellation, and order queries.
  * `inventoryService.ts`: Atomic stock reservation, decrement with rollback, and restocking.
  * `cartService.ts`: Cart item additions, quantity updates, duplicate summation, and guest-cart merging.
  * `catalogService.ts`: Product retrieval, category filtering, search, and stock level checks.
  * `authService.ts`: Credential verification, session creation, sliding expiration, and logout.
* **Architectural Invariant:**
  Domain services are **strictly prohibited** from importing React, UI components, or Next.js HTTP request contexts (`cookies()`, `headers()`). Transport adapters (Actions and Route Handlers) extract inputs, verify sessions, pass plain parameters to services, and handle HTTP responses/cookies.

---

### ADR-007: Defense-in-Depth Authentication & Session Security

* **Status:** `APPROVED`
* **Context:**
  Public deployment to external reviewers requires hardened authentication against credential theft, session hijacking, brute-force attacks, and unauthorized privilege escalation.
* **Decision:**
  Implement a three-tier defense-in-depth security model:
  1. **Password Hashing:** `bcryptjs` with **12 salt rounds**. Pure JavaScript implementation ensures 100% build reliability on Windows and cloud runners.
  2. **Database-Backed Session Tokens (Hashed at Rest):**
     * Session tokens are generated using 32 bytes of cryptographic randomness (`crypto.randomBytes(32).toString('hex')`).
     * The database stores only a **SHA-256 hash** of the token (`tokenHash`). If the database is ever compromised, active session tokens cannot be extracted.
     * Raw session tokens exist only in the user's browser cookie.
  3. **Session Lifecycle & Cleanup:**
     * **Sliding Window:** 7 days of inactivity. Active sessions extend expiration by 7 days if used $>24$ hours after last activity.
     * **Absolute Maximum:** 30 days from creation; terminated regardless of activity.
     * **Cleanup:** Two-tier strategy: opportunistic cleanup during login/logout actions, supplemented by the scheduled cron cleanup route.
  4. **Cookie Security Configuration:**
     * Name: `__Host-auth_session` in production (`auth_session` in development).
     * Flags: `HttpOnly: true`, `SameSite: "lax"`, `Secure: true` (in production), `Path: "/"`, `Max-Age: 7 days`.
  5. **Three-Tier Server-Side Authorization:**
     * *Tier 1 (Edge Middleware):* Inspects cookie presence for `/admin/*` and `/account/*`; fast redirect to `/login`.
     * *Tier 2 (Layout Server Component):* Validates database session and verifies `session.user.role === 'ADMIN'` before rendering admin child pages.
     * *Tier 3 (Service & Action Layer):* Every administrative action or service method calls `await requireAdminSession()`. Throws `UnauthorizedError` (HTTP 401) or `ForbiddenError` (HTTP 403). Data mutations cannot execute without passing this check.

---

### ADR-008: Operational Security, Secret Isolation & Proxy-Aware Rate Limiting

* **Status:** `APPROVED`
* **Context:**
  Online deployment requires protecting maintenance endpoints, isolating secrets from client bundles, and preventing brute-force attacks without disrupting reviewers sharing corporate or institutional proxies.
* **Decision:**
  1. **Cron Endpoint Authentication:**
     * `POST /api/cron/cleanup` requires an `Authorization: Bearer <CRON_SECRET>` header.
     * Authenticated using **constant-time comparison** via Node’s `crypto.timingSafeEqual` to eliminate timing attacks.
  2. **Compile-Time Secret Isolation:**
     * All database singletons, auth utilities, and domain services include `import 'server-only';`. Any accidental import into client components triggers an immediate compile-time build failure.
     * Only variables prefixed with `NEXT_PUBLIC_` are exposed to client JavaScript. All secrets (`DATABASE_URL`, `DIRECT_URL`, `SESSION_SECRET`, `CRON_SECRET`, passwords) omit the prefix.
     * Production logs run with `log: ['error']`; connection strings, passwords, and stack traces are never serialized to the client.
* **Implementation Constraints (Mandatory):**
  > [!IMPORTANT]
  > **Constraint 2: Trusted Proxy-Aware Rate Limiting & Header Provenance**
  > Client IP headers must be trusted **only when their provenance is guaranteed by the deployment platform**; never blindly trust arbitrary forwarded headers.
  > In public cloud deployments:
  > * Extract client IP from platform-verified headers (e.g. `x-real-ip` on Vercel/Cloudflare, or the leftmost IP in `x-forwarded-for` when behind a trusted proxy).
  > * **Composite Rate-Limiting Identifier:** Login rate limiting tracks a SHA-256 hash of `normalized_email + ':' + client_ip` in the database (`LoginAttempt` model):
  >   * Policy: Maximum **5 failed attempts per 15-minute rolling window**.
  >   * Behavior: An attacker attempting bad passwords against `admin@example.com` locks out only their specific IP address from that email. Reviewers on other IPs can still authenticate. Users sharing a corporate or cellular NAT IP are protected against collateral lockouts.

---

## 3. Architectural Directory Structure & Boundaries

```
outdoor-ecommerce/
├── prisma/
│   ├── schema.prisma               # PostgreSQL schema, enums, models, and relations
│   ├── migrations/                 # Declarative SQL migrations (via prisma migrate dev)
│   └── seed.ts                     # Seeds 14 outdoor products, categories, demo reviewer accounts
├── public/
│   ├── images/                     # Product, hero, and category photography
│   └── favicon.ico
├── src/
│   ├── app/                        # Next.js App Router (Pages, Layouts, Server Component entrypoints)
│   │   ├── (storefront)/           # Public customer storefront routes (catalog, PDP, cart, checkout)
│   │   ├── (auth)/                 # Login and registration pages
│   │   ├── admin/                  # Protected administrative dashboard & order management
│   │   └── api/                    # Strictly limited Route Handlers (cart merge, auth me, health, cron)
│   ├── components/                 # React UI presentation layer
│   │   ├── ui/                     # Design system primitives (Button, Input, Badge, Dialog)
│   │   ├── catalog/                # ProductCard, ProductGrid, FilterToolbar
│   │   ├── cart/                   # CartDrawer, CartItemRow, CartSummary
│   │   ├── checkout/               # SimulatedCheckoutForm, OrderConfirmation
│   │   ├── admin/                  # AdminOrderTable, StatusChangeModal, ProductForm
│   │   └── layout/                 # Header, Navigation, Footer
│   ├── lib/                        # Business domain and infrastructure
│   │   ├── actions/                # Thin Server Action mutation adapters (Zod parsing + auth + service call)
│   │   ├── auth/                   # Password hashing, token hashing, session cookies, rate limiting
│   │   ├── db/                     # Prisma Client singleton (prisma.ts) with 'server-only'
│   │   ├── services/               # Pure business domain services (Orders, Inventory, Cart, Products)
│   │   ├── validations/            # Zod validation schemas
│   │   └── utils/                  # Formatting helpers (formatCurrency), class merger (cn)
│   ├── types/                      # Pure TypeScript domain models, DTOs, and API contracts
│   └── middleware.ts               # Edge navigational guard for protected routes
```

### Unidirectional Dependency Flow Rules

```mermaid
graph TD
    Types[src/types/] --> Validations[src/lib/validations/]
    Validations --> Services[src/lib/services/]
    DB[src/lib/db/] --> Services
    Auth[src/lib/auth/] --> Services
    Services --> Actions[src/lib/actions/]
    Services --> App[src/app/ Server Components & Routes]
    Actions --> App
    UIPrimitives[src/components/ui/] --> DomainUI[src/components/{domain}/]
    DomainUI --> App
```

* **`src/types/`:** Pure TypeScript interfaces and enums. Cannot import from any application directory.
* **`src/lib/services/`:** Single source of truth for business logic. Prohibited from importing React, UI components, or Next.js HTTP request contexts (`cookies()`, `headers()`).
* **`src/lib/actions/`:** Thin adapters. Parses inputs with Zod, checks session guards, and invokes domain services.
* **`src/components/`:** Presentational components. Prohibited from executing direct database queries or importing domain services directly.

---

## 4. Prisma 7 Data Model Blueprint

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  CUSTOMER
  ADMIN
}

enum OrderStatus {
  PENDING
  PROCESSING
  COMPLETED
  CANCELLED
}

model User {
  id           String    @id @default(uuid())
  email        String    @unique
  passwordHash String
  name         String
  role         Role      @default(CUSTOMER)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  sessions     Session[]
  orders       Order[]
  cart         Cart?
}

model Session {
  id           String   @id @default(uuid())
  userId       String
  tokenHash    String   @unique
  expiresAt    DateTime
  lastActiveAt DateTime @default(now())
  createdAt    DateTime @default(now())
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
}

model LoginAttempt {
  id          String    @id @default(uuid())
  identifier  String    @unique // hash(email:ip)
  attempts    Int       @default(1)
  lockedUntil DateTime?
  updatedAt   DateTime  @updatedAt

  @@index([identifier])
}

model Category {
  id          String    @id @default(uuid())
  name        String    @unique
  slug        String    @unique
  description String?
  products    Product[]
  createdAt   DateTime  @default(now())
}

model Product {
  id             String      @id @default(uuid())
  categoryId     String
  name           String
  slug           String      @unique
  description    String
  priceInCents   Int         // Integer cents: e.g. 12999 = $129.99
  inventory      Int         // Live stock count
  imageUrl       String
  rating         Float       @default(0.0)
  reviewCount    Int         @default(0)
  technicalSpecs Json?       // Key-value technical specifications
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  category       Category    @relation(fields: [categoryId], references: [id])
  cartItems      CartItem[]
  orderItems     OrderItem[]

  @@index([categoryId])
  @@index([slug])
}

model Cart {
  id        String     @id @default(uuid())
  userId    String     @unique
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     CartItem[]
}

model CartItem {
  id        String   @id @default(uuid())
  cartId    String
  productId String
  quantity  Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  cart      Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([cartId, productId])
}

model Order {
  id              String      @id @default(uuid())
  userId          String
  orderNumber     String      @unique // e.g. ORD-20261018-XXXX
  status          OrderStatus @default(PENDING)
  subtotalInCents Int
  shippingInCents Int
  taxInCents      Int
  totalInCents    Int
  shippingAddress Json        // Structured shipping details
  idempotencyKey  String?     @unique
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  user            User        @relation(fields: [userId], references: [id])
  items           OrderItem[]

  @@index([userId])
  @@index([status])
}

model OrderItem {
  id           String  @id @default(uuid())
  orderId      String
  productId    String
  quantity     Int
  priceInCents Int     // Historical price at purchase time
  order        Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product      Product @relation(fields: [productId], references: [id])

  @@index([orderId])
}
```

---

## 5. Environment Variables Contract (`.env.example`)

```env
# Database Connections (PostgreSQL with Connection Pooling)
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Application Environment
NODE_ENV="development" # or "production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Authentication & Session Security
SESSION_SECRET="replace-with-a-64-character-random-hex-string"
CRON_SECRET="replace-with-a-secure-random-token-for-cron-triggers"

# Reviewer Demo Credentials (used by prisma/seed.ts)
DEMO_ADMIN_EMAIL="admin@example.com"
DEMO_ADMIN_PASSWORD="AdminPassword123!"
DEMO_CUSTOMER_EMAIL="customer@example.com"
DEMO_CUSTOMER_PASSWORD="CustomerPassword123!"
```

---

## 6. Implementation Readiness for Phase 04 Bootstrap

With Phase 03 technical planning formally approved, the implementation sequence for Phase 04 Bootstrap is defined as:

1. **Workspace Inspection & Verification:** Verify the clean workspace state in `outdoor-ecommerce/` before scaffolding.
2. **Next.js 16 Application Initialization:** Scaffold using `npx -y create-next-app@latest ./` with TypeScript, ESLint, App Router, and Tailwind CSS.
3. **Core Dependencies Installation:**
   * Runtime: `@prisma/client@^7.10.0`, `zod@^3.24.0`, `bcryptjs@^2.4.3`, `clsx`, `tailwind-merge`, `lucide-react`, `server-only`.
   * Development: `prisma@^7.10.0`, `@types/bcryptjs`, `tsx`, `vitest`.
4. **Prisma Setup & Schema Initialization:** Populate `prisma/schema.prisma` with the approved PostgreSQL models and dual-URL configuration.
5. **Git Repository Initialization:** Initialize Git repository inside `outdoor-ecommerce/`, configure `.gitignore` (protecting `.env*`, `node_modules`, `.next`), and establish the initial bootstrap commit.
6. **Development & Build Verification:** Run `npm run build` and `npm run dev` to verify clean compilation and server startup.
