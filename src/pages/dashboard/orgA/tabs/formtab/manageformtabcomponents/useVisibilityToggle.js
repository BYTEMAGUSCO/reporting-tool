import { showErrorAlert, showSuccessAlert } from '@/services/alert';

function getSessionToken() {
  return JSON.parse(sessionStorage.getItem('session'))?.access_token ?? '';
}

const useVisibilityToggle = (fetchForms) => {
  return async (formId, newVisibility) => {
    const token = getSessionToken();
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/dynamic_forms?form_id=eq.${formId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            apikey: anonKey, // ✅ This is the project-level key
            Authorization: `Bearer ${token}`, // ✅ This is the user token
            Prefer: 'return=representation',
          },
          body: JSON.stringify({ is_visible: newVisibility }),
        }
      );

      const body = await response.text();
      const bodyJSON = (() => {
        try {
          return JSON.parse(body);
        } catch {
          return body;
        }
      })();

      if (!response.ok) {
        /*
        console.error('PATCH failed:', {
          status: response.status,
          statusText: response.statusText,
          body: bodyJSON,
        });
        */
        throw new Error(
          `Failed to update visibility: ${response.status} ${response.statusText}\nDetails: ${
            typeof bodyJSON === 'object' ? JSON.stringify(bodyJSON) : bodyJSON
          }`
        );
      }

      showSuccessAlert(`Form is now ${newVisibility === 'Y' ? 'visible' : 'hidden'}`);
      fetchForms();
    } catch (err) {
      // console.error('[VisibilityToggle Error]', err);
      showErrorAlert(`Error toggling visibility:\n${err.message}`);
    }
  };
};

export default useVisibilityToggle;
