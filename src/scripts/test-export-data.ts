import { chromium } from "playwright-core";

async function testExportData() {
  const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const browser = await chromium.launch({ executablePath, headless: true });
  const page = await browser.newPage();

  page.on("console", (msg) => console.log(`[CONSOLE ${msg.type()}]: ${msg.text()}`));

  await page.goto("https://parentawareness.lovable.app/admin/parents", { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);

  const res = await page.evaluate(async () => {
    // Execute export data query in browser context
    const PROD_URL = "https://lqzicsebjjzhdsduqdcf.supabase.co";
    const PROD_KEY = "sb_publishable_pu4E46tx3jk_u55S6-vFDg_Bggu_6fv";

    const headers = { "apikey": PROD_KEY, "Authorization": `Bearer ${PROD_KEY}` };

    const [pRes, cRes, aRes] = await Promise.all([
      fetch(`${PROD_URL}/rest/v1/parents?select=*`, { headers }),
      fetch(`${PROD_URL}/rest/v1/children?select=*`, { headers }),
      fetch(`${PROD_URL}/rest/v1/assessments?select=*`, { headers }),
    ]);

    const parents = await pRes.json();
    const children = await cRes.json();
    const assessments = await aRes.json();

    return {
      parentsCount: Array.isArray(parents) ? parents.length : parents,
      childrenCount: Array.isArray(children) ? children.length : children,
      assessmentsCount: Array.isArray(assessments) ? assessments.length : assessments,
    };
  });

  console.log("▶ Live Lovable Data Fetch Test Result:", JSON.stringify(res, null, 2));

  await browser.close();
}

testExportData().catch(console.error);
