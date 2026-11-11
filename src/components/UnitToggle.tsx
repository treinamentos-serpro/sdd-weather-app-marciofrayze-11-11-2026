import type { TemperatureUnit } from '../types/weather';

interface UnitToggleProps {
  unit: TemperatureUnit;
  onChange: (unit: TemperatureUnit) => void;
}

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  return (
    <div
      aria-label="Unidade de temperatura"
      className="flex shrink-0 items-center rounded-lg border border-white/10 bg-white/[0.045] p-1 backdrop-blur-md"
      role="group"
    >
      <button
        aria-label="Celsius"
        aria-pressed={unit === 'C'}
        className={`min-w-12 rounded-md px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-200 ${unit === 'C' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
        onClick={() => onChange('C')}
        type="button"
      >
        °C
      </button>
      <button
        aria-label="Fahrenheit"
        aria-pressed={unit === 'F'}
        className={`min-w-12 rounded-md px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-200 ${unit === 'F' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
        onClick={() => onChange('F')}
        type="button"
      >
        °F
      </button>
    </div>
  );
}