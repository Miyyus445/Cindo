import { Test, TestingModule } from '@nestjs/testing';
import { GenresController } from './genres.controller.js';
import { TmdbService } from '../tmdb/tmdb.service.js';

const mockTmdbService = {
  getGenres: vi.fn(),
};

describe('GenresController', () => {
  let controller: GenresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GenresController],
      providers: [{ provide: TmdbService, useValue: mockTmdbService }],
    }).compile();

    controller = module.get<GenresController>(GenresController);
    vi.clearAllMocks();
  });

  it('(i) memanggil getGenres dan mengembalikan hasilnya', async () => {
    const data = { genres: [{ id: 28, name: 'Action' }] };
    mockTmdbService.getGenres.mockResolvedValue(data);
    const result = await controller.getGenres();
    expect(mockTmdbService.getGenres).toHaveBeenCalledTimes(1);
    expect(result).toEqual(data);
  });
});