'use client'

import { useState } from 'react'
import { format, startOfWeek, startOfMonth } from 'date-fns'
import { X, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Goal, GoalType } from '@/types'
import toast from 'react-hot-toast'

interface Props {
  defaultDate: Date
  onClose: () => void
  onCreated: (goal: Goal) => void
}

const GOAL_TYPES: { value: GoalType; label: string; desc: string }[] = [
  { value: 'daily', label: 'Daily', desc: 'Repeats each day' },
  { value: 'weekly', label: 'Weekly', desc: 'Spans a full week' },
  { value: 'monthly', label: 'Monthly', desc: 'Spans a full month' },
]

export default function GoalModal({ defaultDate, onClose, onCreated }: Props) {
  const supabase = createClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<GoalType>('daily')
  const [reminderTime, setReminderTime] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const weekStart = format(startOfWeek(defaultDate, { weekStartsOn: 1 }), 'yyyy-MM-dd')
    const monthStart = format(startOfMonth(defaultDate), 'yyyy-MM-dd')

    const goalData = {
      user_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      type,
      target_date: type === 'daily' ? format(defaultDate, 'yyyy-MM-dd') : null,
      target_week_start: type === 'weekly' ? weekStart : null,
      target_month: type === 'monthly' ? monthStart : null,
      reminder_time: reminderTime || null,
      status: 'pending',
    }

    const { data, error } = await supabase.from('goals').insert(goalData).select().single()

    if (error) {
      toast.error('Failed to create goal')
    } else {
      toast.success('Goal created!')
      onCreated(data as Goal)
    }
    setLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-xl" style={{ color: 'var(--text-primary)' }}>New Goal</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {format(defaultDate, 'EEEE, MMMM d')}
            </p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
            <X size={14} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Goal type */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Type</label>
            <div className="grid grid-cols-3 gap-2">
              {GOAL_TYPES.map(({ value, label, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className="p-2.5 rounded-lg border text-left transition-all"
                  style={{
                    borderColor: type === value ? 'var(--accent-green)' : 'var(--border)',
                    background: type === value ? 'rgba(93,143,98,0.08)' : 'var(--bg)',
                  }}
                >
                  <div className="text-xs font-medium" style={{ color: type === value ? 'var(--accent-green)' : 'var(--text-primary)' }}>{label}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Goal title</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Morning run, Read 20 pages..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Notes (optional)</label>
            <textarea
              className="input resize-none"
              placeholder="Any details or context..."
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Reminder */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              <span className="flex items-center gap-1.5">
                <Clock size={12} />
                WhatsApp reminder (optional)
              </span>
            </label>
            <input
              type="time"
              className="input"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Requires verified WhatsApp number in Settings
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Saving...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
