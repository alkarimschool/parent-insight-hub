import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { LockMap } from "./locks";
import { DEFAULT_LOCKS } from "./locks";

export async function getLocksServer(): Promise<LockMap> {
  try {
    const { data, error } = await supabaseAdmin
      .from("assessment_locks")
      .select("education_level, is_locked");
    if (error || !data) return { ...DEFAULT_LOCKS };
    const map: LockMap = { ...DEFAULT_LOCKS };
    for (const row of data as any[]) {
      if (row.education_level) {
        map[String(row.education_level)] = Boolean(row.is_locked);
      }
    }
    return map;
  } catch {
    return { ...DEFAULT_LOCKS };
  }
}

export async function isLevelLockedServer(level: string): Promise<boolean> {
  const locks = await getLocksServer();
  return !!locks[level];
}

export async function setLockServer(level: string, isLocked: boolean) {
  const { error } = await supabaseAdmin
    .from("assessment_locks")
    .upsert({ education_level: level, is_locked: isLocked }, { onConflict: "education_level" });
  if (error) throw new Error(error.message);
  return { ok: true, education_level: level, is_locked: isLocked };
}
