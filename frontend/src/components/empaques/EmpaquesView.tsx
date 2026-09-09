/**
 * EmpaquesView Component
 * View and manage Packing Plants, distances, bank configs, and >15 days unvisited alerts (RF10, RF11, RF15)
 * Adheres strictly to SDD and Clean Code standards with Admin-only edit protection.
 */

import React, { useEffect, useState } from "react";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Calendar,
  Layers,
  Search,
  CheckCircle2,
  Navigation,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { coreApi } from "../../services/apiClient";
import { Empaque } from "../../types/domain";
import { EmpaqueModal } from "./EmpaqueModal";
import { useAuth } from "../../context/AuthContext";

export const EmpaquesView: React.FC = () => {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const [empaques, setEmpaques] = useState<Empaque[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEmpaque, setEditingEmpaque] = useState<Empaque | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [emps] = await Promise.all([
        coreApi.getEmpaques(),
      ]);
      setEmpaques(emps);
    } catch {
      // offline fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    if (!isAdmin) {
      alert(
        "Acceso denegado: Solo los administradores pueden crear nuevos empaques.",
      );
      return;
    }
    setEditingEmpaque(null);
    setIsModalOpen(true);
  };

  const handleEdit = (emp: Empaque) => {
    if (!isAdmin) {
      alert(
        "Acceso denegado: Solo los administradores pueden modificar los datos de los empaques.",
      );
      return;
    }
    setEditingEmpaque(emp);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!isAdmin) {
      alert(
        "Acceso denegado: Solo los administradores pueden eliminar empaques.",
      );
      return;
    }
    if (!window.confirm(`¿Está seguro de eliminar el empaque "${name}"?`))
      return;
    try {
      await coreApi.deleteEmpaque(id);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error al eliminar empaque");
    } finally {
        loadData();
    }
  };

  const filtered = empaques.filter((e) => {
    const term = searchTerm.toLowerCase();
    return (
      e.nombre.toLowerCase().includes(term) ||
      e.ubicacion.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">

      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre de empaque o localidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {isAdmin ? (
            <button
              id="btn-add-empaque"
              onClick={handleCreate}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Plus className="w-4 h-4" /> Nuevo Empaque
            </button>
          ) : (
            <div className="text-[11px] text-slate-500 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-medium flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            </div>
          )}
        </div>
      </div>

      {/* Grid of Empaques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((emp) => {
          const totalLineas = emp.bancos[0].lineas;

          return (
            <div
              key={emp.id}
              id={`card-empaque-${emp.id}`}
              className={`bg-white p-5 rounded-2xl border transition shadow-xs flex flex-col justify-between `}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        {emp.nombre}
                        {alert && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            {`Sin visitas`}
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-500">{emp.ubicacion}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold flex-shrink-0 ${
                      emp.servicio
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {emp.servicio ? "Servicio Activo" : "Sin Abono"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl text-xs text-slate-700 mb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      Distancia
                    </span>
                    <span className="font-medium flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-slate-400" />{" "}
                      {emp.distancia} km
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      Bancos
                    </span>
                    <span className="font-medium flex items-center gap-1">
                      <Layers className="w-3 h-3 text-slate-400" />{" "}
                      {emp.bancos?.length || 0} ({totalLineas} líneas)
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      Última Visita
                    </span>
                    <span className="font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {emp.ultima_visita
                        ? new Date(emp.ultima_visita).toLocaleDateString()
                        : "Ninguna"}
                    </span>
                  </div>
                </div>

                {/* Bancos Preview */}
                {emp.bancos && emp.bancos.length > 0 && (
                  <div className="text-[11px] text-slate-500 mb-2">
                    <span className="font-semibold text-slate-700">
                      Bancos:{" "}
                    </span>
                    {emp.bancos
                      .map((b) => `${b.id} (${b.lineas} líneas)`)
                      .join(" · ")}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="text-[11px] text-slate-400 font-mono">
                </div>

                {isAdmin ? (
                  <div className="flex items-center gap-2">
                    <button
                      id={`btn-edit-empaque-${emp.id}`}
                      onClick={() => handleEdit(emp)}
                      className="px-2.5 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                      title="Editar empaque y bancos"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Editar
                    </button>
                    <button
                      id={`btn-delete-empaque-${emp.id}`}
                      onClick={() => handleDelete(emp.id, emp.nombre)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Eliminar empaque"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <EmpaqueModal
        key={editingEmpaque?.id || "new-empaque"}
        empaque={editingEmpaque}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};
