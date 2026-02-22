'use client'

import { useState } from 'react'
import { Profile } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { MessageCircle, CheckCircle2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props { profile: Profile | null }

export default function SettingsClient({ profile }: Props) {
  const supabase = createClient()
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [timezone, setTimezone] = useState(profile?.timezone || 'UTC')
  const [phone, setPhone] = useState(profile?.whatsapp_number || '')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(profile?.whatsapp_verified || false)

  const TIMEZONES = [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'America/Toronto', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo',
    'Asia/Shanghai', 'Asia/Kolkata', 'Asia/Karachi', 'Australia/Sydney',
  ]

  async function saveProfile() {
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName, timezone, whatsapp_number: phone })
      .eq('id', profile!.id)
    if (error) toast.error('Failed to save')
    else toast.success('Profile saved!')
    setSaving(false)
  }

  async function sendVerificationCode() {
    if (!phone) { toast.error('Enter your phone number first'); return }
    setSendingCode(true)
    const res = await fetch('/api/whatsapp-verify/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    const data = await res.json()
    if (data.success) {
      setCodeSent(true)
      toast.success('Code sent to WhatsApp!')
    } else {
      toast.error(data.error || 'Failed to send code')
    }
    setSendingCode(false)
  }

  async function verifyCode() {
    if (!code) return
    setVerifying(true)
    const res = await fetch('/api/whatsapp-verify/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    })
    const data = await res.json()
    if (data.success) {
      setVerified(true)
      setCodeSent(false)
      toast.success('WhatsApp verified! 🎉')
    } else {
      toast.error(data.error || 'Invalid code')
    }
    setVerifying(false)
  }

  return (
    <div className="animate-slide-up max-w-lg">
      <h1 className="font-display text-3xl mb-6" style={{ color: 'var(--text-primary)' }}>Settings</h1>

      {/* Profile section */}
      <section className="card p-6 mb-4">
        <h2 className="font-display text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Display name</label>
            <input
              type="text"
              className="input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
            <input type="email" className="input" value={profile?.email || ''} disabled style={{ opacity: 0.5 }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Timezone</label>
            <select
              className="input"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
          <button onClick={saveProfile} className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </section>

      {/* WhatsApp section */}
      <section className="card p-6">
        <div className="flex items-center gap-2 mb-1">
          <MessageCircle size={16} style={{ color: 'var(--accent-green)' }} />
          <h2 className="font-display text-lg" style={{ color: 'var(--text-primary)' }}>WhatsApp Reminders</h2>
        </div>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          Verify your number to receive goal reminders via WhatsApp at your chosen times.
        </p>

        {verified && (
          <div
            className="flex items-center gap-2 p-3 rounded-lg mb-4 text-sm"
            style={{ background: 'rgba(93,143,98,0.1)', color: 'var(--accent-green)' }}
          >
            <CheckCircle2 size={15} />
            {profile?.whatsapp_number} is verified
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Phone number (with country code)
            </label>
            <input
              type="tel"
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+923001234567"
              disabled={verified}
            />
          </div>

          {!verified && !codeSent && (
            <button onClick={sendVerificationCode} className="btn-secondary w-full" disabled={sendingCode || !phone}>
              {sendingCode ? 'Sending...' : 'Send verification code'}
            </button>
          )}

          {codeSent && (
            <>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  6-digit code from WhatsApp
                </label>
                <input
                  type="text"
                  className="input font-mono"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setCodeSent(false)} className="btn-secondary flex-1">Back</button>
                <button onClick={verifyCode} className="btn-primary flex-1" disabled={verifying || code.length !== 6}>
                  {verifying ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </>
          )}

          {verified && (
            <button
              onClick={() => { setVerified(false); setPhone('') }}
              className="btn-secondary w-full text-sm"
            >
              Change number
            </button>
          )}

          <div
            className="flex items-start gap-2 p-3 rounded-lg text-xs"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
          >
            <AlertCircle size={13} className="shrink-0 mt-0.5" />
            <span>
              Uses Twilio WhatsApp sandbox. You must first send <strong>"join [sandbox-word]"</strong> to{' '}
              <strong>+1 415 523 8886</strong> on WhatsApp to opt in.
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
