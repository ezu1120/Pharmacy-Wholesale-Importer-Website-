import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import AdminLayout from '../components/AdminLayout'

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-outline uppercase tracking-widest">{label}</label>
      {children}
    </div>
  )
}

function TestimonialsSection() {
  const qc = useQueryClient()
  const [form, setForm] = useState({ customerName: '', companyName: '', comment: '' })
  const [editing, setEditing] = useState(null)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const { data: testimonials, isLoading } = useQuery({
    queryKey: ['admin-testimonials'],
    queryFn: () => api.get('/admin/testimonials').then((r) => r.data),
  })

  const create = useMutation({
    mutationFn: (data) => api.post('/admin/testimonials', data),
    onSuccess: () => { qc.invalidateQueries(['admin-testimonials']); setForm({ customerName: '', companyName: '', comment: '' }) },
  })
  const update = useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/admin/testimonials/${id}`, data),
    onSuccess: () => { qc.invalidateQueries(['admin-testimonials']); setEditing(null) },
  })
  const remove = useMutation({
    mutationFn: (id) => api.delete(`/admin/testimonials/${id}`),
    onSuccess: () => qc.invalidateQueries(['admin-testimonials']),
  })

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-surface-container flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">format_quote</span>
          <h2 className="font-headline font-bold text-xl text-on-surface">Testimonials</h2>
        </div>
        <span className="text-xs text-outline">{testimonials?.length || 0} total</span>
      </div>
      <div className="p-6 space-y-6">
        <div className="bg-surface-container-low rounded-xl p-5">
          <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-outline mb-4">Add New</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Field label="Customer Name *"><input value={form.customerName} onChange={set('customerName')} placeholder="Dr. Sarah Jenkins" className="input-field" /></Field>
            <Field label="Company / Role"><input value={form.companyName} onChange={set('companyName')} placeholder="Hospital Administrator, St. Jude Medical" className="input-field" /></Field>
            <div className="md:col-span-2">
              <Field label="Comment *"><textarea value={form.comment} onChange={set('comment')} rows={3} placeholder="Customer feedback..." className="input-field resize-none" /></Field>
            </div>
          </div>
          <button onClick={() => create.mutate(form)} disabled={create.isPending || !form.customerName || !form.comment} className="btn-primary flex items-center gap-2 disabled:opacity-50">
            <span className="material-symbols-outlined">add</span>
            {create.isPending ? 'Adding...' : 'Add Testimonial'}
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-20 bg-surface-container rounded-xl animate-pulse" />)}</div>
        ) : (
          <div className="space-y-4">
            {testimonials?.map((t) => (
              <div key={t.id} className="bg-surface-container-low rounded-xl p-5">
                {editing?.id === t.id ? (
                  <div className="space-y-3">
                    <input value={editing.customerName} onChange={(e) => setEditing((ed) => ({ ...ed, customerName: e.target.value }))} className="input-field" />
                    <input value={editing.companyName} onChange={(e) => setEditing((ed) => ({ ...ed, companyName: e.target.value }))} className="input-field" />
                    <textarea value={editing.comment} onChange={(e) => setEditing((ed) => ({ ...ed, comment: e.target.value }))} rows={3} className="input-field resize-none" />
                    <div className="flex gap-2">
                      <button onClick={() => update.mutate(editing)} disabled={update.isPending} className="btn-primary text-sm px-4 py-2">{update.isPending ? 'Saving...' : 'Save'}</button>
                      <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl border border-outline-variant text-sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{t.customerName?.[0]}</div>
                        <div>
                          <p className="font-headline font-bold text-sm text-on-surface">{t.customerName}</p>
                          <p className="text-[10px] text-on-surface-variant">{t.companyName}</p>
                        </div>
                      </div>
                      <p className="text-sm text-on-surface-variant italic">"{t.comment}"</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => setEditing(t)} className="p-2 rounded-lg hover:bg-surface-container transition-colors text-primary"><span className="material-symbols-outlined text-base">edit</span></button>
                      <button onClick={() => remove.mutate(t.id)} className="p-2 rounded-lg hover:bg-error-container/20 transition-colors text-error"><span className="material-symbols-outlined text-base">delete</span></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {testimonials?.length === 0 && (
              <div className="text-center py-10 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">format_quote</span>
                <p className="text-sm">No testimonials yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function HeroSection() {
  const [slides, setSlides] = useState([
    { id: 1, badge: 'Global Distribution Excellence', accent: 'Import Solutions', subtitle: 'Supplying medical institutions worldwide with precision-sourced medications, surgical supplies, and laboratory equipment.' },
    { id: 2, badge: 'WHO-GMP Certified Sources', accent: 'Pharmaceutical Wholesale', subtitle: 'Every product meets rigorous international standards including WHO, FDA, and EMA guidelines.' },
    { id: 3, badge: 'Cold Chain Specialists', accent: 'Temperature-Controlled Logistics', subtitle: 'IoT-monitored cold chain handling for temperature-sensitive pharmaceuticals. 2–8°C compliance guaranteed.' },
    { id: 4, badge: 'Surgical & Medical Supplies', accent: 'Sterile & Certified', subtitle: 'Precision instruments, sterile disposables, and medical consumables for operating theaters worldwide.' },
  ])
  const [saved, setSaved] = useState(false)

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-surface-container flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">slideshow</span>
        <h2 className="font-headline font-bold text-xl text-on-surface">Hero Slideshow ({slides.length} slides)</h2>
      </div>
      <div className="p-6 space-y-4">
        {slides.map((slide, i) => (
          <div key={slide.id} className="bg-surface-container-low rounded-xl p-5">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-4">Slide {i + 1}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Badge Text">
                <input value={slide.badge} onChange={(e) => setSlides((s) => s.map((sl) => sl.id === slide.id ? { ...sl, badge: e.target.value } : sl))} className="input-field text-sm" />
              </Field>
              <Field label="Headline Accent (blue text)">
                <input value={slide.accent} onChange={(e) => setSlides((s) => s.map((sl) => sl.id === slide.id ? { ...sl, accent: e.target.value } : sl))} className="input-field text-sm" />
              </Field>
              <div className="md:col-span-2">
                <Field label="Subtitle">
                  <textarea value={slide.subtitle} onChange={(e) => setSlides((s) => s.map((sl) => sl.id === slide.id ? { ...sl, subtitle: e.target.value } : sl))} rows={2} className="input-field resize-none text-sm" />
                </Field>
              </div>
            </div>
          </div>
        ))}
        <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }} className="btn-primary flex items-center gap-2">
          <span className="material-symbols-outlined">{saved ? 'check' : 'save'}</span>
          {saved ? 'Saved!' : 'Save Slides'}
        </button>
      </div>
    </div>
  )
}

function CompanyInfoSection() {
  const [info, setInfo] = useState({
    name: 'PharmaLink Wholesale', tagline: 'Trusted Pharmaceutical Wholesale & Import Solutions',
    description: 'PharmaLink Pro operates at the intersection of medical necessity and logistical precision.',
    address: 'Medical Park West, Floor 14, London, UK EC1A 4HQ',
    phone: '+44 (0) 20 7946 0123', email: 'support@pharmalinkwholesale.com',
    procurementEmail: 'procurement@pharmalinkwholesale.com', hours: 'Mon–Fri, 9am – 6pm GMT',
    yearsExperience: '15+', countriesServed: '50+', productsCount: '10,000+', accuracy: '99.8%',
  })
  const [saved, setSaved] = useState(false)
  const set = (k) => (e) => setInfo((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-surface-container flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">business</span>
        <h2 className="font-headline font-bold text-xl text-on-surface">Company Information</h2>
      </div>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-outline mb-4">Basic Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Company Name"><input value={info.name} onChange={set('name')} className="input-field" /></Field>
            <Field label="Tagline"><input value={info.tagline} onChange={set('tagline')} className="input-field" /></Field>
            <div className="md:col-span-2"><Field label="Description"><textarea value={info.description} onChange={set('description')} rows={3} className="input-field resize-none" /></Field></div>
          </div>
        </div>
        <div>
          <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-outline mb-4">Contact Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><Field label="Address"><input value={info.address} onChange={set('address')} className="input-field" /></Field></div>
            <Field label="Phone"><input value={info.phone} onChange={set('phone')} className="input-field" /></Field>
            <Field label="Business Hours"><input value={info.hours} onChange={set('hours')} className="input-field" /></Field>
            <Field label="Support Email"><input value={info.email} onChange={set('email')} className="input-field" /></Field>
            <Field label="Procurement Email"><input value={info.procurementEmail} onChange={set('procurementEmail')} className="input-field" /></Field>
          </div>
        </div>
        <div>
          <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-outline mb-4">Homepage Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Years Experience"><input value={info.yearsExperience} onChange={set('yearsExperience')} className="input-field" /></Field>
            <Field label="Countries Served"><input value={info.countriesServed} onChange={set('countriesServed')} className="input-field" /></Field>
            <Field label="Products Count"><input value={info.productsCount} onChange={set('productsCount')} className="input-field" /></Field>
            <Field label="Order Accuracy"><input value={info.accuracy} onChange={set('accuracy')} className="input-field" /></Field>
          </div>
        </div>
        <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }} className="btn-primary flex items-center gap-2">
          <span className="material-symbols-outlined">{saved ? 'check' : 'save'}</span>
          {saved ? 'Saved!' : 'Save Company Info'}
        </button>
      </div>
    </div>
  )
}

function WhyChooseUsSection() {
  const [items, setItems] = useState([
    { id: 1, icon: 'verified',       title: 'Genuine Products',    desc: 'Direct sourcing from certified manufacturers only.' },
    { id: 2, icon: 'payments',       title: 'Competitive Pricing', desc: 'Economies of scale passed directly to our clients.' },
    { id: 3, icon: 'local_shipping', title: 'Fast Delivery',       desc: 'Optimized air & sea freight for rapid turnaround.' },
    { id: 4, icon: 'gavel',          title: 'Licensed & Certified',desc: 'Strict adherence to regional health authorities.' },
  ])
  const [saved, setSaved] = useState(false)

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-surface-container flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">star</span>
        <h2 className="font-headline font-bold text-xl text-on-surface">Why Choose Us Cards</h2>
      </div>
      <div className="p-6 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="bg-surface-container-low rounded-xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <Field label="Icon (Material Symbol)">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                  <input value={item.icon} onChange={(e) => setItems((s) => s.map((i) => i.id === item.id ? { ...i, icon: e.target.value } : i))} className="input-field text-sm flex-1" />
                </div>
              </Field>
              <Field label="Title"><input value={item.title} onChange={(e) => setItems((s) => s.map((i) => i.id === item.id ? { ...i, title: e.target.value } : i))} className="input-field text-sm" /></Field>
              <Field label="Description"><input value={item.desc} onChange={(e) => setItems((s) => s.map((i) => i.id === item.id ? { ...i, desc: e.target.value } : i))} className="input-field text-sm" /></Field>
            </div>
          </div>
        ))}
        <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }} className="btn-primary flex items-center gap-2">
          <span className="material-symbols-outlined">{saved ? 'check' : 'save'}</span>
          {saved ? 'Saved!' : 'Save Cards'}
        </button>
      </div>
    </div>
  )
}

const TABS = [
  { id: 'testimonials', icon: 'format_quote', label: 'Testimonials' },
  { id: 'hero',         icon: 'slideshow',    label: 'Hero Slides' },
  { id: 'company',      icon: 'business',     label: 'Company Info' },
  { id: 'whychooseus',  icon: 'star',         label: 'Why Choose Us' },
]

export default function AdminContent() {
  const [activeTab, setActiveTab] = useState('testimonials')

  return (
    <AdminLayout title="Content Management" subtitle="Edit all website content — testimonials, hero slides, company info, and more.">
      <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === tab.id ? 'bg-primary text-white shadow-md' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-secondary-container hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === 'testimonials' && <TestimonialsSection />}
      {activeTab === 'hero'         && <HeroSection />}
      {activeTab === 'company'      && <CompanyInfoSection />}
      {activeTab === 'whychooseus'  && <WhyChooseUsSection />}
    </AdminLayout>
  )
}
