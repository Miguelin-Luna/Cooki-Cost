export default function StatsCard({ icon: Icon, label, value, trend }) {
  return (
    <div className="glass rounded-2xl p-5 border border-espresso-600/50 card-hover flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-espresso-700/50 flex items-center justify-center text-gold-400 shrink-0">
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm text-cream-300 mb-1">{label}</p>
        <h4 className="text-2xl font-display font-bold text-cream-100">{value}</h4>
        {trend && (
          <p className={`text-xs mt-1 ${trend.startsWith('+') ? 'text-success' : 'text-danger'}`}>
            {trend}
          </p>
        )}
      </div>
    </div>
  );
}
