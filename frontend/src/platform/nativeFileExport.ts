/**
 * Native file export for the Android app (Capacitor).
 * Android WebViews cannot handle blob downloads (<a download>, jsPDF.save, window.open(blob)),
 * so files are written with @capacitor/filesystem and handed to the OS share sheet
 * (@capacitor/share): save to Drive/Files, send by e-mail/WhatsApp, open in a PDF viewer, print...
 *
 * Only used when isNativeApp() is true. The web build keeps its original download code.
 */

import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { DomainError } from '../types/errors';

const EXPORT_FOLDER = 'VisitManager';

export class NativeFileExportError extends DomainError {
  public readonly statusCode = 500;
  constructor(fileName: string, details: string) {
    super(`No se pudo exportar el archivo '${fileName}': ${details}`, 'NATIVE_FILE_EXPORT_ERROR');
  }
}

export interface NativeExportOptions {
  /** true: keep a copy in Documents/VisitManager. false: temporary cache file (e.g. to print/open). */
  persist: boolean;
  /** Title shown in the Android share sheet. */
  dialogTitle?: string;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      resolve(result.substring(result.indexOf(',') + 1));
    };
    reader.onerror = () => reject(reader.error ?? new Error('FileReader error'));
    reader.readAsDataURL(blob);
  });
}

async function writeToCache(fileName: string, data: string): Promise<string> {
  const result = await Filesystem.writeFile({
    path: `${EXPORT_FOLDER}/${fileName}`,
    data,
    directory: Directory.Cache,
    recursive: true,
  });
  return result.uri;
}

/** Tries the public Documents folder; falls back to the app cache (e.g. Android 10 scoped storage). */
async function writeFile(fileName: string, data: string, persist: boolean): Promise<string> {
  if (!persist) return writeToCache(fileName, data);
  try {
    const result = await Filesystem.writeFile({
      path: `${EXPORT_FOLDER}/${fileName}`,
      data,
      directory: Directory.Documents,
      recursive: true,
    });
    return result.uri;
  } catch (error: unknown) {
    console.warn('No se pudo guardar en Documentos, se usa la caché de la app:', errorMessage(error));
    return writeToCache(fileName, data);
  }
}

function isShareCancellation(error: unknown): boolean {
  return /cancel/i.test(errorMessage(error));
}

async function openShareSheet(uri: string, fileName: string, dialogTitle?: string): Promise<void> {
  try {
    await Share.share({ title: fileName, files: [uri], dialogTitle: dialogTitle ?? fileName });
  } catch (error: unknown) {
    if (isShareCancellation(error)) return;
    throw error;
  }
}

/** Writes the blob to device storage and opens the Android share sheet. Returns the file URI. */
export async function exportFileNative(
  blob: Blob,
  fileName: string,
  options: NativeExportOptions,
): Promise<string> {
  try {
    const data = await blobToBase64(blob);
    const uri = await writeFile(fileName, data, options.persist);
    await openShareSheet(uri, fileName, options.dialogTitle);
    return uri;
  } catch (error: unknown) {
    throw new NativeFileExportError(fileName, errorMessage(error));
  }
}

/** Fire-and-forget variant for synchronous UI handlers: reports failures to the user. */
export function exportFileNativeSafely(blob: Blob, fileName: string, options: NativeExportOptions): void {
  exportFileNative(blob, fileName, options).catch((error: unknown) => {
    const message = error instanceof NativeFileExportError ? error.message : errorMessage(error);
    console.error(message);
    alert(message);
  });
}
