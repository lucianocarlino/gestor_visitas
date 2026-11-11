/**
 * Domain types and Enums for Visit Manager
 * Adheres strictly to SDD specification
 */

export enum Status {
  PENDING = 'Pendiente',
  READY = 'Listo',
  USING = 'En uso',
}

export enum CodigoMotivo {
  SRT = 'Rutina',
  SPR = 'Pretemporada',
  SPO = 'Postemporada',
  SOH = 'Revision',
  UEM = 'Emergencia',
  UIN = 'Instalacion',
  URM = 'Retirada',
  UUP = 'Actualizacion',
}

export enum CodigoOrden {
  CTR = 'Cliente/Operador',
  SZR = 'Calibrador',
  FC = 'Condición de fruta',
  EWS = 'Equipo dentro de especificaciones',
  CF = 'Fallo de los componentes',
  ADJ = 'Ajuste necesario',
  LF = 'Problema con las etiquetas',
  LDM = 'Recepcion/Alamcenaje de etiquetas',
  PD = 'Daño fisico',
}

// CodigoOrigen alias mapped to CodigoOrden as per specification
export type CodigoOrigen = CodigoOrden;
export const CodigoOrigen = CodigoOrden;

/**
 * TODO: Completar con los códigos de resolución y sus descripciones oficiales.
 * Formato: _CODIGO = 'Descripcion' (el guion bajo inicial se quita automáticamente)
 */
export enum CodigoResolucion {
    _100 = 'Frame',
_103 = 'Interface',
_105 = 'Sizer Speed',
_110 = 'Guards / Covers',
_120 = 'Electrical Cabling',
_121 = 'Ground Straps',
_122 = 'Electrical Supply - labeller',
_123 = 'Contactor / Overlaod Trip/ Failure',
_130 = 'Pressure / Vaccum Tube',
_131 = 'Rotary Head (Hexagono)',
_140 = 'Scanners / Sensors (SP)',
_150 = 'Timing Sys [Sync & Interface]',
_151 = 'Encoder Tyre',
_152 = 'Speed Sync Board (Placa)',
_153 = 'Interface Board (Placa)',
_154 = 'Main Control Board (Placa)',
_155 = 'Arm Control Board',
_157 = 'Inverter (Variador)',
_160 = 'Traverse Arm',
_161 = 'Zero Block / Magnet',
_162 = 'Blue Track',
_170 = 'Drive Gear Box (Motor - eje)',
_180 = 'E-Stops (Golpe puño)',
_190 = 'Jacks - head adjustement (Altura banco)',
_200 = 'BVC',
_201 = 'Bearings Pump',
_202 = 'Bearings Motor',
_210 = 'Impellor',
_220 = 'Motor',
_230 = 'Vacuum (Reg vacío)',
_240 = 'Pressure (Reg presión)',
_250 = 'Hoses (Mangueras)',
_260 = 'Belt (Correa)',
_270 = 'Cover (Tapa)',
_280 = 'Mounting Hardware',
_290 = 'Dust Filter',
_300 = 'TTA / Chop and Blow',
_301 = 'Impellor (Cuchilla)',
_302 = 'Blockage',
_310 = 'Hand Guard',
_320 = 'Motor',
_340 = 'Cloth / Ploy Bags',
_341 = 'Skirts',
_342 = 'Retaining Straps',
_350 = 'Hoses',
_360 = 'Take Away Tubes',
_400 = 'Applicators',
_410 = 'Main body [Housing]',
_420 = 'Twin Carn (Leva)',
_421 = 'Latch (Gatillo)',
_423 = 'Spring (Resortes)',
_430 = 'CB4 Clutch (Clutch)',
_431 = 'Input Hub',
_432 = 'Drive Spring (Delante)',
_433 = 'Brake Spring (Atrás)',
_434 = 'Two Stop Collar',
_435 = 'Solenoid',
_436 = 'Spring',
_440 = 'PSI4 / Stop Clutch',
_441 = 'Spring (Resorte)',
_442 = 'Index (Indice)',
_443 = 'Stop Shaft Gear Assy',
_450 = 'Final Drive Gear',
_451 = 'Lay Shaft Gear (Negro)',
_452 = 'Idler Gear Assy',
_453 = 'Input Gear Assy (32 dientes)',
_460 = 'Bellows (Fuelles)',
_461 = 'Check Valves',
_462 = 'Diffusers',
_470 = 'Timing Beit (Correa)',
_480 = 'Micro Switches',
_490 = 'Electrical Socket (Toma corriente)',
_640 = 'Slide Tubes / O-Rings',
_500 = 'Carriages',
_510 = 'Frame / Plate',
_520 = 'Stepper Drive Module',
_530 = 'Stepper Motor',
_540 = 'Carriage Board',
_560 = 'Ribbon Cables',
_600 = 'Cassettes',
_610 = 'Body',
_611 = 'Stipper Plate (Brazo)',
_612 = 'Spring and Stop Screw',
_613 = 'Cam Follower (Rodillo p/ leva)',
_614 = 'Scollop Plates & Wheel Assy',
_620 = 'On / Off Push Button',
_630 = 'Sprocket Wheel (Pinches)',
_650 = 'Tension Arm (Freno)',
_660 = 'Control Rollers (Rodillo pinches)',
_690 = 'Flanges (Discos)',
_695 = 'Body Damage',
_700 = 'Tray Labelers',
_710 = 'Drive Belts',
_720 = 'Drive Motor',
_730 = 'Conveyor Belts',
_735 = 'CR4 Belt Calibration',
_740 = 'Pressure / Vaccum Tubes',
_750 = 'Programming',
_770 = 'Pattern Adjustments',
_780 = 'Pattern Creation',
_790 = 'Global Adjustments',
_800 = 'VRS',
_810 = 'Computer Screen',
_830 = 'Panels',
_900 = 'iQ',
_910 = 'Bellows and Sensor',
_920 = 'Spring and Solenoid',
_950 = 'Total Solution Carrier'
}

export enum CodigoTipoServicio {
  Y = 'En emplazamiento',
  X = 'Taller',
  T = 'Formacion',
}

export enum Vehiculo {
  Amarok = 'Amarok',
  Chino = 'Chino',
  Particular = 'Particular',
}

export enum StatusTecnico {
  DISPONIBLE = 'Disponible',
  VACACIONES = 'Vacaciones',
}

export type MachineType = 'Cabezal' | 'Casetera' | 'Freno';

export interface Banco {
  id: string;
  fecha_instalacion: string;
  lineas: number;
}

export interface InitialCabezalInput {
  id: string;
  estado?: Status;
  freno_id?: string;
  freno_estado?: Status;
  freno_fecha_inicio?: string;
}

export interface InitialCaseteraInput {
  id: number;
  estado?: Status;
}

export interface CreateEmpaqueDTO {
  id?: string;
  nombre: string;
  ubicacion: string;
  latitud: number;
  longitud: number;
  servicio: boolean;
  distancia: number;
  bancos: Banco[];
  cabezales?: InitialCabezalInput[];
  caseteras?: InitialCaseteraInput[];
}

export interface Empaque {
  id: string;
  nombre: string;
  ubicacion: string;
  latitud: number;
  longitud: number;
  servicio: boolean;
  distancia: number;
  bancos: Banco[];
  ultima_visita?: string;
}

export interface Tecnico {
  id: string;
  nombre: string;
  ultima_conexion: string;
  estado: StatusTecnico;
  cumpleanos: string;
  rol: 'tecnico' | 'admin';
  email: string;
  password?: string;
}

export interface Movimiento {
  id: string;
  machine_id: string;
  machine_type: MachineType;
  fecha: string;
  tecnico_nombre: string;
  motivo: string;
  origen: string;
  destino: string;
}

export interface Cabezal {
  id: string;
  tipo: 'Cabezal';
  estado: Status;
  ubicacion: string;
  freno_actual_id?: string;
  historial_movimientos: Movimiento[];
}

export interface Casetera {
  id: number;
  tipo: 'Casetera';
  estado: Status;
  ubicacion: string;
  empaque_id: string;
  historial_movimientos: Movimiento[];
}

export interface Freno {
  id: string;
  tipo: 'Freno';
  fecha_inicio: string;
  estado: Status;
  cabezal_id?: string;
  ubicacion: string;
  historial_movimientos: Movimiento[];
}

export type AnyMachine = Cabezal | Casetera | Freno;

export interface Reemplazo {
  id: string;
  fecha: string;
  motivo: string;
  retirado_id: string | null;
  retirado_tipo: 'Cabezal' | 'Casetera' | null;
  instalado_id: string;
  instalado_tipo: 'Cabezal' | 'Casetera';
  empaque_id: string;
  empaque_nombre: string;
  tecnico_id?: string;
  tecnico_nombre?: string;
}

export interface Cambio {
  id: string;
  fecha: string;
  motivo: string;
  lugar: string;
  retirado_freno_id: string;
  instalado_freno_id: string;
  cabezal_id: string;
  tecnico_id?: string;
  tecnico_nombre?: string;
}

export interface ConsumibleItem {
  consumible_id: string;
  nombre: string;
  cantidad: number;
}

export interface Consumible {
  id: string;
  nombre: string;
  stock: number;
  es_critico: boolean;
  stock_minimo: number;
}

export interface Servicio {
  id: string;
  machine_id: string;
  machine_type: MachineType;
  fecha: string;
  resumen: string;
  trabajo_hecho: string;
  consumibles: ConsumibleItem[];
  tecnico_id?: string;
  tecnico_nombre?: string;
}

export interface ItemEstructura {
    numero_de_serie: string;
    codigo_motivo: CodigoMotivo | CodigoMotivo[];
    codigo_origen: CodigoOrden;
  codigo_res: CodigoResolucion | string;
  numero_partes: string;
  cantidad: string;
  otras_acciones: string;
  pct_etiquetado_esperado: number;
  pct_etiquetado_real: number;
  tiempo_servicio: number;
}

export interface ReporteSinclair {
  numero: string;
  codigo_motivo: CodigoMotivo | CodigoMotivo[];
  codigo_origen: CodigoOrden;
  codigo_tipo_servicio: CodigoTipoServicio;
  estructura: ItemEstructura[];
  hora_inicio: string;
  hora_fin: string;
  fuera_de_hora: boolean;
  comentarios: string;
  firma_cliente?: string;
  nombre_cliente: string;
  hora_llamada: string;
  produccion_etiquetada?: string;
  condicion_fruta?: string;
  created_at: string;
}

export interface Visita {
  id: string;
  fecha: string;
  motivo: string;
  solicitado_por: string;
  vehiculo: Vehiculo;
  tecnicos: Tecnico[];
  empaque: Empaque;
  reporte: ReporteSinclair;
  estado_sincronizacion: 'synced' | 'pending';
}

export interface CreateVisitDTO {
  vehiculo: Vehiculo;
  empaque_id: string;
  tecnico_ids: string[];
  codigo_motivo: CodigoMotivo[];
  codigo_origen: CodigoOrden[];
  codigo_tipo_servicio: CodigoTipoServicio;
  solicitado_por: string;
  motivo: string;
  hora_inicio: string;
  hora_fin: string;
  fuera_de_hora: boolean;
  comentarios: string;
  estructura: ItemEstructura[];
  hora_llamada: string;
  nombre_cliente: string;
  firma_cliente?: string;
  produccion_etiquetada?: string;
  condicion_fruta?: string;
  id?: string; // Optional client-generated offline ID
  numero?: string; // FSR report number (e.g. LC2609GRPS)
  fecha?: string;
}

export interface CreateReeplaceDTO {
  retirado_id?: string;
  retirado_tipo?: 'Cabezal' | 'Casetera';
  instalado_id: string;
  instalado_tipo: 'Cabezal' | 'Casetera';
  empaque_id: string;
  motivo: string;
  tecnico_id?: string;
}

export interface CreateCambioDTO {
  cabezal_id: string;
  freno_retirado_id: string;
  freno_instalado_id: string;
  motivo: string;
  fecha?: string;
  lugar: string;
  empaque_id?: string;
  tecnico_id?: string;
}

export interface CreateServiceDTO {
  machine_id: string;
  machine_type: MachineType;
  fecha?: string;
  resumen: string;
  trabajo_hecho: string;
  consumibles: ConsumibleItem[];
  tecnico_id?: string;
}

export interface UserSession {
  user: Tecnico;
  token: string;
}

export type AuditCategory = 'machine' | 'consumable' | 'visit' | 'empaque' | 'system';

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'STATUS_CHANGE'
  | 'REPLACE'
  | 'BRAKE_SWAP'
  | 'SERVICE'
  | 'RELOCATION'
  | 'RESTOCK'
  | 'THRESHOLD_CHANGE'
  | 'CRITICAL_TOGGLE'
  | 'BATCH_SYNC';

export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole?: string;
  category: AuditCategory;
  action: AuditAction;
  targetId: string;
  targetName: string;
  details: string;
  previousValue?: string | number | null;
  newValue?: string | number | null;
  metadata?: Record<string, any>;
}
