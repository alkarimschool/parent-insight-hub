import { supabase } from "@/integrations/supabase/client";

export interface HomepageData {
  hero_title: string;
  hero_subtitle: string;
  hero_cta: string;
  hero_badge?: string;
  why_title: string;
  why_subtitle?: string;
  why_items: Array<{ icon: string; title: string; desc: string }>;
  benefits_title: string;
  benefits_items: Array<{ icon: string; title: string; desc: string }>;
  how_title: string;
  how_items: Array<{ step: string; title: string; desc: string }>;
  faq_title: string;
  faq_items: Array<{ q: string; a: string }>;
  footer_tagline?: string;
}

export interface WebsiteData {
  site_name: string;
  logo_text: string;
  primary_color?: string;
  meta_title: string;
  meta_description: string;
  contact_whatsapp?: string;
  contact_email?: string;
  contact_address?: string;
  social_instagram?: string;
  social_facebook?: string;
  social_youtube?: string;
  copyright?: string;
  ga_id?: string;
  gtm_id?: string;
}

export async function fetchHomepage(): Promise<HomepageData | null> {
  const { data } = await supabase.from("homepage_settings").select("data").eq("id", 1).maybeSingle();
  return (data?.data as unknown as HomepageData) ?? null;
}

export async function fetchWebsite(): Promise<WebsiteData | null> {
  const { data } = await supabase.from("website_settings").select("data").eq("id", 1).maybeSingle();
  return (data?.data as unknown as WebsiteData) ?? null;
}