export default function StatCard({ icon, label, value, trend }) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">{icon}</span>
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            trend > 0 ? 'bg-green-50 text-green-700' : 'bg-error-container text-error'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-3xl font-headline font-extrabold text-on-surface mb-1">{value}</p>
      <p className="text-sm text-on-surface-variant">{label}</p>
    </div>
  )
}
