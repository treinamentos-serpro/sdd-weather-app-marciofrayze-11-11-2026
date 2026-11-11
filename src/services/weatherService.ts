import type { City, ForecastDay, WeatherData } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 10_000;

type JsonRecord = Record<string, unknown>;

const weekdayFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  timeZone: 'UTC',
});
const shortDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  timeZone: 'UTC',
});

function asRecord(value: unknown): JsonRecord | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as JsonRecord)
    : undefined;
}

function finiteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

async function requestJson(url: URL, signal?: AbortSignal): Promise<unknown> {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(new DOMException('A solicitação expirou.', 'TimeoutError')),
    REQUEST_TIMEOUT_MS,
  );
  const forwardAbort = () => controller.abort(signal?.reason);

  if (signal?.aborted) {
    forwardAbort();
  } else {
    signal?.addEventListener('abort', forwardAbort, { once: true });
  }

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`Open-Meteo respondeu com status ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', forwardAbort);
  }
}

function normalizeCity(value: unknown): City | undefined {
  const record = asRecord(value);

  if (!record) {
    return undefined;
  }

  const name = record?.name;
  const latitude = finiteNumber(record?.latitude);
  const longitude = finiteNumber(record?.longitude);

  if (typeof name !== 'string' || latitude === undefined || longitude === undefined) {
    return undefined;
  }

  const country = typeof record.country === 'string' ? record.country : '';
  const region = typeof record.admin1 === 'string' ? record.admin1 : undefined;
  const providerId = typeof record.id === 'number' ? String(record.id) : undefined;

  return {
    id: providerId ?? `${latitude},${longitude}`,
    name,
    country,
    region,
    latitude,
    longitude,
  };
}

export async function searchCities(query: string, signal?: AbortSignal): Promise<City[]> {
  const name = query.trim();

  if (!name) {
    return [];
  }

  const url = new URL(GEOCODING_URL);
  url.search = new URLSearchParams({
    name,
    count: '5',
    language: 'pt',
    format: 'json',
  }).toString();

  const payload = asRecord(await requestJson(url, signal));

  if (!payload) {
    throw new Error('Resposta de busca inválida');
  }

  const results = payload?.results;

  if (results === undefined) {
    if (finiteNumber(payload.generationtime_ms) !== undefined) {
      return [];
    }

    throw new Error('Resposta de busca inválida');
  }

  if (!Array.isArray(results)) {
    throw new Error('Resposta de busca inválida');
  }

  return results.map(normalizeCity).filter((city): city is City => city !== undefined);
}

function describeWeather(code: number): { condition: string; icon: string } {
  if (code === 0) return { condition: 'Céu limpo', icon: '☀️' };
  if (code === 1) return { condition: 'Predominantemente limpo', icon: '🌤️' };
  if (code === 2) return { condition: 'Parcialmente nublado', icon: '⛅' };
  if (code === 3) return { condition: 'Nublado', icon: '☁️' };
  if (code === 45 || code === 48) return { condition: 'Neblina', icon: '🌫️' };
  if ([51, 53, 55, 56, 57].includes(code)) {
    return { condition: 'Garoa', icon: '🌦️' };
  }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return { condition: 'Chuva', icon: '🌧️' };
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { condition: 'Neve', icon: '🌨️' };
  }
  if ([95, 96, 99].includes(code)) {
    return { condition: 'Trovoadas', icon: '⛈️' };
  }

  return { condition: 'Condição variável', icon: '🌡️' };
}

function toForecastDay(
  dateValue: unknown,
  codeValue: unknown,
  highValue: unknown,
  lowValue: unknown,
  precipitationValue: unknown,
  index: number,
): ForecastDay | undefined {
  const code = finiteNumber(codeValue);
  const high = finiteNumber(highValue);
  const low = finiteNumber(lowValue);
  const precipitationProbability = finiteNumber(precipitationValue);

  if (
    typeof dateValue !== 'string' ||
    (code === undefined &&
      high === undefined &&
      low === undefined &&
      precipitationProbability === undefined)
  ) {
    return undefined;
  }

  const date = new Date(`${dateValue}T12:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  const condition = code === undefined ? { condition: '—', icon: '—' } : describeWeather(code);
  const weekday = weekdayFormatter.format(date).replace('.', '');
  const formattedDate = shortDateFormatter.format(date).replace('.', '');

  return {
    id: dateValue,
    label: index === 0 ? 'Hoje' : weekday,
    date: formattedDate,
    icon: condition.icon,
    condition: condition.condition,
    highC: high ?? null,
    lowC: low ?? null,
    precipitationProbability: precipitationProbability ?? null,
  };
}

export async function getWeather(city: City, signal?: AbortSignal): Promise<WeatherData> {
  const url = new URL(FORECAST_URL);
  url.search = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,precipitation,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    forecast_days: '5',
    timezone: 'auto',
  }).toString();

  const payload = asRecord(await requestJson(url, signal));
  if (!payload) {
    throw new Error('Resposta meteorológica inválida');
  }

  const current = asRecord(payload.current) ?? {};
  const daily = asRecord(payload.daily) ?? {};
  const dailyDates = Array.isArray(daily.time) ? daily.time : [];
  const weatherCodes = Array.isArray(daily.weather_code) ? daily.weather_code : [];
  const highs = Array.isArray(daily.temperature_2m_max) ? daily.temperature_2m_max : [];
  const lows = Array.isArray(daily.temperature_2m_min) ? daily.temperature_2m_min : [];
  const precipitation = Array.isArray(daily.precipitation_probability_max)
    ? daily.precipitation_probability_max
    : [];
  const forecast = dailyDates
    .slice(0, 5)
    .map((date, index) =>
      toForecastDay(
        date,
        weatherCodes[index],
        highs[index],
        lows[index],
        precipitation[index],
        index,
      ),
    )
    .filter((day): day is ForecastDay => day !== undefined);
  const currentFields = [
    'temperature_2m',
    'relative_humidity_2m',
    'wind_speed_10m',
    'surface_pressure',
    'precipitation',
    'weather_code',
  ];
  const hasCurrentData = currentFields.some((field) => finiteNumber(current[field]) !== undefined);

  if (!hasCurrentData && forecast.length === 0) {
    throw new Error('Resposta meteorológica sem dados utilizáveis');
  }

  const currentCode = finiteNumber(current.weather_code);
  const currentWeather =
    currentCode === undefined ? { condition: '—', icon: '—' } : describeWeather(currentCode);

  return {
    city: city.name,
    country: city.country,
    condition: currentWeather.condition,
    icon: currentWeather.icon,
    temperatureC: finiteNumber(current.temperature_2m) ?? null,
    metrics: {
      humidity: finiteNumber(current.relative_humidity_2m) ?? null,
      windKmh: finiteNumber(current.wind_speed_10m) ?? null,
      precipitationMm: finiteNumber(current.precipitation) ?? null,
      pressureHpa: finiteNumber(current.surface_pressure) ?? null,
    },
    forecast,
  };
}
