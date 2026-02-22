import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json()
    if (!phone || !code) return NextResponse.json({ error: 'Phone and code required' }, { status: 400 })

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Find valid code
    const { data: verification } = await supabase
      .from('whatsapp_verifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('phone_number', phone)
      .eq('code', code)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!verification) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
    }

    // Mark verified
    await supabase.from('whatsapp_verifications').update({ verified: true }).eq('id', verification.id)
    await supabase.from('profiles').update({ whatsapp_verified: true, whatsapp_number: phone }).eq('id', user.id)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('WhatsApp verify confirm error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
