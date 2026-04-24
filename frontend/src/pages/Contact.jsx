import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useSiteContent } from '../lib/useSiteContent'
import api from '../lib/api'

const DEFAULT_CONTACT_INFO = [
  { icon: 'location_on', title: 'Headquarters',   line1: 'Medical Park West, Floor 14', line2: 'London, UK EC1A 4HQ' },
  { icon: 'call',        title: 'Phone Support',  line1: '+44 (0) 20 7946 0123',        line2: 'Mon–Fri, 9am – 6pm GMT' },
  { icon: 'mail',        title: 'Email',          line1: 'support@pharmalinkwholesale.com', line2: 'procurement@pharmalinkwholesale.com' },
  { icon: 'schedule',    title: 'Business Hours', line1: 'Monday – Friday: 9am – 6pm GMT', line2: 'Saturday: 10am – 2pm GMT' },
]

const DEFAULT_FAQS = [
  { q: 'How quickly do you respond to RFQs?',  a: 'We respond to all RFQ submissions within 4–24 business hours with a formal quotation.' },
  { q: 'What is the minimum order quantity?',   a: 'MOQ varies by product. Many items have no minimum. Contact us for specific requirements.' },
  { q: 'Do you handle international shipping?', a: 'Yes. We ship to 50+ countries and handle all customs documentation and freight.' },
  { q: 'Are your products WHO-GMP certified?',  a: 'All products are sourced exclusively from WHO-GMP certified manufacturers.' },
]

const DEPARTMENTS = [
  { value: 'procurement', label: 'Procurement & RFQ' },
  { value: 'logistics',   label: 'Logistics & Shipping' },
  { value: 'regulatory',  label: 'Regulatory Affairs' },
  { value: 'support',     label: 'Customer Support' },
  { value: 'other',       label: 'Other' },
]

export default function Contact() {
  const contactInfo = useSiteContent('contact_info', DEFAULT_CONTACT_INFO)
  const faqs        = useSiteContent('faq', DEFAULT_FAQS)
  const [form, setForm]           = useState({ firstName: '', lastName: '', email: '', phone: '', company: '', department: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [openFaq, setOpenFaq]     = useState(null)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/contact', form)
      setSubmitted(true)
    } catch {
      alert('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>Contact Us — PharmaLink Pro</title>
        <meta name="description" content="Get in touch with our procurement specialists. Available Mon–Fri, 9am–6pm GMT." />
        <link rel="canonical" href="https://pharmalinkwholesale.com/contact" />
      </Helmet>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative bg-white py-28 px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1800&q=90"
            alt="Contact PharmaLink"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
        </div>
        <div className="relative z-10 max-w-screen-2xl mx-auto px-8 w-full flex flex-col items-center text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/95 text-primary text-xs font-bold tracking-widest uppercase mb-6 border border-primary/20 shadow-lg">
            Get In Touch
          </span>
          <h1
            className="text-white font-headline text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1] max-w-4xl"
            style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.6)' }}
          >
            Let's Secure Your Supply Chain
          </h1>
          <p
            className="text-white text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.7)' }}
          >
            Our procurement experts are ready to assist with bulk orders, regular supplies, or specialized pharmaceutical imports.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#contact-form" className="bg-primary text-white px-8 py-4 rounded-lg font-headline font-bold hover:scale-[1.02] transition-all shadow-xl inline-flex items-center gap-2 justify-center">
              Send a Message <span className="material-symbols-outlined">arrow_downward</span>
            </a>
            <Link to="/portal/rfq" className="bg-white/95 text-slate-900 px-8 py-4 rounded-lg font-headline font-bold hover:bg-white transition-all shadow-xl inline-flex items-center gap-2 justify-center">
              Submit an RFQ <span className="material-symbols-outlined">request_quote</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Contact Info Cards ────────────────────────────────────────────────── */}
      <section className="bg-primary py-16 px-8">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {(contactInfo || DEFAULT_CONTACT_INFO).map(item => (
            <div key={item.title} className="flex flex-col items-start gap-3">
              <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
              </div>
              <div>
                <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">{item.title}</p>
                <p className="text-white font-semibold text-sm leading-snug">{item.line1}</p>
                <p className="text-blue-200 text-xs mt-0.5">{item.line2}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <section id="contact-form" className="py-24 px-8">
        <div className="max-w-screen-2xl mx-auto grid lg:grid-cols-2 gap-16 items-start">

          {/* Left — form */}
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest mb-4 block">Send a Message</span>
            <h2 className="font-headline font-extrabold text-4xl text-on-surface mb-3">We'd Love to Hear From You</h2>
            <p className="text-on-surface-variant text-lg mb-10 leading-relaxed">
              Fill in the form and one of our specialists will get back to you within 1 business day.
            </p>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-10 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <span className="material-symbols-outlined text-emerald-600 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <h3 className="font-headline font-extrabold text-2xl text-emerald-800 mb-2">Message Sent!</h3>
                <p className="text-emerald-700 mb-6">Our team will get back to you within 1 business day.</p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ firstName: '', lastName: '', email: '', phone: '', company: '', department: '', message: '' }) }}
                  className="text-primary font-bold text-sm hover:underline inline-flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-base">refresh</span>
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-outline uppercase tracking-widest mb-2">First Name *</label>
                    <input required type="text" value={form.firstName} onChange={set('firstName')} placeholder="John"
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-on-surface placeholder:text-outline" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-outline uppercase tracking-widest mb-2">Last Name *</label>
                    <input required type="text" value={form.lastName} onChange={set('lastName')} placeholder="Smith"
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-on-surface placeholder:text-outline" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-outline uppercase tracking-widest mb-2">Email *</label>
                    <input required type="email" value={form.email} onChange={set('email')} placeholder="you@company.com"
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-on-surface placeholder:text-outline" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-outline uppercase tracking-widest mb-2">Phone</label>
                    <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+1 555 000 0000"
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-on-surface placeholder:text-outline" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-outline uppercase tracking-widest mb-2">Company</label>
                    <input type="text" value={form.company} onChange={set('company')} placeholder="Metro General Health"
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-on-surface placeholder:text-outline" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-outline uppercase tracking-widest mb-2">Department</label>
                    <div className="relative">
                      <select value={form.department} onChange={set('department')}
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-on-surface appearance-none">
                        <option value="">Select...</option>
                        {DEPARTMENTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-sm">expand_more</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-outline uppercase tracking-widest mb-2">Message *</label>
                  <textarea required rows={5} value={form.message} onChange={set('message')} placeholder="How can we help you today?"
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-on-surface placeholder:text-outline resize-none" />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full signature-gradient text-white py-4 rounded-xl font-headline font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all shadow-lg disabled:opacity-60">
                  {loading ? (
                    <><span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> Sending...</>
                  ) : (
                    <><span className="material-symbols-outlined text-lg">send</span> Send Message</>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right — map + quick links */}
          <div className="space-y-8">
            {/* Map */}
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest mb-4 block">Our Location</span>
              <div className="rounded-2xl overflow-hidden shadow-xl border border-outline-variant/20 h-72">
                <iframe
                  title="PharmaLink Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.819917806043!2d36.81989441475396!3d-1.281801599066062!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10d65b79eef9%3A0xe744e8d89e5a1b!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2sus!4v1683100000000!5m2!1sen!2sus"
                  width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"
                />
              </div>
            </div>

            {/* RFQ CTA card */}
            <div className="bg-primary rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center mb-5">
                  <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>request_quote</span>
                </div>
                <h3 className="font-headline font-extrabold text-xl text-white mb-2">Need a Formal Quotation?</h3>
                <p className="text-blue-200 text-sm mb-6 leading-relaxed">
                  Submit an RFQ and receive a detailed quotation with pricing within 4–24 hours.
                </p>
                <Link to="/portal/rfq"
                  className="bg-white text-primary px-6 py-3 rounded-xl font-headline font-bold text-sm hover:scale-[1.02] transition-all shadow-lg inline-flex items-center gap-2">
                  Submit RFQ <span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Response time badge */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: 'schedule', value: '< 24h', label: 'Response Time' },
                { icon: 'public',   value: '50+',   label: 'Countries' },
                { icon: 'verified', value: '99.8%', label: 'Satisfaction' },
              ].map(s => (
                <div key={s.label} className="bg-surface-container-low rounded-xl p-4 text-center border border-outline-variant/20">
                  <span className="material-symbols-outlined text-primary text-xl mb-2 block" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                  <p className="font-headline font-extrabold text-xl text-on-surface">{s.value}</p>
                  <p className="text-xs text-outline font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-8 bg-surface-container-low">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-primary uppercase tracking-widest mb-4 block">FAQ</span>
            <h2 className="font-headline font-extrabold text-4xl text-on-surface mb-4">Frequently Asked Questions</h2>
            <p className="text-on-surface-variant max-w-xl mx-auto">Everything you need to know about working with PharmaLink Pro.</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {(faqs || DEFAULT_FAQS).map((faq, i) => (
              <div key={faq.q} className="bg-white rounded-2xl border border-outline-variant/20 overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>help</span>
                    </div>
                    <span className="font-headline font-bold text-on-surface text-sm">{faq.q}</span>
                  </div>
                  <span className={`material-symbols-outlined text-outline transition-transform duration-300 flex-shrink-0 ml-4 ${openFaq === i ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 pt-0">
                    <div className="pl-11">
                      <p className="text-on-surface-variant text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-on-surface-variant text-sm mb-4">Still have questions?</p>
            <a href="#contact-form"
              className="signature-gradient text-white px-8 py-3 rounded-xl font-headline font-bold text-sm hover:opacity-90 transition-all shadow-lg inline-flex items-center gap-2">
              Contact Our Team <span className="material-symbols-outlined text-base">arrow_forward</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
