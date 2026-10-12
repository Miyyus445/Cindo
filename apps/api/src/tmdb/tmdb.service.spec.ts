import { ConfigService } from '@nestjs/config';
import { TmdbService } from './tmdb.service.js';

function configWith(key: string | undefined): ConfigService {
  return { get: () => key } as unknown as ConfigService;
}

describe('TmdbService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('(a) sukses mengembalikan data', async () => {
    const data = { results: [{ id: 1, title: 'Film A' }] };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(data) }),
    );
    const svc = new TmdbService(configWith('dummy-key'));
    await expect(svc.getPopularMovies(1)).resolves.toEqual(data);
  });

  it('(b) respons gagal melempar error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    const svc = new TmdbService(configWith('dummy-key'));
    await expect(svc.getPopularMovies(1)).rejects.toThrow();
  });

  it('(c) key kosong melempar error', () => {
    expect(() => new TmdbService(configWith(undefined))).toThrow(
      'TMDB_API_KEY belum diisi di .env',
    );
  });
});
