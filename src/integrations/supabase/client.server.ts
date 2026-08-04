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

const SERVICE_KEY_NAMES = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "VITE_SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SERVICE_KEY",
  "SUPABASE_SECRET_KEY",
  "SERVICE_ROLE_KEY",
  "VITE_SUPABASE_SERVICE_KEY",
  "VITE_SUPABASE_SECRET_KEY",
];

function getServiceRoleKey(): string | undefined {
  const g = globalThis as any;

  // 1. Check process.env and global objects
  for (const name of SERVICE_KEY_NAMES) {
    if (process.env[name]) return process.env[name];
    if (g[name]) return g[name];
    if (g.env?.[name]) return g.env[name];
    if (g.__env?.[name]) return g.__env[name];
  }

  // 2. Check Vinxi HTTP request event context
  try {
    const vinxi = require("vinxi/http");
    const event = vinxi?.getEvent?.();
    const cfEnv = event?.context?.cloudflare?.env || event?.context?.env;
    if (cfEnv) {
      for (const name of SERVICE_KEY_NAMES) {
        if (cfEnv[name]) return cfEnv[name];
      }
    }
  } catch {}

  // 3. Check H3 event context
  try {
    const h3 = require("h3");
    const event = h3?.useEvent?.();
    const cfEnv = event?.context?.cloudflare?.env || event?.context?.env;
    if (cfEnv) {
      for (const name of SERVICE_KEY_NAMES) {
        if (cfEnv[name]) return cfEnv[name];
      }
    }
  } catch {}

  // 4. Check import.meta.env
  if (typeof import.meta !== "undefined" && (import.meta as any).env) {
    const metaEnv = (import.meta as any).env;
    for (const name of SERVICE_KEY_NAMES) {
      if (metaEnv[name]) return metaEnv[name];
    }
  }

  return undefined;
}

function getSupabaseUrl(): string {
  const g = globalThis as any;
  return (
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    g.SUPABASE_URL ||
    g.env?.SUPABASE_URL ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) ||
    "https://lqzicsebjjzhdsduqdcf.supabase.co"
  );
}

function createSupabaseAdminClient() {
  const SUPABASE_URL = getSupabaseUrl();
  const serviceRoleKey = getServiceRoleKey();
  const publishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY) ||
    "sb_publishable_pu4E46tx3jk_u55S6-vFDg_Bggu_6fv";

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
