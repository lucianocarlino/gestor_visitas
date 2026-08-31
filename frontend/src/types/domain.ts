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
  retirado_id: string;
  retirado_tipo: 'Cabezal' | 'Casetera';
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
  codigo_res: string;
  numero_partes: string;
  cantidad: string;
  otras_acciones: string;
  pct_etiquetado_esperado: number;
  pct_etiquetado_real: number;
  tiempo_servicio: number;
}

export interface ReporteSinclair {
  numero: number;
  codigo_motivo: CodigoMotivo;
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
  codigo_motivo: CodigoMotivo;
  codigo_origen: CodigoOrden;
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
}

export interface CreateReeplaceDTO {
  retirado_id: string;
  retirado_tipo: 'Cabezal' | 'Casetera';
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
