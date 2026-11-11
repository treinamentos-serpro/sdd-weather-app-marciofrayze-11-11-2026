import { useEffect, useRef, useState } from 'react';
import { getWeather, searchCities } from '../services/weatherService';
import type { City, WeatherData, WeatherPhase } from '../types/weather';

export default function useWeather() {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [phase, setPhase] = useState<WeatherPhase>('idle');
  const [lastQuery, setLastQuery] = useState('');
  const requestController = useRef<AbortController | null>(null);
  const lastQueryRef = useRef('');
  const selectedCityRef = useRef<City | null>(null);

  useEffect(
    () => () => {
      requestController.current?.abort();
    },
    [],
  );

  async function search(query: string) {
    const trimmedQuery = query.trim();
    requestController.current?.abort();
    setCities([]);
    setSelectedCity(null);
    selectedCityRef.current = null;
    setWeather(null);
    setLastQuery(trimmedQuery);
    lastQueryRef.current = trimmedQuery;

    if (!trimmedQuery) {
      setPhase('idle');
      return;
    }

    const controller = new AbortController();
    requestController.current = controller;
    setPhase('searching');

    try {
      const results = await searchCities(trimmedQuery, controller.signal);

      if (controller.signal.aborted) {
        return;
      }

      setCities(results);
      setPhase(results.length ? 'results' : 'empty');
    } catch {
      if (!controller.signal.aborted) {
        setPhase('error');
      }
    }
  }

  async function selectCity(city: City) {
    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    selectedCityRef.current = city;
    setSelectedCity(city);
    setCities([]);
    setWeather(null);
    setPhase('loading');

    try {
      const result = await getWeather(city, controller.signal);

      if (controller.signal.aborted) {
        return;
      }

      setWeather(result);
      setPhase('ready');
    } catch {
      if (!controller.signal.aborted) {
        setPhase('error');
      }
    }
  }

  function retry() {
    if (selectedCityRef.current) {
      void selectCity(selectedCityRef.current);
      return;
    }

    if (lastQueryRef.current) {
      void search(lastQueryRef.current);
    }
  }

  return {
    cities,
    lastQuery,
    phase,
    retry,
    search,
    selectCity,
    selectedCity,
    weather,
  };
}