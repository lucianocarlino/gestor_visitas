/**
 * OfflineSync - Manages offline visit queues, localStorage persistence, and auto-sync
 * Adheres strictly to RF21, RF22, RF23 and RNF05 specifications
 */

import { CreateVisitDTO } from '../types/domain';
import { visitsApi } from './apiClient';

const STORAGE_KEY = 'sinclair_pending_offline_visits_v1';

export interface PendingVisitItem {
  id: string;
  dto: CreateVisitDTO;
  timestamp: string;
  retries: number;
}

export class OfflineSyncManager {
  private static instance: OfflineSyncManager;
  private listeners: ((pendingCount: number) => void)[] = [];

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.syncPendingVisits();
      });
    }
  }

  public static getInstance(): OfflineSyncManager {
    if (!OfflineSyncManager.instance) {
      OfflineSyncManager.instance = new OfflineSyncManager();
    }
    return OfflineSyncManager.instance;
  }

  public getPendingVisits(): PendingVisitItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public saveOfflineVisit(dto: CreateVisitDTO): PendingVisitItem {
    const pendingList = this.getPendingVisits();
    const item: PendingVisitItem = {
      id: dto.id || `OFFLINE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      dto: { ...dto, id: dto.id || `OFFLINE-${Date.now()}` },
      timestamp: new Date().toISOString(),
      retries: 0,
    };

    pendingList.push(item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingList));
    this.notifyListeners();
    return item;
  }

  public removePendingVisit(id: string): void {
    const filtered = this.getPendingVisits().filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    this.notifyListeners();
  }

  public clearAllPending(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.notifyListeners();
  }

  public async syncPendingVisits(): Promise<{
    syncedCount: number;
    failedCount: number;
    errors: string[];
  }> {
    const pendingList = this.getPendingVisits();
    if (pendingList.length === 0) {
      return { syncedCount: 0, failedCount: 0, errors: [] };
    }

    try {
      const dtos = pendingList.map((item) => item.dto);
      const res = await visitsApi.syncBatch(dtos);

      if (res.synced && res.synced.length > 0) {
        // Remove successfully synced visits
        const syncedIds = new Set(res.synced.map((s) => s.id));
        const remaining = pendingList.filter((item) => !syncedIds.has(item.dto.id || item.id));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
        this.notifyListeners();
      }

      return {
        syncedCount: res.synced?.length || 0,
        failedCount: res.errors?.length || 0,
        errors: res.errors || [],
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network sync failed';
      return {
        syncedCount: 0,
        failedCount: pendingList.length,
        errors: [msg],
      };
    }
  }

  public subscribe(listener: (pendingCount: number) => void): () => void {
    this.listeners.push(listener);
    listener(this.getPendingVisits().length);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    const count = this.getPendingVisits().length;
    this.listeners.forEach((l) => l(count));
  }
}
