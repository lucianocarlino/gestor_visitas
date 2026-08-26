/**
 * EquipmentByLocationView Component
 * Dedicated view to inspect all equipment located at any chosen Empaque (Option 6 in Spec)
 * Adheres strictly to SDD and Clean Code standards
 */

import React, { useEffect, useState } from "react";
import {
  MapPin,
  Cpu,
  Layers,
  Disc,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building,
  RefreshCw,
} from "lucide-react";
import { coreApi } from "../../services/apiClient";
import { Cabezal, Casetera, Empaque, Freno, Status } from "../../types/domain";

export const EquipmentByLocationView: React.FC = () => {
  const [empaques, setEmpaques] = useState<Empaque[]>([]);
  const [selectedEmpaqueId, setSelectedEmpaqueId] = useState<string>("");
  const [equipmentData, setEquipmentData] = useState<{
    cabezales: Cabezal[];
    caseteras: Casetera[];
    frenos: Freno[];
    total: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadEmpaques();
  }, []);

  useEffect(() => {
    if (selectedEmpaqueId) {
      loadLocationEquipment(selectedEmpaqueId);
    }
  }, [selectedEmpaqueId]);

  const loadEmpaques = async () => {
    setIsLoading(true);
    try {
      const data = await coreApi.getEmpaques();
      setEmpaques(data);
      if (data.length > 0 && !selectedEmpaqueId) {
        setSelectedEmpaqueId(data[0].id);
      }
    } catch {
      // offline fallback
    } finally {
      setIsLoading(false);
    }
  };

  const loadLocationEquipment = async (empId: string) => {
    try {
      const res = await coreApi.getEquipmentByLocation(empId);
      setEquipmentData(res);
    } catch {
      // fallback
    }
  };

  const selectedEmpaque = empaques.find((e) => e.id === selectedEmpaqueId);

  return (
    <div className="space-y-6">
      {/* Location Selector Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              Equipos por Empaque / Planta
            </h2>
            <p className="text-xs text-slate-500">
              Consulte el inventario de Cabezales, Caseteras y Frenos asignados
              a cada establecimiento
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              id="select-equipment-location"
              value={selectedEmpaqueId}
              onChange={(e) => setSelectedEmpaqueId(e.target.value)}
              className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none min-w-[220px]"
            >
              {empaques.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre} ({e.distancia} km)
                </option>
              ))}
            </select>

            <button
              onClick={() =>
                selectedEmpaqueId && loadLocationEquipment(selectedEmpaqueId)
              }
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
              title="Actualizar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {selectedEmpaque && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                Ubicación
              </span>
              <span className="font-semibold text-slate-800">
                {selectedEmpaque.ubicacion}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                Distancia
              </span>
              <span className="font-semibold text-slate-800">
                {selectedEmpaque.distancia} km de base
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                Bancos Sinclair
              </span>
              <span className="font-semibold text-slate-800">
                {selectedEmpaque.bancos.length} bancos (
                {selectedEmpaque.bancos.reduce((a, b) => a + b.lineas, 0)}{" "}
                líneas)
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                Total Equipos Activos
              </span>
              <span className="font-bold text-blue-700">
                {equipmentData?.total || 0} unidades
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Equipment Category Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cabezales Column */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Cabezales</h3>
                <span className="text-[10px] text-slate-400">
                  ({equipmentData?.cabezales.length || 0})
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {!equipmentData || equipmentData.cabezales.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                No hay cabezales instalados en este empaque.
              </p>
            ) : (
              equipmentData.cabezales.map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-blue-700">{c.id}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        c.estado === Status.USING
                          ? "bg-emerald-100 text-emerald-800"
                          : c.estado === Status.READY
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {c.estado}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex items-center justify-between">
                    <span>Freno acoplado:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {c.freno_actual_id || "Ninguno"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Caseteras Column */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Caseteras</h3>
                <span className="text-[10px] text-slate-400">
                  Caseteras ({equipmentData?.caseteras.length || 0})
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {!equipmentData || equipmentData.caseteras.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                No hay caseteras en este empaque.
              </p>
            ) : (
              equipmentData.caseteras.map((cas) => (
                <div
                  key={cas.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-teal-700">Casetera #{cas.id}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        cas.estado === Status.USING
                          ? "bg-emerald-100 text-emerald-800"
                          : cas.estado === Status.READY
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {cas.estado}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {cas.historial_movimientos.length} traslados registrados
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Frenos Column */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Disc className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Frenos</h3>
                <span className="text-[10px] text-slate-400">
                  Freno ({equipmentData?.frenos.length || 0})
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {!equipmentData || equipmentData.frenos.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                No hay frenos asignados a este empaque.
              </p>
            ) : (
              equipmentData.frenos.map((frn) => (
                <div
                  key={frn.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-indigo-700">{frn.id}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        frn.estado === Status.USING
                          ? "bg-emerald-100 text-emerald-800"
                          : frn.estado === Status.READY
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {frn.estado}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex items-center justify-between">
                    <span>En Cabezal:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {frn.cabezal_id || "En stock local"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
