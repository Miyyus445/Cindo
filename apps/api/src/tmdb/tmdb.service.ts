import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const POPULAR_CACHE_TTL_MS = 5 * 60 * 1000;
const POPULAR_CACHE_MAX_ENTRIES = 100;

interface PopularCacheEntry {
  data: unknown;
  expiresAt: number;
}

@Injectable()
export class TmdbService {
  private readonly apiKey: string;
  private readonly popularCache = new Map<number, PopularCacheEntry>();

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
}
