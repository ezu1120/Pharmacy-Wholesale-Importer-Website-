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
  const [form, setForm]       = useState({ firstName: '', lastName: '', email: '', phone: '', company: '', department: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]     = useState(false)

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
    <div className="bg-gray-50 min-h-screen">
      <Helmet>
        <title>Contact Us — PharmaLink Pro</title>
        <meta name="description" content="Get in touch with our procurement specialists. Available Mon–Fri, 9am–6pm GMT. Submit an RFQ or send us a message." />
        <link rel="canonical" href="https://pharmalinkwholesale.com/contact" />
      </Helmet>

      {/* Hero */}
      <section className="relative h-80 flex items-center overflow-hidden bg-white">
        <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&q=90" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10" />
        <div className="absolute inset-0 bg-primary/5" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/95 text-primary text-xs font-bold tracking-widest uppercase mb-4 border border-primary/20 shadow-lg">Get In Touch</span>
          <h1 className="text-white font-extrabold text-4xl sm:text-5xl mt-2 mb-3" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.6)' }}>Let's Secure Your Supply Chain</h1>
          <p className="text-white text-sm sm:text-base max-w-xl mx-auto font-medium" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.7)' }}>
            Our procurement experts are ready to assist with bulk orders, regular supplies, or specialized imports.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left — contact info */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Contact Information</h2>
              <div className="space-y-5">
                {(contactInfo || DEFAULT_CONTACT_INFO).map(item => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary text-lg">{item.icon}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{item.title}</p>
                      <p className="text-sm text-gray-900">{item.line1}</p>
                      <p className="text-sm text-gray-500">{item.line2}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-primary rounded-xl p-6 text-white">
              <h3 className="font-bold text-base mb-3">Need a Quotation?</h3>
              <p className="text-blue-100 text-sm mb-4">Submit an RFQ and receive a formal quotation within 4–24 hours.</p>
              <Link to="/portal/rfq" className="bg-white text-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors inline-flex items-center gap-2">
                Submit RFQ <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>

            {/* Map */}
            <div className="rounded-xl overflow-hidden border border-gray-200 h-48">
              <iframe
                title="PharmaLink Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.819917806043!2d36.81989441475396!3d-1.281801599066062!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10d65b79eef9%3A0xe744e8d89e5a1b!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2sus!4v1683100000000!5m2!1sen!2sus"
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"
              />
            </div>
          </div>

          {/* Right — form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-green-600 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-500 text-sm mb-6">Our team will get back to you within 1 business day.</p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ firstName: '', lastName: '', email: '', phone: '', company: '', department: '', message: '' }) }}
                    className="text-primary text-sm font-semibold hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Send a Message</h2>
                  <p className="text-sm text-gray-500 mb-6">We'll respond within 1 business day.</p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">First Name *</label>
                        <input required type="text" value={form.firstName} onChange={set('firstName')} placeholder="John" className="input-field" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Last Name *</label>
                        <input required type="text" value={form.lastName} onChange={set('lastName')} placeholder="Smith" className="input-field" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email *</label>
                        <input required type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" className="input-field" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone</label>
                        <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+1 555 000 0000" className="input-field" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Company</label>
                        <input type="text" value={form.company} onChange={set('company')} placeholder="Metro General Health" className="input-field" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Department</label>
                        <div className="relative">
                          <select value={form.department} onChange={set('department')} className="input-field appearance-none">
                            <option value="">Select...</option>
                            {DEPARTMENTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">expand_more</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Message *</label>
                      <textarea required rows={4} value={form.message} onChange={set('message')} placeholder="How can we help you?" className="input-field resize-none" />
                    </div>

                    <button type="submit" disabled={loading} className="w-full btn-primary justify-center py-2.5 text-sm disabled:opacity-60">
                      {loading ? (
                        <><span className="material-symbols-outlined animate-spin text-base">progress_activity</span> Sending...</>
                      ) : (
                        <><span className="material-symbols-outlined text-base">send</span> Send Message</>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <div className="text-center mb-8">
            <span className="section-label">FAQ</span>
            <h2 className="section-title mt-1">Frequently Asked Questions</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {(faqs || DEFAULT_FAQS).map(faq => (
              <div key={faq.q} className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-base flex-shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>help</span>
                  {faq.q}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
