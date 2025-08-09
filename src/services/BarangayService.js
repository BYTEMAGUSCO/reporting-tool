export const getBarangays = async (token) => {
  const res = await fetch(
    'https://juagcyjdhvjonysqbgof.supabase.co/functions/v1/barangays',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch barangays');
  }

  return await res.json(); // should be an array of barangay objects
};
