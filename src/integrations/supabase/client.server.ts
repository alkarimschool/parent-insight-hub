// Server-side Supabase client with service role key - bypasses RLS.
// Use this for admin operations in server functions and server routes only.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith('sb_publishable_') || value.startsWith('sb_secret_');
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    if (isNewSupabaseApiKey(supabaseKey) && headers.get('Authorization') === `Bearer ${supabaseKey}`) {
      headers.delete('Authorization');
    }

    headers.set('apikey', supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

function getServiceRoleKey(): string | undefined {
  const g = globalThis as any;
  let key: string | undefined =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
    g.SUPABASE_SERVICE_ROLE_KEY ||
    g.env?.SUPABASE_SERVICE_ROLE_KEY ||
    g.__env?.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    try {
      const vinxi = require("vinxi/http");
      const event = vinxi?.getEvent?.();
      key =
        event?.context?.cloudflare?.env?.SUPABASE_SERVICE_ROLE_KEY ||
        event?.context?.env?.SUPABASE_SERVICE_ROLE_KEY ||
        event?.context?.cloudflare?.env?.VITE_SUPABASE_SERVICE_ROLE_KEY;
    } catch {}
  }

  if (!key) {
    try {
      const h3 = require("h3");
      const event = h3?.useEvent?.();
      key =
        event?.context?.cloudflare?.env?.SUPABASE_SERVICE_ROLE_KEY ||
        event?.context?.env?.SUPABASE_SERVICE_ROLE_KEY;
    } catch {}
  }

  if (!key && typeof import.meta !== "undefined") {
    key = (import.meta as any).env?.SUPABASE_SERVICE_ROLE_KEY || (import.meta as any).env?.VITE_SUPABASE_SERVICE_ROLE_KEY;
  }

  return key;
}

function getSupabaseUrl(): string {
  const g = globalThis as any;
  return (
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    g.SUPABASE_URL ||
    g.env?.SUPABASE_URL ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) ||
    "https://pmdhjmjcalmgixvhcrwk.supabase.co"
  );
}

function createSupabaseAdminClient() {
  const SUPABASE_URL = getSupabaseUrl();
  const serviceRoleKey = getServiceRoleKey();
  const publishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY) ||
    "sb_publishable_qtEDnfJ2uApK1ILNzAXkxw_F0UJAqua";

  const keyToUse = serviceRoleKey || publishableKey;
  const hasServiceKey = Boolean(serviceRoleKey);
  const isCloudflare = typeof (globalThis as any).WebSocketPair !== 'undefined' || typeof (globalThis as any).navigator?.userAgent === 'string';

  console.log("[SUPABASE_SERVER_RUNTIME_AUDIT]", {
    platform: isCloudflare ? "Cloudflare Worker / Pages" : "Node.js Server",
    supabaseUrl: SUPABASE_URL,
    hasServiceRoleKey: hasServiceKey,
    keyType: hasServiceKey ? "SERVICE_ROLE (Admin - Bypasses RLS)" : "PUBLISHABLE_KEY (Anon - Subject to RLS)",
  });

  if (!hasServiceKey) {
    console.warn("[SUPABASE_SECURITY_WARNING] SUPABASE_SERVICE_ROLE_KEY missing in runtime environment! Admin queries fallback to ANON publishable key.");
  }

  return createClient<Database>(SUPABASE_URL, keyToUse, {
    global: {
      fetch: createSupabaseFetch(keyToUse),
    },
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    }
  });
}

let _cachedAdminClient: ReturnType<typeof createSupabaseAdminClient> | undefined;
let _cachedWithServiceKey = false;

export const supabaseAdmin = new Proxy({} as ReturnType<typeof createSupabaseAdminClient>, {
  get(_, prop, receiver) {
    const currentHasServiceKey = Boolean(getServiceRoleKey());
    // Re-create client if we previously cached a client without service role key, but now service role key is available
    if (!_cachedAdminClient || (!_cachedWithServiceKey && currentHasServiceKey)) {
      _cachedAdminClient = createSupabaseAdminClient();
      _cachedWithServiceKey = currentHasServiceKey;
    }
    return Reflect.get(_cachedAdminClient, prop, receiver);
  },
});
