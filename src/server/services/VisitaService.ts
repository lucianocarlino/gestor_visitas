/**
 * VisitaService - Implements IVisitaService and business logic for visits
 * Adheres strictly to SDD and Clean Code standards
 */

import {
  CodigoMotivo,
  CodigoOrden,
  CodigoTipoServicio,
  CreateVisitDTO,
  Empaque,
  ItemEstructura,
  ReporteSinclair,
  Tecnico,
  Vehiculo,
  Visita,
} from '../../types/domain';
import { NotFoundError, ValidationError } from '../../types/errors';
import { EmpaqueRepository, IEmpaqueRepository } from '../repositories/EmpaqueRepository';
import { ITecnicoRepository, TecnicoRepository } from '../repositories/TecnicoRepository';
import { IVisitaRepository, VisitaRepository } from '../repositories/VisitaRepository';
import { DatabaseStore } from '../repositories/DatabaseStore';

export interface IVisitaService {
  createVisit(dto: CreateVisitDTO): { visita: Visita; reporte: ReporteSinclair };
  getAllVisits(): Visita[];
  getVisitById(id: string): Visita;
  getVisitsByEmpaque(empaqueId: string): Visita[];
  getVisitsByTecnico(tecnicoId: string): Visita[];
  getVisitsByDateRange(startDate: string, endDate: string): Visita[];
  syncBatchVisits(visits: CreateVisitDTO[]): { synced: Visita[]; errors: string[] };
}

export class VisitaService implements IVisitaService {
  private visitaRepo: IVisitaRepository;
  private empaqueRepo: IEmpaqueRepository;
  private tecnicoRepo: ITecnicoRepository;

  constructor(
    visitaRepo?: IVisitaRepository,
    empaqueRepo?: IEmpaqueRepository,
    tecnicoRepo?: ITecnicoRepository
  ) {
    this.visitaRepo = visitaRepo || new VisitaRepository();
    this.empaqueRepo = empaqueRepo || new EmpaqueRepository();
    this.tecnicoRepo = tecnicoRepo || new TecnicoRepository();
  }

  public createVisit(dto: CreateVisitDTO): { visita: Visita; reporte: ReporteSinclair } {
    this.validateVisitDTO(dto);

    const empaque = this.empaqueRepo.findById(dto.empaque_id);
    if (!empaque) {
      throw new NotFoundError('Empaque', dto.empaque_id);
    }

    const tecnicos = this.resolveTecnicos(dto.tecnico_ids);
    const reportNumber = this.visitaRepo.getNextReportNumber();
    const nowIso = new Date().toISOString();

    const reporte: ReporteSinclair = {
      numero: reportNumber,
      codigo_motivo: dto.codigo_motivo,
      codigo_origen: dto.codigo_origen,
      codigo_tipo_servicio: dto.codigo_tipo_servicio,
      estructura: dto.estructura || [],
      hora_inicio: dto.hora_inicio,
      hora_fin: dto.hora_fin,
      fuera_de_hora: Boolean(dto.fuera_de_hora),
      comentarios: dto.comentarios || '',
      firma_cliente: dto.firma_cliente,
      nombre_cliente: dto.nombre_cliente,
      hora_llamada: dto.hora_llamada,
      produccion_etiquetada: dto.produccion_etiquetada || '100%',
      condicion_fruta: dto.condicion_fruta || 'Estándar de empaque',
      created_at: nowIso,
    };

    const visitId = dto.id || `VIS-${reportNumber}`;
    const visita: Visita = {
      id: visitId,
      fecha: nowIso,
      motivo: dto.motivo,
      solicitado_por: dto.solicitado_por,
      vehiculo: dto.vehiculo,
      tecnicos: tecnicos,
      empaque: empaque,
      reporte: reporte,
      estado_sincronizacion: 'synced',
    };

    this.visitaRepo.save(visita);
    this.empaqueRepo.updateLastVisit(empaque.id, nowIso);

    const primaryTecnico = tecnicos[0] || { id: 'TEC-01', nombre: 'Técnico de Campo' };
    DatabaseStore.getInstance().addAuditLog({
      userId: primaryTecnico.id,
      userName: tecnicos.map((t) => t.nombre).join(', ') || 'Técnico',
      userRole: 'tecnico',
      category: 'visit',
      action: 'CREATE',
      targetId: visita.id,
      targetName: `Visita #${reporte.numero} - ${empaque.nombre}`,
      details: `Registro y firma de visita técnica en ${empaque.nombre}. Motivo: ${visita.motivo}. Cliente: ${reporte.nombre_cliente}. Vehículo: ${visita.vehiculo}`,
      previousValue: null,
      newValue: `Reporte #${reporte.numero} (synced)`,
      metadata: { empaque_id: empaque.id, reporte_numero: reporte.numero, vehiculo: visita.vehiculo },
    });

    return { visita, reporte };
  }

  public getAllVisits(): Visita[] {
    return this.visitaRepo.findAll();
  }

  public getVisitById(id: string): Visita {
    const visita = this.visitaRepo.findById(id);
    if (!visita) throw new NotFoundError('Visita', id);
    return visita;
  }

  public getVisitsByEmpaque(empaqueId: string): Visita[] {
    return this.visitaRepo.findByEmpaque(empaqueId);
  }

  public getVisitsByTecnico(tecnicoId: string): Visita[] {
    return this.visitaRepo.findByTecnico(tecnicoId);
  }

  public getVisitsByDateRange(startDate: string, endDate: string): Visita[] {
    if (!startDate || !endDate) {
      throw new ValidationError('Start date and end date are required');
    }
    return this.visitaRepo.findByDateRange(startDate, endDate);
  }

  public syncBatchVisits(visits: CreateVisitDTO[]): { synced: Visita[]; errors: string[] } {
    const synced: Visita[] = [];
    const errors: string[] = [];

    for (const dto of visits) {
      try {
        const result = this.createVisit(dto);
        synced.push(result.visita);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown sync error';
        errors.push(`Visit for Empaque ${dto.empaque_id}: ${errorMsg}`);
      }
    }

    return { synced, errors };
  }

  private validateVisitDTO(dto: CreateVisitDTO): void {
    if (!dto.empaque_id) throw new ValidationError('Empaque is required');
    if (!dto.vehiculo) throw new ValidationError('Vehiculo is required');
    if (!dto.tecnico_ids || dto.tecnico_ids.length === 0) {
      throw new ValidationError('At least one Tecnico is required');
    }
    if (!dto.solicitado_por) throw new ValidationError('Solicitado por is required');
    if (!dto.motivo) throw new ValidationError('Motivo is required');
    if (!dto.hora_inicio || !dto.hora_fin) {
      throw new ValidationError('Hora inicio and Hora fin are required');
    }
    if (!dto.nombre_cliente) throw new ValidationError('Nombre del cliente is required');
  }

  private resolveTecnicos(ids: string[]): Tecnico[] {
    const tecnicos: Tecnico[] = [];
    for (const id of ids) {
      const tec = this.tecnicoRepo.findById(id);
      if (tec) tecnicos.push(tec);
    }
    if (tecnicos.length === 0) {
      throw new ValidationError('None of the provided Tecnico IDs exist');
    }
    return tecnicos;
  }
}
