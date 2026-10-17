import { ConfigService } from '@nestjs/config';
import { BadGatewayException, NotFoundException } from '@nestjs/common';
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

  it('(a) getMovieDetails sukses mengembalikan data', async () => {
    const data = { id: 42, title: 'Film B' };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(data),
    });
    vi.stubGlobal('fetch', fetchMock);
    const svc = new TmdbService(configWith('dummy-key'));
    await expect(svc.getMovieDetails(42)).resolves.toEqual(data);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/movie/42?language=en-US'),
    );
  });

  it('(b) TMDB membalas 404 -> NotFoundException', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 404 }),
    );
    const svc = new TmdbService(configWith('dummy-key'));
    await expect(svc.getMovieDetails(999)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('(c) TMDB membalas 500 -> BadGatewayException', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );
    const svc = new TmdbService(configWith('dummy-key'));
    await expect(svc.getMovieDetails(42)).rejects.toBeInstanceOf(BadGatewayException);
  });

  it('(d) getMovieVideos sukses mengembalikan data', async () => {
    const data = { id: 42, results: [{ key: 'abc123' }] };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(data),
    });
    vi.stubGlobal('fetch', fetchMock);
    const svc = new TmdbService(configWith('dummy-key'));
    await expect(svc.getMovieVideos(42)).resolves.toEqual(data);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/movie/42/videos'),
    );
  });

  it('(e) getMovieVideos 404 -> NotFoundException', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 404 }),
    );
    const svc = new TmdbService(configWith('dummy-key'));
    await expect(svc.getMovieVideos(999)).rejects.toBeInstanceOf(NotFoundException);
  });
});
