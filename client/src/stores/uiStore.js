import { create } from 'zustand';

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  globalSearch: '',
  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  setGlobalSearch: (v) => set({ globalSearch: v }),
}));
