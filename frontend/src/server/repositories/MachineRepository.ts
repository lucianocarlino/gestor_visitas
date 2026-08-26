/**
 * MachineRepository - Data Access Layer for Cabezales, Caseteras, and Frenos
 */

import { Cabezal, Casetera, Freno, Movimiento, Status } from '../../types/domain';
import { DatabaseStore } from './DatabaseStore';

export interface IMachineRepository {
  // Cabezal
  findAllCabezales(): Cabezal[];
  findCabezalById(id: string): Cabezal | null;
  saveCabezal(cabezal: Cabezal): Cabezal;
  deleteCabezal(id: string): boolean;

  // Casetera
  findAllCaseteras(): Casetera[];
  findCaseteraById(id: number): Casetera | null;
  saveCasetera(casetera: Casetera): Casetera;
  deleteCasetera(id: number): boolean;

  // Freno
  findAllFrenos(): Freno[];
  findFrenoById(id: string): Freno | null;
  saveFreno(freno: Freno): Freno;
  deleteFreno(id: string): boolean;

  // Movimientos
  addMovimiento(movimiento: Movimiento): void;
  findMovimientosByMachine(machineId: string): Movimiento[];
  findAllMovimientos(): Movimiento[];
}

export class MachineRepository implements IMachineRepository {
  private store = DatabaseStore.getInstance();

  public findAllCabezales(): Cabezal[] {
    return Array.from(this.store.cabezales.values());
  }

  public findCabezalById(id: string): Cabezal | null {
    return this.store.cabezales.get(id) || null;
  }

  public saveCabezal(cabezal: Cabezal): Cabezal {
    this.store.cabezales.set(cabezal.id, cabezal);
    return cabezal;
  }

  public deleteCabezal(id: string): boolean {
    return this.store.cabezales.delete(id);
  }

  public findAllCaseteras(): Casetera[] {
    return Array.from(this.store.caseteras.values());
  }

  public findCaseteraById(id: number): Casetera | null {
    return this.store.caseteras.get(id) || null;
  }

  public saveCasetera(casetera: Casetera): Casetera {
    this.store.caseteras.set(casetera.id, casetera);
    return casetera;
  }

  public deleteCasetera(id: number): boolean {
    return this.store.caseteras.delete(id);
  }

  public findAllFrenos(): Freno[] {
    return Array.from(this.store.frenos.values());
  }

  public findFrenoById(id: string): Freno | null {
    return this.store.frenos.get(id) || null;
  }

  public saveFreno(freno: Freno): Freno {
    this.store.frenos.set(freno.id, freno);
    return freno;
  }

  public deleteFreno(id: string): boolean {
    return this.store.frenos.delete(id);
  }

  public addMovimiento(movimiento: Movimiento): void {
    this.store.movimientos.unshift(movimiento);
    const cab = this.store.cabezales.get(movimiento.machine_id);
    if (cab) cab.historial_movimientos.unshift(movimiento);

    const casId = Number(movimiento.machine_id);
    if (!isNaN(casId)) {
      const cas = this.store.caseteras.get(casId);
      if (cas) cas.historial_movimientos.unshift(movimiento);
    }

    const frn = this.store.frenos.get(movimiento.machine_id);
    if (frn) frn.historial_movimientos.unshift(movimiento);
  }

  public findMovimientosByMachine(machineId: string): Movimiento[] {
    const fromGlobal = this.store.movimientos.filter((m) => m.machine_id === machineId);
    const cab = this.store.cabezales.get(machineId);
    const cas = this.store.caseteras.get(Number(machineId));
    const frn = this.store.frenos.get(machineId);
    const specific = cab?.historial_movimientos || cas?.historial_movimientos || frn?.historial_movimientos || [];

    const map = new Map<string, Movimiento>();
    [...fromGlobal, ...specific].forEach((m) => map.set(m.id, m));
    return Array.from(map.values());
  }

  public findAllMovimientos(): Movimiento[] {
    return [...this.store.movimientos];
  }
}
