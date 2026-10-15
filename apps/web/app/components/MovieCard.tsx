import Image from "next/image";

export type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
};

export default function MovieCard({
  movie,
  eager = false,
}: {
  movie: Movie;
  eager?: boolean;
}) {
  return (
    <article className="overflow-hidden rounded-lg bg-zinc-900 ring-1 ring-white/10">
      <div className="relative aspect-[2/3] w-full bg-zinc-800">
        {movie.poster_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover"
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "high" : "auto"}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-4 text-center text-sm text-zinc-400">
            Tidak ada poster
          </div>
        )}
      </div>
      <div className="p-3">
        <h2 className="line-clamp-2 min-h-10 text-sm font-semibold text-zinc-50">
          {movie.title}
        </h2>
        <p className="mt-1 text-sm text-amber-400">
          ★ {movie.vote_average.toFixed(1)}
        </p>
      </div>
    </article>
  );
}
