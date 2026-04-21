import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useRFQStore = create(
  persist(
    (set, get) => ({
      // Wizard state
      currentStep: 1,
      customerInfo: {
        fullName: '',
        companyName: '',
        businessType: '',
        email: '',
        phone: '',
        country: '',
        city: '',
      },
      selectedProducts: [], // RFQLineItem[]
      additionalInfo: {
        requestedDeliveryDate: '',
        shippingMethod: '',
        message: '',
        attachments: [],
      },

      // Actions
      setStep: (step) => set({ currentStep: step }),

      setCustomerInfo: (info) =>
        set((state) => ({ customerInfo: { ...state.customerInfo, ...info } })),

      addProduct: (product) =>
        set((state) => {
          const exists = state.selectedProducts.find((p) => p.productId === product.id)
          if (exists) return state
          return {
            selectedProducts: [
              ...state.selectedProducts,
              {
                productId: product.id,
                productName: product.name,
                brand: product.brand,
                quantity: 1,
                unit: 'units',
                notes: '',
                stockQuantity: product.stockQuantity ?? product.stock_quantity ?? 0,
              },
            ],
          }
        }),

      addService: (service) =>
        set((state) => {
          const serviceId = `svc-${service.title.replace(/\s+/g, '-').toLowerCase()}`
          const exists = state.selectedProducts.find((p) => p.productId === serviceId)
          if (exists) return state
          return {
            selectedProducts: [
              ...state.selectedProducts,
              {
                productId: serviceId,
                productName: service.title,
                brand: 'PharmaLink Service',
                quantity: 1,
                unit: 'service',
                notes: '',
                isService: true,
              },
            ],
          }
        }),

      updateProduct: (productId, updates) =>
        set((state) => ({
          selectedProducts: state.selectedProducts.map((p) =>
            p.productId === productId ? { ...p, ...updates } : p
          ),
        })),

      removeProduct: (productId) =>
        set((state) => ({
          selectedProducts: state.selectedProducts.filter((p) => p.productId !== productId),
        })),

      setAdditionalInfo: (info) =>
        set((state) => ({ additionalInfo: { ...state.additionalInfo, ...info } })),

      resetRFQ: () =>
        set({
          currentStep: 1,
          customerInfo: { fullName: '', companyName: '', businessType: '', email: '', phone: '', country: '', city: '' },
          selectedProducts: [],
          additionalInfo: { requestedDeliveryDate: '', shippingMethod: '', message: '', attachments: [] },
        }),

      // Derived
      itemCount: () => get().selectedProducts.length,
    }),
    {
      name: 'rfq-draft',
      partialize: (state) => ({
        currentStep: state.currentStep,
        customerInfo: state.customerInfo,
        selectedProducts: state.selectedProducts,
        additionalInfo: state.additionalInfo,
      }),
    }
  )
)

export default useRFQStore
