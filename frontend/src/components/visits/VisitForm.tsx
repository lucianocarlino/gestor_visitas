/**
 * VisitForm Component
 * Form for registering maintenance visits & Sinclair reports with offline queue support
 * Adheres strictly to RF01, RF02, RF21, RF22, RF23 specifications
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Save,
  PenTool,
  CheckCircle,
  AlertCircle,
  Clock,
  MapPin,
  Users,
  Eraser,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { coreApi, visitsApi } from '../../services/apiClient';
import { OfflineSyncManager } from '../../services/offlineSync';
import { getConnectivityStatus } from '../../platform/connectivity';
import {
  CodigoMotivo,
  CodigoOrden,
  CodigoResolucion,
  CodigoTipoServicio,
  CreateVisitDTO,
  Empaque,
  ItemEstructura,
  Tecnico,
  Vehiculo,
} from '../../types/domain';
import { generateSinclairReportNumber } from '../../utils/pdfGenerator';
import { VisitPdfPreviewModal } from './VisitPdfPreviewModal';

interface VisitFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const VisitForm: React.FC<VisitFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const formTopRef = useRef<HTMLDivElement | null>(null);
  const [empaques, setEmpaques] = useState<Empaque[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [referenceDataMessage, setReferenceDataMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form state
  const [vehiculo, setVehiculo] = useState<Vehiculo>(Vehiculo.Amarok);
  const [empaqueId, setEmpaqueId] = useState<string>('');
  const [selectedTecnicos, setSelectedTecnicos] = useState<string[]>([]);
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
  const [produccionEtiquetada, setProduccionEtiquetada] = useState<string>('');
  const [condicionFruta, setCondicionFruta] = useState<string>('');
  const [comentarios, setComentarios] = useState<string>('');

  // Dynamic Structure Items
  const [estructura, setEstructura] = useState<ItemEstructura[]>([]);
  const [openMotivoDropdownIdx, setOpenMotivoDropdownIdx] = useState<number | null>(null);

  // Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasSignature, setHasSignature] = useState<boolean>(false);

  // PDF Preview Modal State
  const [showPdfPreview, setShowPdfPreview] = useState<boolean>(false);
  const [pendingVisitDTO, setPendingVisitDTO] = useState<CreateVisitDTO | null>(null);

  useEffect(() => {
    loadPrerequisites();
    if (formTopRef.current) {
      formTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  useEffect(() => {
    if (empaques.length > 0 && !empaqueId) {
      handleEmpaqueChange(empaques[0].id);
    }
  }, [empaques]);

  const loadPrerequisites = async () => {
    const [empaquesResult, tecnicosResult] = await Promise.allSettled([
      coreApi.getEmpaques(),
      coreApi.getTecnicos(),
    ]);
    const missing: string[] = [];

    if (empaquesResult.status === 'fulfilled') {
      setEmpaques(empaquesResult.value);
    } else {
      missing.push('empaques y bancos');
    }

    if (tecnicosResult.status === 'fulfilled') {
      setTecnicos(tecnicosResult.value);
      if (user) {
        setSelectedTecnicos([user.id]);
      } else if (tecnicosResult.value.length > 0) {
        setSelectedTecnicos([tecnicosResult.value[0].id]);
      }
    } else {
      missing.push('técnicos');
    }

    if (missing.length > 0) {
      setReferenceDataMessage(
        `No hay una copia local de ${missing.join(' y ')}. Conecte la aplicación al servidor para descargarlos.`,
      );
    } else if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setReferenceDataMessage('Sin conexión: se están usando los últimos datos guardados en este dispositivo.');
    }
  };

  const handleEmpaqueChange = (empaqueid: string) => {
    setEmpaqueId(empaqueid);
    const empaque = empaques.find((e) => e.id === empaqueid);
    const bancos = empaque?.bancos ?? [];
    const tabla: ItemEstructura[] = bancos.map((banco) => ({
      numero_de_serie: banco.id,
      codigo_motivo: [CodigoMotivo.SRT],
      codigo_origen: CodigoOrden.SZR,
      codigo_res: (Object.values(CodigoResolucion)[0] as CodigoResolucion) ?? '',
      numero_partes: '',
      cantidad: '',
      otras_acciones: '',
      pct_etiquetado_esperado: 100,
      pct_etiquetado_real: 100,
      tiempo_servicio: 15,
    }));
    setEstructura(tabla);
  };

  const handleTiempoServicio = (inicio: string, fin: string) => {
    if (!inicio || !fin) return;

    const [hInicio, mInicio] = inicio.split(':').map(Number);
    const [hFin, mFin] = fin.split(':').map(Number);

    if (isNaN(hInicio) || isNaN(mInicio) || isNaN(hFin) || isNaN(mFin)) return;

    const inicioEnMinutos = hInicio * 60 + mInicio;
    const finEnMinutos = hFin * 60 + mFin;
    const duracionMinutos = Math.max(0, finEnMinutos - inicioEnMinutos);

    setEstructura((prev) => {
      if (prev.length === 0) return prev;
      const tiempoPorBanco = Number((duracionMinutos / prev.length).toFixed(2));
      return prev.map((item) => ({
        ...item,
        tiempo_servicio: tiempoPorBanco,
      }));
    });
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

  const toggleItemMotivo = (index: number, motivoValue: CodigoMotivo) => {
    setEstructura((prev) => {
      const copy = [...prev];
      const current = copy[index].codigo_motivo;
      const currentList: CodigoMotivo[] = Array.isArray(current)
        ? current
        : current
        ? [current]
        : [];
      const exists = currentList.includes(motivoValue);
      if (exists && currentList.length <= 1) {
        return prev;
      }
      const nextList = exists
        ? currentList.filter((m) => m !== motivoValue)
        : [...currentList, motivoValue];
      copy[index] = { ...copy[index], codigo_motivo: nextList };
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

  const handleSubmit = (e: React.FormEvent) => {
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

    const motivosList = estructura
      .flatMap((item) =>
        Array.isArray(item.codigo_motivo) ? item.codigo_motivo : [item.codigo_motivo]
      )
      .filter((m): m is CodigoMotivo => Boolean(m));
    const origenesList = estructura
      .map((item) => item.codigo_origen)
      .filter((o): o is CodigoOrden => Boolean(o));

    const codigoMotivo = motivosList.length > 0 ? motivosList : [CodigoMotivo.SRT];
    const codigoOrigen = origenesList.length > 0 ? origenesList : [CodigoOrden.EWS];

    const firmaDataUrl = hasSignature && canvasRef.current ? canvasRef.current.toDataURL() : undefined;

    const assignedTecObjs = tecnicos.filter((t) => selectedTecnicos.includes(t.id));
    const assignedNames = assignedTecObjs.map((t) => t.nombre);
    const reportNumber = generateSinclairReportNumber(
      assignedNames.length > 0 ? assignedNames : (user?.nombre || 'REP')
    );

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
      numero: reportNumber,
    };

    setPendingVisitDTO(dto);
    setShowPdfPreview(true);
  };

  const handleConfirmSubmit = async () => {
    if (!pendingVisitDTO) return;

    setIsSubmitting(true);
    const isOnline = await getConnectivityStatus();

    try {
      if (!isOnline) {
        OfflineSyncManager.getInstance().saveOfflineVisit(pendingVisitDTO);
        setSuccessMessage('Visita guardada localmente (Modo Offline). Se sincronizará automáticamente cuando haya conexión.');
        setShowPdfPreview(false);
        setPendingVisitDTO(null);
        resetForm();
        if (onSuccess) onSuccess();
      } else {
        await visitsApi.createVisit(pendingVisitDTO);
        setSuccessMessage('¡Visita y Reporte Sinclair guardados con éxito en el servidor!');
        setShowPdfPreview(false);
        setPendingVisitDTO(null);
        resetForm();
        if (onSuccess) onSuccess();
      }
    } catch {
      OfflineSyncManager.getInstance().saveOfflineVisit(pendingVisitDTO);
      setSuccessMessage('No se pudo conectar con el servidor. Visita guardada de forma segura en cola local offline.');
      setShowPdfPreview(false);
      setPendingVisitDTO(null);
      resetForm();
      if (onSuccess) onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClosePreview = () => {
    if (!isSubmitting) {
      setShowPdfPreview(false);
    }
  };

  const toggleTecnico = (id: string) => {
    setSelectedTecnicos((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev;
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
    setProduccionEtiquetada('');
    setCondicionFruta('');
    setNombreCliente('');
    clearCanvas();
  };

  const selectedEmpaqueObj = empaques.find(
    (e) => e.id === (pendingVisitDTO?.empaque_id || empaqueId)
  );
  const selectedTecnicosObjs = tecnicos.filter((t) =>
    (pendingVisitDTO?.tecnico_ids || selectedTecnicos).includes(t.id)
  );

  return (
    <form id="form-create-visit" onSubmit={handleSubmit} className="space-y-6">
      <div ref={formTopRef} className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900">Nueva Visita</h2>
          <p className="text-xs text-slate-500">Registro de visita y emisión de Reporte Sinclair</p>
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

      {referenceDataMessage && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
          {referenceDataMessage}
        </div>
      )}

      {/* Section 1: Ubicación & Desplazamiento */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          1. Datos de Empaque
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Empaque *</label>
            <select
              id="select-visit-empaque"
              value={empaqueId}
              onChange={(e) => handleEmpaqueChange(e.target.value)}
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
              Seleccione todos los técnicos de la visita
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

      {/* Section 2: Horarios y Tipo de Servicio */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          2. Horarios y Tipo de Servicio
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
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
              onChange={(e) => {
                setHoraInicio(e.target.value);
                handleTiempoServicio(e.target.value, horaFin);
              }}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Hora Fin *</label>
            <input
              type="time"
              value={horaFin}
              onChange={(e) => {
                setHoraFin(e.target.value);
                handleTiempoServicio(horaInicio, e.target.value);
              }}
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
            Servicio realizado fuera de horario laboral habitual
          </label>
        </div>
      </div>

      {/* Section 3: Requerimiento Técnico y Contexto */}
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
              placeholder="Ej. Juan Pérez (Jefe de Producción)"
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

      {/* Section 4: Estructura de Máquinas (ItemEstructura) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              4. Estructura de Máquinas
            </h3>
            <p className="text-[11px] text-slate-400">
              Desglose de equipos intervenidos, rendimiento esperado vs. real y horas de servicio
            </p>
          </div>
        </div>

        {estructura.length === 0 ? (
          <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <p className="text-xs text-slate-500 font-medium mb-2">
              Empaque sin bancos cargados.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {estructura.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs items-end"
              >
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-600">Nº Serie</label>
                  <input
                    type="text"
                    value={item.numero_de_serie}
                    onChange={(e) => handleEstructuraChange(idx, 'numero_de_serie', e.target.value)}
                    className="w-full p-1.5 bg-slate-100 border border-slate-300 rounded text-slate-900 font-mono"
                    readOnly
                  />
                </div>
                <div className="sm:col-span-2 relative">
                  <label className="block text-[10px] font-semibold text-slate-600">Cód. Motivo</label>
                  {(() => {
                    const currentList = Array.isArray(item.codigo_motivo)
                      ? item.codigo_motivo
                      : [item.codigo_motivo];
                    const selectedEntries = Object.entries(CodigoMotivo).filter(([k, v]) =>
                      currentList.some((m) => m === v || String(m) === k)
                    );
                    const displayLabel =
                      selectedEntries.length === 1
                        ? `${selectedEntries[0][0]} - ${selectedEntries[0][1]}`
                        : selectedEntries.map(([k]) => k).join(', ') || 'Seleccionar...';

                    return (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMotivoDropdownIdx(openMotivoDropdownIdx === idx ? null : idx)
                          }
                          className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 flex items-center justify-between text-left"
                        >
                          <span className="truncate">{displayLabel}</span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
                        </button>
                        {openMotivoDropdownIdx === idx && (
                          <div className="absolute z-20 mt-1 w-56 bg-white border border-slate-300 rounded-lg shadow-lg py-1 max-h-60 overflow-auto">
                            {Object.entries(CodigoMotivo).map(([k, v]) => {
                              const isSelected = currentList.some(
                                (m) => m === v || String(m) === k
                              );
                              return (
                                <label
                                  key={k}
                                  className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-slate-100 cursor-pointer text-xs text-slate-800"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleItemMotivo(idx, v)}
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span>
                                    {k} - {v}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-600">Cód. Origen</label>
                  <select
                    value={item.codigo_origen}
                    onChange={(e) => handleEstructuraChange(idx, 'codigo_origen', e.target.value as CodigoOrden)}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                  >
                    {Object.entries(CodigoOrden).map(([k, v]) => (
                      <option key={k} value={k}>
                        {k} - {v}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-600">Cód. Res.</label>
                  <select
                    value={item.codigo_res}
                    onChange={(e) =>
                      handleEstructuraChange(idx, 'codigo_res', e.target.value as CodigoResolucion)
                    }
                    className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                  >
                    {Object.entries(CodigoResolucion).map(([k, v]) => {
                      const cleanCode = k.replace(/^_/, '');
                      return (
                        <option key={k} value={v}>
                          {cleanCode} - {v}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-600">Nº Partes</label>
                  <input
                    type="text"
                    placeholder="Identificador de piezas..."
                    value={item.numero_partes}
                    onChange={(e) => handleEstructuraChange(idx, 'numero_partes', e.target.value)}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded text-slate-900"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-600">Cant.</label>
                  <input
                    type="text"
                    value={item.cantidad}
                    onChange={(e) => handleEstructuraChange(idx, 'cantidad', e.target.value)}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded text-slate-900"
                    placeholder="Cantidad de piezas usadas"
                  />
                </div>
                <div className="sm:col-span-6">
                  <label className="block text-[10px] font-semibold text-slate-600">Acción Realizada</label>
                  <input
                    type="text"
                    placeholder="Descripción del servicio..."
                    value={item.otras_acciones}
                    onChange={(e) => handleEstructuraChange(idx, 'otras_acciones', e.target.value)}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded text-slate-900"
                  />
                </div>
                <div className="sm:col-span-2">
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
                <div className="sm:col-span-2">
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
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-600">Tiempo de servicio (minutos)</label>
                  <input
                    type="number"
                    step="any"
                    value={item.tiempo_servicio}
                    onChange={(e) =>
                      handleEstructuraChange(idx, 'tiempo_servicio', Number(e.target.value))
                    }
                    className="w-full p-1.5 bg-white border border-slate-300 rounded text-slate-900 font-mono"
                  />
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
          5. Firmas y Observaciones
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nombre del encargado *
            </label>
            <input
              type="text"
              id="input-client-name"
              value={nombreCliente}
              onChange={(e) => setNombreCliente(e.target.value)}
              placeholder="Ej. Roberto Sánchez"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 mb-3"
              required
            />

            <label className="block font-semibold text-slate-700 mb-1">
              Comentarios u observaciones adicionales
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
              <label className="font-semibold text-slate-700">Firma digital del encargado</label>
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
            Registrar visita y previsualizar reporte
          </button>
        </div>
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

      {/* Modal for PDF Preview and Accept / Reject confirmation */}
      <VisitPdfPreviewModal
        isOpen={showPdfPreview}
        onClose={handleClosePreview}
        onConfirm={handleConfirmSubmit}
        visitData={pendingVisitDTO}
        empaqueName={selectedEmpaqueObj?.nombre}
        empaqueUbicacion={selectedEmpaqueObj?.ubicacion}
        tecnicosNames={selectedTecnicosObjs.map((t) => t.nombre)}
        isSubmitting={isSubmitting}
      />
    </form>
  );
};
