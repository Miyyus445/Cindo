# Cindo

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

apps/web       -> Next.js (frontend)
apps/api       -> Nest.js (backend)
packages/db    -> Prisma schema & client
docs/          -> PRD dan backlog

## Cara Menjalankan

Akan dilengkapi seiring development (lihat tiket SCRUM-109 dan SCRUM-136).

## Dokumentasi

- [PRD & rencana fitur](docs/prd.md)
- [Backlog Jira (CSV)](docs/jira-import-backlog.csv)

## Atribusi

This product uses the TMDB API but is not endorsed or certified by TMDB.