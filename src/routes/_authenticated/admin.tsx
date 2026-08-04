import { createFileRoute, Outlet, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Users, ListChecks, MessageSquare, Settings, Globe, ScrollText, LogOut, Waves, Menu, X, Layers } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/parents", label: "Database Orang Tua", icon: Users },
  { to: "/admin/questions", label: "Kelola Pertanyaan", icon: ListChecks },
  { to: "/admin/prompt", label: "Prompt AI", icon: MessageSquare },
  { to: "/admin/settings", label: "Integrasi AI & WA", icon: Settings },
  { to: "/admin/website", label: "Pengaturan Website", icon: Globe },
  { to: "/admin/cards", label: "Card Assessment", icon: Layers },
  { to: "/admin/logs", label: "Activity Logs", icon: ScrollText },
];

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const signOut = async () => {
    localStorage.removeItem("paa_admin_logged_in");
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    // Return focus to hamburger button
    setTimeout(() => hamburgerRef.current?.focus(), 100);
  }, []);

  const openDrawer = () => {
    setDrawerOpen(true);
    // Move focus to close button inside drawer
    setTimeout(() => closeButtonRef.current?.focus(), 50);
  };

  // Close on ESC key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && drawerOpen) closeDrawer();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeDrawer]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  // Close drawer on route change (mobile navigation)
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Current page label for mobile navbar
  const currentNav = NAV.find((n) => n.exact ? pathname === "/admin" : pathname.startsWith(n.to));
  const pageLabel = currentNav?.label ?? "Dashboard";

  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between gap-2 px-6 py-5 border-b border-sidebar-border/60">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-soft">
            <Waves className="h-5 w-5" />
          </span>
          <div className="font-display text-sm font-bold">PAA Admin</div>
        </div>
        {/* Close button only in mobile drawer */}
        {onClose && (
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Tutup menu"
            className="grid h-10 w-10 place-items-center rounded-xl text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground transition md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Admin navigation">
        {NAV.map((n) => {
          const active = n.exact ? pathname === "/admin" : pathname.startsWith(n.to);
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to as any}
              className={
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition " +
                (active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground")
              }
            >
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${active ? "bg-white/10" : ""}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="truncate">{n.label}</span>
              {active && (
                <span className="ml-auto h-2 w-2 rounded-full bg-sidebar-primary-foreground/80" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-sidebar-border/60">
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground transition"
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg">
            <LogOut className="h-4 w-4" />
          </span>
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-gradient-soft">

      {/* ===== DESKTOP PERMANENT SIDEBAR ===== */}
      <aside className="hidden md:flex md:w-64 md:shrink-0 md:flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <SidebarContent />
      </aside>

      {/* ===== MOBILE DRAWER + OVERLAY ===== */}
      {/* Overlay */}
      <div
        aria-hidden="true"
        onClick={closeDrawer}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu navigasi admin"
        className={`fixed inset-y-0 left-0 z-50 flex w-[300px] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-elevated transition-transform duration-300 ease-in-out md:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent onClose={closeDrawer} />
      </aside>

      {/* ===== MAIN CONTENT AREA ===== */}
      <main className="flex flex-1 flex-col overflow-x-hidden">

        {/* MOBILE TOP NAVBAR */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-card/90 px-4 backdrop-blur-md md:hidden">
          {/* Hamburger button */}
          <button
            ref={hamburgerRef}
            id="hamburger-btn"
            aria-label="Buka menu navigasi"
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
            onClick={openDrawer}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-foreground hover:bg-accent transition active:scale-95"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo + Page Title */}
          <div className="flex flex-1 items-center gap-2 min-w-0">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Waves className="h-4 w-4" />
            </span>
            <span className="text-sm font-bold text-foreground truncate">{pageLabel}</span>
          </div>

          {/* Admin avatar */}
          <div
            aria-label="Admin"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-hero text-xs font-bold text-white shadow-soft"
          >
            A
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}