/**
 * VisitPdfPreviewModal Component
 * Previews the generated Sinclair technical report PDF before accepting or rejecting submission.
 * Supports online and offline submission confirmation, direct download, and printing.
 * Adheres strictly to SDD, Clean Code, and engineering rules (rules.md).
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  X,
  Printer,
  Download,
  CheckCircle,
  Clock,
  FileText,
  Check,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { CreateVisitDTO } from '../../types/domain';
import { generateVisitPDF } from '../../utils/pdfGenerator';
import jsPDF from 'jspdf';

interface VisitPdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  visitData: CreateVisitDTO | null;
  empaqueName?: string;
  empaqueUbicacion?: string;
  tecnicosNames?: string[];
  isSubmitting?: boolean;
}

export const VisitPdfPreviewModal: React.FC<VisitPdfPreviewModalProps> = ({
    isOpen,
  onClose,
  onConfirm,
  visitData,
  empaqueName,
  empaqueUbicacion,
  tecnicosNames,
  isSubmitting = false,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<jsPDF | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
    };
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  const cleanUpPdfUrl = useCallback(() => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  }, [pdfUrl]);

  useEffect(() => {
    if (!isOpen || !visitData) {
      cleanUpPdfUrl();
      setPdfDoc(null);
      return;
    }

    try {
      setIsGeneratingPdf(true);
      const doc = generateVisitPDF(
        visitData,
        visitData.numero,
        tecnicosNames,
        empaqueName,
        empaqueUbicacion
      );
      setPdfDoc(doc);
      const blob = doc.output('blob');
      const objectUrl = URL.createObjectURL(blob);
      setPdfUrl(objectUrl);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al generar PDF';
      console.error('Error generando vista previa de PDF:', errorMessage);
    } finally {
      setIsGeneratingPdf(false);
    }

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [isOpen, visitData, tecnicosNames, empaqueName, empaqueUbicacion]);

  if (!isOpen || !visitData) return null;

  const handleDownload = () => {
    if (!pdfDoc) return;
    const empaqueClean = (empaqueName || 'Empaque')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 20);
    const dateStr = new Date().toISOString().split('T')[0];
    const numPart = visitData.numero ? `${visitData.numero}_` : '';
    const fileName = `Reporte_Sinclair_${numPart}${empaqueClean}_${dateStr}.pdf`;
    pdfDoc.save(fileName);
  };

  const handlePrint = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.focus();
        iframeRef.current.contentWindow.print();
        return;
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Fallo en impresión iframe';
        console.warn('Fallback a autoPrint:', errorMsg);
      }
    }
    if (pdfDoc) {
      pdfDoc.autoPrint();
      window.open(pdfDoc.output('bloburl'), '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div
        id="modal-pdf-preview"
        className="bg-white text-slate-900 rounded-2xl sm:rounded-3xl w-full max-w-5xl h-[94vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
              <FileText className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm sm:text-base text-slate-900">
                  Vista Previa del Reporte
                </span>
                {visitData.numero && (
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-md font-mono text-xs font-bold">
                    FSR #{visitData.numero}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Revise el reporte antes de confirmarlo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isOnline ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
                <CheckCircle className="w-3.5 h-3.5" /> En línea (API)
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold">
                <Clock className="w-3.5 h-3.5" /> Offline (Guardado local)
              </span>
            )}

            <button
              id="btn-close-preview-modal"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition disabled:opacity-50"
              aria-label="Cerrar vista previa"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Summary Bar */}
        <div className="px-4 sm:px-6 py-2 bg-slate-100/80 border-b border-slate-200 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
            <div>
              <span className="text-slate-400 font-medium">Empaque: </span>
              <strong className="text-slate-800">{empaqueName || visitData.empaque_id}</strong>
            </div>
            {tecnicosNames && tecnicosNames.length > 0 && (
              <div>
                <span className="text-slate-400 font-medium">Técnico(s): </span>
                <strong className="text-slate-800">{tecnicosNames.join(', ')}</strong>
              </div>
            )}
            <div>
              <span className="text-slate-400 font-medium">Horario: </span>
              <strong className="text-slate-800">
                {visitData.hora_inicio} - {visitData.hora_fin}
              </strong>
            </div>
          </div>
          <div className="sm:hidden">
            {isOnline ? (
              <span className="text-emerald-700 text-[11px] font-semibold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> En línea
              </span>
            ) : (
              <span className="text-amber-700 text-[11px] font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3" /> Offline
              </span>
            )}
          </div>
        </div>

        {/* PDF Frame */}
        <div className="flex-1 bg-slate-200/70 p-2 sm:p-4 overflow-hidden flex flex-col relative min-h-0">
          {isGeneratingPdf ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-xs font-semibold">Generando vista previa del reporte...</p>
            </div>
          ) : pdfUrl ? (
            <iframe
              ref={iframeRef}
              src={`${pdfUrl}#toolbar=0&navpanes=0`}
              title="Vista previa del Reporte Sinclair PDF"
              className="w-full h-full rounded-xl border border-slate-300 bg-white shadow-sm flex-1"
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-500">
              <p className="text-xs font-medium">No se pudo cargar la vista previa del documento.</p>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePrint}
              disabled={!pdfDoc || isSubmitting}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
            <button
              id="btn-download-preview-pdf"
              type="button"
              onClick={handleDownload}
              disabled={!pdfDoc || isSubmitting}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Descargar PDF
            </button>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              id="btn-reject-preview-modal"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition border border-slate-300 disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              Volver a editar
            </button>

            <button
              id="btn-confirm-submit-modal"
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting || !pdfDoc}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50 ${
                isOnline
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                  : 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {isOnline ? 'Confirmar y Enviar' : 'Confirmar y Guardar Offline'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
