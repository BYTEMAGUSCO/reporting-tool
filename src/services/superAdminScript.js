// superAdminScript.mjs or with type: "module" in package.json
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://fmzfuykwismhtukvyuvd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtemZ1eWt3aXNtaHR1a3Z5dXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MzA1ODYsImV4cCI6MjA2NzEwNjU4Nn0.CUZm0el9dW3cH0iLeK_UIqX9YignxgFwECKJJU_pNIU'

);

const createSuperAdmin = async () => {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'superadmin@dilg.com',
    password: 'Y7$g@R!w9zK#Lm3xTq2%',
    user_metadata: {
      role: 'S'
    },
    email_confirm: true
  });

  if (error) {
    // console.error('❌ Failed to create Super Admin:', error.message);
  } else {
    // console.log('✅ Super Admin created:', data.user.email);
  }
};

createSuperAdmin();
