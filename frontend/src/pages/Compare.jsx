import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import useRFQStore from '../store/rfqStore'

const COMPARE_FIELDS = [
  { key: 'genericName', label: 'Strength / Generic' },
  { key: 'packageSize', label: 'Pack Size' },
  { key: 'brand', label: 'Manufacturer' },
  { key: 'category', label: 'Category' },
  { key: 'description', label: 'Description' },
]

const SIDEBAR_NAV = [
  { to: '/',        icon: 'home',           label: 'Home' },
  { to: '/products',icon: 'inventory_2',    label: 'Products' },
  { to: '/rfq',     icon: 'request_quote',  label: 'RFQ' },
  { to: '/compare', icon: 'compare_arrows', label: 'Compare' },
  { to: '/portal',  icon: 'person',         label: 'My Account' },
]

export default function Compare() {
  const [selectedIds, setSelectedIds] = useState([])
  const { addProduct, selectedProducts } = useRFQStore()

  const { data: allProducts } = useQuery({
    queryKey: ['products-compare-list'],
    queryFn: () => api.get('/products', { params: { page: 1, limit: 50 } }).then((r) => r.data),
  })

  const { data: compareProducts } = useQuery({
    queryKey: ['products-compare', selectedIds],
    queryFn: () => Promise.all(selectedIds.map((id) => api.get(`/products/${id}`).then((r) => r.data))),
    enabled: selectedIds.length > 0,
  })

  const addToCompare = (id) => {
    if (selectedIds.length >= 3 || selectedIds.includes(id)) return
    setSelectedIds((prev) => [...prev, id])
  }
  const removeFromCompare = (id) => setSelectedIds((prev) => prev.filter((i) => i !== id))
  const rfqCount = selectedProducts.length

  return (
    <div className="flex min-h-screen bg-surface font-body text-on-surface">

      {/* Left sidebar */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 sticky top-16 h-[calc(100vh-4rem)] bg-surface-container-low border-r border-outline-variant/10 py-6">
        <div className="px-4 mb-6">
          <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Navigation</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {SIDEBAR_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white text-primary font-bold shadow-sm'
                    : 'text-slate-500 hover:bg-white/60 hover:text-primary'
                }`
              }
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        {rfqCount > 0 && (
          <div className="mx-3 mt-4 p-4 bg-primary rounded-2xl text-white">
            <p className="text-xs font-bold mb-1">{rfqCount} items in RFQ</p>
            <Link to="/rfq" className="text-xs underline text-blue-200">Review →</Link>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 px-6 py-8 max-w-6xl">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="font-headline font-bold text-4xl tracking-tight text-on-surface mb-2">Comparative Analysis</h1>
            <p className="text-on-surface-variant max-w-2xl leading-relaxed">
              Detailed technical comparison of active pharmaceutical ingredients and therapeutic alternatives.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-low text-primary font-semibold rounded-xl hover:bg-surface-container-high transition-all">
              <span className="material-symbols-outlined text-lg">share</span>
              Export PDF
            </button>
          </div>
        </div>

        {/* Product selector */}
        {allProducts?.items?.length > 0 && (
          <div className="mb-8 p-6 bg-surface-container-low rounded-2xl">
            <p className="text-xs font-bold text-outline uppercase tracking-widest mb-4">Select up to 3 products to compare</p>
            <div className="flex flex-wrap gap-2">
              {allProducts.items.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addToCompare(p.id)}
                  disabled={selectedIds.length >= 3 && !selectedIds.includes(p.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedIds.includes(p.id)
                      ? 'bg-primary text-white'
                      : 'bg-surface-container text-on-surface-variant hover:bg-secondary-container hover:text-primary disabled:opacity-40'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Comparison table */}
        {compareProducts && compareProducts.length > 0 ? (
          <div className="bg-surface-container-low rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="sticky left-0 bg-surface-container-low z-20 min-w-[200px] p-6 text-left border-r border-outline-variant/10">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">Parameters</span>
                    </th>
                    {compareProducts.map((p) => (
                      <th key={p.id} className="min-w-[260px] p-6 bg-surface-container-lowest border-l border-outline-variant/10">
                        <div className="flex flex-col items-center text-center">
                          <div className="w-20 h-20 mb-4 rounded-xl overflow-hidden bg-surface-container-high flex items-center justify-center">
                            {p.imageUrl
                              ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                              : <span className="material-symbols-outlined text-3xl text-outline/30">medication</span>}
                          </div>
                          <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold uppercase mb-2 capitalize">{p.category}</span>
                          <h2 className="font-headline font-bold text-lg text-primary mb-0.5">{p.name}</h2>
                          <p className="text-xs text-on-surface-variant">{p.brand}</p>
                          <button onClick={() => removeFromCompare(p.id)} className="mt-2 text-outline hover:text-error transition-colors">
                            <span className="material-symbols-outlined text-base">close</span>
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {COMPARE_FIELDS.map((field) => (
                    <tr key={field.key}>
                      <td className="sticky left-0 bg-surface-container-low p-5 font-bold text-on-surface border-r border-outline-variant/10">{field.label}</td>
                      {compareProducts.map((p) => (
                        <td key={p.id} className="p-5 text-center bg-surface-container-lowest border-l border-outline-variant/10">{p[field.key] || '—'}</td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td className="sticky left-0 bg-surface-container-low p-6 border-r border-outline-variant/10" />
                    {compareProducts.map((p) => (
                      <td key={p.id} className="p-6 bg-surface-container-lowest border-l border-outline-variant/10">
                        <button
                          onClick={() => addProduct(p)}
                          className="w-full py-3 signature-gradient text-white font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
                        >
                          Add to RFQ
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-24 text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl mb-4 block opacity-30">compare</span>
            <p className="font-medium text-lg">Select products above to compare</p>
            <p className="text-sm mt-1">Choose up to 3 products from the list above.</p>
          </div>
        )}

        {/* Info cards */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: 'verified', bg: 'bg-primary-fixed', color: 'text-primary', title: 'Verified Sources', desc: 'All manufacturers are WHO-GMP certified.' },
            { icon: 'speed', bg: 'bg-tertiary-fixed', color: 'text-tertiary', title: 'Real-time Stock', desc: 'Inventory synced every 15 minutes.' },
            { icon: 'local_shipping', bg: 'bg-secondary-fixed', color: 'text-secondary', title: 'Cold Chain Ready', desc: 'IoT-monitored temperature-sensitive logistics.' },
          ].map((item) => (
            <div key={item.title} className="p-5 rounded-2xl bg-surface-container-lowest shadow-sm flex items-start gap-4">
              <div className={`p-3 ${item.bg} rounded-xl`}>
                <span className={`material-symbols-outlined ${item.color}`}>{item.icon}</span>
              </div>
              <div>
                <h4 className="font-bold text-on-surface">{item.title}</h4>
                <p className="text-sm text-on-surface-variant">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Floating RFQ bar */}
      {rfqCount > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl z-50">
          <div className="bg-white/80 backdrop-blur-xl border border-white/40 p-4 px-6 rounded-2xl shadow-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">description</span>
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">{rfqCount} Items in RFQ Basket</p>
                <p className="text-[11px] text-on-surface-variant">Pending Quote</p>
              </div>
            </div>
            <Link to="/rfq" className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all">
              Finalize RFQ
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
