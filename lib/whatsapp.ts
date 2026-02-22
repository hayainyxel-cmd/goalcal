import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

const FROM = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'

export async function sendWhatsAppMessage(to: string, body: string) {
  const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`
  return client.messages.create({ from: FROM, to: formattedTo, body })
}

export async function sendVerificationCode(phone: string, code: string) {
  const body = `🔐 Your GoalCal verification code is: *${code}*\n\nThis code expires in 10 minutes.`
  return sendWhatsAppMessage(phone, body)
}

export async function sendGoalReminder(phone: string, goalTitle: string, goalType: string) {
  const emoji = goalType === 'daily' ? '📅' : goalType === 'weekly' ? '📆' : '🗓️'
  const body = `${emoji} *GoalCal Reminder*\n\nTime to work on your ${goalType} goal:\n\n"${goalTitle}"\n\nYou've got this! Open GoalCal to log your progress. 💪`
  return sendWhatsAppMessage(phone, body)
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
