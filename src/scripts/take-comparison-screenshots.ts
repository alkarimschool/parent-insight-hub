import { chromium } from "playwright-core";
import fs from "fs";
import path from "path";

async function takeComparisonScreenshots() {
  const possiblePaths = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  ];

  let executablePath = possiblePaths.find((p) => fs.existsSync(p));

  if (!executablePath) {
    console.error("No system Chrome or Edge executable found.");
    return;
  }

  const browser = await chromium.launch({ executablePath, headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const artifactsDir = "C:\\Users\\AZAM\\.gemini\\antigravity-ide\\brain\\0a38a485-06d3-4265-8749-75d2c9e7ce9a";

  // 1. Capture Lovable URL
  console.log("▶ Navigating to Lovable App (https://parentawareness.lovable.app/auth)...");
  try {
    await page.goto("https://parentawareness.lovable.app/auth", { waitUntil: "networkidle", timeout: 15000 });
    await page.evaluate(() => localStorage.setItem("paa_admin_logged_in", "true"));
    await page.goto("https://parentawareness.lovable.app/admin/parents", { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    const lovableScreenshotPath = path.join(artifactsDir, "lovable_app_sync.png");
    await page.screenshot({ path: lovableScreenshotPath, fullPage: false });
    console.log(`   ✓ Saved Lovable screenshot: ${lovableScreenshotPath}`);
  } catch (e: any) {
    console.warn("   ⚠️ Lovable navigation note:", e.message);
  }

  // 2. Capture Local Production Server URL (matching Cloudflare Worker code)
  console.log("▶ Navigating to Local Live App (http://localhost:8080/auth)...");
  try {
    await page.goto("http://localhost:8080/auth", { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.setItem("paa_admin_logged_in", "true"));
    await page.goto("http://localhost:8080/admin/parents", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    const cloudflareScreenshotPath = path.join(artifactsDir, "cloudflare_app_sync.png");
    await page.screenshot({ path: cloudflareScreenshotPath, fullPage: false });
    console.log(`   ✓ Saved Cloudflare/Local screenshot: ${cloudflareScreenshotPath}`);
  } catch (e: any) {
    console.warn("   ⚠️ Cloudflare navigation note:", e.message);
  }

  await browser.close();
  console.log("\n🎉 COMPARISON SCREENSHOTS COMPLETED!");
}

takeComparisonScreenshots().catch(console.error);
