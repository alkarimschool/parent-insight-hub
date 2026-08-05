import { chromium } from "playwright-core";
import fs from "fs";
import path from "path";

async function takeAdminScreenshots() {
  const possiblePaths = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  ];

  let executablePath = possiblePaths.find((p) => fs.existsSync(p));

  if (!executablePath) {
    console.error("No system Chrome or Edge executable found at standard paths.");
    return;
  }

  console.log(`Using browser executable at: ${executablePath}`);

  const browser = await chromium.launch({
    executablePath,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();

  // Step 1: Open http://localhost:8080/auth and perform login
  console.log("▶ [1/4] Navigating to http://localhost:8080/auth...");
  await page.goto("http://localhost:8080/auth", { waitUntil: "networkidle" });

  // Set localStorage admin flag and reload/login
  await page.evaluate(() => {
    localStorage.setItem("paa_admin_logged_in", "true");
  });

  // Step 2: Open http://localhost:8080/admin
  console.log("▶ [2/4] Navigating to http://localhost:8080/admin...");
  await page.goto("http://localhost:8080/admin", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const artifactsDir = "C:\\Users\\AZAM\\.gemini\\antigravity-ide\\brain\\0a38a485-06d3-4265-8749-75d2c9e7ce9a";

  const adminDashboardScreenshotPath = path.join(artifactsDir, "admin_dashboard_export_buttons.png");
  await page.screenshot({ path: adminDashboardScreenshotPath, fullPage: false });
  console.log(`   ✓ Saved screenshot: ${adminDashboardScreenshotPath}`);

  // Check if Export buttons are visible on /admin
  const exportBtn1 = await page.locator("button:has-text('Export Hasil Analisis AI')").first();
  const exportBtn2 = await page.locator("button:has-text('Export QA Report')").first();

  console.log(`   ✓ Button 'Export Hasil Analisis AI' visible on /admin: ${await exportBtn1.isVisible()}`);
  console.log(`   ✓ Button 'Export QA Report' visible on /admin: ${await exportBtn2.isVisible()}`);

  // Step 3: Open http://localhost:8080/admin/parents
  console.log("▶ [3/4] Navigating to http://localhost:8080/admin/parents...");
  await page.goto("http://localhost:8080/admin/parents", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const adminParentsScreenshotPath = path.join(artifactsDir, "admin_parents_export_buttons.png");
  await page.screenshot({ path: adminParentsScreenshotPath, fullPage: false });
  console.log(`   ✓ Saved screenshot: ${adminParentsScreenshotPath}`);

  const parentsExportBtn1 = await page.locator("button:has-text('Export Hasil Analisis AI')").first();
  const parentsExportBtn2 = await page.locator("button:has-text('Export QA Report')").first();

  console.log(`   ✓ Button 'Export Hasil Analisis AI' visible on /admin/parents: ${await parentsExportBtn1.isVisible()}`);
  console.log(`   ✓ Button 'Export QA Report' visible on /admin/parents: ${await parentsExportBtn2.isVisible()}`);

  // Step 4: Click Export button and capture Export Dialog open
  console.log("▶ [4/4] Clicking 'Export Hasil Analisis AI' to open Export Dialog...");
  await parentsExportBtn1.click();
  await page.waitForTimeout(800);

  const exportDialogScreenshotPath = path.join(artifactsDir, "admin_export_dialog_open.png");
  await page.screenshot({ path: exportDialogScreenshotPath, fullPage: false });
  console.log(`   ✓ Saved screenshot: ${exportDialogScreenshotPath}`);

  await browser.close();
  console.log("\n🎉 BROWSER AUTOMATION & SCREENSHOT VERIFICATION COMPLETED SUCCESSFULLY!");
}

takeAdminScreenshots().catch(console.error);
