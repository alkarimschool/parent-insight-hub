import { supabaseAdmin } from "../integrations/supabase/client.server";
import { updateAssessmentCardSettingsServer } from "../lib/admin.server";

async function debugWsData() {
  const testPayload = {
    TK: { title: "JUDUL AUDIT TK 999", desc: "DESKRIPSI AUDIT TK 999", is_locked: false },
    SD: { title: "JUDUL AUDIT SD 888", desc: "DESKRIPSI AUDIT SD 888", is_locked: true },
    SMP: { title: "JUDUL AUDIT SMP 777", desc: "DESKRIPSI AUDIT SMP 777", is_locked: true },
    SMA: { title: "JUDUL AUDIT SMA 666", desc: "DESKRIPSI AUDIT SMA 666", is_locked: false },
  };

  console.log("Saving test payload...");
  await updateAssessmentCardSettingsServer(testPayload);

  const { data: row } = await supabaseAdmin.from("website_settings").select("*").eq("id", 1).maybeSingle();
  console.log("Full DB row website_settings id=1:", JSON.stringify(row, null, 2));
}

debugWsData();
