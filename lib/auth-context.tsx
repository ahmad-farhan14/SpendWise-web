'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import { ensureDefaultCategories } from '@/lib/utils/default-categories';

interface AuthState {
  profile: Profile | null;
  loading: boolean;
  setProfile: (p: Profile | null) => void;
}

import { createContext, useContext } from 'react';

const AuthContext = createContext<AuthState>({
  profile: null,
  loading: true,
  setProfile: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export { AuthContext };

export function useAuthProvider(): AuthState {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const loadProfile = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !data) {
      // Profile might not exist yet — try to create it
      if (!data) {
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({ id: user.id, email: user.email ?? '', full_name: (user.user_metadata as Record<string, string>)?.full_name ?? null })
          .select()
          .maybeSingle();
        if (newProfile) {
          setProfile(newProfile as Profile);
        }
      }
    } else {
      setProfile(data as Profile);
    }

    // Ensure default categories exist
    try {
      await ensureDefaultCategories(user.id);
    } catch {
      // ignore
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    const supabase = createClient();
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (event === 'SIGNED_OUT' || !session) {
          setProfile(null);
          setLoading(true);
          router.push('/login');
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await loadProfile();
          router.refresh();
        }
      })();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, loadProfile]);

  useEffect(() => {
    if (!loading && !profile) {
      const protectedPrefixes = ['/dashboard', '/transactions', '/settings'];
      if (protectedPrefixes.some((p) => pathname === p || pathname?.startsWith(p + '/'))) {
        router.replace('/login');
      }
    }
  }, [loading, profile, pathname, router]);

  return { profile, loading, setProfile };
}
