import { Link } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import useRFQStore from '../store/rfqStore'
import { useSiteContent } from '../lib/useSiteContent'

const DEFAULT_SLIDES = [
  { img: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1600&q=85', badge: 'Global Distribution Excellence', headline: 'Trusted Pharmaceutical Wholesale', accent: 'Import Solutions', sub: 'Supplying quality medicines and medical products to pharmacies, hospitals, and clinics worldwide.' },
  { img: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1600&q=85', badge: 'WHO-GMP Certified Sources',       headline: 'Trusted Pharmaceutical Wholesale', accent: 'Import Solutions', sub: 'Supplying quality medicines and medical products to pharmacies, hospitals, and clinics worldwide.' },
  { img: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=1600&q=85', badge: 'Cold Chain Specialists',           headline: 'Trusted Pharmaceutical Wholesale', accent: 'Import Solutions', sub: 'Supplying quality medicines and medical products to pharmacies, hospitals, and clinics worldwide.' },
]

const DEFAULT_WHY = [
  { icon: 'verified',       title: 'Genuine Products',     desc: 'Direct sourcing from certified manufacturers only.' },
  { icon: 'payments',       title: 'Wholesale Pricing',    desc: 'Economies of scale passed directly to our clients.' },
  { icon: 'local_shipping', title: 'Fast Delivery',        desc: 'Optimized air & sea freight for rapid turnaround.' },
  { icon: 'gavel',          title: 'Licensed & Certified', desc: 'Strict adherence to regional health authorities.' },
  { icon: 'groups',         title: 'Expert Team',          desc: 'Dedicated professionals ensuring seamless procurement.' },
]

const CATEGORIES = [
  { key: 'prescription',     label: 'Prescription',    icon: 'medication',      color: 'bg-blue-50 text-blue-600' },
  { key: 'otc',              label: 'OTC Medicines',   icon: 'pill',            color: 'bg-green-50 text-green-600' },
  { key: 'medical-supplies', label: 'Medical Supplies',icon: 'medical_services',color: 'bg-violet-50 text-violet-600' },
  { key: 'surgical',         label: 'Surgical',        icon: 'content_cut',     color: 'bg-red-50 text-red-600' },
  { key: 'laboratory',       label: 'Laboratory',      icon: 'biotech',         color: 'bg-amber-50 text-amber-600' },
  { key: 'personal-care',    label: 'Personal Care',   icon: 'nutrition',       color: 'bg-teal-50 text-teal-600' },
]

const STEPS = [
  { n: 1, label: 'Browse Products',  desc: 'Explore our verified catalog of 10,000+ SKUs.' },
  { n: 2, label: 'Build Your RFQ',   desc: 'Add products with quantities and requirements.' },
  { n: 3, label: 'Submit Request',   desc: 'Provide delivery details and submit.' },
  { n: 4, label: 'Receive Quote',    desc: 'Get a formal quotation within 4–24 hours.' },
]

const PLACEHOLDER_PRODUCTS = [
  { id: 'p1', name: 'Amoxicillin 500mg', category: 'Prescription', brand: 'GlaxoSmithKline', packageSize: 'Box / 100 Caps', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=75' },
  { id: 'p2', name: 'Antiseptic Solution', category: 'OTC', brand: 'RB Health', packageSize: '500ml Bottle', imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&q=75' },
  { id: 'p3', name: 'Surgical Scalpel', category: 'Surgical', brand: 'Swann-Morton', packageSize: 'Box / 100', imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=75' },
  { id: 'p4', name: 'Vitamin C 1000mg', category: 'Wellness', brand: 'NutraCare', packageSize: '90 Effervescent Tabs', imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&q=75' },
]

const TESTIMONIALS = [
  { name: 'Dr. Sarah Jenkins', company: 'Hospital Administrator, St. Jude Medical', comment: "PharmaLink's cold chain logistics has been transformative for our oncology department. We never worry about the integrity of our temperature-sensitive imports.", img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&q=80' },
  { name: 'Mark Thompson', company: 'Owner, City Health Pharmacies', comment: "PharmaLink's RFQ portal simplifies the entire procurement process, letting me focus on patient care rather than logistics.", img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&q=80' },
]

// ── Hero Slideshow ────────────────────────────────────────────────────────────
function HeroSlideshow({ slides }) {
  const SLIDES = slides || DEFAULT_SLIDES
  const [current, setCurrent] = useState(0)
  const [transitioning, setTransitioning] = useState(false)

  const goTo = useCallback((i) => {
    if (transitioning || i === current) return
    setTransitioning(true)
    setCurrent(i)
    setTimeout(() => setTransitioning(false), 600)
  }, [current, transitioning])

  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo, SLIDES.length])

  useEffect(() => {
    const t = setInterval(next, 5500)
    return () => clearInterval(t)
  }, [next])

  const slide = SLIDES[current]

  return (
    <section className="relative h-[580px] flex items-center overflow-hidden bg-gray-900">
      {SLIDES.map((s, i) => (
        <div key={i} className="absolute inset-0 transition-opacity duration-700" style={{ opacity: i === current ? 1 : 0 }}>
          <img src={s.img} alt="" className="w-full h-full object-cover opacity-40" />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/50 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl">
          <span key={`badge-${current}`} className="inline-block px-3 py-1 rounded-full bg-primary/20 text-blue-200 text-xs font-semibold tracking-wider uppercase mb-5 border border-primary/30 animate-fade-in">
            {slide.badge}
          </span>
          <h1 key={`h1-${current}`} className="text-white font-bold text-4xl sm:text-5xl leading-tight mb-4 animate-fade-in">
            {slide.headline} &amp; <span className="text-blue-400">{slide.accent}</span>
          </h1>
          <p key={`p-${current}`} className="text-gray-300 text-base sm:text-lg mb-8 leading-relaxed animate-fade-in">
            {slide.sub}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/portal/rfq" className="btn-primary px-6 py-3 text-sm">
              Request Quotation
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
            <Link to="/products" className="px-6 py-3 rounded-lg border border-white/20 text-white text-sm font-semibold hover:bg-white/10 transition-colors">
              Browse Products
            </Link>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} className={`transition-all duration-300 rounded-full ${i === current ? 'w-6 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'}`} />
        ))}
      </div>

      {/* Progress */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-10">
        <div key={current} className="h-full bg-primary" style={{ animation: 'slideProgress 5.5s linear forwards' }} />
      </div>
    </section>
  )
}

// ── Featured Product Card ─────────────────────────────────────────────────────
function FeaturedCard({ product }) {
  const { addProduct, selectedProducts } = useRFQStore()
  const isAdded = selectedProducts.some(p => p.productId === product.id)
  const [imgErr, setImgErr] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all group overflow-hidden">
      <div className="h-40 bg-gray-50 overflow-hidden">
        {product.imageUrl && !imgErr ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={() => setImgErr(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-gray-200" style={{ fontVariationSettings: "'FILL' 1" }}>medication</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{product.brand}</p>
        <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-xs text-gray-500 mb-3">{product.packageSize || product.sub?.split('•')[0]?.trim()}</p>
        <button
          onClick={() => !isAdded && addProduct(product)}
          className={`w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            isAdded ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-primary/5 text-primary border border-primary/20 hover:bg-primary hover:text-white hover:border-primary'
          }`}
        >
          <span className="material-symbols-outlined text-sm">{isAdded ? 'check' : 'add_shopping_cart'}</span>
          {isAdded ? 'Added' : 'Add to RFQ'}
        </button>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const HERO_SLIDES  = useSiteContent('hero_slides', DEFAULT_SLIDES)
  const WHY_US       = useSiteContent('why_choose_us', DEFAULT_WHY)
  const { data: featured }     = useQuery({ queryKey: ['featured-products'],  queryFn: () => api.get('/products/featured').then(r => r.data) })
  const { data: testimonials } = useQuery({ queryKey: ['testimonials'],        queryFn: () => api.get('/content/testimonials').then(r => r.data) })
  const displayProducts     = featured?.length     > 0 ? featured.slice(0, 4)     : PLACEHOLDER_PRODUCTS
  const displayTestimonials = testimonials?.length > 0 ? testimonials.slice(0, 2) : TESTIMONIALS

  return (
    <>
      {/* 1. Hero */}
      <HeroSlideshow slides={HERO_SLIDES} />

      {/* 2. Trust bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '15+',    label: 'Years Experience' },
              { value: '50+',    label: 'Countries Served' },
              { value: '10,000+',label: 'Products in Catalog' },
              { value: '24h',    label: 'Quote Response' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-primary">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. About */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="section-label">About PharmaLink Pro</span>
              <h2 className="section-title mt-2 mb-4">Your Trusted Partner in Global Healthcare Supply</h2>
              <p className="section-sub mb-6">
                We bridge the gap between pharmaceutical manufacturers and healthcare providers worldwide, ensuring quality medicines reach those who need them most.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: 'verified',      title: 'WHO-GMP Certified',  sub: 'Verified quality standards' },
                  { icon: 'thermostat',    title: 'Cold Chain Ready',   sub: 'Temperature controlled' },
                  { icon: 'gavel',         title: 'Fully Licensed',     sub: 'Global export permits' },
                  { icon: 'local_shipping',title: 'Fast Delivery',      sub: 'Air & sea freight' },
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary text-lg">{item.icon}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Link to="/portal/rfq" className="btn-primary text-sm">Start Your RFQ <span className="material-symbols-outlined text-base">arrow_forward</span></Link>
                <Link to="/about" className="btn-secondary text-sm">Learn More</Link>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-xl aspect-[4/3]">
                <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=85" alt="Healthcare professional" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg px-5 py-3 border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-semibold text-gray-900">Available 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Categories */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="section-label">Our Products</span>
              <h2 className="section-title mt-1">Comprehensive Healthcare Solutions</h2>
            </div>
            <Link to="/categories" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors hidden sm:block">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.key}
                to={`/products?category=${cat.key}`}
                className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-primary/20 hover:shadow-sm transition-all text-center"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{cat.icon}</span>
                </div>
                <span className="text-xs font-semibold text-gray-700 group-hover:text-primary transition-colors">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Why Choose Us */}
      <section className="bg-primary py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-white font-bold text-2xl mb-10">Why Healthcare Leaders Choose Us</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {(WHY_US || DEFAULT_WHY).map(item => (
              <div key={item.title} className="text-center">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-blue-200 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                </div>
                <p className="text-white text-sm font-semibold mb-1">{item.title}</p>
                <p className="text-blue-200 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Featured Products */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="section-label">Ready to Ship</span>
              <h2 className="section-title mt-1">Featured Products</h2>
            </div>
            <Link to="/products" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors hidden sm:block">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayProducts.map(p => <FeaturedCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* 7. How It Works */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-label">Simple Process</span>
            <h2 className="section-title mt-1">How It Works</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.n} className="text-center">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-4 shadow-md shadow-primary/20">
                  {s.n}
                </div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">{s.label}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/portal/rfq" className="btn-primary text-sm">
              Start Your Request <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Testimonials */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="section-label">Testimonials</span>
            <h2 className="section-title mt-1">Trusted by Healthcare Professionals</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {displayTestimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    {t.avatar || t.img ? (
                      <img src={t.avatar || t.img} alt={t.customerName || t.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-gray-400">person</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.customerName || t.name}</p>
                    <p className="text-xs text-gray-500">{t.companyName || t.company}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 italic leading-relaxed">"{t.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. CTA */}
      <section className="bg-primary py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-white font-bold text-2xl sm:text-3xl mb-3">Ready to Streamline Your Supply Chain?</h2>
          <p className="text-blue-100 text-sm sm:text-base mb-8 max-w-xl mx-auto">
            Join thousands of healthcare providers who trust PharmaLink Pro for their pharmaceutical needs.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/portal/rfq" className="bg-white text-primary px-6 py-3 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors inline-flex items-center gap-2">
              Request Quotation <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
            <Link to="/contact" className="border border-white/20 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-white/10 transition-colors">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
