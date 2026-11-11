import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import ForecastList from '../../src/components/ForecastList';
import UnitToggle from '../../src/components/UnitToggle';
import type { ForecastDay, WeatherData } from '../../src/types/weather';

const forecast: ForecastDay[] = Array.from({ length: 5 }, (_, index) => ({
  id: `2026-11-${11 + index}`,
  label: index === 0 ? 'Hoje' : `Dia ${index + 1}`,
  date: `${11 + index} nov`,
  icon: '☀️',
  condition: 'Céu limpo',
  highC: 24 + index,
  lowC: 16 + index,
  precipitationProbability: 10,
}));

const weather: WeatherData = {
  city: 'Lisboa',
  country: 'Portugal',
  condition: 'Parcialmente nublado',
  icon: '⛅',
  temperatureC: 21,
  metrics: {
    humidity: 62,
    windKmh: 14,
    precipitationMm: 0.2,
    pressureHpa: 1016,
  },
  forecast,
};

describe('weather display', () => {
  it('presents the selected city and current conditions', () => {
    render(<CurrentWeather unit="C" weather={weather} />);

    expect(screen.getByRole('region', { name: /lisboa/i })).toBeInTheDocument();
    expect(screen.getByText('Parcialmente nublado')).toBeInTheDocument();
    expect(screen.getByText('21°')).toBeInTheDocument();
    expect(screen.getByText('Umidade')).toBeInTheDocument();
  });

  it('presents five forecast days in the selected temperature unit', () => {
    render(<ForecastList forecast={forecast} unit="F" />);

    expect(screen.getByRole('region', { name: 'Previsão de 5 dias' })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(5);
    expect(screen.getByText('75°')).toBeInTheDocument();
    expect(screen.getByText('61°')).toBeInTheDocument();
  });

  it('announces unit choices and the active unit accessibly', () => {
    const onChange = vi.fn();
    render(<UnitToggle onChange={onChange} unit="C" />);

    expect(screen.getByRole('group', { name: 'Unidade de temperatura' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Celsius' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Fahrenheit' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('shows placeholders and a warning when weather data is partial', () => {
    const partialForecast = forecast.slice(0, 2).map((day) => ({
      ...day,
      highC: null,
      lowC: null,
      precipitationProbability: null,
    }));
    const partialWeather: WeatherData = {
      ...weather,
      temperatureC: null,
      metrics: {
        humidity: null,
        windKmh: null,
        precipitationMm: null,
        pressureHpa: null,
      },
      forecast: partialForecast,
    };

    render(
      <>
        <CurrentWeather unit="C" weather={partialWeather} />
        <ForecastList forecast={partialForecast} unit="C" />
      </>,
    );

    const currentRegion = screen.getByRole('region', { name: /lisboa/i });
    const forecastRegion = screen.getByRole('region', { name: 'Previsão de 5 dias' });
    expect(within(currentRegion).getAllByText('—', { exact: true })).toHaveLength(5);
    expect(within(forecastRegion).getAllByRole('article')).toHaveLength(2);
    expect(within(forecastRegion).getByRole('status')).toHaveTextContent(
      'Previsão parcial: 2 de 5 dias disponíveis.',
    );
    expect(within(forecastRegion).getAllByText('—', { exact: true })).toHaveLength(4);
    expect(within(forecastRegion).getAllByText('Chuva —%')).toHaveLength(2);
  });
});
