/**
 * EmpaqueService - Business logic for Packing Plants and unvisited alerts
 * Adheres strictly to SDD and Clean Code standards
 */

import { Cabezal, Casetera, CreateEmpaqueDTO, Empaque, Freno, Status } from '../../types/domain';
import { ConflictError, NotFoundError, ValidationError } from '../../types/errors';
import { EmpaqueRepository, IEmpaqueRepository } from '../repositories/EmpaqueRepository';
import { IMachineRepository, MachineRepository } from '../repositories/MachineRepository';
import { DatabaseStore } from '../repositories/DatabaseStore';

export interface UnvisitedAlert {
  empaque_id: string;
  nombre: string;
  ubicacion: string;
  dias_sin_visita: number;
  ultima_visita?: string;
  urgencia: 'alta' | 'media';
}

export class EmpaqueService {
  private repo: IEmpaqueRepository;
  private machineRepo: IMachineRepository;

  constructor(repo?: IEmpaqueRepository, machineRepo?: IMachineRepository) {
    this.repo = repo || new EmpaqueRepository();
    this.machineRepo = machineRepo || new MachineRepository();
  }

  public getAll(): Empaque[] {
    return this.repo.findAll();
  }

  public getById(id: string): Empaque {
    const empaque = this.repo.findById(id);
    if (!empaque) throw new NotFoundError('Empaque', id);
    return empaque;
  }

  public create(empaqueData: CreateEmpaqueDTO): Empaque {
    this.validateEmpaque(empaqueData);
    const id = empaqueData.id || `EMP-${Date.now()}`;
    if (this.repo.findById(id)) {
      throw new ConflictError(`Empaque with ID ${id} already exists`);
    }

    const newEmpaque: Empaque = {
      id,
      nombre: empaqueData.nombre,
      ubicacion: empaqueData.ubicacion,
      latitud: empaqueData.latitud,
      longitud: empaqueData.longitud,
      servicio: empaqueData.servicio,
      distancia: empaqueData.distancia,
      bancos: empaqueData.bancos || [],
    };

    const savedEmpaque = this.repo.save(newEmpaque);

    // 1. Process Initial Cabezales and their attached Frenos
    if (empaqueData.cabezales && Array.isArray(empaqueData.cabezales)) {
      for (const cabInput of empaqueData.cabezales) {
        if (!cabInput.id || !cabInput.id.trim()) continue;
        const cabId = cabInput.id.trim();

        // If Freno is specified, create and link Freno first
        let frenoId: string | undefined = undefined;
        if (cabInput.freno_id && cabInput.freno_id.trim()) {
          frenoId = cabInput.freno_id.trim();
          const newFreno: Freno = {
            id: frenoId,
            tipo: 'Freno',
            estado: cabInput.freno_estado || cabInput.estado || Status.USING,
            fecha_inicio: cabInput.freno_fecha_inicio || new Date().toISOString().split('T')[0],
            ubicacion: savedEmpaque.id,
            cabezal_id: cabId,
            historial_movimientos: [],
          };
          this.machineRepo.saveFreno(newFreno);

          DatabaseStore.getInstance().addAuditLog({
            userId: 'admin',
            userName: 'Administrador',
            userRole: 'admin',
            category: 'machine',
            action: 'CREATE',
            targetId: frenoId,
            targetName: `Freno ${frenoId}`,
            details: `Freno creado y acoplado a Cabezal ${cabId} en empaque ${savedEmpaque.nombre}`,
            previousValue: null,
            newValue: savedEmpaque.id,
            metadata: { cabezal_id: cabId, empaque_id: savedEmpaque.id },
          });
        }

        const newCabezal: Cabezal = {
          id: cabId,
          tipo: 'Cabezal',
          estado: cabInput.estado || Status.USING,
          ubicacion: savedEmpaque.id,
          freno_actual_id: frenoId,
          historial_movimientos: [],
        };
        this.machineRepo.saveCabezal(newCabezal);

        DatabaseStore.getInstance().addAuditLog({
          userId: 'admin',
          userName: 'Administrador',
          userRole: 'admin',
          category: 'machine',
          action: 'CREATE',
          targetId: cabId,
          targetName: `Cabezal ${cabId}`,
          details: `Cabezal creado y asignado al nuevo empaque ${savedEmpaque.nombre}${frenoId ? ` con freno ${frenoId}` : ''}`,
          previousValue: null,
          newValue: savedEmpaque.id,
          metadata: { freno_id: frenoId, empaque_id: savedEmpaque.id },
        });
      }
    }

    // 2. Process Initial Caseteras
    if (empaqueData.caseteras && Array.isArray(empaqueData.caseteras)) {
      for (const casInput of empaqueData.caseteras) {
        if (casInput.id === undefined || casInput.id === null) continue;
        const casId = Number(casInput.id);
        if (isNaN(casId)) continue;

        const newCasetera: Casetera = {
          id: casId,
          tipo: 'Casetera',
          estado: casInput.estado || Status.USING,
          ubicacion: savedEmpaque.id,
          historial_movimientos: [],
        };
        this.machineRepo.saveCasetera(newCasetera);

        DatabaseStore.getInstance().addAuditLog({
          userId: 'admin',
          userName: 'Administrador',
          userRole: 'admin',
          category: 'machine',
          action: 'CREATE',
          targetId: `CAS-${casId}`,
          targetName: `Casetera #${casId}`,
          details: `Casetera #${casId} creada y asignada al nuevo empaque ${savedEmpaque.nombre}`,
          previousValue: null,
          newValue: savedEmpaque.id,
          metadata: { casetera_id: casId, empaque_id: savedEmpaque.id },
        });
      }
    }

    // Log empaque creation in audit trail
    DatabaseStore.getInstance().addAuditLog({
      userId: 'admin',
      userName: 'Administrador',
      userRole: 'admin',
      category: 'empaque',
      action: 'CREATE',
      targetId: savedEmpaque.id,
      targetName: savedEmpaque.nombre,
      details: `Alta de nuevo empaque "${savedEmpaque.nombre}" en ${savedEmpaque.ubicacion} con ${savedEmpaque.bancos.length} bancos`,
      previousValue: null,
      newValue: savedEmpaque.id,
      metadata: {
        bancos: savedEmpaque.bancos.length,
        cabezales: empaqueData.cabezales?.length || 0,
        caseteras: empaqueData.caseteras?.length || 0,
      },
    });

    return savedEmpaque;
  }

  public update(id: string, updateData: Partial<Empaque>): Empaque {
    const existing = this.getById(id);
    const updated: Empaque = {
      ...existing,
      ...updateData,
      id: existing.id, // prevent ID change
    };
    this.validateEmpaque(updated);
    return this.repo.save(updated);
  }

  public delete(id: string): boolean {
    const existing = this.getById(id);
    return this.repo.delete(existing.id);
  }

  public getUnvisitedAlerts(): UnvisitedAlert[] {
    const empaques = this.repo.findAll().filter((e) => e.servicio);
    const now = Date.now();
    const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;
    const alerts: UnvisitedAlert[] = [];

    for (const emp of empaques) {
      if (!emp.ultima_visita) {
        alerts.push({
          empaque_id: emp.id,
          nombre: emp.nombre,
          ubicacion: emp.ubicacion,
          dias_sin_visita: 999,
          urgencia: 'alta',
        });
        continue;
      }

      const lastVisitTime = new Date(emp.ultima_visita).getTime();
      const diffMs = now - lastVisitTime;
      if (diffMs > FIFTEEN_DAYS_MS) {
        const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
        alerts.push({
          empaque_id: emp.id,
          nombre: emp.nombre,
          ubicacion: emp.ubicacion,
          dias_sin_visita: days,
          ultima_visita: emp.ultima_visita,
          urgencia: days > 25 ? 'alta' : 'media',
        });
      }
    }

    return alerts.sort((a, b) => b.dias_sin_visita - a.dias_sin_visita);
  }

  private validateEmpaque(data: Partial<Empaque>): void {
    if (!data.nombre || data.nombre.trim().length === 0) {
      throw new ValidationError('Empaque name is required');
    }
    if (!data.ubicacion || data.ubicacion.trim().length === 0) {
      throw new ValidationError('Empaque location is required');
    }
  }
}
