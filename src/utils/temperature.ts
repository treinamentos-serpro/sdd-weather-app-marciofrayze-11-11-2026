import type { TemperatureUnit } from '../types/weather';

export function formatTemperature(
  temperatureC: number | null | undefined,
  unit: TemperatureUnit,
): string {
  if (typeof temperatureC !== 'number' || !Number.isFinite(temperatureC)) {
    return '—';
  }

  const temperature = unit === 'F' ? (temperatureC * 9) / 5 + 32 : temperatureC;
  return String(Math.round(temperature));
}

export function formatTemperatureLabel(
  temperatureC: number | null | undefined,
  unit: TemperatureUnit,
): string {
  const formattedTemperature = formatTemperature(temperatureC, unit);
  return formattedTemperature === '—' ? formattedTemperature : `${formattedTemperature}°`;
}
