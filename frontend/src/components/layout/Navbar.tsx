/**
 * Navbar Component
 * Displays system status, online/offline sync banner, active technician, and alerts
 */

import React, { useEffect, useState } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  User,
  ShieldCheck,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Menu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { OfflineSyncManager } from '../../services/offlineSync';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onOpenLogin: () => void;
  onSelectTab: (tabId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onOpenLogin,
  onSelectTab,
}) => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  const syncManager = OfflineSyncManager.getInstance();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribe = syncManager.subscribe((count) => {
      setPendingCount(count);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const handleManualSync = async () => {
    if (isSyncing || pendingCount === 0) return;
    setIsSyncing(true);
    setSyncStatusMsg('Sincronizando visitas pendientes...');

    try {
      const result = await syncManager.syncPendingVisits();
      if (result.syncedCount > 0) {
        setSyncStatusMsg(`¡Sincronizadas ${result.syncedCount} visitas con éxito!`);
      } else if (result.errors.length > 0) {
        setSyncStatusMsg(`Error al sincronizar: ${result.errors[0]}`);
      }
    } catch {
      setSyncStatusMsg('Error de red al sincronizar.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatusMsg(null), 4000);
    }
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left branding */}
        <div className="flex items-center space-x-3">
          <button
            id="btn-toggle-sidebar"
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
            aria-label="Abrir menú"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg text-white shadow-sm shadow-blue-500/50">
              C&C
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Gestor de visitas
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Carlino & Carlino
              </p>
            </div>
          </div>
        </div>

        {/* Center/Right Status Badges */}
        <div className="flex items-center space-x-3">
          {/* Online/Offline Badge */}
          <div
            id="status-connectivity-badge"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
              isOnline
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                : 'bg-amber-950/60 text-amber-300 border-amber-800 animate-pulse'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isOnline ? 'Online' : 'Modo Offline'}</span>
          </div>

          {/* Pending Queue Sync Badge */}
          {pendingCount > 0 && (
            <button
              id="btn-sync-pending-queue"
              onClick={handleManualSync}
              disabled={isSyncing || !isOnline}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                isOnline
                  ? 'bg-blue-900/80 text-blue-200 border-blue-700 hover:bg-blue-800 cursor-pointer'
                  : 'bg-slate-800 text-slate-400 border-slate-700 cursor-not-allowed'
              }`}
              title="Visitas guardadas localmente pendientes de subir al servidor"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>
                {pendingCount} {pendingCount === 1 ? 'pendiente' : 'pendientes'}
              </span>
            </button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              id="btn-open-notifications"
              onClick={() => setShowNotificationMenu(!showNotificationMenu)}
              className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
              aria-label="Ver alertas"
            >
              <Bell className="w-5 h-5" />
            </button>

            {showNotificationMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <button
                    onClick={() => setShowNotificationMenu(false)}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Login */}
          <button
            id="btn-open-user-profile"
            onClick={onOpenLogin}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs transition"
          >
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              {user ? user.nombre.charAt(0) : <User className="w-3.5 h-3.5" />}
            </div>
            <div className="text-left hidden sm:block">
              <div className="font-semibold text-white truncate max-w-[110px]">
                {user ? user.nombre : 'Iniciar Sesión'}
              </div>
              <div className="text-[10px] text-slate-400 capitalize flex items-center gap-1">
                {user?.rol === 'admin' ? (
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                ) : null}
                {user?.rol || 'Invitado'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncStatusMsg && (
        <div className="bg-blue-600 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{syncStatusMsg}</span>
        </div>
      )}
    </header>
  );
};
