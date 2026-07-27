// @lovable.dev/vite-tanstack-config already includes TanStack devtools, tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare target).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  plugins: [],
  define: {
    'process.env.SUPABASE_SERVICE_ROLE_KEY': JSON.stringify(
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || ""
    ),
    'process.env.SUPABASE_URL': JSON.stringify(
      process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://pmdhjmjcalmgixvhcrwk.supabase.co"
    ),
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    server: { entry: "server" },
  },
});
