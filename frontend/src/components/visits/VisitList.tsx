/**
 * VisitList Component
 * Displays recorded visits, Sinclair report viewer, and sync status
 * Adheres strictly to SDD and Clean Code specifications
 */

import React, { useEffect, useState } from 'react';
import {
  FileText,
  Search,
  Calendar,
  Eye,
  CheckCircle,
  Clock,
  Car,
  User,
  MapPin,
  RefreshCw,
  Download,
} from 'lucide-react';
import { visitsApi } from '../../services/apiClient';
import { Visita } from '../../types/domain';
import { SinclairReportModal } from './SinclairReportModal';
import { downloadVisitPDF } from '../../utils/pdfGenerator';

interface VisitListProps {
  onNewVisitClick?: () => void;
}

export const VisitList: React.FC<VisitListProps> = ({ onNewVisitClick }) => {
  const [visits, setVisits] = useState<Visita[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedVisit, setSelectedVisit] = useState<Visita | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    loadVisits();
  }, []);

  const loadVisits = async () => {
    setIsLoading(true);
    try {
      const data = await visitsApi.getAllVisits();
      setVisits(data);
    } catch {
      // offline fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenReport = (visit: Visita) => {
    setSelectedVisit(visit);
    setIsModalOpen(true);
  };

  const filteredVisits = visits.filter((v) => {
    const term = searchTerm.toLowerCase();
    const empName = v.empaque.nombre.toLowerCase();
    const tecNames = v.tecnicos.map((t) => t.nombre.toLowerCase()).join(' ');
    const motivo = v.motivo.toLowerCase();
    const num = String(v.reporte?.numero || '');
    return (
      empName.includes(term) ||
      tecNames.includes(term) ||
      motivo.includes(term) ||
      num.includes(term)
    );
  });

  return (
    <div className="space-y-4">
      {/* Search & Actions Header */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            id="input-search-visits"
            placeholder="Buscar por empaque, técnico, motivo o Nº de reporte..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadVisits}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
            title="Recargar lista"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          {onNewVisitClick && (
            <button
              onClick={onNewVisitClick}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              + Nueva Visita
            </button>
          )}
        </div>
      </div>

      {/* Visits Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Nº Reporte</th>
                <th className="p-3.5">Fecha</th>
                <th className="p-3.5">Empaque</th>
                <th className="p-3.5">Técnicos</th>
                <th className="p-3.5">Motivo Sinclair</th>
                <th className="p-3.5">Vehículo</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVisits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                    {isLoading ? 'Cargando visitas...' : 'No se encontraron visitas registradas.'}
                  </td>
                </tr>
              ) : (
                filteredVisits.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-mono font-bold text-blue-700">
                      #{v.reporte.numero}
                    </td>
                    <td className="p-3.5 text-slate-600 whitespace-nowrap">
                      {new Date(v.fecha).toLocaleDateString()}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900">{v.empaque.nombre}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                        {v.empaque.ubicacion}
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-700">
                      {v.tecnicos.map((t) => t.nombre).join(', ')}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-medium text-[11px]">
                        {v.reporte.codigo_motivo}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">{v.reporte.codigo_origen}</div>
                    </td>
                    <td className="p-3.5 text-slate-600">{v.vehiculo}</td>
                    <td className="p-3.5">
                      {v.estado_sincronizacion === 'synced' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <CheckCircle className="w-3.5 h-3.5" /> Sincronizado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                          <Clock className="w-3.5 h-3.5" /> En Cola Local
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          id={`btn-view-report-${v.id}`}
                          onClick={() => handleOpenReport(v)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold rounded-lg transition"
                        >
                          <Eye className="w-3.5 h-3.5" /> Ver Reporte
                        </button>
                        <button
                          id={`btn-download-pdf-${v.id}`}
                          onClick={() => downloadVisitPDF(v)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 transition"
                          title="Descargar PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal View */}
      <SinclairReportModal
        visita={selectedVisit}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
