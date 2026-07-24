import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/_authenticated/admin/website")({ component: () => (
  <div><h1 className="text-2xl font-bold">Pengaturan Website</h1><p className="mt-2 text-sm text-muted-foreground">Editor konten homepage & website akan datang di iterasi berikutnya. Data tersimpan di homepage_settings dan website_settings.</p></div>
) });