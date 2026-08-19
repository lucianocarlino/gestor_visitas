/**
 * Sidebar Navigation Component
 * Provides clean navigation for all spec options with badges and responsive drawer
 */

import React from 'react';
import {
  ClipboardList,
  Cpu,
  Disc,
  Layers,
  MapPin,
  Package,
  Wrench,
  Users,
  BarChart3,
  CheckSquare,
  BookOpen,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRightLeft,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export interface MenuItem {
  id: string;
  label: string;
  category: 'principal' | 'equipos' | 'gestion' | 'sistema';
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: string;
}

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onCloseMobile,
}) => {
  const { alerts } = useNotifications();

  const unvisitedCount = alerts.filter((a) => a.type === 'empaque_unvisited').length;
  const lowStockCount = alerts.filter((a) => a.type === 'consumible_stock').length;

  const menuItems: MenuItem[] = [
    // Principal
    {
      id: 'visitas',
      label: 'Cargar Visita y Reporte',
      category: 'principal',
      icon: ClipboardList,
    },
    {
      id: 'operaciones',
      label: 'Operaciones (Reemplazo/Cambio)',
      category: 'principal',
      icon: Wrench,
    },
    // Equipos
    {
      id: 'equipos_empaque',
      label: 'Equipos por Empaque',
      category: 'equipos',
      icon: MapPin,
    },
    {
      id: 'cabezales',
      label: 'Cabezales (Printheads)',
      category: 'equipos',
      icon: Cpu,
    },
    {
      id: 'frenos',
      label: 'Frenos (Brakes)',
      category: 'equipos',
      icon: Disc,
    },
    {
      id: 'caseteras',
      label: 'Caseteras (Cassettes)',
      category: 'equipos',
      icon: Layers,
    },
    // Gestión
    {
      id: 'empaques',
      label: 'Empaques & Ubicaciones',
      category: 'gestion',
      icon: MapPin,
      badge: unvisitedCount > 0 ? `${unvisitedCount} sin visita` : undefined,
      badgeColor: 'bg-amber-600',
    },
    {
      id: 'consumibles',
      label: 'Consumibles & Stock',
      category: 'gestion',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} bajo` : undefined,
      badgeColor: 'bg-rose-600',
    },
    {
      id: 'tecnicos',
      label: 'Técnicos & Actividad',
      category: 'gestion',
      icon: Users,
    },
    {
      id: 'estadisticas',
      label: 'Estadísticas & ZIP Export',
      category: 'gestion',
      icon: BarChart3,
    },
    // Sistema
    {
      id: 'pruebas_sdd',
      label: 'Pruebas Unitarias SDD',
      category: 'sistema',
      icon: CheckSquare,
      badge: 'RF01-24',
      badgeColor: 'bg-emerald-600',
    },
    {
      id: 'docs_api',
      label: 'Docs & Arquitectura',
      category: 'sistema',
      icon: BookOpen,
    },
  ];

  const handleItemClick = (id: string) => {
    onSelectTab(id);
    onCloseMobile();
  };

  const renderCategory = (category: MenuItem['category'], title: string) => {
    const items = menuItems.filter((i) => i.category === category);
    return (
      <div className="mb-4">
        <div className="px-3 mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {title}
        </div>
        <div className="space-y-0.5">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate text-left">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full text-white font-mono flex-shrink-0 ${
                      item.badgeColor || 'bg-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between flex-shrink-0 h-full transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-3 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
          {renderCategory('principal', 'Operaciones de Campo')}
          {renderCategory('equipos', 'Inventario de Equipos')}
          {renderCategory('gestion', 'Gestión & Estadísticas')}
          {renderCategory('sistema', 'Calidad & Documentación')}
        </div>

        {/* Sinclair Footer */}
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 bg-slate-950/40 flex-shrink-0">
          <div className="font-semibold text-slate-400">Sinclair Systems International</div>
          <div>Field Service & Maintenance Suite</div>
        </div>
      </aside>
    </>
  );
};
