/**
 * Strongly-typed API client for Visit Manager
 * Communicates with API 1 (/api/visits) and API 2 (/api/core)
 * Triggers instant reactive notification recalculations.
 */

import {
  Cabezal,
  Cambio,
  Casetera,
  Consumible,
  CreateCambioDTO,
  CreateReeplaceDTO,
  CreateServiceDTO,
  CreateVisitDTO,
  CreateEmpaqueDTO,
  Empaque,
  Freno,
  Movimiento,
  Reemplazo,
  Servicio,
  Tecnico,
  Visita,
  AuditEntry,
} from '../types/domain';
import { invalidateSystemAlerts } from '../context/NotificationContext';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const data = await res.json();
      if (data.error && data.error.message) {
        errorMsg = data.error.message;
      }
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const visitsApi = {
  getEnums: async (): Promise<any> => {
    const res = await fetch('/api/visits/enums');
    return handleResponse(res);
  },
  createVisit: async (dto: CreateVisitDTO): Promise<{ visita: Visita; reporte: any }> => {
    const res = await fetch('/api/visits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    const result = await handleResponse<{ visita: Visita; reporte: any }>(res);
    invalidateSystemAlerts();
    return result;
  },
  syncBatch: async (visits: CreateVisitDTO[]): Promise<{ synced: Visita[]; errors: string[] }> => {
    const res = await fetch('/api/visits/sync-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visits }),
    });
    const result = await handleResponse<{ synced: Visita[]; errors: string[] }>(res);
    invalidateSystemAlerts();
    return result;
  },
  getAllVisits: async (): Promise<Visita[]> => {
    const res = await fetch('/api/visits');
    return handleResponse(res);
  },
  getVisitById: async (id: string): Promise<Visita> => {
    const res = await fetch(`/api/visits/${id}`);
    return handleResponse(res);
  },
  filterByDateRange: async (start: string, end: string): Promise<Visita[]> => {
    const res = await fetch(`/api/visits/filter/date-range?start=${start}&end=${end}`);
    return handleResponse(res);
  },
  exportZip: async (startDate?: string, endDate?: string): Promise<Blob> => {
    const res = await fetch('/api/visits/export-zip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate }),
    });
    if (!res.ok) throw new Error('Failed to generate ZIP export');
    return res.blob();
  },
};

export const coreApi = {
  // Empaques
  getEmpaques: async (): Promise<Empaque[]> => {
    const res = await fetch('/api/core/empaques');
    return handleResponse(res);
  },
  getUnvisitedAlerts: async (): Promise<any[]> => {
    const res = await fetch('/api/core/empaques/alerts/unvisited');
    return handleResponse(res);
  },
  createEmpaque: async (data: CreateEmpaqueDTO | Partial<Empaque>): Promise<Empaque> => {
    const res = await fetch('/api/core/empaques', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await handleResponse<Empaque>(res);
    invalidateSystemAlerts();
    return result;
  },
  updateEmpaque: async (id: string, data: Partial<Empaque>): Promise<Empaque> => {
    const res = await fetch(`/api/core/empaques/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await handleResponse<Empaque>(res);
    invalidateSystemAlerts();
    return result;
  },
  deleteEmpaque: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`/api/core/empaques/${id}`, { method: 'DELETE' });
    const result = await handleResponse<{ success: boolean }>(res);
    invalidateSystemAlerts();
    return result;
  },

  // Machines
  getEquipmentByLocation: async (empaqueId: string): Promise<any> => {
    const res = await fetch(`/api/core/machines/location/${empaqueId}`);
    return handleResponse(res);
  },
  getAllMovements: async (): Promise<Movimiento[]> => {
    const res = await fetch('/api/core/machines/movements');
    return handleResponse(res);
  },
  createMovimiento: async (data: any): Promise<Movimiento> => {
    const res = await fetch('/api/core/machines/movements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  getCabezales: async (): Promise<Cabezal[]> => {
    const res = await fetch('/api/core/machines/cabezales');
    return handleResponse(res);
  },
  createCabezal: async (data: Partial<Cabezal>): Promise<Cabezal> => {
    const res = await fetch('/api/core/machines/cabezales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  updateCabezal: async (id: string, data: Partial<Cabezal>): Promise<Cabezal> => {
    const res = await fetch(`/api/core/machines/cabezales/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  deleteCabezal: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`/api/core/machines/cabezales/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },

  // Caseteras
  getCaseteras: async (): Promise<Casetera[]> => {
    const res = await fetch('/api/core/machines/caseteras');
    return handleResponse(res);
  },
  createCasetera: async (data: Partial<Casetera>): Promise<Casetera> => {
    const res = await fetch('/api/core/machines/caseteras', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  updateCasetera: async (numero: number, data: Partial<Casetera>): Promise<Casetera> => {
    const res = await fetch(`/api/core/machines/caseteras/${numero}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  deleteCasetera: async (numero: number): Promise<{ success: boolean }> => {
    const res = await fetch(`/api/core/machines/caseteras/${numero}`, { method: 'DELETE' });
    return handleResponse(res);
  },

  // Frenos
  getFrenos: async (): Promise<Freno[]> => {
    const res = await fetch('/api/core/machines/frenos');
    return handleResponse(res);
  },
  createFreno: async (data: Partial<Freno>): Promise<Freno> => {
    const res = await fetch('/api/core/machines/frenos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  updateFreno: async (id: string, data: Partial<Freno>): Promise<Freno> => {
    const res = await fetch(`/api/core/machines/frenos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  deleteFreno: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`/api/core/machines/frenos/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },

  // Operations
  getReemplazos: async (): Promise<Reemplazo[]> => {
    const res = await fetch('/api/core/operations/reemplazos');
    return handleResponse(res);
  },
  createReemplazo: async (dto: CreateReeplaceDTO): Promise<Reemplazo> => {
    const res = await fetch('/api/core/operations/reemplazos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    const result = await handleResponse<Reemplazo>(res);
    invalidateSystemAlerts();
    return result;
  },
  getCambios: async (): Promise<Cambio[]> => {
    const res = await fetch('/api/core/operations/cambios');
    return handleResponse(res);
  },
  createCambio: async (dto: CreateCambioDTO): Promise<Cambio> => {
    const res = await fetch('/api/core/operations/cambios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    const result = await handleResponse<Cambio>(res);
    invalidateSystemAlerts();
    return result;
  },
  getServicios: async (): Promise<Servicio[]> => {
    const res = await fetch('/api/core/operations/servicios');
    return handleResponse(res);
  },
  createServicio: async (dto: CreateServiceDTO): Promise<any> => {
    const res = await fetch('/api/core/operations/servicios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    const result = await handleResponse<any>(res);
    invalidateSystemAlerts();
    return result;
  },

  // Consumibles
  getConsumibles: async (): Promise<Consumible[]> => {
    const res = await fetch('/api/core/consumibles');
    return handleResponse(res);
  },
  getLowStockAlerts: async (): Promise<any[]> => {
    const res = await fetch('/api/core/consumibles/alerts/low-stock');
    return handleResponse(res);
  },
  createConsumible: async (data: Partial<Consumible>): Promise<Consumible> => {
    const res = await fetch('/api/core/consumibles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await handleResponse<Consumible>(res);
    invalidateSystemAlerts();
    return result;
  },
  updateConsumible: async (id: string, data: Partial<Consumible>): Promise<Consumible> => {
    const res = await fetch(`/api/core/consumibles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await handleResponse<Consumible>(res);
    invalidateSystemAlerts();
    return result;
  },
  deleteConsumible: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`/api/core/consumibles/${id}`, {
      method: 'DELETE',
    });
    const result = await handleResponse<{ success: boolean }>(res);
    invalidateSystemAlerts();
    return result;
  },
  toggleCriticalConsumible: async (id: string): Promise<Consumible> => {
    const res = await fetch(`/api/core/consumibles/${id}/toggle-critical`, {
      method: 'PATCH',
    });
    const result = await handleResponse<Consumible>(res);
    invalidateSystemAlerts();
    return result;
  },
  restockConsumible: async (id: string, amount: number): Promise<Consumible> => {
    const res = await fetch(`/api/core/consumibles/${id}/restock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    const result = await handleResponse<Consumible>(res);
    invalidateSystemAlerts();
    return result;
  },

  // Tecnicos
  getTecnicos: async (): Promise<Tecnico[]> => {
    const res = await fetch('/api/core/tecnicos');
    return handleResponse(res);
  },
  getTecnicoStats: async (): Promise<any[]> => {
    const res = await fetch('/api/core/tecnicos/activity/stats');
    return handleResponse(res);
  },
  createTecnico: async (data: Partial<Tecnico>): Promise<Tecnico> => {
    const res = await fetch('/api/core/tecnicos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  updateTecnico: async (id: string, data: Partial<Tecnico>): Promise<Tecnico> => {
    const res = await fetch(`/api/core/tecnicos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  deleteTecnico: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`/api/core/tecnicos/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },

  // Auth Login
  authLogin: async (credentials: { email?: string; id?: string; password?: string }): Promise<{ user: Tecnico; token: string }> => {
    const res = await fetch('/api/core/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(res);
  },

  // Statistics & Provider
  getDashboardStats: async (): Promise<any> => {
    const res = await fetch('/api/core/statistics/dashboard');
    return handleResponse(res);
  },
  getProviderTelemetry: async (): Promise<any> => {
    const res = await fetch('/api/core/provider/telemetry');
    return handleResponse(res);
  },

  // Audit Trail
  getAuditLogs: async (filters?: {
    category?: string;
    userId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<AuditEntry[]> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.limit) params.append('limit', String(filters.limit));

    const query = params.toString();
    const res = await fetch(`/api/core/audit-logs${query ? `?${query}` : ''}`);
    return handleResponse(res);
  },
  createAuditLog: async (entry: Partial<AuditEntry>): Promise<AuditEntry> => {
    const res = await fetch('/api/core/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    return handleResponse(res);
  },
};
