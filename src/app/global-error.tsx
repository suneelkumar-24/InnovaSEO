'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#faf9f6] text-slate-800 antialiased flex items-center justify-center min-h-screen p-4 font-sans">
        <div className="max-w-md w-full text-center bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Application Error</h2>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            {error?.message || 'A critical error occurred. Please try reloading.'}
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
