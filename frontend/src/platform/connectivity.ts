/**
 * Connectivity abstraction (RF21-RF23, RNF05).
 * - Web: window 'online'/'offline' events and navigator.onLine (same behavior as before).
 * - Android (Capacitor): @capacitor/network, which reports the real OS network state
 *   more reliably than the WebView events.
 */

import { Network } from '@capacitor/network';
import type { PluginListenerHandle } from '@capacitor/core';
import { isNativeApp } from './nativePlatform';

export type ConnectivityListener = (isOnline: boolean) => void;

function browserIsOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/** Current connectivity status. */
export async function getConnectivityStatus(): Promise<boolean> {
  if (!isNativeApp()) return browserIsOnline();
  try {
    const status = await Network.getStatus();
    return status.connected;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Network plugin unavailable';
    console.warn('No se pudo consultar el estado de red nativo, usando navigator.onLine:', message);
    return browserIsOnline();
  }
}

function subscribeBrowser(listener: ConnectivityListener): () => void {
  const handleOnline = () => listener(true);
  const handleOffline = () => listener(false);
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

function subscribeNative(listener: ConnectivityListener): () => void {
  let handle: PluginListenerHandle | null = null;
  let disposed = false;

  void Network.addListener('networkStatusChange', (status) => listener(status.connected)).then((h) => {
    if (disposed) {
      void h.remove();
      return;
    }
    handle = h;
  });

  // Emit the initial native state so UI indicators start in sync with the OS.
  void getConnectivityStatus().then((online) => {
    if (!disposed) listener(online);
  });

  return () => {
    disposed = true;
    if (handle) void handle.remove();
  };
}

/** Subscribes to connectivity changes. Returns an unsubscribe function. */
export function subscribeToConnectivity(listener: ConnectivityListener): () => void {
  if (typeof window === 'undefined') return () => undefined;
  return isNativeApp() ? subscribeNative(listener) : subscribeBrowser(listener);
}
