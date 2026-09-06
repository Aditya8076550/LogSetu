import React from 'react';
import { LucideIcon, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

/* =========================================================================
   CARDS
   ========================================================================= */

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  elevated = false,
  interactive = false,
  ...props
}) => {
  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ${
        elevated
          ? 'bg-white dark:bg-[#1C1940] border-slate-200 dark:border-[#39345F] shadow-md dark:shadow-[0_12px_32px_rgba(0,0,0,0.3)]'
          : 'bg-white dark:bg-[#14122D] border-slate-200/80 dark:border-[#29264D] shadow-sm dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]'
      } ${
        interactive
          ? 'hover:border-[#6657E8]/50 dark:hover:border-[#7868FF]/50 hover:shadow-lg dark:hover:shadow-[0_10px_35px_rgba(102,87,232,0.15)] cursor-pointer'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`p-5 pb-3 sm:p-6 sm:pb-3 flex flex-col gap-1.5 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <h3
      className={`text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-[#F5F5FF] ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <p
      className={`text-xs text-slate-500 dark:text-[#B7B5D0] leading-relaxed ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`p-5 pt-2 sm:p-6 sm:pt-3 ${className}`} {...props}>
      {children}
    </div>
  );
};

/* =========================================================================
   STATUS BADGES
   ========================================================================= */

export type BadgeVariant =
  | 'brand'
  | 'cyan'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: LucideIcon;
  dot?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'neutral',
  icon: Icon,
  dot = false,
  size = 'md',
  className = ''
}) => {
  const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
    brand: {
      container:
        'bg-[#ECEAFF] text-[#5748D6] dark:bg-[#302A68]/70 dark:text-[#B7B5D0] border-[#CDD0DF] dark:border-[#6657E8]/40',
      dot: 'bg-[#6657E8]'
    },
    cyan: {
      container:
        'bg-[#E0F7FC] text-[#079ACB] dark:bg-[#123B4A]/70 dark:text-[#35C7F4] border-[#079ACB]/30 dark:border-[#35C7F4]/40',
      dot: 'bg-[#35C7F4]'
    },
    success: {
      container:
        'bg-emerald-50 text-[#139E63] dark:bg-emerald-950/50 dark:text-[#35D58A] border-emerald-200 dark:border-emerald-800/60',
      dot: 'bg-[#35D58A]'
    },
    warning: {
      container:
        'bg-amber-50 text-[#C98600] dark:bg-amber-950/50 dark:text-[#F6B94A] border-amber-200 dark:border-amber-800/60',
      dot: 'bg-[#F6B94A]'
    },
    danger: {
      container:
        'bg-rose-50 text-[#D93652] dark:bg-rose-950/50 dark:text-[#FF5D73] border-rose-200 dark:border-rose-800/60',
      dot: 'bg-[#FF5D73]'
    },
    info: {
      container:
        'bg-blue-50 text-[#347FD1] dark:bg-blue-950/50 dark:text-[#5DA9FF] border-blue-200 dark:border-blue-800/60',
      dot: 'bg-[#5DA9FF]'
    },
    neutral: {
      container:
        'bg-slate-100 text-slate-700 dark:bg-[#1C1940] dark:text-[#B7B5D0] border-slate-200 dark:border-[#29264D]',
      dot: 'bg-slate-400 dark:bg-slate-500'
    }
  };

  const sz = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  const cfg = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border whitespace-nowrap leading-none ${sz} ${cfg.container} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />}
      {Icon && <Icon className="w-3 h-3 flex-shrink-0" />}
      <span>{label}</span>
    </span>
  );
};

/* =========================================================================
   BUTTONS
   ========================================================================= */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'cyan';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled,
  className = '',
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-4 py-2 gap-2',
    lg: 'text-sm sm:text-base px-5 py-2.5 gap-2.5'
  };

  const variants = {
    primary:
      'bg-gradient-to-r from-[#6657E8] to-[#7868FF] hover:from-[#5748D6] hover:to-[#6657E8] text-white shadow-md hover:shadow-lg shadow-[#6657E8]/20 border border-[#7868FF]/40',
    cyan:
      'bg-gradient-to-r from-[#079ACB] to-[#35C7F4] hover:from-[#0581AA] hover:to-[#079ACB] text-white shadow-md shadow-[#35C7F4]/20 border border-[#35C7F4]/40',
    secondary:
      'bg-white dark:bg-[#1C1940] hover:bg-slate-50 dark:hover:bg-[#242050] text-slate-800 dark:text-[#F5F5FF] border border-slate-200 dark:border-[#39345F] shadow-sm',
    ghost:
      'bg-transparent hover:bg-slate-100 dark:hover:bg-[#1C1940] text-slate-600 dark:text-[#B7B5D0] hover:text-slate-900 dark:hover:text-[#F5F5FF]',
    danger:
      'bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      )}
      {children}
    </button>
  );
};

/* =========================================================================
   METRIC CARDS
   ========================================================================= */

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  indicatorText?: string;
  indicatorStatus?: 'success' | 'warning' | 'info' | 'brand';
  subtext?: string;
  onClick?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon: Icon,
  indicatorText,
  indicatorStatus = 'brand',
  subtext,
  onClick,
  className = ''
}) => {
  const indicatorColors = {
    brand: 'text-[#6657E8] dark:text-[#7868FF] bg-[#ECEAFF] dark:bg-[#302A68]/60 border-[#6657E8]/20',
    success: 'text-[#139E63] dark:text-[#35D58A] bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500/20',
    warning: 'text-[#C98600] dark:text-[#F6B94A] bg-amber-50 dark:bg-amber-950/60 border-amber-500/20',
    info: 'text-[#079ACB] dark:text-[#35C7F4] bg-[#E0F7FC] dark:bg-[#123B4A]/60 border-[#35C7F4]/20'
  };

  return (
    <Card
      interactive={!!onClick}
      onClick={onClick}
      className={`p-5 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-[#B7B5D0]">
          {label}
        </span>
        <div className="w-8 h-8 rounded-xl bg-[#ECEAFF] dark:bg-[#1C1940] border border-[#CDD0DF] dark:border-[#39345F] flex items-center justify-center text-[#6657E8] dark:text-[#7868FF]">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-[#F5F5FF] font-mono">
          {value}
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px]">
          {indicatorText && (
            <span
              className={`px-2 py-0.5 rounded-full font-medium border text-[10px] ${indicatorColors[indicatorStatus]}`}
            >
              {indicatorText}
            </span>
          )}
          {subtext && (
            <span className="text-slate-400 dark:text-[#777492] font-mono">
              {subtext}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};

/* =========================================================================
   FEEDBACK STATES (EMPTY / LOADING / ERROR)
   ========================================================================= */

export const LoadingState: React.FC<{ message?: string; className?: string }> = ({
  message = 'Loading telemetry data...',
  className = ''
}) => {
  return (
    <div
      className={`py-12 flex flex-col items-center justify-center text-center text-slate-400 dark:text-[#B7B5D0] space-y-3 ${className}`}
    >
      <Loader2 className="w-8 h-8 animate-spin text-[#6657E8] dark:text-[#7868FF]" />
      <span className="text-xs font-medium tracking-wide">{message}</span>
    </div>
  );
};

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: LucideIcon;
  className?: string;
}> = ({
  title,
  description,
  actionText,
  onAction,
  icon: Icon = AlertCircle,
  className = ''
}) => {
  return (
    <div
      className={`py-12 px-6 rounded-2xl border border-dashed border-slate-300 dark:border-[#29264D] bg-slate-50/50 dark:bg-[#14122D]/40 flex flex-col items-center justify-center text-center space-y-3 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#1C1940] flex items-center justify-center text-slate-400 dark:text-[#B7B5D0]">
        <Icon className="w-6 h-6 text-[#6657E8] dark:text-[#7868FF]" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-[#F5F5FF]">{title}</h4>
        <p className="text-xs text-slate-500 dark:text-[#B7B5D0] max-w-sm mt-1">
          {description}
        </p>
      </div>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} className="mt-2">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export const ErrorState: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}> = ({
  title = 'Unable to Load Data',
  message,
  onRetry,
  className = ''
}) => {
  return (
    <div
      className={`p-6 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-center space-y-3 ${className}`}
    >
      <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
      <div>
        <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">{title}</h4>
        <p className="text-xs text-rose-700 dark:text-rose-400 mt-1 max-w-md mx-auto">
          {message}
        </p>
      </div>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          onClick={onRetry}
          className="mt-2 text-rose-800 dark:text-rose-200"
        >
          Retry Request
        </Button>
      )}
    </div>
  );
};

/* =========================================================================
   GLASSCARD (SECTIONS 8, 9)
   ========================================================================= */

export const GlassCard: React.FC<CardProps> = ({
  children,
  className = '',
  elevated = false,
  interactive = false,
  ...props
}) => {
  return (
    <div
      className={`rounded-2xl transition-all duration-200 ${
        elevated ? 'glass-elevated' : 'glass-standard'
      } ${
        interactive
          ? 'hover:border-[#6657E8]/50 dark:hover:border-[#7868FF]/50 hover:shadow-xl dark:hover:shadow-[0_0_25px_rgba(102,87,232,0.2)] cursor-pointer'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/* =========================================================================
   STATUS INDICATOR (SECTION 87)
   ========================================================================= */

export type EngineStatusType =
  | 'online'
  | 'processing'
  | 'validated'
  | 'verified'
  | 'pending'
  | 'blocked'
  | 'error';

interface StatusIndicatorProps {
  status: EngineStatusType;
  label?: string;
  pulse?: boolean;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  pulse = true,
  className = ''
}) => {
  const statusMap: Record<EngineStatusType, { color: string; bg: string; text: string; label: string }> = {
    online: {
      color: 'bg-[#35D58A]',
      bg: 'bg-emerald-500/20 text-[#139E63] dark:text-[#35D58A] border-emerald-500/30',
      text: 'text-[#139E63] dark:text-[#35D58A]',
      label: 'ONLINE'
    },
    processing: {
      color: 'bg-[#35C7F4]',
      bg: 'bg-[#35C7F4]/20 text-[#079ACB] dark:text-[#35C7F4] border-[#35C7F4]/30',
      text: 'text-[#079ACB] dark:text-[#35C7F4]',
      label: 'PROCESSING'
    },
    validated: {
      color: 'bg-[#35D58A]',
      bg: 'bg-emerald-500/20 text-[#139E63] dark:text-[#35D58A] border-emerald-500/30',
      text: 'text-[#139E63] dark:text-[#35D58A]',
      label: 'VALIDATED'
    },
    verified: {
      color: 'bg-[#35D58A]',
      bg: 'bg-emerald-500/20 text-[#139E63] dark:text-[#35D58A] border-emerald-500/30',
      text: 'text-[#139E63] dark:text-[#35D58A]',
      label: 'VERIFIED'
    },
    pending: {
      color: 'bg-[#F6B94A]',
      bg: 'bg-amber-500/20 text-[#C98600] dark:text-[#F6B94A] border-amber-500/30',
      text: 'text-[#C98600] dark:text-[#F6B94A]',
      label: 'PENDING'
    },
    blocked: {
      color: 'bg-[#FF5D73]',
      bg: 'bg-rose-500/20 text-[#D93652] dark:text-[#FF5D73] border-rose-500/30',
      text: 'text-[#D93652] dark:text-[#FF5D73]',
      label: 'BLOCKED'
    },
    error: {
      color: 'bg-[#FF5D73]',
      bg: 'bg-rose-500/20 text-[#D93652] dark:text-[#FF5D73] border-rose-500/30',
      text: 'text-[#D93652] dark:text-[#FF5D73]',
      label: 'ERROR'
    }
  };

  const current = statusMap[status] || statusMap.online;
  const displayLabel = label || current.label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border ${current.bg} ${className}`}
    >
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${current.color}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${current.color}`} />
      </span>
      <span>{displayLabel}</span>
    </span>
  );
};

/* =========================================================================
   PAGE & SECTION HEADERS
   ========================================================================= */

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: BadgeVariant;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  badgeVariant = 'brand',
  children,
  className = ''
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-[#29264D] ${className}`}
    >
      <div>
        {badge && (
          <div className="mb-1.5">
            <StatusBadge label={badge} variant={badgeVariant} size="sm" />
          </div>
        )}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F5F5FF]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#B7B5D0] mt-1 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-2.5 flex-wrap">{children}</div>}
    </div>
  );
};

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-between gap-4 mb-4 ${className}`}>
      <div>
        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-[#F5F5FF] tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-slate-500 dark:text-[#B7B5D0] mt-0.5">
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

