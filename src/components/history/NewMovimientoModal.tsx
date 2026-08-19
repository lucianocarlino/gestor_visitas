/**
 * NewMovimientoModal Component
 * Allows recording machine movements and logistics transfers between Empaque plants and Workshop
 * Captures explicit dimensions: DÓNDE (Where), CUÁNDO (When), and CÓMO (How)
 */

import React, { useEffect, useState } from 'react';
import {
  X,
  Save,
  Layers,
  Calendar,
  MapPin,
  AlertCircle,
  Truck,
  ArrowRight,
  Cpu,
  Disc,
} from 'lucide-react';
import { coreApi } from '../../services/apiClient';
import { Empaque, Tecnico } from '../../types/domain';

interface NewMovimientoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewMovimientoModal: React.FC<NewMovimientoModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [empaques, setEmpaques] = useState<Empaque[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);

  const [machineType, setMachineType] = useState<'Cabezal' | 'Casetera' | 'Freno'>('Cabezal');
  const [machineId, setMachineId] = useState<string>('');
  const [origen, setOrigen] = useState<string>('EMP-04');
  const [destino, setDestino] = useState<string>('');
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [tecnicoId, setTecnicoId] = useState<string>('');
  const [motivo, setMotivo] = useState<string>('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [empList, tecList] = await Promise.all([
        coreApi.getEmpaques(),
        coreApi.getTecnicos(),
      ]);
      setEmpaques(empList);
      setTecnicos(tecList);

      if (empList.length > 1 && !destino) {
        setDestino(empList[1].id);
      }
      if (tecList.length > 0 && !tecnicoId) {
        setTecnicoId(tecList[0].id);
      }
    } catch {
      // fallback
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!machineId.trim()) {
      setErrorMessage('Debe indicar el ID del equipo a trasladar.');
      return;
    }
    if (!origen) {
      setErrorMessage('Debe especificar la ubicación de origen.');
      return;
    }
    if (!destino) {
      setErrorMessage('Debe especificar la ubicación de destino.');
      return;
    }
    if (origen === destino) {
      setErrorMessage('El origen y el destino no pueden ser el mismo lugar.');
      return;
    }
    if (!motivo.trim()) {
      setErrorMessage('Debe detallar el motivo del traslado logístico.');
      return;
    }

    setIsSubmitting(true);
    try {
      const tec = tecnicos.find((t) => t.id === tecnicoId);
      await coreApi.createMovimiento({
        machine_id: machineId.toUpperCase(),
        machine_type: machineType,
        origen,
        destino,
        motivo,
        fecha,
        tecnico_nombre: tec ? tec.nombre : 'Técnico Sinclair',
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al registrar el traslado de máquina.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-4 md:p-6 flex items-start justify-center backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-6 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-900 to-slate-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600/30 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Registrar Traslado / Movimiento</h3>
              <p className="text-xs text-teal-200">
                Logística de Equipos entre Plantas de Empaque y Taller Central
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

          {/* Machine Type Selector */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="block font-bold text-slate-800 mb-2">
              Tipo de Equipo a Trasladar
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMachineType('Cabezal')}
                className={`py-2 px-3 rounded-xl font-bold border flex items-center justify-center gap-1.5 transition ${
                  machineType === 'Cabezal'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Cpu className="w-4 h-4" /> Cabezal
              </button>
              <button
                type="button"
                onClick={() => setMachineType('Casetera')}
                className={`py-2 px-3 rounded-xl font-bold border flex items-center justify-center gap-1.5 transition ${
                  machineType === 'Casetera'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-4 h-4" /> Casetera
              </button>
              <button
                type="button"
                onClick={() => setMachineType('Freno')}
                className={`py-2 px-3 rounded-xl font-bold border flex items-center justify-center gap-1.5 transition ${
                  machineType === 'Freno'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Disc className="w-4 h-4" /> Freno
              </button>
            </div>
          </div>

          {/* 1. DIMENSIÓN: CUÁNDO (When) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>1. ¿CUÁNDO SE TRASLADA? (Fecha & Responsable)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fecha del Traslado</label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Técnico / Encargado</label>
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
              <span>2. ¿DÓNDE? (Ruta Logística: Origen ➔ Destino)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ubicación Origen</label>
                <select
                  value={origen}
                  onChange={(e) => setOrigen(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  required
                >
                  {empaques.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombre} ({emp.ubicacion})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ubicación Destino</label>
                <select
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                  required
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
              <Truck className="w-4 h-4 text-teal-600" />
              <span>3. ¿CÓMO? (Equipo & Justificación del Traslado)</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ID del Equipo a Mover
              </label>
              <input
                type="text"
                placeholder={machineType === 'Cabezal' ? 'Ej. CAB-101' : machineType === 'Casetera' ? 'Ej. 201' : 'Ej. FRN-301'}
                value={machineId}
                onChange={(e) => setMachineId(e.target.value.toUpperCase())}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Motivo del Movimiento
              </label>
              <textarea
                rows={3}
                placeholder="Ej. Reubicación preventiva para reforzar línea de alta velocidad en temporada de uva; o envío a Taller Central para calibración mayor..."
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
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md shadow-teal-500/20 flex items-center gap-2 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Guardando Traslado...' : 'Confirmar & Registrar Traslado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
