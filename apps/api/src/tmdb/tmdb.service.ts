import { BadGatewayException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const POPULAR_CACHE_TTL_MS = 5 * 60 * 1000;
const POPULAR_CACHE_MAX_ENTRIES = 100;
const GENRES_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface PopularCacheEntry {
  data: unknown;
  expiresAt: number;
}

interface GenresCacheEntry {
  data: unknown;
  expiresAt: number;
}

@Injectable()
export class TmdbService {
  private readonly apiKey: string;
  private readonly popularCache = new Map<number, PopularCacheEntry>();
  private genresCache: GenresCacheEntry | null = null;

  constructor(private readonly configService: ConfigService) {
    const key = this.configService.get<string>('TMDB_API_KEY');
    if (!key) {
      throw new Error('TMDB_API_KEY belum diisi di .env');
    }
    this.apiKey = key;
  }

  async getPopularMovies(page = 1): Promise<unknown> {
    const cached = this.popularCache.get(page);
    if (cached) {
      if (Date.now() < cached.expiresAt) {
        return cached.data;
      }
      this.popularCache.delete(page);
    }
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${this.apiKey}&page=${page}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new BadGatewayException('Gagal mengambil film populer dari TMDB');
    }
    const data = await res.json();
    if (!this.popularCache.has(page) && this.popularCache.size >= POPULAR_CACHE_MAX_ENTRIES) {
      const oldest = this.popularCache.keys().next().value;
      if (oldest !== undefined) {
        this.popularCache.delete(oldest);
      }
    }
    this.popularCache.set(page, { data, expiresAt: Date.now() + POPULAR_CACHE_TTL_MS });
    return data;
  }

  async getMovieDetails(id: number): Promise<unknown> {
    const url = `https://api.themoviedb.org/3/movie/${id}?language=en-US&api_key=${this.apiKey}`;
    const res = await fetch(url);
    if (res.status === 404) {
      throw new NotFoundException('Film tidak ditemukan');
    }
    if (!res.ok) {
      throw new BadGatewayException('Gagal mengambil detail film dari TMDB');
    }
    return res.json();
  }

  async getMovieVideos(id: number): Promise<unknown> {
    const url = `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${this.apiKey}`;
    const res = await fetch(url);
    if (res.status === 404) {
      throw new NotFoundException('Film tidak ditemukan');
    }
    if (!res.ok) {
      throw new BadGatewayException('Gagal mengambil video film dari TMDB');
    }
    return res.json();
  }

  async searchMovies(query: string, page = 1): Promise<unknown> {
    const params = new URLSearchParams({
      api_key: this.apiKey,
      query,
      page: String(page),
      include_adult: 'false',
    });
    const url = `https://api.themoviedb.org/3/search/movie?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new BadGatewayException('Gagal mencari film dari TMDB');
    }
    return res.json();
  }

  async getGenres(): Promise<unknown> {
    if (this.genresCache) {
      if (Date.now() < this.genresCache.expiresAt) {
        return this.genresCache.data;
      }
      this.genresCache = null;
    }
    const params = new URLSearchParams({
      api_key: this.apiKey,
      language: 'en-US',
    });
    const url = `https://api.themoviedb.org/3/genre/movie/list?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new BadGatewayException('Gagal mengambil daftar genre dari TMDB');
    }
    const data = await res.json();
    this.genresCache = { data, expiresAt: Date.now() + GENRES_CACHE_TTL_MS };
    return data;
  }

  async discoverMovies(genreId: number, page = 1): Promise<unknown> {
    const params = new URLSearchParams({
      api_key: this.apiKey,
      with_genres: String(genreId),
      page: String(page),
      sort_by: 'popularity.desc',
      include_adult: 'false',
    });
    const url = `https://api.themoviedb.org/3/discover/movie?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new BadGatewayException('Gagal mengambil film dari TMDB');
    }
    return res.json();
  }
}
