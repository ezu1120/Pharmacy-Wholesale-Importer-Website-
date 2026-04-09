import { Link, NavLink } from 'react-router-dom'
import useRFQStore from '../store/rfqStore'
import useAuthStore from '../store/authStore'

export default function Navbar() {
  const itemCount = useRFQStore((s) => s.selectedProducts.length)
  const { user, clearAuth } = useAuthStore()

  return (
    <nav className="sticky top-0 w-full z-50 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm">
      <div className="flex items-center justify-between px-8 py-4 max-w-screen-2xl mx-auto">
        <Link to="/" className="text-2xl font-bold tracking-tighter text-blue-900 font-headline">
          PharmaLink Wholesale
        </Link>

        <div className="hidden md:flex items-center space-x-8 font-headline text-sm font-semibold tracking-tight">
          <NavLink to="/products" className={({ isActive }) =>
            isActive ? 'text-blue-700 border-b-2 border-blue-700 pb-1' : 'text-slate-600 hover:text-blue-900 transition-colors'
          }>Products</NavLink>
          <NavLink to="/categories" className={({ isActive }) =>
            isActive ? 'text-blue-700 border-b-2 border-blue-700 pb-1' : 'text-slate-600 hover:text-blue-900 transition-colors'
          }>Categories</NavLink>
          <NavLink to="/services" className={({ isActive }) =>
            isActive ? 'text-blue-700 border-b-2 border-blue-700 pb-1' : 'text-slate-600 hover:text-blue-900 transition-colors'
          }>Services</NavLink>
          <NavLink to="/about" className={({ isActive }) =>
            isActive ? 'text-blue-700 border-b-2 border-blue-700 pb-1' : 'text-slate-600 hover:text-blue-900 transition-colors'
          }>About</NavLink>
          <NavLink to="/contact" className={({ isActive }) =>
            isActive ? 'text-blue-700 border-b-2 border-blue-700 pb-1' : 'text-slate-600 hover:text-blue-900 transition-colors'
          }>Contact</NavLink>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden lg:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
            <input
              className="pl-10 pr-4 py-2 bg-surface-container-high border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              placeholder="Search pharmaceuticals..."
              type="text"
            />
          </div>

          {/* RFQ badge */}
          <Link to="/rfq" className="relative p-2 text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">description</span>
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/portal" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
                {user.fullName}
              </Link>
              <button onClick={clearAuth} className="text-sm text-outline hover:text-error transition-colors">Logout</button>
            </div>
          ) : (
            <Link to="/rfq" className="signature-gradient text-white px-6 py-2.5 rounded-lg font-headline font-bold text-sm transition-all duration-200 ease-out active:scale-95 shadow-md">
              Request Quotation
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
