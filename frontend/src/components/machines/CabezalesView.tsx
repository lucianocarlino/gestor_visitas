/**
 * CabezalesView Component
 * View and manage existing printheads, statuses, movements and services (RF09, RF12, RF16, RF18)
 * Adheres strictly to SDD and Clean Code standards
 */

import React, { useEffect, useState } from "react";
import {
  Cpu,
  Plus,
  Trash2,
  MapPin,
  History,
  Disc,
  Wrench,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { coreApi } from "../../services/apiClient";
import {
  Cabezal,
  Empaque,
  Movimiento,
  Servicio,
  Status,
} from "../../types/domain";
import { MachineModal } from "./MachineModal";

export const CabezalesView: React.FC = () => {
  const [cabezales, setCabezales] = useState<Cabezal[]>([]);
  const [empaques, setEmpaques] = useState<Empaque[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

  // History modal state
  const [selectedCabezal, setSelectedCabezal] = useState<Cabezal | null>(null);
  const [movements, setMovements] = useState<Movimiento[]>([]);
  const [services, setServices] = useState<Servicio[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cabs, emps] = await Promise.all([
        coreApi.getCabezales(),
        coreApi.getEmpaques(),
      ]);
      setCabezales(cabs);
      setEmpaques(emps);
    } catch {
      // offline fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`¿Está seguro de eliminar el Cabezal ${id}?`)) return;
    try {
      await coreApi.deleteCabezal(id);
      loadData();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error al eliminar");
    }
  };

  const handleOpenHistory = async (cab: Cabezal) => {
    setSelectedCabezal(cab);
    setIsHistoryOpen(true);
    try {
      const [movs, srvs] = await Promise.all([
        coreApi.getAllMovements(),
        coreApi.getServicios(),
      ]);
      const filteredMovs = movs.filter((m) => m.machine_id === cab.id);
      setMovements(
        filteredMovs.length > 0
          ? filteredMovs
          : cab.historial_movimientos || [],
      );
      setServices(srvs.filter((s) => s.machine_id === cab.id));
    } catch {
      setMovements(cab.historial_movimientos || []);
    }
  };

  const getEmpaqueName = (id: string) => {
    const found = empaques.find((e) => e.id === id);
    return found ? found.nombre : id;
  };

  const filtered = cabezales.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getEmpaqueName(c.ubicacion)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por ID de cabezal o empaque..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="all">Todos los estados</option>
            <option value={Status.USING}>En uso</option>
            <option value={Status.READY}>Listo</option>
            <option value={Status.PENDING}>Pendiente</option>
          </select>
        </div>

        <button
          id="btn-add-cabezal"
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Nuevo Cabezal
        </button>
      </div>

      {/* Grid of Cabezales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cab) => (
          <div
            key={cab.id}
            id={`card-cabezal-${cab.id}`}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition relative flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {cab.id}
                    </h3>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    cab.estado === Status.USING
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : cab.estado === Status.READY
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {cab.estado}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Ubicación:
                  </span>
                  <span className="font-medium text-slate-900 truncate max-w-[140px]">
                    {getEmpaqueName(cab.ubicacion)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Disc className="w-3 h-3" /> Freno asignado:
                  </span>
                  <span className="font-mono font-medium text-blue-700">
                    {cab.freno_actual_id || "Sin freno"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={() => handleOpenHistory(cab)}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                <History className="w-3.5 h-3.5" /> Historial (
                {cab.historial_movimientos.length})
              </button>
              <button
                onClick={() => handleDelete(cab.id)}
                className="p-1 text-slate-400 hover:text-rose-600 rounded"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      <MachineModal
        type="Cabezal"
        empaques={empaques}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={loadData}
      />

      {/* History Modal */}
      {isHistoryOpen && selectedCabezal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative text-slate-900 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Historial de Movimientos y Servicios: {selectedCabezal.id}
                </h2>
                <p className="text-xs text-slate-500">
                  Trazabilidad de traslados, mantenimientos y cambios técnicos
                </p>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {/* Movements */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase text-slate-500 mb-2 flex items-center gap-1">
                <History className="w-3.5 h-3.5" /> Movimientos Registrados
              </h4>
              {movements.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  No hay traslados registrados para este equipo.
                </p>
              ) : (
                <div className="space-y-2">
                  {movements.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-blue-700">
                          {getEmpaqueName(m.origen)} →{" "}
                          {getEmpaqueName(m.destino)}
                        </span>
                        <span className="text-slate-500 text-[10px]">
                          {m.fecha}
                        </span>
                      </div>
                      <p className="text-slate-700 mt-1">{m.motivo}</p>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Técnico: {m.tecnico_nombre}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Services */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-500 mb-2 flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5" /> Servicios Realizados
              </h4>
              {services.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  No hay servicios técnicos registrados aún.
                </p>
              ) : (
                <div className="space-y-2">
                  {services.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-slate-900">{s.resumen}</span>
                        <span className="text-slate-500 text-[10px]">
                          {s.fecha}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">{s.trabajo_hecho}</p>
                      {s.consumibles.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500">
                          Consumibles:{" "}
                          {s.consumibles
                            .map((c) => `${c.nombre} (${c.cantidad})`)
                            .join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
