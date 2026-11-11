/**
 * SinclairReportModal Component
 * Displays the formal technical maintenance visit report (RF02)
 * Adheres strictly to SDD and Clean Code specifications
 */

import React from "react";
import {
  X,
  Printer,
  CheckCircle,
  Clock,
  MapPin,
  User,
  Car,
  Wrench,
  Download,
  PhoneOutgoing,
} from "lucide-react";
import { Visita } from "../../types/domain";
import { downloadVisitPDF, generateVisitPDF } from "../../utils/pdfGenerator";
import { isNativeApp } from "../../platform/nativePlatform";
import { exportFileNativeSafely } from "../../platform/nativeFileExport";

interface SinclairReportModalProps {
  visita: Visita | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatTime = (timeStr?: string): string => {
  if (!timeStr) return "";
  if (timeStr.includes("T")) {
    const timePart = timeStr.split("T")[1];
    return timePart.substring(0, 5);
  }
  return timeStr.substring(0, 5);
};

export const SinclairReportModal: React.FC<SinclairReportModalProps> = ({
  visita,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !visita) return null;

  const { reporte, empaque, tecnicos } = visita;

  const motivosList = React.useMemo(() => {
    const set = new Set<string>();
    if (reporte.codigo_motivo) {
      if (Array.isArray(reporte.codigo_motivo)) {
        reporte.codigo_motivo.forEach((m) => m && set.add(String(m)));
      } else {
        set.add(String(reporte.codigo_motivo));
      }
    }
    if (reporte.estructura) {
      reporte.estructura.forEach((item) => {
        if (!item.codigo_motivo) return;
        if (Array.isArray(item.codigo_motivo)) {
          item.codigo_motivo.forEach((m) => m && set.add(String(m)));
        } else {
          set.add(String(item.codigo_motivo));
        }
      });
    }
    return Array.from(set);
  }, [reporte]);

  const origenesList = React.useMemo(() => {
    const set = new Set<string>();
    if (reporte.codigo_origen) {
      if (Array.isArray(reporte.codigo_origen)) {
        reporte.codigo_origen.forEach((o) => o && set.add(String(o)));
      } else {
        set.add(String(reporte.codigo_origen));
      }
    }
    if (reporte.estructura) {
      reporte.estructura.forEach((item) => {
        if (item.codigo_origen) set.add(String(item.codigo_origen));
      });
    }
    return Array.from(set);
  }, [reporte]);

  const handlePrint = () => {
    const tecNames = visita.tecnicos.map((t) => t.nombre);
    const empName = visita.empaque?.nombre || "";
    const empUbicacion = visita.empaque?.ubicacion || "";
    const visitDTO = {
      vehiculo: visita.vehiculo,
      empaque_id: visita.empaque?.id || "",
      tecnico_ids: visita.tecnicos.map((t) => t.id),
      codigo_motivo: Array.isArray(visita.reporte.codigo_motivo)
        ? visita.reporte.codigo_motivo
        : [visita.reporte.codigo_motivo],
      codigo_origen: [visita.reporte.codigo_origen],
      codigo_tipo_servicio: visita.reporte.codigo_tipo_servicio,
      solicitado_por: visita.solicitado_por,
      motivo: visita.motivo,
      hora_inicio: visita.reporte.hora_inicio,
      hora_fin: visita.reporte.hora_fin,
      fuera_de_hora: visita.reporte.fuera_de_hora,
      comentarios: visita.reporte.comentarios,
      estructura: visita.reporte.estructura,
      hora_llamada: visita.reporte.hora_llamada,
      nombre_cliente: visita.reporte.nombre_cliente,
      firma_cliente: visita.reporte.firma_cliente,
      produccion_etiquetada: visita.reporte.produccion_etiquetada,
      condicion_fruta: visita.reporte.condicion_fruta,
      id: visita.id,
      numero: visita.reporte.numero,
    };
    const doc = generateVisitPDF(
      visitDTO,
      visita.reporte.numero,
      tecNames,
      empName,
      empUbicacion
    );
    if (isNativeApp()) {
      // Android WebView cannot print: hand the PDF to a viewer/print app.
      exportFileNativeSafely(doc.output("blob"), `Reporte_Sinclair_${visita.reporte.numero}.pdf`, {
        persist: false,
        dialogTitle: "Abrir o imprimir reporte con...",
      });
      return;
    }
    doc.autoPrint();
    const blobUrl = doc.output("bloburl");
    window.open(blobUrl, "_blank");
  };

  const handleDownloadPDF = () => {
    downloadVisitPDF(visita);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs">
      <div
        id="modal-sinclair-report"
        className="bg-white text-slate-900 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95"
      >
        {/* Sticky Header Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 flex-shrink-0 no-print">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg font-mono text-xs font-bold">
              Reporte sinclair
            </span>
            {visita.estado_sincronizacion === "synced" ? (
              <span className="flex items-center gap-1 text-emerald-700 text-xs font-semibold">
                <CheckCircle className="w-3.5 h-3.5" /> Sincronizado
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-600 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5" /> Local / Pendiente
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-close-report-modal"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
              aria-label="Cerrar Reporte"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Report Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4 text-xs">
          {/* Printable Report Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 pb-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Informe de servicio y mantenimiento de campo
              </h1>
            </div>
            <div className="text-right mt-2 sm:mt-0 text-xs text-slate-600">
              <div>
                <strong>Fecha Visita:</strong>{" "}
                {new Date(visita.fecha).toLocaleDateString()}
              </div>
              <div>
                <strong>Reporte Nº:</strong> {reporte.numero}
              </div>
            </div>
          </div>

          {/* General Data Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
            <div>
              <div className="text-slate-500 font-semibold mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" /> Empaque
              </div>
              <div className="font-bold text-slate-900">
                {empaque.nombre}{" "}
                <span className="text-slate-600"> ({empaque.ubicacion})</span>
              </div>
              <div className="text-slate-500 font-semibold mb-1 mt-2 flex items-center gap-1">
                <PhoneOutgoing className="w-3.5 h-3.5 text-blue-600" /> Solicitado por
              </div>
              <div className="font-bold text-slate-900">{visita.solicitado_por}</div>
            </div>
            <div>
              <div className="text-slate-500 font-semibold mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-600" /> Técnicos
              </div>
              <div className="font-bold text-slate-900">
                {tecnicos.map((t) => t.nombre).join(", ")}
              </div>
              <div className="text-slate-500 font-semibold mb-1 mt-2 flex items-center gap-1">
                <Car className="w-3.5 h-3.5 text-blue-600" /> Vehículo
              </div>
              <div className="font-bold text-slate-900">
                {visita.vehiculo}
              </div>
            </div>
          </div>

          {/* Sinclair Codes Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">
                Motivo
              </span>
              <span className="font-semibold text-blue-950">
                {motivosList.length > 0 ? motivosList.join(", ") : "-"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">
                Origen/Orden
              </span>
              <span className="font-semibold text-blue-950">
                {origenesList.length > 0 ? origenesList.join(", ") : "-"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">
                Tipo Servicio
              </span>
              <span className="font-semibold text-blue-950">
                {reporte.codigo_tipo_servicio}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">
                Horarios
              </span>
              <span className="font-semibold text-blue-950">
                {formatTime(reporte.hora_inicio)} a {formatTime(reporte.hora_fin)}{" "}
                {reporte.fuera_de_hora && "(Fuera de hora)"}
              </span>
            </div>
          </div>

          {/* Motivo & Context */}
          <div className="text-xs">
            <div className="font-bold text-slate-700 mb-1">
              Motivo Técnico de la Visita:
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800">
              {visita.motivo}
            </div>
          </div>

          {/* Structure Breakdown Table */}
          <div>
            <div className="font-bold text-slate-700 text-xs mb-1.5 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-blue-600" />
              Estructura de Componentes e Intervenciones
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Numero de serie</th>
                    <th className="p-2.5">Codigo del motivo</th>
                    <th className="p-2.5">Codigo de origen</th>
                    <th className="p-2.5">Codigo de la res</th>
                    <th className="p-2.5">Numero de partes sustituidas</th>
                    <th className="p-2.5">Cant</th>
                    <th className="p-2.5">% Esperado</th>
                    <th className="p-2.5">% Real</th>
                    <th className="p-2.5">Horas</th>
                    <th className="p-2.5">Acciones Realizadas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reporte.estructura.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="p-4 text-center text-slate-400 italic"
                      >
                        Sin ítems de estructura detallados.
                      </td>
                    </tr>
                  ) : (
                    reporte.estructura.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5  font-medium">
                          {item.numero_de_serie}
                        </td>
                        <td className="p-2.5  font-medium">
                          {Array.isArray(item.codigo_motivo)
                            ? item.codigo_motivo.join(", ")
                            : item.codigo_motivo}
                        </td>
                        <td className="p-2.5  font-medium">
                          {item.codigo_origen}
                        </td>
                        <td className="p-2.5  font-medium">
                          {item.codigo_res}
                        </td>
                        <td className="p-2.5 font-medium">
                          {item.numero_partes}
                        </td>
                        <td className="p-2.5">{item.cantidad}</td>
                        <td className="p-2.5">
                          {item.pct_etiquetado_esperado}%
                        </td>
                        <td className="p-2.5">
                          {item.pct_etiquetado_real}%
                        </td>
                        <td className="p-2.5">{item.tiempo_servicio} h</td>
                        <td className="p-2.5 text-slate-600">
                          {item.otras_acciones}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Comments & Fruit Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="font-bold text-slate-700 mb-1">
                Producción y Fruta:
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 space-y-1">
                <div>
                  <strong>Prod. Etiquetada:</strong>{" "}
                  {reporte.produccion_etiquetada || "Normal"}
                </div>
                <div>
                  <strong>Condición de fruta:</strong>{" "}
                  {reporte.condicion_fruta || "Óptima"}
                </div>
              </div>
            </div>
            <div>
              <div className="font-bold text-slate-700 mb-1">
                Comentarios del Técnico:
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 min-h-[56px]">
                {reporte.comentarios || "Sin observaciones adicionales."}
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-6 text-xs text-center">
            <div>
              <div className="h-16 border-b border-slate-300 flex items-end justify-center pb-1">
                <span className="font-serif italic text-slate-600">
                  {tecnicos.map((t) => t.nombre).join(", ")}
                </span>
              </div>
              <div className="mt-1 font-bold text-slate-800">
                Firma Técnico(s) Sinclair
              </div>
            </div>
            <div>
              <div className="h-16 border-b border-slate-300 flex items-end justify-center pb-1">
                {reporte.firma_cliente ? (
                  <img
                    src={reporte.firma_cliente}
                    alt="Firma cliente"
                    className="max-h-14 object-contain mx-auto"
                  />
                ) : (
                  <span className="font-serif italic text-slate-600">
                    {reporte.nombre_cliente}
                  </span>
                )}
              </div>
              <div className="mt-1 font-bold text-slate-800">
                Conforme Cliente: {reporte.nombre_cliente}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Modal Bottom Footer with Close button */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0 no-print">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Imprimir Reporte
          </button>
          <button
            id="btn-download-pdf-report"
            type="button"
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Descargar PDF
          </button>
          <button
            id="btn-bottom-close-report"
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition shadow-xs cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
