import { supabase } from "@/integrations/supabase/client";

export const LOCK_LEVELS = ["TK", "SD", "SMP", "SMA", "SMK"] as const;
export type LockLevel = (typeof LOCK_LEVELS)[number];
export type LockMap = Record<string, boolean>;

export const LOCK_MESSAGE =
  "Asesmen ini sedang dalam proses pengembangan dan untuk sementara belum dapat diakses.";

export const DEFAULT_LOCKS: LockMap = {
  TK: false,
  SD: false,
  SMP: false,
  SMA: false,
  SMK: false,
};

export async function fetchAssessmentLocks(): Promise<LockMap> {
  console.info("[LOCKS_HOMEPAGE] Fetching assessment configuration...");
  try {
    const { data, error } = await supabase
      .from("assessment_locks")
      .select("education_level, is_locked");

    if (error) {
      console.warn("[LOCKS_HOMEPAGE] Error querying assessment_locks:", error.message);
    }

    const map: LockMap = { ...DEFAULT_LOCKS };
    if (data && Array.isArray(data)) {
      for (const row of data as any[]) {
        const lvl = String(row.education_level || row.level || "").toUpperCase();
        if (lvl) {
          map[lvl] = Boolean(row.is_locked);
        }
      }
    }

    console.info("[LOCKS_HOMEPAGE] Configuration Loaded:", {
      TK: map.TK,
      SD: map.SD,
      SMP: map.SMP,
      SMA: map.SMA,
    });

    return map;
  } catch (err) {
    console.error("[LOCKS_HOMEPAGE] Failed to fetch assessment_locks:", err);
    return { ...DEFAULT_LOCKS };
  }
}
