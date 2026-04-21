import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export default function Privacy() {
  const { t } = useTranslation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="bg-background min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <h1 className="font-headline font-bold text-3xl md:text-5xl text-primary mb-8 text-center">{t('footer.privacy')}</h1>
        <div className="bg-surface rounded-3xl p-8 md:p-12 shadow-sm border border-outline-variant/10 typography-content">
          <section className="space-y-6 text-on-surface-variant font-body leading-relaxed text-sm">
            <h2 className="text-xl font-bold text-on-surface">1. Data Collection</h2>
            <p>At PharmaLink Wholesale, we collect your name, email, company details, phone number, and any documents uploaded through our Request for Quotation (RFQ) or Live Chat systems for procedural and verification purposes.</p>
            
            <h2 className="text-xl font-bold text-on-surface">2. Data Usage</h2>
            <p>Your data is used solely for the processing of business quotation requests, establishing B2B contracts, providing customer support, and fulfilling orders.</p>
            
            <h2 className="text-xl font-bold text-on-surface">3. Data Sharing</h2>
            <p>We do not sell, rent, or trade your personal or business information to third parties. We may securely share specific shipment details with our registered logistics partners strictly for delivery fulfillment.</p>
            
            <h2 className="text-xl font-bold text-on-surface">4. Data Security</h2>
            <p>We employ enterprise-grade security measures to protect internal databases, user passwords, and documents from unauthorized access or disclosure.</p>

            <h2 className="text-xl font-bold text-on-surface">5. Contact Us</h2>
            <p>If you have questions concerning our privacy practices or wish to request the removal of your data from our systems, please contact our support team through the official Live Chat or contact endpoints.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
