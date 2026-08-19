/**
 * DocsView Component
 * Architectural documentation, API contract specifications, and design notes
 */

import React from 'react';
import { BookOpen, Layers, Server, ShieldCheck, Database, GitBranch, Cpu } from 'lucide-react';

export const DocsView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">Documentación de Arquitectura & SDD</h2>
        </div>
        <p className="text-xs text-slate-500">
          Especificación técnica del sistema Sinclair Field Operations, segregación de capas y contratos de API.
        </p>
      </div>

      {/* Layer Diagram Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          Arquitectura en Capas (Clean Architecture)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="font-bold text-blue-700 block text-xs">1. Presentation Layer</span>
            <p className="text-slate-600">
              React 19 SPA, Tailwind CSS, Context Providers (Auth, Notifications), OfflineSyncManager.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="font-bold text-indigo-700 block text-xs">2. Controllers Layer</span>
            <p className="text-slate-600">
              Express Routers: <code className="font-mono text-[11px]">/api/visits</code> (API 1) y{' '}
              <code className="font-mono text-[11px]">/api/core</code> (API 2).
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="font-bold text-emerald-700 block text-xs">3. Domain Services</span>
            <p className="text-slate-600">
              VisitaService, ReemplazoService, CambioService, ServicioService, EmpaqueService, MachineService.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="font-bold text-amber-700 block text-xs">4. Repositories & Store</span>
            <p className="text-slate-600">
              Singleton DatabaseStore con repositorios fuertemente tipados e índices en memoria.
            </p>
          </div>
        </div>
      </div>

      {/* API Endpoints Summary */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Server className="w-4 h-4 text-indigo-600" />
          Contratos de API RESTful
        </h3>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Método</th>
                <th className="p-3">Ruta</th>
                <th className="p-3">Módulo</th>
                <th className="p-3">Descripción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              <tr>
                <td className="p-3 font-bold text-emerald-700">POST</td>
                <td className="p-3">/api/visits</td>
                <td className="p-3 font-sans text-slate-600">API 1 (Visits)</td>
                <td className="p-3 font-sans text-slate-800">
                  Crea visita técnica y genera reporte Sinclair oficial con número correlativo.
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-emerald-700">POST</td>
                <td className="p-3">/api/visits/sync-batch</td>
                <td className="p-3 font-sans text-slate-600">API 1 (Visits)</td>
                <td className="p-3 font-sans text-slate-800">
                  Sincroniza lote de visitas acumuladas en modo offline.
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-blue-700">GET</td>
                <td className="p-3">/api/core/machines/location/:id</td>
                <td className="p-3 font-sans text-slate-600">API 2 (Core)</td>
                <td className="p-3 font-sans text-slate-800">
                  Obtiene todos los cabezales, caseteras y frenos asignados a un empaque.
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-emerald-700">POST</td>
                <td className="p-3">/api/core/operations/reemplazos</td>
                <td className="p-3 font-sans text-slate-600">API 2 (Core)</td>
                <td className="p-3 font-sans text-slate-800">
                  Registra reemplazo de cabezal/casetera y actualiza estado de máquinas a "Listo".
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-emerald-700">POST</td>
                <td className="p-3">/api/core/operations/cambios</td>
                <td className="p-3 font-sans text-slate-600">API 2 (Core)</td>
                <td className="p-3 font-sans text-slate-800">
                  Cambio de freno acoplado a un cabezal específico.
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-blue-700">GET</td>
                <td className="p-3">/api/core/empaques/alerts/unvisited</td>
                <td className="p-3 font-sans text-slate-600">API 2 (Core)</td>
                <td className="p-3 font-sans text-slate-800">
                  Alertas de plantas con servicio que no han sido visitadas en más de 30 días.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
