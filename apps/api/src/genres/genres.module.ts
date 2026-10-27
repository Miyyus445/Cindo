import { Module } from '@nestjs/common';
import { GenresController } from './genres.controller.js';
import { TmdbModule } from '../tmdb/tmdb.module.js';

@Module({
  imports: [TmdbModule],
  controllers: [GenresController],
})
export class GenresModule {}