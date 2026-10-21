"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export default function SearchBar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialQ = searchParams?.get("q") ?? "";
  const [inputValue, setInputValue] = useState(initialQ);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRenderRef = useRef(true);
  const searchParamsRef = useRef(searchParams);
  const routerRef = useRef(router);
  const pathnameRef = useRef(pathname);

  useLayoutEffect(() => {
    searchParamsRef.current = searchParams;
    routerRef.current = router;
    pathnameRef.current = pathname;
  });

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const trimmed = inputValue.trim();
      const currentUrlQ = (searchParamsRef.current?.get("q") ?? "").trim();

      if (trimmed === currentUrlQ) {
        return;
      }

      const params = new URLSearchParams(searchParamsRef.current?.toString() ?? "");
      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }
      params.delete("page");

      const newSearch = params.toString();
      const newUrl = pathnameRef.current + (newSearch ? `?${newSearch}` : "");
      routerRef.current.replace(newUrl, { scroll: false });
    }, 400);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 100) {
      setInputValue(value);
    }
  };

  const handleClear = () => {
    setInputValue("");
  };

  return (
    <div className="relative w-full max-w-xl mx-auto mb-8">
      <label htmlFor="search-input" className="sr-only">
        Cari film
      </label>
      <input
        id="search-input"
        type="search"
        value={inputValue}
        onChange={handleChange}
        placeholder="Cari film..."
        maxLength={100}
        aria-label="Cari film"
        className="w-full pl-10 pr-12 py-3 rounded-lg bg-zinc-900 ring-1 ring-white/10 text-zinc-50 placeholder-zinc-500 focus:ring-2 focus:ring-amber-400 focus:outline-none transition-all [&::-webkit-search-cancel-button]:hidden"
      />
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Hapus pencarian"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

function SearchBarFallback() {
  return (
    <div className="w-full max-w-xl mx-auto mb-8">
      <input
        type="search"
        placeholder="Cari film..."
        maxLength={100}
        disabled
        aria-label="Cari film (memuat...)"
        className="w-full pl-10 pr-12 py-3 rounded-lg bg-zinc-900 ring-1 ring-white/10 text-zinc-50 placeholder-zinc-500 cursor-wait [&::-webkit-search-cancel-button]:hidden"
      />
    </div>
  );
}

export { SearchBarFallback };