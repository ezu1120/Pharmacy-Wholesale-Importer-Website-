import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCompareStore = create(
  persist(
    (set, get) => ({
      selectedIds: [],
      
      addToCompare: (id) => set((state) => {
        if (state.selectedIds.length >= 4 || state.selectedIds.includes(id)) return state
        return { selectedIds: [...state.selectedIds, id] }
      }),
      
      removeFromCompare: (id) => set((state) => ({
        selectedIds: state.selectedIds.filter(i => i !== id)
      })),
      
      clearCompare: () => set({ selectedIds: [] }),
      
      isInCompare: (id) => get().selectedIds.includes(id)
    }),
    {
      name: 'compare-list'
    }
  )
)

export default useCompareStore
