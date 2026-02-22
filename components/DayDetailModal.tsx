'use client'

import { format } from 'date-fns'
import { X, Plus, Check, X as XIcon, Clock, Flame } from 'lucide-react'
import { Goal } from '@/types'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface Props {
  date: Date
  goals: Goal[]
  onClose: () => void
  onAddGoal: () => void
  onGoalUpdated: (goal: Goal) => void
  onGoalDeleted: (id: string) => void
}

export default function DayDetailModal({ date, goals, onClose, onAddGoal, onGoalUpdated, onGoalDeleted }: Props) {
  const supabase = createClient()

  async function updateStatus(goal: Goal, status: 'completed' | 'missed' | 'pending') {
    const newStreak = status === 'completed' ? goal.streak_count + 1 : 0
    const { data, error } = await supabase
      .from('goals')
      .update({ status, streak_count: newStreak })
      .eq('id', goal.id)
      .select()
      .single()

    if (error) {
      toast.error('Failed to update')
    } else {
      // Log the action
      await supabase.from('goal_logs').insert({
        goal_id: goal.id,
        user_id: goal.user_id,
        status: status === 'pending' ? 'partial' : status,
      })
      onGoalUpdated(data as Goal)
      toast.success(status === 'completed' ? '✅ Marked complete!' : status === 'missed' ? 'Marked as missed' : 'Reset to pending')
    }
  }

  async function deleteGoal(id: string) {
    if (!confirm('Delete this goal?')) return
    const { error } = await supabase.from('goals').delete().eq('id', id)
    if (error) toast.error('Failed to delete')
    else { onGoalDeleted(id); toast.success('Goal deleted') }
  }

  const typeLabel: Record<string, string> = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-xl" style={{ color: 'var(--text-primary)' }}>
              {format(date, 'MMMM d')}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {format(date, 'EEEE, yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { onClose(); setTimeout(onAddGoal, 100) }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
            >
              <Plus size={12} /> Add
            </button>
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
              <X size={14} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
        </div>

        {/* Goals */}
        {goals.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No goals for this day</p>
            <button
              onClick={() => { onClose(); setTimeout(onAddGoal, 100) }}
              className="btn-primary mt-4"
            >
              Add a goal
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="rounded-xl p-4 border"
                style={{
                  borderColor: goal.status === 'completed'
                    ? 'rgba(93,143,98,0.3)'
                    : goal.status === 'missed'
                      ? 'rgba(188,92,82,0.3)'
                      : 'var(--border)',
                  background: goal.status === 'completed'
                    ? 'rgba(93,143,98,0.05)'
                    : goal.status === 'missed'
                      ? 'rgba(188,92,82,0.05)'
                      : 'var(--bg)',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs px-1.5 py-0.5 rounded font-mono"
                        style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
                      >
                        {typeLabel[goal.type]}
                      </span>
                      {goal.streak_count > 1 && (
                        <span className="flex items-center gap-0.5 text-xs" style={{ color: 'var(--accent-amber)' }}>
                          <Flame size={11} />
                          {goal.streak_count}
                        </span>
                      )}
                    </div>
                    <h3
                      className="font-medium text-sm mt-1.5"
                      style={{
                        color: 'var(--text-primary)',
                        textDecoration: goal.status === 'completed' ? 'line-through' : 'none',
                        opacity: goal.status === 'missed' ? 0.6 : 1,
                      }}
                    >
                      {goal.title}
                    </h3>
                    {goal.description && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{goal.description}</p>
                    )}
                    {goal.reminder_time && (
                      <div className="flex items-center gap-1 mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <Clock size={10} />
                        {goal.reminder_time}
                      </div>
                    )}
                  </div>

                  {/* Status actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateStatus(goal, goal.status === 'completed' ? 'pending' : 'completed')}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                      style={{
                        background: goal.status === 'completed' ? 'var(--accent-green)' : 'var(--bg-secondary)',
                        color: goal.status === 'completed' ? 'white' : 'var(--text-muted)',
                      }}
                      title="Mark complete"
                    >
                      <Check size={13} />
                    </button>
                    <button
                      onClick={() => updateStatus(goal, goal.status === 'missed' ? 'pending' : 'missed')}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                      style={{
                        background: goal.status === 'missed' ? 'var(--accent-rose)' : 'var(--bg-secondary)',
                        color: goal.status === 'missed' ? 'white' : 'var(--text-muted)',
                      }}
                      title="Mark missed"
                    >
                      <XIcon size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
