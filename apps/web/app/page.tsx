import { Suspense } from "react";
import Link from "next/link";
import MovieCard, { type Movie } from "./components/MovieCard";
import Pagination from "./components/Pagination";
import SearchBar, { SearchBarFallback } from "./components/SearchBar";
import GenreFilter from "./components/GenreFilter";

const API_URL = process.env.API_URL ?? "http://localhost:3001";
const MAX_PAGE = 500;

function parsePage(value: string | string[] | undefined): number {
  if (typeof value !== "string") return 1;
  const n = Number(value);
  if (!Number.isInteger(n)) return 1;
  if (n < 1) return 1;
  if (n > MAX_PAGE) return MAX_PAGE;
  return n;
}

function parseQuery(value: string | string[] | undefined): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 100);
}

function parseGenreId(value: string | string[] | undefined): number | undefined {
  if (typeof value !== "string") return undefined;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) return undefined;
  return n;
}

type Genre = { id: number; name: string };

type MovieResult = {
  results: Movie[];
  totalPages: number;
};

async function getGenres(): Promise<Genre[]> {
  try {
    const res = await fetch(`${API_URL}/genres`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data?.genres)) {
      return data.genres as Genre[];
    }
    return [];
  } catch {
    return [];
  }
}

async function getPopularMovies(page: number): Promise<MovieResult | null> {
  try {
    const res = await fetch(`${API_URL}/movies/popular?page=${page}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data)) {
      return { results: data as Movie[], totalPages: 1 };
    }
    if (Array.isArray(data.results)) {
      const rawTotal = Number(data.total_pages);
      const totalPages = Number.isInteger(rawTotal)
        ? Math.min(Math.max(rawTotal, 1), MAX_PAGE)
        : 1;
      return { results: data.results as Movie[], totalPages };
    }
    return null;
  } catch {
    return null;
  }
}

async function searchMovies(query: string, page: number): Promise<MovieResult | null> {
  try {
    const params = new URLSearchParams({ q: query, page: String(page) });
    const res = await fetch(`${API_URL}/movies/search?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data)) {
      return { results: data as Movie[], totalPages: 1 };
    }
    if (Array.isArray(data.results)) {
      const rawTotal = Number(data.total_pages);
      const totalPages = Number.isInteger(rawTotal)
        ? Math.min(Math.max(rawTotal, 1), MAX_PAGE)
        : 1;
      return { results: data.results as Movie[], totalPages };
    }
    return null;
  } catch {
    return null;
  }
}

async function discoverMovies(genreId: number, page: number): Promise<MovieResult | null> {
  try {
    const params = new URLSearchParams({ genre: String(genreId), page: String(page) });
    const res = await fetch(`${API_URL}/movies/discover?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data)) {
      return { results: data as Movie[], totalPages: 1 };
    }
    if (Array.isArray(data.results)) {
      const rawTotal = Number(data.total_pages);
      const totalPages = Number.isInteger(rawTotal)
        ? Math.min(Math.max(rawTotal, 1), MAX_PAGE)
        : 1;
      return { results: data.results as Movie[], totalPages };
    }
    return null;
  } catch {
    return null;
  }
}

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const q = parseQuery(params.q);
  const hasQuery = q.length > 0;
  const genreId = parseGenreId(params.genre);

  const genres = await getGenres();

  const validGenreId = genreId && genres.some((g) => g.id === genreId) ? genreId : undefined;
  const hasGenre = validGenreId !== undefined;
  const genreName = genres.find((g) => g.id === validGenreId)?.name;
  const activeGenreId = hasQuery ? undefined : validGenreId;

  let data: MovieResult | null = null;

  if (hasQuery) {
    data = await searchMovies(q, page);
  } else if (hasGenre) {
    data = await discoverMovies(validGenreId, page);
  } else {
    data = await getPopularMovies(page);
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-zinc-950 font-sans text-zinc-50">
        <main className="mx-auto w-full max-w-6xl px-4 py-10">
          <Suspense fallback={<SearchBarFallback />}>
            <SearchBar />
          </Suspense>
          <GenreFilter genres={genres} currentGenreId={activeGenreId} hasQuery={hasQuery} />
          <h1 className="text-2xl font-bold mt-6 break-words">
            {hasQuery ? (
              <>
                Hasil pencarian: &ldquo;{q}&rdquo;
              </>
            ) : hasGenre ? (
              <>
                Genre: {genreName}
              </>
            ) : (
              "Film Populer"
            )}
          </h1>
          <p className="mt-6 rounded-lg bg-zinc-900 p-4 ring-1 ring-white/10">
            Gagal memuat film. Pastikan API berjalan di port 3001.
          </p>
        </main>
      </div>
    );
  }

  const { results, totalPages } = data;

  if (hasQuery && results.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 font-sans text-zinc-50">
        <main className="mx-auto w-full max-w-6xl px-4 py-10">
          <Suspense fallback={<SearchBarFallback />}>
            <SearchBar />
          </Suspense>
          <GenreFilter genres={genres} currentGenreId={activeGenreId} hasQuery={hasQuery} />
          <h1 className="text-2xl font-bold mt-6 break-words">
            Hasil pencarian: &ldquo;{q}&rdquo;
          </h1>
          <p className="mt-6 rounded-lg bg-zinc-900 p-4 ring-1 ring-white/10 text-center break-words">
            Tidak ada film yang cocok dengan &ldquo;{q}&rdquo;.
            <Link href="/" className="ml-2 text-amber-400 hover:underline">
              Lihat film populer
            </Link>
          </p>
        </main>
      </div>
    );
  }

  if (hasGenre && results.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 font-sans text-zinc-50">
        <main className="mx-auto w-full max-w-6xl px-4 py-10">
          <Suspense fallback={<SearchBarFallback />}>
            <SearchBar />
          </Suspense>
          <GenreFilter genres={genres} currentGenreId={activeGenreId} hasQuery={hasQuery} />
          <h1 className="text-2xl font-bold mt-6 break-words">
            Genre: {genreName}
          </h1>
          <p className="mt-6 rounded-lg bg-zinc-900 p-4 ring-1 ring-white/10 text-center break-words">
            Tidak ada film untuk genre ini.
            <Link href="/" className="ml-2 text-amber-400 hover:underline">
              Lihat film populer
            </Link>
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-50">
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <Suspense fallback={<SearchBarFallback />}>
          <SearchBar />
        </Suspense>
        <GenreFilter genres={genres} currentGenreId={activeGenreId} hasQuery={hasQuery} />
        <h1 className="text-2xl font-bold mt-6 break-words">
          {hasQuery ? (
            <>
              Hasil pencarian: &ldquo;{q}&rdquo;
            </>
          ) : hasGenre ? (
            <>
              Genre: {genreName}
            </>
          ) : (
            "Film Populer"
          )}
        </h1>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {results.map((movie, index) => (
            <MovieCard key={movie.id} movie={movie} eager={index < 5} />
          ))}
        </div>
        <Pagination page={page} totalPages={totalPages} q={q} genre={validGenreId} />
      </main>
    </div>
  );
}