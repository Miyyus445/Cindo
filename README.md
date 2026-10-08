# Cindo (CINema INDO)

Website katalog film legal. Data film berasal dari TMDB API, bukan dari situs bajakan.
Dibuat sebagai proyek bulanan sambil belajar fullstack.

> Status: dalam pengembangan (Sprint 1)

## Fitur (rencana)

- Daftar film populer, detail film, dan trailer
- Pencarian dan filter genre
- Register, login, dan watchlist pribadi

## Tech Stack

- **Frontend:** Next.js, Tailwind CSS
- **Backend:** Nest.js
- **Database:** PostgreSQL (Docker) + Prisma ORM
- **Tooling:** Bun, Turborepo, TypeScript

## Struktur Project

```
apps/web       -> Next.js (frontend)
apps/api       -> Nest.js (backend)
packages/db    -> Prisma schema & client
docs/          -> PRD dan backlog
```
## Cara Menjalankan

Prasyarat: Bun, Node, Git.

```bash
git clone <url-repo>
cd Cindo
bun install
bun run dev
```

- Web (Next.js): http://localhost:3000
- API (Nest): http://localhost:3001
- Cek API: http://localhost:3001/health (balas `{"status":"ok"}`)

Docker dan database akan ditambahkan di SCRUM-106/107.

## Dokumentasi

- [PRD & rencana fitur](docs/prd.md)
- [Backlog Jira (CSV)](docs/jira-import-backlog.csv)

## Atribusi

This product uses the TMDB API but is not endorsed or certified by TMDB.