import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isDemoMode: boolean;
}

const DEMO_USER: User = {
  id: '00000000-0000-0000-0000-000000000001',
  app_metadata: {},
  user_metadata: { full_name: 'ReelVault User' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'user@reelvault.local'
};

export const authService = {
  isConfigured(): boolean {
    return isSupabaseConfigured;
  },

  async getSession(): Promise<{ session: Session | null; user: User | null }> {
    if (!isSupabaseConfigured) {
      return { session: null, user: DEMO_USER };
    }
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { session: data.session, user: data.session?.user ?? null };
  },

  async signUp(email: string, password: string) {
    if (!isSupabaseConfigured) {
      return { user: DEMO_USER, session: null };
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured) {
      return { user: DEMO_USER, session: null };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    if (!isSupabaseConfigured) {
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    if (!isSupabaseConfigured) {
      callback(DEMO_USER);
      return { unsubscribe: () => {} };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });

    return { unsubscribe: () => subscription.unsubscribe() };
  }
};
