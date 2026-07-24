import { Link, useRouterState } from "@tanstack/react-router";
import { Waves, Home, ClipboardEdit, BarChart3, Lightbulb, UserCheck } from "lucide-react";

export function PublicNav({ siteName, logoText }: { siteName: string; logoText: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const desktopNavs = [
    { label: "Beranda", to: "/", exact: true, icon: Home },
    { label: "Assessment", to: "/assessment/level", icon: ClipboardEdit },
    { label: "Hasil", to: "/results", icon: BarChart3 },
    { label: "Tentang", to: "/about", icon: Lightbulb },
    { label: "Admin", to: "/admin", icon: UserCheck },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-hero text-primary-foreground shadow-soft">
            <Waves className="h-5 w-5" />
          </span>
          <span className="font-display text-base font-bold tracking-tight text-foreground">{siteName}</span>
          <span className="sr-only">{logoText}</span>
        </Link>

        {/* Top Desktop Navigation Bar */}
        <nav className="hidden items-center gap-1 md:flex">
          {desktopNavs.map((n) => {
            const active = n.exact ? pathname === "/" : pathname.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to as any}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {n.label}
              </Link>
            );
          })}
          <Link
            to="/assessment/level"
            className="ml-2 inline-flex items-center rounded-full bg-gradient-hero px-4 py-2 text-xs font-semibold text-primary-foreground shadow-soft transition hover:opacity-90"
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
    <footer className="mt-20 border-t border-border/60 bg-secondary/40 pb-24 md:pb-12">
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