Konteks proyek. Pahami dulu sebelum ngerjain task. Kalau info kurang, tanya, jangan berasumsi.

# Cindo — AI Context (Max 80 Lines)

## Stack
- **FE**: Next.js 16 (App Router, RSC), React 19, Tailwind 4
- **BE**: Nest.js 12, TypeScript ESM (import `.js` wajib)
- **DB**: PostgreSQL lokal + Prisma 7 (package `@repo/db`)
- **Tooling**: Bun, Turborepo, Vitest, Oxlint/ESLint

## Struktur Monorepo
```
apps/api      → Nest.js (port 3001)
apps/web      → Next.js (port 3000)
packages/db   → Prisma schema & client
docs/         → PRD & backlog
```

## Arsitektur & Data Flow
Browser → Next.js (RSC fetch `cache:no-store`) → Nest.js → TMDB API (server-only key)
                                    ↓
                              Prisma ORM → PostgreSQL (User only saat ini)

## Key Files (Source of Truth)
- **API Entry**: `apps/api/src/main.ts` → `AppModule` (ConfigModule global, TmdbModule, MoviesModule, GenresModule)
- **TMDB Core**: `apps/api/src/tmdb/tmdb.service.ts` — in-memory cache (popular 5m, genres 24h), **hanya tempat TMDB_API_KEY dipakai**
- **Movies API**: `apps/api/src/movies/movies.controller.ts` — GET popular/search/discover/:id/:id/videos
- **Genres API**: `apps/api/src/genres/genres.controller.ts` — GET /genres
- **Home (RSC)**: `apps/web/app/page.tsx` — fetch genres + movies, render grid + SearchBar + GenreFilter + Pagination
- **Detail (RSC)**: `apps/web/app/movies/[id]/page.tsx` — fetch detail + videos paralel, pick YouTube trailer
- **SearchBar (Client)**: `apps/web/app/components/SearchBar.tsx` — debounce 400ms, sync URL (q, page, genre)
- **DB Schema**: `packages/db/prisma/schema.prisma` — User model only (watchlist belum)

## API Endpoints (Implemented)
| Method | Path | Auth |
|--------|------|------|
| GET | /health | ❌ |
| GET | /movies/popular?page= | ❌ |
| GET | /movies/search?q=&page= | ❌ |
| GET | /movies/discover?genre=&page= | ❌ |
| GET | /movies/:id | ❌ |
| GET | /movies/:id/videos | ❌ |
| GET | /genres | ❌ |

## Env Vars (Nama + Fungsi)
- `PORT=3001` — API port
- `DATABASE_URL` — Postgres connection (root .env)
- `TMDB_API_KEY` — TMDB key (server only)
- `API_URL` — FE call BE (default localhost:3001)

## Gotchas Krusial
1. **API ESM**: import lokal **wajib** `.js` extension
2. **TMDB key**: hanya di server (`TmdbService` constructor), jangan expose ke FE
3. **Cache**: in-memory Map, hilang saat restart (dev OK, prod butuh Redis)
4. **State FE**: URL searchParams (q, page, genre) = SSOT. SearchBar debounce → `router.replace()`
5. **Genre vs Search**: mutual exclusive (search aktif → genre dihapus, sebaliknya)
6. **Pagination**: preserve q/genre params via `buildHref()`
7. **Prisma output**: `generated/prisma` (bukan default), client import dari situ
8. **No auth yet**: semua public. Auth & watchlist rencana Sprint 3-4
9. **PowerShell only**: pakai `;` bukan `&&`, no `head`/`cat`/`ls -la`
10. **Test**: `bun run test` (vitest), bukan `bun test`

## Panduan Modifikasi Cepat
| Task | File Utama yang Disentuh |
|------|-------------------------|
| Tambah endpoint API | `apps/api/src/<feature>/*.ts` + `app.module.ts` |
| Tambah halaman FE | `apps/web/app/<route>/page.tsx` (+ client component kalau butuh interaksi) |
| Ubah schema DB | `packages/db/prisma/schema.prisma` → `db:migrate` → `db:generate` |
| Tambah auth | Buat `apps/api/src/auth/` + JWT_SECRET env + FE login page + guard |

## Status
- ✅ Sprint 1-2: Setup, Katalog, Detail, Search, Genre Filter
- 🔄 Sprint 3-4: Auth, Watchlist, Polish (BELUM)
- ⚠️ Tech Debt: Cache non-persistent, no rate limit, SearchBar kompleks, no FE test