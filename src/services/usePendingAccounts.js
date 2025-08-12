import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function usePendingAccounts(token, page, limit) {
  const [data, setData] = useState({ data: [], page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://juagcyjdhvjonysqbgof.supabase.co/functions/v1/registration-requests/pending?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError('Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, [token, page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!token) return;

    const channel = supabase
      .channel('realtime:registration_requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pending_registration_requests',
        },
        (payload) => {
          console.log('Realtime change:', payload);
          // On any insert/update/delete event, refetch fresh data:
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [token, fetchData]);

  return { data, loading, error, refetch: fetchData };
}
