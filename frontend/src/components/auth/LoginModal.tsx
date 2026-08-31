/**
 * LoginModal - Authentication and User Profile Switcher with Password Verification (RNF01)
 * Adheres strictly to SDD and Clean Code standards
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  UserCheck,
  LogOut,
  Check,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Tecnico } from '../../types/domain';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { user, allTecnicos, loginWithPassword, logout } = useAuth();
  const [selectedUser, setSelectedUser] = useState<Tecnico | null>(user || allTecnicos[0] || null);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedUser(user || allTecnicos[0] || null);
      setPassword('');
      setErrorMessage(null);
    }
  }, [isOpen, user, allTecnicos]);

  if (!isOpen) return null;

  const handleSelectUser = (tecnico: Tecnico) => {
    setSelectedUser(tecnico);
    setPassword('');
    setErrorMessage(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      setErrorMessage('Seleccione un usuario para iniciar sesión.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Ingrese su contraseña de acceso.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const result = await loginWithPassword(selectedUser.id, password);
    setIsLoading(false);

    if (result.success) {
      onClose();
    } else {
      setErrorMessage(result.error || 'Contraseña incorrecta. Intente nuevamente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div
        id="modal-user-auth"
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl relative text-white my-6 max-h-[92vh] flex flex-col"
      >
        <button
          id="btn-close-auth-modal"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-800">
          <div className="w-11 h-11 rounded-2xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center font-bold text-blue-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Inicio de Sesión</h2>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-950/70 border border-rose-800/80 rounded-xl text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="overflow-y-auto flex-1 space-y-5 pr-1 text-xs">
          {/* User Selection List */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              1. Seleccione el Usuario:
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {allTecnicos.map((t) => {
                const isSelected = selectedUser?.id === t.id;
                const isCurrentlyActive = user?.id === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    id={`btn-select-user-${t.id}`}
                    onClick={() => handleSelectUser(t)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-blue-950/70 border-blue-500 text-white shadow-sm ring-1 ring-blue-500'
                        : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {t.nombre.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold flex items-center gap-2">
                          {t.nombre}
                          {t.rol === 'admin' ? (
                            <span className="text-[10px] bg-amber-900/70 text-amber-300 border border-amber-700 px-1.5 py-0.2 rounded font-mono font-bold">
                              Admin
                            </span>
                          ) : (
                            <span className="text-[10px] bg-blue-900/60 text-blue-300 border border-blue-700 px-1.5 py-0.2 rounded font-mono">
                              Técnico
                            </span>
                          )}
                          {isCurrentlyActive && (
                            <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700 px-1.5 py-0.2 rounded font-semibold">
                              Activo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-blue-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Password Form */}
          {selectedUser && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 pt-3 border-t border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                  2. Ingrese la Contraseña para {selectedUser.nombre} *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="input-login-password"
                    placeholder="Contraseña de usuario..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  id="btn-submit-login"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  {isLoading ? 'Verificando...' : `Iniciar Sesión como ${selectedUser.nombre}`}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-800 text-xs">
          {user ? (
            <button
              id="btn-logout"
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              className="flex items-center gap-2 text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-xl hover:bg-rose-950/40 border border-rose-900/50 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Cerrar Sesión Actual
            </button>
          ) : (
            <div className="text-slate-500 text-[11px]">No hay sesión activa</div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
