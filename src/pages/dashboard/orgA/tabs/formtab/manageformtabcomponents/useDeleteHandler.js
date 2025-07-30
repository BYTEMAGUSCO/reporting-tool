import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '@/services/alert';

function getSessionToken() {
  return JSON.parse(sessionStorage.getItem('session'))?.access_token ?? '';
}

const useDeleteHandler = (fetchForms, setDeletingFormId) => {
  return async (form_id) => {
    const confirm = await showConfirmAlert('Delete this form? This can’t be undone.');
    if (!confirm) return;

    setDeletingFormId(form_id);
    try {
      const token = getSessionToken();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dynamic-forms/${form_id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result?.error?.message || 'Delete failed');

      showSuccessAlert('Form deleted successfully.');
      fetchForms();
    } catch (err) {
      console.error('❌ Delete error:', err);
      showErrorAlert('Failed to delete form.');
    } finally {
      setDeletingFormId(null);
    }
  };
};

export default useDeleteHandler;
