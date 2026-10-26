import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller.js';
import { BadRequestException } from '@nestjs/common';
import { TmdbService } from '../tmdb/tmdb.service.js';

const mockTmdbService = {
  getPopularMovies: vi.fn(),
  getMovieDetails: vi.fn(),
  getMovieVideos: vi.fn(),
  searchMovies: vi.fn(),
  discoverMovies: vi.fn(),
  getGenres: vi.fn(),
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

  it('(d) getMovieDetails id 0 ditolak dengan 400', async () => {
    await expect(controller.getMovieDetails(0)).rejects.toThrow(BadRequestException);
  });

  it('(d) getMovieDetails id negatif ditolak dengan 400', async () => {
    await expect(controller.getMovieDetails(-5)).rejects.toThrow(BadRequestException);
  });

  it('(e) getMovieDetails id valid memanggil service dengan angka yang benar', async () => {
    mockTmdbService.getMovieDetails.mockResolvedValue({ id: 42 });
    await controller.getMovieDetails(42);
    expect(mockTmdbService.getMovieDetails).toHaveBeenCalledWith(42);
  });

  it('(d) getMovieVideos id 0 ditolak dengan 400', async () => {
    await expect(controller.getMovieVideos(0)).rejects.toThrow(BadRequestException);
  });

  it('(d) getMovieVideos id negatif ditolak dengan 400', async () => {
    await expect(controller.getMovieVideos(-5)).rejects.toThrow(BadRequestException);
  });

  it('(e) getMovieVideos id valid memanggil service dengan angka yang benar', async () => {
    mockTmdbService.getMovieVideos.mockResolvedValue({ id: 42, results: [] });
    await controller.getMovieVideos(42);
    expect(mockTmdbService.getMovieVideos).toHaveBeenCalledWith(42);
  });

  it('(d) q kosong ditolak 400', async () => {
    await expect(controller.searchMovies('', 1)).rejects.toThrow(BadRequestException);
  });

  it('(d) q hanya spasi ditolak 400', async () => {
    await expect(controller.searchMovies('   ', 1)).rejects.toThrow(BadRequestException);
  });

  it('(d) q lebih dari 100 karakter ditolak 400', async () => {
    const longQ = 'a'.repeat(101);
    await expect(controller.searchMovies(longQ, 1)).rejects.toThrow(BadRequestException);
  });

  it('(e) q valid memanggil service dengan q di-trim dan page benar', async () => {
    mockTmdbService.searchMovies.mockResolvedValue({ results: [], page: 2 });
    await controller.searchMovies('  avatar  ', 2);
    expect(mockTmdbService.searchMovies).toHaveBeenCalledWith('avatar', 2);
  });

  it('(g) discover valid memanggil service dengan angka genre dan page yang benar', async () => {
    mockTmdbService.discoverMovies.mockResolvedValue({ results: [], page: 2 });
    await controller.discoverMovies(28, 2);
    expect(mockTmdbService.discoverMovies).toHaveBeenCalledWith(28, 2);
  });

  it('(h) genre 0 ditolak 400', async () => {
    await expect(controller.discoverMovies(0, 1)).rejects.toThrow(BadRequestException);
  });

  it('(h) genre 100000 ditolak 400', async () => {
    await expect(controller.discoverMovies(100000, 1)).rejects.toThrow(BadRequestException);
  });

  it('(h) page 0 ditolak 400', async () => {
    await expect(controller.discoverMovies(28, 0)).rejects.toThrow(BadRequestException);
  });

  it('(h) page 501 ditolak 400', async () => {
    await expect(controller.discoverMovies(28, 501)).rejects.toThrow(BadRequestException);
  });
});