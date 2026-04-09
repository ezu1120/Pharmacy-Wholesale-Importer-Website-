import useRFQStore from '../store/rfqStore'

export default function ProductCard({ product, mode = 'browse', onCompare }) {
  const { addProduct, selectedProducts } = useRFQStore()
  const isAdded = selectedProducts.some((p) => p.productId === product.id)

  return (
    <div className="card card-hover p-6 group border border-transparent hover:border-primary/10">
      {/* Image */}
      <div className="aspect-[4/3] rounded-xl overflow-hidden mb-6 bg-surface-container-low relative">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-outline/30">medication</span>
          </div>
        )}
        <span className="absolute top-4 right-4 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
          In Stock
        </span>
      </div>

      {/* Info */}
      <div className="space-y-1 mb-6">
        <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest font-headline">
          {product.brand}
        </p>
        <h3 className="font-headline font-bold text-xl text-on-surface leading-tight">{product.name}</h3>
        {product.genericName && (
          <p className="text-sm text-on-surface-variant">
            Generic: <span className="font-medium">{product.genericName}</span>
          </p>
        )}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-surface-container">
          <span className="material-symbols-outlined text-sm text-on-surface-variant">inventory_2</span>
          <span className="text-xs text-on-surface-variant">{product.packageSize}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => addProduct(product)}
          disabled={isAdded}
          className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
            isAdded
              ? 'bg-secondary-container text-on-secondary-container cursor-default'
              : 'border border-primary/20 text-primary hover:bg-primary hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {isAdded ? 'check' : 'add_shopping_cart'}
          </span>
          {isAdded ? 'Added' : 'Add to RFQ'}
        </button>

        {mode === 'browse' && onCompare && (
          <button
            onClick={() => onCompare(product)}
            className="p-3 rounded-xl border border-outline/20 text-on-surface-variant hover:text-primary hover:border-primary/20 transition-all"
            title="Compare"
          >
            <span className="material-symbols-outlined text-lg">compare</span>
          </button>
        )}
      </div>
    </div>
  )
}
