export type GoalType = 'daily' | 'weekly' | 'monthly'
export type GoalStatus = 'pending' | 'completed' | 'missed'
export type Theme = 'light' | 'dark'

export interface Profile {
  id: string
  email: string
  display_name: string | null
  whatsapp_number: string | null
  whatsapp_verified: boolean
  theme: Theme
  timezone: string
  created_at: string
  updated_at: string
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description: string | null
  type: GoalType
  status: GoalStatus
  target_date: string | null
  target_week_start: string | null
  target_month: string | null
  reminder_time: string | null
  reminder_sent: boolean
  streak_count: number
  created_at: string
  updated_at: string
}

export interface GoalLog {
  id: string
  goal_id: string
  user_id: string
  logged_at: string
  note: string | null
  status: 'completed' | 'missed' | 'partial'
}

export interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  goals: Goal[]
  completedCount: number
  pendingCount: number
  missedCount: number
}
