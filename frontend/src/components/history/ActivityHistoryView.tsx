/**
 * ActivityHistoryView (Operations & History Hub)
 * Dedicated tabs for field operations: Reemplazos, Cambios de Freno, Servicios Técnicos, Traslados y Cronología
 * Captures explicit technical dimensions: DÓNDE (Where), CUÁNDO (When), and CÓMO (How)
 * Adheres strictly to SDD and Clean Code standards.
 */

import React, { useEffect, useState } from "react";
import {
  History,
  Search,
  ArrowRightLeft,
  Wrench,
  Layers,
  Calendar,
  MapPin,
  User,
  CheckCircle2,
  Disc,
  Plus,
  Truck,
  Filter,
  Cpu,
  Package,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { coreApi } from "../../services/apiClient";
import { Cambio, Movimiento, Reemplazo, Servicio } from "../../types/domain";
import { useAuth } from "../../context/AuthContext";
import { NewReemplazoModal } from "./NewReemplazoModal";
import { NewCambioModal } from "./NewCambioModal";
import { NewServicioModal } from "./NewServicioModal";
import { NewMovimientoModal } from "./NewMovimientoModal";
import { AuditTrail } from "./AuditTrail";

export type OperationTab =
  | "reemplazos"
  | "cambios"
  | "servicios"
  | "movimientos"
  | "historial"
  | "audit-trail";

interface ActivityHistoryViewProps {
  initialTab?: OperationTab;
}

export const ActivityHistoryView: React.FC<ActivityHistoryViewProps> = ({
  initialTab = "reemplazos",
}) => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<OperationTab>(
    initialTab === "audit-trail" && !isAdmin ? "reemplazos" : initialTab,
  );
  const [movements, setMovements] = useState<Movimiento[]>([]);
  const [reemplazos, setReemplazos] = useState<Reemplazo[]>([]);
  const [cambios, setCambios] = useState<Cambio[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isReemplazoOpen, setIsReemplazoOpen] = useState(false);
  const [isCambioOpen, setIsCambioOpen] = useState(false);
  const [isServicioOpen, setIsServicioOpen] = useState(false);
  const [isMovimientoOpen, setIsMovimientoOpen] = useState(false);

  useEffect(() => {
    loadActivityData();
  }, []);

  const loadActivityData = async () => {
    setIsLoading(true);
    try {
      const [movData, reempData, cambioData, servData] = await Promise.all([
        coreApi.getAllMovements().catch(() => []),
        coreApi.getReemplazos().catch(() => []),
        coreApi.getCambios().catch(() => []),
        coreApi.getServicios().catch(() => []),
      ]);
      setMovements(movData.reverse());
      setReemplazos(reempData.reverse());
      setCambios(cambioData.reverse());
      setServicios(servData.reverse());
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered lists based on search
  const filteredReemplazos = reemplazos.filter(
    (r) =>
      r.retirado_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.instalado_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.empaque_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.motivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.tecnico_nombre &&
        r.tecnico_nombre.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const filteredCambios = cambios.filter(
    (c) =>
      c.cabezal_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.retirado_freno_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.instalado_freno_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.lugar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.motivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.tecnico_nombre &&
        c.tecnico_nombre.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const filteredServicios = servicios.filter(
    (s) =>
      s.machine_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.resumen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.trabajo_hecho.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.tecnico_nombre &&
        s.tecnico_nombre.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const filteredMovimientos = movements.filter(
    (m) =>
      m.machine_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.origen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.destino.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.motivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.tecnico_nombre &&
        m.tecnico_nombre.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Navigation Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-600" />
              Gestión de Operaciones en campo y en taller
            </h2>
            <p className="text-xs text-slate-500">
              Registro de dónde,
              cuándo y cómo se ejecutan los
              recambios, frenos, servicios y traslados
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por ID, máquina, motivo o técnico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Operations Sub-Tabs Navigation */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <button
            id="tab-op-reemplazos"
            onClick={() => setActiveTab("reemplazos")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "reemplazos"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Reemplazos ({reemplazos.length})</span>
          </button>

          <button
            id="tab-op-cambios"
            onClick={() => setActiveTab("cambios")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "cambios"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Disc className="w-4 h-4" />
            <span>Cambios de Freno ({cambios.length})</span>
          </button>

          <button
            id="tab-op-servicios"
            onClick={() => setActiveTab("servicios")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "servicios"
                ? "bg-amber-600 text-white shadow-sm shadow-amber-500/20"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Servicios({servicios.length})</span>
          </button>

          {isAdmin && (
            <button
              id="tab-op-audit-trail"
              onClick={() => setActiveTab("audit-trail")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "audit-trail"
                  ? "bg-purple-600 text-white shadow-sm shadow-purple-500/20"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Logs</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                  activeTab === "audit-trail"
                    ? "bg-purple-800 text-purple-100"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                Admin
              </span>
            </button>
          )}

          <button
            id="tab-op-historial"
            onClick={() => setActiveTab("historial")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ml-auto ${
              activeTab === "historial"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Cronología completa</span>
          </button>
        </div>
      </div>

      {/* TAB 1: REEMPLAZOS */}
      {activeTab === "reemplazos" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/70 p-4 rounded-2xl border border-blue-200">
            <div>
              <h3 className="font-bold text-blue-950 text-sm flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-blue-700" />
                Reemplazos de Cabezales y Caseteras en Planta
              </h3>
              <p className="text-xs text-blue-800">
                Sustitución física de equipos en líneas de empaque
              </p>
            </div>
            <button
              id="btn-new-reemplazo"
              onClick={() => setIsReemplazoOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Nuevo Reemplazo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReemplazos.map((r) => (
              <div
                key={r.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition space-y-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{r.empaque_nombre}</span>
                  </div>
                </div>

                {/* Machine swap representation */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Equipo Retirado:
                    </span>
                    <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {r.retirado_tipo} : {r.retirado_id}
                    </span>
                  </div>
                  <div className="flex items-center justify-center text-slate-400">
                    &darr;
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Equipo Instalado:
                    </span>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {r.instalado_tipo} : {r.instalado_id}
                    </span>
                  </div>
                </div>

                {/* Motivo & Details */}
                <div className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">
                    [Banco] Motivo:
                  </span>{" "}
                  {r.motivo}
                </div>

                {/* Footer with date & technician */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Fecha: {new Date(r.fecha).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1 font-medium text-slate-600">
                    <User className="w-3 h-3 text-blue-600" />
                    Técnico: {r.tecnico_nombre || "Técnico asignado"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredReemplazos.length === 0 && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              No hay registros de reemplazos coincidentes.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CAMBIOS DE FRENO */}
      {activeTab === "cambios" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200">
            <div>
              <h3 className="font-bold text-indigo-950 text-sm flex items-center gap-2">
                <Disc className="w-4 h-4 text-indigo-700" />
                Cambios de Frenos en Cabezales
              </h3>
              <p className="text-xs text-indigo-800">
                Sustitución de frenos
              </p>
            </div>
            <button
              id="btn-new-cambio"
              onClick={() => setIsCambioOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 flex items-center gap-2 transition flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Cambio de Freno</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCambios.map((c) => (
              <div
                key={c.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition space-y-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-950 font-mono">
                    <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Cabezal: {c.cabezal_id}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                    {c.lugar}
                  </span>
                </div>

                {/* Brake swap representation */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Freno Retirado:
                    </span>
                    <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {c.retirado_freno_id}
                    </span>
                  </div>
                  <div className="flex items-center justify-center text-slate-400">
                    &darr;
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Nuevo Freno Montado:
                    </span>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {c.instalado_freno_id}
                    </span>
                  </div>
                </div>

                {/* Motivo */}
                <div className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">
                    Motivo:
                  </span>{" "}
                  {c.motivo}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {new Date(c.fecha).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1 font-medium text-slate-600">
                    <User className="w-3 h-3 text-indigo-600" />
                    {c.tecnico_nombre || "Técnico Sinclair"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredCambios.length === 0 && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              No hay registros de cambios de freno coincidentes.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SERVICIOS & MANTENIMIENTO */}
      {activeTab === "servicios" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
            <div>
              <h3 className="font-bold text-amber-950 text-sm flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-700" />
                Mantenimientos y Servicios Técnicos (en taller y en campo)
              </h3>
              <p className="text-xs text-amber-800">
                Intervenciones preventivas y correctivas sobre cabezales, caseteras o frenos
              </p>
            </div>
            <button
              id="btn-new-servicio"
              onClick={() => setIsServicioOpen(true)}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-2 transition flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Servicio Técnico</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServicios.map((s) => (
              <div
                key={s.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition space-y-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-amber-950 font-mono">
                    <Wrench className="w-3.5 h-3.5 text-amber-600" />
                    <span>
                      {s.machine_type} {s.machine_id}
                    </span>
                  </div>
                </div>

                {/* Resumen & Trabajo hecho */}
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-slate-600">Motivo del servicio: </div> {s.resumen}
                  <p className="text-slate-600 line-clamp-3">
                    Trabajo realizado:
                  </p>
                    {s.trabajo_hecho}
                </div>

                {/* Consumibles Used */}
                {s.consumibles && s.consumibles.length > 0 && (
                  <div className="bg-amber-50/50 p-2 rounded-xl border border-amber-200/60 space-y-1">
                    <div className="text-[10px] font-bold uppercase text-amber-900 flex items-center gap-1">
                      <Package className="w-3 h-3 text-amber-700" /> Repuestos
                      Descontados:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {s.consumibles.map((c) => (
                        <span
                          key={c.consumible_id}
                          className="px-1.5 py-0.5 rounded bg-white text-[10px] text-amber-900 border border-amber-200 font-medium"
                        >
                          {c.nombre || c.consumible_id}:{" "}
                          <strong>{c.cantidad} u.</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {new Date(s.fecha).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1 font-medium text-slate-600">
                    <User className="w-3 h-3 text-amber-600" />
                    {s.tecnico_nombre || "Técnico Sinclair"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredServicios.length === 0 && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              No hay registros de servicios técnicos coincidentes.
            </div>
          )}
        </div>
      )}

      {/* TAB 5: CRONOLOGÍA COMPLETA */}
      {activeTab === "historial" && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              Todas las Operaciones Registradas
            </h3>
            <span className="text-xs text-slate-400">
              Total:{" "}
              {reemplazos.length +
                cambios.length +
                servicios.length +
                movements.length}{" "}
              eventos
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Unified list */}
            {reemplazos.slice(0, 5).map((r) => (
              <div
                key={`reemp-${r.id}`}
                className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                    <ArrowRightLeft className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">
                      Reemplazo en {r.empaque_nombre}: {r.retirado_id} &rarr;{" "}
                      {r.instalado_id}
                    </div>
                    <div className="text-slate-500 text-[11px]">{r.motivo}</div>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  {new Date(r.fecha).toLocaleDateString()}
                </div>
              </div>
            ))}

            {cambios.slice(0, 5).map((c) => (
              <div
                key={`cambio-${c.id}`}
                className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                    <Disc className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">
                      Cambio de Freno en {c.cabezal_id}: {c.retirado_freno_id}{" "}
                      &rarr; {c.instalado_freno_id}
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      {c.lugar} • {c.motivo}
                    </div>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  {new Date(c.fecha).toLocaleDateString()}
                </div>
              </div>
            ))}

            {servicios.slice(0, 5).map((s) => (
              <div
                key={`serv-${s.id}`}
                className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                    <Wrench className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">
                      Servicio Técnico en {s.machine_type} {s.machine_id}:{" "}
                      {s.resumen}
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      {s.trabajo_hecho}
                    </div>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  {new Date(s.fecha).toLocaleDateString()}
                </div>
              </div>
            ))}

            {movements.slice(0, 5).map((m) => (
              <div
                key={`mov-${m.id}`}
                className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="p-1.5 rounded-lg bg-teal-100 text-teal-700">
                    <Truck className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">
                      Traslado de {m.machine_type} {m.machine_id}: {m.origen}{" "}
                      &rarr; {m.destino}
                    </div>
                    <div className="text-slate-500 text-[11px]">{m.motivo}</div>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  {new Date(m.fecha).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT TRAIL (Admin Only) */}
      {activeTab === "audit-trail" &&
        (isAdmin ? (
          <AuditTrail onRefreshParent={loadActivityData} />
        ) : (
          <div className="p-8 bg-white rounded-3xl border border-rose-200 shadow-sm text-center max-w-lg mx-auto my-8">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-rose-100">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Acceso Restringido
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              El registro cronológico de auditoría (Audit Trail) está reservado
              exclusivamente para usuarios con rol de Administrador.
            </p>
            <button
              onClick={() => setActiveTab("reemplazos")}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition"
            >
              Volver a Operaciones
            </button>
          </div>
        ))}

      {/* Operation Modals */}
      <NewReemplazoModal
        isOpen={isReemplazoOpen}
        onClose={() => setIsReemplazoOpen(false)}
        onSuccess={loadActivityData}
      />
      <NewCambioModal
        isOpen={isCambioOpen}
        onClose={() => setIsCambioOpen(false)}
        onSuccess={loadActivityData}
      />
      <NewServicioModal
        isOpen={isServicioOpen}
        onClose={() => setIsServicioOpen(false)}
        onSuccess={loadActivityData}
      />
      <NewMovimientoModal
        isOpen={isMovimientoOpen}
        onClose={() => setIsMovimientoOpen(false)}
        onSuccess={loadActivityData}
      />
    </div>
  );
};
