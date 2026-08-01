import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/client';

const useSettingsStore = create(
  persist(
    (set, get) => ({
      settings: {},
      setSettings: (settings) => set({ settings }),
      load: async () => {
        const { data } = await api.get('/settings/public');
        set({ settings: data.data });
      },
      get: (key, fallback) => {
        const v = get().settings[key];
        return v === undefined || v === null || v === '' ? fallback : v;
      },
    }),
    { name: 'inv_settings' }
  )
);

export { useSettingsStore };
