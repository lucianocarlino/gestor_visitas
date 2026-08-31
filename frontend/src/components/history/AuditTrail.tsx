/**
 * AuditTrail Component - Activity History & System Audit Log
 * Chronological log of all changes made to machines, consumables, and visit records,
 * categorized by User ID, Action Type, and Timestamp.
 * Adheres strictly to SDD and Clean Code standards.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  User,
  Clock,
  Download,
  RefreshCw,
  Cpu,
  Package,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Database,
  Tag,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Lock,
} from 'lucide-react';
import { coreApi } from '../../services/apiClient';
import { AuditEntry, AuditCategory, AuditAction } from '../../types/domain';
import { useAuth } from '../../context/AuthContext';

interface AuditTrailProps {
  onRefreshParent?: () => void;
}

export const AuditTrail: React.FC<AuditTrailProps> = () => {
  const { isAdmin } = useAuth();
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  useEffect(() => {
    if (isAdmin) {
      fetchAuditLogs();
    } else {
      setIsLoading(false);
    }
  }, [isAdmin]);

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      const data = await coreApi.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Error loading audit trail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Unique list of users present in logs for user filter dropdown
  const uniqueUsers = useMemo(() => {
    const userMap = new Map<string, { id: string; name: string; role?: string }>();
    logs.forEach((log) => {
      if (log.userId && !userMap.has(log.userId)) {
        userMap.set(log.userId, {
          id: log.userId,
          name: log.userName || log.userId,
          role: log.userRole,
        });
      }
    });
    return Array.from(userMap.values());
  }, [logs]);

  // Unique action types present in logs
  const uniqueActions = useMemo(() => {
    const actions = new Set<string>();
    logs.forEach((log) => {
      if (log.action) actions.add(log.action);
    });
    return Array.from(actions);
  }, [logs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Category filter
      if (selectedCategory !== 'all' && log.category !== selectedCategory) {
        return false;
      }
      // User ID filter
      if (selectedUserId !== 'all' && log.userId.toLowerCase() !== selectedUserId.toLowerCase()) {
        return false;
      }
      // Action filter
      if (selectedAction !== 'all' && log.action !== selectedAction) {
        return false;
      }
      // Date filters
      if (startDate && new Date(log.timestamp) < new Date(startDate)) {
        return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (new Date(log.timestamp) > end) {
          return false;
        }
      }
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTarget = log.targetId.toLowerCase().includes(q) || log.targetName.toLowerCase().includes(q);
        const matchesUser = log.userName.toLowerCase().includes(q) || log.userId.toLowerCase().includes(q);
        const matchesDetails = log.details.toLowerCase().includes(q);
        const matchesAction = log.action.toLowerCase().includes(q);
        return matchesTarget || matchesUser || matchesDetails || matchesAction;
      }
      return true;
    });
  }, [logs, selectedCategory, selectedUserId, selectedAction, startDate, endDate, searchTerm]);

  // Metrics summary
  const metrics = useMemo(() => {
    const machineCount = logs.filter((l) => l.category === 'machine').length;
    const consumableCount = logs.filter((l) => l.category === 'consumable').length;
    const visitCount = logs.filter((l) => l.category === 'visit').length;
    const usersCount = uniqueUsers.length;
    return {
      total: logs.length,
      machineCount,
      consumableCount,
      visitCount,
      usersCount,
    };
  }, [logs, uniqueUsers]);

  // Export to CSV
  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      const headers = ['ID Registro', 'Fecha / Hora', 'ID Usuario', 'Nombre Usuario', 'Rol', 'Categoría', 'Acción', 'ID Objetivo', 'Nombre Objetivo', 'Detalles', 'Valor Anterior', 'Nuevo Valor'];
      const rows = filteredLogs.map((l) => [
        l.id,
        new Date(l.timestamp).toLocaleString('es-CL'),
        l.userId,
        `"${(l.userName || '').replace(/"/g, '""')}"`,
        l.userRole || 'Técnico',
        l.category,
        l.action,
        l.targetId,
        `"${(l.targetName || '').replace(/"/g, '""')}"`,
        `"${(l.details || '').replace(/"/g, '""')}"`,
        `"${String(l.previousValue || '').replace(/"/g, '""')}"`,
        `"${String(l.newValue || '').replace(/"/g, '""')}"`,
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Auditoria_Sinclair_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error exporting audit trail CSV:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const getCategoryBadge = (category: AuditCategory) => {
    switch (category) {
      case 'machine':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Cpu className="w-3 h-3" />
            Máquinas
          </span>
        );
      case 'consumable':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <Package className="w-3 h-3" />
            Consumibles
          </span>
        );
      case 'visit':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Calendar className="w-3 h-3" />
            Visitas
          </span>
        );
      case 'empaque':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Database className="w-3 h-3" />
            Empaques
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
            <Layers className="w-3 h-3" />
            Sistema
          </span>
        );
    }
  };

  const getActionBadge = (action: AuditAction) => {
    switch (action) {
      case 'CREATE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">ALTA / CREAR</span>;
      case 'UPDATE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">MODIFICACIÓN</span>;
      case 'DELETE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">ELIMINACIÓN</span>;
      case 'REPLACE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">REEMPLAZO EQUIPO</span>;
      case 'BRAKE_SWAP':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200">CAMBIO FRENO</span>;
      case 'SERVICE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">SERVICIO TALLER</span>;
      case 'RELOCATION':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">TRASLADO</span>;
      case 'RESTOCK':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">REABASTECIMIENTO</span>;
      case 'THRESHOLD_CHANGE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-50 text-yellow-800 border border-yellow-300">AJUSTE UMBRAL</span>;
      case 'CRITICAL_TOGGLE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-800 border border-orange-200">CRITICIDAD</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">{action}</span>;
    }
  };

  if (!isAdmin) {
    return (
      <div id="audit-trail-restricted" className="p-8 bg-white rounded-3xl border border-rose-200 shadow-sm text-center max-w-lg mx-auto my-8">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-rose-100">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">Acceso Restringido</h3>
        <p className="text-xs text-slate-600 mb-2">
          El registro cronológico de auditoría (Audit Trail) está reservado exclusivamente para usuarios con rol de Administrador.
        </p>
        <span className="inline-block px-2.5 py-1 bg-amber-50 text-amber-800 text-[11px] font-semibold rounded-lg border border-amber-200">
          Inicie sesión con una cuenta de Administrador para consultar la pista de auditoría.
        </span>
      </div>
    );
  }

  return (
    <div id="audit-trail-container" className="space-y-4">
      {/* Header Banner matching Reemplazos & Cambios de Freno */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-purple-50/70 p-4 rounded-2xl border border-purple-200">
        <div>
          <h3 className="font-bold text-purple-950 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-700" />
            Registro Cronológico
          </h3>
          <p className="text-xs text-purple-800">
            Trazabilidad inmutable de todas las modificaciones y operaciones sobre máquinas, consumibles y visitas técnicas
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            id="btn-refresh-audit-logs"
            onClick={fetchAuditLogs}
            disabled={isLoading}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
            title="Recargar registros de auditoría"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-purple-600' : 'text-slate-500'}`} />
            <span>Actualizar</span>
          </button>

          <button
            id="btn-export-audit-csv"
            onClick={handleExportCSV}
            disabled={isExporting || filteredLogs.length === 0}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-500/20 flex items-center gap-2 transition flex-shrink-0 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV ({filteredLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid in Clean Light Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Total Registros</span>
          <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">{metrics.total}</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Máquinas</span>
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <span className="text-xl font-extrabold text-blue-700 mt-0.5 block">{metrics.machineCount}</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Consumibles</span>
            <Package className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <span className="text-xl font-extrabold text-purple-700 mt-0.5 block">{metrics.consumableCount}</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Visitas</span>
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <span className="text-xl font-extrabold text-emerald-700 mt-0.5 block">{metrics.visitCount}</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Usuarios Registrados</span>
            <User className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">{metrics.usersCount}</span>
        </div>
      </div>

      {/* Control Bar: Categories, Filters, Search & Date Range */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        {/* Category Pill Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Categoría:
            </span>
            {[
              { id: 'all', label: 'Todas las Categorías', count: logs.length },
              { id: 'machine', label: 'Máquinas y Equipos', count: metrics.machineCount },
              { id: 'consumable', label: 'Consumibles y Stock', count: metrics.consumableCount },
              { id: 'visit', label: 'Visitas Técnicas', count: metrics.visitCount },
            ].map((cat) => (
              <button
                key={cat.id}
                id={`audit-cat-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === cat.id ? 'bg-purple-800 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Mostrando <strong>{filteredLogs.length}</strong> de <strong>{logs.length}</strong> eventos
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* User ID Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <User className="w-3 h-3 text-slate-400" /> Usuario Responsable (ID):
            </label>
            <select
              id="filter-audit-user"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">Todos los Usuarios ({uniqueUsers.length})</option>
              {uniqueUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.id} - {u.name} {u.role === 'admin' ? '(Admin)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Action Type Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Tag className="w-3 h-3 text-slate-400" /> Tipo de Acción:
            </label>
            <select
              id="filter-audit-action"
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">Todas las Acciones ({uniqueActions.length})</option>
              {uniqueActions.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range: Start / End */}
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Desde:</label>
              <input
                id="filter-audit-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-[11px] text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Hasta:</label>
              <input
                id="filter-audit-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-[11px] text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Real-time Search */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Search className="w-3 h-3 text-slate-400" /> Búsqueda en Detalle:
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="input-search-audit-trail"
                type="text"
                placeholder="Buscar ID, equipo, detalle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Chronological Audit Logs List */}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-semibold text-slate-600">Cargando bitácora de auditoría inmutable...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No se encontraron registros de auditoría</h3>
          <p className="text-xs text-slate-500 mt-1">
            No existen eventos que coincidan con los filtros seleccionados de categoría, usuario o rango de fecha.
          </p>
          {(selectedCategory !== 'all' || selectedUserId !== 'all' || selectedAction !== 'all' || searchTerm || startDate || endDate) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedUserId('all');
                setSelectedAction('all');
                setSearchTerm('');
                setStartDate('');
                setEndDate('');
              }}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              Restablecer Filtros
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const logDate = new Date(log.timestamp);
            const formattedDate = logDate.toLocaleDateString('es-CL', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });
            const formattedTime = logDate.toLocaleTimeString('es-CL', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <div
                key={log.id}
                id={`audit-log-item-${log.id}`}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:border-slate-300 transition overflow-hidden"
              >
                {/* Main Card Header / Summary */}
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    {/* Timestamp & ID Column */}
                    <div className="min-w-[110px] bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center flex flex-col justify-center">
                      <span className="text-[10px] font-mono font-bold text-purple-700 block">{log.id}</span>
                      <span className="text-xs font-bold text-slate-800 block mt-0.5">{formattedDate}</span>
                      <span className="text-[11px] text-slate-500 font-mono flex items-center justify-center gap-1 mt-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {formattedTime}
                      </span>
                    </div>

                    {/* Content & Details */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {getCategoryBadge(log.category)}
                        {getActionBadge(log.action)}

                        {/* User Identity Chip */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100 rounded-md border border-slate-200 text-slate-700 text-xs font-semibold">
                          <User className="w-3 h-3 text-slate-500" />
                          <span className="font-mono text-[11px] text-slate-900 font-bold">{log.userId}</span>
                          <span className="text-slate-400">•</span>
                          <span>{log.userName}</span>
                          {log.userRole && (
                            <span
                              className={`text-[9px] uppercase tracking-wider px-1 rounded ${
                                log.userRole === 'admin' ? 'bg-purple-200 text-purple-800 font-bold' : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {log.userRole}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Target Name & Primary Description */}
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span className="font-mono text-xs px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 border border-slate-200">
                          {log.targetId}
                        </span>
                        <span>{log.targetName}</span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{log.details}</p>

                      {/* Inline Value Diff if present */}
                      {(log.previousValue !== undefined || log.newValue !== undefined) && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {log.previousValue !== null && log.previousValue !== undefined && (
                            <div className="text-[11px] px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-800 font-mono">
                              <span className="text-rose-500 font-sans mr-1">Anterior:</span>
                              {String(log.previousValue)}
                            </div>
                          )}
                          {log.previousValue !== null && log.previousValue !== undefined && log.newValue !== null && log.newValue !== undefined && (
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                          )}
                          {log.newValue !== null && log.newValue !== undefined && (
                            <div className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-bold">
                              <span className="text-emerald-600 font-sans mr-1 font-normal">Nuevo:</span>
                              {String(log.newValue)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Action / Inspector Toggle */}
                  <div className="flex items-center justify-end gap-2 shrink-0 self-end md:self-center">
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <button
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      >
                        <span>{isExpanded ? 'Ocultar Metadatos' : 'Ver Metadatos'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expandable JSON Metadata Inspector */}
                {isExpanded && log.metadata && (
                  <div className="bg-slate-900 text-slate-200 p-4 border-t border-slate-800 text-xs font-mono">
                    <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-800 text-[11px] text-slate-400">
                      <span>Metadatos Técnicos del Evento ({log.id})</span>
                      <span>JSON Schema v1.0</span>
                    </div>
                    <pre className="overflow-x-auto text-[11px] leading-relaxed text-emerald-400">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
