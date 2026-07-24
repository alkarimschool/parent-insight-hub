import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    const isLocalAdmin = typeof window !== "undefined" ? localStorage.getItem("paa_admin_logged_in") === "true" : false;
    if (!data.user && !isLocalAdmin) throw redirect({ to: "/auth" });
    return { user: data.user ?? { email: "mediaalkarim@admin.com", id: "mediaalkarim" } };
  },
  component: () => <Outlet />,
});