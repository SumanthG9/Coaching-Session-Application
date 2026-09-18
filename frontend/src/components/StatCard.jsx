
const COLOR_MAP = {
  indigo: {
    badge: 'bg-indigo-50 text-indigo-700',
    title: 'text-indigo-700',
  },
  purple: {
    badge: 'bg-purple-50 text-purple-600',
    title: 'text-purple-700',
  },
  amber: {
    badge: 'bg-amber-50 text-amber-600',
    title: 'text-amber-700',
  },
  emerald: {
    badge: 'bg-emerald-50 text-emerald-600',
    title: 'text-emerald-700',
  },
  slate: {
    badge: 'bg-slate-100 text-slate-700',
    title: 'text-slate-500',
  },
};

function StatCard({ label, value, icon: Icon, description, color = 'slate' }) {
  const theme = COLOR_MAP[color] || COLOR_MAP.slate;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-semibold ${theme.title}`}>{label}</span>
        {Icon && (
          <div className={`w-8 h-8 rounded-xl ${theme.badge} flex items-center justify-center shrink-0`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div>
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</span>
        {description && <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>}
      </div>
    </div>
  );
}

export default StatCard;
