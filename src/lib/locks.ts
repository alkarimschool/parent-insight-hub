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
    const { data, error } = await supabase
      .from("assessment_locks")
      .select("education_level, is_locked");
    if (error || !data) return { ...DEFAULT_LOCKS };
    const map: LockMap = { ...DEFAULT_LOCKS };
    for (const row of data as any[]) {
      map[String(row.education_level)] = !!row.is_locked;
    }
    return map;
  } catch {
    return { ...DEFAULT_LOCKS };
  }
}
