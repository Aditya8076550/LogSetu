import React, { useState } from 'react';
import { Sparkles, PlusCircle, Trash2, Sun, Moon, RefreshCw, Menu, X, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { seedDemoScenario, resetDatabase } from '../services/api';
import { LogSetuLogo } from './LogSetuLogo';
import { Button } from './UIComponents';

interface NavbarProps {
  onRefresh: () => void;
  onNotice: (msg: string, type?: 'success' | 'warning') => void;
  onNavigateOnboarding: () => void;
  mobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRefresh,
  onNotice,
  onNavigateOnboarding,
  mobileMenuOpen = false,
  onToggleMobileMenu
}) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [seeding, setSeeding] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSeedDemo = async () => {
    try {
      setSeeding(true);
      const res = await seedDemoScenario();
      onNotice(`Judge Demo Scenario Activated: ${res.events_ingested} multi-source events seeded for target ${res.target_subject}!`, 'success');
      onRefresh();
    } catch (e: any) {
      onNotice(`Demo seed error: ${e.message}`, 'warning');
    } finally {
      setSeeding(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset LogSetu database and clear all active events?')) return;
    try {
      setResetting(true);
      await resetDatabase();
      onNotice('Platform database reset to clean state.', 'success');
      onRefresh();
    } catch (e: any) {
      onNotice(`Reset error: ${e.message}`, 'warning');
    } finally {
      setResetting(false);
    }
  };

  return (
    <header className="bg-white/90 dark:bg-[#0D0B1D]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-[#29264D] px-3 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-40 transition-colors">
      {/* Brand & Identity with Exact LogSetu Logo */}
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-[#B7B5D0] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1C1940] transition cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          <LogSetuLogo variant="full" size="md" />
          
          <div className="hidden xl:flex items-center pl-3 ml-2 border-l border-slate-200 dark:border-[#29264D]">
            <span className="text-xs font-medium text-slate-500 dark:text-[#B7B5D0]">
              Universal Log Interoperability Platform
            </span>
          </div>
        </div>
      </div>

      {/* Action Controls & Status */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Engine Status Tag */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-[11px] font-medium text-emerald-700 dark:text-[#35D58A]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Interoperability Engine Online</span>
        </div>

        {/* Primary Global Action: + Onboard Source */}
        <Button
          variant="primary"
          size="sm"
          icon={PlusCircle}
          onClick={onNavigateOnboarding}
          className="shadow-sm"
        >
          <span className="hidden xs:inline">+</span> Onboard Source
        </Button>

        {/* Secondary Global Action: Run Demo */}
        <Button
          variant="secondary"
          size="sm"
          icon={Sparkles}
          loading={seeding}
          onClick={handleSeedDemo}
          title="Seed multi-source coordinated attack scenario across 5 perimeter technologies"
          className="hidden sm:inline-flex"
        >
          <span>{seeding ? 'Running...' : 'Run Demo'}</span>
        </Button>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1C1940] dark:hover:bg-[#242050] text-slate-600 dark:text-[#B7B5D0] border border-slate-200 dark:border-[#39345F] transition cursor-pointer"
          title="Refresh dashboard data"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Reset Database */}
        <button
          onClick={handleReset}
          disabled={resetting}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-rose-100 dark:bg-[#1C1940] dark:hover:bg-rose-950/60 text-slate-500 hover:text-rose-600 dark:text-[#B7B5D0] dark:hover:text-rose-300 border border-slate-200 dark:border-[#39345F] transition cursor-pointer"
          title="Reset database to clean initial state"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1C1940] dark:hover:bg-[#242050] text-slate-700 dark:text-[#F5F5FF] border border-slate-200 dark:border-[#39345F] transition cursor-pointer"
          title={`Theme: ${resolvedTheme}. Click to switch.`}
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-slate-700" />
          )}
        </button>
      </div>
    </header>
  );
};
