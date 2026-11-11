import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { getWeather, searchCities } from '../../src/services/weatherService';
import type { City, WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', () => ({
  getWeather: vi.fn(),
  searchCities: vi.fn(),
}));

afterEach(cleanup);

const city: City = {
  id: 'lisboa-1',
  name: 'Lisboa',
  country: 'Portugal',
  region: 'Lisboa',
  latitude: 38.72,
  longitude: -9.14,
};

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
  forecast: Array.from({ length: 5 }, (_, index) => ({
    id: `2026-11-${11 + index}`,
    label: index === 0 ? 'Hoje' : 'Qui',
    date: `${11 + index} nov`,
    icon: '☀️',
    condition: 'Céu limpo',
    highC: 24 + index,
    lowC: 16 + index,
    precipitationProbability: 10,
  })),
};

describe('Weather app experience', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows an initial prompt before a city is searched', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Comece por uma cidade' })).toBeInTheDocument();
    expect(searchCities).not.toHaveBeenCalled();
  });

  it('searches, selects a city, loads current weather and five-day forecast', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities).mockResolvedValue([city]);
    vi.mocked(getWeather).mockResolvedValue(weather);
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'Lisboa');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.click(await screen.findByRole('button', { name: /Lisboa, Portugal/i }));

    expect(await screen.findByRole('heading', { name: /lisboa/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /previsão de 5 dias/i })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(5);
    expect(searchCities).toHaveBeenCalledWith('Lisboa', expect.any(AbortSignal));
    expect(getWeather).toHaveBeenCalledWith(city, expect.any(AbortSignal));
  });

  it('lets the user distinguish and select homonymous cities by region', async () => {
    const user = userEvent.setup();
    const cityInAnotherRegion: City = { ...city, id: 'lisboa-2', region: 'Porto' };
    vi.mocked(searchCities).mockResolvedValue([city, cityInAnotherRegion]);
    vi.mocked(getWeather).mockResolvedValue(weather);
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'Lisboa');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.click(await screen.findByRole('button', { name: /Porto, Portugal/i }));

    expect(getWeather).toHaveBeenCalledWith(cityInAnotherRegion, expect.any(AbortSignal));
  });

  it('updates current and forecast temperatures when the unit changes', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities).mockResolvedValue([city]);
    vi.mocked(getWeather).mockResolvedValue(weather);
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'Lisboa');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.click(await screen.findByRole('button', { name: /Lisboa, Portugal/i }));
    await screen.findByRole('heading', { name: /previsão de 5 dias/i });
    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    expect(screen.getByText('70°')).toBeInTheDocument();
    expect(screen.getByText('75°')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fahrenheit' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(getWeather).toHaveBeenCalledTimes(1);
  });

  it('shows an empty state when the search has no matches', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities).mockResolvedValue([]);
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'Oslo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(
      await screen.findByRole('heading', { name: 'Cidade não encontrada' }),
    ).toBeInTheDocument();
  });

  it('shows an error state when geocoding fails', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities).mockRejectedValue(new Error('offline'));
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'Lisboa');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível atualizar');
  });

  it('retries the last failed search', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce([city]);
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'Lisboa');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await screen.findByRole('alert');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByRole('heading', { name: 'Escolha uma cidade' })).toBeInTheDocument();
    expect(searchCities).toHaveBeenCalledTimes(2);
  });

  it('communicates loading until the search and weather request complete', async () => {
    const user = userEvent.setup();
    let finishSearch!: (cities: City[]) => void;
    let finishWeather!: (result: WeatherData) => void;
    vi.mocked(searchCities).mockReturnValue(
      new Promise((resolve) => {
        finishSearch = resolve;
      }),
    );
    vi.mocked(getWeather).mockReturnValue(
      new Promise((resolve) => {
        finishWeather = resolve;
      }),
    );
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'Lisboa');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(screen.getByRole('status')).toHaveTextContent('Buscando cidades...');
    expect(screen.getByRole('search')).toHaveAttribute('aria-busy', 'true');

    finishSearch([city]);
    expect(await screen.findByRole('heading', { name: 'Escolha uma cidade' })).toHaveFocus();
    await user.click(await screen.findByRole('button', { name: /Lisboa, Portugal/i }));
    expect(screen.getByRole('status')).toHaveTextContent('Consultando condições...');

    finishWeather(weather);
    expect(await screen.findByRole('heading', { name: /previsão de 5 dias/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /lisboa/i })).toHaveFocus();
    expect(screen.getByRole('search')).toHaveAttribute('aria-busy', 'false');
  });

  it('applies a unit change made while weather is loading', async () => {
    const user = userEvent.setup();
    let finishWeather!: (result: WeatherData) => void;
    vi.mocked(searchCities).mockResolvedValue([city]);
    vi.mocked(getWeather).mockReturnValue(
      new Promise((resolve) => {
        finishWeather = resolve;
      }),
    );
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'Lisboa');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.click(await screen.findByRole('button', { name: /Lisboa, Portugal/i }));
    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    finishWeather(weather);

    expect(await screen.findByText('70°')).toBeInTheDocument();
    expect(screen.getByText('75°')).toBeInTheDocument();
    expect(getWeather).toHaveBeenCalledTimes(1);
  });

  it('shows an error when the selected city weather cannot be loaded', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities).mockResolvedValue([city]);
    vi.mocked(getWeather).mockRejectedValue(new Error('offline'));
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'Lisboa');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.click(await screen.findByRole('button', { name: /Lisboa, Portugal/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível atualizar');
  });

  it('retries a failed weather request for the selected city', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities).mockResolvedValue([city]);
    vi.mocked(getWeather)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(weather);
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'Lisboa');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.click(await screen.findByRole('button', { name: /Lisboa, Portugal/i }));
    await screen.findByRole('alert');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByRole('heading', { name: /previsão de 5 dias/i })).toBeInTheDocument();
    expect(getWeather).toHaveBeenCalledTimes(2);
  });

  it('does not search when the city field contains only spaces', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), '   ');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(searchCities).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Comece por uma cidade' })).toBeInTheDocument();
  });
});
