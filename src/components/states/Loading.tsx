import type { Ref } from 'react';

interface LoadingProps {
  focusRef?: Ref<HTMLDivElement>;
  message?: string;
}

export default function Loading({ focusRef, message = 'Consultando condições...' }: LoadingProps) {
  return (
    <div
      aria-live="polite"
      className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-lg border border-white/10 bg-white/[0.04] text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-200"
      ref={focusRef}
      role="status"
      tabIndex={-1}
    >
      <span
        aria-hidden="true"
        className="h-9 w-9 animate-spin rounded-full border-2 border-white/15 border-t-teal-200"
      />
      <p className="text-sm text-slate-300">{message}</p>
    </div>
  );
}
