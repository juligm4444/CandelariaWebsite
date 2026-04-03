import { useCallback, useEffect, useState } from 'react';
import { hasSupabaseEnv, supabase } from '../lib/supabaseClient';

export const useUserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!hasSupabaseEnv || !supabase) {
        setProfile(null);
        return;
      }

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user) {
        setProfile(null);
        return;
      }

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, is_internal, internal_role')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      setProfile(data || null);
    } catch (err) {
      setError(err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasSupabaseEnv || !supabase) {
      setLoading(false);
      return undefined;
    }

    fetchProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  return {
    profile,
    is_internal: Boolean(profile?.is_internal),
    internal_role: profile?.internal_role ?? null,
    loading,
    error,
    refresh: fetchProfile,
  };
};
