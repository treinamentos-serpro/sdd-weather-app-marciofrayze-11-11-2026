import type { Ref } from 'react';

interface EmptyStateProps {
  query: string;
  titleRef?: Ref<HTMLHeadingElement>;
}

export default function EmptyState({ query, titleRef }: EmptyStateProps) {
  const hasQuery = query.trim().length > 0;

  return (
    <section
      aria-labelledby="empty-title"
      className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] px-6 text-center"
      role="status"
    >
      <span aria-hidden="true" className="text-4xl text-slate-400">
        ⌕
      </span>
      <h2
        className="mt-3 text-lg font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-200"
        id="empty-title"
        ref={titleRef}
        tabIndex={-1}
      >
        {hasQuery ? 'Cidade não encontrada' : 'Comece por uma cidade'}
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-300">
        {hasQuery
          ? `Não encontramos resultados para “${query}”. Tente outra cidade.`
          : 'Busque uma cidade para consultar as condições atuais e a previsão.'}
      </p>
    </section>
  );
}
