/**
 * NewCambioModal Component
 * Allows recording Brake Changes (Cambio de Freno) on Sinclair printheads (RF07)
 * Adheres strictly to SDD and Clean Code standards
 */

import React, { useEffect, useState } from "react";
import {
  X,
  Save,
  Disc,
  Calendar,
  MapPin,
  Wrench,
  AlertCircle,
  Search,
  CheckCircle2,
} from "lucide-react";
import { coreApi } from "../../services/apiClient";
import {
  Cabezal,
  CreateCambioDTO,
  Empaque,
  Freno,
  Status,
  Tecnico,
} from "../../types/domain";

interface NewCambioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewCambioModal: React.FC<NewCambioModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [empaques, setEmpaques] = useState<Empaque[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [cabezales, setCabezales] = useState<Cabezal[]>([]);
  const [frenos, setFrenos] = useState<Freno[]>([]);

  const [cabezalSearch, setCabezalSearch] = useState<string>("");
  const [cabezalId, setCabezalId] = useState<string>("");
  const [frenoRetiradoId, setFrenoRetiradoId] = useState<string>("");
  const [frenoInstaladoId, setFrenoInstaladoId] = useState<string>("");
  const [lugar, setLugar] = useState<"En emplazamiento" | "Taller">(
    "En emplazamiento",
  );
  const [empaqueId, setEmpaqueId] = useState<string>("");
  const [tecnicoId, setTecnicoId] = useState<string>("");
  const [fecha, setFecha] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [motivo, setMotivo] = useState<string>("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [empList, tecList, cabList, frnList] = await Promise.all([
        coreApi.getEmpaques(),
        coreApi.getTecnicos(),
        coreApi.getCabezales(),
        coreApi.getFrenos(),
      ]);
      setEmpaques(empList);
      setTecnicos(tecList);
      setCabezales(cabList);
      setFrenos(frnList);

      if (empList.length > 0 && !empaqueId) {
        setEmpaqueId(empList[0].id);
      }
      if (tecList.length > 0 && !tecnicoId) {
        setTecnicoId(tecList[0].id);
      }
    } catch {
      // fallback
    }
  };

  if (!isOpen) return null;

  // Ready brakes for installation
  const readyFrenos = frenos.filter((f) => f.estado === Status.READY);

  // Filtered cabezales for autocomplete
  const filteredCabezales = cabezales.filter(
    (c) =>
      c.id.toLowerCase().includes(cabezalSearch.toLowerCase()) ||
      c.ubicacion.toLowerCase().includes(cabezalSearch.toLowerCase()),
  );

  const handleSelectCabezal = (selectedCabId: string) => {
    setCabezalId(selectedCabId);
    const cab = cabezales.find((c) => c.id === selectedCabId);
    if (cab) {
      setFrenoRetiradoId(cab.freno_actual_id || "FRN-301");
      if (
        cab.ubicacion === "EMP-04" ||
        cab.ubicacion.toLowerCase().includes("taller")
      ) {
        setLugar("Taller");
      } else {
        setLugar("En emplazamiento");
        const matchedEmpaque = empaques.find(
          (e) => e.id === cab.ubicacion || e.nombre === cab.ubicacion,
        );
        if (matchedEmpaque) {
          setEmpaqueId(matchedEmpaque.id);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!cabezalId.trim()) {
      setErrorMessage("Debe seleccionar el Cabezal intervenido.");
      return;
    }
    if (!frenoRetiradoId.trim()) {
      setErrorMessage("Debe especificar el Freno retirado del cabezal.");
      return;
    }
    if (!frenoInstaladoId.trim()) {
      setErrorMessage("Debe especificar el nuevo Freno a instalar.");
      return;
    }
    if (frenoRetiradoId === frenoInstaladoId) {
      setErrorMessage(
        "El freno retirado y el instalado no pueden ser el mismo.",
      );
      return;
    }
    if (!motivo.trim()) {
      setErrorMessage("Debe describir el motivo técnico del cambio.");
      return;
    }

    setIsSubmitting(true);
    try {
      const dto: CreateCambioDTO = {
        cabezal_id: cabezalId,
        freno_retirado_id: frenoRetiradoId,
        freno_instalado_id: frenoInstaladoId,
        lugar,
        empaque_id: lugar === "En emplazamiento" ? empaqueId : undefined,
        motivo,
        fecha,
        tecnico_id: tecnicoId || undefined,
      };

      await coreApi.createCambio(dto);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Error al registrar el cambio de freno.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-4 md:p-6 flex items-start justify-center backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-6 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Disc className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Registrar Cambio de Freno</h3>
              <p className="text-xs text-indigo-200">
                Sustitución de conjunto de frenado en Cabezal de Etiquetado
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

          {/* 1. DIMENSIÓN: CUÁNDO (When) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>1. ¿CUÁNDO SE REALIZA? (Fecha & Técnico)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Fecha de la Operación
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
                  Técnico Responsable
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
              <span>2. ¿DÓNDE SE REALIZA EL CAMBIO? (Lugar)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tipo de Emplazamiento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLugar("En emplazamiento")}
                    className={`py-2 px-3 rounded-xl font-bold border transition text-center ${
                      lugar === "En emplazamiento"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    En Planta
                  </button>
                  <button
                    type="button"
                    onClick={() => setLugar("Taller")}
                    className={`py-2 px-3 rounded-xl font-bold border transition text-center ${
                      lugar === "Taller"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    En Taller Sinclair
                  </button>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Planta de Referencia
                </label>
                <select
                  value={empaqueId}
                  onChange={(e) => setEmpaqueId(e.target.value)}
                  disabled={lugar === "Taller"}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 disabled:opacity-50"
                >
                  {empaques.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombre} ({emp.ubicacion})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 3. DIMENSIÓN: CÓMO (How) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Wrench className="w-4 h-4 text-amber-600" />
              <span>3. ¿CÓMO SE REALIZA? (Cabezal, Frenos & Motivo)</span>
            </div>

            {/* Cabezal Selection with Search Autocomplete */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Cabezal Intervenido *
              </label>
              <div className="space-y-2">
                {/* Autocomplete search input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Filtrar por ID o ubicación (ej. CAB-101, Empaque)..."
                    value={cabezalSearch}
                    onChange={(e) => setCabezalSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs"
                  />
                </div>

                {/* Dropdown with all existing cabezales */}
                <select
                  value={cabezalId}
                  onChange={(e) => handleSelectCabezal(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold"
                  required
                >
                  <option value="">
                    -- Seleccione un Cabezal ({cabezales.length} existentes) --
                  </option>
                  {filteredCabezales.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} — Ubicación: {c.ubicacion} | Estado: {c.estado} |
                      Freno actual: {c.freno_actual_id || "Ninguno"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Removed Brake */}
              <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl space-y-2">
                <label className="block font-bold text-rose-900">
                  🔴 Freno Retirado del Cabezal
                </label>
                <input
                  type="text"
                  placeholder="Ej. FRN-303"
                  value={frenoRetiradoId}
                  onChange={(e) =>
                    setFrenoRetiradoId(e.target.value.toUpperCase())
                  }
                  className="w-full p-2 bg-white border border-rose-300 rounded-lg text-slate-900 font-mono font-bold"
                  required
                />
                <p className="text-[11px] text-rose-700">
                  Freno que estaba montado en {cabezalId || "el cabezal"}.
                  Pasará a <strong>En Reparación (Pending)</strong>.
                </p>
              </div>

              {/* Installed Brake */}
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                <label className="block font-bold text-emerald-900">
                  🟢 Nuevo Freno a Instalar (Estado: Listo)
                </label>
                <div className="space-y-1.5">
                  <select
                    value={frenoInstaladoId}
                    onChange={(e) => setFrenoInstaladoId(e.target.value)}
                    className="w-full p-2 bg-white border border-emerald-300 rounded-lg text-slate-900 font-mono font-bold"
                    required
                  >
                    <option value="">
                      -- Seleccione Freno Listo ({readyFrenos.length}) --
                    </option>
                    {readyFrenos.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.id} ({f.estado} - Ubicación: {f.ubicacion})
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="O escriba ID manual (ej. FRN-301)"
                    value={frenoInstaladoId}
                    onChange={(e) =>
                      setFrenoInstaladoId(e.target.value.toUpperCase())
                    }
                    className="w-full p-1.5 bg-white border border-emerald-200 rounded text-slate-700 font-mono text-[11px]"
                  />
                </div>
                <p className="text-[11px] text-emerald-700">
                  Pasará a estado <strong>En Uso (Using)</strong> montado en el
                  cabezal {cabezalId || "seleccionado"}.
                </p>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Motivo Técnico del Cambio
              </label>
              <textarea
                rows={3}
                placeholder="Describa el motivo (ej. Desgaste de zapata ferodo tras 500k etiquetas, pérdida de par de frenado, rozamiento irregular)..."
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
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-500/20 flex items-center gap-2 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting
                ? "Guardando Cambio..."
                : "Confirmar & Registrar Cambio de Freno"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
