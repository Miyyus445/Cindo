import { Module } from '@nestjs/common';
import { MoviesController } from './movies.controller.js';
import { TmdbModule } from '../tmdb/tmdb.module.js';

@Module({
  imports: [TmdbModule],
  controllers: [MoviesController],
})
export class MoviesModule {}