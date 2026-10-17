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
