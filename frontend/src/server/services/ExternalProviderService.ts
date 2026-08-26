/**
 * ExternalProviderService - Machine Provider External API Integration (RNF11)
 * Adheres strictly to SDD and Clean Code standards
 */

import { Visita } from '../../types/domain';
import { IMachineRepository, MachineRepository } from '../repositories/MachineRepository';
import { IVisitaRepository, VisitaRepository } from '../repositories/VisitaRepository';

export interface ProviderTelemetryPayload {
  provider_name: string;
  generated_at: string;
  total_machines_in_field: number;
  total_field_failures: number;
  synced_reports: {
    report_id: string;
    visit_date: string;
    customer_name: string;
    machine_structure: any[];
    efficiency_pct: number;
    after_hours: boolean;
  }[];
}

export class ExternalProviderService {
  private visitaRepo: IVisitaRepository;
  private machineRepo: IMachineRepository;

  constructor(visitaRepo?: IVisitaRepository, machineRepo?: IMachineRepository) {
    this.visitaRepo = visitaRepo || new VisitaRepository();
    this.machineRepo = machineRepo || new MachineRepository();
  }

  public exportProviderTelemetry(): ProviderTelemetryPayload {
    const visits = this.visitaRepo.findAll();
    const cabezales = this.machineRepo.findAllCabezales();
    const caseteras = this.machineRepo.findAllCaseteras();

    const inFieldCabezales = cabezales.filter((c) => c.estado === 'En uso').length;
    const inFieldCaseteras = caseteras.filter((c) => c.estado === 'En uso').length;

    const reportsData = visits.map((v) => {
      let avgRealPct = 98.0;
      if (v.reporte.estructura.length > 0) {
        const sum = v.reporte.estructura.reduce(
          (acc, item) => acc + (Number(item.pct_etiquetado_real) || 0),
          0
        );
        avgRealPct = Number((sum / v.reporte.estructura.length).toFixed(1));
      }

      return {
        report_id: `SINCLAIR-${v.reporte.numero}`,
        visit_date: v.fecha,
        customer_name: v.reporte.nombre_cliente,
        machine_structure: v.reporte.estructura,
        efficiency_pct: avgRealPct,
        after_hours: v.reporte.fuera_de_hora,
      };
    });

    return {
      provider_name: 'Sinclair International Equipment Systems',
      generated_at: new Date().toISOString(),
      total_machines_in_field: inFieldCabezales + inFieldCaseteras,
      total_field_failures: visits.filter((v) => v.reporte.codigo_motivo === 'Emergencia').length,
      synced_reports: reportsData,
    };
  }
}
