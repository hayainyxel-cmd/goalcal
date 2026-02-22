import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  format,
  addMonths,
  subMonths,
  parseISO,
  startOfWeek as getWeekStart,
  startOfMonth as getMonthStart,
} from 'date-fns'
import { Goal, CalendarDay } from '@/types'

export function getCalendarDays(currentDate: Date, goals: Goal[]): CalendarDay[] {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  return days.map((date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const weekStart = format(getWeekStart(date, { weekStartsOn: 1 }), 'yyyy-MM-dd')
    const monthStr = format(getMonthStart(date), 'yyyy-MM-dd')

    const dayGoals = goals.filter((g) => {
      if (g.type === 'daily') return g.target_date === dateStr
      if (g.type === 'weekly') return g.target_week_start === weekStart
      if (g.type === 'monthly') return g.target_month === monthStr
      return false
    })

    // Deduplicate weekly/monthly goals by ID
    const uniqueGoals = Array.from(new Map(dayGoals.map((g) => [g.id, g])).values())

    return {
      date,
      isCurrentMonth: isSameMonth(date, currentDate),
      isToday: isToday(date),
      goals: uniqueGoals,
      completedCount: uniqueGoals.filter((g) => g.status === 'completed').length,
      pendingCount: uniqueGoals.filter((g) => g.status === 'pending').length,
      missedCount: uniqueGoals.filter((g) => g.status === 'missed').length,
    }
  })
}

export function getMonthStats(goals: Goal[]) {
  const total = goals.length
  const completed = goals.filter((g) => g.status === 'completed').length
  const missed = goals.filter((g) => g.status === 'missed').length
  const pending = goals.filter((g) => g.status === 'pending').length
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0

  return { total, completed, missed, pending, rate }
}

export function getStreakForGoal(goalTitle: string, goals: Goal[]): number {
  const matching = goals
    .filter((g) => g.title === goalTitle && g.type === 'daily')
    .sort((a, b) => (a.target_date || '').localeCompare(b.target_date || ''))

  let streak = 0
  for (let i = matching.length - 1; i >= 0; i--) {
    if (matching[i].status === 'completed') streak++
    else break
  }
  return streak
}

export { format, addMonths, subMonths, parseISO }
