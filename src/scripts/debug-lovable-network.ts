import { chromium } from "playwright-core";

async function debugLovableNetwork() {
  const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const browser = await chromium.launch({ executablePath, headless: true });
  const page = await browser.newPage();

  await page.goto("https://parentawareness.lovable.app/admin/parents", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  const evalResult = await page.evaluate(async () => {
    // Access Supabase from client window if available or fetch REST directly
    const url = "https://lqzicsebjjzhdsduqdcf.supabase.co/rest/v1/parents?select=*";
    const apiKey = "sb_publishable_pu4E46tx3jk_u55S6-vFDg_Bggu_6fv";
    
    try {
      const res = await fetch(url, {
        headers: {
          "apikey": apiKey,
          "Authorization": `Bearer ${apiKey}`
        }
      });
      const data = await res.json();
      return { status: res.status, count: Array.isArray(data) ? data.length : 0, data };
    } catch (err: any) {
      return { error: err.message };
    }
  });

  console.log("▶ Browser Direct Supabase REST Fetch Result:", JSON.stringify(evalResult, null, 2));

  await browser.close();
}

debugLovableNetwork().catch(console.error);
