'use client'

import { useState } from 'react'
import { Goal, GoalType } from '@/types'
import { format } from 'date-fns'
import { Flame, Check, X, Trash2, Filter } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface Props { initialGoals: Goal[] }

const FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'missed', label: 'Missed' },
]

export default function GoalsClient({ initialGoals }: Props) {
  const supabase = createClient()
  const [goals, setGoals] = useState(initialGoals)
  const [filter, setFilter] = useState('all')

  const filtered = goals.filter((g) => {
    if (filter === 'all') return true
    if (['daily', 'weekly', 'monthly'].includes(filter)) return g.type === filter
    return g.status === filter
  })

  async function updateStatus(goal: Goal, status: 'completed' | 'missed' | 'pending') {
    const { data, error } = await supabase
      .from('goals')
      .update({ status, streak_count: status === 'completed' ? goal.streak_count + 1 : 0 })
      .eq('id', goal.id)
      .select()
      .single()
    if (!error) setGoals((prev) => prev.map((g) => g.id === goal.id ? data as Goal : g))
  }

  async function deleteGoal(id: string) {
    if (!confirm('Delete this goal?')) return
    const { error } = await supabase.from('goals').delete().eq('id', id)
    if (!error) {
      setGoals((prev) => prev.filter((g) => g.id !== id))
      toast.success('Deleted')
    }
  }

  const statusColor = (s: string) =>
    s === 'completed' ? 'var(--accent-green)' : s === 'missed' ? 'var(--accent-rose)' : 'var(--accent-amber)'

  const typeBadge = (t: GoalType) =>
    ({ daily: '📅', weekly: '📆', monthly: '🗓️' })[t]

  return (
    <div className="animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl" style={{ color: 'var(--text-primary)' }}>All Goals</h1>
        <span className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>{filtered.length} items</span>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className="px-3 py-1 rounded-full text-xs font-medium transition-all border"
            style={{
              borderColor: filter === value ? 'var(--accent-green)' : 'var(--border)',
              background: filter === value ? 'rgba(93,143,98,0.1)' : 'transparent',
              color: filter === value ? 'var(--accent-green)' : 'var(--text-muted)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Goals */}
      {filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-3xl mb-2">🎯</div>
          <p style={{ color: 'var(--text-muted)' }} className="text-sm">No goals found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((goal) => (
            <div key={goal.id} className="card p-4 flex items-center gap-4">
              <div className="text-lg">{typeBadge(goal.type)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3
                    className="font-medium text-sm"
                    style={{
                      color: 'var(--text-primary)',
                      textDecoration: goal.status === 'completed' ? 'line-through' : 'none',
                      opacity: goal.status === 'missed' ? 0.5 : 1,
                    }}
                  >
                    {goal.title}
                  </h3>
                  {goal.streak_count > 1 && (
                    <span className="flex items-center gap-0.5 text-xs" style={{ color: 'var(--accent-amber)' }}>
                      <Flame size={11} />{goal.streak_count}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    {goal.target_date || goal.target_week_start || goal.target_month
                      ? format(new Date(goal.target_date || goal.target_week_start || goal.target_month || ''), 'MMM d, yyyy')
                      : '—'}
                  </span>
                  <span className="text-xs font-medium" style={{ color: statusColor(goal.status) }}>
                    {goal.status}
                  </span>
                  {goal.reminder_time && (
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>⏰ {goal.reminder_time}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => updateStatus(goal, goal.status === 'completed' ? 'pending' : 'completed')}
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: goal.status === 'completed' ? 'var(--accent-green)' : 'var(--bg-secondary)', color: goal.status === 'completed' ? 'white' : 'var(--text-muted)' }}
                >
                  <Check size={13} />
                </button>
                <button
                  onClick={() => updateStatus(goal, goal.status === 'missed' ? 'pending' : 'missed')}
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: goal.status === 'missed' ? 'var(--accent-rose)' : 'var(--bg-secondary)', color: goal.status === 'missed' ? 'white' : 'var(--text-muted)' }}
                >
                  <X size={13} />
                </button>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
