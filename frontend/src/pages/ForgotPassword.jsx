import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="card p-10 w-full max-w-md shadow-sm">
        {sent ? (
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-green-600 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
            </div>
            <h1 className="font-headline font-extrabold text-2xl text-on-surface mb-2">Check your inbox</h1>
            <p className="text-on-surface-variant text-sm mb-6">
              If an account exists for <strong>{email}</strong>, you'll receive a password reset link shortly. Check your spam folder if you don't see it.
            </p>
            <Link to="/login" className="text-primary font-bold hover:underline text-sm">← Back to Login</Link>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-2xl">lock_reset</span>
              </div>
              <h1 className="text-2xl font-extrabold text-on-surface font-headline mb-2">Forgot Password?</h1>
              <p className="text-on-surface-variant text-sm">Enter your email and we'll send you a reset link.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-outline uppercase tracking-widest ml-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="input-field"
                />
              </div>

              {error && <p className="text-sm text-error text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center"
              >
                {loading ? (
                  <><span className="material-symbols-outlined animate-spin text-base">progress_activity</span> Sending...</>
                ) : (
                  <><span className="material-symbols-outlined text-base">send</span> Send Reset Link</>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-on-surface-variant mt-6">
              Remembered it?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">Back to Login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
