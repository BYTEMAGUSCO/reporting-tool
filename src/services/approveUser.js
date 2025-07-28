const approveUser = async (requesterEmail, requesterPassword, requesterPhone, requesterName, requesterRole, token) => {
  try {
    const res = await fetch(
      'https://juagcyjdhvjonysqbgof.supabase.co/functions/v1/add-user',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requester_email: requesterEmail,
          requester_password: requesterPassword,
          requester_phone: requesterPhone,
          requester_name: requesterName,
          requester_role: requesterRole,
        }),
      }
    );

    if (!res.ok) throw new Error('❌ Approval failed');

    return { success: true };
  } catch (err) {
    console.error(`❌ Error approving ${requesterEmail}:`, err.message);
    return { success: false, error: err.message };
  }
};

export default approveUser;
