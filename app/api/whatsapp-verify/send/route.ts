import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendVerificationCode, generateVerificationCode } from '@/lib/whatsapp'

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()
    if (!phone) return NextResponse.json({ error: 'Phone required' }, { status: 400 })

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const code = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    // Store code
    await supabase.from('whatsapp_verifications').insert({
      user_id: user.id,
      phone_number: phone,
      code,
      expires_at: expiresAt,
    })

    // Save phone number to profile
    await supabase.from('profiles').update({ whatsapp_number: phone }).eq('id', user.id)

    // Send via Twilio
    await sendVerificationCode(phone, code)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('WhatsApp verify send error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
