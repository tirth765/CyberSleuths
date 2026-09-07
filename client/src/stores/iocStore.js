import { create } from 'zustand';
import api from '../services/api';

export const useIOCStore = create((set) => ({
  iocs: [],
  stats: null,
  loading: false,

  fetchIOCs: async (params = {}) => {
    set({ loading: true });
    try {
      const res = await api.get('/iocs', { params });
      set({ iocs: res.data.data, stats: res.data.stats, loading: false });
    } catch { set({ loading: false }); }
  }
}));
