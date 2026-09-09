/**
 * MachineModal Component
 * Modal for creating and editing Cabezales, Caseteras, and Frenos (RF12)
 * Adheres strictly to SDD and Clean Code standards
 */

import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Status, MachineType, Empaque } from '../../types/domain';
import { coreApi } from '../../services/apiClient';

interface MachineModalProps {
  type: MachineType;
  empaques: Empaque[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const MachineModal: React.FC<MachineModalProps> = ({
  type,
  empaques,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [id, setId] = useState<string>('');
  const [estado, setEstado] = useState<Status>(Status.READY);
  const [ubicacion, setUbicacion] = useState<string>(empaques[0]?.nombre);
  const [empaque_id, setEmpaqueId] = useState<string>(empaques[0]?.id);
  const [fechaInicio, setFechaInicio] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!id.trim()) {
      setErrorMsg('El identificador del equipo es obligatorio.');
      return;
    }

    setUbicacion(empaques.find((e) => e.id == empaque_id)?.nombre);

    setIsSubmitting(true);
    try {
      if (type === 'Cabezal') {
        await coreApi.createCabezal({ id: id.trim(), estado, ubicacion, empaque_id});
      } else if (type === 'Casetera') {
        const numId = Number(id.trim());
        if (isNaN(numId)) {
          setErrorMsg('El ID de Casetera debe ser un valor numérico.');
          setIsSubmitting(false);
          return;
        }
        await coreApi.createCasetera({ id: numId, estado, ubicacion, empaque_id });
      } else if (type === 'Freno') {
        await coreApi.createFreno({
          id: id.trim(),
          estado,
          ubicacion,
          fecha_inicio: fechaInicio,
        });
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar equipo';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-base font-bold text-slate-900 mb-1">
          Nuevo {type}
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Ingrese los datos del nuevo equipo para el inventario
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Identificador / Código *
            </label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder={type === 'Casetera' ? 'Ej. 205 (numérico)' : `Ej. ${type === 'Cabezal' ? 'CAB-104' : 'FRN-304'}`}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Estado Operativo *</label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value as Status)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
            >
              {Object.values(Status).map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Ubicación Inicial *</label>
            <select
              value={empaque_id}
              onChange={(e) => setEmpaqueId(e.target.value)}

              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
            >
              {empaques.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}f
            </select>
          </div>

          {type === 'Freno' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fecha de Inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Guardando...' : 'Crear Equipo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
