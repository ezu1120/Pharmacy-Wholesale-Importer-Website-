import { Link } from 'react-router-dom'
import useRFQStore from '../store/rfqStore'

/**
 * Glassmorphic floating RFQ summary bar — shown on Products page when items are selected.
 */
export default function RFQCart() {
  const { selectedProducts } = useRFQStore()

  if (selectedProducts.length === 0) return null

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl py-4 px-6 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <span className="material-symbols-outlined">description</span>
        </div>
        <div>
          <p className="font-headline font-bold text-on-surface">RFQ Summary</p>
          <p className="text-xs text-on-surface-variant font-medium">
            {selectedProducts.length} item{selectedProducts.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      </div>

      <Link to="/rfq" className="btn-primary text-sm px-8 py-3">
        Review Quote
      </Link>
    </div>
  )
}
