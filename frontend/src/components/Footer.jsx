import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useAuthStore from '../store/authStore'

export default function Footer() {
  const { user } = useAuthStore()
  const { t } = useTranslation()
  return (
    <footer className="w-full border-t border-slate-200 bg-slate-100">
      <div className="max-w-screen-2xl mx-auto px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="md:col-span-1">
          <span className="font-headline font-bold text-primary tracking-tighter text-2xl block mb-3">PharmaLink</span>
          <p className="text-xs text-slate-500 leading-relaxed">{t('footer.tagline')}</p>
        </div>

        {/* Navigation */}
        <div>
          <p className="font-headline font-bold text-xs uppercase tracking-widest text-slate-400 mb-4">{t('footer.navigation')}</p>
          <div className="space-y-2">
            {[
              { to: '/', label: t('nav.products') === 'Products' ? 'Home' : 'መነሻ' },
              { to: '/about', label: t('nav.about') },
              { to: '/products', label: t('nav.products') },
              { to: '/services', label: t('nav.services') },
              { to: '/contact', label: t('nav.contact') },
            ].map((l) => (
              <Link key={l.to} to={l.to} className="block text-sm text-slate-500 hover:text-primary transition-colors">{l.label}</Link>
            ))}
          </div>
        </div>

        {/* Services */}
        <div>
          <p className="font-headline font-bold text-xs uppercase tracking-widest text-slate-400 mb-4">{t('footer.services')}</p>
          <div className="space-y-2">
            {[
              { to: '/rfq', label: t('footer.rfq_generator') },
              { to: '/compare', label: t('footer.comparison') },
              { to: user?.role === 'admin' ? '/admin' : '/portal', label: t('nav.dashboard') },
              ...(!user ? [{ to: '/register', label: t('footer.create_account') }] : []),
            ].map((l) => (
              <Link key={l.label} to={l.to} className="block text-sm text-slate-500 hover:text-primary transition-colors">{l.label}</Link>
            ))}
          </div>
        </div>

        {/* Legal */}
        <div>
          <p className="font-headline font-bold text-xs uppercase tracking-widest text-slate-400 mb-4">{t('footer.legal')}</p>
          <div className="space-y-2">
            {['Terms of Sale', 'Regulatory Compliance', 'MSDS Database', 'Privacy Policy'].map((l) => (
              <Link key={l} to="#" className="block text-sm text-slate-500 hover:text-primary transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 px-8 py-4 max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
        <span className="font-headline font-bold text-slate-400 tracking-tighter">PharmaLink</span>
        <p className="font-label text-[10px] uppercase tracking-widest text-slate-400">
          © {new Date().getFullYear()} PharmaLink Wholesale Precision Systems
        </p>
      </div>
    </footer>
  )
}
