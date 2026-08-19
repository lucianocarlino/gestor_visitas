/**
 * CambioService - Implements ICambio interface
 * Adheres strictly to SDD and Clean Code specifications
 */

import { Cambio, CreateCambioDTO, Movimiento, Status } from '../../types/domain';
import { NotFoundError, ValidationError } from '../../types/errors';
import { IMachineRepository, MachineRepository } from '../repositories/MachineRepository';
import { IOperationRepository, OperationRepository } from '../repositories/OperationRepository';
import { ITecnicoRepository, TecnicoRepository } from '../repositories/TecnicoRepository';
import { DatabaseStore } from '../repositories/DatabaseStore';

export interface ICambioService {
  createCambio(dto: CreateCambioDTO): Cambio;
  getFrenoCambios(frenoId: string): Cambio[];
  getCabezalCambios(cabezalId: string): Cambio[];
  getAllCambios(): Cambio[];
}

export class CambioService implements ICambioService {
  private machineRepo: IMachineRepository;
  private opRepo: IOperationRepository;
  private tecnicoRepo: ITecnicoRepository;

  constructor(
    machineRepo?: IMachineRepository,
    opRepo?: IOperationRepository,
    tecnicoRepo?: ITecnicoRepository
  ) {
    this.machineRepo = machineRepo || new MachineRepository();
    this.opRepo = opRepo || new OperationRepository();
    this.tecnicoRepo = tecnicoRepo || new TecnicoRepository();
  }

  public createCambio(dto: CreateCambioDTO): Cambio {
    this.validateCambioDTO(dto);

    const cabezal = this.machineRepo.findCabezalById(dto.cabezal_id);
    if (!cabezal) throw new NotFoundError('Cabezal', dto.cabezal_id);

    const frenoRetirado = this.machineRepo.findFrenoById(dto.freno_retirado_id);
    if (!frenoRetirado) throw new NotFoundError('Freno (Retirado)', dto.freno_retirado_id);

    const frenoInstalado = this.machineRepo.findFrenoById(dto.freno_instalado_id);
    if (!frenoInstalado) throw new NotFoundError('Freno (Instalado)', dto.freno_instalado_id);

    const tecnico = dto.tecnico_id ? this.tecnicoRepo.findById(dto.tecnico_id) : null;
    const tecnicoNombre = tecnico ? tecnico.nombre : 'Técnico Sinclair';

    const fechaNow = dto.fecha || new Date().toISOString().split('T')[0];
    const workshopLocation = 'EMP-04'; // Workshop

    // 1. Update Retirado Brake
    const origenRetirado = frenoRetirado.ubicacion;
    frenoRetirado.estado = Status.PENDING;
    frenoRetirado.cabezal_id = undefined;
    frenoRetirado.ubicacion = dto.lugar === 'Taller' ? workshopLocation : cabezal.ubicacion;
    this.machineRepo.saveFreno(frenoRetirado);
    this.recordFrenoMovement(
      frenoRetirado.id,
      origenRetirado,
      frenoRetirado.ubicacion,
      `Retirado de ${cabezal.id}: ${dto.motivo}`,
      tecnicoNombre
    );

    // 2. Update Instalado Brake
    const origenInstalado = frenoInstalado.ubicacion;
    frenoInstalado.estado = Status.USING;
    frenoInstalado.cabezal_id = cabezal.id;
    frenoInstalado.ubicacion = cabezal.ubicacion;
    this.machineRepo.saveFreno(frenoInstalado);
    this.recordFrenoMovement(
      frenoInstalado.id,
      origenInstalado,
      cabezal.ubicacion,
      `Instalado en ${cabezal.id}: ${dto.motivo}`,
      tecnicoNombre
    );

    // 3. Update Cabezal Current Brake Reference
    cabezal.freno_actual_id = frenoInstalado.id;
    this.machineRepo.saveCabezal(cabezal);

    const cambio: Cambio = {
      id: `CAM-${Date.now()}`,
      fecha: fechaNow,
      motivo: dto.motivo,
      lugar: dto.lugar,
      retirado_freno_id: dto.freno_retirado_id,
      instalado_freno_id: dto.freno_instalado_id,
      cabezal_id: dto.cabezal_id,
      tecnico_id: dto.tecnico_id,
      tecnico_nombre: tecnicoNombre,
    };

    const saved = this.opRepo.saveCambio(cambio);

    DatabaseStore.getInstance().addAuditLog({
      userId: dto.tecnico_id || 'TEC-01',
      userName: tecnicoNombre,
      userRole: 'tecnico',
      category: 'machine',
      action: 'BRAKE_SWAP',
      targetId: dto.cabezal_id,
      targetName: `Cabezal ${dto.cabezal_id} (Freno ${dto.freno_retirado_id} ➔ ${dto.freno_instalado_id})`,
      details: `Cambio de freno en ${dto.lugar}: Se retira ${dto.freno_retirado_id} y se instala ${dto.freno_instalado_id} en cabezal ${dto.cabezal_id}. Motivo: ${dto.motivo}`,
      previousValue: `Freno ${dto.freno_retirado_id}`,
      newValue: `Freno ${dto.freno_instalado_id}`,
      metadata: { cabezal_id: dto.cabezal_id, lugar: dto.lugar, instalado_freno_id: dto.freno_instalado_id, retirado_freno_id: dto.freno_retirado_id },
    });

    return saved;
  }

  public getFrenoCambios(frenoId: string): Cambio[] {
    return this.opRepo.findCambiosByFreno(frenoId);
  }

  public getCabezalCambios(cabezalId: string): Cambio[] {
    return this.opRepo.findCambiosByCabezal(cabezalId);
  }

  public getAllCambios(): Cambio[] {
    return this.opRepo.findAllCambios();
  }

  private validateCambioDTO(dto: CreateCambioDTO): void {
    if (!dto.cabezal_id) throw new ValidationError('Cabezal ID is required');
    if (!dto.freno_retirado_id) throw new ValidationError('Freno retirado ID is required');
    if (!dto.freno_instalado_id) throw new ValidationError('Freno instalado ID is required');
    if (dto.freno_retirado_id === dto.freno_instalado_id) {
      throw new ValidationError('Freno retirado and instalado cannot be the same');
    }
    if (!dto.motivo) throw new ValidationError('Motivo is required');
    if (!dto.lugar) throw new ValidationError('Lugar (En emplazamiento/Taller) is required');
  }

  private recordFrenoMovement(
    frenoId: string,
    origen: string,
    destino: string,
    motivo: string,
    tecnico: string
  ): void {
    const mov: Movimiento = {
      id: `MOV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      machine_id: frenoId,
      machine_type: 'Freno',
      fecha: new Date().toISOString().split('T')[0],
      tecnico_nombre: tecnico,
      motivo: motivo,
      origen: origen,
      destino: destino,
    };
    this.machineRepo.addMovimiento(mov);
  }
}
