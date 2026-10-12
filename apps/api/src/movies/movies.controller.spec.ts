import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller.js';
import { BadRequestException } from '@nestjs/common';
import { TmdbService } from '../tmdb/tmdb.service.js';

const mockTmdbService = {
  getPopularMovies: vi.fn(),
};

describe('MoviesController', () => {
  let controller: MoviesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [{ provide: TmdbService, useValue: mockTmdbService }],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
    vi.clearAllMocks();
  });

  it('(a) tanpa query memanggil service dengan page 1', async () => {
    mockTmdbService.getPopularMovies.mockResolvedValue({ results: [] });
    await controller.getPopularMovies(1);
    expect(mockTmdbService.getPopularMovies).toHaveBeenCalledWith(1);
  });

  it('(b) ?page=3 memanggil service dengan page 3', async () => {
    mockTmdbService.getPopularMovies.mockResolvedValue({ results: [] });
    await controller.getPopularMovies(3);
    expect(mockTmdbService.getPopularMovies).toHaveBeenCalledWith(3);
  });

  it('(c) page 0 ditolak dengan 400', async () => {
    await expect(controller.getPopularMovies(0)).rejects.toThrow(BadRequestException);
  });

  it('(c) page 501 ditolak dengan 400', async () => {
    await expect(controller.getPopularMovies(501)).rejects.toThrow(BadRequestException);
  });

  it('(c) bukan angka ditolak dengan 400', async () => {
    // ParseIntPipe akan melempar sebelum sampai sini, tapi cek manual
    await expect(controller.getPopularMovies(NaN)).rejects.toThrow(BadRequestException);
  });
});