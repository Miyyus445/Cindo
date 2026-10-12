import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TmdbService {
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    const key = this.configService.get<string>('TMDB_API_KEY');
    if (!key) {
      throw new Error('TMDB_API_KEY belum diisi di .env');
    }
    this.apiKey = key;
  }

  async getPopularMovies(page = 1): Promise<unknown> {
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${this.apiKey}&page=${page}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new BadGatewayException('Gagal mengambil film populer dari TMDB');
    }
    return res.json();
  }
}
