import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

export default function RFQDetails() {
  const { id } = useParams()
  const qc = useQueryClient()

  const { data: rfq, isLoading } = useQuery({
    queryKey: ['admin-rfq', id],
    queryFn: () => api.get(`/admin/rfqs/${id}`).then((r) => r.data),
  })

  const updateStatus = useMutation({
    mutationFn: (status) => api.patch(`/admin/rfqs/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries(['admin-rfq', id]),
  })

  const sendQuotation = useMutation({
    mutationFn: () => api.post(`/admin/rfqs/${id}/respond`),
    onSuccess: () => qc.invalidateQueries(['admin-rfq', id]),
  })

  const exportPDF = () => window.open(`/api/admin/rfqs/${id}/pdf`, '_blank')

  if (isLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
    </div>
  )
  if (!rfq) return null

  const customerName = rfq.customerName || rfq.guest_full_name
  const companyName = rfq.companyName || rfq.guest_company
  const email = rfq.email || rfq.guest_email
  const phone = rfq.phone || rfq.guest_phone
  const city = rfq.city || rfq.guest_city
  const country = rfq.country || rfq.guest_country
  const businessType = rfq.businessType || rfq.guest_business_type

  const STATUS_BADGE = {
    NEW: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
    QUOTATION_SENT: 'bg-green-100 text-green-700',
    CLOSED: 'bg-slate-100 text-slate-500',
  }

  return (
    <div className="bg-background font-body text-on-surface antialiased min-h-screen">
      {/* Top bar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg shadow-sm h-20 flex justify-between items-center px-4 md:px-8">
        <div className="flex items-center gap-4">
          <Link to="/admin/rfqs" className="p-2 hover:bg-slate-100 transition-colors rounded-full text-primary">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="font-headline font-bold text-xl md:text-2xl tracking-tight text-primary">RFQ Details</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-xs font-bold text-primary">Admin User</span>
            <span className="text-[10px] text-slate-500">Pharma Distribution</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-white font-bold text-sm">A</div>
        </div>
      </header>

      <main className="pt-24 pb-32 px-4 max-w-4xl mx-auto space-y-6">
        {/* Status & Actions */}
        <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-outline">Reference ID</span>
              <h2 className="text-lg font-headline font-extrabold text-primary">{rfq.rfq_number}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${STATUS_BADGE[rfq.status]}`}>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>pending</span>
                  {rfq.status?.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-400">{new Date(rfq.submitted_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={rfq.status}
                onChange={(e) => updateStatus.mutate(e.target.value)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-surface-container-high rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container-highest transition-colors outline-none border-none"
              >
                <option value="NEW">New</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="QUOTATION_SENT">Quotation Sent</option>
                <option value="CLOSED">Closed</option>
              </select>
              <button
                onClick={() => sendQuotation.mutate()}
                disabled={sendQuotation.isPending}
                className="signature-gradient text-white px-6 py-3 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {sendQuotation.isPending ? 'Sending...' : 'Send Quotation'}
              </button>
            </div>
          </div>
        </section>

        {/* Customer Info */}
        <section className="bg-surface-container-low rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/20 bg-white/40">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">account_circle</span>
              <h3 className="font-headline font-bold text-on-surface">Customer Information</h3>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-tighter text-outline-variant">Client Name</label>
                <p className="text-sm font-semibold text-on-surface">{customerName}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-tighter text-outline-variant">Company / Facility</label>
                <p className="text-sm font-semibold text-on-surface">{companyName}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-tighter text-outline-variant">Business Type</label>
                <p className="text-sm font-semibold text-on-surface capitalize">{businessType}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-tighter text-outline-variant">Email Address</label>
                <p className="text-sm font-semibold text-primary underline underline-offset-4">{email}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-tighter text-outline-variant">Phone</label>
                <p className="text-sm font-semibold text-on-surface">{phone}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-tighter text-outline-variant">Location</label>
                <div className="flex items-center gap-1 text-sm font-semibold text-on-surface">
                  <span className="material-symbols-outlined text-base text-outline">location_on</span>
                  {city}, {country}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-headline font-bold text-lg text-on-surface">Requested Products</h3>
            <span className="text-xs font-medium text-outline">{rfq.items?.length} items requested</span>
          </div>
          <div className="space-y-3">
            {rfq.items?.map((item) => (
              <div key={item.id} className="bg-surface-container-lowest p-5 rounded-xl flex items-center justify-between gap-4 shadow-sm transition-transform hover:translate-x-1 duration-200 border-l-4 border-primary">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center">
                    <span className="material-symbols-outlined text-outline">medication_liquid</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">{item.product_name}</h4>
                    <p className="text-[11px] text-outline">{item.brand} • {item.unit}</p>
                    {item.notes && <p className="text-[11px] text-on-surface-variant italic mt-1">{item.notes}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-headline font-extrabold text-primary">{item.quantity}</p>
                  <p className="text-[10px] font-bold text-outline-variant uppercase">{item.unit}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Attachments */}
        {rfq.attachments?.length > 0 && (
          <section className="bg-surface-container-low rounded-xl p-6">
            <h3 className="font-headline font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">description</span>
              Documents &amp; Compliance
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rfq.attachments.map((file) => (
                <a key={file.id} href={file.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-white/60 rounded-lg hover:bg-white transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded bg-red-50 flex items-center justify-center text-red-600">
                    <span className="material-symbols-outlined">picture_as_pdf</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate text-on-surface">{file.file_name}</p>
                    <p className="text-[10px] text-outline">{(file.file_size / 1024).toFixed(0)} KB</p>
                  </div>
                  <span className="material-symbols-outlined text-outline group-hover:text-primary">download</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Internal Notes */}
        <section className="space-y-3">
          <h3 className="font-headline font-bold text-on-surface px-2">Internal Notes</h3>
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
            <textarea
              defaultValue={rfq.internal_notes || ''}
              className="w-full bg-surface-container-low border-none rounded-lg text-sm text-on-surface placeholder:text-outline-variant focus:ring-1 focus:ring-primary min-h-[120px] p-4 outline-none resize-none"
              placeholder="Add a private note for the fulfillment team..."
            />
            <div className="flex justify-end mt-3">
              <button className="text-[11px] font-bold text-primary uppercase tracking-wider px-4 py-2 hover:bg-primary/5 rounded-full transition-colors">Save Note</button>
            </div>
          </div>
        </section>
      </main>

      {/* Fixed footer actions */}
      <footer className="fixed bottom-0 left-0 right-0 h-24 bg-white/80 backdrop-blur-xl border-t border-slate-200/50 flex items-center justify-center px-6 z-50">
        <div className="max-w-4xl w-full flex items-center justify-between">
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-outline uppercase tracking-widest">Workflow State</p>
            <p className="text-sm font-semibold text-on-surface">{rfq.status?.replace('_', ' ')}</p>
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <button onClick={exportPDF} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 border border-outline-variant rounded-lg text-sm font-bold text-on-surface hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined text-base">picture_as_pdf</span>
              Export PDF
            </button>
            <button
              onClick={() => sendQuotation.mutate()}
              disabled={sendQuotation.isPending}
              className="flex-1 sm:flex-none signature-gradient text-white px-8 py-3 rounded-lg text-sm font-extrabold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-70"
            >
              {sendQuotation.isSuccess ? 'Sent!' : 'Send Quotation'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
