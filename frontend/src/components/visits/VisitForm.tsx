/**
 * VisitForm Component
 * Form for registering maintenance visits & Sinclair reports with offline queue support
 * Adheres strictly to RF01, RF02, RF21, RF22, RF23 specifications
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Save,
  Plus,
  Trash2,
  PenTool,
  CheckCircle,
  AlertCircle,
  Clock,
  Car,
  MapPin,
  Users,
  Eraser,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { coreApi, visitsApi } from '../../services/apiClient';
import { OfflineSyncManager } from '../../services/offlineSync';
import {
  CodigoMotivo,
  CodigoOrden,
  CodigoTipoServicio,
  CreateVisitDTO,
  Empaque,
  ItemEstructura,
  Tecnico,
  Vehiculo,
} from '../../types/domain';

interface VisitFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const VisitForm: React.FC<VisitFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const formTopRef = useRef<HTMLDivElement | null>(null);
  const [empaques, setEmpaques] = useState<Empaque[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form state
  const [vehiculo, setVehiculo] = useState<Vehiculo>(Vehiculo.Amarok);
  const [empaqueId, setEmpaqueId] = useState<string>('');
  const [selectedTecnicos, setSelectedTecnicos] = useState<string[]>(user ? [user.id] : []);
  const [codigoMotivo, setCodigoMotivo] = useState<CodigoMotivo>(CodigoMotivo.SRT);
  const [codigoOrigen, setCodigoOrigen] = useState<CodigoOrden>(CodigoOrden.EWS);
  const [codigoTipoServicio, setCodigoTipoServicio] = useState<CodigoTipoServicio>(
    CodigoTipoServicio.Y
  );
  const [solicitadoPor, setSolicitadoPor] = useState<string>('');
  const [motivo, setMotivo] = useState<string>('');
  const [horaInicio, setHoraInicio] = useState<string>('08:30');
  const [horaFin, setHoraFin] = useState<string>('12:00');
  const [fueraDeHora, setFueraDeHora] = useState<boolean>(false);
  const [horaLlamada, setHoraLlamada] = useState<string>('08:00');
  const [nombreCliente, setNombreCliente] = useState<string>('');
  const [produccionEtiquetada, setProduccionEtiquetada] = useState<string>('99%');
  const [condicionFruta, setCondicionFruta] = useState<string>('Calibre uniforme exportación');
  const [comentarios, setComentarios] = useState<string>('');

  // Dynamic Structure Items - starts BLANK as requested
  const [estructura, setEstructura] = useState<ItemEstructura[]>([]);

  // Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasSignature, setHasSignature] = useState<boolean>(false);

  useEffect(() => {
    loadPrerequisites();
    if (formTopRef.current) {
      formTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const loadPrerequisites = async () => {
    try {
      const [emps, tecs] = await Promise.all([coreApi.getEmpaques(), coreApi.getTecnicos()]);
      setEmpaques(emps);
      setTecnicos(tecs);
      if (emps.length > 0 && !empaqueId) setEmpaqueId(emps[0].id);
      if (user && !selectedTecnicos.includes(user.id)) {
        setSelectedTecnicos([user.id]);
      }
    } catch {
      // offline default
    }
  };

  const handleAddEstructura = () => {
    setEstructura((prev) => [
      ...prev,
      {
        codigo_res: `RES-0${prev.length + 1}`,
        numero_partes: '',
        cantidad: '1',
        otras_acciones: '',
        pct_etiquetado_esperado: 99.0,
        pct_etiquetado_real: 98.0,
        tiempo_servicio: 1.0,
      },
    ]);
  };

  const handleRemoveEstructura = (index: number) => {
    setEstructura((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEstructuraChange = (
    index: number,
    field: keyof ItemEstructura,
    value: string | number
  ) => {
    setEstructura((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!empaqueId) {
      setErrorMessage('Por favor seleccione un empaque.');
      return;
    }
    if (selectedTecnicos.length === 0) {
      setErrorMessage('Seleccione al menos un técnico asignado.');
      return;
    }
    if (!nombreCliente.trim()) {
      setErrorMessage('Ingrese el nombre del cliente o encargado que firma.');
      return;
    }

    const firmaDataUrl = hasSignature && canvasRef.current ? canvasRef.current.toDataURL() : undefined;

    const dto: CreateVisitDTO = {
      vehiculo,
      empaque_id: empaqueId,
      tecnico_ids: selectedTecnicos,
      codigo_motivo: codigoMotivo,
      codigo_origen: codigoOrigen,
      codigo_tipo_servicio: codigoTipoServicio,
      solicitado_por: solicitadoPor || 'Encargado de Empaque',
      motivo: motivo || 'Mantenimiento preventivo',
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      fuera_de_hora: fueraDeHora,
      comentarios,
      estructura,
      hora_llamada: horaLlamada,
      nombre_cliente: nombreCliente,
      firma_cliente: firmaDataUrl,
      produccion_etiquetada: produccionEtiquetada,
      condicion_fruta: condicionFruta,
    };

    setIsSubmitting(true);
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    try {
      if (!isOnline) {
        // RF22: Save offline
        OfflineSyncManager.getInstance().saveOfflineVisit(dto);
        setSuccessMessage('Visita guardada localmente (Modo Offline). Se sincronizará automáticamente.');
        resetForm();
      } else {
        await visitsApi.createVisit(dto);
        setSuccessMessage('¡Visita y Reporte Sinclair guardados con éxito!');
        resetForm();
        if (onSuccess) onSuccess();
      }
    } catch (err: unknown) {
      // If server error, fallback to offline queue
      OfflineSyncManager.getInstance().saveOfflineVisit(dto);
      setSuccessMessage('No se pudo conectar con el servidor. Visita guardada en cola local offline.');
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTecnico = (id: string) => {
    setSelectedTecnicos((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev; // keep at least one technician
        return prev.filter((t) => t !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const resetForm = () => {
    setSolicitadoPor('');
    setMotivo('');
    setComentarios('');
    clearCanvas();
  };

  return (
    <form id="form-create-visit" onSubmit={handleSubmit} className="space-y-6">
      <div ref={formTopRef} className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900">Nueva Visita de Servicio Técnico</h2>
          <p className="text-xs text-slate-500">Registro oficial de intervención y emisión de Reporte Sinclair</p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            Cancelar Operación
          </button>
        )}
      </div>

      {/* Alert Banners */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Section 1: Ubicación & Desplazamiento */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          1. Datos de Empaque y Logística
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Empaque / Planta *</label>
            <select
              id="select-visit-empaque"
              value={empaqueId}
              onChange={(e) => setEmpaqueId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
              {empaques.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre} ({e.distancia} km)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Vehículo Utilizado *</label>
            <select
              id="select-visit-vehiculo"
              value={vehiculo}
              onChange={(e) => setVehiculo(e.target.value as Vehiculo)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {Object.values(Vehiculo).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Multi-Technician Selector */}
        <div className="pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center justify-between mb-2">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              Técnicos Asignados a la Visita ({selectedTecnicos.length} seleccionados) *
            </label>
            <span className="text-[11px] text-slate-500">
              Puede seleccionar múltiples técnicos que participan en la operación
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {tecnicos.map((t) => {
              const isSelected = selectedTecnicos.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTecnico(t.id)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-left transition ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-2xs font-semibold'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-700'
                      }`}
                    >
                      {t.nombre.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs">{t.nombre}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{t.rol}</div>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-md font-bold">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 2: Códigos Sinclair & Horarios */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          2. Códigos Sinclair & Horarios
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Código de Motivo *</label>
            <select
              id="select-visit-codigo-motivo"
              value={codigoMotivo}
              onChange={(e) => setCodigoMotivo(e.target.value as CodigoMotivo)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
            >
              {Object.entries(CodigoMotivo).map(([k, v]) => (
                <option key={k} value={v}>
                  {k} - {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Código de Origen/Orden *</label>
            <select
              id="select-visit-codigo-origen"
              value={codigoOrigen}
              onChange={(e) => setCodigoOrigen(e.target.value as CodigoOrden)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
            >
              {Object.entries(CodigoOrden).map(([k, v]) => (
                <option key={k} value={v}>
                  {k} - {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tipo de Servicio *</label>
            <select
              id="select-visit-tipo-servicio"
              value={codigoTipoServicio}
              onChange={(e) => setCodigoTipoServicio(e.target.value as CodigoTipoServicio)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
            >
              {Object.entries(CodigoTipoServicio).map(([k, v]) => (
                <option key={k} value={v}>
                  {k} - {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Hora Llamada</label>
            <input
              type="time"
              value={horaLlamada}
              onChange={(e) => setHoraLlamada(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Hora Inicio *</label>
            <input
              type="time"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Hora Fin *</label>
            <input
              type="time"
              value={horaFin}
              onChange={(e) => setHoraFin(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              required
            />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <input
            type="checkbox"
            id="checkbox-fuera-de-hora"
            checked={fueraDeHora}
            onChange={(e) => setFueraDeHora(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <label htmlFor="checkbox-fuera-de-hora" className="text-xs text-slate-700 font-medium">
            Servicio realizado fuera de horario laboral habitual (Tarifa especial / Urgencia)
          </label>
        </div>
      </div>

      {/* Section 3: Motivo & Detalles del Trabajo */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <PenTool className="w-4 h-4 text-blue-600" />
          3. Requerimiento Técnico y Contexto
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Solicitado por *</label>
            <input
              type="text"
              value={solicitadoPor}
              onChange={(e) => setSolicitadoPor(e.target.value)}
              placeholder="Ej. Ing. Juan Pérez (Jefe de Producción)"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Motivo Técnico General *</label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej. Calibración y sustitución de cuchillas de corte"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Producción Etiquetada</label>
            <input
              type="text"
              value={produccionEtiquetada}
              onChange={(e) => setProduccionEtiquetada(e.target.value)}
              placeholder="Ej. 98.8% de etiquetado efectivo"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Condición de la Fruta</label>
            <input
              type="text"
              value={condicionFruta}
              onChange={(e) => setCondicionFruta(e.target.value)}
              placeholder="Ej. Manzana Red Delicious - Grado 1"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Estructura de Componentes (ItemEstructura) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              4. Estructura de Máquinas & Intervenciones
            </h3>
            <p className="text-[11px] text-slate-400">
              Desglose de equipos intervenidos, rendimiento esperado vs. real y horas de servicio
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddEstructura}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold hover:bg-blue-100 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Agregar Fila
          </button>
        </div>

        {estructura.length === 0 ? (
          <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <p className="text-xs text-slate-500 font-medium mb-2">
              No hay componentes agregados a la estructura.
            </p>
            <button
              type="button"
              onClick={handleAddEstructura}
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar el primer componente
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {estructura.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs items-end"
              >
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-600">Cód. Res</label>
                  <input
                    type="text"
                    value={item.codigo_res}
                    onChange={(e) => handleEstructuraChange(idx, 'codigo_res', e.target.value)}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded text-slate-900"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-600">Nº Partes / ID</label>
                  <input
                    type="text"
                    value={item.numero_partes}
                    placeholder="Ej. CAB-101"
                    onChange={(e) => handleEstructuraChange(idx, 'numero_partes', e.target.value)}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded text-slate-900"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-semibold text-slate-600">Cant.</label>
                  <input
                    type="text"
                    value={item.cantidad}
                    onChange={(e) => handleEstructuraChange(idx, 'cantidad', e.target.value)}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded text-slate-900"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-semibold text-slate-600">% Esperado</label>
                  <input
                    type="number"
                    step="0.1"
                    value={item.pct_etiquetado_esperado}
                    onChange={(e) =>
                      handleEstructuraChange(idx, 'pct_etiquetado_esperado', Number(e.target.value))
                    }
                    className="w-full p-1.5 bg-white border border-slate-300 rounded text-slate-900 font-mono"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-semibold text-slate-600">% Real</label>
                  <input
                    type="number"
                    step="0.1"
                    value={item.pct_etiquetado_real}
                    onChange={(e) =>
                      handleEstructuraChange(idx, 'pct_etiquetado_real', Number(e.target.value))
                    }
                    className="w-full p-1.5 bg-white border border-slate-300 rounded text-slate-900 font-mono"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-semibold text-slate-600">Horas Serv.</label>
                  <input
                    type="number"
                    step="0.5"
                    value={item.tiempo_servicio}
                    onChange={(e) =>
                      handleEstructuraChange(idx, 'tiempo_servicio', Number(e.target.value))
                    }
                    className="w-full p-1.5 bg-white border border-slate-300 rounded text-slate-900 font-mono"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-semibold text-slate-600">Acción Realizada</label>
                  <input
                    type="text"
                    value={item.otras_acciones}
                    placeholder="Ajuste, calibración..."
                    onChange={(e) => handleEstructuraChange(idx, 'otras_acciones', e.target.value)}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded text-slate-900"
                  />
                </div>
                <div className="sm:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveEstructura(idx)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                    title="Eliminar fila"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 5: Firma Cliente & Cierre */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <PenTool className="w-4 h-4 text-blue-600" />
          5. Firma de Conformidad del Cliente & Comentarios
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nombre de la Persona que Recibe el Servicio *
            </label>
            <input
              type="text"
              id="input-client-name"
              value={nombreCliente}
              onChange={(e) => setNombreCliente(e.target.value)}
              placeholder="Ej. Ing. Roberto Sánchez"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 mb-3"
              required
            />

            <label className="block font-semibold text-slate-700 mb-1">
              Comentarios u Observaciones Adicionales
            </label>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              rows={3}
              placeholder="Detalles sobre el estado de la línea, recomendaciones al operador..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">Firma Digital del Cliente</label>
              <button
                type="button"
                onClick={clearCanvas}
                className="text-[11px] text-slate-500 hover:text-slate-700 flex items-center gap-1"
              >
                <Eraser className="w-3 h-3" /> Limpiar firma
              </button>
            </div>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-1 bg-slate-50">
              <canvas
                ref={canvasRef}
                width={360}
                height={140}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-[140px] bg-white rounded-lg cursor-crosshair touch-none"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 text-center">
              Dibuje la firma con el cursor o pantalla táctil
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
        <div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              Cancelar Operación
            </button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={resetForm}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            Limpiar Formulario
          </button>
          <button
            type="submit"
            id="btn-submit-visit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Guardando Visita...' : 'Registrar Visita & Emitir Reporte'}
          </button>
        </div>
      </div>
    </form>
  );
};
