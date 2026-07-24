import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function updateAiSettingsServer(data: {
  model: string;
  temperature: number;
  max_tokens: number;
  is_active: boolean;
}) {
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
        temperature: data.temperature,
        max_tokens: data.max_tokens,
        is_active: data.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabaseAdmin.from("ai_settings").insert({
      model: data.model,
      temperature: data.temperature,
      max_tokens: data.max_tokens,
      is_active: data.is_active,
    });
    if (error) throw new Error(error.message);
  }
  return { ok: true };
}

export async function updateWaSettingsServer(data: {
  api_url: string;
  api_token: string;
  sender: string;
  template: string;
  is_active: boolean;
}) {
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
        is_active: data.is_active,
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
      is_active: data.is_active,
    });
    if (error) throw new Error(error.message);
  }
  return { ok: true };
}

export async function updateWebsiteSettingsServer(data: {
  site_name: string;
  logo_text: string;
  contact_email: string;
  contact_whatsapp: string;
  copyright: string;
}) {
  const { data: existing } = await supabaseAdmin
    .from("website_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (existing) {
    const { error } = await supabaseAdmin
      .from("website_settings")
      .update({
        site_name: data.site_name,
        logo_text: data.logo_text,
        contact_email: data.contact_email,
        contact_whatsapp: data.contact_whatsapp,
        copyright: data.copyright,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabaseAdmin.from("website_settings").insert({
      site_name: data.site_name,
      logo_text: data.logo_text,
      contact_email: data.contact_email,
      contact_whatsapp: data.contact_whatsapp,
      copyright: data.copyright,
    });
    if (error) throw new Error(error.message);
  }
  return { ok: true };
}

export async function updateHomepageSettingsServer(data: any) {
  const { data: existing } = await supabaseAdmin
    .from("homepage_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (existing) {
    const { error } = await supabaseAdmin
      .from("homepage_settings")
      .update({
        content: data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabaseAdmin.from("homepage_settings").insert({
      content: data,
    });
    if (error) throw new Error(error.message);
  }
  return { ok: true };
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
  const { data: assessments, error } = await supabaseAdmin
    .from("assessments")
    .select("id, status, education_level, created_at, parent_id, child_id, parents(id, name, whatsapp), children(id, name, birth_date, school)")
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    console.error("Error querying assessments list:", error);
    return [];
  }

  return assessments ?? [];
}

export async function deleteAssessmentServer(id: string) {
  if (!id) throw new Error("ID Assessment tidak valid.");

  // 1. Fetch details before deletion to clean up children and parents
  const { data: assessment } = await supabaseAdmin
    .from("assessments")
    .select("id, parent_id, child_id, education_level, parents(id, name, whatsapp), children(id, name)")
    .eq("id", id)
    .maybeSingle();

  const childId = assessment?.child_id;
  const parentId = assessment?.parent_id;
  const childName = (assessment as any)?.children?.name || "Anak";
  const parentName = (assessment as any)?.parents?.name || "Orang Tua";
  const level = assessment?.education_level || "TK";

  // 2. Cascade Delete related records first
  try {
    await supabaseAdmin.from("ai_results").delete().eq("assessment_id", id);
  } catch (e) {
    console.warn("ai_results delete warning:", e);
  }

  try {
    await supabaseAdmin.from("assessment_answers").delete().eq("assessment_id", id);
  } catch (e) {
    console.warn("assessment_answers delete warning:", e);
  }

  // 3. Delete assessment record
  const { error: deleteErr } = await supabaseAdmin.from("assessments").delete().eq("id", id);
  if (deleteErr) {
    console.error("Failed to delete assessment record:", deleteErr);
    throw new Error("Gagal menghapus data: " + deleteErr.message);
  }

  // 4. Force delete child & parent records to keep database clean
  if (childId) {
    try {
      await supabaseAdmin.from("children").delete().eq("id", childId);
    } catch (e) {
      console.warn("Could not delete child record:", e);
    }
  }

  if (parentId) {
    try {
      await supabaseAdmin.from("parents").delete().eq("id", parentId);
    } catch (e) {
      console.warn("Could not delete parent record:", e);
    }
  }

  // 5. Record Activity Log
  try {
    await supabaseAdmin.from("activity_logs").insert({
      action: "DELETE DATA",
      details: {
        assessment_id: id,
        parent_name: parentName,
        child_name: childName,
        education_level: level,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (e) {
    console.warn("Could not insert activity_logs record:", e);
  }

  return { ok: true, id };
}
