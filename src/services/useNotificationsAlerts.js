import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function useNotificationAlerts() {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
  const storedSession = sessionStorage.getItem('session');
  if (!storedSession) return;

  const parsed = JSON.parse(storedSession);
  const userRole =
    parsed?.user?.user_metadata?.role || parsed?.[0]?.identity_data?.role;
  const userId = parsed?.user?.id || parsed?.[0]?.user_id;

  if (!userId || !userRole) return;

  const channel = supabase.channel('realtime:notifications');

  const subscribe = async () => {
    const { error, status } = await channel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          console.log('Realtime notification:', payload);

          if (
            payload.eventType === 'INSERT' &&
            ((userRole === 'B' && payload.new.specified_to === userId) ||
              (userRole !== 'B' && payload.new.specified_to === null))
          ) {
            setSnackbarMessage(payload.new.title || 'New Notification');
            setSnackbarOpen(true);
          }
        }
      )
      .subscribe();

    if (error) console.error('Subscription error:', error);
    else if (status === 'SUBSCRIBED') console.log('Subscribed to notifications');
  };

  subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []); // Or add [userRole, userId] if you want dynamic resubscribe


  return {
    snackbarOpen,
    snackbarMessage,
    closeSnackbar: () => setSnackbarOpen(false),
  };
}
