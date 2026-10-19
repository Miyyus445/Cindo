import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-50 flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-4xl font-bold text-zinc-50">Film tidak ditemukan</h1>
        <p className="mt-4 text-zinc-400">Film yang Anda cari tidak ada atau telah dihapus.</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 ring-1 ring-white/10 text-zinc-50 hover:bg-zinc-800 transition-colors"
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
    </div>
  );
}