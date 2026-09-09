/**
 * NewServicioModal Component
 * Allows recording maintenance operations & technical service on machines with consumables usage
 * Captures explicit dimensions: DÓNDE (Where), CUÁNDO (When), and CÓMO (How)
 * Adheres strictly to SDD and Clean Code standards
 */

import React, { useEffect, useState } from 'react';
import {
  X,
  Save,
  Wrench,
  Calendar,
  MapPin,
  AlertCircle,
  Package,
  Plus,
  Trash2,
  Cpu,
  Layers,
  Disc,
} from 'lucide-react';
import { coreApi } from '../../services/apiClient';
import {
  Cabezal,
  Casetera,
  Consumible,
  ConsumibleItem,
  CreateServiceDTO,
  Empaque,
  Freno,
  Status,
  Tecnico,
} from '../../types/domain';

interface NewServicioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tecnico: Tecnico | null;
}

export const NewServicioModal: React.FC<NewServicioModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
    tecnico,
}) => {
  const [empaques, setEmpaques] = useState<Empaque[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [consumiblesList, setConsumiblesList] = useState<Consumible[]>([]);
  const [cabezales, setCabezales] = useState<Cabezal[]>([]);
  const [caseteras, setCaseteras] = useState<Casetera[]>([]);
  const [frenos, setFrenos] = useState<Freno[]>([]);

  const [machineType, setMachineType] = useState<'Cabezal' | 'Casetera' | 'Freno'>('Cabezal');
  const [machineId, setMachineId] = useState<string>('');
  const [lugarUbicacion, setLugarUbicacion] = useState<string>('EMP-04');
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [tecnicoId, setTecnicoId] = useState<string>('');
  const [resumen, setResumen] = useState<string>('');
  const [trabajoHecho, setTrabajoHecho] = useState<string>('');
  const [usedConsumibles, setUsedConsumibles] = useState<ConsumibleItem[]>([]);
  const [selectedConsumibleId, setSelectedConsumibleId] = useState<string>('');
  const [consumibleQuantity, setConsumibleQuantity] = useState<number>(1);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [empList, tecList, consList, cabList, casList, frnList] = await Promise.all([
        coreApi.getEmpaques(),
        coreApi.getTecnicos(),
        coreApi.getConsumibles(),
        coreApi.getCabezales(),
        coreApi.getCaseteras(),
        coreApi.getFrenos(),
      ]);
      setEmpaques(empList);
      setTecnicos(tecList);
      setConsumiblesList(consList);
      setCabezales(cabList);
      setCaseteras(casList);
      setFrenos(frnList);

      if (tecList.length > 0 && !tecnicoId) {
        setTecnicoId(tecList[0].id);
      }
      if (consList.length > 0) {
        setSelectedConsumibleId(consList[0].id);
      }
    } catch {
      // fallback
    }
  };

  if (!isOpen) return null;

  // Filter machines with state "Pendiente" (Status.PENDING)
  const pendingCabezales = cabezales.filter((c) => c.estado === Status.PENDING);
  const pendingCaseteras = caseteras.filter((c) => c.estado === Status.PENDING);
  const pendingFrenos = frenos.filter((f) => f.estado === Status.PENDING);

  const currentPendingMachines =
    machineType === 'Cabezal'
      ? pendingCabezales
      : machineType === 'Casetera'
      ? pendingCaseteras
      : pendingFrenos;

  const handleAddConsumible = () => {
    if (!selectedConsumibleId || consumibleQuantity <= 0) return;

    const cons = consumiblesList.find((c) => c.id === selectedConsumibleId);
    if (!cons) return;

    if (cons.stock < consumibleQuantity) {
      setErrorMessage(`Stock insuficiente para ${cons.nombre}. Disponible: ${cons.stock}`);
      return;
    }

    const existingIndex = usedConsumibles.findIndex(
      (c) => c.consumible_id === selectedConsumibleId
    );

    if (existingIndex >= 0) {
      const updated = [...usedConsumibles];
      updated[existingIndex].cantidad += consumibleQuantity;
      setUsedConsumibles(updated);
    } else {
      setUsedConsumibles([
        ...usedConsumibles,
        {
          consumible_id: selectedConsumibleId,
          nombre: cons.nombre,
          cantidad: consumibleQuantity,
        },
      ]);
    }
    setErrorMessage(null);
  };

  const handleRemoveConsumible = (id: string) => {
    setUsedConsumibles(usedConsumibles.filter((c) => c.consumible_id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!machineId.trim()) {
      setErrorMessage('Debe indicar el ID de la máquina intervenida.');
      return;
    }
    if (!resumen.trim()) {
      setErrorMessage('Debe indicar el resumen del mantenimiento/servicio.');
      return;
    }
    if (!trabajoHecho.trim()) {
      setErrorMessage('Debe detallar el trabajo técnico ejecutado.');
      return;
    }

    setIsSubmitting(true);
    try {
      const dto: CreateServiceDTO = {
        machine_id: machineId.toUpperCase(),
        machine_type: machineType,
        fecha,
        resumen,
        trabajo_hecho: trabajoHecho,
        consumibles: usedConsumibles,
        tecnico_id: tecnico.id || undefined,
      };

      await coreApi.createServicio(dto);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al registrar el servicio de mantenimiento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-4 md:p-6 flex items-start justify-center backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-6 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-900 to-slate-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/30 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Registrar Servicio Técnico</h3>
              <p className="text-xs text-amber-200">
                Mantenimiento preventivo o correctivo
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Machine Type Selection */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="block font-bold text-slate-800 mb-2">
              Tipo de equipo
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMachineType('Cabezal');
                  setMachineId('');
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold border transition ${
                  machineType === 'Cabezal'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Cpu className="w-4 h-4" /> Cabezal
              </button>
              <button
                type="button"
                onClick={() => {
                  setMachineType('Casetera');
                  setMachineId('');
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold border transition ${
                  machineType === 'Casetera'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-4 h-4" /> Casetera
              </button>
              <button
                type="button"
                onClick={() => {
                  setMachineType('Freno');
                  setMachineId('');
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold border transition ${
                  machineType === 'Freno'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Disc className="w-4 h-4" /> Freno
              </button>
            </div>
          </div>

          {/* Machine Selection (Filtered to Pendiente / In Repair) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="font-bold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-600" />
                <span>ID de equipo</span>
              </div>
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {currentPendingMachines.length} {machineType.toLowerCase()}s pendientes
              </span>
            </div>

            <div className="space-y-2">
              {/* Dropdown of Pending machines */}
              <select
                value={machineId}
                onChange={(e) => setMachineId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold"
                required
              >
                <option value="">
                  -- Seleccione {machineType} con estado "Pendiente" ({currentPendingMachines.length}) --
                </option>
                {currentPendingMachines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id} — Estado: {m.estado} | Ubicación: {m.ubicacion}
                  </option>
                ))}
              </select>

              {/* Manual input fallback */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`O ingrese código manual si no está en lista (ej. ${
                    machineType === 'Cabezal' ? 'CAB-103' : machineType === 'Casetera' ? '201' : 'FRN-302'
                  })`}
                  value={machineId}
                  onChange={(e) => setMachineId(e.target.value.toUpperCase())}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Date & Technician */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Técnico: {tecnico.nombre}</label>
            </div>
          </div>

          {/* Service Summary & Details */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Resumen del Servicio
              </label>
              <input
                type="text"
                placeholder="Resumen del por qué llegó el equipo a mantenimiento"
                value={resumen}
                onChange={(e) => setResumen(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Trabajo realilzado
              </label>
              <textarea
                rows={3}
                placeholder="Describa cómo se solucionó el problema original"
                value={trabajoHecho}
                onChange={(e) => setTrabajoHecho(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                required
              />
            </div>
          </div>

          {/* Consumables Used */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="font-bold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                <span>Repuestos y Consumibles Utilizados</span>
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={selectedConsumibleId}
                onChange={(e) => setSelectedConsumibleId(e.target.value)}
                className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
              >
                {consumiblesList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} (Stock actual: {c.stock} uds)
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={consumibleQuantity}
                onChange={(e) => setConsumibleQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-center font-bold"
              />
              <button
                type="button"
                onClick={handleAddConsumible}
                className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1 transition"
              >
                <Plus className="w-4 h-4" /> Agregar
              </button>
            </div>

            {usedConsumibles.length > 0 && (
              <div className="space-y-1.5 pt-2">
                {usedConsumibles.map((item) => (
                  <div
                    key={item.consumible_id}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-800">
                      {item.nombre} &times; <strong>{item.cantidad} uds</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveConsumible(item.consumible_id)}
                      className="text-rose-600 hover:text-rose-800 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-2 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Guardando Servicio...' : 'Confirmar y Registrar Servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
