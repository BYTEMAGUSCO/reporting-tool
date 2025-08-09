export const getStoredToken = () => {
  try {
    const session = sessionStorage.getItem('session');
    return session ? JSON.parse(session).access_token : null;
  } catch {
    return null;
  }
};

export const signOutUser = async (navigate, redirectTo = '/') => {
  const token = getStoredToken();
  if (!token) return;

  try {
    await fetch('https://juagcyjdhvjonysqbgof.supabase.co/functions/v1/sign-out', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch {
    // no cap, just ignore errors here
  } finally {
    sessionStorage.clear();
    if (navigate) navigate(redirectTo);
  }
};

export const setupSessionPing = (navigate) => {
  return setInterval(async () => {
    const token = getStoredToken();
    if (!token) return;

    try {
      // This endpoint should just check token validity, NOT sign out
      const res = await fetch('https://juagcyjdhvjonysqbgof.supabase.co/functions/v1/validate-token', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.status === 401 || res.status === 403) {
        alert('Session expired. Please log in again');
        sessionStorage.clear();
        navigate('/');
      }
    } catch {
      // ignore ping errors
    }
  }, 5 * 60 * 1000);
};

export const setupTabCloseLogout = () => {
  const handler = () => {
    const token = getStoredToken();
    if (!token) return;

    fetch('https://juagcyjdhvjonysqbgof.supabase.co/functions/v1/sign-out', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
      keepalive: true,
    });

    // Optional: clear sessionStorage here if you want immediate cleanup
    sessionStorage.clear();
  };

  window.addEventListener('unload', handler);
  return () => window.removeEventListener('unload', handler);
};
