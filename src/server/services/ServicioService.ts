/**
 * ServicioService - Implements IService interface
 * Adheres strictly to SDD and Clean Code specifications
 */

import {
  AnyMachine,
  ConsumibleItem,
  CreateServiceDTO,
  Servicio,
  Status,
} from '../../types/domain';
import { InsufficientStockError, NotFoundError, ValidationError } from '../../types/errors';
import { ConsumibleRepository, IConsumibleRepository } from '../repositories/ConsumibleRepository';
import { IMachineRepository, MachineRepository } from '../repositories/MachineRepository';
import { IOperationRepository, OperationRepository } from '../repositories/OperationRepository';
import { ITecnicoRepository, TecnicoRepository } from '../repositories/TecnicoRepository';
import { DatabaseStore } from '../repositories/DatabaseStore';

export interface IServiceService {
  createService(dto: CreateServiceDTO): { servicio: Servicio; machine: AnyMachine };
  getMachineServices(machineId: string): Servicio[];
  getAllServices(): Servicio[];
}

export class ServicioService implements IServiceService {
  private machineRepo: IMachineRepository;
  private consumibleRepo: IConsumibleRepository;
  private opRepo: IOperationRepository;
  private tecnicoRepo: ITecnicoRepository;

  constructor(
    machineRepo?: IMachineRepository,
    consumibleRepo?: IConsumibleRepository,
    opRepo?: IOperationRepository,
    tecnicoRepo?: ITecnicoRepository
  ) {
    this.machineRepo = machineRepo || new MachineRepository();
    this.consumibleRepo = consumibleRepo || new ConsumibleRepository();
    this.opRepo = opRepo || new OperationRepository();
    this.tecnicoRepo = tecnicoRepo || new TecnicoRepository();
  }

  public createService(dto: CreateServiceDTO): { servicio: Servicio; machine: AnyMachine } {
    this.validateServiceDTO(dto);

    const machine = this.resolveMachine(dto.machine_id, dto.machine_type);
    this.processConsumiblesStock(dto.consumibles || []);

    const tecnico = dto.tecnico_id ? this.tecnicoRepo.findById(dto.tecnico_id) : null;
    const tecnicoNombre = tecnico ? tecnico.nombre : 'Técnico Sinclair';

    // If machine was pending repair, service marks it READY
    if (machine.estado === Status.PENDING) {
      machine.estado = Status.READY;
      this.saveUpdatedMachine(machine, dto.machine_type);
    }

    const servicio: Servicio = {
      id: `SRV-${Date.now()}`,
      machine_id: dto.machine_id,
      machine_type: dto.machine_type,
      fecha: dto.fecha || new Date().toISOString().split('T')[0],
      resumen: dto.resumen,
      trabajo_hecho: dto.trabajo_hecho,
      consumibles: dto.consumibles || [],
      tecnico_id: dto.tecnico_id,
      tecnico_nombre: tecnicoNombre,
    };

    this.opRepo.saveServicio(servicio);

    DatabaseStore.getInstance().addAuditLog({
      userId: dto.tecnico_id || 'TEC-01',
      userName: tecnicoNombre,
      userRole: 'tecnico',
      category: 'machine',
      action: 'SERVICE',
      targetId: String(dto.machine_id),
      targetName: `${dto.machine_type} ${dto.machine_id}`,
      details: `Servicio técnico registrado: ${dto.resumen}. Trabajo ejecutado: ${dto.trabajo_hecho}`,
      previousValue: 'Pendiente',
      newValue: 'Listo',
      metadata: { machine_id: dto.machine_id, machine_type: dto.machine_type, consumibles: dto.consumibles },
    });

    return { servicio, machine };
  }

  public getMachineServices(machineId: string): Servicio[] {
    return this.opRepo.findServiciosByMachine(machineId);
  }

  public getAllServices(): Servicio[] {
    return this.opRepo.findAllServicios();
  }

  private validateServiceDTO(dto: CreateServiceDTO): void {
    if (!dto.machine_id) throw new ValidationError('Machine ID is required');
    if (!dto.machine_type) throw new ValidationError('Machine type is required');
    if (!dto.resumen) throw new ValidationError('Resumen is required');
    if (!dto.trabajo_hecho) throw new ValidationError('Trabajo hecho is required');
  }

  private resolveMachine(id: string, type: string): AnyMachine {
    if (type === 'Cabezal') {
      const cab = this.machineRepo.findCabezalById(id);
      if (!cab) throw new NotFoundError('Cabezal', id);
      return cab;
    }
    if (type === 'Casetera') {
      const cas = this.machineRepo.findCaseteraById(Number(id));
      if (!cas) throw new NotFoundError('Casetera', id);
      return cas;
    }
    if (type === 'Freno') {
      const frn = this.machineRepo.findFrenoById(id);
      if (!frn) throw new NotFoundError('Freno', id);
      return frn;
    }
    throw new ValidationError(`Unknown machine type: ${type}`);
  }

  private saveUpdatedMachine(machine: AnyMachine, type: string): void {
    if (type === 'Cabezal') this.machineRepo.saveCabezal(machine as any);
    if (type === 'Casetera') this.machineRepo.saveCasetera(machine as any);
    if (type === 'Freno') this.machineRepo.saveFreno(machine as any);
  }

  private processConsumiblesStock(items: ConsumibleItem[]): void {
    for (const item of items) {
      const consumible = this.consumibleRepo.findById(item.consumible_id);
      if (!consumible) {
        throw new NotFoundError('Consumible', item.consumible_id);
      }
      if (consumible.stock < item.cantidad) {
        throw new InsufficientStockError(consumible.nombre, consumible.stock, item.cantidad);
      }
    }

    for (const item of items) {
      const consumible = this.consumibleRepo.findById(item.consumible_id)!;
      const newStock = consumible.stock - item.cantidad;
      this.consumibleRepo.updateStock(consumible.id, newStock);
    }
  }
}
