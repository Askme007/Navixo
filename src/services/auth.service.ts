/**
 * auth.service.ts
 *
 * Single boundary for all authentication operations.
 * When JWT migration to Express happens, ONLY this file changes.
 * All hooks and services call this — never supabase.auth directly.
 */

import { supabase } from "../supabaseClient";

export const authService = {
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session ?? null;
  },

  async getUser() {
    const { data } = await supabase.auth.getUser();
    return data.user ?? null;
  },

  /** Returns the bearer token for future Express API / Edge Function calls */
  async getToken(): Promise<string | null> {
    const session = await this.getSession();
    return session?.access_token ?? null;
  },
};
