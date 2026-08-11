<!-- AUTOMATIC SYNC RULE -->
> [!IMPORTANT]
> **AUTOMATIC COMMIT & PUSH TO GITHUB, LOVABLE & CLOUDFLARE**:
> After completing any user request or code changes in this workspace, ALWAYS run `npm run sync` (or `git add .`, `git commit`, and `git push origin main`).
> 
> Pushing to `origin main` automatically:
> 1. Syncs code with the **Lovable** editor.
> 2. Triggers GitHub Actions workflow (`deploy-cloudflare.yml`) to deploy the updated build to **Cloudflare**.
