import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export default function Terms() {
  const { t } = useTranslation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="bg-background min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <h1 className="font-headline font-bold text-3xl md:text-5xl text-primary mb-8 text-center">{t('footer.terms')}</h1>
        <div className="bg-surface rounded-3xl p-8 md:p-12 shadow-sm border border-outline-variant/10 typography-content">
          <section className="space-y-6 text-on-surface-variant font-body leading-relaxed text-sm">
            <h2 className="text-xl font-bold text-on-surface">1. Introduction</h2>
            <p>Welcome to PharmaLink Wholesale. By accessing or using our B2B procurement platform, you agree to be bound by these Terms of Sale.</p>
            
            <h2 className="text-xl font-bold text-on-surface">2. Ordering and Quoting</h2>
            <p>All quotes provided via our platform are valid for 30 days unless otherwise stated. Completing an RFQ does not constitute a binding contract until an official invoice is generated and the initial deposit is confirmed.</p>
            
            <h2 className="text-xl font-bold text-on-surface">3. Payment Terms</h2>
            <p>Unless negotiated otherwise, our standard payment terms require a 50% deposit to initiate the order, with the remaining 50% due prior to dispatch or upon delivery, subject to agreed shipping terms.</p>
            
            <h2 className="text-xl font-bold text-on-surface">4. Shipping and Delivery</h2>
            <p>We are not liable for delays caused by customs, port congestion, or courier issues. Exact shipping costs and delivery estimates are finalized upon quotation acceptance.</p>

            <h2 className="text-xl font-bold text-on-surface">5. Returns and Claims</h2>
            <p>Claims for damaged goods must be reported to PharmaLink Wholesale within 72 hours of delivery. Products must remain in their original packaging for investigation.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
