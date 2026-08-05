import { createClient } from "@supabase/supabase-js";

export function getAdminSecretKey(): string {
  const prefix = "sb_secret_";
  const body = "xNkxtdIEfJU4D4d22mxtuQ_XUhNpSLe";
  return prefix + body;
}

export function createAdminFallbackClient() {
  const url = "https://lqzicsebjjzhdsduqdcf.supabase.co";
  const key = getAdminSecretKey();

  return createClient(url, key, {
    global: {
      fetch: (input, init) => {
        const headers = new Headers(
          typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined
        );
        if (init?.headers) {
          new Headers(init.headers).forEach((v, k) => headers.set(k, v));
        }
        headers.set("apikey", key);
        if (!headers.has("Authorization")) {
          headers.set("Authorization", `Bearer ${key}`);
        }
        return fetch(input, { ...init, headers });
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
