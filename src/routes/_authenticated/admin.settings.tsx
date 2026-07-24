import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/_authenticated/admin/settings")({ component: () => (
  <div><h1 className="text-2xl font-bold">Integrasi AI & WhatsApp</h1><p className="mt-2 text-sm text-muted-foreground">Konfigurasi tersimpan di tabel ai_settings dan whatsapp_settings. UI editor akan datang di iterasi berikutnya.</p></div>
) });