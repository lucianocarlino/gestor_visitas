/**
 * TechniciansView Component
 * Staff roster of certified field technicians with Admin-only edit and password management.
 * Adheres strictly to SDD and Clean Code standards.
 */

import React, { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  Mail,
  ShieldCheck,
  Award,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  Edit2,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { coreApi } from '../../services/apiClient';
import { Tecnico, StatusTecnico } from '../../types/domain';
import { useAuth } from '../../context/AuthContext';

export const TechniciansView: React.FC = () => {
  const { user, isAdmin, refreshTecnicos: refreshAuthTecnicos } = useAuth();
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTecnico, setEditingTecnico] = useState<Tecnico | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    id: '',
    nombre: '',
    email: '',
    password: 'sinclair123',
    cumpleanos: '1990-05-15',
    rol: 'tecnico' as 'tecnico' | 'admin',
    estado: StatusTecnico.DISPONIBLE,
  });

  const [editFormData, setEditFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    cumpleanos: '',
    rol: 'tecnico' as 'tecnico' | 'admin',
    estado: StatusTecnico.DISPONIBLE,
  });

  useEffect(() => {
    loadTecnicos();
  }, []);

  const loadTecnicos = async () => {
    setIsLoading(true);
    try {
      const data = await coreApi.getTecnicos();
      setTecnicos(data);
    } catch {
      // offline fallback
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newTec: Partial<Tecnico> = {
        id: formData.id || `TEC-${Date.now().toString().slice(-4)}`,
        nombre: formData.nombre,
        email:
          formData.email ||
          `${formData.nombre.toLowerCase().replace(/\s+/g, '.')}@sinclair-service.com`,
        password: formData.password || 'sinclair123',
        cumpleanos: formData.cumpleanos,
        rol: formData.rol,
        estado: formData.estado,
        ultima_conexion: new Date().toISOString(),
      };
      await coreApi.createTecnico(newTec);
      setIsCreateModalOpen(false);
      await loadTecnicos();
      await refreshAuthTecnicos();
      showNotification(`Técnico ${newTec.nombre} creado con éxito.`);
      setFormData({
        id: '',
        nombre: '',
        email: '',
        password: 'sinclair123',
        cumpleanos: '1990-05-15',
        rol: 'tecnico',
        estado: StatusTecnico.DISPONIBLE,
      });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al crear técnico');
    }
  };

  const handleOpenEdit = (tec: Tecnico) => {
    setEditingTecnico(tec);
    setEditFormData({
      nombre: tec.nombre,
      email: tec.email,
      password: tec.password || 'sinclair123',
      cumpleanos: tec.cumpleanos,
      rol: tec.rol,
      estado: tec.estado,
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTecnico) return;

    try {
      await coreApi.updateTecnico(editingTecnico.id, {
        nombre: editFormData.nombre,
        email: editFormData.email,
        password: editFormData.password || 'sinclair123',
        cumpleanos: editFormData.cumpleanos,
        rol: editFormData.rol,
        estado: editFormData.estado,
      });
      setEditingTecnico(null);
      await loadTecnicos();
      await refreshAuthTecnicos();
      showNotification(`Datos del técnico ${editFormData.nombre} actualizados.`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al actualizar técnico');
    }
  };

  const filteredTecnicos = tecnicos.filter(
    (t) =>
      t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {feedbackMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Cuerpo Técnico Certificado
          </h2>
          <p className="text-xs text-slate-500">
            Técnicos habilitados para mantenimiento preventivo, correctivo y reemplazo de cabezales
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar técnico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {isAdmin ? (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              Nuevo Técnico
            </button>
          ) : (
            <div className="text-[11px] text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 font-medium">
              Solo Administrador puede crear técnicos
            </div>
          )}
        </div>
      </div>

      {/* Technicians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTecnicos.map((tec) => (
          <div
            key={tec.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-base border border-indigo-100">
                    {tec.nombre
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{tec.nombre}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {tec.id}</span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    tec.estado === StatusTecnico.DISPONIBLE
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {tec.estado}
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="capitalize font-medium">Rol: {tec.rol}</span>
                  </div>
                  {tec.rol === 'admin' && (
                    <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-300 font-bold px-1.5 py-0.2 rounded font-mono">
                      ADMIN
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{tec.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Cumpleaños: {tec.cumpleanos}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>Última conexión: {new Date(tec.ultima_conexion).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Admin Edit Button */}
            {isAdmin && (
              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  id={`btn-edit-tecnico-${tec.id}`}
                  onClick={() => handleOpenEdit(tec)}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-bold rounded-xl text-xs border border-slate-200 hover:border-indigo-200 transition flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Editar Perfil &amp; Clave
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Modal with Password Field */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                Alta de Técnico de Campo
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Identificador / Código</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: TEC-04"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Marcelo Torres"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="marcelo.torres@sinclair-service.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-600" />
                  Contraseña de Acceso *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Contraseña del usuario..."
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-3 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Rol</label>
                  <select
                    value={formData.rol}
                    onChange={(e) => setFormData({ ...formData, rol: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold"
                  >
                    <option value="tecnico">Técnico</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value={StatusTecnico.DISPONIBLE}>Disponible</option>
                    <option value={StatusTecnico.VACACIONES}>Vacaciones</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Fecha de Cumpleaños</label>
                <input
                  type="date"
                  value={formData.cumpleanos}
                  onChange={(e) => setFormData({ ...formData, cumpleanos: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Guardar Técnico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal (Admin Only) */}
      {editingTecnico && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-indigo-600" />
                  Editar Técnico: {editingTecnico.nombre}
                </h3>
                <span className="text-[10px] text-indigo-800 font-mono">ID: {editingTecnico.id}</span>
              </div>
              <button
                onClick={() => setEditingTecnico(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={editFormData.nombre}
                  onChange={(e) => setEditFormData({ ...editFormData, nombre: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-600" />
                  Actualizar Contraseña de Acceso
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Dejar igual o ingresar nueva..."
                    value={editFormData.password}
                    onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                    className="w-full pl-3 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Rol</label>
                  <select
                    value={editFormData.rol}
                    onChange={(e) => setEditFormData({ ...editFormData, rol: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold"
                  >
                    <option value="tecnico">Técnico</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estado</label>
                  <select
                    value={editFormData.estado}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, estado: e.target.value as any })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value={StatusTecnico.DISPONIBLE}>Disponible</option>
                    <option value={StatusTecnico.VACACIONES}>Vacaciones</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Fecha de Cumpleaños</label>
                <input
                  type="date"
                  value={editFormData.cumpleanos}
                  onChange={(e) => setEditFormData({ ...editFormData, cumpleanos: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTecnico(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
