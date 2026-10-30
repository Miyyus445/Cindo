# BLUEPRINT: Cindo
> Update terakhir: 2026-10-30 | Commit: cd6e5a2

## 0. Petunjuk untuk AI pembaca
File ini adalah **sumber kebenaran tunggal** arsitektur proyek Cindo. Patuhi section 13 (Konvensi) dan 16 (Panduan Modifikasi) ketat. Kalau info kurang atau ambigu, **tanya user** — jangan berasumsi.

---

## 1. Ringkasan
- **Proyek**: Cindo (CINema INDO) — website katalog film legal, data dari TMDB API.
- **Tujuan**: Belajar fullstack (Next.js + Nest.js + Prisma + PostgreSQL) via proyek bulanan.
- **Target user**: Guest (telusuri, cari, detail, trailer) → Registered user (watchlist pribadi).
- **Fitur utama (Sprint 1-2 selesai)**: Daftar film populer + pagination, detail film + trailer YouTube, pencarian (debounce), filter genre.
- **Stack**: Next.js 16 (App Router, RSC), Nest.js 12, Prisma 7, PostgreSQL lokal, Bun, Turborepo, Tailwind 4, TypeScript.
- **Status**: Sprint 1-2 done. Auth & watchlist (Sprint 3-4) **belum ada**.

---

## 2. Tech Stack

| Layer | Teknologi | Versi | Fungsi di proyek ini |
|-------|-----------|-------|---------------------|
| Frontend Framework | Next.js | 16.3.8 | App Router, Server Components, SSR |
| UI Library | React | 19.2.8 | Komponen interaktif (SearchBar client) |
| Styling | Tailwind CSS | 4 | Utility-first, dark mode default |
| Backend Framework | Nest.js | 12.0.1 | Modular API, DI, Guards (nanti) |
| ORM | Prisma | 7.10.0 | Type-safe DB access, migration |
| Database | PostgreSQL | 16+ (lokal) | Persistensi User, Watchlist (rencana) |
| Package Manager | Bun | 1.4.0 | Install, run, test (lebih cepat npm) |
| Monorepo Tool | Turborepo | 2.5.4 | Pipeline dev/build, caching |
| Language | TypeScript | 6.0 (api), 5 (web) | Type safety end-to-end |
| Testing | Vitest | 4.1.2 | Unit & e2e test (api) |
| Linting | Oxlint (api), ESLint (web) | 1.58 / 9 | Fast lint, Next.js config |
| External API | TMDB | v3 | Katalog film, poster, trailer key |
| Video Embed | YouTube (nocookie) | - | Trailer iframe dari TMDB video key |

---

## 3. Struktur Folder

```
Cindo/
├── apps/
│   ├── api/                    # Nest.js backend
│   │   ├── src/
│   │   │   ├── main.ts                    # Entry: bootstrap Nest, listen PORT
│   │   │   ├── app.module.ts              # Root module: ConfigModule(global), TmdbModule, MoviesModule, GenresModule
│   │   │   ├── app.controller.ts          # GET / → "Hello World!"
│   │   │   ├── app.service.ts             # Hello service
│   │   │   ├── health.controller.ts       # GET /health → {status:"ok"}
│   │   │   ├── tmdb/
│   │   │   │   ├── tmdb.module.ts         # Provider TmdbService
│   │   │   │   └── tmdb.service.ts        # **CORE**: fetch TMDB, in-memory cache (popular 5m, genres 24h)
│   │   │   ├── movies/
│   │   │   │   ├── movies.module.ts       # Import TmdbModule, controller MoviesController
│   │   │   │   └── movies.controller.ts   # GET /movies/popular, /search, /discover, /:id, /:id/videos
│   │   │   └── genres/
│   │   │       ├── genres.module.ts       # Import TmdbModule, controller GenresController
│   │   │       └── genres.controller.ts   # GET /genres
│   │   ├── test/app.e2e-spec.ts           # E2E test bootstrap
│   │   ├── package.json                   # Scripts: dev, build, test, lint
│   │   ├── tsconfig.json                  # ESM, nodenext, strict, decorator metadata
│   │   └── nest-cli.json                  # Nest CLI config
│   │
│   └── web/                       # Next.js frontend
│       ├── app/
│       │   ├── layout.tsx                 # Root layout: Geist font, metadata, globals.css
│       │   ├── page.tsx                   # **HOME (RSC)**: fetch genres, popular/search/discover, render grid + pagination
│       │   ├── globals.css                # Tailwind v4 import, CSS vars, dark mode default
│       │   ├── components/
│       │   │   ├── MovieCard.tsx          # Poster (Image), title, rating, link ke /movies/[id]
│       │   │   ├── SearchBar.tsx          # **Client**: debounced 400ms, sync URL (q, page, genre)
│       │   │   ├── GenreFilter.tsx        # Link buttons "Semua" + genre list, highlight active
│       │   │   └── Pagination.tsx         # Prev/Next, build href preserve q/genre
│       │   └── movies/[id]/
│       │       ├── page.tsx               # **DETAIL (RSC)**: fetch detail + videos paralel, pick YouTube trailer, render info + iframe
│       │       └── not-found.tsx          # 404 custom: link kembali ke home
│       ├── public/                        # Static assets (svg icons)
│       ├── package.json                   # Scripts: dev, build, start, lint
│       ├── next.config.ts                 # images.remotePatterns: image.tmdb.org/t/p/**
│       ├── tsconfig.json                  # Path alias @/*, bundler moduleResolution
│       └── eslint.config.mjs              # Next.js core-web-vitals + typescript
│
├── packages/
│   └── db/                          # Prisma workspace
│       ├── prisma/
│       │   ├── schema.prisma            # **DB SOURCE OF TRUTH**: User model (id, email@unique, passwordHash, createdAt)
│       │   └── migrations/              # Migration history (init_user)
│       ├── src/
│       │   ├── client.ts                # PrismaClient dengan PrismaPg adapter (DATABASE_URL)
│       │   └── index.ts                 # Re-export prisma
│       ├── package.json                 # Scripts: db:generate, db:migrate
│       └── prisma.config.ts             # Prisma config: schema path, migrations path, datasource from env
│
├── docs/
│   ├── prd.md                         # PRD lengkap + Jira backlog (epic CINE-1..33)
│   └── jira-import-backlog.csv        # Backlog CSV
│
├── .env.example                       # PORT=3001, DATABASE_URL, TMDB_API_KEY
├── .env                               # **LOCAL ONLY** (gitignored)
├── turbo.json                         # Pipeline: dev (persistent), build (dependsOn ^build)
├── package.json                       # Workspaces: apps/*, packages/*, scripts: dev, build
├── README.md                          # Cara jalan, struktur, atribusi TMDB
└── AGENTS.md                          # Aturan kerja AI (file ini dirujuk)
```

---

## 4. Arsitektur & Data Flow

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  Browser    │──────▶│  Next.js    │──────▶│  Nest.js    │──────▶│   TMDB      │
│  (React)    │  HTTP │  (apps/web) │  HTTP │  (apps/api) │  HTTPS│   API       │
└─────────────┘       └─────────────┘       └──────┬──────┘       └─────────────┘
                                                   │
                                                   ▼
                                            ┌─────────────┐
                                            │  Prisma     │
                                            │  (packages/ │
                                            │   db)       │
                                            └──────┬──────┘
                                                   │
                                                   ▼
                                            ┌─────────────┐
                                            │ PostgreSQL  │
                                            │  (lokal)    │
                                            └─────────────┘
```

**Alur End-to-End (Contoh: User buka halaman detail film)**

1. Browser request `GET /movies/123` ke Next.js (App Router)
2. `app/movies/[id]/page.tsx` (RSC) → `fetch(`${API_URL}/movies/123`)` + `fetch(`${API_URL}/movies/123/videos`)` paralel (`cache: "no-store"`)
3. Nest.js `MoviesController.getMovieDetails(123)` → `TmdbService.getMovieDetails(123)`
4. `TmdbService` cek cache → miss → `fetch https://api.themoviedb.org/3/movie/123?api_key=...`
5. TMDB balas JSON → Nest return ke Next → Next render HTML (detail + trailer iframe YouTube)
6. Browser terima HTML → hydrate client components (kalau ada)

**Alur End-to-End (Contoh: User search film)**

1. User ketik di `SearchBar` (client component) → `inputValue` state update
2. Debounce 400ms → `router.replace("/?q=...&page=1")` (hapus genre, reset page)
3. Next.js server receive `searchParams` → `page.tsx` parse `q`, `page`
4. `hasQuery` true → `searchMovies(q, page)` → `fetch(`${API_URL}/movies/search?q=...&page=...`)`
5. Nest `MoviesController.searchMovies` → `TmdbService.searchMovies` → TMDB API
6. Response → Next render grid + pagination dengan `q` preserved

**Pola arsitektur**:
- **Monorepo Turborepo**: 3 workspace, shared `@repo/db` (Prisma client)
- **BFF-ish**: Next.js sebagai BFF, proxy ke Nest.js, Nest.js proxy ke TMDB (API key aman di server)
- **Server Components by default**: Data fetching di server, client component hanya untuk interaktivitas (SearchBar)
- **In-memory cache**: `TmdbService` cache popular (5 menit, max 100 entry) & genres (24 jam) → hemat kuota TMDB

---

## 5. Entry Points & Startup Flow

### apps/api (Nest.js)
1. `main.ts` → `NestFactory.create(AppModule)`
2. `AppModule` imports: `ConfigModule.forRoot({isGlobal:true, envFilePath:'../../.env'})`, `TmdbModule`, `MoviesModule`, `GenresModule`
3. `ConfigModule` load `.env` dari root → `process.env.PORT`, `TMDB_API_KEY`, `DATABASE_URL`
4. `TmdbModule` provide `TmdbService` (constructor inject `ConfigService` → validasi `TMDB_API_KEY`)
5. Controllers register routes: `/`, `/health`, `/movies/*`, `/genres`
6. `app.listen(process.env.PORT ?? 3001)`

### apps/web (Next.js)
1. `next dev` → load `next.config.ts` (images config)
2. `app/layout.tsx` → root layout, load `globals.css` (Tailwind), font Geist
3. `app/page.tsx` (RSC) → `await searchParams` → fetch data (genres + movies) → render HTML
4. Client components (`SearchBar`) hydrate di browser

### packages/db (Prisma)
1. `prisma.config.ts` → `dotenv.config({path: '../../.env'})` → `defineConfig({schema, migrations, datasource})`
2. `db:generate` → `prisma generate` → output ke `generated/prisma`
3. `db:migrate` → `prisma migrate dev` → apply ke PostgreSQL

---

## 6. Modul / Fitur

| Modul | Path | Fungsi | File Kunci | Dependensi |
|-------|------|--------|------------|------------|
| **TMDB Core** | `apps/api/src/tmdb/` | Proxy TMDB API, caching in-memory | `tmdb.service.ts`, `tmdb.module.ts` | `@nestjs/config` |
| **Movies API** | `apps/api/src/movies/` | Endpoint film: popular, search, discover, detail, videos | `movies.controller.ts`, `movies.module.ts` | `TmdbModule` |
| **Genres API** | `apps/api/src/genres/` | Endpoint daftar genre | `genres.controller.ts`, `genres.module.ts` | `TmdbModule` |
| **Health** | `apps/api/src/health.controller.ts` | Health check | `health.controller.ts` | - |
| **Home Page** | `apps/web/app/page.tsx` | RSC: fetch genres, movies (popular/search/discover), render grid + pagination | `page.tsx` | API_URL env |
| **Movie Detail** | `apps/web/app/movies/[id]/page.tsx` | RSC: fetch detail + videos paralel, pick trailer, render | `page.tsx` | API_URL env |
| **SearchBar** | `apps/web/app/components/SearchBar.tsx` | Client: debounced input, sync URL (q, page, genre) | `SearchBar.tsx` | `next/navigation` |
| **GenreFilter** | `apps/web/app/components/GenreFilter.tsx` | Link buttons filter genre, highlight active | `GenreFilter.tsx` | - |
| **Pagination** | `apps/web/app/components/Pagination.tsx` | Prev/Next, build href preserve q/genre | `Pagination.tsx` | - |
| **MovieCard** | `apps/web/app/components/MovieCard.tsx` | Poster (next/image), title, rating, link | `MovieCard.tsx` | `next/image`, `next/link` |
| **Prisma Client** | `packages/db/src/client.ts` | PrismaClient singleton dengan adapter PostgreSQL | `client.ts`, `index.ts` | `@prisma/adapter-pg`, `@prisma/client` |
| **DB Schema** | `packages/db/prisma/schema.prisma` | Model User (id, email@unique, passwordHash, createdAt) | `schema.prisma` | - |

---

## 7. Key File Interconnections

```
┌─────────────────────┐
│   apps/api/src/     │
│   main.ts           │◀── Entry point
└─────────┬───────────┘
          │ imports
          ▼
┌─────────────────────┐
│   app.module.ts     │◀── Root module (SOUTH AUTH CONFIG)
│   - ConfigModule    │
│   - TmdbModule      │
│   - MoviesModule    │
│   - GenresModule    │
└─────────┬───────────┘
          │ imports
    ┌─────┴─────┐
    ▼           ▼
┌─────────┐ ┌─────────┐
│TmdbModule│ │MoviesMod│
│         │ │         │
│TmdbService◀──┐      │
└─────────┘     │      │
                │      ▼
          ┌─────┴─────┐
          │GenresMod  │
          │           │
          │GenresCtrl │
          └───────────┘
                │
                ▼
    ┌─────────────────────┐
    │ packages/db/prisma/ │
    │ schema.prisma       │◀── DB SOURCE OF TRUTH (User model)
    └─────────────────────┘
```

**Source of Truth**:
- **Auth**: belum ada (rencana: JWT di `apps/api/src/auth/`)
- **State (FE)**: URL searchParams (q, page, genre) → `SearchBar` sync, `Pagination` preserve
- **API**: Nest.js controllers → `TmdbService` → TMDB REST
- **Database**: `packages/db/prisma/schema.prisma` → `prisma migrate dev` → PostgreSQL

---

## 8. Database

### Schema (packages/db/prisma/schema.prisma)
```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id           Int      @id @default(autoincrement())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
}
```

### Model Rencana (dari PRD) — **belum diimplementasikan**
```prisma
model WatchlistItem {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tmdbId    Int
  title     String
  posterPath String?
  createdAt DateTime @default(now())
  @@unique([userId, tmdbId])
}
```

### Migrasi & Seed
- **Generate**: `bun --filter @repo/db run db:generate` → `prisma generate`
- **Migrate**: `bun --filter @repo/db run db:migrate` → `prisma migrate dev` (interaktif, bikin migration file di `prisma/migrations/`)
- **Seed**: **belum ada** (PRD tidak sebut seed script)

### ERD (Current + Planned)
```
┌─────────────┐       ┌────────────────────┐
│    User     │       │  WatchlistItem     │
├─────────────┤       ├────────────────────┤
│ id (PK)     │◀──────│ id (PK)            │
│ email (UQ)  │       │ userId (FK) ───────┤
│ passwordHash│       │ tmdbId             │
│ createdAt   │       │ title              │
└─────────────┘       │ posterPath         │
                      │ createdAt          │
                      └────────────────────┘
                      Unique: (userId, tmdbId)
```

---

## 9. API

### Endpoint Internal (Nest.js → TMDB Proxy)

| Method | Endpoint | Fungsi | Auth | Request | Response (ringkas) | Dipakai oleh |
|--------|----------|--------|------|---------|-------------------|--------------|
| GET | `/health` | Health check | ❌ | - | `{status:"ok"}` | Monitoring, README |
| GET | `/movies/popular` | Film populer | ❌ | `page` (1-500, default 1) | TMDB response (results[], total_pages) | Home page |
| GET | `/movies/search` | Cari film | ❌ | `q` (1-100 char), `page` (1-500) | TMDB response | Home page (search) |
| GET | `/movies/discover` | Film by genre | ❌ | `genre` (1-99999), `page` (1-500) | TMDB response | Home page (genre filter) |
| GET | `/movies/:id` | Detail film | ❌ | `id` (positive int) | TMDB movie detail | Detail page |
| GET | `/movies/:id/videos` | Video/Trailer | ❌ | `id` (positive int) | TMDB videos (results[]) | Detail page (trailer) |
| GET | `/genres` | Daftar genre | ❌ | - | `{genres: [{id,name}]}` | Home page (GenreFilter) |

### Validasi Input (MoviesController)
- `page`: integer 1-500
- `q`: trim, max 100 char, tidak boleh kosong/spasi
- `genre`: integer 1-99999
- `id`: positive integer

### Error Handling
- TMDB 404 → `NotFoundException` ("Film tidak ditemukan")
- TMDB non-2xx → `BadGatewayException` ("Gagal mengambil ... dari TMDB")
- Validasi gagal → `BadRequestException` (pesan spesifik)

### Integrasi Eksternal
- **TMDB API v3**: `https://api.themoviedb.org/3/...`
  - Key: `TMDB_API_KEY` (hanya di server, lewat `ConfigService`)
  - Endpoints dipakai: `/movie/popular`, `/movie/{id}`, `/movie/{id}/videos`, `/search/movie`, `/genre/movie/list`, `/discover/movie`
- **YouTube Embed**: `https://www.youtube-nocookie.com/embed/{key}` (dari TMDB video key, validasi regex 11 char)

---

## 10. Frontend

### Route / Halaman
| Route | Type | Deskripsi |
|-------|------|-----------|
| `/` | Server Component | Home: SearchBar, GenreFilter, MovieGrid, Pagination |
| `/movies/[id]` | Server Component | Detail: poster, info, genre, sinopsis, trailer iframe |
| `/movies/[id]/not-found` | Server Component | 404 custom |

### Layout & Middleware
- **Root Layout** (`app/layout.tsx`): HTML, body, Geist font, metadata, `globals.css`
- **Middleware**: **belum ada** (Next.js middleware untuk auth protection nanti)
- **Protected Route**: **belum ada** (watchlist page butuh auth)

### Komponen Reusable Penting
| Komponen | Path | Tipe | Props Kunci | Catatan |
|----------|------|------|-------------|---------|
| `MovieCard` | `components/MovieCard.tsx` | Server | `movie: Movie`, `eager?: boolean` | `next/image` lazy/eager, link ke detail |
| `SearchBar` | `components/SearchBar.tsx` | **Client** (`"use client"`) | - | Debounce 400ms, sync URL, clear btn |
| `GenreFilter` | `components/GenreFilter.tsx` | Server | `genres`, `currentGenreId?`, `hasQuery` | Link buttons, highlight active |
| `Pagination` | `components/Pagination.tsx` | Server | `page`, `totalPages`, `q?`, `genre?` | Prev/Next, build href preserve params |

### State Management
- **Server State**: URL searchParams (`q`, `page`, `genre`) → single source of truth
- **Client State**: `SearchBar` → `inputValue` (local), debounce → `router.replace()`
- **No global store** (Zustand/Redux/Context) — URL-driven state

### Data Fetching
- **Pattern**: Server Components dengan `fetch(..., {cache: "no-store"})` di setiap page
- **Parallel**: `Promise.all([getMovieDetail(id), getMovieVideos(id)])` di detail page
- **Error Handling**: Return `{ok:false, notFound:true}` → `notFound()` / render error UI dengan link kembali
- **API Base**: `process.env.API_URL ?? "http://localhost:3001"`

### Styling
- **Tailwind CSS v4**: `@import "tailwindcss"` di `globals.css`
- **Dark mode default**: `:root` vars + `@media (prefers-color-scheme: dark)`
- **Color palette**: `zinc-950` bg, `zinc-900` card, `amber-400` accent, `white/10` ring

---

## 11. Auth & Authorization

**Status: BELUM ADA** (Rencana Sprint 3-4 per PRD)

### Rencana dari PRD (CINE-22..27)
| Fitur | Endpoint | Detail |
|-------|----------|--------|
| Register | `POST /auth/register` | Hash password (bcrypt/argon2), email unique |
| Login | `POST /auth/login` | Return JWT (access token) |
| Me | `GET /auth/me` | Guard: JWT valid → return user profile |
| Watchlist CRUD | `GET/POST/DELETE /watchlist` | Guard: hanya user login, own data |

### Implementasi yang Diharapkan
- `apps/api/src/auth/` module: `AuthService`, `JwtStrategy`, `AuthGuard`, `AuthController`
- `JWT_SECRET` di `.env`
- `passport-jwt` + `@nestjs/jwt`
- Password hash: `bcrypt` atau `argon2`
- FE: Login/Register page, token simpan di httpOnly cookie atau localStorage, attach ke API request

---

## 12. Environment & Infra

### Environment Variables
| Nama | Fungsi | Dipakai Di |
|------|--------|------------|
| `PORT` | Port Nest.js server (default 3001) | `apps/api/src/main.ts` |
| `DATABASE_URL` | PostgreSQL connection string | `packages/db/prisma.config.ts`, `packages/db/src/client.ts` |
| `TMDB_API_KEY` | TMDB API key (server only) | `apps/api/src/tmdb/tmdb.service.ts` |
| `API_URL` | Base URL Nest API (default localhost:3001) | `apps/web/app/page.tsx`, `apps/web/app/movies/[id]/page.tsx` |
| `JWT_SECRET` | **Belum dipakai** (rencana auth) | `apps/api/src/auth/` (nanti) |

### Docker / Infra
- **Docker Compose**: **Belum ada** (PRD CINE-3: task Docker Compose untuk PostgreSQL)
- **PostgreSQL**: Lokal (versi 16+), manual create DB `cindo`
- **Ports**: Web 3000, API 3001, DB 5432

### Service Pendukung
- **TMDB API**: External, rate limit 40 req/10s (mitigasi: cache in-memory di `TmdbService`)
- **YouTube-nocookie**: Embed trailer iframe (no tracking cookies)

---

## 13. Konvensi & Pola

### Naming & Struktur File
- **API**: Nest.js convention — `*.controller.ts`, `*.service.ts`, `*.module.ts`, `*.spec.ts`
- **FE**: Next.js App Router — `page.tsx` (Server Component), `components/*.tsx` (PascalCase)
- **Prisma**: `schema.prisma` (snake_case table, camelCase field), model PascalCase singular
- **Import alias**: `@/*` di web (`tsconfig.json` paths), **tidak ada** di api (relative import dengan `.js` extension)

### Import Rules (API - ESM)
```typescript
// WAJIB pakai .js extension untuk import lokal
import { AppModule } from './app.module.js';
import { TmdbService } from '../tmdb/tmdb.service.js';
```

### Error Handling
- **API**: Nest.js built-in exceptions (`BadRequestException`, `NotFoundException`, `BadGatewayException`)
- **FE**: Try-catch di fetch helper → return `{ok, data|notFound|message}` → page handle `notFound()` atau render error UI

### Validasi
- **API**: Nest.js pipes (`ParseIntPipe`, `DefaultValuePipe`) + manual check di controller
- **FE**: Input `maxLength=100`, parse/validate di `page.tsx` (`parsePage`, `parseQuery`, `parseGenreId`)

### Lint & Format
- **API**: `oxlint` (fast), `prettier` → `bun run lint`, `bun run format`
- **Web**: `eslint` (Next.js config) → `bun run lint`

### Test Structure
- **API**: Vitest, `*.spec.ts` co-located, `vitest.config.ts` dengan `vite-tsconfig-paths`
- **E2E**: `vitest.config.e2e.ts`, `test/app.e2e-spec.ts`
- **Web**: **Belum ada** test (Next.js testing setup belum)

### Hal yang SELALU dilakukan
- ✅ Import lokal di API pakai `.js` extension (ESM)
- ✅ TMDB API key hanya di server (`ConfigService`)
- ✅ Cache TMDB response in-memory (`TmdbService`)
- ✅ Server Component default, client component hanya kalau butuh interaktivitas
- ✅ URL searchParams sebagai state utama (q, page, genre)
- ✅ `cache: "no-store"` di semua fetch ke API (data selalu fresh)
- ✅ Validasi input ketat di controller (page range, q length, id positive)

### Hal yang JANGAN dilakukan
- ❌ Jangan kirim `TMDB_API_KEY` ke browser
- ❌ Jangan simpan password plaintext (belum ada auth tapi konvensi: hash)
- ❌ Jangan pakai `&&` di shell (PowerShell pakai `;`)
- ❌ Jangan commit `.env` (sudah di `.gitignore`)
- ❌ Jangan ubah `packages/db/prisma/schema.prisma` tanpa generate + migrate
- ❌ Jangan pakai `head`, `cat`, `ls -la` di shell (pakai PowerShell equivalent)

---

## 14. Cara Menjalankan

### Prasyarat
- Bun 1.4.0+, Node.js, Git, PostgreSQL 16+ (lokal, DB `cindo` sudah dibuat)

### Dari Nol (Fresh Clone)
```powershell
# 1. Install deps (root + semua workspace)
bun install

# 2. Setup env
Copy-Item .env.example .env
# Edit .env: ganti GANTI_PASSWORD di DATABASE_URL dengan password PostgreSQL lokal
# Isi TMDB_API_KEY dari https://www.themoviedb.org/settings/api

# 3. Generate Prisma Client
bun --filter @repo/db run db:generate

# 4. Run migration (buat tabel User)
bun --filter @repo/db run db:migrate

# 5. Jalankan dev (API + Web bersamaan via Turbo)
bun run dev
```

### Akses
- **Web**: http://localhost:3000
- **API**: http://localhost:3001
- **Health**: http://localhost:3001/health → `{"status":"ok"}`

### Command Per Workspace
```powershell
# API only
cd apps/api
bun run dev          # nest start --watch
bun run build        # nest build
bun run test         # vitest run
bun run test:e2e     # vitest run --config vitest.config.e2e.ts
bun run lint         # oxlint src/ test/

# Web only
cd apps/web
bun run dev          # next dev
bun run build        # next build
bun run start        # next start
bun run lint         # eslint

# DB only
cd packages/db
bun run db:generate  # prisma generate
bun run db:migrate   # prisma migrate dev
```

### Build Production
```powershell
bun run build        # turbo run build (build api → build web)
```

---

## 15. Gotchas (BAGIAN PALING PENTING)

| # | Gotcha | Penjelasan & Workaround |
|---|--------|------------------------|
| 1 | **ESM di API wajib `.js` extension** | Nest.js pakai `"type": "module"` di `package.json`. Import lokal **harus** `.js` (contoh: `./app.module.js`). Lupa → `ERR_MODULE_NOT_FOUND`. |
| 2 | **TMDB API key hanya di server** | `TmdbService` inject `ConfigService` → baca `process.env.TMDB_API_KEY`. Jangan pernah expose ke FE. Kalau key invalid → `TmdbService` throw Error di constructor. |
| 3 | **In-memory cache bukan persistent** | `TmdbService.popularCache` (Map) & `genresCache` hilang saat restart API. Cukup untuk dev, tapi production butuh Redis. |
| 4 | **Cache TTL hardcoded** | Popular: 5 menit (`POPULAR_CACHE_TTL_MS`), Genres: 24 jam (`GENRES_CACHE_TTL_MS`). Ubah di `tmdb.service.ts` kalau butuh tuning. |
| 5 | **SearchBar debounce 400ms + URL sync** | `SearchBar` pakai `router.replace()` → trigger navigation → `page.tsx` re-fetch. Jangan tambah state management lain (Redux/Zustand) — URL sudah SSOT. |
| 6 | **Genre filter reset saat search** | Di `Pagination.buildHref` & `SearchBar`: kalau `q` ada → `genre` dihapus. Kalau `genre` aktif → `q` dihapus. Logika di `page.tsx`: `activeGenreId = hasQuery ? undefined : validGenreId`. |
| 7 | **Pagination preserve params** | `Pagination.buildHref` bikin `URLSearchParams` dengan urutan: `q` → `genre` → `page` (kalau >1). Jangan ubah tanpa update `SearchBar` & `page.tsx` parse logic. |
| 8 | **Prisma output ke `generated/prisma`** | `schema.prisma`: `output = "../generated/prisma"`. Client import dari `@prisma/client` tapi generate ke folder custom. `packages/db/src/client.ts` import dari `../generated/prisma/client`. |
| 9 | **DATABASE_URL di `.env` root** | `prisma.config.ts` load `dotenv.config({path: '../../.env'})`. `packages/db/src/client.ts` pakai `process.env.DATABASE_URL` langsung. Pastikan `.env` ada di root. |
| 10 | **Next.js 16 App Router + RSC default** | Semua `page.tsx` = Server Component. Kalau butuh `useSearchParams`, `useRouter` → bikin file terpisah `"use client"` (seperti `SearchBar`). |
| 11 | **Image domain config** | `next.config.ts` hanya allow `image.tmdb.org/t/p/**`. Kalau mau domain lain → tambah ke `remotePatterns`. |
| 12 | **No auth = no protected route** | Semua endpoint API & halaman FE publik. Auth & watchlist **belum ada**. Jangan tambah guard/middleware tanpa implement auth dulu. |
| 13 | **Watchlist model belum di schema** | PRD punya `WatchlistItem` tapi `schema.prisma` cuma `User`. Kalau mau implement watchlist: tambah model → `db:migrate` → bikin API → bikin UI. |
| 14 | **Turbo pipeline: build dependsOn ^build** | `turbo.json`: `build` dependsOn `["^build"]` → build `packages/db` dulu (generate client), baru `apps/api`, `apps/web`. Jangan jalankan `bun run build` di subfolder langsung kalau deps belum di-build. |
| 15 | **PowerShell only** | Semua command pakai `;` bukan `&&`. Contoh: `bun install; bun run dev`. Jangan pakai `head`, `cat`, `ls -la`. |
| 16 | **Secret di log/error** | `TmdbService` throw Error kalau `TMDB_API_KEY` kosong → message "TMDB_API_KEY belum diisi di .env". **Jangan** log key-nya. Error handling di controller return generic message. |
| 17 | **Git log singkat** | `git log -n 30 --oneline` cukup. History linear dengan merge commit (PR workflow). |
| 18 | **Test command: `bun run test` bukan `bun test`** | `apps/api/package.json`: `"test": "vitest run"`. Selalu pakai script `test` dari package.json. |

---

## 16. Panduan Modifikasi untuk AI

### ✅ Aman Diubah (Low Risk)
| Folder/File | Alasan |
|-------------|--------|
| `apps/web/app/components/` | Komponen UI isolated, props typed, tidak ada side effect |
| `apps/web/app/page.tsx` | Server component, logic fetch & render jelas |
| `apps/web/app/movies/[id]/page.tsx` | Server component, error handling lengkap |
| `apps/api/src/tmdb/tmdb.service.ts` | Cache logic isolated, mudah test |
| `apps/api/src/movies/movies.controller.ts` | Validation & delegasi ke service, thin |
| `apps/api/src/genres/genres.controller.ts` | Simple pass-through ke service |
| `docs/prd.md` | Dokumentasi, tidak affect runtime |

### ⚠️ Risiko Sedang (Perlu Hati-hati)
| Folder/File | Alasan |
|-------------|--------|
| `apps/api/src/app.module.ts` | Tambah module baru (misal `AuthModule`) → harus import di sini + provide guard global kalau perlu |
| `packages/db/prisma/schema.prisma` | **Wajib** `db:generate` + `db:migrate` setelah ubah. Breaking change ke API kalau model dipakai. |
| `apps/api/src/main.ts` | Global prefix, CORS, validation pipe — ubah affect semua endpoint |
| `apps/web/next.config.ts` | Image domain, rewrite, header — affect semua halaman |
| `apps/web/app/layout.tsx` | Global layout, font, metadata — affect semua halaman |
| `turbo.json` | Pipeline config — salah ubah → build/dev gagal atau tidak optimal |

### 🚫 Jangan Sentuh Tanpa Alasan Kuat (High Risk)
| Folder/File | Alasan |
|-------------|--------|
| `packages/db/src/client.ts` | PrismaClient singleton. Ubah → affect semua query DB. Adapter `PrismaPg` butuh `DATABASE_URL` valid. |
| `packages/db/prisma.config.ts` | Prisma config internal. Ubah → migrate/generate gagal. |
| `apps/api/src/tmdb/tmdb.service.ts` **constructor** | Validasi `TMDB_API_KEY` di sini. Hapus → crash startup kalau key kosong. |
| `apps/web/app/components/SearchBar.tsx` **debounce & URL sync logic** | Logic kompleks (ref, useEffect, race condition handling). Ubah → search broken, infinite loop, URL out of sync. |
| `.env` / `.env.example` | Secret & config. Jangan commit `.env`. `.env.example` update hanya kalau tambah env var baru. |
| `package.json` (root & workspaces) | Dependency, scripts, workspaces. Salah ubah → install/build gagal. |

### 📝 Resep Modifikasi Umum

#### Tambah Endpoint API Baru
1. Bikin `feature.module.ts` + `feature.controller.ts` + `feature.service.ts` di `apps/api/src/feature/`
2. Inject service yang butuh (misal `TmdbService` atau `PrismaService` nanti)
3. Daftar di `app.module.ts` imports
4. Tambah test di `*.spec.ts`
5. `bun --filter api run test` → `bun --filter api run build`

#### Tambah Halaman FE Baru
1. Bikin `app/nama-halaman/page.tsx` (Server Component default)
2. Kalau butuh interaktivitas → bikin `components/NamaKomponen.tsx` dengan `"use client"`
3. Fetch data pakai `fetch(`${API_URL}/...`, {cache: "no-store"})`
4. Handle error → `notFound()` atau render fallback UI
5. `bun --filter web run build` → cek error TypeScript

#### Ubah Schema Database
1. Edit `packages/db/prisma/schema.prisma`
2. `bun --filter @repo/db run db:migrate` (interaktif, kasih nama migration)
3. `bun --filter @repo/db run db:generate`
4. Update API service/controller yang pakai model tsb
5. `bun run build` (root) → pastikan semua workspace compile

#### Tambah Auth (JWT)
1. `bun --filter api add @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt`
2. Bikin `apps/api/src/auth/` module lengkap (service, strategy, guard, controller, module)
3. Tambah `JWT_SECRET` ke `.env.example` & `.env`
4. Protect route: `@UseGuards(JwtAuthGuard)` di controller
5. FE: Login page, simpan token, attach ke fetch (Authorization header)

---

## 17. Status Proyek

### ✅ Sudah Jalan (Done)
- [x] Monorepo Turborepo + Bun setup
- [x] Nest.js API dengan modular structure (Tmdb, Movies, Genres)
- [x] TMDB Service dengan in-memory cache (popular 5m, genres 24h)
- [x] Endpoint: `/health`, `/movies/popular`, `/movies/search`, `/movies/discover`, `/movies/:id`, `/movies/:id/videos`, `/genres`
- [x] Validasi input ketat di controller
- [x] Next.js 16 App Router dengan Server Components
- [x] Home page: grid film, search bar (debounced), genre filter, pagination
- [x] Movie detail page: poster, info, genre, sinopsis, trailer YouTube embed
- [x] Tailwind CSS v4 dark mode default
- [x] Prisma setup: User model, migration, client generation
- [x] README & PRD lengkap

### 🔄 WIP / Setengah Jadi
- [ ] **Auth module** (register, login, JWT, guard) — PRD CINE-22..24
- [ ] **Watchlist** (model, migration, API, UI) — PRD CINE-25..27
- [ ] **Docker Compose** untuk PostgreSQL — PRD CINE-3
- [ ] **Test di FE** (unit/integration) — belum ada setup

### 📋 TODO / Belum Dikerjakan
- [ ] Register & Login page (FE)
- [ ] Watchlist page & tombol add/remove di MovieCard & Detail
- [ ] Protected route middleware (Next.js)
- [ ] Loading skeleton & error state improvement (PRD CINE-29)
- [ ] TMDB attribution di footer (PRD CINE-30)
- [ ] Player film legal (Bonus, PRD CINE-31)
- [ ] Dockerfile untuk web & api (Bonus, PRD CINE-32)
- [ ] Seed script untuk DB

### 🐛 Bug, Tech Debt, Risiko
| Item | Status | Detail |
|------|--------|--------|
| In-memory cache tidak persistent | Tech Debt | Restart API → cache hilang. Production butuh Redis. |
| No rate limiting di API | Risiko | User bisa spam request → TMDB rate limit kena. Perlu `@nestjs/throttler`. |
| No input sanitization di TMDB service | Tech Debt | Langsung interpolasi ke URL. Aman karena `ParseIntPipe` & validasi manual, tapi better pakai `URLSearchParams`. |
| SearchBar kompleks, rawan bug | Tech Debt | 160 baris, banyak `useRef`/`useEffect`. Kalau tambah fitur (misal history) → pertimbangkan extract hook. |
| Prisma adapter `PrismaPg` butuh `@prisma/adapter-pg` | Catatan | Bukan default `PrismaClient`. Kalau migrasi ke provider lain → ganti adapter. |
| `TMDB_API_KEY` validasi di constructor | Tech Debt | Throw Error sync → crash startup. Better: `onModuleInit` async validation. |
| No global error filter di Nest | Tech Debt | Error response format tidak konsisten. Perlu `@nestjs/common` `ExceptionFilter`. |
| FE tidak ada test | Risiko | Regression risk kalau refactor komponen. |
| `packages/db` tidak dipakai di API yet | Tech Debt | API pakai TMDB langsung, belum pakai Prisma/User. Auth & watchlist butuh ini. |