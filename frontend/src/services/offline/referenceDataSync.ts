import { coreApi } from '../apiClient';
import { subscribeToConnectivity } from '../../platform/connectivity';

/** Refreshes the local reference-data snapshots when the device regains connectivity. */
export function registerReferenceDataRefresh(): () => void {
  const refresh = () => {
    void Promise.allSettled([coreApi.getEmpaques(), coreApi.getTecnicos()]);
  };

  return subscribeToConnectivity((isOnline) => {
    if (isOnline) refresh();
  });
}
