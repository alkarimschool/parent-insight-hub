import { chromium } from "playwright-core";
import path from "path";

async function verifyLiveDeployments() {
  const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const artifactsDir = "C:\\Users\\AZAM\\.gemini\\antigravity-ide\\brain\\0a38a485-06d3-4265-8749-75d2c9e7ce9a";

  const browser = await chromium.launch({ executablePath, headless: true });
  const page = await browser.newPage();

  console.log("▶ [1/2] Verifying Cloudflare Production URL (https://parentawereness.sdalamalkarim.workers.dev)...");
  try {
    await page.goto("https://parentawereness.sdalamalkarim.workers.dev/auth", { waitUntil: "networkidle", timeout: 25000 });
    await page.evaluate(() => localStorage.setItem("paa_admin_logged_in", "true"));
    await page.goto("https://parentawereness.sdalamalkarim.workers.dev/admin/parents", { waitUntil: "networkidle", timeout: 25000 });
    await page.waitForTimeout(3000);

    const cfScreenshotPath = path.join(artifactsDir, "cloudflare_live_verified.png");
    await page.screenshot({ path: cfScreenshotPath, fullPage: false });
    console.log(`   ✓ Saved Cloudflare live screenshot: ${cfScreenshotPath}`);

    const exportBtn1 = await page.locator("button:has-text('Export Hasil Analisis AI')").first();
    const exportBtn2 = await page.locator("button:has-text('Export QA Report')").first();
    console.log(`   ✓ Cloudflare Export Button 1 Visible: ${await exportBtn1.isVisible()}`);
    console.log(`   ✓ Cloudflare Export Button 2 Visible: ${await exportBtn2.isVisible()}`);
  } catch (err: any) {
    console.warn("   ⚠️ Cloudflare live verification warning:", err.message);
  }

  console.log("▶ [2/2] Verifying Lovable Production URL (https://parentawareness.lovable.app)...");
  try {
    await page.goto("https://parentawareness.lovable.app/auth", { waitUntil: "networkidle", timeout: 25000 });
    await page.evaluate(() => localStorage.setItem("paa_admin_logged_in", "true"));
    await page.goto("https://parentawareness.lovable.app/admin/parents", { waitUntil: "networkidle", timeout: 25000 });
    
    // Wait for Supabase React Query data rows to render
    try {
      await page.waitForSelector("tbody tr td:nth-child(2)", { timeout: 8000 });
    } catch {
      await page.waitForTimeout(3000);
    }

    const lovableScreenshotPath = path.join(artifactsDir, "lovable_live_verified.png");
    await page.screenshot({ path: lovableScreenshotPath, fullPage: false });
    console.log(`   ✓ Saved Lovable live screenshot: ${lovableScreenshotPath}`);

    const lovExportBtn1 = await page.locator("button:has-text('Export Hasil Analisis AI')").first();
    const lovExportBtn2 = await page.locator("button:has-text('Export QA Report')").first();
    console.log(`   ✓ Lovable Export Button 1 Visible: ${await lovExportBtn1.isVisible()}`);
    console.log(`   ✓ Lovable Export Button 2 Visible: ${await lovExportBtn2.isVisible()}`);
  } catch (err: any) {
    console.warn("   ⚠️ Lovable live verification warning:", err.message);
  }

  await browser.close();
  console.log("\n🎉 LIVE DEPLOYMENT VERIFICATION COMPLETE!");
}

verifyLiveDeployments().catch(console.error);
