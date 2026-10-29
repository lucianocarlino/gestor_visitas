/**
 * Runtime platform detection.
 * Returns true only inside the Capacitor Android/iOS shell; always false in the web browser.
 */

import { Capacitor } from '@capacitor/core';

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}
