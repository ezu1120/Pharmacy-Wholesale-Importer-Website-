import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import useRFQStore from '../store/rfqStore'
import useAuthStore from '../store/authStore'

const NAV_LINKS = [
  { to: '/products',   label: 'Products' },
  { to: '/categories', label: 'Categories' },
  { to: '/services',   label: 'Services' },
  { to: '/about',      label: 'About' },
  { to: '/contact',    label: 'Contact' },
]

export default function Navbar() {
  const itemCount = useRFQStore((s) => s.selectedProducts.length)
  const { user, clearAuth } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const profileRef = useRef(null)

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`sticky top-0 w-full z-50 transition-shadow duration-200 ${scrolled ? 'bg-white shadow-sm' : 'bg-white/95 backdrop-blur-md'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <button className="md:hidden p-1 text-gray-600 hover:text-primary transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
              <span className="material-symbols-outlined text-2xl">{mobileOpen ? 'close' : 'menu'}</span>
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 signature-gradient rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-base" style={{ fontVariationSettings: "'FILL' 1" }}>medication</span>
              </div>
              <span className="font-bold text-lg text-gray-900 tracking-tight">
                PharmaLink<span className="hidden sm:inline text-primary"> Pro</span>
              </span>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'text-primary bg-primary/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* RFQ cart */}
            <Link
              to="/portal/rfq"
              className="relative p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
              title="RFQ Cart"
            >
              <span className="material-symbols-outlined text-xl">description</span>
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative hidden sm:block" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(o => !o)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                    {user.fullName?.[0] || 'U'}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden lg:block">{user.fullName?.split(' ')[0]}</span>
                  <span className="material-symbols-outlined text-gray-400 text-sm">expand_more</span>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-11 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      to={user.role === 'admin' ? '/admin' : '/portal'}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base text-gray-400">dashboard</span>
                      Dashboard
                    </Link>
                    <button
                      onClick={() => { clearAuth(); navigate('/login') }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">logout</span>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Sign In
                </Link>
                <Link to="/portal/rfq" className="btn-primary text-sm px-4 py-2">
                  Request Quote
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'text-primary bg-primary/5' : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="pt-3 border-t border-gray-100 space-y-2">
              {user ? (
                <>
                  <Link to={user.role === 'admin' ? '/admin' : '/portal'} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                    <span className="material-symbols-outlined text-base text-gray-400">dashboard</span>
                    Dashboard
                  </Link>
                  <button onClick={() => { clearAuth(); navigate('/login') }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg">
                    <span className="material-symbols-outlined text-base">logout</span>
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Sign In</Link>
                  <Link to="/portal/rfq" className="block text-center btn-primary text-sm justify-center">Request Quote</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
