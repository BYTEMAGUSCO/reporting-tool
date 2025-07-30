import { useState } from 'react';
import { showErrorAlert } from '@/services/alert';

function getSessionToken() {
  return JSON.parse(sessionStorage.getItem('session'))?.access_token ?? '';
}

const useFormsFetcher = (page) => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingFormId, setDeletingFormId] = useState(null);

  const fetchForms = async () => {
    setLoading(true);
    try {
      const token = getSessionToken();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dynamic-forms?page=${page}&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result?.error?.message || 'Failed to fetch forms');

      setForms(result.data || []);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      showErrorAlert('Failed to load forms.');
    } finally {
      setLoading(false);
    }
  };

  return {
    forms,
    loading,
    totalPages,
    fetchForms,
    deletingFormId,
    setDeletingFormId,
  };
};

export default useFormsFetcher;
