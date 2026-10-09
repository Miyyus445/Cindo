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
- **Database:** PostgreSQL (Lokal) + Prisma ORM
- **Tooling:** Bun, Turborepo, TypeScript

## Struktur Project

```
apps/web       -> Next.js (frontend)
apps/api       -> Nest.js (backend)
packages/db    -> Prisma schema & client
docs/          -> PRD dan backlog
```
## Cara Menjalankan

Prasyarat: Bun, Node, Git, PostgreSQL (versi 16 atau lebih baru).

1. Clone repo:

```bash
git clone <url-repo>
cd Cindo
```

2. Buat database bernama `cindo` di PostgreSQL lokal.
3. Salin `.env.example` menjadi `.env`, lalu ganti `GANTI_PASSWORD` dengan password PostgreSQL lokal kamu.
4. Install dependency dan jalankan:

```bash
bun install
bun run dev
```

- Web (Next.js): http://localhost:3000
- API (Nest): http://localhost:3001
- Cek API: http://localhost:3001/health (balas `{"status":"ok"}`)

Prisma ditambahkan di SCRUM-107.

## Dokumentasi

- [PRD & rencana fitur](docs/prd.md)
- [Backlog Jira (CSV)](docs/jira-import-backlog.csv)

## Atribusi

This product uses the TMDB API but is not endorsed or certified by TMDB.