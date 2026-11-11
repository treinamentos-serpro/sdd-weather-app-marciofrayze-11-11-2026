import type { Ref } from 'react';

interface ErrorStateProps {
  onRetry: () => void;
  titleRef?: Ref<HTMLHeadingElement>;
}

export default function ErrorState({ onRetry, titleRef }: ErrorStateProps) {
  return (
    <section
      aria-labelledby="error-title"
      className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-rose-200/15 bg-rose-300/[0.04] px-6 text-center"
      role="alert"
    >
      <span aria-hidden="true" className="text-3xl text-rose-200">
        !
      </span>
      <h2
        className="mt-3 text-lg font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-200"
        id="error-title"
        ref={titleRef}
        tabIndex={-1}
      >
        Não foi possível atualizar
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-300">
        Tente novamente em instantes.
      </p>
      <button
        className="mt-5 rounded-md border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-200"
        onClick={onRetry}
        type="button"
      >
        Tentar novamente
      </button>
    </section>
  );
}
