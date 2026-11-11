import { expect, type Page, test } from '@playwright/test';

const city = {
  id: 123,
  name: 'Lisboa',
  country: 'Portugal',
  admin1: 'Lisboa',
  latitude: 38.72,
  longitude: -9.14,
};

const forecastDates = ['2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15'];

const weatherPayload = {
  current: {
    temperature_2m: 21,
    relative_humidity_2m: 62,
    wind_speed_10m: 14,
    surface_pressure: 1016,
    precipitation: 0.2,
    weather_code: 2,
  },
  daily: {
    time: forecastDates,
    weather_code: [2, 0, 61, 3, 1],
    temperature_2m_max: [24, 25, 22, 21, 23],
    temperature_2m_min: [16, 17, 15, 14, 16],
    precipitation_probability_max: [10, 0, 60, 20, 5],
  },
};

async function mockCitySearch(page: Page, results: (typeof city)[] = [city]) {
  await page.route('https://geocoding-api.open-meteo.com/**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ results }),
    });
  });
}

async function mockForecast(page: Page, status = 200, payload: unknown = weatherPayload) {
  let requestCount = 0;
  await page.route('https://api.open-meteo.com/**', async (route) => {
    requestCount += 1;
    await route.fulfill({
      contentType: 'application/json',
      status,
      body: status === 200 ? JSON.stringify(payload) : 'Unavailable',
    });
  });
  return () => requestCount;
}

test.beforeEach(async ({ page }) => {
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === 'localhost') {
      await route.continue();
      return;
    }
    await route.abort();
  });
});

test('searches, selects a city, displays five days, and switches units by keyboard', async ({
  page,
}) => {
  await mockCitySearch(page);
  const getForecastRequestCount = await mockForecast(page);
  if (test.info().project.name === 'mobile') {
    await page.setViewportSize({ width: 320, height: 720 });
  }
  await page.goto('/');

  const search = page.getByRole('searchbox', { name: 'Buscar cidade' });
  await search.fill('Lisboa');
  await search.press('Enter');

  const cityResult = page.getByRole('button', { name: /Lisboa.*Portugal/ });
  await expect(cityResult).toBeVisible();
  await cityResult.focus();
  await cityResult.press('Enter');

  await expect(page.getByRole('heading', { name: /Lisboa/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(5);
  await expect(page.getByText('21°')).toBeVisible();

  const fahrenheit = page.getByRole('button', { name: 'Fahrenheit' });
  await fahrenheit.focus();
  await fahrenheit.press('Enter');
  await expect(page.getByText('70°')).toBeVisible();
  await expect(page.getByText('75°')).toBeVisible();
  await expect(fahrenheit).toHaveAttribute('aria-pressed', 'true');
  expect(getForecastRequestCount()).toBe(1);

  if (test.info().project.name === 'mobile') {
    const viewportWidth = page.viewportSize()?.width;
    const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(documentWidth).toBeLessThanOrEqual(viewportWidth ?? 0);
  }
});

test('shows placeholders and warns when only partial weather data is available', async ({
  page,
}) => {
  await mockCitySearch(page);
  await mockForecast(page, 200, {
    current: { weather_code: 2, temperature_2m: null },
    daily: {
      time: forecastDates.slice(0, 2),
      weather_code: [0],
      temperature_2m_max: [25],
      temperature_2m_min: [],
      precipitation_probability_max: [10],
    },
  });
  await page.goto('/');

  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('Lisboa');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByRole('button', { name: /Lisboa.*Portugal/ }).click();

  const currentWeather = page.getByRole('region', { name: /Lisboa/ });
  const forecast = page.getByRole('region', { name: 'Previsão de 5 dias' });
  await expect(currentWeather.getByText('—', { exact: true }).first()).toBeVisible();
  await expect(forecast.getByRole('status')).toHaveText(
    'Previsão parcial: 1 de 5 dias disponíveis.',
  );
  await expect(forecast.getByRole('article')).toHaveCount(1);
});

test('communicates when a city search has no results', async ({ page }) => {
  await mockCitySearch(page, []);
  await page.goto('/');

  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('Oslo');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Cidade não encontrada' })).toBeVisible();
});

test('communicates a weather request failure', async ({ page }) => {
  await mockCitySearch(page);
  await mockForecast(page, 503);
  await page.goto('/');

  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('Lisboa');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByRole('button', { name: /Lisboa.*Portugal/ }).click();

  await expect(page.getByRole('alert')).toContainText('Não foi possível atualizar');
});
