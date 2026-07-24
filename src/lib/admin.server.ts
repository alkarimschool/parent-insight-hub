import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function updateAiSettingsServer(data: {
  id?: string;
  model: string;
  temperature: number;
  max_tokens: number;
  is_active: boolean;
}) {
  if (data.id && data.id !== "default") {
    const { error } = await supabaseAdmin
      .from("ai_settings")
      .update({
        model: data.model,
        temperature: data.temperature,
        max_tokens: data.max_tokens,
        is_active: data.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);
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
  id?: string;
  api_url: string;
  api_token: string;
  sender: string;
  template: string;
  is_active: boolean;
}) {
  if (data.id && data.id !== "default") {
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
      .eq("id", data.id);
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

export async function updateWebsiteSettingsServer(data: any) {
  const { error } = await supabaseAdmin
    .from("website_settings")
    .upsert({ id: 1, data, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function updateHomepageSettingsServer(data: any) {
  const { error } = await supabaseAdmin
    .from("homepage_settings")
    .upsert({ id: 1, data, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function updatePromptServer(data: {
  id?: string;
  name: string;
  system_prompt: string;
  user_template: string;
  is_active: boolean;
}) {
  if (data.id && data.id !== "default") {
    const { error } = await supabaseAdmin
      .from("ai_prompts")
      .update({
        name: data.name,
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
      system_prompt: data.system_prompt,
      user_template: data.user_template,
      is_active: data.is_active,
    });
    if (error) throw new Error(error.message);
  }
  return { ok: true };
}
