/**
 * Main Application Component
 * Sinclair Field Operations & Visit Management System
 * Adheres strictly to SDD and Clean Code standards.
 */

import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LoginModal } from './components/auth/LoginModal';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { VisitList } from './components/visits/VisitList';
import { VisitForm } from './components/visits/VisitForm';
import { EmpaquesView } from './components/empaques/EmpaquesView';
import { EquipmentByLocationView } from './components/empaques/EquipmentByLocationView';
import { CabezalesView } from './components/machines/CabezalesView';
import { CaseterasView } from './components/machines/CaseterasView';
import { FrenosView } from './components/machines/FrenosView';
import { ConsumiblesView } from './components/consumibles/ConsumiblesView';
import { TechniciansView } from './components/tecnicos/TechniciansView';
import { ActivityHistoryView } from './components/history/ActivityHistoryView';
import { SDDValidationView } from './components/system/SDDValidationView';
import { DocsView } from './components/system/DocsView';

const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('estadisticas');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isVisitFormOpen, setIsVisitFormOpen] = useState<boolean>(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'visitas':
        return <VisitList onNewVisitClick={() => setIsVisitFormOpen(true)} />;
      case 'operaciones':
        return <ActivityHistoryView />;
      case 'equipos_empaque':
        return <EquipmentByLocationView />;
      case 'cabezales':
        return <CabezalesView />;
      case 'caseteras':
        return <CaseterasView />;
      case 'frenos':
        return <FrenosView />;
      case 'empaques':
        return <EmpaquesView />;
      case 'consumibles':
        return <ConsumiblesView />;
      case 'tecnicos':
        return <TechniciansView />;
      case 'estadisticas':
        return (
          <DashboardView
            onNavigate={(tab) => {
              if (tab === 'equipment-location') setActiveTab('equipos_empaque');
              else if (tab === 'visits') setActiveTab('visitas');
              else setActiveTab(tab);
            }}
            onNewVisit={() => setIsVisitFormOpen(true)}
          />
        );
      case 'pruebas_sdd':
        return <SDDValidationView />;
      case 'docs_api':
        return <DocsView />;
      default:
        return (
          <DashboardView
            onNavigate={(tab) => setActiveTab(tab)}
            onNewVisit={() => setIsVisitFormOpen(true)}
          />
        );
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onSelectTab={(tabId) => setActiveTab(tabId)}
      />

      {/* Main Layout Body: Fixed height container, zero window-scroll */}
      <div className="flex-1 flex flex-row overflow-hidden w-full relative min-h-0">
        {/* Responsive Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tabId) => setActiveTab(tabId)}
          isOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />

        {/* Dynamic Main Workspace Content */}
        <main className="flex-1 h-full overflow-y-auto min-h-0 p-4 md:p-6 lg:p-8 w-full">
          <div className="max-w-7xl mx-auto w-full">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Modals */}
      {isLoginModalOpen && (
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      )}

      {isVisitFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-4 md:p-6 flex items-start justify-center">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-4 md:my-8 max-h-[92vh] flex flex-col">
            <div className="overflow-y-auto p-4 sm:p-6 flex-1">
              <VisitForm
                onSuccess={() => {
                  setIsVisitFormOpen(false);
                  setActiveTab('visitas');
                }}
                onCancel={() => setIsVisitFormOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainAppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}
