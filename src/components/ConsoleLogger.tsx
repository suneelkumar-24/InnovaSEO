'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function ConsoleLogger() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initializedRef = useRef(false);

  // 1. Log Route Changes
  useEffect(() => {
    const fullUrl = searchParams?.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
    console.log(
      `%c[NICHE HUNTER 🧭 ROUTE]%c Navigated to: ${fullUrl} at ${new Date().toLocaleTimeString()}`,
      'background: #6366f1; color: #ffffff; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
      'color: #4338ca; font-weight: 600;'
    );
  }, [pathname, searchParams]);

  // 2. Global Fetch Interceptor & Telemetry
  useEffect(() => {
    if (typeof window === 'undefined' || initializedRef.current) return;
    initializedRef.current = true;

    console.log(
      '%c[NICHE HUNTER 📡 TELEMETRY ACTIVE]%c Console logging enabled for all API requests, background actions, and state transitions.',
      'background: #10b981; color: #ffffff; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
      'color: #047857; font-weight: 500;'
    );

    const originalFetch = window.fetch;

    window.fetch = async (...args: Parameters<typeof fetch>) => {
      const [input, init] = args;
      const url = typeof input === 'string' ? input : input instanceof Request ? input.url : String(input);
      const method = init?.method?.toUpperCase() || 'GET';
      const isApi = url.includes('/api/');

      if (isApi) {
        const startTime = performance.now();
        const timestamp = new Date().toLocaleTimeString();
        console.groupCollapsed(
          `%c[API REQ 🚀]%c ${method} ${url} %c(${timestamp})`,
          'background: #3b82f6; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 3px;',
          'color: #1e40af; font-weight: bold;',
          'color: #6b7280; font-size: 11px;'
        );
        if (init?.body) {
          try {
            console.log('Payload:', JSON.parse(init.body as string));
          } catch {
            console.log('Payload:', init.body);
          }
        }
        console.groupEnd();

        try {
          const response = await originalFetch(...args);
          const duration = Math.round(performance.now() - startTime);
          const status = response.status;
          const statusColor = response.ok ? '#10b981' : '#ef4444';

          if (duration > 3000) {
            console.warn(
              `%c[API SLOW ⚠️ ${duration}ms]%c ${method} ${url} responded after ${duration}ms`,
              'background: #f59e0b; color: #000; font-weight: bold; padding: 2px 4px; border-radius: 3px;',
              'color: #b45309; font-weight: bold;'
            );
          }

          if (!response.ok) {
            console.error(
              `%c[API ERR ❌ ${status}]%c ${method} ${url} in ${duration}ms`,
              `background: ${statusColor}; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 3px;`,
              'color: #b91c1c; font-weight: bold;'
            );
          } else {
            console.log(
              `%c[API OK ✅ ${status}]%c ${method} ${url} in ${duration}ms`,
              `background: ${statusColor}; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 3px;`,
              'color: #065f46; font-weight: 500;'
            );
          }

          return response;
        } catch (err: any) {
          const duration = Math.round(performance.now() - startTime);
          console.error(
            `%c[API FAIL 💥]%c ${method} ${url} failed after ${duration}ms:`,
            'background: #dc2626; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 3px;',
            'color: #991b1b; font-weight: bold;',
            err?.message || err
          );
          throw err;
        }
      }

      return originalFetch(...args);
    };

    // 3. Global Unhandled Errors Listener
    const handleGlobalError = (event: ErrorEvent) => {
      console.error(
        '%c[RUNTIME ERROR 💥]%c',
        'background: #b91c1c; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 3px;',
        'color: #991b1b; font-weight: bold;',
        event.message,
        event.filename,
        `Line ${event.lineno}:${event.colno}`,
        event.error
      );
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.warn(
        '%c[UNHANDLED PROMISE REJECTION ⚠️]%c',
        'background: #d97706; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 3px;',
        'color: #92400e; font-weight: bold;',
        event.reason
      );
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.fetch = originalFetch;
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}
