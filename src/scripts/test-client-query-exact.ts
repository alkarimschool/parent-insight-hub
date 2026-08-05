import { chromium } from "playwright-core";

async function testClientQueryExact() {
  const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const browser = await chromium.launch({ executablePath, headless: true });
  const page = await browser.newPage();

  page.on("console", (msg) => console.log(`[CONSOLE ${msg.type()}]: ${msg.text()}`));

  await page.goto("https://parentawareness.lovable.app/admin/parents", { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);

  const testResult = await page.evaluate(async () => {
    // Import or construct supabase client directly in browser
    const url = "https://lqzicsebjjzhdsduqdcf.supabase.co";
    const key = "sb_publishable_pu4E46tx3jk_u55S6-vFDg_Bggu_6fv";
    
    // Test direct fetch with supabase headers
    const pRes = await fetch(`${url}/rest/v1/parents?select=*&order=created_at.desc`, {
      headers: { "apikey": key, "Authorization": `Bearer ${key}` }
    });
    const cRes = await fetch(`${url}/rest/v1/children?select=*&order=created_at.desc`, {
      headers: { "apikey": key, "Authorization": `Bearer ${key}` }
    });
    const aRes = await fetch(`${url}/rest/v1/assessments?select=*&order=created_at.desc`, {
      headers: { "apikey": key, "Authorization": `Bearer ${key}` }
    });

    const parents = await pRes.json();
    const children = await cRes.json();
    const assessments = await aRes.json();

    return {
      parentsStatus: pRes.status,
      parentsLength: Array.isArray(parents) ? parents.length : parents,
      childrenStatus: cRes.status,
      childrenLength: Array.isArray(children) ? children.length : children,
      assessmentsStatus: aRes.status,
      assessmentsLength: Array.isArray(assessments) ? assessments.length : assessments,
      firstParent: Array.isArray(parents) ? parents[0] : null,
      firstAssessment: Array.isArray(assessments) ? assessments[0] : null,
    };
  });

  console.log("▶ Browser Direct Supabase Query Result:", JSON.stringify(testResult, null, 2));

  await browser.close();
}

testClientQueryExact().catch(console.error);
