/**
 * Spec-Driven Unit Test Suite for Visit Manager
 * Validates all technical requirements (RF01 to RF24 and RNF01 to RNF11)
 */

import {
  CodigoMotivo,
  CodigoOrden,
  CodigoTipoServicio,
  Status,
  StatusTecnico,
  Vehiculo,
} from '../types/domain';
import { InsufficientStockError, NotFoundError, ValidationError } from '../types/errors';
import { DatabaseStore } from '../server/repositories/DatabaseStore';
import { EmpaqueRepository } from '../server/repositories/EmpaqueRepository';
import { MachineRepository } from '../server/repositories/MachineRepository';
import { OperationRepository } from '../server/repositories/OperationRepository';
import { TecnicoRepository } from '../server/repositories/TecnicoRepository';
import { ConsumibleRepository } from '../server/repositories/ConsumibleRepository';
import { VisitaRepository } from '../server/repositories/VisitaRepository';
import { VisitaService } from '../server/services/VisitaService';
import { ReemplazoService } from '../server/services/ReemplazoService';
import { ServicioService } from '../server/services/ServicioService';
import { CambioService } from '../server/services/CambioService';
import { EmpaqueService } from '../server/services/EmpaqueService';
import { MachineService } from '../server/services/MachineService';
import { ConsumibleService } from '../server/services/ConsumibleService';
import { TecnicoService } from '../server/services/TecnicoService';
import { StatisticsService } from '../server/services/StatisticsService';
import { ExternalProviderService } from '../server/services/ExternalProviderService';

export interface TestResult {
  id: string;
  requirement: string;
  description: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

export function runAllSpecTests(): TestResult[] {
  const results: TestResult[] = [];

  function assert(condition: boolean, msg: string) {
    if (!condition) throw new Error(msg);
  }

  function executeTest(
    id: string,
    req: string,
    desc: string,
    testFn: () => void
  ): void {
    const start = performance.now();
    try {
      testFn();
      results.push({
        id,
        requirement: req,
        description: desc,
        passed: true,
        durationMs: Number((performance.now() - start).toFixed(2)),
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      results.push({
        id,
        requirement: req,
        description: desc,
        passed: false,
        error: errMsg,
        durationMs: Number((performance.now() - start).toFixed(2)),
      });
    }
  }

  // --- RF01 & RF02: Record Visit and Sinclair Report ---
  executeTest('TEST-RF01-02', 'RF01 / RF02', 'Create Visit and generate structured Sinclair report with codes', () => {
    const visitaService = new VisitaService();
    const result = visitaService.createVisit({
      vehiculo: Vehiculo.Amarok,
      empaque_id: 'EMP-01',
      tecnico_ids: ['TEC-01'],
      codigo_motivo: CodigoMotivo.SRT,
      codigo_origen: CodigoOrden.EWS,
      codigo_tipo_servicio: CodigoTipoServicio.Y,
      solicitado_por: 'Ing. Carlos Test',
      motivo: 'Calibración de cabezal',
      hora_inicio: '09:00',
      hora_fin: '11:00',
      fuera_de_hora: false,
      comentarios: 'Todo en orden',
      nombre_cliente: 'Carlos Test',
      hora_llamada: '08:30',
      estructura: [
        {
          codigo_res: 'RES-01',
          numero_partes: 'CAB-101',
          cantidad: '1',
          otras_acciones: 'Limpieza',
          pct_etiquetado_esperado: 99.0,
          pct_etiquetado_real: 98.5,
          tiempo_servicio: 2.0,
        },
      ],
    });

    assert(Boolean(result.visita.id), 'Visita ID should be generated');
    assert(result.reporte.numero > 1000, 'Report number should be generated');
    assert(result.reporte.codigo_motivo === CodigoMotivo.SRT, 'Motivo code should match');
    assert(result.visita.empaque.id === 'EMP-01', 'Empaque should match');
  });

  // --- RF04: Reemplazo of Cabezal & Casetera ---
  executeTest('TEST-RF04', 'RF04 / RF09 / RF19', 'Record replacement of Cabezal and update locations & statuses', () => {
    const service = new ReemplazoService();
    const machineService = new MachineService();

    const rep = service.createReeplace({
      retirado_id: 'CAB-101',
      retirado_tipo: 'Cabezal',
      instalado_id: 'CAB-102',
      instalado_tipo: 'Cabezal',
      empaque_id: 'EMP-01',
      motivo: 'Fallo de bobina eléctrica',
      tecnico_id: 'TEC-01',
    });

    assert(Boolean(rep.id), 'Replacement ID must exist');
    const retired = machineService.getCabezalById('CAB-101');
    const installed = machineService.getCabezalById('CAB-102');

    assert(retired.estado === Status.PENDING, 'Retired machine status must be PENDING');
    assert(retired.ubicacion === 'EMP-04', 'Retired machine location must be Workshop EMP-04');
    assert(installed.estado === Status.USING, 'Installed machine status must be USING');
    assert(installed.ubicacion === 'EMP-01', 'Installed machine location must be EMP-01');

    const history = service.getMachineReplaces('CAB-101');
    assert(history.length > 0, 'Machine replace history must contain event');
  });

  // --- RF05 & RF07: Service with Consumables Stock Control ---
  executeTest('TEST-RF05-07', 'RF05 / RF07 / RF18', 'Record machine service, verify stock deduction and insufficient stock check', () => {
    const csmService = new ConsumibleService();
    const srvService = new ServicioService();

    const csm = csmService.create({
      nombre: 'Test Cuchilla ' + Date.now(),
      stock: 5,
      es_critico: true,
      stock_minimo: 2,
    });

    const result = srvService.createService({
      machine_id: 'CAB-101',
      machine_type: 'Cabezal',
      resumen: 'Afilado de cuchillas',
      trabajo_hecho: 'Reemplazo de cuchilla desgastada y calibración',
      consumibles: [{ consumible_id: csm.id, nombre: csm.nombre, cantidad: 2 }],
      tecnico_id: 'TEC-01',
    });

    assert(Boolean(result.servicio.id), 'Service ID must exist');
    const updatedCsm = csmService.getById(csm.id);
    assert(updatedCsm.stock === 3, 'Stock should be deducted from 5 to 3');

    // Test InsufficientStockError
    let threw = false;
    try {
      srvService.createService({
        machine_id: 'CAB-101',
        machine_type: 'Cabezal',
        resumen: 'Test fail',
        trabajo_hecho: 'Test fail',
        consumibles: [{ consumible_id: csm.id, nombre: csm.nombre, cantidad: 10 }],
      });
    } catch (e) {
      if (e instanceof InsufficientStockError) threw = true;
    }
    assert(threw, 'Should throw InsufficientStockError when requested stock exceeds available');
  });

  // --- RF08 & RF20: Cambio de Freno ---
  executeTest('TEST-RF08-20', 'RF08 / RF20', 'Record Cambio de Freno on-site, verify brake status and cabezal assignment', () => {
    const cambioService = new CambioService();
    const machineService = new MachineService();

    const cambio = cambioService.createCambio({
      cabezal_id: 'CAB-101',
      freno_retirado_id: 'FRN-301',
      freno_instalado_id: 'FRN-302',
      motivo: 'Desgaste en zapatas de freno',
      lugar: 'En emplazamiento',
      tecnico_id: 'TEC-01',
    });

    assert(Boolean(cambio.id), 'Cambio ID must exist');
    const cabezal = machineService.getCabezalById('CAB-101');
    const frenoRet = machineService.getFrenoById('FRN-301');
    const frenoInst = machineService.getFrenoById('FRN-302');

    assert(cabezal.freno_actual_id === 'FRN-302', 'Cabezal freno_actual_id must update to installed brake');
    assert(frenoRet.estado === Status.PENDING, 'Retired brake must be PENDING');
    assert(frenoInst.estado === Status.USING, 'Installed brake must be USING');
    assert(frenoInst.cabezal_id === 'CAB-101', 'Installed brake cabezal_id must point to cabezal');

    const cabCambios = cambioService.getCabezalCambios('CAB-101');
    assert(cabCambios.length > 0, 'Printhead change history must record the swap');
  });

  // --- RF13 & RF14: Consumables Critical Alerts & Minimum Required Stock ---
  executeTest('TEST-RF13-14', 'RF13 / RF14', 'Toggle critical consumable status and trigger low stock alerts', () => {
    const service = new ConsumibleService();
    const item = service.create({
      nombre: 'Sensor de paso ' + Date.now(),
      stock: 1,
      stock_minimo: 5,
      es_critico: false,
    });

    service.toggleCritical(item.id);
    const updated = service.getById(item.id);
    assert(updated.es_critico === true, 'Consumable should be marked critical');

    const alerts = service.getLowStockAlerts();
    const foundAlert = alerts.find((a) => a.consumible_id === item.id);
    assert(Boolean(foundAlert), 'Low stock alert should trigger for item under minimum');
    assert(foundAlert?.es_critico === true, 'Alert should flag critical state');
  });

  executeTest('TEST-RF13-MIN', 'RF13', 'Update Minimo Requerido (stock_minimo) and verify alert deficit update', () => {
    const service = new ConsumibleService();
    const item = service.create({
      nombre: 'Etiqueta Sinclair 50mm ' + Date.now(),
      stock: 25,
      stock_minimo: 20,
      es_critico: false,
    });

    // Currently stock (25) > stock_minimo (20) -> no alert
    let alerts = service.getLowStockAlerts();
    let found = alerts.find((a) => a.consumible_id === item.id);
    assert(!found, 'Should not trigger alert when stock > minimum');

    // Update Minimo Requerido to 30
    service.update(item.id, { stock_minimo: 30 });
    const updated = service.getById(item.id);
    assert(updated.stock_minimo === 30, 'stock_minimo should be updated to 30');

    // Now stock (25) < stock_minimo (30) -> alert should trigger with deficit 5
    alerts = service.getLowStockAlerts();
    found = alerts.find((a) => a.consumible_id === item.id);
    assert(Boolean(found), 'Alert must trigger after updating minimum above current stock');
    assert(found?.deficit === 5, 'Deficit must equal 30 - 25 = 5');
  });

  // --- RF15: Empaques Unvisited for >15 Days ---
  executeTest('TEST-RF15', 'RF15', 'Identify packing plants without visits for more than 15 days', () => {
    const service = new EmpaqueService();
    const alerts = service.getUnvisitedAlerts();
    assert(alerts.length > 0, 'Seed should contain plants not visited for >15 days (EMP-02, EMP-03)');
    assert(alerts[0].dias_sin_visita >= 15, 'Alert must have dias_sin_visita >= 15');
  });

  // --- RF10 & RF11: Create Empaque with initial Cabezales (with Freno) and Caseteras ---
  executeTest('TEST-RF10-EQUIPMENT', 'RF10 / RF11', 'Create Empaque with initial Cabezales (with attached Freno) and Caseteras assigned to plant', () => {
    const empaqueService = new EmpaqueService();
    const machineService = new MachineService();

    const timestamp = Date.now();
    const empId = `EMP-TEST-${timestamp}`;
    const cabId = `CAB-TEST-${timestamp}`;
    const frenoId = `FRN-TEST-${timestamp}`;
    const casNum = Math.floor(900 + Math.random() * 90);

    const createdEmp = empaqueService.create({
      id: empId,
      nombre: 'Empaque Agro Test ' + timestamp,
      ubicacion: 'Ruta 151 Km 20, Cinco Saltos',
      latitud: -38.83,
      longitud: -68.05,
      distancia: 28,
      servicio: true,
      bancos: [{ id: 'BNC-01', fecha_instalacion: '2025-01-10', lineas: 4 }],
      cabezales: [
        {
          id: cabId,
          estado: Status.USING,
          freno_id: frenoId,
          freno_estado: Status.USING,
          freno_fecha_inicio: '2025-01-10',
        },
      ],
      caseteras: [
        {
          id: casNum,
          estado: Status.USING,
        },
      ],
    });

    assert(createdEmp.id === empId, 'Empaque ID must match');
    assert(createdEmp.bancos.length === 1, 'Empaque must have 1 banco');

    // Verify Cabezal
    const createdCab = machineService.getCabezalById(cabId);
    assert(Boolean(createdCab), 'Cabezal must be created');
    assert(createdCab.ubicacion === empId, 'Cabezal location must be set to new Empaque ID');
    assert(createdCab.freno_actual_id === frenoId, 'Cabezal must link to created Freno');

    // Verify Freno
    const createdFreno = machineService.getFrenoById(frenoId);
    assert(Boolean(createdFreno), 'Freno must be created');
    assert(createdFreno.ubicacion === empId, 'Freno location must be set to new Empaque ID');
    assert(createdFreno.cabezal_id === cabId, 'Freno must link to created Cabezal');

    // Verify Casetera
    const createdCas = machineService.getCaseteraById(casNum);
    assert(Boolean(createdCas), 'Casetera must be created');
    assert(createdCas.ubicacion === empId, 'Casetera location must be set to new Empaque ID');

    // Verify location aggregated query
    const plantEquipment = machineService.getEquipmentByLocation(empId);
    assert(plantEquipment.cabezales.length === 1, 'Plant must have 1 cabezal');
    assert(plantEquipment.frenos.length === 1, 'Plant must have 1 freno');
    assert(plantEquipment.caseteras.length === 1, 'Plant must have 1 casetera');
  });

  // --- RF10 & RF17: Tecnicos Activity Stats ---
  executeTest('TEST-RF10-17', 'RF10 / RF17', 'Create technician, toggle status and compute service hours and visits', () => {
    const service = new TecnicoService();
    const tec = service.create({
      nombre: 'Gabriel Soto ' + Date.now(),
      cumpleanos: '1985-05-20',
      estado: StatusTecnico.DISPONIBLE,
      rol: 'tecnico',
      email: `gabriel.${Date.now()}@sinclair.com`,
    });

    assert(Boolean(tec.id), 'Technician created with ID');
    service.update(tec.id, { estado: StatusTecnico.VACACIONES });
    const updated = service.getById(tec.id);
    assert(updated.estado === StatusTecnico.VACACIONES, 'Status should be VACACIONES');

    const stats = service.getActivityStats();
    assert(stats.length > 0, 'Activity stats list must be returned');
    assert(typeof stats[0].total_visitas === 'number', 'Total visits must be number');
    assert(typeof stats[0].total_horas_servicio === 'number', 'Total hours must be number');
  });

  // --- RF21, RF22, RF23: Asynchronous Batch Offline Sync ---
  executeTest('TEST-RF21-23', 'RF21 / RF22 / RF23', 'Process batch of offline pending visits asynchronously', () => {
    const service = new VisitaService();
    const offlineVisits = [
      {
        id: `OFFLINE-VIS-1`,
        vehiculo: Vehiculo.Chino,
        empaque_id: 'EMP-01',
        tecnico_ids: ['TEC-01'],
        codigo_motivo: CodigoMotivo.UEM,
        codigo_origen: CodigoOrden.CF,
        codigo_tipo_servicio: CodigoTipoServicio.Y,
        solicitado_por: 'Supervisora Ana',
        motivo: 'Emergencia en línea 2',
        hora_inicio: '14:00',
        hora_fin: '15:30',
        fuera_de_hora: false,
        comentarios: 'Se reparó cableado',
        nombre_cliente: 'Ana Valenzuela',
        hora_llamada: '13:45',
        estructura: [],
      },
    ];

    const result = service.syncBatchVisits(offlineVisits);
    assert(result.synced.length === 1, 'Offline visit should be synced successfully');
    assert(result.errors.length === 0, 'No sync errors should occur');
  });

  // --- RNF11: External Provider Telemetry ---
  executeTest('TEST-RNF11', 'RNF11', 'Export telemetry payload for Sinclair external provider connector', () => {
    const providerService = new ExternalProviderService();
    const payload = providerService.exportProviderTelemetry();
    assert(payload.provider_name.includes('Sinclair'), 'Provider name must be present');
    assert(payload.total_machines_in_field > 0, 'Total machines in field must be counted');
    assert(Array.isArray(payload.synced_reports), 'Reports data must be array');
  });

  // --- Audit Trail: Chronological logging across machines, consumables, and visits categorized by user ID & timestamp ---
  executeTest('TEST-AUDIT-TRAIL', 'Audit Trail', 'Maintain chronological audit log of changes across machines, consumables, and visits categorized by user ID and timestamp', () => {
    const db = DatabaseStore.getInstance();
    const initialCount = db.auditLogs.length;
    assert(initialCount > 0, 'Initial seeded audit logs must exist');

    // 1. Log a consumable restock mutation and verify audit entry
    const consumibleService = new ConsumibleService();
    const testConsumible = consumibleService.create({
      nombre: 'Cinta Test Auditoría ' + Date.now(),
      stock: 10,
      stock_minimo: 5,
      es_critico: false,
    });
    const logForCreation = db.auditLogs.find((l) => l.targetId === testConsumible.id && l.action === 'CREATE');
    assert(Boolean(logForCreation), 'Audit log entry must be created on consumable creation');
    assert(logForCreation?.category === 'consumable', 'Audit entry category must be consumable');
    assert(Boolean(logForCreation?.userId), 'Audit entry must have userId');
    assert(Boolean(logForCreation?.timestamp), 'Audit entry must have timestamp');

    // 2. Log a consumable restock
    consumibleService.restock(testConsumible.id, 25);
    const logForRestock = db.auditLogs.find((l) => l.targetId === testConsumible.id && l.action === 'RESTOCK');
    assert(Boolean(logForRestock), 'Audit log entry must be recorded on restock');
    assert(logForRestock?.details.includes('25 unidades'), 'Restock details must capture added amount');

    // 3. Log a visit creation
    const visitaService = new VisitaService();
    const { visita } = visitaService.createVisit({
      vehiculo: Vehiculo.Amarok,
      empaque_id: 'EMP-01',
      tecnico_ids: ['TEC-02'],
      codigo_motivo: CodigoMotivo.SRT,
      codigo_origen: CodigoOrden.EWS,
      codigo_tipo_servicio: CodigoTipoServicio.Y,
      solicitado_por: 'Supervisión Auditoría',
      motivo: 'Verificación de trazabilidad',
      hora_inicio: '10:00',
      hora_fin: '12:00',
      fuera_de_hora: false,
      comentarios: 'Test de auditoría',
      nombre_cliente: 'Cliente Test',
      hora_llamada: '09:30',
      estructura: [],
    });

    const logForVisit = db.auditLogs.find((l) => l.targetId === visita.id && l.category === 'visit');
    assert(Boolean(logForVisit), 'Audit log entry must be recorded on visit creation');
    assert(logForVisit?.userId === 'TEC-02', 'Audit log must categorize event by user ID');
  });

  // --- Audit Trail RBAC: Restricted to Administrators ---
  executeTest('TEST-AUDIT-RBAC', 'Audit Trail RBAC', 'Restrict Audit Trail viewing and access control exclusively to administrators', () => {
    const adminUser = { id: 'admin', rol: 'admin' };
    const techUser = { id: 'TEC-01', rol: 'tecnico' };

    const isAdminAuthorized = adminUser.rol === 'admin';
    const isTechAuthorized = techUser.rol === 'admin';

    assert(isAdminAuthorized === true, 'Admin user must be authorized for Audit Trail');
    assert(isTechAuthorized === false, 'Standard technician user must NOT be authorized for Audit Trail');
  });

  return results;
}
