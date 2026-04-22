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
  { to: '/track',      label: 'Track RFQ' },
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
    <nav className={`sticky top-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100/50' 
        : 'bg-gradient-to-r from-white/90 via-white/95 to-white/90 backdrop-blur-xl shadow-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-200" onClick={() => setMobileOpen(!mobileOpen)}>
              <span className="material-symbols-outlined text-2xl">{mobileOpen ? 'close' : 'menu'}</span>
            </button>
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 signature-gradient rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>medication</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-gray-900 tracking-tight leading-none">
                  PharmaLink<span className="hidden sm:inline text-primary"> Pro</span>
                </span>
                <span className="text-xs text-gray-500 font-medium hidden sm:block">Medical Solutions</span>
              </div>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2 bg-gray-50/80 rounded-2xl p-1.5 backdrop-blur-sm border border-gray-200/50">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 relative ${
                    isActive 
                      ? 'text-white bg-gradient-to-r from-primary to-primary-container shadow-lg shadow-primary/25' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* RFQ cart */}
            <Link
              to="/portal/rfq"
              className="relative p-3 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-200 group"
              title="RFQ Cart"
            >
              <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform duration-200">description</span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative hidden sm:block" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(o => !o)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-200/50 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white text-sm font-bold shadow-md">
                    {user.fullName?.[0] || 'U'}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-semibold text-gray-700 leading-none">{user.fullName?.split(' ')[0]}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Welcome back</p>
                  </div>
                  <span className="material-symbols-outlined text-gray-400 text-lg transition-transform duration-200 group-hover:rotate-180">expand_more</span>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-14 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100/50 py-2 z-50 animate-slide-down">
                    <div className="px-5 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white text-sm font-bold">
                          {user.fullName?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 truncate">{user.fullName}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      <Link
                        to={user.role === 'admin' ? '/admin' : '/portal'}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-primary/5 hover:text-primary transition-all duration-200"
                      >
                        <span className="material-symbols-outlined text-lg text-gray-400">dashboard</span>
                        Dashboard
                      </Link>
                      <button
                        onClick={() => { clearAuth(); navigate('/login') }}
                        className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                      >
                        <span className="material-symbols-outlined text-lg">logout</span>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all duration-200">
                  Sign In
                </Link>
                <Link to="/portal/rfq" className="btn-primary text-sm px-6 py-2.5 shadow-lg hover:shadow-xl">
                  <span className="material-symbols-outlined text-base">request_quote</span>
                  Request Quote
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100/50 shadow-2xl">
          <div className="px-4 py-4 space-y-2">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive 
                      ? 'text-white bg-gradient-to-r from-primary to-primary-container shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="pt-4 border-t border-gray-100 space-y-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white text-sm font-bold">
                      {user.fullName?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{user.fullName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Link to={user.role === 'admin' ? '/admin' : '/portal'} className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200">
                    <span className="material-symbols-outlined text-lg text-gray-400">dashboard</span>
                    Dashboard
                  </Link>
                  <button onClick={() => { clearAuth(); navigate('/login') }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200">
                    <span className="material-symbols-outlined text-lg">logout</span>
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200">Sign In</Link>
                  <Link to="/portal/rfq" className="flex items-center justify-center gap-2 btn-primary text-sm shadow-lg">
                    <span className="material-symbols-outlined text-base">request_quote</span>
                    Request Quote
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
