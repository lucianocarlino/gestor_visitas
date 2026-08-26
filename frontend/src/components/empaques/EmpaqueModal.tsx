/**
 * EmpaqueModal Component
 * Modal for creating and editing Packing Plants with Banks, Lines (RF10, RF11),
 * and all initial equipment (Cabezales with Freno, and Caseteras) grouped in ONE single unified container.
 * Adheres strictly to SDD and Clean Code standards with Admin-only validation.
 */

import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  Layers,
  Cpu,
  Disc,
  Package,
  Sparkles,
  Building,
  Link as LinkIcon,
  Navigation,
} from "lucide-react";
import {
  Banco,
  CreateEmpaqueDTO,
  Empaque,
  InitialCabezalInput,
  InitialCaseteraInput,
  Status,
} from "../../types/domain";
import { coreApi } from "../../services/apiClient";
import { useAuth } from "../../context/AuthContext";

interface EmpaqueModalProps {
  empaque?: Empaque | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EmpaqueModal: React.FC<EmpaqueModalProps> = ({
  empaque,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { isAdmin } = useAuth();

  // Plant fields
  const [nombre, setNombre] = useState<string>("");
  const [ubicacion, setUbicacion] = useState<string>("");
  const [latitud, setLatitud] = useState<number>(-38.95);
  const [longitud, setLongitud] = useState<number>(-68.0);
  const [distancia, setDistancia] = useState<number>(20);
  const [servicio, setServicio] = useState<boolean>(true);
  const [bancos, setBancos] = useState<Banco[]>([]);

  // Initial Equipment fields (Cabezales with Freno & Caseteras)
  const [cabezales, setCabezales] = useState<InitialCabezalInput[]>([]);
  const [caseteras, setCaseteras] = useState<InitialCaseteraInput[]>([]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sync state whenever empaque changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (empaque) {
        setNombre(empaque.nombre || "");
        setUbicacion(empaque.ubicacion || "");
        setLatitud(empaque.latitud !== undefined ? empaque.latitud : -38.95);
        setLongitud(empaque.longitud !== undefined ? empaque.longitud : -68.0);
        setDistancia(empaque.distancia !== undefined ? empaque.distancia : 20);
        setServicio(empaque.servicio !== undefined ? empaque.servicio : true);
        setBancos(
          empaque.bancos && empaque.bancos.length > 0
            ? JSON.parse(JSON.stringify(empaque.bancos))
            : [{ id: "BNC-01", fecha_instalacion: "2024-01-01", lineas: 4 }],
        );
        setCabezales([]);
        setCaseteras([]);
      } else {
        setNombre("");
        setUbicacion("");
        setLatitud(-38.95);
        setLongitud(-68.0);
        setDistancia(20);
        setServicio(true);
        setBancos([
          {
            id: "BNC-01",
            fecha_instalacion: new Date().toISOString().split("T")[0],
            lineas: 4,
          },
        ]);
        // Default initial setup
        setCabezales([
          {
            id: `CAB-${Math.floor(100 + Math.random() * 800)}`,
            estado: Status.USING,
            freno_id: `FRN-${Math.floor(200 + Math.random() * 800)}`,
            freno_estado: Status.USING,
            freno_fecha_inicio: new Date().toISOString().split("T")[0],
          },
        ]);
        setCaseteras([
          {
            id: Math.floor(10 + Math.random() * 80),
            estado: Status.USING,
          },
        ]);
      }
      setErrorMsg(null);
    }
  }, [empaque, isOpen]);

  if (!isOpen) return null;

  // --- Bancos handlers ---
  const handleAddBanco = () => {
    setBancos((prev) => [
      ...prev,
      {
        id: `BNC-0${prev.length + 1}`,
        fecha_instalacion: new Date().toISOString().split("T")[0],
        lineas: 4,
      },
    ]);
  };

  const handleRemoveBanco = (idx: number) => {
    setBancos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleBancoChange = (
    idx: number,
    field: keyof Banco,
    val: string | number,
  ) => {
    setBancos((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  // --- Cabezales handlers ---
  const handleAddCabezal = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 899);
    setCabezales((prev) => [
      ...prev,
      {
        id: `CAB-${randomSuffix}`,
        estado: Status.USING,
        freno_id: `FRN-${randomSuffix + 100}`,
        freno_estado: Status.USING,
        freno_fecha_inicio: new Date().toISOString().split("T")[0],
      },
    ]);
  };

  const handleRemoveCabezal = (idx: number) => {
    setCabezales((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCabezalChange = (
    idx: number,
    field: keyof InitialCabezalInput,
    val: any,
  ) => {
    setCabezales((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleToggleFreno = (idx: number) => {
    setCabezales((prev) => {
      const copy = [...prev];
      const current = copy[idx];
      if (current.freno_id) {
        current.freno_id = undefined;
        current.freno_estado = undefined;
        current.freno_fecha_inicio = undefined;
      } else {
        const randomSuffix = Math.floor(200 + Math.random() * 799);
        current.freno_id = `FRN-${randomSuffix}`;
        current.freno_estado = Status.USING;
        current.freno_fecha_inicio = new Date().toISOString().split("T")[0];
      }
      return copy;
    });
  };

  // --- Caseteras handlers ---
  const handleAddCasetera = () => {
    const nextNum = Math.floor(10 + Math.random() * 89);
    setCaseteras((prev) => [
      ...prev,
      {
        id: nextNum,
        estado: Status.USING,
      },
    ]);
  };

  const handleRemoveCasetera = (idx: number) => {
    setCaseteras((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCaseteraChange = (
    idx: number,
    field: keyof InitialCaseteraInput,
    val: any,
  ) => {
    setCaseteras((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  // Auto-generate suggested equipment based on total lines of banks
  const handleAutoSuggestEquipment = () => {
    const totalLines = bancos.reduce(
      (sum, b) => sum + (Number(b.lineas) || 0),
      0,
    );
    const count = Math.max(1, Math.min(totalLines || 4, 12));

    const newCabs: InitialCabezalInput[] = [];
    const newCas: InitialCaseteraInput[] = [];

    const baseCab = Math.floor(110 + Math.random() * 700);
    const baseCas = Math.floor(30 + Math.random() * 60);

    for (let i = 0; i < count; i++) {
      newCabs.push({
        id: `CAB-${baseCab + i}`,
        estado: Status.USING,
        freno_id: `FRN-${baseCab + 100 + i}`,
        freno_estado: Status.USING,
        freno_fecha_inicio: new Date().toISOString().split("T")[0],
      });
      newCas.push({
        id: baseCas + i,
        estado: Status.USING,
      });
    }

    setCabezales(newCabs);
    setCaseteras(newCas);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isAdmin) {
      setErrorMsg(
        "Operación denegada: Solo los administradores pueden guardar modificaciones en los empaques.",
      );
      return;
    }

    if (!nombre.trim() || !ubicacion.trim()) {
      setErrorMsg("Nombre y ubicación son obligatorios.");
      return;
    }

    // Validate duplicate Cabezal IDs in input
    const cabIds = cabezales
      .map((c) => c.id.trim().toUpperCase())
      .filter(Boolean);
    if (new Set(cabIds).size !== cabIds.length) {
      setErrorMsg(
        "Existen Cabezales con identificadores duplicados en el listado.",
      );
      return;
    }

    // Validate duplicate Freno IDs in input
    const frenoIds = cabezales
      .map((c) => c.freno_id?.trim().toUpperCase())
      .filter(Boolean);
    if (new Set(frenoIds).size !== frenoIds.length) {
      setErrorMsg(
        "Existen Frenos con identificadores duplicados en el listado.",
      );
      return;
    }

    // Validate duplicate Casetera IDs in input
    const casIds = caseteras.map((c) => Number(c.id)).filter((n) => !isNaN(n));
    if (new Set(casIds).size !== casIds.length) {
      setErrorMsg(
        "Existen Caseteras con números de serie duplicados en el listado.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      if (empaque) {
        await coreApi.updateEmpaque(empaque.id, {
          nombre,
          ubicacion,
          latitud,
          longitud,
          distancia,
          servicio,
          bancos,
        });
      } else {
        const dto: CreateEmpaqueDTO = {
          nombre,
          ubicacion,
          latitud,
          longitud,
          distancia,
          servicio,
          bancos,
          cabezales: cabezales.filter((c) => c.id.trim().length > 0),
          caseteras: caseteras.filter(
            (c) => c.id !== undefined && !isNaN(Number(c.id)),
          ),
        };
        await coreApi.createEmpaque(dto);
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Error al guardar empaque",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalMachinesCount = cabezales.length + caseteras.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative text-slate-900 my-8 max-h-[92vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              {empaque
                ? `Editar Empaque: ${empaque.nombre}`
                : "Nuevo Empaque / Planta"}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {empaque
              ? `Actualice los datos y la configuración de bancos para ${empaque.id}`
              : "Defina la ubicación, bancos de etiquetado y toda la maquinaria inicial (Cabezales con Freno y Caseteras)."}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 text-xs overflow-y-auto flex-1 pr-1"
        >
          {/* 1. DATOS GENERALES */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nombre del Empaque *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Frutícola Valle Verde S.A."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Dirección / Ubicación *
            </label>
            <input
              type="text"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              placeholder="Ej. Ruta 22 Km 1210, Villa Regina"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Distancia desde Base (km)
              </label>
              <input
                type="number"
                min="0"
                value={distancia}
                onChange={(e) => setDistancia(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Estado de Abono
              </label>
              <select
                value={servicio ? "true" : "false"}
                onChange={(e) => setServicio(e.target.value === "true")}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="true">Servicio Activo</option>
                <option value="false">Sin Servicio / Eventual</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Latitud GPS
              </label>
              <input
                type="number"
                step="any"
                value={latitud}
                onChange={(e) => setLatitud(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Longitud GPS
              </label>
              <input
                type="number"
                step="any"
                value={longitud}
                onChange={(e) => setLongitud(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 2. BANCOS DE ETIQUETADO */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Layers className="w-4 h-4 text-blue-600" />
                Bancos de Etiquetado Sinclair
              </div>
              <button
                type="button"
                onClick={handleAddBanco}
                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-[11px] flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Banco
              </button>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
              {bancos.map((b, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 shadow-2xs"
                >
                  <input
                    type="text"
                    value={b.id}
                    onChange={(e) =>
                      handleBancoChange(idx, "id", e.target.value)
                    }
                    placeholder="ID Banco"
                    className="w-24 p-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono text-xs font-bold"
                    required
                  />
                  <div className="flex items-center gap-1 flex-1">
                    <span className="text-[10px] text-slate-500 font-medium">
                      Líneas:
                    </span>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={b.lineas}
                      onChange={(e) =>
                        handleBancoChange(idx, "lineas", Number(e.target.value))
                      }
                      className="w-14 p-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono text-center text-xs font-bold"
                    />
                  </div>
                  <input
                    type="date"
                    value={b.fecha_instalacion}
                    onChange={(e) =>
                      handleBancoChange(
                        idx,
                        "fecha_instalacion",
                        e.target.value,
                      )
                    }
                    className="w-32 p-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs font-mono"
                  />
                  {bancos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBanco(idx)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                      title="Eliminar banco"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 3. SINGLE UNIFIED DIV FOR ALL MACHINES (CABEZALES CON FRENO Y CASETERAS) */}
          {!empaque && (
            <div
              id="unified-machines-container"
              className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 pt-3"
            >
              {/* Header inside the unified div */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-600" />
                    <h4 className="font-bold text-slate-900 text-xs">
                      Maquinaria Asignada a Planta
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      {totalMachinesCount} equipos
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {cabezales.length} Cabezales (
                    {cabezales.filter((c) => c.freno_id).length} con Freno) ·{" "}
                    {caseteras.length} Caseteras
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    id="btn-add-cabezal-unified"
                    onClick={handleAddCabezal}
                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-[11px] flex items-center gap-1 transition shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Cabezal (con Freno)
                  </button>
                  <button
                    type="button"
                    id="btn-add-casetera-unified"
                    onClick={handleAddCasetera}
                    className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-[11px] flex items-center gap-1 transition shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Casetera
                  </button>
                  <button
                    type="button"
                    onClick={handleAutoSuggestEquipment}
                    className="px-2 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold rounded-xl text-[11px] flex items-center gap-1 transition"
                    title="Auto-generar equipos según líneas de bancos"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" /> Sugerir
                  </button>
                </div>
              </div>

              {/* Unified List of all Machines */}
              {totalMachinesCount === 0 ? (
                <div className="p-4 bg-white rounded-xl border border-dashed border-slate-300 text-center text-slate-500 text-xs">
                  No hay máquinas configuradas aún para este empaque.{" "}
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={handleAddCabezal}
                      className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg hover:bg-blue-100 transition text-[11px]"
                    >
                      + Agregar Cabezal
                    </button>
                    <button
                      type="button"
                      onClick={handleAddCasetera}
                      className="px-2.5 py-1 bg-purple-50 text-purple-700 font-bold rounded-lg hover:bg-purple-100 transition text-[11px]"
                    >
                      + Agregar Casetera
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {/* Render Cabezales with Freno */}
                  {cabezales.map((cab, idx) => (
                    <div
                      key={`cab-${idx}`}
                      className="p-3 bg-white rounded-xl border border-blue-200/80 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-[10px] uppercase flex items-center gap-1 flex-shrink-0">
                          <Cpu className="w-3 h-3" /> Cabezal
                        </span>

                        <div className="flex items-center gap-1.5 flex-1 min-w-[130px]">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            ID:
                          </span>
                          <input
                            type="text"
                            value={cab.id}
                            onChange={(e) =>
                              handleCabezalChange(idx, "id", e.target.value)
                            }
                            placeholder="CAB-101"
                            className="w-28 p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                          />
                        </div>

                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                          En uso
                        </span>

                        <button
                          type="button"
                          onClick={() => handleToggleFreno(idx)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition flex-shrink-0 ${
                            cab.freno_id
                              ? "bg-violet-100 text-violet-800 border border-violet-300"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                          title="Acoplar o remover freno a este cabezal"
                        >
                          <Disc className="w-3 h-3" />
                          <span>
                            {cab.freno_id
                              ? "Freno Acoplado"
                              : "+ Acoplar Freno"}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveCabezal(idx)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg ml-auto"
                          title="Eliminar este cabezal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Nested Freno details if active */}
                      {cab.freno_id && (
                        <div className="pl-3 pr-2 py-1.5 bg-violet-50/70 border border-violet-200 rounded-lg flex flex-wrap items-center gap-2 text-xs">
                          <div className="flex items-center gap-1 text-violet-900 font-bold">
                            <LinkIcon className="w-3 h-3 text-violet-600" />
                            <span className="text-[10px] uppercase">
                              Freno ID:
                            </span>
                          </div>

                          <input
                            type="text"
                            value={cab.freno_id}
                            onChange={(e) =>
                              handleCabezalChange(
                                idx,
                                "freno_id",
                                e.target.value,
                              )
                            }
                            placeholder="FRN-201"
                            className="w-24 p-1 bg-white border border-violet-300 rounded-md text-violet-950 font-mono text-xs font-bold"
                            required
                          />

                          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            En uso
                          </span>

                          <div className="flex items-center gap-1 ml-auto">
                            <span className="text-[10px] text-violet-700 font-medium">
                              Instalación:
                            </span>
                            <input
                              type="date"
                              value={
                                cab.freno_fecha_inicio ||
                                new Date().toISOString().split("T")[0]
                              }
                              onChange={(e) =>
                                handleCabezalChange(
                                  idx,
                                  "freno_fecha_inicio",
                                  e.target.value,
                                )
                              }
                              className="p-1 bg-white border border-violet-300 rounded-md text-violet-950 text-[11px] font-mono"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Render Caseteras */}
                  {caseteras.map((cas, idx) => (
                    <div
                      key={`cas-${idx}`}
                      className="p-2.5 bg-white rounded-xl border border-purple-200/80 shadow-2xs flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap"
                    >
                      <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-[10px] uppercase flex items-center gap-1 flex-shrink-0">
                        <Package className="w-3 h-3" /> Casetera
                      </span>

                      <div className="flex items-center gap-1.5 flex-1 min-w-[120px]">
                        <span className="text-[10px] font-bold text-slate-500">
                          Número #:
                        </span>
                        <input
                          type="number"
                          min="1"
                          value={cas.id}
                          onChange={(e) =>
                            handleCaseteraChange(
                              idx,
                              "id",
                              Number(e.target.value),
                            )
                          }
                          placeholder="Número"
                          className="w-20 p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs font-bold text-center focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          required
                        />
                      </div>

                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                        En uso
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveCasetera(idx)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg ml-auto"
                        title="Eliminar esta casetera"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              {!empaque && (
                <span>
                  Resumen: <strong>{bancos.length}</strong> bancos ·{" "}
                  <strong>{cabezales.length}</strong> cabezales (
                  {cabezales.filter((c) => c.freno_id).length} con freno) ·{" "}
                  <strong>{caseteras.length}</strong> caseteras
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSubmitting
                  ? "Guardando..."
                  : empaque
                    ? "Guardar Cambios"
                    : "Crear Empaque y Equipos"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
