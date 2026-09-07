import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,

      login: async (email, password) => {
        set({ loading: true });
        try {
          const res = await api.post('/auth/login', { email, password });
          localStorage.setItem('token', res.data.token);
          set({ user: res.data.user, token: res.data.token, isAuthenticated: true, loading: false });
          return res.data;
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },

      register: async (name, email, password) => {
        set({ loading: true });
        try {
          const res = await api.post('/auth/register', { name, email, password });
          localStorage.setItem('token', res.data.token);
          set({ user: res.data.user, token: res.data.token, isAuthenticated: true, loading: false });
          return res.data;
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        try {
          const res = await api.get('/auth/me');
          set({ user: res.data.user, isAuthenticated: true });
        } catch {
          set({ isAuthenticated: false });
        }
      },

      updateProfile: async (data) => {
        const res = await api.put('/auth/me', data);
        set({ user: res.data.user });
      }
    }),
    {
      name: 'auth-store',
      partialize: (s) => ({ token: s.token, user: s.user, isAuthenticated: s.isAuthenticated })
    }
  )
);
