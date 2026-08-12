import { getAssessmentResultServer } from "../dev-server/src/lib/assessment.server";
import { supabaseAdmin } from "../dev-server/src/integrations/supabase/client.server";
async function main(){
  const { data: tk } = await supabaseAdmin.from("assessments").select("id").eq("education_level","TK").order("created_at",{ascending:false}).limit(2);
  for (const a of tk||[]) {
    const r:any = await getAssessmentResultServer(a.id,true);
    console.log(a.id, "|CATATAN:", r.content.catatan_untuk_orang_tua);
    console.log("  status:", r.content.status_perkembangan, "| kesimpulan:", String(r.content.kesimpulan_umum_perkembangan||"").slice(0,60));
  }
  for (const lvl of ["SD","SMP","SMA"]) {
    const { data } = await supabaseAdmin.from("assessments").select("id").eq("education_level",lvl).order("created_at",{ascending:false}).limit(1);
    if(!data?.length){console.log(lvl,"no data");continue;}
    const r:any = await getAssessmentResultServer(data[0].id,true);
    console.log(lvl,"catatan:",JSON.stringify(r.content.catatan_untuk_orang_tua||r.content.catatan||null)?.slice(0,80));
  }
}
main();
