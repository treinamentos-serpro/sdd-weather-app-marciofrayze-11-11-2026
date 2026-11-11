import type { ForecastDay, TemperatureUnit } from '../types/weather';
import { formatTemperatureLabel } from '../utils/temperature';

interface ForecastCardProps {
  day: ForecastDay;
  unit: TemperatureUnit;
}

export default function ForecastCard({ day, unit }: ForecastCardProps) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.045] p-4 shadow-glass backdrop-blur-md transition hover:-translate-y-0.5 hover:border-teal-100/25 hover:bg-white/[0.07] sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white">{day.label}</h3>
          <p className="mt-1 text-xs text-slate-400">{day.date}</p>
        </div>
        <span aria-hidden="true" className="text-2xl leading-none sm:text-3xl">
          {day.icon}
        </span>
      </div>
      <p className="mt-4 min-h-10 text-xs leading-5 text-slate-400">{day.condition}</p>
      <p className="mt-2 text-xs text-teal-100/80">Chuva {day.precipitationProbability ?? '—'}%</p>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-lg font-semibold text-white">
          {formatTemperatureLabel(day.highC, unit)}
        </span>
        <span className="text-sm text-slate-400">{formatTemperatureLabel(day.lowC, unit)}</span>
      </div>
    </article>
  );
}
