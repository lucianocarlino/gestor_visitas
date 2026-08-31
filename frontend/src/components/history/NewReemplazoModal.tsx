/**
 * NewReemplazoModal Component
 * Allows technical operators to record component replacements (Cabezal or Casetera)
 * Captures explicit dimensions: DÓNDE (Where), CUÁNDO (When), and CÓMO (How)
 * Adheres strictly to SDD and Clean Code standards
 */

import React, { useEffect, useState } from "react";
import {
  X,
  Save,
  ArrowRightLeft,
  Calendar,
  MapPin,
  Wrench,
  AlertCircle,
  Cpu,
  Layers,
  Building,
  CheckCircle2,
} from "lucide-react";
import { coreApi } from "../../services/apiClient";
import {
  Cabezal,
  Casetera,
  CreateReeplaceDTO,
  Empaque,
  Status,
  Tecnico,
} from "../../types/domain";

interface NewReemplazoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewReemplazoModal: React.FC<NewReemplazoModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [empaques, setEmpaques] = useState<Empaque[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [cabezales, setCabezales] = useState<Cabezal[]>([]);
  const [caseteras, setCaseteras] = useState<Casetera[]>([]);

  const [tipo, setTipo] = useState<"Cabezal" | "Casetera">("Cabezal");
  const [empaqueId, setEmpaqueId] = useState<string>("");
  const [tecnicoId, setTecnicoId] = useState<string>("");
  const [fecha, setFecha] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [retiradoId, setRetiradoId] = useState<string>("");
  const [instaladoId, setInstaladoId] = useState<string>("");
  const [motivo, setMotivo] = useState<string>("");
  const [bancoUbicacion, setBancoUbicacion] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [empList, tecList, cabList, casList] = await Promise.all([
        coreApi.getEmpaques(),
        coreApi.getTecnicos(),
        coreApi.getCabezales(),
        coreApi.getCaseteras(),
      ]);
      setEmpaques(empList);
      setTecnicos(tecList);
      setCabezales(cabList);
      setCaseteras(casList);

      if (empList.length > 0 && !empaqueId) {
        setEmpaqueId(empList[0].id);
        if (empList[0].bancos && empList[0].bancos.length > 0) {
          setBancoUbicacion(empList[0].bancos[0].id);
        }
      }
      if (tecList.length > 0 && !tecnicoId) {
        setTecnicoId(tecList[0].id);
      }
    } catch {
      // fallback
    }
  };

  if (!isOpen) return null;

  const selectedEmpaque = empaques.find((e) => e.id === empaqueId);

  // Filter machines currently in the selected Empaque
  const machinesInSelectedEmpaque =
    tipo === "Cabezal"
      ? cabezales.filter(
          (c) =>
            c.ubicacion === empaqueId ||
            (selectedEmpaque && c.ubicacion === selectedEmpaque.nombre) ||
            c.ubicacion
              .toLowerCase()
              .includes(
                selectedEmpaque?.nombre.toLowerCase().slice(0, 5) || "___",
              ),
        )
      : caseteras.filter(
          (c) =>
            c.ubicacion === empaqueId ||
            (selectedEmpaque && c.ubicacion === selectedEmpaque.nombre) ||
            c.ubicacion
              .toLowerCase()
              .includes(
                selectedEmpaque?.nombre.toLowerCase().slice(0, 5) || "___",
              ),
        );

  // Filter new machines to install: status "Listo" (READY) and located in "Taller" (EMP-04)
  const machinesReadyInWorkshop =
    tipo === "Cabezal"
      ? cabezales.filter(
          (c) =>
            c.estado === Status.READY &&
            (c.ubicacion === "EMP-04" ||
              c.ubicacion.toLowerCase().includes("taller") ||
              c.ubicacion.toLowerCase().includes("central")),
        )
      : caseteras.filter(
          (c) =>
            c.estado === Status.READY &&
            (c.ubicacion === "EMP-04" ||
              c.ubicacion.toLowerCase().includes("taller") ||
              c.ubicacion.toLowerCase().includes("central")),
        );

  const handleEmpaqueChange = (newEmpaqueId: string) => {
    setEmpaqueId(newEmpaqueId);
    setRetiradoId("");
    const newEmp = empaques.find((e) => e.id === newEmpaqueId);
    if (newEmp && newEmp.bancos && newEmp.bancos.length > 0) {
      setBancoUbicacion(newEmp.bancos[0].id);
    } else {
      setBancoUbicacion("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!empaqueId) {
      setErrorMessage("Debe seleccionar la planta de empaque (DÓNDE).");
      return;
    }
    if (!retiradoId) {
      setErrorMessage(
        "Debe especificar el ID del componente que se retira de la planta.",
      );
      return;
    }
    if (!instaladoId) {
      setErrorMessage(
        "Debe especificar el ID del componente nuevo que se instala.",
      );
      return;
    }
    if (retiradoId === instaladoId) {
      setErrorMessage(
        "El equipo retirado y el equipo instalado no pueden ser el mismo.",
      );
      return;
    }
    if (!motivo.trim()) {
      setErrorMessage(
        "Debe detallar el motivo técnico de la sustitución (CÓMO).",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const dto: CreateReeplaceDTO = {
        empaque_id: empaqueId,
        retirado_id: retiradoId,
        retirado_tipo: tipo,
        instalado_id: instaladoId,
        instalado_tipo: tipo,
        motivo: bancoUbicacion ? `[${bancoUbicacion}] ${motivo}` : motivo,
        tecnico_id: tecnicoId || undefined,
      };

      await coreApi.createReemplazo(dto);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Error al registrar el reemplazo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-4 md:p-6 flex items-start justify-center backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-6 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-slate-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Registrar Nuevo Reemplazo</h3>
              <p className="text-xs text-blue-200">
                Sustitución de Cabezales o Caseteras en Empaques
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto flex-1 space-y-5 text-xs"
        >
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Component Type Selector */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="block font-bold text-slate-800 mb-2">
              Tipo de Componente a Reemplazar
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setTipo("Cabezal");
                  setRetiradoId("");
                  setInstaladoId("");
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold border transition ${
                  tipo === "Cabezal"
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Cpu className="w-4 h-4" /> Cabezal
              </button>
              <button
                type="button"
                onClick={() => {
                  setTipo("Casetera");
                  setRetiradoId("");
                  setInstaladoId("");
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold border transition ${
                  tipo === "Casetera"
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Layers className="w-4 h-4" /> Casetera
              </button>
            </div>
          </div>

          {/* 1. DIMENSIÓN: CUÁNDO (When) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>1. Fecha y técnico</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Técnico
                </label>
                <select
                  value={tecnicoId}
                  onChange={(e) => setTecnicoId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  required
                >
                  {tecnicos.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre} ({t.rol})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 2. DIMENSIÓN: DÓNDE (Where) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>
                2. Empaque y banco de destino
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Empaque destino
                </label>
                <select
                  value={empaqueId}
                  onChange={(e) => handleEmpaqueChange(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold"
                  required
                >
                  {empaques.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombre} ({emp.ubicacion} - {emp.distancia} km)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Banco que requiere el cambio
                </label>
                {selectedEmpaque?.bancos &&
                selectedEmpaque.bancos.length > 0 ? (
                  <select
                    value={bancoUbicacion}
                    onChange={(e) => setBancoUbicacion(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                    required
                  >
                    {selectedEmpaque.bancos.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.id} ({b.lineas} líneas - Inst. {b.fecha_instalacion})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Ej. Banco 1 (4 líneas)"
                    value={bancoUbicacion}
                    onChange={(e) => setBancoUbicacion(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                    required
                  />
                )}
              </div>
            </div>
          </div>

          {/* 3. DIMENSIÓN: CÓMO (How) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Wrench className="w-4 h-4 text-amber-600" />
              <span>3. Equipo retirado e instalado</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Removed Component */}
              <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl space-y-2">
                <label className="block font-bold text-rose-900">
                  Equipo retirado
                </label>
                <div className="space-y-1.5">
                  <select
                    value={retiradoId}
                    onChange={(e) => setRetiradoId(e.target.value)}
                    className="w-full p-2 bg-white border border-rose-300 rounded-lg text-slate-900 font-mono font-bold"
                    required
                  >
                    <option value="">
                      -- Seleccione {tipo} --
                    </option>
                    {machinesInSelectedEmpaque.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.id} ({m.estado})
                      </option>
                    ))}
                  </select>

                  {/* Fallback text input if machine is not in list */}
                  <input
                    type="text"
                    placeholder={`O escriba ID manual (ej. ${tipo === "Cabezal" ? "CAB-103" : "201"})`}
                    value={retiradoId}
                    onChange={(e) =>
                      setRetiradoId(e.target.value.toUpperCase())
                    }
                    className="w-full p-1.5 bg-white border border-rose-200 rounded text-slate-700 font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Installed Component */}
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                <label className="block font-bold text-emerald-900">
                  Equipo instalado o a instalar
                </label>
                <div className="space-y-1.5">
                  <select
                    value={instaladoId}
                    onChange={(e) => setInstaladoId(e.target.value)}
                    className="w-full p-2 bg-white border border-emerald-300 rounded-lg text-slate-900 font-mono font-bold"
                    required
                  >
                    <option value="">
                      -- Seleccione {tipo} del taller --
                    </option>
                    {machinesReadyInWorkshop.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.id} (Listo - Taller Central)
                      </option>
                    ))}
                  </select>

                  {/* Fallback text input if machine is not in list */}
                  <input
                    type="text"
                    placeholder={`O escriba ID manual (ej. ${tipo === "Cabezal" ? "CAB-102" : "202"})`}
                    value={instaladoId}
                    onChange={(e) =>
                      setInstaladoId(e.target.value.toUpperCase())
                    }
                    className="w-full p-1.5 bg-white border border-emerald-200 rounded text-slate-700 font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Motivo del reemplazo
              </label>
              <textarea
                rows={3}
                placeholder="Descripción del motivo del reemplazo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                required
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting
                ? "Guardando reemplazo..."
                : "Confirmar y registrar reemplazo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
