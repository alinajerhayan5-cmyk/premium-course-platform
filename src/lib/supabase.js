import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const createUserId = () => `USR-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;

function mapProfile(profile) {
  return profile ? { ...profile, name: profile.full_name ?? profile.name } : null;
}

export async function ensureProfileForUser(user, fallbackName = null) {
  let { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) throw error;

  if (!profile && user.email) {
    const byEmail = await supabase.from('profiles').select('*').eq('email', user.email).maybeSingle();
    if (byEmail.error) throw byEmail.error;
    profile = byEmail.data;
  }

  if (!profile) {
    const insertPayload = {
      id: user.id,
      full_name: fallbackName || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student',
      email: user.email,
      role: 'student',
      approved: false,
      user_id: createUserId()
    };
    const inserted = await supabase.from('profiles').upsert(insertPayload).select('*').single();
    if (inserted.error) throw inserted.error;
    profile = inserted.data;
  }

  return mapProfile(profile);
}

export async function getCurrentUserProfile() {
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) return null;

  return ensureProfileForUser(user);
}
