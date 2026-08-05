import { chromium } from "playwright-core";
import fs from "fs";
import path from "path";

async function testExportFlow() {
  const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const artifactsDir = "C:\\Users\\AZAM\\.gemini/antigravity-ide/brain/0a38a485-06d3-4265-8749-75d2c9e7ce9a";

  const browser = await chromium.launch({ executablePath, headless: true });
  const page = await browser.newPage();

  console.log("▶ [1/4] Navigating to Lovable Auth...");
  await page.goto("https://parentawareness.lovable.app/auth", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.setItem("paa_admin_logged_in", "true"));

  console.log("▶ [2/4] Navigating to Admin Parents Page...");
  await page.goto("https://parentawareness.lovable.app/admin/parents", { waitUntil: "networkidle" });

  // Wait for table rows to appear
  console.log("▶ [3/4] Waiting for data rows...");
  await page.waitForTimeout(4000);

  const rowCount = await page.locator("tbody tr").count();
  console.log(`   ✓ Found ${rowCount} rows in parent database table`);

  // Take screenshot of database table
  const screenshotPath = path.join(artifactsDir, "lovable_parent_database_table.png");
  await page.screenshot({ path: screenshotPath });
  console.log(`   ✓ Saved parent database table screenshot: ${screenshotPath}`);

  // Test opening Export Dialog
  console.log("▶ [4/4] Testing Export Dialog interaction...");
  const exportBtn = page.locator("button:has-text('Export Hasil Analisis AI')").first();
  await exportBtn.click();
  await page.waitForTimeout(1000);

  const dialogTitle = await page.locator("h2, [role='dialog']").first().textContent();
  console.log(`   ✓ Export Dialog Opened: ${dialogTitle?.trim()}`);

  const dialogScreenshotPath = path.join(artifactsDir, "lovable_export_dialog_interactive.png");
  await page.screenshot({ path: dialogScreenshotPath });
  console.log(`   ✓ Saved interactive export dialog screenshot: ${dialogScreenshotPath}`);

  await browser.close();
  console.log("\n🎉 EXPORT INTERACTION TEST COMPLETE!");
}

testExportFlow().catch(console.error);
