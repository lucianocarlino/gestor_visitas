/**
 * MachineService - Business logic for Cabezales, Caseteras, and Frenos
 * Adheres strictly to SDD and Clean Code specifications
 */

import { Cabezal, Casetera, Freno, Movimiento, Status } from '../../types/domain';
import { ConflictError, NotFoundError, ValidationError } from '../../types/errors';
import { IMachineRepository, MachineRepository } from '../repositories/MachineRepository';
import { DatabaseStore } from '../repositories/DatabaseStore';

export interface LocationEquipmentSummary {
  empaque_id: string;
  cabezales: Cabezal[];
  caseteras: Casetera[];
  frenos: Freno[];
  total: number;
}

export class MachineService {
  private repo: IMachineRepository;

  constructor(repo?: IMachineRepository) {
    this.repo = repo || new MachineRepository();
  }

  // --- Cabezales ---
  public getAllCabezales(): Cabezal[] {
    return this.repo.findAllCabezales();
  }

  public getCabezalById(id: string): Cabezal {
    const item = this.repo.findCabezalById(id);
    if (!item) throw new NotFoundError('Cabezal', id);
    return item;
  }

  public createCabezal(data: { id: string; estado?: Status; ubicacion: string }): Cabezal {
    if (!data.id) throw new ValidationError('Cabezal ID is required');
    if (!data.ubicacion) throw new ValidationError('Ubicacion is required');
    if (this.repo.findCabezalById(data.id)) {
      throw new ConflictError(`Cabezal ${data.id} already exists`);
    }

    const cabezal: Cabezal = {
      id: data.id,
      tipo: 'Cabezal',
      estado: data.estado || Status.READY,
      ubicacion: data.ubicacion,
      historial_movimientos: [],
    };
    return this.repo.saveCabezal(cabezal);
  }

  public updateCabezal(id: string, data: Partial<Cabezal>): Cabezal {
    const existing = this.getCabezalById(id);
    const updated: Cabezal = { ...existing, ...data, id: existing.id };
    return this.repo.saveCabezal(updated);
  }

  public deleteCabezal(id: string): boolean {
    this.getCabezalById(id);
    return this.repo.deleteCabezal(id);
  }

  // --- Caseteras ---
  public getAllCaseteras(): Casetera[] {
    return this.repo.findAllCaseteras();
  }

  public getCaseteraById(id: number): Casetera {
    const item = this.repo.findCaseteraById(id);
    if (!item) throw new NotFoundError('Casetera', id);
    return item;
  }

  public createCasetera(data: { id: number; estado?: Status; ubicacion: string }): Casetera {
    if (data.id === undefined || data.id === null) {
      throw new ValidationError('Casetera numeric ID is required');
    }
    if (!data.ubicacion) throw new ValidationError('Ubicacion is required');
    if (this.repo.findCaseteraById(data.id)) {
      throw new ConflictError(`Casetera ${data.id} already exists`);
    }

    const casetera: Casetera = {
      id: Number(data.id),
      tipo: 'Casetera',
      estado: data.estado || Status.READY,
      ubicacion: data.ubicacion,
      historial_movimientos: [],
    };
    return this.repo.saveCasetera(casetera);
  }

  public updateCasetera(id: number, data: Partial<Casetera>): Casetera {
    const existing = this.getCaseteraById(id);
    const updated: Casetera = { ...existing, ...data, id: existing.id };
    return this.repo.saveCasetera(updated);
  }

  public deleteCasetera(id: number): boolean {
    this.getCaseteraById(id);
    return this.repo.deleteCasetera(id);
  }

  // --- Frenos ---
  public getAllFrenos(): Freno[] {
    return this.repo.findAllFrenos();
  }

  public getFrenoById(id: string): Freno {
    const item = this.repo.findFrenoById(id);
    if (!item) throw new NotFoundError('Freno', id);
    return item;
  }

  public createFreno(data: {
    id: string;
    fecha_inicio?: string;
    estado?: Status;
    ubicacion?: string;
  }): Freno {
    if (!data.id) throw new ValidationError('Freno ID is required');
    if (this.repo.findFrenoById(data.id)) {
      throw new ConflictError(`Freno ${data.id} already exists`);
    }

    const freno: Freno = {
      id: data.id,
      tipo: 'Freno',
      fecha_inicio: data.fecha_inicio || new Date().toISOString().split('T')[0],
      estado: data.estado || Status.READY,
      ubicacion: data.ubicacion || 'EMP-04',
      historial_movimientos: [],
    };
    return this.repo.saveFreno(freno);
  }

  public updateFreno(id: string, data: Partial<Freno>): Freno {
    const existing = this.getFrenoById(id);
    const updated: Freno = { ...existing, ...data, id: existing.id };
    return this.repo.saveFreno(updated);
  }

  public deleteFreno(id: string): boolean {
    this.getFrenoById(id);
    return this.repo.deleteFreno(id);
  }

  // --- Aggregations & Movements ---
  public getEquipmentByLocation(empaqueId: string): LocationEquipmentSummary {
    const cabezales = this.repo.findAllCabezales().filter((c) => c.ubicacion === empaqueId);
    const caseteras = this.repo.findAllCaseteras().filter((c) => c.ubicacion === empaqueId);
    const frenos = this.repo.findAllFrenos().filter((f) => f.ubicacion === empaqueId);

    return {
      empaque_id: empaqueId,
      cabezales,
      caseteras,
      frenos,
      total: cabezales.length + caseteras.length + frenos.length,
    };
  }

  public getMovementsByMachine(machineId: string): Movimiento[] {
    return this.repo.findMovimientosByMachine(machineId);
  }

  public getAllMovements(): Movimiento[] {
    return this.repo.findAllMovimientos();
  }

  public addMovement(data: {
    machine_id: string;
    machine_type: 'Cabezal' | 'Casetera' | 'Freno';
    origen: string;
    destino: string;
    motivo: string;
    fecha?: string;
    tecnico_nombre?: string;
  }): Movimiento {
    if (!data.machine_id) throw new ValidationError('machine_id is required');
    if (!data.origen) throw new ValidationError('origen is required');
    if (!data.destino) throw new ValidationError('destino is required');

    const movimiento: Movimiento = {
      id: `MOV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      fecha: data.fecha || new Date().toISOString().split('T')[0],
      machine_id: data.machine_id,
      machine_type: data.machine_type,
      origen: data.origen,
      destino: data.destino,
      motivo: data.motivo || 'Traslado operativo',
      tecnico_nombre: data.tecnico_nombre || 'Técnico Sinclair',
    };

    // Update location of machine to destino
    if (data.machine_type === 'Cabezal') {
      const cab = this.repo.findCabezalById(data.machine_id);
      if (cab) this.repo.saveCabezal({ ...cab, ubicacion: data.destino });
    } else if (data.machine_type === 'Casetera') {
      const cas = this.repo.findCaseteraById(Number(data.machine_id));
      if (cas) this.repo.saveCasetera({ ...cas, ubicacion: data.destino });
    } else if (data.machine_type === 'Freno') {
      const frn = this.repo.findFrenoById(data.machine_id);
      if (frn) this.repo.saveFreno({ ...frn, ubicacion: data.destino });
    }

    this.repo.addMovimiento(movimiento);

    DatabaseStore.getInstance().addAuditLog({
      userId: 'TEC-01',
      userName: movimiento.tecnico_nombre,
      userRole: 'tecnico',
      category: 'machine',
      action: 'RELOCATION',
      targetId: movimiento.machine_id,
      targetName: `${movimiento.machine_type} ${movimiento.machine_id}`,
      details: `Traslado logístico registrado: ${movimiento.origen} ➔ ${movimiento.destino}. Motivo: ${movimiento.motivo}`,
      previousValue: movimiento.origen,
      newValue: movimiento.destino,
      metadata: { machine_id: movimiento.machine_id, machine_type: movimiento.machine_type, origen: movimiento.origen, destino: movimiento.destino },
    });

    return movimiento;
  }
}
