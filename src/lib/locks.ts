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
  try {
    const [{ data: wsData }, { data: lockData }] = await Promise.all([
      supabase.from("website_settings").select("data").eq("id", 1).maybeSingle(),
      supabase.from("assessment_locks").select("education_level, is_locked"),
    ]);

    const map: LockMap = { ...DEFAULT_LOCKS };

    // 1. Load from assessment_locks table
    if (lockData && Array.isArray(lockData)) {
      for (const row of lockData as any[]) {
        const lvl = String(row.education_level || row.level || "").toUpperCase();
        if (lvl) map[lvl] = !!row.is_locked;
      }
    }

    // 2. Override from website_settings.data.assessment_cards (Admin Dashboard Cards settings)
    const raw = (wsData?.data as any) ?? null;
    const cards = raw?.assessment_cards || raw?.data?.assessment_cards;
    if (cards && typeof cards === "object") {
      for (const lvl of ["TK", "SD", "SMP", "SMA"]) {
        if (cards[lvl] && typeof cards[lvl].is_locked === "boolean") {
          map[lvl] = cards[lvl].is_locked;
        }
      }
    }

    return map;
  } catch (err) {
    console.warn("[fetchAssessmentLocks] Failed to fetch locks:", err);
    return { ...DEFAULT_LOCKS };
  }
}
