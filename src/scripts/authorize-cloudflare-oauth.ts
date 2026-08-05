import { chromium } from "playwright-core";
import fs from "fs";

async function authorizeCloudflareOauth() {
  const possiblePaths = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  ];

  let executablePath = possiblePaths.find((p) => fs.existsSync(p));
  if (!executablePath) return;

  const authUrl = "https://dash.cloudflare.com/oauth2/auth?response_type=code&client_id=54d11594-84e4-41aa-b438-e81b8fa78ee7&redirect_uri=http%3A%2F%2Flocalhost%3A8976%2Foauth%2Fcallback&scope=account%3Aread%20user%3Aread%20workers%3Awrite%20workers_kv%3Awrite%20workers_routes%3Awrite%20workers_scripts%3Awrite%20workers_tail%3Aread%20d1%3Awrite%20pages%3Awrite%20zone%3Aread%20ssl_certs%3Awrite%20ai%3Awrite%20ai-search%3Awrite%20ai-search%3Arun%20websearch.run%20agent-memory%3Awrite%20queues%3Awrite%20pipelines%3Awrite%20secrets_store%3Awrite%20artifacts%3Awrite%20flagship%3Awrite%20containers%3Awrite%20cloudchamber%3Awrite%20connectivity%3Aadmin%20email_routing%3Awrite%20email_sending%3Awrite%20browser%3Awrite%20challenge-widgets.write%20offline_access&state=VeMv_I_vP299MQj9xDAVsAP6QpaNOhm0&code_challenge=roL6Y5BMJ4fuvamhXkdgIRCKozaOMwmvpEIaRzhNh_8&code_challenge_method=S256";

  const browser = await chromium.launch({ executablePath, headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Navigating to Cloudflare OAuth authorization URL...");
  await page.goto(authUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // Look for Allow / Authorize button
  const allowBtn = page.locator("button:has-text('Allow'), button:has-text('Authorize'), button:has-text('Izinkan')").first();
  if (await allowBtn.isVisible()) {
    console.log("Found Allow button, clicking...");
    await allowBtn.click();
    await page.waitForTimeout(3000);
  } else {
    console.log("Allow button not automatically found or user needs to log into Cloudflare.");
  }
}

authorizeCloudflareOauth().catch(console.error);
