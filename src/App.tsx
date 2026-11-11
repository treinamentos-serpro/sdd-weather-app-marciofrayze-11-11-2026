import { useEffect, useRef, useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/Empty';
import ErrorState from './components/states/Error';
import Loading from './components/states/Loading';
import UnitToggle from './components/UnitToggle';
import useWeather from './hooks/useWeather';
import type { TemperatureUnit } from './types/weather';

export default function App() {
  const [unit, setUnit] = useState<TemperatureUnit>('C');
  const loadingRef = useRef<HTMLDivElement>(null);
  const resultsTitleRef = useRef<HTMLHeadingElement>(null);
  const errorTitleRef = useRef<HTMLHeadingElement>(null);
  const emptyTitleRef = useRef<HTMLHeadingElement>(null);
  const currentTitleRef = useRef<HTMLHeadingElement>(null);
  const { cities, lastQuery, phase, retry, search, selectCity, selectedCity, weather } =
    useWeather();

  const isLoading = phase === 'searching' || phase === 'loading';
  const cityLabel = weather?.city ?? selectedCity?.name ?? 'Selecione uma cidade';

  useEffect(() => {
    const focusTarget = {
      idle: null,
      searching: loadingRef.current,
      loading: loadingRef.current,
      results: resultsTitleRef.current,
      error: errorTitleRef.current,
      empty: emptyTitleRef.current,
      ready: currentTitleRef.current,
    }[phase];
    focusTarget?.focus();
  }, [phase]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-night-900 via-[#12212a] to-night-800 px-4 py-5 text-white sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-8">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-teal-100/20 bg-teal-100/10 text-xl text-teal-100"
            >
              ◉
            </span>
            <div>
              <p className="text-base font-bold tracking-[0.12em] text-white">NIMBO</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Clima local
              </p>
            </div>
          </div>
          <div className="col-span-2 row-start-2 md:col-span-1 md:col-start-2 md:row-start-1">
            <SearchBar isLoading={isLoading} onSearch={(query) => void search(query)} />
          </div>
          <div className="col-start-2 row-start-1 justify-self-end md:col-start-3 md:row-start-1">
            <UnitToggle onChange={setUnit} unit={unit} />
          </div>
        </header>

        <div className="mb-5 mt-10 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.16em] text-slate-400 sm:mt-14">
          <span className="h-px w-8 bg-teal-200/60" />
          <span>Visão geral</span>
          <span aria-hidden="true" className="text-slate-600">
            /
          </span>
          <span className="text-slate-300">{cityLabel}</span>
        </div>

        {isLoading ? (
          <Loading
            focusRef={loadingRef}
            message={phase === 'searching' ? 'Buscando cidades...' : 'Consultando condições...'}
          />
        ) : phase === 'error' ? (
          <ErrorState onRetry={retry} titleRef={errorTitleRef} />
        ) : phase === 'empty' ? (
          <EmptyState query={lastQuery} titleRef={emptyTitleRef} />
        ) : phase === 'results' ? (
          <section
            aria-labelledby="city-results-title"
            className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-glass backdrop-blur-md sm:p-7"
          >
            <h1
              className="text-lg font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-200"
              id="city-results-title"
              ref={resultsTitleRef}
              tabIndex={-1}
            >
              Escolha uma cidade
            </h1>
            <ul className="mt-4 divide-y divide-white/10">
              {cities.map((city) => (
                <li key={city.id}>
                  <button
                    className="flex w-full items-center justify-between gap-4 rounded-md px-3 py-4 text-left transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-200"
                    onClick={() => void selectCity(city)}
                    type="button"
                  >
                    <span>
                      <span className="block font-medium text-white">{city.name}</span>
                      <span className="mt-1 block text-sm text-slate-400">
                        {[city.region, city.country].filter(Boolean).join(', ')}
                      </span>
                    </span>
                    <span aria-hidden="true" className="text-teal-200">
                      →
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : phase === 'ready' && weather ? (
          <>
            <CurrentWeather titleRef={currentTitleRef} unit={unit} weather={weather} />
            <ForecastList forecast={weather.forecast} unit={unit} />
          </>
        ) : (
          <EmptyState query="" />
        )}

        <footer className="mt-10 border-t border-white/10 pt-4 text-xs text-slate-400">
          Dados meteorológicos por{' '}
          <a
            className="text-slate-300 underline decoration-white/20 underline-offset-2 hover:text-white"
            href="https://open-meteo.com/"
            rel="noreferrer"
            target="_blank"
          >
            Open-Meteo
          </a>
        </footer>
      </div>
    </main>
  );
}
