import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  badgeVariant?: 'emerald' | 'cyan' | 'rose' | 'amber';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeVariant = 'cyan'
}) => {
  const badgeClasses = {
    emerald: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border-slate-900 dark:border-slate-700',
    cyan: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 border-slate-900 dark:border-slate-700',
    rose: 'bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200 border-slate-900 dark:border-slate-700',
    amber: 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border-slate-900 dark:border-slate-700',
  }[badgeVariant];

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 p-4 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(51,65,85,1)] flex flex-col justify-between transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
        <span className="text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase font-mono">
          {title}
        </span>
        <div className="w-7 h-7 bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center border border-slate-900 dark:border-slate-700">
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
          {value}
        </span>
        {badge && (
          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 border ${badgeClasses}`}>
            {badge}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60 pt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
};
