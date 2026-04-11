import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import AdminLayout from '../components/AdminLayout'

// ── Shared helpers ────────────────────────────────────────────────────────────
function Field({ label, children, col2 }) {
  return (
    <div className={`space-y-1.5 ${col2 ? 'md:col-span-2' : ''}`}>
      <label className="block text-xs font-bold text-outline uppercase tracking-widest">{label}</label>
      {children}
    </div>
  )
}

function SaveBtn({ onClick, saved, pending, label = 'Save Changes' }) {
  return (
    <button onClick={onClick} disabled={pending} className="btn-primary flex items-center gap-2 disabled:opacity-50">
      <span className="material-symbols-outlined text-base">{saved ? 'check' : 'save'}</span>
      {pending ? 'Saving...' : saved ? 'Saved!' : label}
    </button>
  )
}

function ImageField({ label, value, onChange }) {
  return (
    <Field label={label}>
      <input value={value} onChange={onChange} placeholder="https://images.unsplash.com/..." className="input-field text-sm" />
      {value && (
        <img src={value} alt="preview" className="mt-2 h-20 w-32 object-cover rounded-lg border border-outline-variant/20"
          onError={(e) => e.target.style.display = 'none'} />
      )}
    </Field>
  )
}

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="p-6 border-b border-surface-container flex items-center gap-3">
      <span className="material-symbols-outlined text-primary">{icon}</span>
      <div>
        <h2 className="font-headline font-bold text-xl text-on-surface">{title}</h2>
        {subtitle && <p className="text-xs text-on-surface-variant mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

// ── Testimonials ──────────────────────────────────────────────────────────────
function TestimonialsSection() {
  const qc = useQueryClient()
  const [form, setForm] = useState({ customerName: '', companyName: '', comment: '' })
  const [editing, setEditing] = useState(null)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const { data: list = [], isLoading } = useQuery({ queryKey: ['admin-testimonials'], queryFn: () => api.get('/admin/testimonials').then(r => r.data) })
  const create = useMutation({ mutationFn: d => api.post('/admin/testimonials', d), onSuccess: () => { qc.invalidateQueries(['admin-testimonials']); setForm({ customerName: '', companyName: '', comment: '' }) } })
  const update = useMutation({ mutationFn: ({ id, ...d }) => api.put(`/admin/testimonials/${id}`, d), onSuccess: () => { qc.invalidateQueries(['admin-testimonials']); setEditing(null) } })
  const remove = useMutation({ mutationFn: id => api.delete(`/admin/testimonials/${id}`), onSuccess: () => qc.invalidateQueries(['admin-testimonials']) })

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
      <SectionHeader icon="format_quote" title="Testimonials" subtitle={`${list.length} customer reviews shown on Home & About pages`} />
      <div className="p-6 space-y-5">
        <div className="bg-surface-container-low rounded-xl p-5">
          <p className="text-xs font-bold text-outline uppercase tracking-widest mb-4">Add New Testimonial</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Field label="Customer Name *"><input value={form.customerName} onChange={set('customerName')} placeholder="Dr. Sarah Jenkins" className="input-field" /></Field>
            <Field label="Company / Role"><input value={form.companyName} onChange={set('companyName')} placeholder="Hospital Administrator, St. Jude Medical" className="input-field" /></Field>
            <Field label="Comment *" col2><textarea value={form.comment} onChange={set('comment')} rows={3} placeholder="Customer feedback..." className="input-field resize-none" /></Field>
          </div>
          <SaveBtn onClick={() => create.mutate(form)} pending={create.isPending} saved={false} label="Add Testimonial" />
        </div>
        {isLoading ? <div className="h-20 bg-surface-container rounded-xl animate-pulse" /> : list.map(t => (
          <div key={t.id} className="bg-surface-container-low rounded-xl p-5">
            {editing?.id === t.id ? (
              <div className="space-y-3">
                <input value={editing.customerName} onChange={e => setEditing(ed => ({ ...ed, customerName: e.target.value }))} className="input-field" placeholder="Name" />
                <input value={editing.companyName} onChange={e => setEditing(ed => ({ ...ed, companyName: e.target.value }))} className="input-field" placeholder="Company" />
                <textarea value={editing.comment} onChange={e => setEditing(ed => ({ ...ed, comment: e.target.value }))} rows={3} className="input-field resize-none" />
                <div className="flex gap-2">
                  <SaveBtn onClick={() => update.mutate(editing)} pending={update.isPending} saved={false} label="Save" />
                  <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl border border-outline-variant text-sm">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-bold text-sm text-on-surface">{t.customerName} <span className="font-normal text-on-surface-variant text-xs">— {t.companyName}</span></p>
                  <p className="text-sm text-on-surface-variant italic mt-1">"{t.comment}"</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(t)} className="p-2 rounded-lg hover:bg-surface-container text-primary"><span className="material-symbols-outlined text-base">edit</span></button>
                  <button onClick={() => remove.mutate(t.id)} className="p-2 rounded-lg hover:bg-error-container/20 text-error"><span className="material-symbols-outlined text-base">delete</span></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Hero Slides ───────────────────────────────────────────────────────────────
function HeroSlidesSection() {
  const [slides, setSlides] = useState([
    { id: 1, img: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1800&q=90', badge: 'Global Distribution Excellence', accent: 'Import Solutions', subtitle: 'Supplying medical institutions worldwide with precision-sourced medications, surgical supplies, and laboratory equipment through a certified cold-chain network.' },
    { id: 2, img: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1800&q=90', badge: 'WHO-GMP Certified Sources', accent: 'Pharmaceutical Wholesale', subtitle: 'Every product in our catalog meets rigorous international standards including WHO, FDA, and EMA guidelines — from origin to delivery.' },
    { id: 3, img: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=1800&q=90', badge: 'Cold Chain Specialists', accent: 'Temperature-Controlled Logistics', subtitle: 'IoT-monitored cold chain handling for temperature-sensitive pharmaceuticals. 2–8°C compliance guaranteed throughout the entire supply chain.' },
    { id: 4, img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1800&q=90', badge: 'Surgical & Medical Supplies', accent: 'Sterile & Certified', subtitle: 'Precision instruments, sterile disposables, and medical consumables for operating theaters and clinical environments worldwide.' },
  ])
  const [saved, setSaved] = useState(false)
  const upd = (id, k, v) => setSlides(s => s.map(sl => sl.id === id ? { ...sl, [k]: v } : sl))

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
      <SectionHeader icon="slideshow" title="Hero Slideshow" subtitle="4 rotating slides on the Home page hero banner" />
      <div className="p-6 space-y-4">
        {slides.map((sl, i) => (
          <div key={sl.id} className="bg-surface-container-low rounded-xl p-5">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-4">Slide {i + 1}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Badge Text"><input value={sl.badge} onChange={e => upd(sl.id, 'badge', e.target.value)} className="input-field text-sm" /></Field>
              <Field label="Headline Accent (blue text)"><input value={sl.accent} onChange={e => upd(sl.id, 'accent', e.target.value)} className="input-field text-sm" /></Field>
              <Field label="Subtitle" col2><textarea value={sl.subtitle} onChange={e => upd(sl.id, 'subtitle', e.target.value)} rows={2} className="input-field resize-none text-sm" /></Field>
              <div className="md:col-span-2">
                <ImageField label="Background Image URL" value={sl.img} onChange={e => upd(sl.id, 'img', e.target.value)} />
              </div>
            </div>
          </div>
        ))}
        <SaveBtn onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }} saved={saved} pending={false} />
        <p className="text-xs text-on-surface-variant">Note: Save updates the local state. To persist across sessions, connect to the content_blocks API.</p>
      </div>
    </div>
  )
}

// ── Company Info ──────────────────────────────────────────────────────────────
function CompanyInfoSection() {
  const [d, setD] = useState({
    name: 'PharmaLink Wholesale', tagline: 'Trusted Pharmaceutical Wholesale & Import Solutions',
    description: 'PharmaLink Pro operates at the intersection of medical necessity and logistical precision. As a licensed global wholesaler, we remove the complexities of international pharmaceutical procurement.',
    address: 'Medical Park West, Floor 14, London, UK EC1A 4HQ',
    phone: '+44 (0) 20 7946 0123', hours: 'Mon–Fri, 9am – 6pm GMT',
    email: 'support@pharmalinkwholesale.com', procurementEmail: 'procurement@pharmalinkwholesale.com',
    yearsExp: '15+', countries: '50+', products: '10,000+', accuracy: '99.8%',
    aboutImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=90',
    aboutHeading: 'The Essential Bridge in Healthcare Supply Chains',
    missionTitle: 'Our Mission', missionText: 'To make pharmaceutical procurement transparent, efficient, and accessible for every healthcare institution worldwide.',
    visionTitle: 'Our Vision', visionText: 'A world where no patient goes without medicine due to supply chain failures or procurement inefficiencies.',
  })
  const [saved, setSaved] = useState(false)
  const set = k => e => setD(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
      <SectionHeader icon="business" title="Company Information" subtitle="Used across Home, About, Contact, and Services pages" />
      <div className="p-6 space-y-8">
        <div>
          <p className="text-xs font-bold text-outline uppercase tracking-widest mb-4">Brand & Identity</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Company Name"><input value={d.name} onChange={set('name')} className="input-field" /></Field>
            <Field label="Tagline"><input value={d.tagline} onChange={set('tagline')} className="input-field" /></Field>
            <Field label="Description" col2><textarea value={d.description} onChange={set('description')} rows={3} className="input-field resize-none" /></Field>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-outline uppercase tracking-widest mb-4">Contact Details</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Address" col2><input value={d.address} onChange={set('address')} className="input-field" /></Field>
            <Field label="Phone"><input value={d.phone} onChange={set('phone')} className="input-field" /></Field>
            <Field label="Business Hours"><input value={d.hours} onChange={set('hours')} className="input-field" /></Field>
            <Field label="Support Email"><input value={d.email} onChange={set('email')} className="input-field" /></Field>
            <Field label="Procurement Email"><input value={d.procurementEmail} onChange={set('procurementEmail')} className="input-field" /></Field>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-outline uppercase tracking-widest mb-4">Homepage Stats</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Years Experience"><input value={d.yearsExp} onChange={set('yearsExp')} className="input-field" /></Field>
            <Field label="Countries Served"><input value={d.countries} onChange={set('countries')} className="input-field" /></Field>
            <Field label="Products Count"><input value={d.products} onChange={set('products')} className="input-field" /></Field>
            <Field label="Order Accuracy"><input value={d.accuracy} onChange={set('accuracy')} className="input-field" /></Field>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-outline uppercase tracking-widest mb-4">About Page — Mission & Vision</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImageField label="About Section Image" value={d.aboutImage} onChange={set('aboutImage')} />
            <Field label="About Heading"><input value={d.aboutHeading} onChange={set('aboutHeading')} className="input-field" /></Field>
            <Field label="Mission Title"><input value={d.missionTitle} onChange={set('missionTitle')} className="input-field" /></Field>
            <Field label="Mission Text"><textarea value={d.missionText} onChange={set('missionText')} rows={2} className="input-field resize-none" /></Field>
            <Field label="Vision Title"><input value={d.visionTitle} onChange={set('visionTitle')} className="input-field" /></Field>
            <Field label="Vision Text"><textarea value={d.visionText} onChange={set('visionText')} rows={2} className="input-field resize-none" /></Field>
          </div>
        </div>
        <SaveBtn onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }} saved={saved} pending={false} />
      </div>
    </div>
  )
}

// ── Why Choose Us ─────────────────────────────────────────────────────────────
function WhyChooseUsSection() {
  const [items, setItems] = useState([
    { id: 1, icon: 'verified',       title: 'Genuine Products',    desc: 'Direct sourcing from certified manufacturers only.' },
    { id: 2, icon: 'payments',       title: 'Competitive Pricing', desc: 'Economies of scale passed directly to our clients.' },
    { id: 3, icon: 'local_shipping', title: 'Fast Delivery',       desc: 'Optimized air & sea freight for rapid turnaround.' },
    { id: 4, icon: 'gavel',          title: 'Licensed & Certified',desc: 'Strict adherence to regional health authorities.' },
  ])
  const [saved, setSaved] = useState(false)
  const upd = (id, k, v) => setItems(s => s.map(i => i.id === id ? { ...i, [k]: v } : i))

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
      <SectionHeader icon="star" title="Why Choose Us" subtitle="4 cards shown on Home, Contact, and Services pages" />
      <div className="p-6 space-y-4">
        {items.map(item => (
          <div key={item.id} className="bg-surface-container-low rounded-xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <Field label="Icon (Material Symbol)">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                  <input value={item.icon} onChange={e => upd(item.id, 'icon', e.target.value)} className="input-field text-sm flex-1" />
                </div>
              </Field>
              <Field label="Title"><input value={item.title} onChange={e => upd(item.id, 'title', e.target.value)} className="input-field text-sm" /></Field>
              <Field label="Description"><input value={item.desc} onChange={e => upd(item.id, 'desc', e.target.value)} className="input-field text-sm" /></Field>
            </div>
          </div>
        ))}
        <SaveBtn onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }} saved={saved} pending={false} />
      </div>
    </div>
  )
}

// ── Team Members ──────────────────────────────────────────────────────────────
function TeamSection() {
  const [team, setTeam] = useState([
    { id: 1, name: 'Dr. Helena Richardson', role: 'Chief Executive Officer',       bio: '20+ years in pharmaceutical supply chain. Former VP at Novartis Global Distribution.', img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80' },
    { id: 2, name: 'James Okafor',          role: 'Head of Regulatory Affairs',    bio: 'Expert in international pharmaceutical compliance. Certified by WHO and EMA frameworks.',  img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80' },
    { id: 3, name: 'Dr. Mei Lin',           role: 'Director of Quality Assurance', bio: 'PhD in Pharmaceutical Sciences. Oversees all product verification and cold chain protocols.', img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80' },
    { id: 4, name: 'Carlos Mendez',         role: 'VP of Global Logistics',        bio: 'Specialist in air and sea freight for temperature-sensitive cargo across 50+ countries.',   img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80' },
  ])
  const [saved, setSaved] = useState(false)
  const upd = (id, k, v) => setTeam(s => s.map(m => m.id === id ? { ...m, [k]: v } : m))

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
      <SectionHeader icon="groups" title="Leadership Team" subtitle="4 team member cards shown on the About page" />
      <div className="p-6 space-y-4">
        {team.map(m => (
          <div key={m.id} className="bg-surface-container-low rounded-xl p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Full Name"><input value={m.name} onChange={e => upd(m.id, 'name', e.target.value)} className="input-field" /></Field>
              <Field label="Role / Title"><input value={m.role} onChange={e => upd(m.id, 'role', e.target.value)} className="input-field" /></Field>
              <Field label="Bio" col2><textarea value={m.bio} onChange={e => upd(m.id, 'bio', e.target.value)} rows={2} className="input-field resize-none" /></Field>
              <div className="md:col-span-2">
                <ImageField label="Photo URL" value={m.img} onChange={e => upd(m.id, 'img', e.target.value)} />
              </div>
            </div>
          </div>
        ))}
        <SaveBtn onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }} saved={saved} pending={false} />
      </div>
    </div>
  )
}

// ── Timeline / Milestones ─────────────────────────────────────────────────────
function TimelineSection() {
  const [items, setItems] = useState([
    { id: 1, year: '2009', title: 'Founded',           desc: 'PharmaLink established in London as a regional pharmaceutical wholesaler.' },
    { id: 2, year: '2012', title: 'WHO Certification', desc: 'Achieved WHO-GMP certification, opening doors to international markets.' },
    { id: 3, year: '2015', title: 'Cold Chain Launch', desc: 'Launched dedicated cold chain division with IoT temperature monitoring.' },
    { id: 4, year: '2018', title: 'Digital Platform',  desc: 'Introduced the first version of our digital RFQ procurement portal.' },
    { id: 5, year: '2021', title: 'Global Expansion',  desc: 'Expanded operations to 50+ countries across 6 continents.' },
    { id: 6, year: '2024', title: 'PharmaLink Pro',    desc: 'Launched PharmaLink Pro — the next generation of B2B pharmaceutical procurement.' },
  ])
  const [saved, setSaved] = useState(false)
  const upd = (id, k, v) => setItems(s => s.map(i => i.id === id ? { ...i, [k]: v } : i))

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
      <SectionHeader icon="timeline" title="Company Timeline" subtitle="6 milestone cards shown on the About page" />
      <div className="p-6 space-y-3">
        {items.map(item => (
          <div key={item.id} className="bg-surface-container-low rounded-xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <Field label="Year"><input value={item.year} onChange={e => upd(item.id, 'year', e.target.value)} className="input-field text-sm" /></Field>
              <Field label="Title"><input value={item.title} onChange={e => upd(item.id, 'title', e.target.value)} className="input-field text-sm" /></Field>
              <div className="md:col-span-2">
                <Field label="Description"><input value={item.desc} onChange={e => upd(item.id, 'desc', e.target.value)} className="input-field text-sm" /></Field>
              </div>
            </div>
          </div>
        ))}
        <SaveBtn onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }} saved={saved} pending={false} />
      </div>
    </div>
  )
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
function FAQSection() {
  const [faqs, setFaqs] = useState([
    { id: 1, q: 'How quickly do you respond to RFQs?',    a: 'We respond to all RFQ submissions within 4–24 business hours with a formal quotation.' },
    { id: 2, q: 'What is the minimum order quantity?',     a: 'MOQ varies by product. Many items have no minimum. Contact us for specific product requirements.' },
    { id: 3, q: 'Do you handle international shipping?',   a: 'Yes. We ship to 50+ countries and handle all customs documentation and freight arrangements.' },
    { id: 4, q: 'Are your products WHO-GMP certified?',    a: 'All products in our catalog are sourced exclusively from WHO-GMP certified manufacturers.' },
  ])
  const [saved, setSaved] = useState(false)
  const upd = (id, k, v) => setFaqs(s => s.map(f => f.id === id ? { ...f, [k]: v } : f))
  const add = () => setFaqs(s => [...s, { id: Date.now(), q: '', a: '' }])
  const del = id => setFaqs(s => s.filter(f => f.id !== id))

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
      <SectionHeader icon="help" title="FAQ" subtitle="Shown on the Contact page" />
      <div className="p-6 space-y-3">
        {faqs.map(faq => (
          <div key={faq.id} className="bg-surface-container-low rounded-xl p-4">
            <div className="grid grid-cols-1 gap-3">
              <Field label="Question"><input value={faq.q} onChange={e => upd(faq.id, 'q', e.target.value)} className="input-field text-sm" /></Field>
              <div className="flex gap-2 items-start">
                <div className="flex-1"><Field label="Answer"><textarea value={faq.a} onChange={e => upd(faq.id, 'a', e.target.value)} rows={2} className="input-field resize-none text-sm" /></Field></div>
                <button onClick={() => del(faq.id)} className="mt-6 p-2 rounded-lg hover:bg-error-container/20 text-error flex-shrink-0"><span className="material-symbols-outlined text-base">delete</span></button>
              </div>
            </div>
          </div>
        ))}
        <div className="flex gap-3">
          <button onClick={add} className="btn-secondary flex items-center gap-2 text-sm"><span className="material-symbols-outlined text-base">add</span>Add FAQ</button>
          <SaveBtn onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }} saved={saved} pending={false} />
        </div>
      </div>
    </div>
  )
}

// ── Contact Info ──────────────────────────────────────────────────────────────
function ContactInfoSection() {
  const [info, setInfo] = useState([
    { id: 1, icon: 'location_on', title: 'Headquarters',   line1: 'Medical Park West, Floor 14', line2: 'London, UK EC1A 4HQ' },
    { id: 2, icon: 'call',        title: 'Phone Support',  line1: '+44 (0) 20 7946 0123',        line2: 'Mon–Fri, 9am – 6pm GMT' },
    { id: 3, icon: 'mail',        title: 'Email',          line1: 'support@pharmalinkwholesale.com', line2: 'procurement@pharmalinkwholesale.com' },
    { id: 4, icon: 'schedule',    title: 'Business Hours', line1: 'Monday – Friday: 9am – 6pm GMT', line2: 'Saturday: 10am – 2pm GMT' },
  ])
  const [saved, setSaved] = useState(false)
  const upd = (id, k, v) => setInfo(s => s.map(i => i.id === id ? { ...i, [k]: v } : i))

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
      <SectionHeader icon="contact_mail" title="Contact Information" subtitle="Shown on Home and Contact pages" />
      <div className="p-6 space-y-3">
        {info.map(item => (
          <div key={item.id} className="bg-surface-container-low rounded-xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <Field label="Icon">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">{item.icon}</span>
                  <input value={item.icon} onChange={e => upd(item.id, 'icon', e.target.value)} className="input-field text-sm flex-1" />
                </div>
              </Field>
              <Field label="Title"><input value={item.title} onChange={e => upd(item.id, 'title', e.target.value)} className="input-field text-sm" /></Field>
              <Field label="Line 1"><input value={item.line1} onChange={e => upd(item.id, 'line1', e.target.value)} className="input-field text-sm" /></Field>
              <Field label="Line 2"><input value={item.line2} onChange={e => upd(item.id, 'line2', e.target.value)} className="input-field text-sm" /></Field>
            </div>
          </div>
        ))}
        <SaveBtn onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }} saved={saved} pending={false} />
      </div>
    </div>
  )
}

// ── Services ──────────────────────────────────────────────────────────────────
function ServicesSection() {
  const [services, setServices] = useState([
    { id: 1, icon: 'local_shipping', title: 'Pharmaceutical Wholesale Supply',    desc: 'We supply bulk pharmaceutical products directly to pharmacies, hospitals, clinics, and distributors at competitive wholesale prices.', features: ['Bulk order discounts', 'Flexible MOQ', 'Dedicated account manager', 'Priority stock allocation'], img: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80' },
    { id: 2, icon: 'flight',         title: 'International Import & Export',      desc: 'Licensed pharmaceutical importer with global sourcing capabilities. We handle all regulatory documentation, customs clearance, and international freight.', features: ['WHO-GMP certified sources', 'Full customs clearance', 'Import/export licensing', 'Multi-country sourcing'], img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80' },
    { id: 3, icon: 'thermostat',     title: 'Cold Chain Logistics',               desc: 'Specialized temperature-controlled storage and distribution for biologics, vaccines, and temperature-sensitive pharmaceuticals.', features: ['2–8°C compliance', 'IoT temperature monitoring', 'Validated cold rooms', 'Real-time tracking'], img: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80' },
    { id: 4, icon: 'request_quote',  title: 'RFQ & Quotation Management',         desc: 'Our digital RFQ platform allows healthcare institutions to submit structured quotation requests for multiple products simultaneously.', features: ['Multi-product RFQ', 'Digital quotation delivery', '4–24h response time', 'PDF quotation download'], img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80' },
    { id: 5, icon: 'verified_user',  title: 'Regulatory & Compliance Support',    desc: 'Our regulatory affairs team assists clients with product registration, import permits, and compliance documentation for all major international markets.', features: ['Product registration support', 'Import permit assistance', 'WHO/FDA/EMA compliance', 'Certificate of Analysis'], img: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&q=80' },
    { id: 6, icon: 'support_agent',  title: 'After-Sales & Technical Support',    desc: 'Dedicated customer support team available for order tracking, product queries, documentation requests, and post-delivery support.', features: ['Dedicated account manager', 'Order tracking portal', 'Documentation requests', 'Technical product queries'], img: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800&q=80' },
  ])
  const [saved, setSaved] = useState(false)
  const upd = (id, k, v) => setServices(s => s.map(sv => sv.id === id ? { ...sv, [k]: v } : sv))
  const updFeature = (id, fi, v) => setServices(s => s.map(sv => sv.id === id ? { ...sv, features: sv.features.map((f, i) => i === fi ? v : f) } : sv))

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
      <SectionHeader icon="build" title="Services" subtitle="6 service cards shown on the Services page" />
      <div className="p-6 space-y-5">
        {services.map(sv => (
          <div key={sv.id} className="bg-surface-container-low rounded-xl p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Icon">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{sv.icon}</span>
                  <input value={sv.icon} onChange={e => upd(sv.id, 'icon', e.target.value)} className="input-field text-sm flex-1" />
                </div>
              </Field>
              <Field label="Title"><input value={sv.title} onChange={e => upd(sv.id, 'title', e.target.value)} className="input-field text-sm" /></Field>
              <Field label="Description" col2><textarea value={sv.desc} onChange={e => upd(sv.id, 'desc', e.target.value)} rows={2} className="input-field resize-none text-sm" /></Field>
              <div className="md:col-span-2 grid grid-cols-2 gap-2">
                {sv.features.map((f, fi) => (
                  <Field key={fi} label={`Feature ${fi + 1}`}><input value={f} onChange={e => updFeature(sv.id, fi, e.target.value)} className="input-field text-sm" /></Field>
                ))}
              </div>
              <div className="md:col-span-2">
                <ImageField label="Section Image" value={sv.img} onChange={e => upd(sv.id, 'img', e.target.value)} />
              </div>
            </div>
          </div>
        ))}
        <SaveBtn onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }} saved={saved} pending={false} />
      </div>
    </div>
  )
}

// ── Categories ────────────────────────────────────────────────────────────────
function CategoriesSection() {
  const [cats, setCats] = useState([
    { id: 1, key: 'prescription',    label: 'Prescription Medicines',        count: '2,400+ SKUs', desc: 'Regulated prescription drugs sourced directly from certified manufacturers.', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80' },
    { id: 2, key: 'otc',             label: 'OTC Medications',               count: '1,800+ SKUs', desc: 'High-volume over-the-counter essentials for retail pharmacy networks.', img: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=800&q=80' },
    { id: 3, key: 'medical-supplies',label: 'Medical Supplies',              count: '3,200+ SKUs', desc: 'Consumables and disposables for clinical environments.', img: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=800&q=80' },
    { id: 4, key: 'surgical',        label: 'Surgical Products',             count: '900+ SKUs',   desc: 'Precision instruments and sterile disposables for operating theaters.', img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80' },
    { id: 5, key: 'laboratory',      label: 'Laboratory Equipment',          count: '1,100+ SKUs', desc: 'Diagnostic devices and consumables for clinical research facilities.', img: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&q=80' },
    { id: 6, key: 'personal-care',   label: 'Personal Care & Nutraceuticals',count: '600+ SKUs',   desc: 'Pharmaceutical-grade vitamins, supplements, and personal care products.', img: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800&q=80' },
  ])
  const [saved, setSaved] = useState(false)
  const upd = (id, k, v) => setCats(s => s.map(c => c.id === id ? { ...c, [k]: v } : c))

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
      <SectionHeader icon="category" title="Product Categories" subtitle="6 category sections shown on the Categories page" />
      <div className="p-6 space-y-4">
        {cats.map(cat => (
          <div key={cat.id} className="bg-surface-container-low rounded-xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Category Label"><input value={cat.label} onChange={e => upd(cat.id, 'label', e.target.value)} className="input-field text-sm" /></Field>
              <Field label="SKU Count"><input value={cat.count} onChange={e => upd(cat.id, 'count', e.target.value)} className="input-field text-sm" /></Field>
              <Field label="Description" col2><textarea value={cat.desc} onChange={e => upd(cat.id, 'desc', e.target.value)} rows={2} className="input-field resize-none text-sm" /></Field>
              <div className="md:col-span-2">
                <ImageField label="Category Image" value={cat.img} onChange={e => upd(cat.id, 'img', e.target.value)} />
              </div>
            </div>
          </div>
        ))}
        <SaveBtn onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }} saved={saved} pending={false} />
      </div>
    </div>
  )
}

// ── Main page with tabs ───────────────────────────────────────────────────────
const TABS = [
  { id: 'testimonials', icon: 'format_quote', label: 'Testimonials',   page: 'Home & About' },
  { id: 'hero',         icon: 'slideshow',    label: 'Hero Slides',    page: 'Home' },
  { id: 'company',      icon: 'business',     label: 'Company Info',   page: 'All Pages' },
  { id: 'whychooseus',  icon: 'star',         label: 'Why Choose Us',  page: 'Home & Contact' },
  { id: 'team',         icon: 'groups',       label: 'Team',           page: 'About' },
  { id: 'timeline',     icon: 'timeline',     label: 'Timeline',       page: 'About' },
  { id: 'faq',          icon: 'help',         label: 'FAQ',            page: 'Contact' },
  { id: 'contact',      icon: 'contact_mail', label: 'Contact Info',   page: 'Home & Contact' },
  { id: 'services',     icon: 'build',        label: 'Services',       page: 'Services' },
  { id: 'categories',   icon: 'category',     label: 'Categories',     page: 'Categories' },
]

export default function AdminContent() {
  const [activeTab, setActiveTab] = useState('testimonials')
  const active = TABS.find(t => t.id === activeTab)

  return (
    <AdminLayout
      title="Content Management"
      subtitle="Edit all website content — text, images, and data across every public page."
    >
      {/* Page coverage banner */}
      <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 mb-6 flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">info</span>
        <p className="text-sm text-on-surface">
          Currently editing: <strong className="text-primary">{active?.label}</strong>
          {active?.page && <span className="text-on-surface-variant"> — appears on <strong>{active.page}</strong></span>}
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === tab.id ? 'bg-primary text-white shadow-md' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-secondary-container hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'testimonials' && <TestimonialsSection />}
      {activeTab === 'hero'         && <HeroSlidesSection />}
      {activeTab === 'company'      && <CompanyInfoSection />}
      {activeTab === 'whychooseus'  && <WhyChooseUsSection />}
      {activeTab === 'team'         && <TeamSection />}
      {activeTab === 'timeline'     && <TimelineSection />}
      {activeTab === 'faq'          && <FAQSection />}
      {activeTab === 'contact'      && <ContactInfoSection />}
      {activeTab === 'services'     && <ServicesSection />}
      {activeTab === 'categories'   && <CategoriesSection />}
    </AdminLayout>
  )
}
