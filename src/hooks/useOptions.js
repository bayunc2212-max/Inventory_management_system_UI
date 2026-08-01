import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

export function useOptions(endpoint, { key = endpoint, activeOnly = true, enabled = true } = {}) {
  const { data, isLoading, error } = useQuery({
    queryKey: [key, activeOnly],
    queryFn: async () => {
      const res = await api.get(endpoint, { params: activeOnly ? { is_active: 'true' } : {} });
      return res.data.data;
    },
    enabled,
    staleTime: 60_000,
  });
  return { options: data ?? [], isLoading, error };
}
