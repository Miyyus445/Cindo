import Link from "next/link";

type Props = {
  page: number;
  totalPages: number;
};

export default function Pagination({ page, totalPages }: Props) {
  const prevPage = page - 1;
  const nextPage = page + 1;
  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  const btn =
    "rounded-lg px-4 py-2 text-sm font-medium ring-1 ring-white/10 transition-colors";
  const active = "bg-zinc-800 text-zinc-50 hover:bg-zinc-700";
  const disabled = "cursor-not-allowed bg-zinc-900 text-zinc-600";

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row"
    >
      {isFirst ? (
        <span className={`${btn} ${disabled}`} aria-disabled="true">
          Sebelumnya
        </span>
      ) : (
        <Link href={`/?page=${prevPage}`} className={`${btn} ${active}`}>
          Sebelumnya
        </Link>
      )}
      <p className="text-sm text-zinc-400">
        Halaman {page} dari {totalPages}
      </p>
      {isLast ? (
        <span className={`${btn} ${disabled}`} aria-disabled="true">
          Berikutnya
        </span>
      ) : (
        <Link href={`/?page=${nextPage}`} className={`${btn} ${active}`}>
          Berikutnya
        </Link>
      )}
    </nav>
  );
}
