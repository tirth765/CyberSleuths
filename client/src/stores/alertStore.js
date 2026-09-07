import { create } from 'zustand';
import api from '../services/api';

export const useAlertStore = create((set, get) => ({
  alerts: [],
  unacknowledged: 0,
  loading: false,

  fetchAlerts: async (params = {}) => {
    set({ loading: true });
    try {
      const res = await api.get('/alerts', { params });
      set({ alerts: res.data.data, unacknowledged: res.data.unacknowledged, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  acknowledge: async (id) => {
    try {
      await api.put(`/alerts/${id}/acknowledge`);
      set(state => ({
        alerts: state.alerts.map(a => a._id === id ? { ...a, acknowledged: true } : a),
        unacknowledged: Math.max(0, state.unacknowledged - 1)
      }));
    } catch {}
  },

  acknowledgeAll: async () => {
    try {
      await api.put('/alerts/acknowledge-all');
      set(state => ({
        alerts: state.alerts.map(a => ({ ...a, acknowledged: true })),
        unacknowledged: 0
      }));
    } catch {}
  },

  addAlert: (alert) => set(state => ({
    alerts: [alert, ...state.alerts],
    unacknowledged: state.unacknowledged + 1
  }))
}));
