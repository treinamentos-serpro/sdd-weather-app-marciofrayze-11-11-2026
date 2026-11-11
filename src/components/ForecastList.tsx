import type { ForecastDay, TemperatureUnit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecast: ForecastDay[];
  unit: TemperatureUnit;
}

export default function ForecastList({ forecast, unit }: ForecastListProps) {
  return (
    <section aria-labelledby="forecast-title" className="mt-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-200/80">
            Próximos dias
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white" id="forecast-title">
            Previsão de 5 dias
          </h2>
        </div>
        <span className="pb-1 text-xs text-slate-400">Máx. / mín.</span>
      </div>
      {forecast.length < 5 && (
        <p className="mb-3 text-sm text-amber-100" role="status">
          {forecast.length === 0
            ? 'Previsão indisponível.'
            : `Previsão parcial: ${forecast.length} de 5 dias disponíveis.`}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {forecast.map((day) => (
          <ForecastCard day={day} key={day.id} unit={unit} />
        ))}
      </div>
    </section>
  );
}