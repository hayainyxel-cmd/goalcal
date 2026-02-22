'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Account created! Signing you in...')
      // Sign in immediately
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (!signInError) {
        router.push('/dashboard')
        router.refresh()
      }
    }
    setLoading(false)
  }

  return (
    <div className="card p-8 animate-slide-up">
      <h1 className="font-display text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>Create account</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Start tracking your goals today</p>

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Name</label>
          <input
            type="text"
            className="input"
            placeholder="Alex"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
          <input
            type="email"
            className="input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
          <input
            type="password"
            className="input"
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-sm text-center mt-6" style={{ color: 'var(--text-muted)' }}>
        Already have an account?{' '}
        <Link href="/auth/login" className="underline" style={{ color: 'var(--text-secondary)' }}>
          Sign in
        </Link>
      </p>
    </div>
  )
}
