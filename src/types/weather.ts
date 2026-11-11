export type TemperatureUnit = 'C' | 'F';

export interface City {
  id: string;
  name: string;
  country: string;
  region?: string;
  latitude: number;
  longitude: number;
}

export interface WeatherMetrics {
  humidity: number | null;
  windKmh: number | null;
  precipitationMm: number | null;
  pressureHpa: number | null;
}

export interface ForecastDay {
  id: string;
  label: string;
  date: string;
  icon: string;
  condition: string;
  highC: number | null;
  lowC: number | null;
  precipitationProbability: number | null;
}

export interface WeatherData {
  city: string;
  country: string;
  condition: string;
  icon: string;
  temperatureC: number | null;
  metrics: WeatherMetrics;
  forecast: ForecastDay[];
}

export type WeatherPhase =
  | 'idle'
  | 'searching'
  | 'results'
  | 'loading'
  | 'ready'
  | 'error'
  | 'empty';
