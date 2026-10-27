import { ConfigService } from '@nestjs/config';
import { BadGatewayException, NotFoundException } from '@nestjs/common';
import { TmdbService } from './tmdb.service.js';

function configWith(key: string | undefined): ConfigService {
  return { get: () => key } as unknown as ConfigService;
}

describe('TmdbService', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('(a) sukses mengembalikan data', async () => {
    const data = { results: [{ id: 1, title: 'Film A' }] };
    fetchSpy.mockResolvedValue({ ok: true, json: () => Promise.resolve(data) });
    const svc = new TmdbService(configWith('dummy-key'));
    await expect(svc.getPopularMovies(1)).resolves.toEqual(data);
  });

  it('(b) respons gagal melempar error', async () => {
    fetchSpy.mockResolvedValue({ ok: false, status: 500 });
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
    fetchSpy.mockResolvedValue({ ok: true, json: () => Promise.resolve(data) });
    const svc = new TmdbService(configWith('dummy-key'));
    await svc.getPopularMovies(2);
    await svc.getPopularMovies(2);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('(e) halaman berbeda fetch terpisah', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      const page = new URL(url).searchParams.get('page');
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ page }),
      });
    });
    fetchSpy.mockImplementation(fetchMock);
    const svc = new TmdbService(configWith('dummy-key'));
    await svc.getPopularMovies(1);
    await svc.getPopularMovies(2);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('(f) setelah TTL lewat fetch dipanggil lagi', async () => {
    vi.useFakeTimers();
    try {
      const data = { results: [] };
      fetchSpy.mockResolvedValue({ ok: true, json: () => Promise.resolve(data) });
      const svc = new TmdbService(configWith('dummy-key'));
      await svc.getPopularMovies(1);
      vi.advanceTimersByTime(5 * 60 * 1000 + 1);
      await svc.getPopularMovies(1);
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('(g) respons gagal tidak di-cache', async () => {
    const data = { results: [{ id: 9 }] };
    fetchSpy
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(data) });
    const svc = new TmdbService(configWith('dummy-key'));
    await expect(svc.getPopularMovies(3)).rejects.toThrow();
    await expect(svc.getPopularMovies(3)).resolves.toEqual(data);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('(a) getMovieDetails sukses mengembalikan data', async () => {
    const data = { id: 42, title: 'Film B' };
    fetchSpy.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(data),
    });
    const svc = new TmdbService(configWith('dummy-key'));
    await expect(svc.getMovieDetails(42)).resolves.toEqual(data);
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/movie/42?language=en-US'),
    );
  });

  it('(b) TMDB membalas 404 -> NotFoundException', async () => {
    fetchSpy.mockResolvedValue({ ok: false, status: 404 });
    const svc = new TmdbService(configWith('dummy-key'));
    await expect(svc.getMovieDetails(999)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('(c) TMDB membalas 500 -> BadGatewayException', async () => {
    fetchSpy.mockResolvedValue({ ok: false, status: 500 });
    const svc = new TmdbService(configWith('dummy-key'));
    await expect(svc.getMovieDetails(42)).rejects.toBeInstanceOf(BadGatewayException);
  });

  it('(d) getMovieVideos sukses mengembalikan data', async () => {
    const data = { id: 42, results: [{ key: 'abc123' }] };
    fetchSpy.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(data),
    });
    const svc = new TmdbService(configWith('dummy-key'));
    await expect(svc.getMovieVideos(42)).resolves.toEqual(data);
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/movie/42/videos'),
    );
  });

  it('(e) getMovieVideos 404 -> NotFoundException', async () => {
    fetchSpy.mockResolvedValue({ ok: false, status: 404 });
    const svc = new TmdbService(configWith('dummy-key'));
    await expect(svc.getMovieVideos(999)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('(a) searchMovies sukses mengembalikan data', async () => {
    const data = { results: [{ id: 1, title: 'Film Cari' }], page: 1 };
    fetchSpy.mockResolvedValue({ ok: true, json: () => Promise.resolve(data) });
    const svc = new TmdbService(configWith('dummy-key'));
    await expect(svc.searchMovies('avatar', 1)).resolves.toEqual(data);
  });

  it('(b) query dengan karakter khusus di-encode di URL', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ results: [], page: 1 }),
    });
    const svc = new TmdbService(configWith('dummy-key'));
    await svc.searchMovies('a&b c', 2);
    const calledUrl = fetchSpy.mock.calls[0][0] as string;
    expect(calledUrl).toContain('query=a%26b+c');
    expect(calledUrl).toContain('page=2');
    expect(calledUrl).toContain('include_adult=false');
  });

  it('(c) respons gagal -> BadGatewayException', async () => {
    fetchSpy.mockResolvedValue({ ok: false, status: 500 });
    const svc = new TmdbService(configWith('dummy-key'));
    await expect(svc.searchMovies('test', 1)).rejects.toBeInstanceOf(BadGatewayException);
  });

  it('(a) getGenres sukses mengembalikan data', async () => {
    const data = { genres: [{ id: 28, name: 'Action' }] };
    fetchSpy.mockResolvedValue({ ok: true, json: () => Promise.resolve(data) });
    const svc = new TmdbService(configWith('dummy-key'));
    await expect(svc.getGenres()).resolves.toEqual(data);
  });

  it('(b) dua panggilan getGenres -> fetch hanya 1 kali', async () => {
    const data = { genres: [{ id: 28, name: 'Action' }] };
    fetchSpy.mockResolvedValue({ ok: true, json: () => Promise.resolve(data) });
    const svc = new TmdbService(configWith('dummy-key'));
    await svc.getGenres();
    await svc.getGenres();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('(c) setelah TTL lewat (fake timers) -> fetch dipanggil lagi', async () => {
    vi.useFakeTimers();
    try {
      const data = { genres: [] };
      fetchSpy.mockResolvedValue({ ok: true, json: () => Promise.resolve(data) });
      const svc = new TmdbService(configWith('dummy-key'));
      await svc.getGenres();
      vi.advanceTimersByTime(24 * 60 * 60 * 1000 + 1);
      await svc.getGenres();
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('(d) getGenres gagal tidak di-cache: gagal dulu, lalu sukses -> tetap menembak fetch', async () => {
    const data = { genres: [{ id: 28, name: 'Action' }] };
    fetchSpy
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(data) });
    const svc = new TmdbService(configWith('dummy-key'));
    await expect(svc.getGenres()).rejects.toThrow();
    await expect(svc.getGenres()).resolves.toEqual(data);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('(e) discoverMovies: URL yang dipanggil fetch memuat with_genres=28, page, sort_by=popularity.desc, include_adult=false', async () => {
    fetchSpy.mockResolvedValue({ ok: true, json: () => Promise.resolve({ results: [], page: 1 }) });
    const svc = new TmdbService(configWith('dummy-key'));
    await svc.discoverMovies(28, 3);
    const calledUrl = fetchSpy.mock.calls[0][0] as string;
    expect(calledUrl).toContain('with_genres=28');
    expect(calledUrl).toContain('page=3');
    expect(calledUrl).toContain('sort_by=popularity.desc');
    expect(calledUrl).toContain('include_adult=false');
  });

  it('(f) discoverMovies gagal -> BadGatewayException', async () => {
    fetchSpy.mockResolvedValue({ ok: false, status: 500 });
    const svc = new TmdbService(configWith('dummy-key'));
    await expect(svc.discoverMovies(28, 1)).rejects.toBeInstanceOf(BadGatewayException);
  });
});