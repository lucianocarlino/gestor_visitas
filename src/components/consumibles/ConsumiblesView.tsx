/**
 * ConsumiblesView Component
 * Inventory management for Sinclair labels, ribbons, and spare parts (RF13, RF14).
 * Adheres strictly to SDD and Clean Code standards with Admin-only edit protection.
 */

import React, { useEffect, useState } from 'react';
import {
  Package,
  Plus,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  ArrowDownRight,
  TrendingDown,
  ShieldAlert,
  Edit2,
  Sliders,
  Check,
  Lock,
} from 'lucide-react';
import { coreApi } from '../../services/apiClient';
import { Consumible } from '../../types/domain';
import { useAuth } from '../../context/AuthContext';

export const ConsumiblesView: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [consumibles, setConsumibles] = useState<Consumible[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Consumible | null>(null);
  const [restockItem, setRestockItem] = useState<{ id: string; name: string } | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(50);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    id: '',
    nombre: '',
    stock: 100,
    es_critico: false,
    stock_minimo: 20,
  });

  const [editFormData, setEditFormData] = useState({
    nombre: '',
    stock: 0,
    es_critico: false,
    stock_minimo: 0,
  });

  useEffect(() => {
    loadConsumibles();
  }, []);

  const loadConsumibles = async () => {
    setIsLoading(true);
    try {
      const data = await coreApi.getConsumibles();
      setConsumibles(data);
    } catch {
      // offline fallback
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Acceso denegado: Solo los administradores pueden crear nuevos consumibles (RF13).');
      return;
    }
    try {
      const newConsumible: Partial<Consumible> = {
        id: formData.id || `CONS-${Date.now().toString().slice(-4)}`,
        nombre: formData.nombre,
        stock: Number(formData.stock),
        es_critico: formData.es_critico,
        stock_minimo: Number(formData.stock_minimo),
      };
      await coreApi.createConsumible(newConsumible);
      setIsModalOpen(false);
      await loadConsumibles();
      showNotification('Consumible creado exitosamente (RF13).');
      setFormData({
        id: '',
        nombre: '',
        stock: 100,
        es_critico: false,
        stock_minimo: 20,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar consumible';
      alert(msg);
    }
  };

  const handleOpenEdit = (item: Consumible) => {
    if (!isAdmin) {
      alert('Acceso denegado: Solo los administradores pueden modificar los umbrales mínimos y datos maestros (RF13).');
      return;
    }
    setEditingItem(item);
    setEditFormData({
      nombre: item.nombre,
      stock: item.stock,
      es_critico: item.es_critico,
      stock_minimo: item.stock_minimo,
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Acceso denegado: Solo los administradores pueden modificar consumibles (RF13).');
      return;
    }
    if (!editingItem) return;

    try {
      const updated = await coreApi.updateConsumible(editingItem.id, {
        nombre: editFormData.nombre,
        stock: Number(editFormData.stock),
        es_critico: editFormData.es_critico,
        stock_minimo: Math.max(1, Number(editFormData.stock_minimo)),
      });

      setConsumibles((prev) =>
        prev.map((c) => (c.id === editingItem.id ? updated : c))
      );
      setEditingItem(null);
      showNotification(`Mínimo requerido de "${updated.nombre}" actualizado a ${updated.stock_minimo} uds (RF13).`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar consumible';
      alert(msg);
    }
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockItem) return;
    try {
      await coreApi.restockConsumible(restockItem.id, Number(restockAmount));
      setRestockItem(null);
      await loadConsumibles();
      showNotification(`Ingreso de ${restockAmount} unidades registrado exitosamente.`);
    } catch {
      // error
    }
  };

  const handleToggleCritical = async (id: string) => {
    if (!isAdmin) {
      alert('Acceso denegado: Solo los administradores pueden alterar la clasificación crítica (RF13).');
      return;
    }
    try {
      const updated = await coreApi.toggleCriticalConsumible(id);
      setConsumibles((prev) => prev.map((c) => (c.id === id ? updated : c)));
      showNotification(
        updated.es_critico
          ? `Ítem marcado como crítico.`
          : `Ítem desmarcado de crítico.`
      );
    } catch {
      // error
    }
  };

  const filteredConsumibles = consumibles.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Success Notification Banner */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-600" />
            Consumibles y Repuestos Sinclair
          </h2>
          <p className="text-xs text-slate-500">
            Control de stock de etiquetas, cintas de transferencia, cabezales térmicos y umbrales mínimos
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar consumible..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {isAdmin ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              Nuevo Ítem
            </button>
          ) : (
            <div className="text-[11px] text-slate-500 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-medium flex items-center gap-1.5 shrink-0">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Solo Administrador puede crear o modificar consumibles (RF13)
            </div>
          )}
        </div>
      </div>

      {/* Grid of Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredConsumibles.map((item) => {
          const isLowStock = item.stock <= item.stock_minimo;
          return (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight">{item.nombre}</h3>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {item.id}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isLowStock
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isLowStock ? 'Stock Bajo' : 'Disponible'}
                    </span>
                    {item.es_critico && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> Crítico
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock info and Mínimo Requerido */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Stock en Depósito
                    </span>
                    <span className="text-xl font-black text-slate-900">
                      {item.stock}{' '}
                      <span className="text-xs font-normal text-slate-500">uds</span>
                    </span>
                  </div>

                  <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/60 text-left">
                    <span className="text-[10px] uppercase font-bold text-amber-900/70 block mb-1">
                      Mínimo Requerido
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-black text-amber-950">
                        {item.stock_minimo}{' '}
                        <span className="text-xs font-normal text-amber-800">uds</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                <div className="flex items-center gap-2">
                  {isAdmin ? (
                    <button
                      onClick={() => handleToggleCritical(item.id)}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition"
                      title="Alternar estado crítico (RF13)"
                    >
                      {item.es_critico ? 'Desmarcar Crítico' : 'Marcar Crítico'}
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      {item.es_critico ? 'Prioridad Crítica' : 'Uso Estándar'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold rounded-lg text-xs flex items-center gap-1.5 transition"
                      title="Modificar stock mínimo requerido (RF13)"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-amber-700" />
                      Modificar Mínimo
                    </button>
                  )}
                  <button
                    onClick={() => setRestockItem({ id: item.id, name: item.nombre })}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition shadow-xs"
                  >
                    + Reabastecer
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Consumible & Mínimo Requerido Modal (RF13) */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-amber-50 border-b border-amber-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">
                      Editar Mínimo Requerido y Stock
                    </h3>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                      RF13
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-800 font-mono font-bold">
                    Código: {editingItem.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-base p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre Descriptivo</label>
                <input
                  type="text"
                  required
                  value={editFormData.nombre}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, nombre: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium text-slate-800"
                />
              </div>

              {/* Mínimo Requerido Field Highlighted */}
              <div className="p-4 bg-amber-50/70 border-2 border-amber-400/80 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-extrabold text-amber-950 block text-xs flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-amber-700" />
                    Mínimo Requerido (Stock de Seguridad)
                  </label>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-md">
                    Umbral de Alerta
                  </span>
                </div>
                <p className="text-[11px] text-amber-900/80 leading-relaxed">
                  Cuando las unidades en depósito sean menores o iguales a este número, el sistema disparará alertas visuales de <strong>Stock Bajo</strong> y notificaciones técnicas.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setEditFormData((prev) => ({
                        ...prev,
                        stock_minimo: Math.max(1, prev.stock_minimo - 5),
                      }))
                    }
                    className="w-8 h-8 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold flex items-center justify-center transition"
                  >
                    -5
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditFormData((prev) => ({
                        ...prev,
                        stock_minimo: Math.max(1, prev.stock_minimo - 1),
                      }))
                    }
                    className="w-8 h-8 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold flex items-center justify-center transition"
                  >
                    -1
                  </button>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editFormData.stock_minimo}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        stock_minimo: Number(e.target.value),
                      })
                    }
                    className="flex-1 p-2.5 bg-white border-2 border-amber-500 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none text-base font-black text-center text-amber-950"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setEditFormData((prev) => ({
                        ...prev,
                        stock_minimo: prev.stock_minimo + 1,
                      }))
                    }
                    className="w-8 h-8 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold flex items-center justify-center transition"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditFormData((prev) => ({
                        ...prev,
                        stock_minimo: prev.stock_minimo + 5,
                      }))
                    }
                    className="w-8 h-8 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold flex items-center justify-center transition"
                  >
                    +5
                  </button>
                </div>
              </div>

              {/* Stock Actual en Depósito */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Stock Actual en Depósito (Unidades Físicas)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editFormData.stock}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, stock: Number(e.target.value) })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold text-slate-800"
                />
              </div>

              {/* Checkbox Crítico */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-edit-es-critico"
                  checked={editFormData.es_critico}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, es_critico: e.target.checked })
                  }
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <label htmlFor="chk-edit-es-critico" className="font-bold text-slate-700 cursor-pointer">
                  Marcar como Ítem Crítico para la Operación
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Guardar Cambios (RF13)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-600" />
                  Registrar Consumible o Repuesto
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                  RF13
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Identificador / Código</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: ETIQ-SINCLAIR-01"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre Descriptivo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Rollo Etiquetas Sinclair Estándar 40mm"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mínimo Requerido</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.stock_minimo}
                    onChange={(e) =>
                      setFormData({ ...formData, stock_minimo: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="chk-es-critico"
                  checked={formData.es_critico}
                  onChange={(e) => setFormData({ ...formData, es_critico: e.target.checked })}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="chk-es-critico" className="font-bold text-slate-700 cursor-pointer">
                  Ítem Crítico para la Operación
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Guardar Consumible (RF13)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {restockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">Reabastecer {restockItem.name}</h3>
              <button onClick={() => setRestockItem(null)} className="text-slate-400 font-bold">
                ✕
              </button>
            </div>
            <form onSubmit={handleRestock} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Cantidad a ingresar a stock
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-base font-bold"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRestockItem(null)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white font-bold rounded-xl shadow-xs"
                >
                  Confirmar Ingreso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
