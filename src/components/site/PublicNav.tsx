import { Link } from "@tanstack/react-router";
import { Waves } from "lucide-react";

export function PublicNav({ siteName, logoText }: { siteName: string; logoText: string }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-hero text-primary-foreground shadow-soft">
            <Waves className="h-5 w-5" />
          </span>
          <span className="font-display text-base font-bold tracking-tight text-foreground">{siteName}</span>
          <span className="sr-only">{logoText}</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/assessment"
            className="inline-flex items-center rounded-full bg-gradient-hero px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90"
          >
            Mulai Assessment
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function PublicFooter({
  siteName,
  copyright,
  tagline,
  contactEmail,
  contactWhatsapp,
}: {
  siteName: string;
  copyright?: string;
  tagline?: string;
  contactEmail?: string;
  contactWhatsapp?: string;
}) {
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="font-display text-lg font-bold text-foreground">{siteName}</div>
            <p className="mt-2 text-sm text-muted-foreground">{tagline}</p>
          </div>
          <div className="text-sm text-muted-foreground">
            <div className="font-medium text-foreground">Kontak</div>
            {contactEmail && <div className="mt-1">Email: {contactEmail}</div>}
            {contactWhatsapp && <div className="mt-1">WhatsApp: {contactWhatsapp}</div>}
          </div>
          <div className="text-sm text-muted-foreground">
            <div className="font-medium text-foreground">Legal</div>
            <div className="mt-1">Hasil AI bukan diagnosis medis, melainkan rekomendasi awal.</div>
          </div>
        </div>
        <div className="mt-10 border-t border-border/60 pt-6 text-xs text-muted-foreground">
          {copyright ?? `© ${new Date().getFullYear()} ${siteName}`}
        </div>
      </div>
    </footer>
  );
}