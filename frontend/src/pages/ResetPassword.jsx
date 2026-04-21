import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../lib/api'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const id = searchParams.get('id')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  if (!token || !id) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="card p-10 w-full max-w-md text-center shadow-sm">
          <span className="material-symbols-outlined text-5xl text-error mb-4 block">link_off</span>
          <h1 className="font-headline font-bold text-xl mb-2">Invalid Reset Link</h1>
          <p className="text-on-surface-variant text-sm mb-6">This link is invalid or has expired. Please request a new one.</p>
          <Link to="/forgot-password" className="btn-primary">Request New Link</Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { id, token, newPassword: password })
      setDone(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      const code = err?.response?.data?.error
      setError(code === 'TOKEN_EXPIRED' ? 'This link has expired. Please request a new reset link.' : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="card p-10 w-full max-w-md shadow-sm">
        {done ? (
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-green-600 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h1 className="font-headline font-extrabold text-2xl text-on-surface mb-2">Password Updated!</h1>
            <p className="text-on-surface-variant text-sm mb-1">Your password has been changed successfully.</p>
            <p className="text-xs text-outline">Redirecting to login...</p>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-2xl">lock</span>
              </div>
              <h1 className="text-2xl font-extrabold text-on-surface font-headline mb-2">Set New Password</h1>
              <p className="text-on-surface-variant text-sm">Choose a strong password with at least 8 characters.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-outline uppercase tracking-widest ml-1">New Password</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" className="input-field" />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-outline uppercase tracking-widest ml-1">Confirm Password</label>
                <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat your password" className="input-field" />
              </div>

              {/* Strength indicator */}
              <div className="flex gap-1">
                {[1,2,3,4].map(n => (
                  <div key={n} className={`flex-1 h-1.5 rounded-full transition-all ${
                    password.length === 0 ? 'bg-slate-200' :
                    password.length < 8 && n === 1 ? 'bg-red-400' :
                    password.length >= 8 && n <= 2 ? 'bg-amber-400' :
                    password.length >= 12 && n <= 3 ? 'bg-green-400' :
                    password.length >= 16 && n <= 4 ? 'bg-green-500' :
                    'bg-slate-200'
                  }`} />
                ))}
              </div>

              {error && <p className="text-sm text-error text-center">{error}</p>}

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                {loading ? <><span className="material-symbols-outlined animate-spin text-base">progress_activity</span> Saving...</> : 'Update Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
