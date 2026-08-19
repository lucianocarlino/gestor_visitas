/**
 * FrenosView Component
 * View and manage existing brakes, statuses, assigned cabezal, and swap history (RF08, RF09, RF12, RF20)
 * Adheres strictly to SDD and Clean Code standards
 */

import React, { useEffect, useState } from 'react';
import {
  Disc,
  Plus,
  Trash2,
  MapPin,
  History,
  Calendar,
  Search,
  Cpu,
} from 'lucide-react';
import { coreApi } from '../../services/apiClient';
import { Cambio, Empaque, Freno, Movimiento, Status } from '../../types/domain';
import { MachineModal } from './MachineModal';

export const FrenosView: React.FC = () => {
  const [frenos, setFrenos] = useState<Freno[]>([]);
  const [empaques, setEmpaques] = useState<Empaque[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

  // History modal
  const [selectedFreno, setSelectedFreno] = useState<Freno | null>(null);
  const [cambios, setCambios] = useState<Cambio[]>([]);
  const [movements, setMovements] = useState<Movimiento[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [frns, emps] = await Promise.all([
        coreApi.getFrenos(),
        coreApi.getEmpaques(),
      ]);
      setFrenos(frns);
      setEmpaques(emps);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`¿Está seguro de eliminar el Freno ${id}?`)) return;
    try {
      await coreApi.deleteFreno(id);
      loadData();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error al eliminar');
    }
  };

  const handleOpenHistory = async (freno: Freno) => {
    setSelectedFreno(freno);
    setIsHistoryOpen(true);
    try {
      const [allCambios, movs] = await Promise.all([
        coreApi.getCambios(),
        coreApi.getAllMovements(),
      ]);
      setCambios(
        allCambios.filter(
          (c) => c.retirado_freno_id === freno.id || c.instalado_freno_id === freno.id
        )
      );
      setMovements(movs.filter((m) => m.machine_id === freno.id));
    } catch {
      // fallback
    }
  };

  const getEmpaqueName = (id: string) => {
    const found = empaques.find((e) => e.id === id);
    return found ? found.nombre : id;
  };

  const filtered = frenos.filter((f) => {
    const matchesSearch =
      f.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.cabezal_id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || f.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por ID de freno o cabezal asignado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="all">Todos los estados</option>
            <option value={Status.USING}>En uso</option>
            <option value={Status.READY}>Listo</option>
            <option value={Status.PENDING}>Pendiente</option>
          </select>
        </div>

        <button
          id="btn-add-freno"
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Nuevo Freno
        </button>
      </div>

      {/* Grid of Frenos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((freno) => (
          <div
            key={freno.id}
            id={`card-freno-${freno.id}`}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    <Disc className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{freno.id}</h3>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">
                      Conjunto Freno Sinclair
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    freno.estado === Status.USING
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : freno.estado === Status.READY
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {freno.estado}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Fecha inicio:
                  </span>
                  <span className="font-medium text-slate-900">{freno.fecha_inicio}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Cpu className="w-3 h-3" /> Cabezal actual:
                  </span>
                  <span className="font-mono font-medium text-indigo-700">
                    {freno.cabezal_id || 'En stock / Taller'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={() => handleOpenHistory(freno)}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                <History className="w-3.5 h-3.5" /> Historial de Cambios
              </button>
              <button
                onClick={() => handleDelete(freno.id)}
                className="p-1 text-slate-400 hover:text-rose-600 rounded"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      <MachineModal
        type="Freno"
        empaques={empaques}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={loadData}
      />

      {/* History Modal */}
      {isHistoryOpen && selectedFreno && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative text-slate-900 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Historial de Cambios: Freno {selectedFreno.id}
                </h2>
                <p className="text-xs text-slate-500">
                  Registro de instalaciones, desmontajes y traslados (RF08, RF20)
                </p>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {cambios.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No hay registros de cambio para este freno.</p>
              ) : (
                cambios.map((c) => (
                  <div key={c.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-indigo-700 font-mono">
                        Cabezal {c.cabezal_id} ({c.lugar})
                      </span>
                      <span className="text-slate-500 text-[10px]">{c.fecha}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200 text-slate-700">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Freno Retirado:
                        </span>
                        <span className="font-mono">{c.retirado_freno_id}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Freno Instalado:
                        </span>
                        <span className="font-mono text-emerald-700 font-bold">
                          {c.instalado_freno_id}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-600 mt-2">
                      <strong>Motivo:</strong> {c.motivo}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
