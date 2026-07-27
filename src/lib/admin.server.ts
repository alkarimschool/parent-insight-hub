import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function updateAiSettingsServer(inputData: any) {
  const data = inputData?.data ?? inputData;
  const { data: existing } = await supabaseAdmin
    .from("ai_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (existing) {
    const { error } = await supabaseAdmin
      .from("ai_settings")
      .update({
        model: data.model,
        temperature: Number(data.temperature ?? 0.7),
        max_tokens: Number(data.max_tokens ?? 4096),
        is_active: Boolean(data.is_active),
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabaseAdmin.from("ai_settings").insert({
      model: data.model,
      temperature: Number(data.temperature ?? 0.7),
      max_tokens: Number(data.max_tokens ?? 4096),
      is_active: Boolean(data.is_active),
    });
    if (error) throw new Error(error.message);
  }
  return { ok: true };
}

export async function updateWaSettingsServer(inputData: any) {
  const data = inputData?.data ?? inputData;
  const { data: existing } = await supabaseAdmin
    .from("whatsapp_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (existing) {
    const { error } = await supabaseAdmin
      .from("whatsapp_settings")
      .update({
        api_url: data.api_url,
        api_token: data.api_token,
        sender: data.sender,
        template: data.template,
        is_active: Boolean(data.is_active),
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabaseAdmin.from("whatsapp_settings").insert({
      api_url: data.api_url,
      api_token: data.api_token,
      sender: data.sender,
      template: data.template,
      is_active: Boolean(data.is_active),
    });
    if (error) throw new Error(error.message);
  }
  return { ok: true };
}

export async function updateWebsiteSettingsServer(inputData: any) {
  const payload = inputData?.data ?? inputData;
  const { data: existing } = await supabaseAdmin
    .from("website_settings")
    .select("id, data")
    .limit(1)
    .maybeSingle();

  const currentObj = (existing?.data as any) || {};
  const cleanCurrent = currentObj?.data ?? currentObj;
  const mergedData = {
    ...cleanCurrent,
    ...(typeof payload === "object" ? payload : {}),
  };
  delete (mergedData as any).data;

  if (existing) {
    const { error } = await supabaseAdmin
      .from("website_settings")
      .update({
        data: mergedData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabaseAdmin.from("website_settings").insert({
      id: 1,
      data: mergedData,
    });
    if (error) throw new Error(error.message);
  }
  return { ok: true };
}

export async function updateHomepageSettingsServer(inputData: any) {
  try {
    const payload = inputData?.data ?? inputData;
    if (!payload || typeof payload !== "object") {
      throw new Error("Payload data homepage tidak valid.");
    }

    console.info("[updateHomepageSettingsServer] Saving payload keys:", Object.keys(payload));

    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from("homepage_settings")
      .select("id, data")
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (fetchErr) {
      console.error("[updateHomepageSettingsServer] Fetch existing error:", fetchErr.message);
    }

    const currentObj = (existing?.data as any) || {};
    const cleanCurrent = currentObj?.data ?? currentObj;
    const mergedData = {
      ...cleanCurrent,
      ...payload,
    };
    delete (mergedData as any).data;

    if (existing?.id) {
      const { error: updateErr } = await supabaseAdmin
        .from("homepage_settings")
        .update({
          data: mergedData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateErr) {
        console.error("[updateHomepageSettingsServer] Update DB error:", updateErr.message);
        throw new Error(updateErr.message);
      }
    } else {
      const { error: insertErr } = await supabaseAdmin.from("homepage_settings").insert({
        id: 1,
        data: mergedData,
      });
      if (insertErr) {
        console.error("[updateHomepageSettingsServer] Insert DB error:", insertErr.message);
        throw new Error(insertErr.message);
      }
    }

    console.info("[updateHomepageSettingsServer] Homepage settings saved successfully.");
    return { ok: true };
  } catch (err: any) {
    console.error("[updateHomepageSettingsServer] Exception:", err?.message || err);
    return { ok: false, error: err?.message || "Gagal menyimpan data ke database" };
  }
}

export async function updatePromptServer(data: {
  id?: string;
  name: string;
  education_level?: string;
  system_prompt: string;
  user_template: string;
  is_active: boolean;
}) {
  const level = data.education_level || "TK";
  if (data.id && data.id !== "default") {
    const { error } = await supabaseAdmin
      .from("ai_prompts")
      .update({
        name: data.name,
        education_level: level,
        system_prompt: data.system_prompt,
        user_template: data.user_template,
        is_active: data.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabaseAdmin.from("ai_prompts").insert({
      name: data.name,
      education_level: level,
      system_prompt: data.system_prompt,
      user_template: data.user_template,
      is_active: data.is_active,
    });
    if (error) throw new Error(error.message);
  }
  return { ok: true };
}

export async function saveQuestionServer(data: {
  id?: string;
  text: string;
  category_id?: string | null;
  order_index?: number;
  education_level: string;
  is_active?: boolean;
}) {
  if (data.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.id)) {
    const { error } = await supabaseAdmin
      .from("questions")
      .update({
        text: data.text,
        category_id: data.category_id || null,
        order_index: data.order_index ?? 1,
        education_level: data.education_level || "TK",
        is_active: data.is_active ?? true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabaseAdmin.from("questions").insert({
      text: data.text,
      category_id: data.category_id || null,
      order_index: data.order_index ?? 1,
      education_level: data.education_level || "TK",
      is_active: data.is_active ?? true,
    });
    if (error) throw new Error(error.message);
  }
  return { ok: true };
}

export async function deleteQuestionServer(id: string) {
  if (!id) throw new Error("ID pertanyaan tidak valid.");
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    const { error } = await supabaseAdmin.from("questions").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
  return { ok: true };
}

export async function updateParentChildAssessmentServer(data: {
  assessment_id: string;
  parent_id?: string;
  child_id?: string;
  child_name: string;
  whatsapp: string;
  school?: string;
  education_level?: string;
}) {
  let parentId = data.parent_id;
  let childId = data.child_id;

  if (!parentId || !childId) {
    const { data: a } = await supabaseAdmin
      .from("assessments")
      .select("parent_id, child_id")
      .eq("id", data.assessment_id)
      .maybeSingle();

    if (a) {
      if (!parentId) parentId = a.parent_id;
      if (!childId) childId = a.child_id;
    }
  }

  if (parentId) {
    await supabaseAdmin
      .from("parents")
      .update({ whatsapp: data.whatsapp })
      .eq("id", parentId);
  }

  if (childId) {
    await supabaseAdmin
      .from("children")
      .update({ name: data.child_name, school: data.school || null })
      .eq("id", childId);
  }

  if (data.assessment_id) {
    await supabaseAdmin
      .from("assessments")
      .update({ education_level: data.education_level || "TK" })
      .eq("id", data.assessment_id);
  }

  return { ok: true };
}

export async function getAdminParentsListServer() {
  const [{ data: parents, error: pErr }, { data: children, error: cErr }, { data: assessments, error: aErr }] = await Promise.all([
    supabaseAdmin.from("parents").select("*").order("created_at", { ascending: false }).limit(500),
    supabaseAdmin.from("children").select("*").order("created_at", { ascending: false }).limit(500),
    supabaseAdmin.from("assessments").select("*").order("created_at", { ascending: false }).limit(500),
  ]);

  if (pErr) console.error("getAdminParentsListServer parents error:", pErr.message);
  if (cErr) console.error("getAdminParentsListServer children error:", cErr.message);
  if (aErr) console.error("getAdminParentsListServer assessments error:", aErr.message);

  const parentMap = new Map<string, any>();
  if (parents && Array.isArray(parents)) {
    parents.forEach((p) => parentMap.set(p.id, p));
  }

  const childMap = new Map<string, any>();
  if (children && Array.isArray(children)) {
    children.forEach((c) => childMap.set(c.id, c));
  }

  const resultList: any[] = [];
  const processedAssessmentIds = new Set<string>();
  const processedParentIds = new Set<string>();

  if (assessments && Array.isArray(assessments)) {
    for (const a of assessments) {
      if (a.id) processedAssessmentIds.add(a.id);
      if (a.parent_id) processedParentIds.add(a.parent_id);

      const pObj = parentMap.get(a.parent_id);
      const cObj = childMap.get(a.child_id);

      resultList.push({
        id: a.id,
        status: a.status || "analyzed",
        education_level: a.education_level || "TK",
        created_at: a.created_at || new Date().toISOString(),
        parent_id: a.parent_id,
        child_id: a.child_id,
        parents: pObj ? { id: pObj.id, name: pObj.name, whatsapp: pObj.whatsapp } : { id: a.parent_id, name: "Orang Tua", whatsapp: "-" },
        children: cObj ? { id: cObj.id, name: cObj.name, school: cObj.school || "", birth_date: cObj.birth_date } : { id: a.child_id, name: "Anak", school: "" },
      });
    }
  }

  if (parents && Array.isArray(parents)) {
    for (const p of parents) {
      if (!processedParentIds.has(p.id)) {
        const foundC = children?.find((c) => c.parent_id === p.id);
        resultList.push({
          id: p.id,
          status: "pending",
          education_level: "TK",
          created_at: p.created_at || new Date().toISOString(),
          parent_id: p.id,
          child_id: foundC?.id,
          parents: { id: p.id, name: p.name, whatsapp: p.whatsapp },
          children: foundC ? { id: foundC.id, name: foundC.name, school: foundC.school || "" } : { name: "Anak", school: "" },
        });
      }
    }
  }

  resultList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return resultList;
}

export async function getAdminStatsServer() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    { count: total },
    { count: todayCount },
    { count: analyzed },
    { count: tkCount },
    { count: sdCount },
    { count: smpCount },
    { count: smaCount },
    { count: smkCount },
    { count: parents }
  ] = await Promise.all([
    supabaseAdmin.from("assessments").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("assessments").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
    supabaseAdmin.from("assessments").select("*", { count: "exact", head: true }).eq("status", "analyzed"),
    supabaseAdmin.from("assessments").select("*", { count: "exact", head: true }).eq("education_level", "TK"),
    supabaseAdmin.from("assessments").select("*", { count: "exact", head: true }).eq("education_level", "SD"),
    supabaseAdmin.from("assessments").select("*", { count: "exact", head: true }).eq("education_level", "SMP"),
    supabaseAdmin.from("assessments").select("*", { count: "exact", head: true }).eq("education_level", "SMA"),
    supabaseAdmin.from("assessments").select("*", { count: "exact", head: true }).eq("education_level", "SMK"),
    supabaseAdmin.from("parents").select("*", { count: "exact", head: true }),
  ]);

  return {
    total: total ?? 0,
    today: todayCount ?? 0,
    analyzed: analyzed ?? 0,
    tk: tkCount ?? 0,
    sd: sdCount ?? 0,
    smp: smpCount ?? 0,
    sma: smaCount ?? 0,
    smk: smkCount ?? 0,
    parents: parents ?? 0,
  };
}

export async function getAdminRecentListServer(level?: string) {
  const [{ data: assessments }, { data: parents }, { data: children }] = await Promise.all([
    supabaseAdmin.from("assessments").select("*").order("created_at", { ascending: false }).limit(20),
    supabaseAdmin.from("parents").select("id, name, whatsapp"),
    supabaseAdmin.from("children").select("id, name, school"),
  ]);

  const pMap = new Map((parents ?? []).map((p) => [p.id, p]));
  const cMap = new Map((children ?? []).map((c) => [c.id, c]));

  let filtered = assessments ?? [];
  if (level && level !== "ALL") {
    filtered = filtered.filter((a) => a.education_level === level);
  }

  return filtered.slice(0, 10).map((a) => ({
    ...a,
    parents: pMap.get(a.parent_id) || { id: a.parent_id, name: "Orang Tua", whatsapp: "-" },
    children: cMap.get(a.child_id) || { id: a.child_id, name: "Anak", school: "" },
  }));
}

/**
 * Hapus data assessment beserta SELURUH data relasi.
 *
 * Schema FK cascade chain:
 *   parents  ← ON DELETE CASCADE ←  children  ← ON DELETE CASCADE ←  assessments
 *   assessments  ← ON DELETE CASCADE ←  assessment_answers
 *   assessments  ← ON DELETE CASCADE ←  ai_results
 *
 * Strategi: Hapus `parents` record → PostgreSQL CASCADE otomatis menghapus
 * children, assessments, assessment_answers, dan ai_results.
 *
 * Jika parent memiliki >1 child/assessment, seluruhnya ikut terhapus.
 * Jika ingin hanya menghapus 1 assessment tanpa menghapus parent,
 * cukup hapus assessment saja (children tetap, cascade hapus answers & results).
 */
export async function deleteAssessmentServer(targetId: string) {
  if (!targetId) throw new Error("ID data tidak valid.");

  const errors: string[] = [];

  // 1. Check if targetId matches an assessment ID
  const { data: assessment } = await supabaseAdmin
    .from("assessments")
    .select("id, parent_id, child_id")
    .eq("id", targetId)
    .maybeSingle();

  if (assessment) {
    const parentId = assessment.parent_id;
    const childId = assessment.child_id;

    // Delete AI results for this assessment only
    await supabaseAdmin.from("ai_results").delete().eq("assessment_id", targetId);

    // Delete assessment answers for this assessment only
    await supabaseAdmin.from("assessment_answers").delete().eq("assessment_id", targetId);

    // Delete assessment record
    const { error: delAssErr } = await supabaseAdmin.from("assessments").delete().eq("id", targetId);
    if (delAssErr) errors.push("assessments: " + delAssErr.message);

    // Check if child has remaining assessments; if none, delete child record
    if (childId) {
      const { count: childAssCount } = await supabaseAdmin
        .from("assessments")
        .select("*", { count: "exact", head: true })
        .eq("child_id", childId);

      if (!childAssCount || childAssCount === 0) {
        await supabaseAdmin.from("children").delete().eq("id", childId);
      }
    }

    // Check if parent has remaining assessments; if none, delete parent record
    if (parentId) {
      const { count: parentAssCount } = await supabaseAdmin
        .from("assessments")
        .select("*", { count: "exact", head: true })
        .eq("parent_id", parentId);

      if (!parentAssCount || parentAssCount === 0) {
        await supabaseAdmin.from("parents").delete().eq("id", parentId);
      }
    }
  } else {
    // 2. Check if targetId matches a parent ID directly
    const { data: parent } = await supabaseAdmin
      .from("parents")
      .select("id")
      .eq("id", targetId)
      .maybeSingle();

    if (parent) {
      const { data: pAssessments } = await supabaseAdmin
        .from("assessments")
        .select("id")
        .eq("parent_id", targetId);

      if (pAssessments && pAssessments.length > 0) {
        for (const pa of pAssessments) {
          await supabaseAdmin.from("ai_results").delete().eq("assessment_id", pa.id);
          await supabaseAdmin.from("assessment_answers").delete().eq("assessment_id", pa.id);
        }
        await supabaseAdmin.from("assessments").delete().eq("parent_id", targetId);
      }

      await supabaseAdmin.from("children").delete().eq("parent_id", targetId);
      const { error: delParErr } = await supabaseAdmin.from("parents").delete().eq("id", targetId);
      if (delParErr) errors.push("parents: " + delParErr.message);
    } else {
      // 3. Check if targetId matches a child ID directly
      const { data: child } = await supabaseAdmin
        .from("children")
        .select("id, parent_id")
        .eq("id", targetId)
        .maybeSingle();

      if (child) {
        const { data: cAssessments } = await supabaseAdmin
          .from("assessments")
          .select("id")
          .eq("child_id", targetId);

        if (cAssessments && cAssessments.length > 0) {
          for (const ca of cAssessments) {
            await supabaseAdmin.from("ai_results").delete().eq("assessment_id", ca.id);
            await supabaseAdmin.from("assessment_answers").delete().eq("assessment_id", ca.id);
          }
          await supabaseAdmin.from("assessments").delete().eq("child_id", targetId);
        }

        await supabaseAdmin.from("children").delete().eq("id", targetId);
      } else {
        throw new Error("Data tidak ditemukan di database.");
      }
    }
  }

  // Activity Log
  try {
    await supabaseAdmin.from("activity_logs").insert({
      action: "DELETE DATA",
      details: {
        target_id: targetId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (logErr: any) {
    console.warn("Activity log insert warning:", logErr?.message);
  }

  return { ok: true, id: targetId };
}
