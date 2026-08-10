import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getAssessmentLocksFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getLocksServer } = await import("./locks.server");
  return getLocksServer();
});

export const setAssessmentLockFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ level: z.string().min(1), is_locked: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { setLockServer } = await import("./locks.server");
    return setLockServer(data.level, data.is_locked);
  });
