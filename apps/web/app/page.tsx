import MovieCard, { type Movie } from "./components/MovieCard";

const API_URL = process.env.API_URL ?? "http://localhost:3001";

async function getPopularMovies(): Promise<Movie[] | null> {
  try {
    const res = await fetch(`${API_URL}/movies/popular`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data)) return data as Movie[];
    if (Array.isArray(data.results)) return data.results as Movie[];
    return null;
  } catch {
    return null;
  }
}

export default async function Home() {
  const movies = await getPopularMovies();

  if (!movies) {
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
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </main>
    </div>
  );
}
