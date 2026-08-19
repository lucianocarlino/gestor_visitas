/**
 * DatabaseStore - In-Memory Singleton Repository Store
 * Provides realistic domain data seeded per specification
 */

import {
  Cabezal,
  Casetera,
  Consumible,
  Empaque,
  Freno,
  Movimiento,
  Reemplazo,
  Cambio,
  Servicio,
  Status,
  StatusTecnico,
  Tecnico,
  Visita,
  CodigoMotivo,
  CodigoOrden,
  CodigoTipoServicio,
  Vehiculo,
  AuditEntry,
} from '../../types/domain';

export class DatabaseStore {
  private static instance: DatabaseStore;

  public empaques: Map<string, Empaque> = new Map();
  public cabezales: Map<string, Cabezal> = new Map();
  public caseteras: Map<number, Casetera> = new Map();
  public frenos: Map<string, Freno> = new Map();
  public consumibles: Map<string, Consumible> = new Map();
  public tecnicos: Map<string, Tecnico> = new Map();
  public visitas: Map<string, Visita> = new Map();
  public reemplazos: Reemplazo[] = [];
  public cambios: Cambio[] = [];
  public servicios: Servicio[] = [];
  public movimientos: Movimiento[] = [];
  public auditLogs: AuditEntry[] = [];
  public visitCounter: number = 1000;
  public auditCounter: number = 100;

  private constructor() {
    this.seedInitialData();
  }

  public static getInstance(): DatabaseStore {
    if (!DatabaseStore.instance) {
      DatabaseStore.instance = new DatabaseStore();
    }
    return DatabaseStore.instance;
  }

  public addAuditLog(entry: Omit<AuditEntry, 'id' | 'timestamp'> & { timestamp?: string }): AuditEntry {
    this.auditCounter += 1;
    const newEntry: AuditEntry = {
      id: `AUD-${this.auditCounter}`,
      timestamp: entry.timestamp || new Date().toISOString(),
      userId: entry.userId,
      userName: entry.userName,
      userRole: entry.userRole,
      category: entry.category,
      action: entry.action,
      targetId: entry.targetId,
      targetName: entry.targetName,
      details: entry.details,
      previousValue: entry.previousValue,
      newValue: entry.newValue,
      metadata: entry.metadata,
    };
    this.auditLogs.unshift(newEntry);
    return newEntry;
  }

  private seedInitialData(): void {
    this.seedTecnicos();
    this.seedEmpaques();
    this.seedMachines();
    this.seedConsumibles();
    this.seedOperations();
    this.seedHistoricalVisits();
    this.seedAuditLogs();
  }

  private seedTecnicos(): void {
    const tecnicos: Tecnico[] = [
      {
        id: 'TEC-01',
        nombre: 'Carlos Mendoza',
        ultima_conexion: new Date().toISOString(),
        estado: StatusTecnico.DISPONIBLE,
        cumpleanos: '1988-04-12',
        rol: 'tecnico',
        email: 'carlos.mendoza@sinclair-service.com',
        password: 'sinclair123',
      },
      {
        id: 'TEC-02',
        nombre: 'Martín Rodríguez',
        ultima_conexion: new Date().toISOString(),
        estado: StatusTecnico.DISPONIBLE,
        cumpleanos: '1992-09-25',
        rol: 'tecnico',
        email: 'martin.rodriguez@sinclair-service.com',
        password: 'sinclair123',
      },
      {
        id: 'TEC-03',
        nombre: 'Laura Benítez',
        ultima_conexion: new Date(Date.now() - 86400000 * 3).toISOString(),
        estado: StatusTecnico.VACACIONES,
        cumpleanos: '1990-11-03',
        rol: 'admin',
        email: 'laura.benitez@sinclair-service.com',
        password: 'admin2025',
      },
    ];
    tecnicos.forEach((t) => this.tecnicos.set(t.id, t));
  }

  private seedEmpaques(): void {
    const empaques: Empaque[] = [
      {
        id: 'EMP-01',
        nombre: 'Frutas del Valle S.A.',
        ubicacion: 'Ruta 22 Km 1205, Allen, Río Negro',
        latitud: -38.9765,
        longitud: -67.8284,
        servicio: true,
        distancia: 45.2,
        ultima_visita: new Date(Date.now() - 86400000 * 4).toISOString(),
        bancos: [
          { id: 'BNC-01', fecha_instalacion: '2023-02-15', lineas: 4 },
          { id: 'BNC-02', fecha_instalacion: '2023-08-20', lineas: 6 },
        ],
      },
      {
        id: 'EMP-02',
        nombre: 'Agrofrutícola Patagonia',
        ubicacion: 'Acceso Sur 450, Cipolletti',
        latitud: -38.9341,
        longitud: -67.9902,
        servicio: true,
        distancia: 18.5,
        ultima_visita: new Date(Date.now() - 86400000 * 22).toISOString(), // >15 days alert
        bancos: [{ id: 'BNC-03', fecha_instalacion: '2022-11-10', lineas: 8 }],
      },
      {
        id: 'EMP-03',
        nombre: 'Cereza Andina Packing',
        ubicacion: 'Paraje El Bolsón s/n',
        latitud: -41.9641,
        longitud: -71.5332,
        servicio: true,
        distancia: 120.0,
        ultima_visita: new Date(Date.now() - 86400000 * 18).toISOString(), // >15 days alert
        bancos: [{ id: 'BNC-04', fecha_instalacion: '2024-01-05', lineas: 2 }],
      },
      {
        id: 'EMP-04',
        nombre: 'Taller Central Sinclair',
        ubicacion: 'Parque Industrial Neuquén Lote 14',
        latitud: -38.9100,
        longitud: -68.0800,
        servicio: false,
        distancia: 0,
        bancos: [],
      },
    ];
    empaques.forEach((e) => this.empaques.set(e.id, e));
  }

  private seedMachines(): void {
    const cabezales: Cabezal[] = [
      {
        id: 'CAB-101',
        tipo: 'Cabezal',
        estado: Status.USING,
        ubicacion: 'EMP-01',
        freno_actual_id: 'FRN-301',
        historial_movimientos: [
          {
            id: 'MOV-1',
            machine_id: 'CAB-101',
            machine_type: 'Cabezal',
            fecha: '2025-01-10',
            tecnico_nombre: 'Carlos Mendoza',
            motivo: 'Instalación de inicio de temporada',
            origen: 'EMP-04',
            destino: 'EMP-01',
          },
        ],
      },
      {
        id: 'CAB-102',
        tipo: 'Cabezal',
        estado: Status.READY,
        ubicacion: 'EMP-04',
        historial_movimientos: [],
      },
      {
        id: 'CAB-103',
        tipo: 'Cabezal',
        estado: Status.PENDING,
        ubicacion: 'EMP-04',
        historial_movimientos: [
          {
            id: 'MOV-2',
            machine_id: 'CAB-103',
            machine_type: 'Cabezal',
            fecha: '2025-02-01',
            tecnico_nombre: 'Martín Rodríguez',
            motivo: 'Retiro por fallo de bobina',
            origen: 'EMP-02',
            destino: 'EMP-04',
          },
        ],
      },
    ];
    cabezales.forEach((c) => {
      this.cabezales.set(c.id, c);
      c.historial_movimientos.forEach((m) => this.movimientos.push(m));
    });

    const caseteras: Casetera[] = [
      {
        id: 201,
        tipo: 'Casetera',
        estado: Status.USING,
        ubicacion: 'EMP-01',
        historial_movimientos: [],
      },
      {
        id: 202,
        tipo: 'Casetera',
        estado: Status.READY,
        ubicacion: 'EMP-04',
        historial_movimientos: [],
      },
      {
        id: 203,
        tipo: 'Casetera',
        estado: Status.USING,
        ubicacion: 'EMP-02',
        historial_movimientos: [],
      },
    ];
    caseteras.forEach((c) => {
      this.caseteras.set(c.id, c);
      c.historial_movimientos.forEach((m) => this.movimientos.push(m));
    });

    const frenos: Freno[] = [
      {
        id: 'FRN-301',
        tipo: 'Freno',
        fecha_inicio: '2024-03-01',
        estado: Status.USING,
        cabezal_id: 'CAB-101',
        ubicacion: 'EMP-01',
        historial_movimientos: [],
      },
      {
        id: 'FRN-302',
        tipo: 'Freno',
        fecha_inicio: '2024-05-15',
        estado: Status.READY,
        ubicacion: 'EMP-04',
        historial_movimientos: [],
      },
      {
        id: 'FRN-303',
        tipo: 'Freno',
        fecha_inicio: '2024-01-20',
        estado: Status.PENDING,
        ubicacion: 'EMP-04',
        historial_movimientos: [],
      },
    ];
    frenos.forEach((f) => {
      this.frenos.set(f.id, f);
      f.historial_movimientos.forEach((m) => this.movimientos.push(m));
    });
  }

  private seedConsumibles(): void {
    const consumibles: Consumible[] = [
      {
        id: 'CSM-01',
        nombre: 'Cuchillas de corte Sinclair #44',
        stock: 3, // Low stock alert
        es_critico: true,
        stock_minimo: 10,
      },
      {
        id: 'CSM-02',
        nombre: 'Resortes de retorno de freno',
        stock: 25,
        es_critico: true,
        stock_minimo: 15,
      },
      {
        id: 'CSM-03',
        nombre: 'Junta tórica de sellado 12mm',
        stock: 4, // Low stock alert
        es_critico: true,
        stock_minimo: 8,
      },
      {
        id: 'CSM-04',
        nombre: 'Lubricante sintético Sinclair Tech 250ml',
        stock: 12,
        es_critico: false,
        stock_minimo: 5,
      },
      {
        id: 'CSM-05',
        nombre: 'Fuelle de aire de fuelle de etiquetado',
        stock: 18,
        es_critico: false,
        stock_minimo: 10,
      },
    ];
    consumibles.forEach((c) => this.consumibles.set(c.id, c));
  }

  private seedOperations(): void {
    this.reemplazos = [
      {
        id: 'REP-001',
        fecha: '2025-02-10',
        motivo: 'Falla intermitente en sensor de paso de cinta',
        retirado_id: 'CAB-103',
        retirado_tipo: 'Cabezal',
        instalado_id: 'CAB-102',
        instalado_tipo: 'Cabezal',
        empaque_id: 'EMP-02',
        empaque_nombre: 'Agrofrutícola Patagonia',
        tecnico_id: 'TEC-02',
        tecnico_nombre: 'Martín Rodríguez',
      },
    ];

    this.cambios = [
      {
        id: 'CAM-001',
        fecha: '2025-02-12',
        motivo: 'Desgaste por fricción de ferodo tras 500k etiquetas',
        lugar: 'EMP-01',
        retirado_freno_id: 'FRN-303',
        instalado_freno_id: 'FRN-301',
        cabezal_id: 'CAB-101',
        tecnico_id: 'TEC-01',
        tecnico_nombre: 'Carlos Mendoza',
      },
    ];

    this.servicios = [
      {
        id: 'SRV-001',
        fecha: '2025-02-14',
        resumen: 'Mantenimiento preventivo general y engrase de bancada',
        trabajo_hecho: 'Desmontaje de cabezal, limpieza ultrasónica, lubricación y cambio de junta tórica.',
        machine_id: 'CAB-101',
        machine_type: 'Cabezal',
        consumibles: [
          { consumible_id: 'CSM-03', cantidad: 2, nombre: 'Junta tórica de sellado 12mm' },
          { consumible_id: 'CSM-04', cantidad: 1, nombre: 'Lubricante sintético Sinclair Tech 250ml' },
        ],
        tecnico_id: 'TEC-01',
        tecnico_nombre: 'Carlos Mendoza',
      },
    ];
  }

  private seedHistoricalVisits(): void {
    const empaque1 = this.empaques.get('EMP-01')!;
    const empaque2 = this.empaques.get('EMP-02')!;
    const empaque3 = this.empaques.get('EMP-03')!;
    const tec1 = this.tecnicos.get('TEC-01')!;
    const tec2 = this.tecnicos.get('TEC-02')!;

    const sampleVisit1: Visita = {
      id: 'VIS-1001',
      fecha: new Date(Date.now() - 86400000 * 4).toISOString(),
      motivo: 'Mantenimiento preventivo de mitad de cosecha',
      solicitado_por: 'Ing. Marcelo Gómez (Jefe de Planta)',
      vehiculo: Vehiculo.Amarok,
      tecnicos: [tec1],
      empaque: empaque1,
      estado_sincronizacion: 'synced',
      reporte: {
        numero: 1001,
        codigo_motivo: CodigoMotivo.SRT,
        codigo_origen: CodigoOrden.EWS,
        codigo_tipo_servicio: CodigoTipoServicio.Y,
        hora_inicio: '08:30',
        hora_fin: '12:45',
        fuera_de_hora: false,
        comentarios: 'Se calibraron 4 cabezales y se reemplazaron cuchillas.',
        nombre_cliente: 'Marcelo Gómez',
        hora_llamada: '07:45',
        produccion_etiquetada: '98.5%',
        condicion_fruta: 'Manzana Gala de exportación - Calibre óptimo',
        created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
        estructura: [
          {
            codigo_res: 'RES-01',
            numero_partes: 'CAB-101 / FRN-301',
            cantidad: '1',
            otras_acciones: 'Limpieza con ultrasonido y ajuste de sensor óptico',
            pct_etiquetado_esperado: 99.0,
            pct_etiquetado_real: 98.6,
            tiempo_servicio: 2.5,
          },
        ],
      },
    };
    this.visitas.set(sampleVisit1.id, sampleVisit1);

    const sampleVisit2: Visita = {
      id: 'VIS-1002',
      fecha: new Date(Date.now() - 86400000 * 8).toISOString(),
      motivo: 'Reemplazo de cabezal por error de corte de cinta',
      solicitado_por: 'Supervisora Andrea Castro',
      vehiculo: Vehiculo.Chino,
      tecnicos: [tec2],
      empaque: empaque2,
      estado_sincronizacion: 'synced',
      reporte: {
        numero: 1002,
        codigo_motivo: CodigoMotivo.UEM,
        codigo_origen: CodigoOrden.CF,
        codigo_tipo_servicio: CodigoTipoServicio.Y,
        hora_inicio: '14:00',
        hora_fin: '17:30',
        fuera_de_hora: true,
        comentarios: 'Se instaló cabezal CAB-102 de reemplazo.',
        nombre_cliente: 'Andrea Castro',
        hora_llamada: '13:15',
        produccion_etiquetada: '99.1%',
        condicion_fruta: 'Pera Williams exportación',
        created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
        estructura: [
          {
            codigo_res: 'RES-02',
            numero_partes: 'CAB-102',
            cantidad: '1',
            otras_acciones: 'Reemplazo de módulo y calibración de presión',
            pct_etiquetado_esperado: 99.5,
            pct_etiquetado_real: 99.2,
            tiempo_servicio: 3.0,
          },
        ],
      },
    };
    this.visitas.set(sampleVisit2.id, sampleVisit2);

    const sampleVisit3: Visita = {
      id: 'VIS-1003',
      fecha: new Date(Date.now() - 86400000 * 12).toISOString(),
      motivo: 'Inspección técnica anual de bancos de etiquetado',
      solicitado_por: 'Ing. Roberto Silva',
      vehiculo: Vehiculo.Amarok,
      tecnicos: [tec1, tec2],
      empaque: empaque3,
      estado_sincronizacion: 'synced',
      reporte: {
        numero: 1003,
        codigo_motivo: CodigoMotivo.SPR,
        codigo_origen: CodigoOrden.CTR,
        codigo_tipo_servicio: CodigoTipoServicio.Y,
        hora_inicio: '09:00',
        hora_fin: '15:00',
        fuera_de_hora: false,
        comentarios: 'Revisión exhaustiva de líneas 1 y 2.',
        nombre_cliente: 'Roberto Silva',
        hora_llamada: '08:30',
        produccion_etiquetada: '98.0%',
        condicion_fruta: 'Cereza Lapins',
        created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
        estructura: [
          {
            codigo_res: 'RES-03',
            numero_partes: 'BNC-04',
            cantidad: '2',
            otras_acciones: 'Engrase y alineación de guías',
            pct_etiquetado_esperado: 98.0,
            pct_etiquetado_real: 98.0,
            tiempo_servicio: 5.0,
          },
        ],
      },
    };
    this.visitas.set(sampleVisit3.id, sampleVisit3);
  }

  private seedAuditLogs(): void {
    const now = Date.now();
    const logs: Array<Omit<AuditEntry, 'id' | 'timestamp'> & { timestamp: string }> = [
      {
        timestamp: new Date(now - 1000 * 60 * 15).toISOString(),
        userId: 'TEC-03',
        userName: 'Laura Benítez',
        userRole: 'admin',
        category: 'consumable',
        action: 'THRESHOLD_CHANGE',
        targetId: 'CONS-02',
        targetName: 'Cinta Transferencia Térmica Sinclair 110mm',
        details: 'Actualización de stock de seguridad mínimo requerido de 25 uds a 30 uds para temporada alta.',
        previousValue: '25 uds',
        newValue: '30 uds',
        metadata: { field: 'stock_minimo', reason: 'Ajuste estacional' },
      },
      {
        timestamp: new Date(now - 1000 * 60 * 45).toISOString(),
        userId: 'TEC-01',
        userName: 'Carlos Mendoza',
        userRole: 'tecnico',
        category: 'machine',
        action: 'REPLACE',
        targetId: 'CAB-01',
        targetName: 'Cabezal Sinclair CAB-01',
        details: 'Reemplazo en Empaque Frutícola Valle Verde: Se retira CAB-01 (falla sensor) y se instala CAB-02 (Listo).',
        previousValue: 'En uso (EMP-01)',
        newValue: 'Pendiente (Taller)',
        metadata: { empaque_id: 'EMP-01', instalado_id: 'CAB-02', retirado_id: 'CAB-01' },
      },
      {
        timestamp: new Date(now - 1000 * 60 * 120).toISOString(),
        userId: 'TEC-02',
        userName: 'Martín Rodríguez',
        userRole: 'tecnico',
        category: 'consumable',
        action: 'RESTOCK',
        targetId: 'CONS-01',
        targetName: 'Rollo Etiquetas Sinclair Estándar 40mm',
        details: 'Reabastecimiento de depósito: Ingreso de lote de 150 unidades de etiquetas.',
        previousValue: '120 uds',
        newValue: '270 uds',
        metadata: { addedAmount: 150, batch: 'LOT-2026-B1' },
      },
      {
        timestamp: new Date(now - 1000 * 60 * 240).toISOString(),
        userId: 'TEC-01',
        userName: 'Carlos Mendoza',
        userRole: 'tecnico',
        category: 'visit',
        action: 'CREATE',
        targetId: 'VIS-1002',
        targetName: 'Visita Técnica #1002 - Moño Azul S.A.',
        details: 'Registro y firma de visita técnica: Mantenimiento correctivo en casetera CAS-02 y calibración de presión.',
        previousValue: null,
        newValue: 'Sincronizada (synced)',
        metadata: { cliente: 'Ignacio Fuentes', vehiculo: 'Particular', estado: 'synced' },
      },
      {
        timestamp: new Date(now - 1000 * 60 * 360).toISOString(),
        userId: 'TEC-03',
        userName: 'Laura Benítez',
        userRole: 'admin',
        category: 'machine',
        action: 'BRAKE_SWAP',
        targetId: 'CAB-03',
        targetName: 'Cabezal Sinclair CAB-03',
        details: 'Cambio de freno en Taller: Se retira FRN-03 por desgaste de zapatas y se instala FRN-02.',
        previousValue: 'Freno FRN-03',
        newValue: 'Freno FRN-02',
        metadata: { lugar: 'Taller Base', instalado_freno_id: 'FRN-02', retirado_freno_id: 'FRN-03' },
      },
      {
        timestamp: new Date(now - 1000 * 60 * 720).toISOString(),
        userId: 'TEC-02',
        userName: 'Martín Rodríguez',
        userRole: 'tecnico',
        category: 'machine',
        action: 'SERVICE',
        targetId: 'CAS-01',
        targetName: 'Casetera CAS-01',
        details: 'Servicio en Taller: Limpieza por ultrasonido y recambio de kit de rodillos de arrastre.',
        previousValue: 'Pendiente',
        newValue: 'Listo',
        metadata: { trabajo: 'Limpieza y lubricación general', repuestos: 'Kit rodillos' },
      },
      {
        timestamp: new Date(now - 1000 * 60 * 1440).toISOString(),
        userId: 'TEC-01',
        userName: 'Carlos Mendoza',
        userRole: 'tecnico',
        category: 'visit',
        action: 'CREATE',
        targetId: 'VIS-1001',
        targetName: 'Visita Técnica #1001 - Frutícola Valle Verde',
        details: 'Creación de reporte Sinclair: Calibración de cabezales y chequeo de celda óptica.',
        previousValue: null,
        newValue: 'Sincronizada (synced)',
        metadata: { cliente: 'Mario Gómez', vehiculo: 'Amarok' },
      },
      {
        timestamp: new Date(now - 1000 * 60 * 2880).toISOString(),
        userId: 'TEC-03',
        userName: 'Laura Benítez',
        userRole: 'admin',
        category: 'consumable',
        action: 'CRITICAL_TOGGLE',
        targetId: 'CONS-03',
        targetName: 'Cabezal Térmico Sinclair Kyocera 300dpi',
        details: 'Clasificación de criticidad: El consumible fue marcado como Ítem Crítico para la operación.',
        previousValue: 'No Crítico',
        newValue: 'Crítico',
        metadata: { es_critico: true },
      },
    ];

    logs.forEach((log) => {
      this.addAuditLog(log);
    });
  }
}
