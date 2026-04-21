import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('pharmalink_cookie_consent')
    if (!consent) {
      // Small delay so it doesn't pop instantly on page load
      const t = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(t)
    }
  }, [])

  const accept = () => {
    localStorage.setItem('pharmalink_cookie_consent', 'accepted')
    setVisible(false)
  }

  const decline = () => {
    localStorage.setItem('pharmalink_cookie_consent', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] px-4 pb-4 pointer-events-none"
      style={{ animation: 'slideUp 0.4s ease' }}
    >
      <div className="max-w-3xl mx-auto bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 p-5 md:p-6 pointer-events-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <span className="material-symbols-outlined text-primary text-2xl flex-shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>cookie</span>
            <div>
              <p className="font-headline font-bold text-white text-sm mb-1">We use cookies</p>
              <p className="text-slate-300 text-xs leading-relaxed">
                We use cookies to improve your browsing experience and analyze site traffic.
                By clicking "Accept", you agree to our{' '}
                <Link to="/privacy" className="text-primary hover:underline font-medium" onClick={accept}>
                  Privacy Policy
                </Link>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto">
            <button
              onClick={decline}
              className="flex-1 md:flex-none px-4 py-2 text-sm font-bold text-slate-400 hover:text-white border border-slate-600 rounded-xl transition-colors hover:border-slate-400"
            >
              Decline
            </button>
            <button
              onClick={accept}
              className="flex-1 md:flex-none px-5 py-2 text-sm font-bold bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-md"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}
