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

  it('(d) dua panggilan halaman sama dalam TTL hanya fetch 1 kali', async () => {
    const data = { results: [{ id: 1 }] };
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: () => Promise.resolve(data) });
    vi.stubGlobal('fetch', fetchMock);
    const svc = new TmdbService(configWith('dummy-key'));
    await svc.getPopularMovies(2);
    await svc.getPopularMovies(2);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('(e) halaman berbeda fetch terpisah', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      const page = new URL(url).searchParams.get('page');
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ page }),
      });
    });
    vi.stubGlobal('fetch', fetchMock);
    const svc = new TmdbService(configWith('dummy-key'));
    await svc.getPopularMovies(1);
    await svc.getPopularMovies(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('(f) setelah TTL lewat fetch dipanggil lagi', async () => {
    vi.useFakeTimers();
    try {
      const data = { results: [] };
      const fetchMock = vi
        .fn()
        .mockResolvedValue({ ok: true, json: () => Promise.resolve(data) });
      vi.stubGlobal('fetch', fetchMock);
      const svc = new TmdbService(configWith('dummy-key'));
      await svc.getPopularMovies(1);
      vi.advanceTimersByTime(5 * 60 * 1000 + 1);
      await svc.getPopularMovies(1);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('(g) respons gagal tidak di-cache', async () => {
    const data = { results: [{ id: 9 }] };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(data) });
    vi.stubGlobal('fetch', fetchMock);
    const svc = new TmdbService(configWith('dummy-key'));
    await expect(svc.getPopularMovies(3)).rejects.toThrow();
    await expect(svc.getPopularMovies(3)).resolves.toEqual(data);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
