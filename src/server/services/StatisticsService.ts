/**
 * StatisticsService - Aggregates technical maintenance statistics
 * Adheres strictly to SDD and Clean Code standards
 */

import { IMachineRepository, MachineRepository } from '../repositories/MachineRepository';
import { IOperationRepository, OperationRepository } from '../repositories/OperationRepository';
import { IVisitaRepository, VisitaRepository } from '../repositories/VisitaRepository';
import { IEmpaqueRepository, EmpaqueRepository } from '../repositories/EmpaqueRepository';

export interface DashboardStats {
  total_visitas: number;
  total_reemplazos: number;
  total_cambios_freno: number;
  total_servicios: number;
  visitas_por_vehiculo: { vehiculo: string; count: number }[];
  motivos_frecuentes: { motivo: string; count: number }[];
  codigos_origen: { codigo: string; count: number }[];
  maquinas_por_estado: {
    cabezales: { en_uso: number; listos: number; pendientes: number };
    caseteras: { en_uso: number; listos: number; pendientes: number };
    frenos: { en_uso: number; listos: number; pendientes: number };
  };
}

export class StatisticsService {
  private visitaRepo: IVisitaRepository;
  private opRepo: IOperationRepository;
  private machineRepo: IMachineRepository;
  private empaqueRepo: IEmpaqueRepository;

  constructor(
    visitaRepo?: IVisitaRepository,
    opRepo?: IOperationRepository,
    machineRepo?: IMachineRepository,
    empaqueRepo?: IEmpaqueRepository
  ) {
    this.visitaRepo = visitaRepo || new VisitaRepository();
    this.opRepo = opRepo || new OperationRepository();
    this.machineRepo = machineRepo || new MachineRepository();
    this.empaqueRepo = empaqueRepo || new EmpaqueRepository();
  }

  public getDashboardStats(): DashboardStats {
    const visitas = this.visitaRepo.findAll();
    const reemplazos = this.opRepo.findAllReemplazos();
    const cambios = this.opRepo.findAllCambios();
    const servicios = this.opRepo.findAllServicios();

    // Vehicles
    const vehiculoMap: Record<string, number> = {};
    const motivosMap: Record<string, number> = {};
    const codigosMap: Record<string, number> = {};

    for (const v of visitas) {
      vehiculoMap[v.vehiculo] = (vehiculoMap[v.vehiculo] || 0) + 1;
      if (v.reporte) {
        motivosMap[v.reporte.codigo_motivo] = (motivosMap[v.reporte.codigo_motivo] || 0) + 1;
        codigosMap[v.reporte.codigo_origen] = (codigosMap[v.reporte.codigo_origen] || 0) + 1;
      }
    }

    const cabezales = this.machineRepo.findAllCabezales();
    const caseteras = this.machineRepo.findAllCaseteras();
    const frenos = this.machineRepo.findAllFrenos();

    return {
      total_visitas: visitas.length,
      total_reemplazos: reemplazos.length,
      total_cambios_freno: cambios.length,
      total_servicios: servicios.length,
      visitas_por_vehiculo: Object.entries(vehiculoMap).map(([vehiculo, count]) => ({
        vehiculo,
        count,
      })),
      motivos_frecuentes: Object.entries(motivosMap).map(([motivo, count]) => ({
        motivo,
        count,
      })),
      codigos_origen: Object.entries(codigosMap).map(([codigo, count]) => ({
        codigo,
        count,
      })),
      maquinas_por_estado: {
        cabezales: {
          en_uso: cabezales.filter((c) => c.estado === 'En uso').length,
          listos: cabezales.filter((c) => c.estado === 'Listo').length,
          pendientes: cabezales.filter((c) => c.estado === 'Pendiente').length,
        },
        caseteras: {
          en_uso: caseteras.filter((c) => c.estado === 'En uso').length,
          listos: caseteras.filter((c) => c.estado === 'Listo').length,
          pendientes: caseteras.filter((c) => c.estado === 'Pendiente').length,
        },
        frenos: {
          en_uso: frenos.filter((f) => f.estado === 'En uso').length,
          listos: frenos.filter((f) => f.estado === 'Listo').length,
          pendientes: frenos.filter((f) => f.estado === 'Pendiente').length,
        },
      },
    };
  }
}
