import React from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, Sparkles } from 'lucide-react';

function StatusBadge({ status, size = 'md' }) {
  const normalized = (status || '').toLowerCase();

  const configs = {
    pending: {
      label: 'Pending',
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-700',
      dot: 'bg-amber-500',
      icon: Clock,
    },
    accepted: {
      label: 'Accepted',
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700',
      dot: 'bg-emerald-500',
      icon: CheckCircle2,
    },
    completed: {
      label: 'Completed',
      bg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-700',
      dot: 'bg-indigo-500',
      icon: Sparkles,
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-slate-500/10 border-slate-500/30 text-slate-600',
      dot: 'bg-slate-400',
      icon: XCircle,
    },
    rejected: {
      label: 'Rejected',
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-700',
      dot: 'bg-rose-500',
      icon: AlertCircle,
    },
  };

  const current = configs[normalized] || {
    label: status || 'Unknown',
    bg: 'bg-slate-100 border-slate-300 text-slate-700',
    dot: 'bg-slate-400',
    icon: Clock,
  };

  const Icon = current.icon;
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-xs transition-colors duration-150 ${sizeClasses} ${current.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot} ${normalized === 'pending' ? 'animate-pulse' : ''}`} />
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span className="capitalize">{current.label}</span>
    </span>
  );
}

export default StatusBadge;
