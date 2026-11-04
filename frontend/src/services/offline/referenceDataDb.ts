import { Empaque, Tecnico } from '../../types/domain';

const DB_NAME = 'gestor-visitas-offline';
const DB_VERSION = 1;
const STORE_NAME = 'reference-data';

export type ReferenceDataKey = 'empaques' | 'tecnicos';

export interface CachedReferenceData<T> {
  data: T;
  updatedAt: string;
}

interface StoredReferenceData {
  key: ReferenceDataKey;
  data: Empaque[] | Tecnico[];
  updatedAt: string;
}

let databasePromise: Promise<IDBDatabase> | undefined;

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB no está disponible en este navegador.'));
  }

  if (!databasePromise) {
    databasePromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('No se pudo abrir IndexedDB.'));
      request.onblocked = () => reject(new Error('La actualización de IndexedDB está bloqueada.'));
    }).catch((error) => {
      databasePromise = undefined;
      throw error;
    });
  }

  return databasePromise;
}

export async function readReferenceData<T>(
  key: ReferenceDataKey,
): Promise<CachedReferenceData<T> | undefined> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result as CachedReferenceData<T> | undefined);
    request.onerror = () => reject(request.error ?? new Error('No se pudo leer la caché local.'));
  });
}

export async function writeReferenceData<T extends Empaque[] | Tecnico[]>(
  key: ReferenceDataKey,
  data: T,
): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put({
      key,
      data,
      updatedAt: new Date().toISOString(),
    } satisfies StoredReferenceData);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('No se pudo guardar la caché local.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('Se canceló el guardado local.'));
  });
}
