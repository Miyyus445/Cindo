import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const API_URL = process.env.API_URL ?? "http://localhost:3001";

type MovieDetail = {
  id: number;
  title: string;
  tagline: string | null;
  vote_average: number;
  release_date: string;
  runtime: number | null;
  genres: Array<{ id: number; name: string }>;
  overview: string | null;
  poster_path: string | null;
};

type MovieVideo = {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
};

type FetchResult =
  | { ok: true; data: MovieDetail }
  | { ok: false; notFound: true }
  | { ok: false; notFound: false; message: string };

type VideosFetchResult =
  | { ok: true; data: MovieVideo[] }
  | { ok: false; message: string };

async function getMovieDetail(id: string): Promise<FetchResult> {
  try {
    const res = await fetch(`${API_URL}/movies/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      if (res.status === 404) {
        return { ok: false, notFound: true };
      }
      return {
        ok: false,
        notFound: false,
        message: `Gagal memuat detail film (status ${res.status}). Pastikan API berjalan di port 3001.`,
      };
    }
    const data = await res.json();
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      notFound: false,
      message: "Gagal memuat detail film. Pastikan API berjalan di port 3001.",
    };
  }
}

async function getMovieVideos(id: string): Promise<VideosFetchResult> {
  try {
    const res = await fetch(`${API_URL}/movies/${id}/videos`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return {
        ok: false,
        message: `Gagal memuat video film (status ${res.status}).`,
      };
    }
    const data = await res.json();
    const videos = Array.isArray(data.results) ? data.results : [];
    return { ok: true, data: videos };
  } catch {
    return {
      ok: false,
      message: "Trailer tidak dapat dimuat.",
    };
  }
}

const YOUTUBE_KEY_REGEX = /^[A-Za-z0-9_-]{11}$/;

function isValidYouTubeKey(key: string): boolean {
  return YOUTUBE_KEY_REGEX.test(key);
}

function pickTrailer(videos: MovieVideo[]): MovieVideo | null {
  const youtubeTrailers = videos.filter(
    (v) => v.site === "YouTube" && v.type === "Trailer" && isValidYouTubeKey(v.key)
  );

  if (youtubeTrailers.length === 0) return null;

  // Prioritaskan official: true, lalu published_at terbaru
  youtubeTrailers.sort((a, b) => {
    if (a.official !== b.official) return b.official ? 1 : -1;
    return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
  });

  return youtubeTrailers[0];
}

function formatRuntime(minutes: number | null): string {
  if (!minutes) return "Durasi tidak diketahui";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) return `${hours} j ${mins} m`;
  if (hours > 0) return `${hours} j`;
  return `${mins} m`;
}

function formatDate(dateStr: string): string {
  if (!dateStr || dateStr.trim() === "") {
    return "Tanggal rilis belum diketahui";
  }
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return "Tanggal rilis belum diketahui";
    }
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "Tanggal rilis belum diketahui";
  }
}

function getOverview(text: string | null): string {
  if (!text || text.trim() === "") {
    return "Sinopsis belum tersedia.";
  }
  return text;
}

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Validasi id harus bilangan bulat positif
  const movieId = Number(id);
  if (!Number.isInteger(movieId) || movieId <= 0) {
    notFound();
  }

  // Fetch detail dan video secara paralel
  const [detailResult, videosResult] = await Promise.all([
    getMovieDetail(id),
    getMovieVideos(id),
  ]);

  if (!detailResult.ok) {
    if (detailResult.notFound) {
      notFound();
    }
    // Error lain: tampilkan pesan dengan link kembali, tanpa crash
    return (
      <div className="min-h-screen bg-zinc-950 font-sans text-zinc-50">
        <main className="mx-auto w-full max-w-6xl px-4 py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-6 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Kembali ke daftar film
          </Link>
          <div className="rounded-lg bg-zinc-900 p-6 ring-1 ring-white/10 text-center">
            <p className="text-zinc-300">{detailResult.message}</p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 ring-1 ring-white/10 text-zinc-50 hover:bg-zinc-700 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Kembali ke daftar film
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const movie = detailResult.data;

  // Proses trailer
  let trailerKey: string | null = null;
  let trailerError: string | null = null;

  if (videosResult.ok) {
    const trailer = pickTrailer(videosResult.data);
    if (trailer) {
      trailerKey = trailer.key;
    }
  } else {
    trailerError = videosResult.message;
  }

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-50">
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-6 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Kembali ke daftar film
        </Link>

        <div className="gap-6 md:flex">
          {/* Poster */}
          <div className="w-full max-w-xs md:max-w-[200px] md:flex-shrink-0">
            {movie.poster_path ? (
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800">
                <Image
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 300px"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>
            ) : (
              <div className="relative aspect-[2/3] rounded-lg bg-zinc-800 flex items-center justify-center p-4 text-center text-sm text-zinc-400">
                Tidak ada poster
              </div>
            )}
          </div>

          {/* Info Film */}
          <div className="mt-6 md:mt-0 md:ml-6 flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold text-zinc-50">{movie.title}</h1>

            {movie.tagline && (
              <p className="mt-2 text-zinc-300 italic">&ldquo;{movie.tagline}&rdquo;</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-amber-400 font-medium">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {movie.vote_average.toFixed(1)} / 10
              </span>
              <span className="text-zinc-400">{formatDate(movie.release_date)}</span>
              {movie.runtime && (
                <span className="text-zinc-400">{formatRuntime(movie.runtime)}</span>
              )}
            </div>

            {movie.genres.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 rounded-full bg-zinc-900 ring-1 ring-white/10 text-sm text-zinc-200"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-6">
              <h2 className="text-lg font-semibold text-zinc-50">Sinopsis</h2>
              <p className="mt-2 text-zinc-300 leading-relaxed whitespace-pre-line">
                {getOverview(movie.overview)}
              </p>
            </div>

            {/* Trailer Section */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-zinc-50">Trailer</h2>
              {trailerKey ? (
                <div className="mt-4 relative w-full aspect-video rounded-lg overflow-hidden bg-zinc-900 ring-1 ring-white/10">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${trailerKey}`}
                    title={`Trailer ${movie.title}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="w-full h-full"
                  />
                </div>
              ) : trailerError ? (
                <p className="mt-2 text-zinc-400 italic">{trailerError}</p>
              ) : (
                <p className="mt-2 text-zinc-400 italic">Trailer belum tersedia.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}