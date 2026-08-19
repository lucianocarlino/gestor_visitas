/**
 * EmpaqueRepository - Data Access Layer for Packing Plants
 */

import { Empaque } from '../../types/domain';
import { DatabaseStore } from './DatabaseStore';

export interface IEmpaqueRepository {
  findAll(): Empaque[];
  findById(id: string): Empaque | null;
  save(empaque: Empaque): Empaque;
  delete(id: string): boolean;
  updateLastVisit(id: string, date: string): void;
}

export class EmpaqueRepository implements IEmpaqueRepository {
  private store = DatabaseStore.getInstance();

  public findAll(): Empaque[] {
    return Array.from(this.store.empaques.values());
  }

  public findById(id: string): Empaque | null {
    return this.store.empaques.get(id) || null;
  }

  public save(empaque: Empaque): Empaque {
    this.store.empaques.set(empaque.id, empaque);
    return empaque;
  }

  public delete(id: string): boolean {
    return this.store.empaques.delete(id);
  }

  public updateLastVisit(id: string, date: string): void {
    const empaque = this.store.empaques.get(id);
    if (!empaque) return;
    empaque.ultima_visita = date;
    this.store.empaques.set(id, empaque);
  }
}
