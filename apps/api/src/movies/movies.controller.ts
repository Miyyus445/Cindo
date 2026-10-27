import { Controller, Get, Param, Query, BadRequestException } from '@nestjs/common';
import { DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { TmdbService } from '../tmdb/tmdb.service.js';

@Controller('movies')
export class MoviesController {
  constructor(private readonly tmdbService: TmdbService) {}

  @Get('popular')
  async getPopularMovies(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    if (!Number.isInteger(page) || page < 1 || page > 500) {
      throw new BadRequestException('page harus bilangan bulat 1-500');
    }
    return this.tmdbService.getPopularMovies(page);
  }

  @Get('search')
  async searchMovies(
    @Query('q') q: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    const trimmed = q?.trim();
    if (!trimmed) {
      throw new BadRequestException('q wajib diisi dan tidak boleh hanya spasi');
    }
    if (trimmed.length > 100) {
      throw new BadRequestException('q maksimal 100 karakter');
    }
    if (!Number.isInteger(page) || page < 1 || page > 500) {
      throw new BadRequestException('page harus bilangan bulat 1-500');
    }
    return this.tmdbService.searchMovies(trimmed, page);
  }

  @Get('discover')
  async discoverMovies(
    @Query('genre', ParseIntPipe) genre: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    if (!Number.isInteger(genre) || genre < 1 || genre > 99999) {
      throw new BadRequestException('genre harus bilangan bulat 1-99999');
    }
    if (!Number.isInteger(page) || page < 1 || page > 500) {
      throw new BadRequestException('page harus bilangan bulat 1-500');
    }
    return this.tmdbService.discoverMovies(genre, page);
  }

  @Get(':id')
  async getMovieDetails(@Param('id', ParseIntPipe) id: number) {
    if (!Number.isInteger(id) || id < 1) {
      throw new BadRequestException('id harus bilangan bulat positif');
    }
    return this.tmdbService.getMovieDetails(id);
  }

  @Get(':id/videos')
  async getMovieVideos(@Param('id', ParseIntPipe) id: number) {
    if (!Number.isInteger(id) || id < 1) {
      throw new BadRequestException('id harus bilangan bulat positif');
    }
    return this.tmdbService.getMovieVideos(id);
  }
}
