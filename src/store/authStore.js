import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/client';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),

      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

      setUser: (user) => set({ user }),

      logout: () => set({ user: null, accessToken: null, refreshToken: null }),

      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        const { user, accessToken, refreshToken } = data.data;
        set({ user, accessToken, refreshToken });
        return data.data;
      },

      fetchMe: async () => {
        const { data } = await api.get('/auth/me');
        set({ user: data.data });
        return data.data;
      },

      hasPermission: (perm) => {
        const perms = get().user?.permissions || [];
        return perms.includes('*') || perms.includes(perm);
      },
    }),
    {
      name: 'inv_auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ accessToken: s.accessToken, refreshToken: s.refreshToken }),
    }
  )
);

export { useAuthStore };
