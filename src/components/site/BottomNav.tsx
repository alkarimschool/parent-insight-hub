import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ClipboardEdit, BarChart3, Lightbulb, UserCheck } from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Beranda",
    to: "/",
    exact: true,
    icon: Home,
  },
  {
    label: "Assessment",
    to: "/assessment/level",
    icon: ClipboardEdit,
  },
  {
    label: "Hasil",
    to: "/results",
    icon: BarChart3,
  },
  {
    label: "Tentang",
    to: "/about",
    icon: Lightbulb,
  },
  {
    label: "Admin",
    to: "/admin",
    icon: UserCheck,
  },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <nav className="mx-auto flex h-[72px] max-w-lg items-center justify-around rounded-t-[20px] border-t border-border/50 bg-white/90 dark:bg-slate-900/90 px-2 shadow-elevated backdrop-blur-xl transition-all duration-300">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === "/"
            : pathname.startsWith(item.to);

          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to as any}
              className="relative flex flex-1 flex-col items-center justify-center py-2 px-1 text-center transition-all duration-300 min-h-[48px] min-w-[48px] group"
            >
              {/* Active indicator top bar */}
              {isActive && (
                <span className="absolute top-0 h-1 w-8 rounded-full bg-primary shadow-sm transition-all duration-300" />
              )}

              {/* Icon */}
              <Icon
                className={`h-5 w-5 transition-all duration-200 ${
                  isActive
                    ? "scale-110 text-primary font-bold"
                    : "text-muted-foreground group-hover:text-foreground"
                }`}
              />

              {/* Label */}
              <span
                className={`mt-1 text-[11px] leading-tight transition-colors duration-200 ${
                  isActive ? "font-bold text-primary" : "text-muted-foreground group-hover:text-foreground"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
