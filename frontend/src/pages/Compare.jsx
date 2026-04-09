import { useState } from 'react'
import { Link } from 'react-router-dom'
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
    <div className="bg-surface font-body text-on-surface min-h-screen">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 w-full sticky top-0 bg-surface/80 backdrop-blur-md z-50 transition-transform">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">medication</span>
          <span className="font-headline font-extrabold text-primary uppercase tracking-wider text-xl">PharmaDirect Wholesale</span>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-slate-500 font-medium hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors">Dashboard</Link>
          <Link to="/portal" className="text-slate-500 font-medium hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors">RFQs</Link>
          <Link to="/compare" className="text-primary font-semibold border-b-2 border-primary px-3 py-2">Compare</Link>
          <Link to="/products" className="text-slate-500 font-medium hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors">Catalog</Link>
        </nav>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">language</span>
          </button>
          <div className="h-8 w-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-fixed text-xs font-bold">CP</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-headline font-bold text-4xl tracking-tight text-on-surface mb-2">Comparative Analysis</h1>
              <p className="text-on-surface-variant max-w-2xl leading-relaxed">Detailed technical comparison of active pharmaceutical ingredients and therapeutic alternatives for clinical procurement decision-making.</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-low text-primary font-semibold rounded-xl hover:bg-surface-container-high transition-all">
                <span className="material-symbols-outlined text-[20px]">share</span>
                Export PDF
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-xl hover:shadow-lg transition-all">
                <span className="material-symbols-outlined text-[20px]">add</span>
                Add Product
              </button>
            </div>
          </div>
        </section>

        {/* Product selector chips */}
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
          <div className="bg-surface-container-low rounded-[2rem] p-1 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="sticky left-0 bg-surface-container-low z-20 min-w-[240px] p-8 text-left border-r border-outline-variant/10">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">Parameters</span>
                        <h3 className="font-headline font-extrabold text-xl">Technical Specs</h3>
                      </div>
                    </th>
                    {compareProducts.map((p) => (
                      <th key={p.id} className="min-w-[280px] p-8 bg-surface-container-lowest border-l border-outline-variant/10">
                        <div className="flex flex-col items-center text-center">
                          <div className="w-24 h-24 mb-6 rounded-2xl overflow-hidden bg-surface-container-high flex items-center justify-center">
                            {p.imageUrl
                              ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                              : <span className="material-symbols-outlined text-4xl text-outline/30">medication</span>}
                          </div>
                          <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 capitalize">{p.category}</span>
                          <h2 className="font-headline font-bold text-2xl text-primary mb-1">{p.name}</h2>
                          <p className="text-xs text-on-surface-variant font-medium">{p.brand}</p>
                          <button onClick={() => removeFromCompare(p.id)} className="mt-3 text-outline hover:text-error transition-colors">
                            <span className="material-symbols-outlined text-lg">close</span>
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {COMPARE_FIELDS.map((field) => (
                    <tr key={field.key} className="group">
                      <td className="sticky left-0 bg-surface-container-low p-6 font-bold text-on-surface border-r border-outline-variant/10">{field.label}</td>
                      {compareProducts.map((p) => (
                        <td key={p.id} className="p-6 text-center bg-surface-container-lowest border-l border-outline-variant/10 font-medium">
                          {p[field.key] || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td className="sticky left-0 bg-surface-container-low p-8 border-r border-outline-variant/10"></td>
                    {compareProducts.map((p) => (
                      <td key={p.id} className="p-8 bg-surface-container-lowest border-l border-outline-variant/10">
                        <button
                          onClick={() => addProduct(p)}
                          className="w-full py-4 signature-gradient text-white font-bold rounded-xl shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all active:scale-95"
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
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: 'verified', bg: 'bg-primary-fixed', color: 'text-primary', title: 'Verified Sources', desc: 'All listed manufacturers are WHO-GMP certified and verified by our procurement team.' },
            { icon: 'speed', bg: 'bg-tertiary-fixed', color: 'text-tertiary', title: 'Real-time Stock', desc: 'Inventory levels are synced every 15 minutes with our regional distribution centers.' },
            { icon: 'local_shipping', bg: 'bg-secondary-fixed', color: 'text-secondary', title: 'Cold Chain Ready', desc: 'Temperature sensitive items include specialized IoT-monitored logistical handling.' },
          ].map((item) => (
            <div key={item.title} className="p-6 rounded-3xl bg-surface-container-lowest border border-white/50 shadow-sm flex items-start gap-4">
              <div className={`p-3 ${item.bg} rounded-2xl`}>
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
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl z-50">
          <div className="bg-white/80 backdrop-blur-xl border border-white/40 p-4 px-6 rounded-[2rem] shadow-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {selectedProducts.slice(0, 2).map((p) => (
                  <div key={p.productId} className="h-10 w-10 rounded-full border-2 border-white bg-secondary-container flex items-center justify-center font-bold text-[10px] text-on-secondary-container">
                    {p.productName?.[0]}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">{rfqCount} Items in RFQ Basket</p>
                <p className="text-[11px] text-on-surface-variant font-medium tracking-tight">Estimated Total: Pending Quote</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-on-surface-variant font-semibold text-sm hover:text-primary transition-colors">Clear All</button>
              <Link to="/rfq" className="bg-primary text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                Finalize Quotation Request
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 md:hidden bg-white/90 backdrop-blur-xl border-t border-slate-100">
        <Link to="/" className="flex flex-col items-center text-slate-400">
          <span className="material-symbols-outlined text-2xl">home</span>
          <span className="text-[11px] font-semibold mt-1">Home</span>
        </Link>
        <Link to="/portal" className="flex flex-col items-center text-slate-400">
          <span className="material-symbols-outlined text-2xl">request_quote</span>
          <span className="text-[11px] font-semibold mt-1">RFQs</span>
        </Link>
        <Link to="/compare" className="flex flex-col items-center text-primary scale-110">
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>compare_arrows</span>
          <span className="text-[11px] font-semibold mt-1">Compare</span>
        </Link>
        <Link to="/rfq" className="flex flex-col items-center text-slate-400">
          <span className="material-symbols-outlined text-2xl">chat_bubble</span>
          <span className="text-[11px] font-semibold mt-1">Chat</span>
        </Link>
      </nav>
    </div>
  )
}
