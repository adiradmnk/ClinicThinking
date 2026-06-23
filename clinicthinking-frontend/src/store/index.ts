import { create } from 'zustand'

interface AppState {
  sidebarCollapsed: boolean
  setSidebarCollapsed: (v: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
}))
