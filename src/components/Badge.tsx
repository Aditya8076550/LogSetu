import React from 'react';

interface BadgeProps {
  label: string;
  variant?: 'severity' | 'action' | 'status' | 'source' | 'default';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', size = 'sm' }) => {
  const upper = (label || '').toUpperCase();
  let color = 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-900 dark:border-slate-700';

  if (variant === 'severity') {
    if (upper === 'CRITICAL') {
      color = 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border-rose-900 dark:border-rose-600 font-bold';
    } else if (upper === 'HIGH') {
      color = 'bg-orange-50 dark:bg-orange-950 text-orange-800 dark:text-orange-200 border-orange-900 dark:border-orange-600 font-bold';
    } else if (upper === 'MEDIUM') {
      color = 'bg-amber-50 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border-amber-900 dark:border-amber-600 font-bold';
    } else if (upper === 'LOW') {
      color = 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-900 dark:border-emerald-600 font-bold';
    } else {
      color = 'bg-indigo-50 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 border-indigo-900 dark:border-indigo-600 font-bold';
    }
  } else if (variant === 'action') {
    if (['DENY', 'BLOCK', 'DROP', 'AUTH_FAIL', 'FAILED', 'LOGIN_FAIL'].includes(upper)) {
      color = 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border-slate-900 dark:border-slate-700 font-bold';
    } else if (['ALERT', 'WARNING', 'SUSPICIOUS'].includes(upper)) {
      color = 'bg-amber-50 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border-slate-900 dark:border-slate-700 font-bold';
    } else if (['ALLOW', 'PERMIT', 'AUTH_SUCCESS', 'SUCCESS'].includes(upper)) {
      color = 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-slate-900 dark:border-slate-700 font-bold';
    }
  } else if (variant === 'status') {
    if (['VERIFIED', 'ACTIVE', 'NORMALIZED', 'READY', 'PASS', 'SUCCESS'].includes(upper)) {
      color = 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border-slate-900 dark:border-slate-700 font-bold';
    } else if (['TAMPER_DETECTED', 'ERROR', 'FAILED', 'FAIL'].includes(upper)) {
      color = 'bg-rose-600 text-white border-slate-900 dark:border-slate-700 font-black';
    } else {
      color = 'bg-yellow-100 dark:bg-yellow-950 text-yellow-900 dark:text-yellow-200 border-slate-900 dark:border-slate-700 font-bold';
    }
  } else if (variant === 'source') {
    color = 'bg-indigo-50 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 border-slate-900 dark:border-slate-700 font-semibold';
  }

  const px = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-mono uppercase tracking-wider border ${px} ${color}`}>
      {label}
    </span>
  );
};
