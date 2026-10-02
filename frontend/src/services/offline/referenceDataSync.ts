import { coreApi } from '../apiClient';

/** Refreshes the local reference-data snapshots when the browser regains connectivity. */
export function registerReferenceDataRefresh(): () => void {
  if (typeof window === 'undefined') return () => undefined;

  const refresh = () => {
    void Promise.allSettled([coreApi.getEmpaques(), coreApi.getTecnicos()]);
  };

  window.addEventListener('online', refresh);
  return () => window.removeEventListener('online', refresh);
}
