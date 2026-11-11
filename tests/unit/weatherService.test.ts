import { afterEach, describe, expect, it, vi } from 'vitest';
import { getWeather, searchCities } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

const city: City = {
  id: '123',
  name: 'Lisboa',
  country: 'Portugal',
  region: 'Lisboa',
  latitude: 38.72,
  longitude: -9.14,
};

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('weatherService', () => {
  it('searches and normalizes up to five cities', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          results: [
            {
              id: 123,
              name: 'Lisboa',
              country: 'Portugal',
              admin1: 'Lisboa',
              latitude: 38.72,
              longitude: -9.14,
            },
          ],
        }),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const results = await searchCities('Lisboa');
    const requestUrl = new URL(fetchMock.mock.calls[0][0] as string);

    expect(results).toEqual([city]);
    expect(requestUrl.searchParams.get('name')).toBe('Lisboa');
    expect(requestUrl.searchParams.get('count')).toBe('5');
    expect(requestUrl.searchParams.get('language')).toBe('pt');
    expect(requestUrl.searchParams.get('format')).toBe('json');
  });

  it('returns an empty result without a request for blank input', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('   ')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('treats valid empty geocoding responses as empty and rejects malformed payloads', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ generationtime_ms: 0.1 }))),
    );
    await expect(searchCities('Oslo')).resolves.toEqual([]);

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({}))),
    );
    await expect(searchCities('Lisboa')).rejects.toThrow('Resposta de busca inválida');

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ results: 'Lisboa' }))),
    );
    await expect(searchCities('Lisboa')).rejects.toThrow('Resposta de busca inválida');
  });

  it('aborts a request that exceeds the network timeout', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(init.signal?.reason), {
            once: true,
          });
        }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const request = searchCities('Lisboa');
    const timeoutExpectation = expect(request).rejects.toThrow('A solicitação expirou.');
    await vi.advanceTimersByTimeAsync(10_000);

    await timeoutExpectation;
  });

  it('requests current conditions and five-day forecast for the city', async () => {
    const dailyDates = ['2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15'];
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          current: {
            temperature_2m: 21,
            relative_humidity_2m: 62,
            wind_speed_10m: 14,
            surface_pressure: 1016,
            precipitation: 0.2,
            weather_code: 2,
          },
          daily: {
            time: dailyDates,
            weather_code: [2, 0, 61, 3, 1],
            temperature_2m_max: [23, 24, 22, 21, 23],
            temperature_2m_min: [16, 17, 15, 14, 16],
            precipitation_probability_max: [10, 0, 60, 20, 5],
          },
        }),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const weather = await getWeather(city);
    const requestUrl = new URL(fetchMock.mock.calls[0][0] as string);

    expect(requestUrl.searchParams.get('latitude')).toBe('38.72');
    expect(requestUrl.searchParams.get('longitude')).toBe('-9.14');
    expect(requestUrl.searchParams.get('forecast_days')).toBe('5');
    expect(requestUrl.searchParams.get('timezone')).toBe('auto');
    expect(weather.city).toBe('Lisboa');
    expect(weather.temperatureC).toBe(21);
    expect(weather.metrics.humidity).toBe(62);
    expect(weather.forecast).toHaveLength(5);
    expect(weather.forecast[0].precipitationProbability).toBe(10);
    expect(weather.forecast[2].condition).toBe('Chuva');
  });

  it('rejects unsuccessful and unusable forecast responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })));
    await expect(getWeather(city)).rejects.toThrow('status 503');

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ current: {}, daily: {} }))),
    );
    await expect(getWeather(city)).rejects.toThrow('sem dados utilizáveis');

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            current: {},
            daily: {
              time: ['2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15'],
            },
          }),
        ),
      ),
    );
    await expect(getWeather(city)).rejects.toThrow('sem dados utilizáveis');
  });

  it('preserves usable values and marks missing fields in a partial forecast', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            current: { temperature_2m: 21, weather_code: 0 },
            daily: { time: ['2026-11-11'], weather_code: [0] },
          }),
        ),
      ),
    );

    const weather = await getWeather(city);

    expect(weather.temperatureC).toBe(21);
    expect(weather.metrics.humidity).toBeNull();
    expect(weather.forecast).toHaveLength(1);
    expect(weather.forecast[0].highC).toBeNull();
    expect(weather.forecast[0].lowC).toBeNull();
    expect(weather.forecast[0].precipitationProbability).toBeNull();
  });
});
