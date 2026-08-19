/**
 * OperationRepository - Data Access Layer for Reemplazos, Cambios, and Servicios
 */

import { Cambio, Reemplazo, Servicio } from '../../types/domain';
import { DatabaseStore } from './DatabaseStore';

export interface IOperationRepository {
  // Reemplazos
  saveReemplazo(reemplazo: Reemplazo): Reemplazo;
  findAllReemplazos(): Reemplazo[];
  findReemplazosByMachine(machineId: string): Reemplazo[];

  // Cambios
  saveCambio(cambio: Cambio): Cambio;
  findAllCambios(): Cambio[];
  findCambiosByCabezal(cabezalId: string): Cambio[];
  findCambiosByFreno(frenoId: string): Cambio[];

  // Servicios
  saveServicio(servicio: Servicio): Servicio;
  findAllServicios(): Servicio[];
  findServiciosByMachine(machineId: string): Servicio[];
}

export class OperationRepository implements IOperationRepository {
  private store = DatabaseStore.getInstance();

  public saveReemplazo(reemplazo: Reemplazo): Reemplazo {
    this.store.reemplazos.unshift(reemplazo);
    return reemplazo;
  }

  public findAllReemplazos(): Reemplazo[] {
    return [...this.store.reemplazos];
  }

  public findReemplazosByMachine(machineId: string): Reemplazo[] {
    return this.store.reemplazos.filter(
      (r) => r.retirado_id === machineId || r.instalado_id === machineId
    );
  }

  public saveCambio(cambio: Cambio): Cambio {
    this.store.cambios.unshift(cambio);
    return cambio;
  }

  public findAllCambios(): Cambio[] {
    return [...this.store.cambios];
  }

  public findCambiosByCabezal(cabezalId: string): Cambio[] {
    return this.store.cambios.filter((c) => c.cabezal_id === cabezalId);
  }

  public findCambiosByFreno(frenoId: string): Cambio[] {
    return this.store.cambios.filter(
      (c) => c.retirado_freno_id === frenoId || c.instalado_freno_id === frenoId
    );
  }

  public saveServicio(servicio: Servicio): Servicio {
    this.store.servicios.unshift(servicio);
    return servicio;
  }

  public findAllServicios(): Servicio[] {
    return [...this.store.servicios];
  }

  public findServiciosByMachine(machineId: string): Servicio[] {
    return this.store.servicios.filter((s) => s.machine_id === machineId);
  }
}
