import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const hasSupabase = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = hasSupabase ? createClient(supabaseUrl, supabaseAnonKey) : null;
export const isDemoMode = !hasSupabase;

export const createUserId = () => `USR-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;

export const demoUsers = [
  {
    id: '1',
    user_id: 'USR-100001-111',
    name: 'Demo Student',
    email: 'student@example.com',
    approved: false
  },
  {
    id: '2',
    user_id: 'USR-100002-222',
    name: 'Approved Student',
    email: 'approved@example.com',
    approved: true
  }
];
