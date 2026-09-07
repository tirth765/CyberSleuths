import { create } from 'zustand';
import api from '../services/api';

export const useCaseStore = create((set) => ({
  cases: [],
  currentCase: null,
  loading: false,
  total: 0,

  fetchCases: async (params) => {
    set({ loading: true });
    try {
      const res = await api.get('/cases', { params });
      set({ cases: res.data.data, total: res.data.total, loading: false });
    } catch { set({ loading: false }); }
  },

  fetchCase: async (id) => {
    set({ loading: true, currentCase: null });
    try {
      const res = await api.get(`/cases/${id}`);
      set({ currentCase: res.data.data, loading: false });
      return res.data.data;
    } catch { set({ loading: false }); }
  },

  createCase: async (data) => {
    const res = await api.post('/cases', data);
    set(state => ({ cases: [res.data.data, ...state.cases] }));
    return res.data.data;
  },

  updateCase: async (id, data) => {
    const res = await api.put(`/cases/${id}`, data);
    set(state => ({
      cases: state.cases.map(c => c._id === id ? res.data.data : c),
      currentCase: res.data.data
    }));
    return res.data.data;
  },

  deleteCase: async (id) => {
    await api.delete(`/cases/${id}`);
    set(state => ({ cases: state.cases.filter(c => c._id !== id) }));
  }
}));
