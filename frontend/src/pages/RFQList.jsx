import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

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

export default function RFQList() {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [page, setPage] = useState(1)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-rfqs', search, activeFilter, page],
    queryFn: () => api.get('/admin/rfqs', { params: { customerName: search, status: activeFilter, page, limit: 20 } }).then((r) => r.data),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/admin/rfqs/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries(['admin-rfqs']),
  })

  const filters = [
    { label: 'All RFQs', value: '' },
    { label: `New Requests (${data?.items?.filter((r) => r.status === 'NEW').length || 0})`, value: 'NEW' },
    { label: `Pending (${data?.items?.filter((r) => r.status === 'UNDER_REVIEW').length || 0})`, value: 'UNDER_REVIEW' },
    { label: 'Archived', value: 'CLOSED' },
  ]

  return (
    <div className="bg-background font-body text-on-surface antialiased overflow-x-hidden min-h-screen">
      {/* Top bar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg shadow-sm flex justify-between items-center px-6 h-20">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="p-2 hover:bg-slate-100 transition-colors rounded-lg">
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </Link>
          <h1 className="font-headline font-bold text-2xl tracking-tight text-primary">RFQ List</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white font-bold text-sm">A</div>
      </header>

      {/* Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-72 bg-slate-50 flex-col py-8 space-y-2 z-40 pt-24">
        <div className="px-8 mb-6">
          <h2 className="font-headline font-bold text-lg text-primary">Admin Portal</h2>
          <p className="text-xs text-slate-500 font-medium tracking-wide">Pharma Distribution</p>
        </div>
        <nav className="flex flex-col space-y-1">
          {[
            { to: '/admin', icon: 'dashboard', label: 'Dashboard' },
            { to: '/admin/rfqs', icon: 'request_quote', label: 'RFQ List', active: true },
            { to: '/admin/products', icon: 'inventory_2', label: 'Inventory' },
            { to: '/admin/settings', icon: 'settings', label: 'Settings' },
          ].map((item) => (
            <Link key={item.to} to={item.to} className={`flex items-center gap-4 py-3 transition-all duration-200 ${item.active ? 'bg-white text-primary font-bold rounded-l-full ml-4 pl-4 shadow-sm' : 'text-slate-500 pl-8 hover:text-primary'}`}>
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="md:ml-72 pt-24 pb-12 px-4 md:px-10 max-w-5xl mx-auto">
        {/* Search & Filter */}
        <section className="mb-8 space-y-4">
          <div className="flex items-center gap-3 w-full">
            <div className="relative flex-grow">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-60 text-lg">search</span>
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="w-full h-14 pl-12 pr-4 bg-surface-container-high border-none rounded-xl text-sm focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all outline-none"
                placeholder="Search by ID or Company..."
              />
            </div>
            <button className="flex items-center justify-center h-14 w-14 md:w-auto md:px-6 bg-surface-container-lowest text-on-surface rounded-xl shadow-sm hover:shadow-md transition-all">
              <span className="material-symbols-outlined md:mr-2">filter_list</span>
              <span className="hidden md:inline font-medium text-sm">Filter</span>
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => { setActiveFilter(f.value); setPage(1) }}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeFilter === f.value ? 'bg-primary text-on-primary' : 'bg-secondary-container text-on-secondary-container hover:bg-surface-container-high'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </section>

        {/* RFQ Cards */}
        <div className="grid grid-cols-1 gap-4">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-surface-container-lowest p-6 rounded-2xl animate-pulse">
                  <div className="h-5 bg-surface-container rounded w-1/3 mb-3" />
                  <div className="h-4 bg-surface-container rounded w-1/2" />
                </div>
              ))
            : data?.items?.map((rfq) => (
                <Link
                  to={`/admin/rfqs/${rfq.id}`}
                  key={rfq.id}
                  className={`bg-surface-container-lowest p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 ${BORDER_COLOR[rfq.status] || 'border-slate-200'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-primary tracking-widest uppercase opacity-70">#{rfq.rfqNumber}</p>
                      <h3 className="font-headline font-bold text-lg text-primary leading-tight">{rfq.companyName}</h3>
                      <p className="text-sm text-on-surface-variant">{rfq.customerName}</p>
                    </div>
                    <span className={`px-3 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-wider ${STATUS_BADGE[rfq.status]}`}>
                      {rfq.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2 text-on-surface-variant opacity-80">
                      <span className="material-symbols-outlined text-base">calendar_today</span>
                      <span className="text-xs font-medium">{new Date(rfq.submittedAt).toLocaleDateString()}</span>
                    </div>
                    <span className="text-xs text-on-surface-variant">{rfq.itemCount} items</span>
                  </div>
                </Link>
              ))}
        </div>

        {/* Load more */}
        {data?.totalCount > 20 && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-8 py-3 bg-surface-container-high text-on-surface-variant font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-surface-container-highest transition-colors"
            >
              Load More Results
            </button>
          </div>
        )}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-100 flex justify-around items-center h-20 px-4 z-50">
        <Link to="/admin" className="flex flex-col items-center gap-1 text-slate-400">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Dash</span>
        </Link>
        <Link to="/admin/rfqs" className="flex flex-col items-center gap-1 text-primary">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>request_quote</span>
          <span className="text-[10px] font-extrabold uppercase tracking-tighter">RFQs</span>
        </Link>
        <div className="relative -top-8">
          <Link to="/rfq" className="w-16 h-16 signature-gradient text-white rounded-full shadow-lg flex items-center justify-center ring-4 ring-background">
            <span className="material-symbols-outlined text-3xl">add</span>
          </Link>
        </div>
        <Link to="/admin/products" className="flex flex-col items-center gap-1 text-slate-400">
          <span className="material-symbols-outlined">inventory_2</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Stock</span>
        </Link>
        <Link to="/admin/settings" className="flex flex-col items-center gap-1 text-slate-400">
          <span className="material-symbols-outlined">settings</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">More</span>
        </Link>
      </nav>
      <div className="h-24 md:hidden"></div>
    </div>
  )
}
