/**
 * ReemplazoService - Implements IReeplace interface
 * Adheres strictly to SDD and Clean Code specifications
 */

import {
  Cabezal,
  Casetera,
  CreateReeplaceDTO,
  Movimiento,
  Reemplazo,
  Status,
} from '../../types/domain';
import { NotFoundError, ValidationError } from '../../types/errors';
import { EmpaqueRepository, IEmpaqueRepository } from '../repositories/EmpaqueRepository';
import { IMachineRepository, MachineRepository } from '../repositories/MachineRepository';
import { IOperationRepository, OperationRepository } from '../repositories/OperationRepository';
import { ITecnicoRepository, TecnicoRepository } from '../repositories/TecnicoRepository';
import { DatabaseStore } from '../repositories/DatabaseStore';

export interface IReeplaceService {
  createReeplace(dto: CreateReeplaceDTO): Reemplazo;
  getMachineReplaces(machineId: string): Reemplazo[];
  getAllReemplazos(): Reemplazo[];
}

export class ReemplazoService implements IReeplaceService {
  private machineRepo: IMachineRepository;
  private empaqueRepo: IEmpaqueRepository;
  private opRepo: IOperationRepository;
  private tecnicoRepo: ITecnicoRepository;

  constructor(
    machineRepo?: IMachineRepository,
    empaqueRepo?: IEmpaqueRepository,
    opRepo?: IOperationRepository,
    tecnicoRepo?: ITecnicoRepository
  ) {
    this.machineRepo = machineRepo || new MachineRepository();
    this.empaqueRepo = empaqueRepo || new EmpaqueRepository();
    this.opRepo = opRepo || new OperationRepository();
    this.tecnicoRepo = tecnicoRepo || new TecnicoRepository();
  }

  public createReeplace(dto: CreateReeplaceDTO): Reemplazo {
    this.validateReeplaceDTO(dto);

    const empaque = this.empaqueRepo.findById(dto.empaque_id);
    if (!empaque) throw new NotFoundError('Empaque', dto.empaque_id);

    const tecnico = dto.tecnico_id ? this.tecnicoRepo.findById(dto.tecnico_id) : null;
    const tecnicoNombre = tecnico ? tecnico.nombre : 'Técnico de Guardia';

    const fechaNow = new Date().toISOString().split('T')[0];
    const workshopLocation = 'EMP-04'; // Sinclair Central Workshop

    this.updateRemovedMachine(dto.retirado_id, dto.retirado_tipo, workshopLocation, dto.motivo, tecnicoNombre);
    this.updateInstalledMachine(dto.instalado_id, dto.instalado_tipo, dto.empaque_id, dto.motivo, tecnicoNombre);

    const reemplazo: Reemplazo = {
      id: `REP-${Date.now()}`,
      fecha: fechaNow,
      motivo: dto.motivo,
      retirado_id: dto.retirado_id,
      retirado_tipo: dto.retirado_tipo,
      instalado_id: dto.instalado_id,
      instalado_tipo: dto.instalado_tipo,
      empaque_id: empaque.id,
      empaque_nombre: empaque.nombre,
      tecnico_id: dto.tecnico_id,
      tecnico_nombre: tecnicoNombre,
    };

    const saved = this.opRepo.saveReemplazo(reemplazo);

    DatabaseStore.getInstance().addAuditLog({
      userId: dto.tecnico_id || 'TEC-01',
      userName: tecnicoNombre,
      userRole: 'tecnico',
      category: 'machine',
      action: 'REPLACE',
      targetId: dto.retirado_id,
      targetName: `${dto.retirado_tipo} ${dto.retirado_id} ➔ ${dto.instalado_id}`,
      details: `Reemplazo en ${empaque.nombre}: Se desmonta ${dto.retirado_id} (➔ Taller/Pendiente) y se monta ${dto.instalado_id} (➔ En uso). Motivo: ${dto.motivo}`,
      previousValue: `${dto.retirado_id} en ${empaque.nombre}`,
      newValue: `${dto.instalado_id} en ${empaque.nombre}`,
      metadata: { empaque_id: empaque.id, instalado_id: dto.instalado_id, retirado_id: dto.retirado_id },
    });

    return saved;
  }

  public getMachineReplaces(machineId: string): Reemplazo[] {
    return this.opRepo.findReemplazosByMachine(machineId);
  }

  public getAllReemplazos(): Reemplazo[] {
    return this.opRepo.findAllReemplazos();
  }

  private validateReeplaceDTO(dto: CreateReeplaceDTO): void {
    if (!dto.retirado_id) throw new ValidationError('Retirado machine ID is required');
    if (!dto.instalado_id) throw new ValidationError('Instalado machine ID is required');
    if (!dto.empaque_id) throw new ValidationError('Empaque ID is required');
    if (!dto.motivo) throw new ValidationError('Motivo is required');
    if (dto.retirado_id === dto.instalado_id) {
      throw new ValidationError('Removed and installed machines cannot be the same ID');
    }
  }

  private updateRemovedMachine(
    id: string,
    tipo: 'Cabezal' | 'Casetera',
    destination: string,
    motivo: string,
    tecnico: string
  ): void {
    if (tipo === 'Cabezal') {
      const cab = this.machineRepo.findCabezalById(id);
      if (!cab) throw new NotFoundError('Cabezal', id);
      const origen = cab.ubicacion;
      cab.estado = Status.PENDING;
      cab.ubicacion = destination;
      this.machineRepo.saveCabezal(cab);
      this.recordMov(id, 'Cabezal', origen, destination, `Reemplazo retirado: ${motivo}`, tecnico);
    } else {
      const numId = Number(id);
      const cas = this.machineRepo.findCaseteraById(numId);
      if (!cas) throw new NotFoundError('Casetera', id);
      const origen = cas.ubicacion;
      cas.estado = Status.PENDING;
      cas.ubicacion = destination;
      this.machineRepo.saveCasetera(cas);
      this.recordMov(id, 'Casetera', origen, destination, `Reemplazo retirado: ${motivo}`, tecnico);
    }
  }

  private updateInstalledMachine(
    id: string,
    tipo: 'Cabezal' | 'Casetera',
    destination: string,
    motivo: string,
    tecnico: string
  ): void {
    if (tipo === 'Cabezal') {
      const cab = this.machineRepo.findCabezalById(id);
      if (!cab) throw new NotFoundError('Cabezal', id);
      const origen = cab.ubicacion;
      cab.estado = Status.USING;
      cab.ubicacion = destination;
      this.machineRepo.saveCabezal(cab);
      this.recordMov(id, 'Cabezal', origen, destination, `Reemplazo instalado: ${motivo}`, tecnico);
    } else {
      const numId = Number(id);
      const cas = this.machineRepo.findCaseteraById(numId);
      if (!cas) throw new NotFoundError('Casetera', id);
      const origen = cas.ubicacion;
      cas.estado = Status.USING;
      cas.ubicacion = destination;
      this.machineRepo.saveCasetera(cas);
      this.recordMov(id, 'Casetera', origen, destination, `Reemplazo instalado: ${motivo}`, tecnico);
    }
  }

  private recordMov(
    id: string,
    type: 'Cabezal' | 'Casetera',
    origen: string,
    destino: string,
    motivo: string,
    tecnico: string
  ): void {
    const mov: Movimiento = {
      id: `MOV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      machine_id: id,
      machine_type: type,
      fecha: new Date().toISOString().split('T')[0],
      tecnico_nombre: tecnico,
      motivo: motivo,
      origen: origen,
      destino: destino,
    };
    this.machineRepo.addMovimiento(mov);
  }
}
