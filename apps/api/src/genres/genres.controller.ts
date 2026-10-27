import { Controller, Get } from '@nestjs/common';
import { TmdbService } from '../tmdb/tmdb.service.js';

@Controller('genres')
export class GenresController {
  constructor(private readonly tmdbService: TmdbService) {}

  @Get()
  async getGenres() {
    return this.tmdbService.getGenres();
  }
}