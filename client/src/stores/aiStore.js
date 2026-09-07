import { create } from 'zustand';
import api from '../services/api';

export const useAIStore = create((set, get) => ({
  messages: [],
  loading: false,
  conversationId: null,

  sendMessage: async (message, caseId) => {
    set(state => ({
      messages: [...state.messages, { role: 'user', content: message, timestamp: new Date() }],
      loading: true
    }));
    try {
      const res = await api.post('/ai-assistant/query', { message, caseId });
      set(state => ({
        messages: [...state.messages, {
          role: 'assistant',
          content: res.data.data.response,
          timestamp: new Date()
        }],
        loading: false,
        conversationId: res.data.data.conversationId
      }));
    } catch {
      set(state => ({
        messages: [...state.messages, {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please check that the server is running and try again.',
          timestamp: new Date()
        }],
        loading: false
      }));
    }
  },

  clearMessages: () => set({ messages: [], conversationId: null }),

  loadHistory: async (caseId) => {
    try {
      const res = await api.get('/ai-assistant/history', { params: { caseId } });
      set({ messages: res.data.data || [] });
    } catch {}
  }
}));
