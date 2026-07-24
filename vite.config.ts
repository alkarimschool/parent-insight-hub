// @lovable.dev/vite-tanstack-config already includes TanStack devtools, tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare target).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  plugins: [],
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    server: { entry: "server" },
  },
});
