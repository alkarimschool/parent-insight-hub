import { createFileRoute, Outlet, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Users, ListChecks, MessageSquare, Settings, Globe, ScrollText, LogOut, Waves } from "lucide-react";

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
  { to: "/admin/logs", label: "Activity Logs", icon: ScrollText },
];

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const signOut = async () => {
    localStorage.removeItem("paa_admin_logged_in");
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  return (
    <div className="flex min-h-screen bg-gradient-soft">
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex md:flex-col">
        <div className="flex items-center gap-2 px-6 py-5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground"><Waves className="h-5 w-5" /></span>
          <div className="font-display text-sm font-bold">PAA Admin</div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((n) => {
            const active = n.exact ? pathname === "/admin" : pathname.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to as any}
                className={"flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition " + (active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground")}
              >
                <Icon className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <button onClick={signOut} className="m-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent/60">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </aside>
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}