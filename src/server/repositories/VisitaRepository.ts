/**
 * VisitaRepository - Data Access Layer for Visits and Sinclair Reports
 */

import { Visita } from '../../types/domain';
import { DatabaseStore } from './DatabaseStore';

export interface IVisitaRepository {
  findAll(): Visita[];
  findById(id: string): Visita | null;
  findByEmpaque(empaqueId: string): Visita[];
  findByTecnico(tecnicoId: string): Visita[];
  findByDateRange(startDate: string, endDate: string): Visita[];
  save(visita: Visita): Visita;
  delete(id: string): boolean;
  getNextReportNumber(): number;
}

export class VisitaRepository implements IVisitaRepository {
  private store = DatabaseStore.getInstance();

  public findAll(): Visita[] {
    return Array.from(this.store.visitas.values()).sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
  }

  public findById(id: string): Visita | null {
    return this.store.visitas.get(id) || null;
  }

  public findByEmpaque(empaqueId: string): Visita[] {
    return this.findAll().filter((v) => v.empaque.id === empaqueId);
  }

  public findByTecnico(tecnicoId: string): Visita[] {
    return this.findAll().filter((v) => v.tecnicos.some((t) => t.id === tecnicoId));
  }

  public findByDateRange(startDate: string, endDate: string): Visita[] {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return this.findAll().filter((v) => {
      const visitTime = new Date(v.fecha).getTime();
      return visitTime >= start && visitTime <= end;
    });
  }

  public save(visita: Visita): Visita {
    this.store.visitas.set(visita.id, visita);
    return visita;
  }

  public delete(id: string): boolean {
    return this.store.visitas.delete(id);
  }

  public getNextReportNumber(): number {
    this.store.visitCounter += 1;
    return this.store.visitCounter;
  }
}
