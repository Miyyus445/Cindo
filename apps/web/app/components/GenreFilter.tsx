import Link from "next/link";

type Genre = { id: number; name: string };

type Props = {
  genres: Genre[];
  currentGenreId?: number;
  hasQuery: boolean;
};

export default function GenreFilter({ genres, currentGenreId, hasQuery }: Props) {
  if (genres.length === 0) {
    return null;
  }

  const isPopularMode = !hasQuery && !currentGenreId;

  return (
    <div className="flex flex-wrap gap-2 mb-8" role="navigation" aria-label="Filter genre">
      <Link
        href="/"
        className={`px-3 py-1.5 rounded-full text-sm font-medium ring-1 transition-colors ${
          isPopularMode
            ? "bg-amber-500 text-zinc-950 ring-amber-500"
            : "bg-zinc-900 text-zinc-50 ring-white/10 hover:bg-zinc-800"
        }`}
        aria-current={isPopularMode ? "page" : undefined}
      >
        Semua
      </Link>
      {genres.map((genre) => {
        const isActive = currentGenreId === genre.id;
        return (
          <Link
            key={genre.id}
            href={`/?genre=${genre.id}`}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ring-1 transition-colors ${
              isActive
                ? "bg-amber-500 text-zinc-950 ring-amber-500"
                : "bg-zinc-900 text-zinc-50 ring-white/10 hover:bg-zinc-800"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {genre.name}
          </Link>
        );
      })}
    </div>
  );
}