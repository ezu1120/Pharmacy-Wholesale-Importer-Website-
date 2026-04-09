import useRFQStore from '../store/rfqStore'

export default function RFQTable() {
  const { selectedProducts, updateProduct, removeProduct } = useRFQStore()

  if (selectedProducts.length === 0) {
    return (
      <div className="text-center py-16 text-on-surface-variant">
        <span className="material-symbols-outlined text-5xl mb-4 block opacity-30">inventory_2</span>
        <p className="font-medium">No products added yet.</p>
        <p className="text-sm mt-1">Search and add products from the catalog above.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] font-bold text-outline uppercase tracking-wider border-b border-surface-container">
            <th className="text-left py-3 pr-4">Product</th>
            <th className="text-left py-3 pr-4">Brand</th>
            <th className="text-left py-3 pr-4 w-28">Qty</th>
            <th className="text-left py-3 pr-4 w-28">Unit</th>
            <th className="text-left py-3 pr-4">Notes</th>
            <th className="py-3 w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container">
          {selectedProducts.map((item) => (
            <tr key={item.productId} className="group">
              <td className="py-4 pr-4 font-medium text-on-surface">{item.productName}</td>
              <td className="py-4 pr-4 text-on-surface-variant">{item.brand}</td>
              <td className="py-4 pr-4">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateProduct(item.productId, { quantity: parseInt(e.target.value) || 1 })}
                  className="input-field w-24 py-2 text-center"
                />
              </td>
              <td className="py-4 pr-4">
                <select
                  value={item.unit}
                  onChange={(e) => updateProduct(item.productId, { unit: e.target.value })}
                  className="input-field w-28 py-2"
                >
                  <option>units</option>
                  <option>boxes</option>
                  <option>packs</option>
                  <option>vials</option>
                  <option>bottles</option>
                </select>
              </td>
              <td className="py-4 pr-4">
                <input
                  type="text"
                  value={item.notes}
                  onChange={(e) => updateProduct(item.productId, { notes: e.target.value })}
                  placeholder="Optional note..."
                  className="input-field py-2"
                />
              </td>
              <td className="py-4">
                <button
                  onClick={() => removeProduct(item.productId)}
                  className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error-container/20 transition-all"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
