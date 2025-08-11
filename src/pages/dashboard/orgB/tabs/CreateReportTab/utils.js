export const getSessionToken = () =>
  JSON.parse(sessionStorage.getItem('session'))?.access_token ?? '';

export const stripUnsupportedChars = (text) =>
  text?.toString().replace(/[^\x00-\x7F]/g, '') || '';

export async function getBarangayNameFromSession() {
  try {
    const session = JSON.parse(sessionStorage.getItem('session'));
    const barangayId = session?.user?.user_metadata?.barangay;
    if (!barangayId) return '';

    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/barangays`);
    const barangayList = await res.json();

    const match = barangayList.find((b) => b.id === barangayId);
    return match ? `${match.name} (District ${match.district_number})` : '';
  } catch (err) {
    console.error('Failed to get barangay name:', err);
    return '';
  }
}
