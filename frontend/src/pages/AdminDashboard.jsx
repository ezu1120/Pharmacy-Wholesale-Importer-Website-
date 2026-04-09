import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import useAuthStore from '../store/authStore'

const STATUS_BADGE = {
  NEW: 'bg-primary-container text-white',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  QUOTATION_SENT: 'bg-green-100 text-green-700',
  CLOSED: 'bg-slate-100 text-slate-500',
}

const BORDER_COLOR = {
  NEW: 'border-primary/20',
  UNDER_REVIEW: 'border-yellow-500/20',
  QUOTATION_SENT: 'border-green-500/20',
  CLOSED: 'border-slate-300',
}

function AdminSidebar({ active }) {
  const { clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const navItems = [
    { to: '/admin', icon: 'dashboard', label: 'Dashboard' },
    { to: '/admin/rfqs', icon: 'request_quote', label: 'RFQ List' },
    { to: '/admin/products', icon: 'inventory_2', label: 'Inventory' },
    { to: '/admin/settings', icon: 'settings', label: 'Settings' },
  ]
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-72 bg-slate-50 flex-col py-8 space-y-2 z-40 pt-24">
      <div className="px-8 mb-6">
        <h2 className="font-headline font-bold text-lg text-primary">Admin Portal</h2>
        <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Pharma Distribution</p>
      </div>
      <nav className="flex flex-col space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center gap-4 py-3 transition-all duration-200 ${
              active === item.label
                ? 'bg-white text-primary font-bold rounded-l-full ml-4 pl-4 shadow-sm'
                : 'text-slate-500 pl-8 hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-medium text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto px-8">
        <button onClick={() => { clearAuth(); navigate('/login') }} className="text-sm text-slate-400 hover:text-error transition-colors">Sign out</button>
      </div>
    </aside>
  )
}

export default function AdminDashboard() {
  const { data: rfqs } = useQuery({
    queryKey: ['admin-rfqs-dash'],
    queryFn: () => api.get('/admin/rfqs', { params: { page: 1, limit: 10 } }).then((r) => r.data),
  })

  const stats = [
    { icon: 'analytics', label: 'Total RFQs', value: rfqs?.totalCount || 0, badge: '+4.2%', badgeColor: 'text-green-600 bg-green-50', barW: '85%', barColor: 'bg-primary' },
    { icon: 'new_releases', label: 'New RFQs', value: rfqs?.items?.filter((r) => r.status === 'NEW').length || 0, badge: 'Today', badgeColor: 'text-tertiary-container bg-tertiary-fixed/20', barW: '25%', barColor: 'bg-tertiary-container' },
    { icon: 'pending_actions', label: 'Pending', value: rfqs?.items?.filter((r) => r.status === 'UNDER_REVIEW').length || 0, badge: 'Action Required', badgeColor: 'text-amber-600 bg-amber-50', barW: '30%', barColor: 'bg-amber-500' },
    { icon: 'task_alt', label: 'Closed', value: rfqs?.items?.filter((r) => r.status === 'CLOSED').length || 0, badge: null, barW: '100%', barColor: 'bg-slate-400' },
  ]

  const recentActivity = rfqs?.items?.slice(0, 3) || []

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      {/* Top bar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg shadow-sm flex justify-between items-center px-8 h-20">
        <div className="flex items-center gap-4">
          <span className="font-headline font-extrabold text-primary text-2xl tracking-tight">Clinical Curator</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6">
            <Link to="/admin" className="text-primary font-bold text-sm">Dashboard</Link>
            <Link to="/admin/rfqs" className="text-slate-500 font-medium text-sm hover:text-primary transition-colors">RFQ List</Link>
            <Link to="/admin/products" className="text-slate-500 font-medium text-sm hover:text-primary transition-colors">Inventory</Link>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white font-bold text-sm">A</div>
        </div>
      </header>

      <div className="flex pt-20 min-h-screen">
        <AdminSidebar active="Dashboard" />

        <main className="flex-1 lg:ml-72 p-6 md:p-10 bg-surface">
          {/* Stats Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {stats.map((s) => (
              <div key={s.label} className="bg-surface-container-lowest p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-primary-container/10 rounded-lg text-primary">
                    <span className="material-symbols-outlined">{s.icon}</span>
                  </div>
                  {s.badge && <span className={`text-xs font-bold px-2 py-1 rounded-full ${s.badgeColor}`}>{s.badge}</span>}
                </div>
                <p className="text-on-surface-variant text-sm font-medium mb-1">{s.label}</p>
                <h3 className="text-3xl font-extrabold text-on-surface tracking-tight">{s.value}</h3>
                <div className="mt-4 h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <div className={`h-full ${s.barColor} rounded-full`} style={{ width: s.barW }} />
                </div>
              </div>
            ))}
          </div>

          {/* Asymmetric grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Chart area */}
            <div className="lg:col-span-8 bg-surface-container-low rounded-2xl p-8 relative overflow-hidden group">
              <div className="flex justify-between items-end mb-10">
                <div>
                  <h2 className="text-2xl font-headline font-extrabold text-on-surface tracking-tight">RFQ Volume Trends</h2>
                  <p className="text-on-surface-variant text-sm">Last 7 days performance metrics</p>
                </div>
                <button className="flex items-center gap-2 text-primary font-bold text-sm bg-white px-4 py-2 rounded-lg shadow-sm">
                  <span>Weekly</span>
                  <span className="material-symbols-outlined text-sm">expand_more</span>
                </button>
              </div>
              <div className="flex items-end gap-3 min-h-[200px]">
                {[40, 65, 45, 80, 55, 95, 70].map((h, i) => (
                  <div key={i} className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t-lg relative group/bar" style={{ height: `${h}%` }}>
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                      {[124, 156, 132, 210, 145, 248, 189][i]}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-[10px] font-bold text-on-surface-variant tracking-widest uppercase opacity-60">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <span key={d}>{d}</span>)}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-4 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-headline font-bold text-on-surface">Recent Activity</h2>
                <Link to="/admin/rfqs" className="text-primary text-xs font-bold hover:underline">View All</Link>
              </div>
              <div className="space-y-4">
                {recentActivity.length > 0 ? recentActivity.map((rfq) => (
                  <Link to={`/admin/rfqs/${rfq.id}`} key={rfq.id} className={`bg-surface-container-lowest p-5 rounded-xl flex items-center gap-4 border-l-4 shadow-sm hover:shadow-md transition-all ${BORDER_COLOR[rfq.status] || 'border-slate-200'}`}>
                    <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary">medication</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-on-surface truncate">{rfq.companyName}</h4>
                      <p className="text-xs text-on-surface-variant">{rfq.rfqNumber}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${STATUS_BADGE[rfq.status]}`}>
                      {rfq.status?.replace('_', ' ')}
                    </span>
                  </Link>
                )) : (
                  /* Placeholder cards */
                  [
                    { label: 'Amoxicillin 500mg', sub: 'RFQ #45210 • 2h ago', status: 'Pending', border: 'border-amber-500', badge: 'bg-amber-50 text-amber-700' },
                    { label: 'Lipitor Bulk Batch', sub: 'RFQ #45209 • 5h ago', status: 'Review', border: 'border-blue-500', badge: 'bg-blue-50 text-blue-700' },
                    { label: 'Insulin Glargine', sub: 'RFQ #45198 • 1d ago', status: 'Closed', border: 'border-slate-200', badge: 'bg-slate-50 text-slate-500' },
                  ].map((item) => (
                    <div key={item.label} className={`bg-surface-container-lowest p-5 rounded-xl flex items-center gap-4 border-l-4 ${item.border} shadow-sm`}>
                      <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-primary">medication</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-on-surface truncate">{item.label}</h4>
                        <p className="text-xs text-on-surface-variant">{item.sub}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${item.badge}`}>{item.status}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="bg-primary p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
                <span className="material-symbols-outlined text-white/50 mb-4 block">tips_and_updates</span>
                <h4 className="font-headline font-bold text-lg mb-2">Efficiency Insight</h4>
                <p className="text-white/80 text-sm leading-relaxed">Closing rates are up 12% this week after the new auto-quoting logic was enabled.</p>
                <button className="mt-6 w-full py-2 bg-white/10 hover:bg-white/20 transition-colors border border-white/20 rounded-lg text-sm font-bold">Review Logs</button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* FAB */}
      <Link to="/admin/rfqs" className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-40 group">
        <span className="material-symbols-outlined">add</span>
        <span className="absolute right-full mr-4 bg-on-surface text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Create RFQ</span>
      </Link>
    </div>
  )
}
