import MovieCard, { type Movie } from "./components/MovieCard";
import Pagination from "./components/Pagination";

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

type PopularResult = {
  results: Movie[];
  totalPages: number;
};

async function getPopularMovies(page: number): Promise<PopularResult | null> {
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

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const data = await getPopularMovies(page);

  if (!data) {
    return (
      <div className="min-h-screen bg-zinc-950 font-sans text-zinc-50">
        <main className="mx-auto w-full max-w-6xl px-4 py-10">
          <h1 className="text-2xl font-bold">Film Populer</h1>
          <p className="mt-6 rounded-lg bg-zinc-900 p-4 ring-1 ring-white/10">
            Gagal memuat film. Pastikan API berjalan di port 3001.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-50">
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-bold">Film Populer</h1>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {data.results.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
        <Pagination page={page} totalPages={data.totalPages} />
      </main>
    </div>
  );
}
