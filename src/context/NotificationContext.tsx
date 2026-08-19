/**
 * NotificationContext - Handles system alerts for unvisited plants and low-stock consumables
 * Adheres strictly to RF14, RF15 specifications with instant reactive updates.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { coreApi } from '../services/apiClient';

export interface SystemAlert {
  id: string;
  type: 'consumible_stock' | 'empaque_unvisited';
  title: string;
  message: string;
  severity: 'warning' | 'danger';
  timestamp: string;
}

interface NotificationContextType {
  alerts: SystemAlert[];
  unreadCount: number;
  refreshAlerts: () => Promise<void>;
  dismissAlert: (id: string) => void;
}

/**
 * Global reactive event dispatcher to immediately refresh notification badges across the entire app
 */
export const invalidateSystemAlerts = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('system-alerts-invalidate'));
  }
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const refreshAlerts = async () => {
    try {
      const [unvisited, lowStock] = await Promise.all([
        coreApi.getUnvisitedAlerts(),
        coreApi.getLowStockAlerts(),
      ]);

      const newAlerts: SystemAlert[] = [];

      // RF15: Empaques not visited for >15 days
      unvisited.forEach((emp) => {
        const id = `emp-alert-${emp.empaque_id}`;
        newAlerts.push({
          id,
          type: 'empaque_unvisited',
          title: `Empaque sin visita: ${emp.nombre}`,
          message: `${emp.dias_sin_visita} días sin inspección técnica (Límite: 15 días). Ubicación: ${emp.ubicacion}`,
          severity: emp.urgencia === 'alta' ? 'danger' : 'warning',
          timestamp: new Date().toISOString(),
        });
      });

      // RF14: Low stock alerts for critical consumables
      lowStock.forEach((csm) => {
        const id = `csm-alert-${csm.consumible_id}`;
        newAlerts.push({
          id,
          type: 'consumible_stock',
          title: `Stock Crítico: ${csm.nombre}`,
          message: `Stock actual: ${csm.stock_actual} unidades (Mínimo requerido: ${csm.stock_minimo}). Déficit: ${csm.deficit}`,
          severity: csm.es_critico ? 'danger' : 'warning',
          timestamp: new Date().toISOString(),
        });
      });

      setAlerts(newAlerts);
    } catch {
      // Offline fallback: keep existing
    }
  };

  useEffect(() => {
    refreshAlerts();

    const handleInvalidate = () => {
      refreshAlerts();
    };

    window.addEventListener('system-alerts-invalidate', handleInvalidate);
    // Instant real-time background sync every 5 seconds (instead of 60 seconds)
    const interval = setInterval(refreshAlerts, 5000);

    return () => {
      window.removeEventListener('system-alerts-invalidate', handleInvalidate);
      clearInterval(interval);
    };
  }, []);

  const dismissAlert = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  const visibleAlerts = alerts.filter((a) => !dismissedIds.has(a.id));

  return (
    <NotificationContext.Provider
      value={{
        alerts: visibleAlerts,
        unreadCount: visibleAlerts.length,
        refreshAlerts,
        dismissAlert,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
