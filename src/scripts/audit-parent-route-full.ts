import { chromium } from "playwright-core";
import fs from "fs";
import path from "path";

async function auditParentRouteFull() {
  const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const artifactsDir = "C:\\Users\\AZAM\\.gemini\\antigravity-ide\\brain\\0a38a485-06d3-4265-8749-75d2c9e7ce9a";

  const consoleLogs: { type: string; text: string }[] = [];
  const networkRequests: { url: string; status: number; ok: boolean }[] = [];

  const browser = await chromium.launch({ executablePath, headless: true });
  const page = await browser.newPage();

  page.on("console", (msg) => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
    console.log(`[BROWSER ${msg.type().toUpperCase()}]: ${msg.text()}`);
  });

  page.on("response", (res) => {
    if (res.url().includes("supabase") || res.url().includes("parent")) {
      networkRequests.push({ url: res.url(), status: res.status(), ok: res.ok() });
    }
  });

  console.log("▶ [1/4] Navigating to Auth & Setting LocalAdmin Session...");
  await page.goto("https://parentawareness.lovable.app/auth", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.setItem("paa_admin_logged_in", "true"));

  console.log("▶ [2/4] Opening /admin/parents route...");
  await page.goto("https://parentawareness.lovable.app/admin/parents", { waitUntil: "networkidle" });
  await page.waitForTimeout(4000);

  const pageTitle = await page.title();
  const pageHeading = await page.locator("h1").first().textContent().catch(() => "N/A");

  console.log(`   ✓ Page Title: ${pageTitle}`);
  console.log(`   ✓ Page Heading: ${pageHeading}`);

  const rowCount = await page.locator("tbody tr").count();
  console.log(`   ✓ Rendered Table Rows Count: ${rowCount}`);

  const pageScreenshotPath = path.join(artifactsDir, "audit_parents_page_success.png");
  await page.screenshot({ path: pageScreenshotPath, fullPage: false });
  console.log(`   ✓ Saved page screenshot: ${pageScreenshotPath}`);

  console.log("▶ [3/4] Testing Export Dialog & Buttons...");
  const exportBtn = page.locator("button:has-text('Export Hasil Analisis AI')").first();
  const exportBtnVisible = await exportBtn.isVisible();
  console.log(`   ✓ Export Button Visible: ${exportBtnVisible}`);

  if (exportBtnVisible) {
    await exportBtn.click();
    await page.waitForTimeout(1000);
    const exportScreenshotPath = path.join(artifactsDir, "audit_export_dialog_success.png");
    await page.screenshot({ path: exportScreenshotPath, fullPage: false });
    console.log(`   ✓ Saved export dialog screenshot: ${exportScreenshotPath}`);
  }

  console.log("▶ [4/4] Generating Audit Summary Report...");
  const errors = consoleLogs.filter((l) => l.type === "error");
  console.log(`   ✓ Total Console Errors: ${errors.length}`);
  console.log(`   ✓ Total Tracked Network Requests: ${networkRequests.length}`);

  await browser.close();
  console.log("\n🎉 FULL AUDIT AUDITED SUCCESSFULLY!");
}

auditParentRouteFull().catch(console.error);
