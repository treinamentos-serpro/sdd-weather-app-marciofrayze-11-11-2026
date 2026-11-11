import type { Ref } from 'react';
import type { TemperatureUnit, WeatherData } from '../types/weather';
import { formatTemperatureLabel } from '../utils/temperature';

interface CurrentWeatherProps {
  titleRef?: Ref<HTMLHeadingElement>;
  weather: WeatherData;
  unit: TemperatureUnit;
}

export default function CurrentWeather({ titleRef, weather, unit }: CurrentWeatherProps) {
  const metrics = [
    {
      label: 'Umidade',
      value: weather.metrics.humidity === null ? '—' : `${weather.metrics.humidity}%`,
      icon: '◌',
    },
    {
      label: 'Vento',
      value: weather.metrics.windKmh === null ? '—' : `${weather.metrics.windKmh} km/h`,
      icon: '↗',
    },
    {
      label: 'Precipitação',
      value:
        weather.metrics.precipitationMm === null
          ? '—'
          : `${weather.metrics.precipitationMm.toFixed(1)} mm`,
      icon: '⌁',
    },
    {
      label: 'Pressão',
      value: weather.metrics.pressureHpa === null ? '—' : `${weather.metrics.pressureHpa} hPa`,
      icon: '◉',
    },
  ];

  return (
    <section
      aria-labelledby="current-weather-title"
      className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.055] shadow-glass backdrop-blur-md"
    >
      <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center md:px-10 md:py-9">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-teal-200/80">
            Condições atuais
          </p>
          <h1
            className="text-3xl font-semibold tracking-tight text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-200 sm:text-4xl"
            id="current-weather-title"
            ref={titleRef}
            tabIndex={-1}
          >
            {weather.city}
            <span className="ml-2 text-base font-normal text-slate-400">{weather.country}</span>
          </h1>
          <p className="mt-2 text-base text-slate-300">{weather.condition}</p>
          <div className="mt-5 flex items-start text-white">
            <span className="text-7xl font-light leading-none sm:text-8xl">
              {formatTemperatureLabel(weather.temperatureC, unit)}
            </span>
            {weather.temperatureC !== null && (
              <span className="mt-2 text-xl font-medium text-slate-300">{unit}</span>
            )}
          </div>
        </div>
        <div
          aria-hidden="true"
          className="flex h-32 w-32 items-center justify-center self-center text-8xl drop-shadow-[0_0_28px_rgba(245,185,66,0.2)] sm:h-40 sm:w-40 sm:text-9xl"
        >
          {weather.icon}
        </div>
      </div>

      <div className="grid grid-cols-2 border-t border-white/10 sm:grid-cols-4">
        {metrics.map((metric, index) => (
          <div
            className={`px-5 py-4 sm:px-7 sm:py-5 ${index % 2 === 0 ? 'border-r border-white/10 sm:border-r-0' : ''} ${index < 2 ? 'border-b border-white/10 sm:border-b-0' : ''} ${index > 0 && index < 3 ? 'sm:border-l sm:border-white/10' : ''}`}
            key={metric.label}
          >
            <div className="flex items-center gap-2 text-slate-400">
              <span aria-hidden="true" className="text-teal-200/80">
                {metric.icon}
              </span>
              <span className="text-xs sm:text-sm">{metric.label}</span>
            </div>
            <p className="mt-2 text-base font-semibold text-white sm:text-lg">{metric.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
