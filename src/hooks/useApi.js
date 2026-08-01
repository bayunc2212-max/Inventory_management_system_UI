import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';

export function useApiQuery(key, url, options = {}) {
  return useQuery({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: async ({ queryKey }) => {
      const [base, params] = queryKey;
      const res = await apiClient.get(url ?? base, { params });
      return res.data.data;
    },
    ...options,
  });
}

export function useApiMutation(method, url, options = {}) {
  const queryClient = useQueryClient();
  return {
    mutate: async (data, cfg = {}) => {
      const res =
        method === 'delete'
          ? await apiClient.delete(url, { data: cfg.body, params: cfg.params })
          : await apiClient[method](url, cfg.body ?? data, { params: cfg.params });
      return res.data.data;
    },
    invalidate: (keys) => queryClient.invalidateQueries({ queryKey: Array.isArray(keys) ? keys : [keys] }),
    ...options,
  };
}
