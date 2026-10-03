# PRD & Jira Backlog: Website Katalog Film Legal

> Nama project sementara: **CineKu** (ganti sesuka hati) Versi: 1.0 | Tipe: Proyek bulanan (belajar sambil membangun)

---

## 1. Latar Belakang

Situs nonton film ilegal (LK21, dll.) populer, tetapi melanggar hak cipta. Project ini membuat **alternatif legal** dengan pengalaman serupa: menelusuri katalog film, melihat detail, menonton trailer, dan menyimpan watchlist. Data berasal dari API resmi, bukan dari konten bajakan.

## 2. Tujuan

1. Membangun aplikasi fullstack yang berfungsi memakai stack kurikulum (Next.js, Nest.js, Prisma, PostgreSQL, Docker, Turborepo, Bun, TypeScript).
2. Memahami alur request-response dari frontend ke backend ke database.
3. Menghasilkan project yang bisa dijelaskan dan dipertanggungjawabkan di depan mentor.

## 3. Non-Goals (Tidak Dikerjakan)

- Tidak menyediakan atau men-host film berhak cipta tanpa izin.
- Tidak ada scraping situs bajakan.
- Tidak ada pembayaran/langganan.
- Tidak ada fitur sosial (komentar, rating pengguna) di versi 1.

## 4. Sumber Data & Konten

| Kebutuhan | Sumber |
| --- | --- |
| Katalog, poster, sinopsis, cast, genre | **TMDB API** (gratis untuk non-komersial) |
| Trailer | Embed **YouTube** (video key dari TMDB) |
| Film yang bisa diputar penuh (opsional) | Film open source Blender (Big Buck Bunny, Sintel, Tears of Steel) dan public domain Internet Archive |

**Wajib:** tampilkan atribusi TMDB (logo + teks "This product uses the TMDB API but is not endorsed or certified by TMDB") di footer.

## 5. Target Pengguna

- **Pengunjung (guest):** menelusuri, mencari, melihat detail dan trailer.
- **Pengguna terdaftar:** semua fitur guest + watchlist pribadi.

## 6. Fitur & Prioritas

| ID | Fitur | Prioritas |
| --- | --- | --- |
| F1 | Daftar film populer (grid + pagination) | Must |
| F2 | Halaman detail film (sinopsis, cast, genre, rating) | Must |
| F3 | Trailer YouTube di halaman detail | Must |
| F4 | Pencarian film | Must |
| F5 | Filter berdasarkan genre | Should |
| F6 | Register & login | Must |
| F7 | Watchlist (tambah, hapus, lihat) | Must |
| F8 | Player film legal (HLS/video) | Could |
| F9 | Dark mode, skeleton loading | Could |

## 7. Requirement Non-Fungsional

- API key TMDB **hanya** di server (Nest), tidak pernah terkirim ke browser.
- Password di-hash (bcrypt/argon2), tidak disimpan plaintext.
- Responsif (mobile dan desktop) dengan Tailwind.
- Response TMDB di-cache sederhana (in-memory) agar tidak boros kuota.
- Semua kode TypeScript, secret lewat `.env` (tidak masuk Git).

## 8. Arsitektur

```
[Browser] -> Next.js (apps/web) -> Nest.js (apps/api) -> TMDB API
                                          |
                                     Prisma ORM
                                          |
                                  PostgreSQL (Docker)
```

Struktur monorepo (Turborepo + Bun):

```
apps/web        # Next.js + Tailwind
apps/api        # Nest.js
packages/db     # Prisma schema & client
```

## 9. Model Data (Prisma)

**User:** `id`, `email` (unique), `passwordHash`, `createdAt`

**WatchlistItem:** `id`, `userId` (relasi ke User), `tmdbId`, `title`, `posterPath`, `createdAt` Constraint: unique `(userId, tmdbId)`

## 10. Endpoint API (Nest)

| Method | Path | Keterangan |
| --- | --- | --- |
| GET | `/health` | Cek status server |
| GET | `/movies/popular?page=` | Film populer (proxy TMDB) |
| GET | `/movies/search?q=&page=` | Cari film |
| GET | `/movies/:id` | Detail film |
| GET | `/movies/:id/videos` | Trailer |
| GET | `/genres` | Daftar genre |
| POST | `/auth/register` | Daftar |
| POST | `/auth/login` | Login (JWT) |
| GET | `/auth/me` | Profil user login |
| GET | `/watchlist` | Lihat watchlist |
| POST | `/watchlist` | Tambah ke watchlist |
| DELETE | `/watchlist/:tmdbId` | Hapus dari watchlist |

## 11. Risiko

| Risiko | Mitigasi |
| --- | --- |
| Tertinggal karena stack baru | Scope kecil, kerjakan per tahap, minta mentor review tiap sprint |
| Terlalu bergantung AI, tidak paham kode | Aturan: tiap fitur harus bisa dijelaskan ulang dengan kata sendiri |
| Limit/perubahan TMDB API | Caching + baca dokumentasi resmi |
| Konten ilegal masuk | Hanya pakai sumber di bagian 4 |

## 12. Definition of Done (per tiket)

- [ ] Fitur jalan sesuai acceptance criteria
- [ ] Tidak ada error di console/terminal
- [ ] Kode di-commit dengan pesan jelas (branch per tiket)
- [ ] Saya bisa menjelaskan cara kerjanya ke mentor

---

# Jira Backlog

**Skala story point:** 1 = sangat kecil, 2 = kecil, 3 = sedang, 5 = besar, 8 = sangat besar.

## Epic CINE-1: Setup & Fondasi (Sprint 1)

| Key | Tipe | Judul | Acceptance Criteria | SP |
| --- | --- | --- | --- | --- |
| CINE-2 | Task | Inisialisasi monorepo Turborepo + Bun | `bun run dev` dari root menjalankan web & api | 3 |
| CINE-3 | Task | Docker Compose untuk PostgreSQL | `docker compose up` membuat DB, kredensial dari `.env` | 2 |
| CINE-4 | Task | Setup Prisma + model User + migration awal | Migration sukses, tabel User terlihat di DB | 3 |
| CINE-5 | Task | Endpoint `/health` di Nest | Mengembalikan `{ status: "ok" }` | 1 |
| CINE-6 | Task | Setup `.env.example`, `.gitignore`, README dasar | `.env` tidak ter-commit, README berisi cara menjalankan | 1 |

## Epic CINE-7: Katalog Film (Sprint 2)

| Key | Tipe | Judul | Acceptance Criteria | SP |
| --- | --- | --- | --- | --- |
| CINE-8 | Story | Modul TMDB di Nest (service + config API key) | API key hanya dibaca server dari env | 3 |
| CINE-9 | Story | Endpoint `/movies/popular` | Mengembalikan daftar film + info halaman | 2 |
| CINE-10 | Story | Grid film di Next.js | Menampilkan poster, judul, rating; responsif | 3 |
| CINE-11 | Story | Pagination daftar film | Bisa pindah halaman tanpa reload penuh | 2 |
| CINE-12 | Task | Caching response TMDB | Request kedua ke resource sama tidak menembak TMDB | 2 |

## Epic CINE-13: Detail & Trailer (Sprint 2-3)

| Key | Tipe | Judul | Acceptance Criteria | SP |
| --- | --- | --- | --- | --- |
| CINE-14 | Story | Endpoint `/movies/:id` dan `/movies/:id/videos` | Data detail dan daftar trailer tersedia | 2 |
| CINE-15 | Story | Halaman detail film | Menampilkan sinopsis, genre, durasi, cast | 3 |
| CINE-16 | Story | Embed trailer YouTube | Trailer bisa diputar; ada fallback jika tidak ada trailer | 2 |

## Epic CINE-17: Pencarian & Filter (Sprint 3)

| Key | Tipe | Judul | Acceptance Criteria | SP |
| --- | --- | --- | --- | --- |
| CINE-18 | Story | Endpoint `/movies/search` | Query kosong ditangani, hasil dipaginasi | 2 |
| CINE-19 | Story | Search bar di UI (debounce) | Hasil muncul tanpa spam request | 3 |
| CINE-20 | Story | Endpoint `/genres` + filter genre di UI | Memilih genre memfilter daftar film | 3 |

## Epic CINE-21: Auth & Watchlist (Sprint 3-4)

| Key | Tipe | Judul | Acceptance Criteria | SP |
| --- | --- | --- | --- | --- |
| CINE-22 | Story | Register (hash password) | Email duplikat ditolak, password ter-hash di DB | 3 |
| CINE-23 | Story | Login + JWT | Login benar mengembalikan token, salah ditolak | 3 |
| CINE-24 | Story | Guard untuk route terproteksi + `/auth/me` | Tanpa token mendapat 401 | 2 |
| CINE-25 | Story | Model WatchlistItem + migration | Unique `(userId, tmdbId)` berlaku | 2 |
| CINE-26 | Story | Endpoint watchlist (GET/POST/DELETE) | Hanya milik user yang login | 3 |
| CINE-27 | Story | UI watchlist (tombol tambah/hapus + halaman) | Status tombol sinkron dengan data | 3 |

## Epic CINE-28: Polish & Bonus (Sprint 4)

| Key | Tipe | Judul | Acceptance Criteria | SP |
| --- | --- | --- | --- | --- |
| CINE-29 | Task | Loading skeleton & error state | Tidak ada layar kosong saat loading/error | 2 |
| CINE-30 | Task | Atribusi TMDB di footer | Logo dan teks atribusi tampil | 1 |
| CINE-31 | Story | (Bonus) Player film legal | Film Blender/public domain bisa diputar | 5 |
| CINE-32 | Task | (Bonus) Dockerfile untuk web & api | Aplikasi jalan lewat Docker | 3 |
| CINE-33 | Task | README final + dokumentasi arsitektur | Orang lain bisa menjalankan project dari README | 2 |

## Rencana Sprint (1 bulan = 4 sprint mingguan)

| Sprint | Fokus | Epic |
| --- | --- | --- |
| 1 | Fondasi | CINE-1 |
| 2 | Katalog + mulai detail | CINE-7, sebagian CINE-13 |
| 3 | Detail, pencarian, mulai auth | sisa CINE-13, CINE-17, awal CINE-21 |
| 4 | Watchlist, polish, bonus | sisa CINE-21, CINE-28 |

> Jika waktu mepet, korbankan item **Bonus** (CINE-31, CINE-32) dan **Should/Could** dulu, jangan fitur **Must**.