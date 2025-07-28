const denyRequest = async (requesterEmail, requesterRole, token) => {
  try {
    const res = await fetch(
      'https://juagcyjdhvjonysqbgof.supabase.co/functions/v1/deny-registration-request',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requester_email: requesterEmail,
          requester_role: requesterRole,
        }),
      }
    );

    if (!res.ok) throw new Error('❌ Rejection failed');

    return { success: true };
  } catch (err) {
    console.error(`❌ Error rejecting ${requesterEmail}:`, err.message);
    return { success: false, error: err.message };
  }
};

export default denyRequest;
