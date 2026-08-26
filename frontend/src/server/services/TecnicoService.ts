/**
 * TecnicoService - Business logic for Technicians and activity statistics
 * Adheres strictly to SDD and Clean Code standards
 */

import { StatusTecnico, Tecnico } from '../../types/domain';
import { ConflictError, NotFoundError, ValidationError } from '../../types/errors';
import { IOperationRepository, OperationRepository } from '../repositories/OperationRepository';
import { ITecnicoRepository, TecnicoRepository } from '../repositories/TecnicoRepository';
import { IVisitaRepository, VisitaRepository } from '../repositories/VisitaRepository';

export interface TecnicoActivityStats {
  tecnico_id: string;
  nombre: string;
  total_visitas: number;
  total_horas_servicio: number;
  total_reemplazos: number;
  total_cambios_freno: number;
  total_servicios: number;
  estado: StatusTecnico;
}

export class TecnicoService {
  private repo: ITecnicoRepository;
  private visitaRepo: IVisitaRepository;
  private opRepo: IOperationRepository;

  constructor(
    repo?: ITecnicoRepository,
    visitaRepo?: IVisitaRepository,
    opRepo?: IOperationRepository
  ) {
    this.repo = repo || new TecnicoRepository();
    this.visitaRepo = visitaRepo || new VisitaRepository();
    this.opRepo = opRepo || new OperationRepository();
  }

  public getAll(): Tecnico[] {
    return this.repo.findAll();
  }

  public getById(id: string): Tecnico {
    const item = this.repo.findById(id);
    if (!item) throw new NotFoundError('Tecnico', id);
    return item;
  }

  public create(data: Omit<Tecnico, 'id' | 'ultima_conexion'> & { id?: string }): Tecnico {
    if (!data.nombre || data.nombre.trim().length === 0) {
      throw new ValidationError('Nombre del técnico is required');
    }
    const id = data.id || `TEC-${Date.now()}`;
    if (this.repo.findById(id)) {
      throw new ConflictError(`Tecnico with ID ${id} already exists`);
    }

    const item: Tecnico = {
      id,
      nombre: data.nombre,
      ultima_conexion: new Date().toISOString(),
      estado: data.estado || StatusTecnico.DISPONIBLE,
      cumpleanos: data.cumpleanos || '1990-01-01',
      rol: data.rol || 'tecnico',
      email: data.email || `${id.toLowerCase()}@sinclair-service.com`,
      password: data.password || 'sinclair123',
    };
    return this.repo.save(item);
  }

  public update(id: string, data: Partial<Tecnico>): Tecnico {
    const existing = this.getById(id);
    const updated: Tecnico = {
      ...existing,
      ...data,
      id: existing.id,
    };
    return this.repo.save(updated);
  }

  public delete(id: string): boolean {
    this.getById(id);
    return this.repo.delete(id);
  }

  public getActivityStats(): TecnicoActivityStats[] {
    const tecnicos = this.repo.findAll();
    const allVisitas = this.visitaRepo.findAll();
    const allReemplazos = this.opRepo.findAllReemplazos();
    const allCambios = this.opRepo.findAllCambios();
    const allServicios = this.opRepo.findAllServicios();

    return tecnicos.map((tec) => {
      const tecVisits = allVisitas.filter((v) => v.tecnicos.some((t) => t.id === tec.id));
      let totalHoras = 0;

      for (const v of tecVisits) {
        if (v.reporte && v.reporte.estructura) {
          for (const item of v.reporte.estructura) {
            totalHoras += Number(item.tiempo_servicio) || 0;
          }
        }
      }

      const tecReemplazos = allReemplazos.filter((r) => r.tecnico_id === tec.id);
      const tecCambios = allCambios.filter((c) => c.tecnico_id === tec.id);
      const tecServicios = allServicios.filter((s) => s.tecnico_id === tec.id);

      return {
        tecnico_id: tec.id,
        nombre: tec.nombre,
        total_visitas: tecVisits.length,
        total_horas_servicio: Number(totalHoras.toFixed(2)),
        total_reemplazos: tecReemplazos.length,
        total_cambios_freno: tecCambios.length,
        total_servicios: tecServicios.length,
        estado: tec.estado,
      };
    });
  }
}
