import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

export default function RFQSuccess() {
  const { rfqNumber } = useParams()

  const { data } = useQuery({
    queryKey: ['rfq-lookup', rfqNumber],
    queryFn: () => api.get(`/rfq/${rfqNumber}`).then((r) => r.data),
    retry: false,
  })

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full text-center">

        {/* Success icon */}
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
          <span
            className="material-symbols-outlined text-green-600 text-5xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-headline font-extrabold text-4xl text-on-surface mb-4">
          RFQ Submitted Successfully!
        </h1>
        <p className="text-on-surface-variant text-lg mb-8 max-w-md mx-auto leading-relaxed">
          Your request for quotation has been received. Our procurement team will review it and respond within <strong className="text-on-surface">4–24 hours</strong>.
        </p>

        {/* RFQ Number card */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm mb-10 inline-block w-full max-w-sm mx-auto">
          <p className="text-xs font-bold text-outline uppercase tracking-widest mb-3">Your RFQ Reference Number</p>
          <p className="font-mono font-extrabold text-3xl text-primary tracking-wider">{rfqNumber}</p>
          <p className="text-xs text-on-surface-variant mt-3">
            Save this number to track your request status.
          </p>
        </div>

        {/* What happens next */}
        <div className="bg-surface-container-low rounded-2xl p-8 mb-10 text-left">
          <h2 className="font-headline font-bold text-lg text-on-surface mb-6 text-center">What Happens Next?</h2>
          <div className="space-y-5">
            {[
              { icon: 'mark_email_read', title: 'Confirmation Email Sent', desc: 'A confirmation email with your RFQ details has been sent to your email address.' },
              { icon: 'manage_search', title: 'Team Review', desc: 'Our procurement specialists will review your request and check product availability.' },
              { icon: 'request_quote', title: 'Formal Quotation', desc: 'You will receive a formal quotation with pricing and delivery terms within 4–24 hours.' },
              { icon: 'handshake', title: 'Order Confirmation', desc: 'Review and approve the quotation to proceed with your order.' },
            ].map((step, i) => (
              <div key={step.title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-lg">{step.icon}</span>
                </div>
                <div>
                  <p className="font-headline font-bold text-sm text-on-surface">{step.title}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status badge if available */}
        {data?.status && (
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full text-sm font-bold">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              Status: {data.status.replace('_', ' ')}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/track"
            className="border border-primary/20 text-primary px-8 py-3 rounded-xl font-headline font-bold hover:bg-primary hover:text-white transition-all flex items-center gap-2 justify-center"
          >
            <span className="material-symbols-outlined">track_changes</span>
            Track This RFQ
          </Link>
          <Link
            to="/products"
            className="border border-outline-variant text-on-surface-variant px-8 py-3 rounded-xl font-headline font-bold hover:bg-surface-container transition-all flex items-center gap-2 justify-center"
          >
            <span className="material-symbols-outlined">inventory_2</span>
            Browse More Products
          </Link>
          <Link
            to="/portal"
            className="signature-gradient text-white px-8 py-3 rounded-xl font-headline font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 justify-center"
          >
            <span className="material-symbols-outlined">history</span>
            View RFQ History
          </Link>
        </div>

        <p className="text-xs text-on-surface-variant mt-8">
          Questions? Contact us at{' '}
          <a href="mailto:procurement@pharmalinkwholesale.com" className="text-primary hover:underline">
            procurement@pharmalinkwholesale.com
          </a>
        </p>
      </div>
    </div>
  )
}
