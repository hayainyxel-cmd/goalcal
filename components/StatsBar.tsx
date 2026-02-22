'use client'

interface Stats {
  total: number
  completed: number
  pending: number
  missed: number
  rate: number
}

export default function StatsBar({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {[
        { label: 'Total', value: stats.total, color: 'var(--text-secondary)' },
        { label: 'Done', value: stats.completed, color: 'var(--accent-green)' },
        { label: 'Pending', value: stats.pending, color: 'var(--accent-amber)' },
        { label: 'Rate', value: `${stats.rate}%`, color: stats.rate >= 70 ? 'var(--accent-green)' : stats.rate >= 40 ? 'var(--accent-amber)' : 'var(--accent-rose)' },
      ].map(({ label, value, color }) => (
        <div key={label} className="card p-3 text-center">
          <div className="font-display text-xl" style={{ color }}>{value}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
        </div>
      ))}
    </div>
  )
}
