/**
 * DashboardView Component
 * High-level operational Sinclair KPIs, active technician status, fleet metrics,
 * and comprehensive ZIP Export of PDF visit reports with Date Filtering (RF02, RF20).
 * Adheres strictly to SDD and Clean Code standards.
 */

import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Building,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  TrendingUp,
  Truck,
  Users,
  Wrench,
  ChevronRight,
  Disc,
  Navigation,
  Gauge,
  FileArchive,
  Download,
  Calendar,
  Filter,
  FileText,
  Search,
  Check,
  RefreshCw,
} from 'lucide-react';
import { coreApi, visitsApi } from '../../services/apiClient';
import { Cabezal, Casetera, Empaque, Freno, Tecnico, Visita, Status } from '../../types/domain';
import { SinclairReportModal } from '../visits/SinclairReportModal';
import { downloadVisitPDF, downloadVisitsAsZip } from '../../utils/pdfGenerator';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
  onNewVisit: () => void;
}

interface TechnicianMetric {
  tecnico: Tecnico;
  visitasCount: number;
  totalDistanceKm: number;
  totalServiceHours: number;
  lastVisit: string | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onNewVisit }) => {
  const [stats, setStats] = useState<any>(null);
  const [recentVisits, setRecentVisits] = useState<Visita[]>([]);
  const [allVisits, setAllVisits] = useState<Visita[]>([]);
  const [empaques, setEmpaques] = useState<Empaque[]>([]);
  const [cabezales, setCabezales] = useState<Cabezal[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [selectedVisitReport, setSelectedVisitReport] = useState<Visita | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Date Filter & ZIP Export State
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number } | null>(null);
  const [zipSuccessMsg, setZipSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsData, visitsData, empData, cabData, tecData] = await Promise.all([
        coreApi.getDashboardStats().catch(() => null),
        visitsApi.getAllVisits().catch(() => []),
        coreApi.getEmpaques().catch(() => []),
        coreApi.getCabezales().catch(() => []),
        coreApi.getTecnicos().catch(() => []),
      ]);

      setStats(statsData);
      setAllVisits(visitsData);
      setRecentVisits(visitsData.slice(-5).reverse());
      setEmpaques(empData);
      setCabezales(cabData);
      setTecnicos(tecData);
    } catch {
      // offline fallback
    } finally {
      setIsLoading(false);
    }
  };

  // Filter visits by date
  const filteredVisitsForExport = allVisits.filter((visit) => {
    if (!visit.fecha) return true;
    const visitDate = visit.fecha.split('T')[0];
    if (startDate && visitDate < startDate) return false;
    if (endDate && visitDate > endDate) return false;
    return true;
  });

  const handleApplyQuickFilter = (preset: 'all' | 'month' | 'last30' | 'year') => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      setStartDate(firstDay);
      setEndDate(todayStr);
    } else if (preset === 'last30') {
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setStartDate(thirtyDaysAgo);
      setEndDate(todayStr);
    } else if (preset === 'year') {
      const firstDayYear = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
      setStartDate(firstDayYear);
      setEndDate(todayStr);
    }
  };

  const handleExportZip = async () => {
    if (filteredVisitsForExport.length === 0) {
      alert('No hay reportes de visitas en el rango de fechas seleccionado.');
      return;
    }

    setIsExportingZip(true);
    setExportProgress({ current: 0, total: filteredVisitsForExport.length });

    try {
      await downloadVisitsAsZip(filteredVisitsForExport, (curr, tot) => {
        setExportProgress({ current: curr, total: tot });
      });

      setZipSuccessMsg(
        `Se exportaron exitosamente ${filteredVisitsForExport.length} reportes en formato PDF dentro del archivo ZIP.`
      );
      setTimeout(() => setZipSuccessMsg(null), 5000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al generar el archivo ZIP');
    } finally {
      setIsExportingZip(false);
      setExportProgress(null);
    }
  };

  const operationalCabezales = cabezales.filter(
    (c) => c.estado === Status.USING || c.estado === Status.READY
  ).length;
  const pendingCabezales = cabezales.filter((c) => c.estado === Status.PENDING).length;
  const totalBancos = empaques.reduce((sum, e) => sum + e.bancos.length, 0);

  // Compute metrics per technician
  const technicianMetrics: TechnicianMetric[] = tecnicos.map((tec) => {
    const tecVisits = allVisits.filter((v) => v.tecnicos.some((t) => t.id === tec.id));
    const totalDist = tecVisits.reduce((sum, v) => sum + (v.empaque?.distancia || 0), 0);
    const totalHours = tecVisits.reduce((sum, v) => {
      const estHours = v.reporte?.estructura?.reduce(
        (hSum, item) => hSum + (item.tiempo_servicio || 0),
        0
      );
      return sum + (estHours || 0);
    }, 0);

    const sortedDates = tecVisits
      .map((v) => new Date(v.fecha).getTime())
      .sort((a, b) => b - a);

    return {
      tecnico: tec,
      visitasCount: tecVisits.length,
      totalDistanceKm: totalDist,
      totalServiceHours: Number(totalHours.toFixed(1)),
      lastVisit: sortedDates.length > 0 ? new Date(sortedDates[0]).toLocaleDateString() : null,
    };
  });

  const totalKilometersAll = technicianMetrics.reduce((sum, t) => sum + t.totalDistanceKm, 0);
  const totalVisitsCount = allVisits.length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Quick Actions */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="px-3 py-1 bg-blue-700/50 border border-blue-400/30 rounded-full text-xs font-semibold uppercase tracking-wider text-blue-200 inline-block mb-2">
              Sinclair Field Operations Control
            </span>
            <h1 className="text-2xl font-bold">Estadísticas &amp; Exportación de Reportes</h1>
            <p className="text-sm text-blue-100/80 mt-1 max-w-xl">
              Métricas operativas de campo, trazabilidad por técnico y descarga de reportes PDF en formato ZIP.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              id="btn-dash-new-visit"
              onClick={onNewVisit}
              className="px-4 py-2.5 bg-white text-blue-900 hover:bg-blue-50 font-bold rounded-xl shadow transition flex items-center gap-2 text-sm"
            >
              <Activity className="w-4 h-4 text-blue-600" />
              Nueva Visita
            </button>
            <button
              id="btn-dash-view-equipment"
              onClick={() => onNavigate('equipment-location')}
              className="px-4 py-2.5 bg-blue-700/60 hover:bg-blue-700 text-white font-semibold rounded-xl border border-blue-400/30 transition flex items-center gap-2 text-sm"
            >
              <Building className="w-4 h-4" />
              Ver por Planta
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Plantas Activas</span>
            <Building className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{empaques.length}</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            {totalBancos} Bancos Sinclair instalados
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Cabezales Operativos</span>
            <Cpu className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {operationalCabezales}{' '}
            <span className="text-sm font-normal text-slate-400">/ {cabezales.length}</span>
          </div>
          <div className="text-xs text-emerald-600 mt-1 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {cabezales.length > 0
              ? `${Math.round((operationalCabezales / cabezales.length) * 100)}% disponibilidad`
              : 'Sin datos'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Cabezales Pendientes</span>
            <Wrench className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{pendingCabezales}</div>
          <div className="text-xs text-amber-600 mt-1 font-semibold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {pendingCabezales > 0 ? 'En revisión o depósito' : 'Todos operativos'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Técnicos Activos</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{tecnicos.length}</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Personal de campo certificado</div>
        </div>
      </div>

      {/* ZIP Export & PDF Generator Section */}
      <div className="bg-white p-6 rounded-3xl border border-blue-200 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 flex-shrink-0">
              <FileArchive className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Exportación Masiva en ZIP de Reportes PDF
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Genera un archivo comprimido (.zip) con los reportes técnicos oficiales de Sinclair en formato PDF individuales.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-export-zip-main"
              onClick={handleExportZip}
              disabled={isExportingZip || filteredVisitsForExport.length === 0}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-md shadow-blue-500/20"
            >
              {isExportingZip ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  {exportProgress
                    ? `Generando (${exportProgress.current}/${exportProgress.total})...`
                    : 'Preparando ZIP...'}
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Descargar ZIP ({filteredVisitsForExport.length} Reportes PDF)
                </>
              )}
            </button>
          </div>
        </div>

        {zipSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{zipSuccessMsg}</span>
          </div>
        )}

        {/* Date Filter Controls */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Filter className="w-4 h-4 text-blue-600" />
              <span>Filtrar por Rango de Fechas:</span>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleApplyQuickFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                  !startDate && !endDate
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => handleApplyQuickFilter('last30')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 transition"
              >
                Últimos 30 días
              </button>
              <button
                type="button"
                onClick={() => handleApplyQuickFilter('month')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 transition"
              >
                Este Mes
              </button>
              <button
                type="button"
                onClick={() => handleApplyQuickFilter('year')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 transition"
              >
                Este Año
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Fecha Desde:
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Fecha Hasta:
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between">
                <span className="font-medium">Reportes incluidos:</span>
                <span className="font-bold font-mono text-sm px-2 py-0.5 bg-blue-600 text-white rounded-lg">
                  {filteredVisitsForExport.length} / {allVisits.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filtered Reports Mini-Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Listado de Reportes a incluir en el ZIP ({filteredVisitsForExport.length})</span>
            {startDate || endDate ? (
              <span className="text-slate-500 font-normal text-[11px]">
                Filtro activo: {startDate || 'Inicio'} hasta {endDate || 'Hoy'}
              </span>
            ) : null}
          </div>

          <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-2xl divide-y divide-slate-100 bg-white">
            {filteredVisitsForExport.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No hay reportes de visitas para el rango de fechas seleccionado.
              </div>
            ) : (
              filteredVisitsForExport.map((visit) => (
                <div
                  key={visit.id}
                  className="p-3 hover:bg-slate-50/80 transition flex items-center justify-between text-xs gap-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          Reporte #{visit.reporte.numero}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="font-semibold text-slate-700 truncate">
                          {visit.empaque?.nombre || 'Planta'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{new Date(visit.fecha).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{visit.tecnicos.map((t) => t.nombre).join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedVisitReport(visit)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-[11px] transition"
                    >
                      Ver
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadVisitPDF(visit)}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold rounded-lg text-[11px] flex items-center gap-1 transition"
                      title="Descargar PDF individual"
                    >
                      <Download className="w-3 h-3" />
                      PDF
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Visits & Fleet Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Visits Column (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-blue-600" />
              Últimas Visitas Registradas
            </h2>
            <button
              onClick={() => onNavigate('visits')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Ver todas ({recentVisits.length})
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentVisits.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No hay visitas registradas aún. Haga clic en "Nueva Visita" para comenzar.
              </div>
            ) : (
              recentVisits.map((visit) => {
                return (
                  <div
                    key={visit.id}
                    className="p-3.5 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-200/80 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {visit.empaque.nombre}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-semibold">
                          Reporte #{visit.reporte.numero}
                        </span>
                      </div>
                      <div className="text-slate-500 flex items-center gap-3">
                        <span>Fecha: {new Date(visit.fecha).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>
                          Técnicos: {visit.tecnicos.map((t) => t.nombre).join(', ')}
                        </span>
                        <span>•</span>
                        <span>Vehículo: {typeof visit.vehiculo === 'object' ? `${visit.vehiculo?.marca || ''} ${visit.vehiculo?.modelo || ''}` : visit.vehiculo}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => setSelectedVisitReport(visit)}
                        className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold transition"
                      >
                        Ver Informe
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Fleet Quick Status (1 col) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <Cpu className="w-4 h-4 text-blue-600" />
              Inventario de Flota
            </h2>
            <button
              onClick={() => onNavigate('cabezales')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Gestionar
            </button>
          </div>

          <div className="space-y-3">
            <div
              onClick={() => onNavigate('cabezales')}
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Cabezales (Printheads)</div>
                  <div className="text-[10px] text-slate-500">{cabezales.length} registrados</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            <div
              onClick={() => onNavigate('caseteras')}
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Caseteras (Cassettes)</div>
                  <div className="text-[10px] text-slate-500">Historial de traslados</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            <div
              onClick={() => onNavigate('frenos')}
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Disc className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Frenos (Brakes)</div>
                  <div className="text-[10px] text-slate-500">Acoplados y repuestos</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            <div
              onClick={() => onNavigate('consumibles')}
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Consumibles &amp; Repuestos</div>
                  <div className="text-[10px] text-slate-500">Control de stock y alertas</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Technician Performance & Kilometers Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-blue-600" />
              Métricas por Técnico: Visitas y Distancia Recorrida
            </h2>
            <p className="text-xs text-slate-500">
              Control de traslados logísticos a plantas de empaque, horas de servicio y productividad
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <div>
              Total Visitas: <span className="font-bold text-slate-900">{totalVisitsCount}</span>
            </div>
            <div className="text-slate-300">|</div>
            <div>
              Total Km Recorridos:{' '}
              <span className="font-bold text-blue-700 font-mono">{totalKilometersAll.toLocaleString()} km</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Técnico</th>
                <th className="p-3">Contacto</th>
                <th className="p-3 text-center">Visitas Realizadas</th>
                <th className="p-3 text-center">Distancia Total (km)</th>
                <th className="p-3 text-center">Horas de Servicio</th>
                <th className="p-3 text-center">Última Visita</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {technicianMetrics.map((item) => {
                return (
                  <tr key={item.tecnico.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                          {item.tecnico.nombre.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{item.tecnico.nombre}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{item.tecnico.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-slate-500">
                      <div>{item.tecnico.email}</div>
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {item.visitasCount} visitas
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1 font-mono font-bold text-slate-900">
                        <Navigation className="w-3 h-3 text-emerald-600" />
                        <span>{item.totalDistanceKm} km</span>
                      </div>
                    </td>
                    <td className="p-3 text-center font-mono">
                      {item.totalServiceHours} hs
                    </td>
                    <td className="p-3 text-center text-slate-500">
                      {item.lastVisit || 'Sin registros'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sinclair Report View Modal */}
      {selectedVisitReport && (
        <SinclairReportModal
          visita={selectedVisitReport}
          isOpen={!!selectedVisitReport}
          onClose={() => setSelectedVisitReport(null)}
        />
      )}
    </div>
  );
};
