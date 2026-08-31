/**
 * DashboardView Component
 * High-level operational Sinclair KPIs, active technician status, fleet metrics,
 * and comprehensive ZIP Export of PDF visit reports with Date Filtering (RF02, RF20).
 * Adheres strictly to SDD and Clean Code standards.
 */

import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { coreApi, visitsApi } from "../../services/apiClient";
import {
    Cabezal,
    Casetera,
    Empaque,
    Freno,
    Tecnico,
    Visita,
    Status, StatusTecnico,
} from "../../types/domain";
import { SinclairReportModal } from "../visits/SinclairReportModal";
import {
  downloadVisitPDF,
  downloadVisitsAsZip,
} from "../../utils/pdfGenerator";

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

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onNewVisit,
}) => {
  const [stats, setStats] = useState<any>(null);
  const [recentVisits, setRecentVisits] = useState<Visita[]>([]);
  const [allVisits, setAllVisits] = useState<Visita[]>([]);
  const [empaques, setEmpaques] = useState<Empaque[]>([]);
  const [cabezales, setCabezales] = useState<Cabezal[]>([]);
  const [caseteras, setCaseteras] = useState<Casetera[]>([]);
  const [frenos, setFrenos] = useState<Freno[]>([]);
  const [consumibles, setConsumibles] = useState<Consumible[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [selectedVisitReport, setSelectedVisitReport] = useState<Visita | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  // Date Filter & ZIP Export State
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [zipSuccessMsg, setZipSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [visitsData, empData, cabData, tecData, casData, freData, conData] =
        await Promise.all([
          visitsApi.getAllVisits().catch(() => []),
          coreApi.getEmpaques().catch(() => []),
          coreApi.getCabezales().catch(() => []),
          coreApi.getTecnicos().catch(() => []),
            coreApi.getCaseteras().catch(() => []),
            coreApi.getFrenos().catch(() => []),
            coreApi.getConsumibles().catch(() => []),
        ]);

      setAllVisits(visitsData);
      setRecentVisits(visitsData.slice(-5).reverse());
      setEmpaques(empData);
      setCabezales(cabData);
      setCaseteras(casData);
      setFrenos(freData);
      setConsumibles(conData);
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
    const visitDate = visit.fecha.split("T")[0];
    if (startDate && visitDate < startDate) return false;
    if (endDate && visitDate > endDate) return false;
    return true;
  });

  const handleApplyQuickFilter = (
    preset: "all" | "month" | "last30" | "year",
  ) => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    if (preset === "all") {
      setStartDate("");
      setEndDate("");
    } else if (preset === "month") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      setStartDate(firstDay);
      setEndDate(todayStr);
    } else if (preset === "last30") {
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      setStartDate(thirtyDaysAgo);
      setEndDate(todayStr);
    } else if (preset === "year") {
      const firstDayYear = new Date(today.getFullYear(), 0, 1)
        .toISOString()
        .split("T")[0];
      setStartDate(firstDayYear);
      setEndDate(todayStr);
    }
  };

  const handleExportZip = async () => {
    if (filteredVisitsForExport.length === 0) {
      alert("No hay reportes de visitas en el rango de fechas seleccionado.");
      return;
    }

    setIsExportingZip(true);
    setExportProgress({ current: 0, total: filteredVisitsForExport.length });

    try {
      await downloadVisitsAsZip(filteredVisitsForExport, (curr, tot) => {
        setExportProgress({ current: curr, total: tot });
      });

      setZipSuccessMsg(
        `Se exportaron exitosamente ${filteredVisitsForExport.length} reportes en formato PDF dentro del archivo ZIP.`,
      );
      setTimeout(() => setZipSuccessMsg(null), 5000);
    } catch (err: unknown) {
      alert(
        err instanceof Error ? err.message : "Error al generar el archivo ZIP",
      );
    } finally {
      setIsExportingZip(false);
      setExportProgress(null);
    }
  };

  const operationalCabezales = cabezales.filter(
    (c) => c.estado === Status.USING || c.estado === Status.READY,
  ).length;
  const pendingCabezales = cabezales.filter(
    (c) => c.estado === Status.PENDING,
  ).length;
  const totalBancos = empaques.reduce((sum, e) => sum + e.bancos.length, 0);

  // Compute metrics per technician
  const technicianMetrics: TechnicianMetric[] = tecnicos.map((tec) => {
    const tecVisits = allVisits.filter((v) =>
      v.tecnicos.some((t) => t.id === tec.id),
    );
    const totalDist = tecVisits.reduce(
      (sum, v) => sum + (v.empaque?.distancia || 0),
      0,
    );
    const totalHours = tecVisits.reduce((sum, v) => {
      const estHours = v.reporte?.estructura?.reduce(
        (hSum, item) => hSum + (item.tiempo_servicio || 0),
        0,
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
      lastVisit:
        sortedDates.length > 0
          ? new Date(sortedDates[0]).toLocaleDateString()
          : null,
    };
  });

  const totalKilometersAll = technicianMetrics.reduce(
    (sum, t) => sum + t.totalDistanceKm,
    0,
  );
  const totalVisitsCount = allVisits.length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Quick Actions */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              Estadísticas y Exportación de Reportes
            </h1>
            <p className="text-sm text-blue-100/80 mt-1 max-w-xl">
              Métricas, estadisticas por técnico y descarga
              de reportes PDF en formato ZIP.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              id="btn-dash-new-visit"
              onClick={onNewVisit}
              className="px-4 py-2.5 bg-white text-blue-900 hover:bg-blue-50 font-bold rounded-xl shadow transition flex items-center gap-2 text-sm"
              disabled={true}
            >
              <Activity className="w-4 h-4 text-blue-600" />
              Nueva Visita
            </button>
            <button
              id="btn-dash-view-equipment"
              onClick={() => onNavigate("equipment-location")}
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
            <span className="text-xs font-bold uppercase tracking-wider">
              Plantas Activas
            </span>
            <Building className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {empaques.length}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            {totalBancos} Bancos Sinclair instalados
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Cabezales en uso
            </span>
            <Cpu className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {operationalCabezales}{" "}
            <span className="text-sm font-normal text-slate-400">
              / {cabezales.length}
            </span>
          </div>
          <div className="text-xs text-emerald-600 mt-1 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {cabezales.length > 0
              ? `${Math.round((operationalCabezales / cabezales.length) * 100)}% en uso`
              : "Sin datos"}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Cabezales Pendientes
            </span>
            <Wrench className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {pendingCabezales}
          </div>
          <div className="text-xs text-amber-600 mt-1 font-semibold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {pendingCabezales > 0
              ? "En revisión o depósito"
              : "Todos operativos"}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Técnicos Activos
            </span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {tecnicos.length}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            {tecnicos.length > 0
              ? `${tecnicos.filter((t) => t.estado === StatusTecnico.DISPONIBLE).length} disponibles`
              : "Sin datos"}
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
              onClick={() => onNavigate("visits")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              disabled={ true }
            >
              Ver todas {/*({recentVisits.length})*/} (Inactivo)
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentVisits.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No hay visitas registradas aún. Haga clic en "Nueva Visita" para
                comenzar.
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
                        <span>
                          Fecha: {new Date(visit.fecha).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>
                          Técnicos:{" "}
                          {visit.tecnicos.map((t) => t.nombre).join(", ")}
                        </span>
                        <span>•</span>
                        <span>
                          Vehículo:{" "}
                          {typeof visit.vehiculo === "object"
                            ? `${visit.vehiculo?.marca || ""} ${visit.vehiculo?.modelo || ""}`
                            : visit.vehiculo}
                        </span>
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
          </div>

          <div className="space-y-3">
            <div
              onClick={() => onNavigate("cabezales")}
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">
                    Cabezales
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {cabezales.length} registrados
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            <div
              onClick={() => onNavigate("caseteras")}
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">
                    Caseteras
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {caseteras.length} registrados
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            <div
              onClick={() => onNavigate("frenos")}
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Disc className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Frenos</div>
                  <div className="text-[10px] text-slate-500">
                    {frenos.length} registrados
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            <div
              onClick={() => onNavigate("consumibles")}
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">
                    Consumibles y Repuestos
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {consumibles.length} insumos registrados
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
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
