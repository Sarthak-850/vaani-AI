import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { VaaniHeader } from './components/layout/VaaniHeader';
import { VaaniSidebar } from './components/layout/VaaniSidebar';
import { MobileNav } from './components/layout/MobileNav';

// Pages
import { VaaniDashboard } from './pages/VaaniDashboard';
import { Visits } from './pages/Visits';
import { Alerts } from './pages/Alerts';
import { Analytics } from './pages/Analytics';
import { FieldMap } from './pages/FieldMap';
import { Patients } from './pages/Patients';
import { AIInsights } from './pages/AIInsights';
import { Reports } from './pages/Reports';
import { SyncStatus } from './pages/SyncStatus';
import { Settings } from './pages/Settings';
import { HelpSupport } from './pages/HelpSupport';
import { LogVisit } from './pages/LogVisit';
import { Earnings } from './pages/Earnings';
import { Login } from './pages/Login';

// Modals
import { NewVisitModal } from './components/modals/NewVisitModal';
import { AddPatientModal } from './components/modals/AddPatientModal';

const AppLayout: React.FC = () => {
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#050B10] text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-black">
      {/* Top Header matching reference screenshot */}
      <VaaniHeader 
        onOpenNewVisit={() => setIsVisitModalOpen(true)}
        onOpenAddPatient={() => setIsPatientModalOpen(true)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Desktop Sidebar */}
        <VaaniSidebar />

        {/* Center Workspace Area */}
        <main className="flex-1 overflow-y-auto bg-[#050B10] focus:outline-none">
          <Routes>
            <Route path="/" element={<VaaniDashboard />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/visits" element={<Visits />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/map" element={<FieldMap />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/ai-insights" element={<AIInsights />} />
            <Route path="/voice" element={<VaaniDashboard />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/sync" element={<SyncStatus />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<HelpSupport />} />
            <Route path="/log-visit" element={<LogVisit />} />
            <Route path="/earnings" element={<Earnings />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav onOpenNewVisit={() => setIsVisitModalOpen(true)} />

      {/* Global Modals */}
      <NewVisitModal 
        isOpen={isVisitModalOpen} 
        onClose={() => setIsVisitModalOpen(false)} 
      />
      <AddPatientModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;

