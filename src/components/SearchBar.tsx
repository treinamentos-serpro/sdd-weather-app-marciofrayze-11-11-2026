import { type FormEvent, useState } from 'react';

interface SearchBarProps {
  isLoading: boolean;
  onSearch: (query: string) => void;
}

export default function SearchBar({ isLoading, onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();

    if (trimmedQuery) {
      onSearch(trimmedQuery);
    }
  }

  return (
    <form
      aria-label="Buscar cidade"
      aria-busy={isLoading}
      className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] p-1.5 shadow-glass backdrop-blur-md transition focus-within:border-teal-200/50 focus-within:ring-2 focus-within:ring-teal-200/20"
      onSubmit={handleSubmit}
      role="search"
    >
      <label className="sr-only" htmlFor="city-search">
        Buscar cidade
      </label>
      <span aria-hidden="true" className="pl-3 text-lg text-teal-100/70">
        ⌕
      </span>
      <input
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-white outline-none placeholder:text-slate-400 disabled:cursor-wait disabled:opacity-70"
        disabled={isLoading}
        id="city-search"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar cidade"
        type="search"
        value={query}
      />
      <button
        className="rounded-md bg-teal-200 px-4 py-2 text-sm font-semibold text-night-900 transition hover:bg-teal-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-wait disabled:opacity-60"
        disabled={isLoading}
        type="submit"
      >
        Buscar
      </button>
    </form>
  );
}
