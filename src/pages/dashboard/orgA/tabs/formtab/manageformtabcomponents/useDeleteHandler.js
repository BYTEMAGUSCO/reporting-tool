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
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dynamic-forms/${form_id}`;
      // console.log('🧨 Deleting form ID:', form_id);
      // console.log('📡 Calling DELETE at:', url);

      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = res.headers.get('content-type');
      let result = {};

      if (contentType?.includes('application/json')) {
        result = await res.json();
      } else {
        const text = await res.text();
        // console.error('🪦 Server returned non-JSON response:', text);
        throw new Error('Server returned an invalid response format.');
      }

      // console.log('💥 Full delete result:', result);

      if (!res.ok) throw new Error(result?.error?.message || 'Delete failed');

      showSuccessAlert('Form deleted successfully.');
      fetchForms();
    } catch (err) {
      // console.error('❌ Delete error:', err);
      showErrorAlert(err.message || 'Failed to delete form.');
    } finally {
      setDeletingFormId(null);
    }
  };
};


export default useDeleteHandler;
