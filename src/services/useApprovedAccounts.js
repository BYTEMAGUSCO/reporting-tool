import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function useApprovedAccounts(token, page, limit) {
  const [data, setData] = useState({ data: [], page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://juagcyjdhvjonysqbgof.supabase.co/functions/v1/registration-requests/approved?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError('Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit]);

  useEffect(() => {
    if (!token) return;

    const channel = supabase
      .channel('realtime:registration_requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registration_requests',
        },
        (payload) => {
          console.log('Realtime change (approved):', payload);

          setData((prev) => {
            let updated = [...prev.data];

            if (payload.eventType === 'INSERT') {
              if (payload.new.request_status === 'A') {
                updated = [payload.new, ...updated];
              }
            } else if (payload.eventType === 'UPDATE') {
              if (payload.new.request_status === 'A') {
                updated = updated.map((acc) =>
                  acc.id === payload.new.id ? payload.new : acc
                );
              } else {
                // status changed from approved to something else
                updated = updated.filter((acc) => acc.id !== payload.new.id);
              }
            } else if (payload.eventType === 'DELETE') {
              updated = updated.filter((acc) => acc.id !== payload.old.id);
            }

            return {
              ...prev,
              data: updated,
            };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [token]);

  return { data, loading, error, refetch: fetchData };
}
