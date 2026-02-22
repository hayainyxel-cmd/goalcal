import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendGoalReminder } from '@/lib/whatsapp'
import { format } from 'date-fns'

// Vercel Cron calls this every minute
// Add this to vercel.json: { "crons": [{ "path": "/api/reminders/send", "schedule": "* * * * *" }] }

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServiceClient()
    const now = new Date()
    const currentTime = format(now, 'HH:mm')
    const today = format(now, 'yyyy-MM-dd')

    // Find goals with reminders due now (within this minute) that haven't been sent
    const { data: goals } = await supabase
      .from('goals')
      .select(`
        *,
        profiles!inner(whatsapp_number, whatsapp_verified, timezone)
      `)
      .eq('reminder_sent', false)
      .eq('status', 'pending')
      .eq('profiles.whatsapp_verified', true)
      .not('reminder_time', 'is', null)
      .not('profiles.whatsapp_number', 'is', null)

    if (!goals || goals.length === 0) {
      return NextResponse.json({ sent: 0 })
    }

    let sent = 0
    const errors: string[] = []

    for (const goal of goals) {
      const profile = (goal as any).profiles
      // Compare reminder time (HH:mm)
      const reminderHHMM = goal.reminder_time?.slice(0, 5)
      if (reminderHHMM !== currentTime) continue

      // Check the goal is relevant for today
      let isRelevant = false
      if (goal.type === 'daily' && goal.target_date === today) isRelevant = true
      if (goal.type === 'weekly' || goal.type === 'monthly') isRelevant = true // Send on any day within period

      if (!isRelevant) continue

      try {
        await sendGoalReminder(profile.whatsapp_number, goal.title, goal.type)
        await supabase.from('goals').update({ reminder_sent: true }).eq('id', goal.id)
        sent++
      } catch (err: any) {
        errors.push(`Goal ${goal.id}: ${err.message}`)
      }
    }

    return NextResponse.json({ sent, errors })
  } catch (err: any) {
    console.error('Cron reminder error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
