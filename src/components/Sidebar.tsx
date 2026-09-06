import React, { useEffect } from 'react';
import {
  LayoutDashboard,
  Cpu,
  Sparkles,
  Activity,
  Network,
  Lock,
  GitBranch,
  BarChart3,
  Download,
  Settings,
  X,
  ShieldCheck
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'sources'
  | 'onboarding'
  | 'events'
  | 'correlation'
  | 'integrity'
  | 'lineage'
  | 'benchmarks'
  | 'exports'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavSection {
  title: string;
  items: {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | null;
    badgeVariant?: 'brand' | 'warning' | 'success' | 'info';
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen = false,
  onClose
}) => {
  // Close sidebar on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const navSections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'sources', label: 'Sources', icon: Cpu },
        { id: 'onboarding', label: 'Onboarding', icon: Sparkles, badge: 'Hero', badgeVariant: 'brand' },
        { id: 'events', label: 'Live Events', icon: Activity },
        { id: 'correlation', label: 'Correlation', icon: Network, badge: 'Alerts', badgeVariant: 'warning' }
      ]
    },
    {
      title: 'TRUST',
      items: [
        { id: 'integrity', label: 'Integrity', icon: Lock, badge: 'Custody', badgeVariant: 'success' },
        { id: 'lineage', label: 'Lineage', icon: GitBranch }
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: 'benchmarks', label: 'Benchmarks', icon: BarChart3, badge: 'Measured', badgeVariant: 'info' },
        { id: 'exports', label: 'Exports', icon: Download },
        { id: 'settings', label: 'Settings', icon: Settings }
      ]
    }
  ];

  const handleItemClick = (id: NavTab) => {
    onSelectTab(id);
    if (onClose) {
      onClose();
    }
  };

  const badgeColors = {
    brand: 'bg-[#ECEAFF] text-[#5748D6] dark:bg-[#302A68] dark:text-[#7868FF] border-[#CDD0DF] dark:border-[#6657E8]/50',
    warning: 'bg-amber-50 text-[#C98600] dark:bg-amber-950/60 dark:text-[#F6B94A] border-amber-200 dark:border-amber-800/60',
    success: 'bg-emerald-50 text-[#139E63] dark:bg-emerald-950/60 dark:text-[#35D58A] border-emerald-200 dark:border-emerald-800/60',
    info: 'bg-[#E0F7FC] text-[#079ACB] dark:bg-[#123B4A] dark:text-[#35C7F4] border-[#079ACB]/30 dark:border-[#35C7F4]/40'
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      <div className="overflow-y-auto py-3">
        {/* Mobile Header with close button */}
        <div className="flex md:hidden items-center justify-between px-4 pb-3 mb-2 border-b border-slate-200 dark:border-[#29264D]">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#B7B5D0]">
            LogSetu SOC Navigation
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1C1940]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Section Groups */}
        <div className="space-y-5 px-3">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-[#777492]">
                {section.title}
              </div>

              <div className="space-y-0.5">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  const variant = item.badgeVariant || 'brand';

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition-all duration-150 cursor-pointer relative ${
                        isActive
                          ? 'text-[#5748D6] dark:text-[#F5F5FF] font-semibold bg-gradient-to-r from-[rgba(102,87,232,0.18)] to-[rgba(102,87,232,0.04)] dark:from-[rgba(102,87,232,0.25)] dark:to-[rgba(102,87,232,0.06)]'
                          : 'text-slate-600 dark:text-[#B7B5D0] hover:text-slate-900 dark:hover:text-[#F5F5FF] hover:bg-slate-100/80 dark:hover:bg-[#1C1940]/60'
                      }`}
                    >
                      {/* Left accent indicator (3px brand purple) */}
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-[#6657E8] dark:bg-[#7868FF]" />
                      )}

                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 flex-shrink-0 transition-colors ${
                            isActive
                              ? 'text-[#6657E8] dark:text-[#7868FF]'
                              : 'text-slate-400 dark:text-[#777492]'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${badgeColors[variant]}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer SOC Status */}
      <div className="p-3.5 m-3 rounded-xl border border-slate-200/80 dark:border-[#29264D] bg-slate-50 dark:bg-[#1C1940]/50 text-xs">
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="font-semibold text-slate-700 dark:text-[#F5F5FF] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#6657E8] dark:text-[#7868FF]" />
            Trust Engine
          </span>
          <span className="text-[10px] font-mono font-medium text-emerald-600 dark:text-[#35D58A] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#35D58A] animate-pulse" />
            Active
          </span>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-[#777492] leading-tight">
          OCSF-aligned Universal Event Model with cryptographic chain custody.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-56 lg:w-60 bg-white dark:bg-[#0D0B1D] border-r border-slate-200/80 dark:border-[#29264D] flex-col min-h-[calc(100vh-3.75rem)] flex-shrink-0 transition-colors">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Mobile Off-Canvas Drawer */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-[#0D0B1D] z-50 md:hidden shadow-2xl transition-transform duration-200 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
