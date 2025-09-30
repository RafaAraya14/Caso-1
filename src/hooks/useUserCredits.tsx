import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

/**
 * Trae los créditos del último paquete comprado por el usuario.
 * Cache key: ['credits', userId]
 */
export function useUserCredits(userId?: string | null) {
  const q = useQuery({
    queryKey: ['credits', userId],
    enabled: !!userId,          // solo corre si hay userId
    staleTime: 60_000,          // 1 min "fresco" en cache
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('userpackages')
        .select('creditsremaining')
        .eq('useridfk', userId)
        .order('purchasedat', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data?.creditsremaining ?? null) as number | null;
    },
  });

  return {
    credits: q.data ?? null,
    loading: q.isLoading,
    error: q.error ? (q.error as Error).message : null,
    query: q,
  };
}

export default useUserCredits;
