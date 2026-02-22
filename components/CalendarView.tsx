'use client'

import { useState, useCallback } from 'react'
import { format, addMonths, subMonths, startOfWeek, startOfMonth } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Goal } from '@/types'
import { getCalendarDays, getMonthStats } from '@/lib/calendar'
import GoalModal from './GoalModal'
import DayDetailModal from './DayDetailModal'
import StatsBar from './StatsBar'

interface Props {
  initialGoals: Goal[]
}

export default function CalendarView({ initialGoals }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [goals, setGoals] = useState<Goal[]>(initialGoals)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [addGoalDate, setAddGoalDate] = useState<Date>(new Date())

  const days = getCalendarDays(currentDate, goals)
  const stats = getMonthStats(
    goals.filter((g) => {
      const monthStr = format(currentDate, 'yyyy-MM')
      if (g.type === 'daily') return g.target_date?.startsWith(monthStr)
      if (g.type === 'weekly') return g.target_week_start?.startsWith(monthStr)
      if (g.type === 'monthly') return g.target_month?.startsWith(monthStr)
      return false
    })
  )

  function handleDayClick(date: Date) {
    setSelectedDate(date)
  }

  function handleAddGoal(date: Date) {
    setAddGoalDate(date)
    setShowAddGoal(true)
  }

  function handleGoalCreated(goal: Goal) {
    setGoals((prev) => [goal, ...prev])
    setShowAddGoal(false)
  }

  function handleGoalUpdated(updated: Goal) {
    setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)))
  }

  function handleGoalDeleted(id: string) {
    setGoals((prev) => prev.filter((g) => g.id !== id))
    setSelectedDate(null)
  }

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl" style={{ color: 'var(--text-primary)' }}>
            {format(currentDate, 'MMMM yyyy')}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {format(new Date(), 'EEEE, d MMMM')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'var(--bg-secondary)' }}
          >
            <ChevronLeft size={16} style={{ color: 'var(--text-secondary)' }} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'var(--bg-secondary)' }}
          >
            <ChevronRight size={16} style={{ color: 'var(--text-secondary)' }} />
          </button>
          <button
            onClick={() => handleAddGoal(new Date())}
            className="btn-primary flex items-center gap-1.5 ml-2"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Add Goal</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsBar stats={stats} />

      {/* Calendar grid */}
      <div className="card overflow-hidden mt-5">
        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b" style={{ borderColor: 'var(--border)' }}>
          {weekDays.map((d) => (
            <div
              key={d}
              className="py-2.5 text-center text-xs font-medium font-mono"
              style={{ color: 'var(--text-muted)' }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const isLast = i >= days.length - 7
            const isRightEdge = (i + 1) % 7 === 0

            return (
              <div
                key={day.date.toISOString()}
                onClick={() => handleDayClick(day.date)}
                className={`
                  cal-cell relative p-1.5 sm:p-2 cursor-pointer min-h-[60px] sm:min-h-[80px]
                  ${!isLast ? 'border-b' : ''}
                  ${!isRightEdge ? 'border-r' : ''}
                `}
                style={{ borderColor: 'var(--border)' }}
              >
                {/* Date number */}
                <div className="flex items-start justify-between">
                  <span
                    className={`
                      w-6 h-6 flex items-center justify-center rounded-full text-xs font-mono font-medium
                      ${day.isToday
                        ? 'text-white'
                        : day.isCurrentMonth
                          ? ''
                          : 'opacity-30'
                      }
                    `}
                    style={{
                      background: day.isToday ? 'var(--text-primary)' : 'transparent',
                      color: day.isToday ? 'var(--bg)' : 'var(--text-primary)',
                    }}
                  >
                    {format(day.date, 'd')}
                  </span>

                  {/* Add button on hover */}
                  {day.isCurrentMonth && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAddGoal(day.date) }}
                      className="w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:opacity-100"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <Plus size={10} />
                    </button>
                  )}
                </div>

                {/* Goal dots */}
                {day.goals.length > 0 && (
                  <div className="flex flex-wrap gap-0.5 mt-1.5">
                    {day.completedCount > 0 && (
                      <span className="goal-dot dot-completed" title={`${day.completedCount} completed`} />
                    )}
                    {day.pendingCount > 0 && (
                      <span className="goal-dot dot-pending" title={`${day.pendingCount} pending`} />
                    )}
                    {day.missedCount > 0 && (
                      <span className="goal-dot dot-missed" title={`${day.missedCount} missed`} />
                    )}
                  </div>
                )}

                {/* Goal titles (desktop) */}
                <div className="hidden sm:block mt-1 space-y-0.5">
                  {day.goals.slice(0, 2).map((goal) => (
                    <div
                      key={goal.id}
                      className="text-xs truncate px-1 py-0.5 rounded"
                      style={{
                        background: goal.status === 'completed'
                          ? 'rgba(93,143,98,0.12)'
                          : goal.status === 'missed'
                            ? 'rgba(188,92,82,0.12)'
                            : 'rgba(212,160,53,0.12)',
                        color: goal.status === 'completed'
                          ? 'var(--accent-green)'
                          : goal.status === 'missed'
                            ? 'var(--accent-rose)'
                            : 'var(--accent-amber)',
                      }}
                    >
                      {goal.title}
                    </div>
                  ))}
                  {day.goals.length > 2 && (
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      +{day.goals.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 px-1">
        {[
          { label: 'Completed', cls: 'dot-completed' },
          { label: 'Pending', cls: 'dot-pending' },
          { label: 'Missed', cls: 'dot-missed' },
        ].map(({ label, cls }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`goal-dot ${cls}`} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Modals */}
      {selectedDate && (
        <DayDetailModal
          date={selectedDate}
          goals={goals.filter((g) => {
            const dateStr = format(selectedDate, 'yyyy-MM-dd')
            const weekStart = format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'yyyy-MM-dd')
            const monthStr = format(startOfMonth(selectedDate), 'yyyy-MM-dd')
            if (g.type === 'daily') return g.target_date === dateStr
            if (g.type === 'weekly') return g.target_week_start === weekStart
            if (g.type === 'monthly') return g.target_month === monthStr
            return false
          })}
          onClose={() => setSelectedDate(null)}
          onAddGoal={() => handleAddGoal(selectedDate)}
          onGoalUpdated={handleGoalUpdated}
          onGoalDeleted={handleGoalDeleted}
        />
      )}

      {showAddGoal && (
        <GoalModal
          defaultDate={addGoalDate}
          onClose={() => setShowAddGoal(false)}
          onCreated={handleGoalCreated}
        />
      )}
    </div>
  )
}
