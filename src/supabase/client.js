// supabase/client.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fmzfuykwismhtukvyuvd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtemZ1eWt3aXNtaHR1a3Z5dXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MzA1ODYsImV4cCI6MjA2NzEwNjU4Nn0.CUZm0el9dW3cH0iLeK_UIqX9YignxgFwECKJJU_pNIU'

export const supabase = createClient(supabaseUrl, supabaseKey)
