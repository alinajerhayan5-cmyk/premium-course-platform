import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const createUserId = () => `USR-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;

export async function getCurrentUserProfile() {
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return profile ? { ...profile, name: profile.full_name ?? profile.name } : null;
}
