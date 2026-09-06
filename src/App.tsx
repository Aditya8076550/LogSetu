import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { ExplainModal } from './components/ExplainModal';
import { OverviewPage } from './pages/OverviewPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { LiveEventsPage } from './pages/LiveEventsPage';
import { CorrelationPage } from './pages/CorrelationPage';
import { IntegrityPage } from './pages/IntegrityPage';
import { LineagePage } from './pages/LineagePage';
import { SourcesPage } from './pages/SourcesPage';
import { BenchmarksPage } from './pages/BenchmarksPage';
import { ExportsPage } from './pages/ExportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { explainEvent } from './services/api';
import { EventExplainResponse } from './types';
import { CheckCircle2, AlertTriangle, X, ShieldCheck } from 'lucide-react';

interface ToastNotice {
  id: string;
  message: string;
  type: 'success' | 'warning';
}

function MainApp() {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [explainData, setExplainData] = useState<EventExplainResponse | null>(null);
  const [toasts, setToasts] = useState<ToastNotice[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const addNotice = (message: string, type: 'success' | 'warning' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const handleExplain = async (eventId: string) => {
    try {
      const data = await explainEvent(eventId);
      setExplainData(data);
    } catch (e: any) {
      addNotice(`Could not fetch provenance: ${e.message}`, 'warning');
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080714] text-slate-900 dark:text-[#F5F5FF] flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        onRefresh={handleRefresh}
        onNotice={addNotice}
        onNavigateOnboarding={() => setCurrentTab('onboarding')}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex w-full">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={tab => {
            setCurrentTab(tab);
            setMobileMenuOpen(false);
          }}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-7 min-w-0 overflow-x-hidden">
          {currentTab === 'overview' && (
            <OverviewPage
              key={refreshTrigger}
              onExplain={handleExplain}
              onNavigate={tab => setCurrentTab(tab)}
            />
          )}
          {currentTab === 'onboarding' && (
            <OnboardingPage
              onNotice={addNotice}
              onExplain={handleExplain}
            />
          )}
          {currentTab === 'events' && (
            <LiveEventsPage
              key={refreshTrigger}
              onExplain={handleExplain}
              onNotice={addNotice}
            />
          )}
          {currentTab === 'correlation' && (
            <CorrelationPage
              key={refreshTrigger}
              onExplain={handleExplain}
              onNotice={addNotice}
            />
          )}
          {currentTab === 'integrity' && (
            <IntegrityPage
              key={refreshTrigger}
              onNotice={addNotice}
            />
          )}
          {currentTab === 'lineage' && (
            <LineagePage
              key={refreshTrigger}
              onExplain={handleExplain}
            />
          )}
          {currentTab === 'sources' && (
            <SourcesPage
              key={refreshTrigger}
              onNavigateOnboarding={() => setCurrentTab('onboarding')}
            />
          )}
          {currentTab === 'benchmarks' && (
            <BenchmarksPage
              key={refreshTrigger}
            />
          )}
          {currentTab === 'exports' && (
            <ExportsPage
              onNotice={addNotice}
            />
          )}
          {currentTab === 'settings' && (
            <SettingsPage
              onNotice={addNotice}
            />
          )}
        </main>
      </div>

      {/* Enterprise Status Footer */}
      <footer className="h-9 bg-white/90 dark:bg-[#0D0B1D]/90 backdrop-blur-md border-t border-slate-200/80 dark:border-[#29264D] flex items-center px-4 sm:px-6 justify-between text-[11px] text-slate-500 dark:text-[#B7B5D0] z-30 flex-shrink-0 transition-colors">
        <div className="flex gap-4 sm:gap-6 items-center">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Chain: <strong className="text-slate-800 dark:text-[#F5F5FF]">Locked</strong></span>
          </span>
          <span className="hidden sm:inline">
            Unified: <strong className="text-[#6657E8] dark:text-[#7868FF]">OCSF Class 4001</strong>
          </span>
          <span className="hidden md:inline">
            Parser Engine: <strong className="text-[#079ACB] dark:text-[#35C7F4]">Ready</strong>
          </span>
        </div>
        <div className="flex gap-3 items-center text-[10px]">
          <span className="text-slate-400 dark:text-[#777492] font-mono">SIH26156 • NTRO</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#1C1940] text-slate-700 dark:text-[#F5F5FF] font-medium border border-slate-200 dark:border-[#39345F]">
            Air-Gapped Ready
          </span>
        </div>
      </footer>

      {/* Provenance & Lineage Modal */}
      <ExplainModal
        data={explainData}
        onClose={() => setExplainData(null)}
      />

      {/* Toast Notification Container */}
      <div className="fixed bottom-12 right-4 z-50 space-y-2 max-w-md w-full pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-lg backdrop-blur-md flex items-start justify-between gap-3 text-xs transition-all animate-in fade-in slide-in-from-bottom-2 duration-200 ${
              t.type === 'success'
                ? 'bg-white/95 dark:bg-[#14122D]/95 text-slate-900 dark:text-[#F5F5FF] border-emerald-500/40 shadow-emerald-500/10'
                : 'bg-white/95 dark:bg-[#14122D]/95 text-slate-900 dark:text-[#F5F5FF] border-amber-500/40 shadow-amber-500/10'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {t.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{t.message}</span>
            </div>
            <button
              onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
