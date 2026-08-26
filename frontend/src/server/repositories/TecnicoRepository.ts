/**
 * TecnicoRepository - Data Access Layer for Field Technicians
 */

import { Tecnico } from '../../types/domain';
import { DatabaseStore } from './DatabaseStore';

export interface ITecnicoRepository {
  findAll(): Tecnico[];
  findById(id: string): Tecnico | null;
  save(tecnico: Tecnico): Tecnico;
  delete(id: string): boolean;
}

export class TecnicoRepository implements ITecnicoRepository {
  private store = DatabaseStore.getInstance();

  public findAll(): Tecnico[] {
    return Array.from(this.store.tecnicos.values());
  }

  public findById(id: string): Tecnico | null {
    return this.store.tecnicos.get(id) || null;
  }

  public save(tecnico: Tecnico): Tecnico {
    this.store.tecnicos.set(tecnico.id, tecnico);
    return tecnico;
  }

  public delete(id: string): boolean {
    return this.store.tecnicos.delete(id);
  }
}
