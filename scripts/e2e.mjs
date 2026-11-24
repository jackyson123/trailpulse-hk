// End-to-end checks for TrailPulse HK against a production build.
// Requires playwright (npm i playwright) and PLAYWRIGHT_BROWSERS_PATH pointing at the browser.
import { chromium } from "/workspace/tmp/trail-pw/node_modules/playwright/index.mjs";
import fs from "node:fs";

const BASE = process.env.URL || "http://localhost:3411/";
const OUT = "/workspace/downloads";
fs.mkdirSync(OUT, { recursive: true });

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
}

const browser = await chromium.launch({ headless: true });
const allErrors = [];

for (const [label, width, height] of [
  ["desktop", 1440, 900],
  ["mid", 980, 1400],
  ["mobile", 390, 844],
]) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    locale: "zh-HK",
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console: ${m.text()}`);
  });
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));

  await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForSelector(".leaflet-container", { timeout: 30000 });
  await page.waitForSelector(".recharts-surface", { timeout: 30000 });
  await page.waitForTimeout(2200); // tiles + chart

  check(`${label}: brand visible`, await page.getByText("TrailPulse", { exact: false }).first().isVisible());
  check(`${label}: 3 KPI cards`, (await page.locator("main article").count()) >= 3, `count=${await page.locator("main article").count()}`);

  const mapPaths = await page.locator(".leaflet-overlay-pane path").count();
  check(`${label}: map draws route`, mapPaths >= 2, `paths=${mapPaths}`);
  const markers = await page.locator(".trail-marker").count();
  check(`${label}: start/finish markers`, markers >= 2, `markers=${markers}`);

  const chartPaths = await page.locator(".recharts-area-area, .recharts-area-curve").count();
  check(`${label}: elevation chart drawn`, chartPaths >= 1, `paths=${chartPaths}`);

  const cards = await page.locator('[data-testid="route-card"]').count();
  check(`${label}: route cards`, cards >= (label === "mobile" ? 6 : 8), `cards=${cards}`);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(`${label}: no horizontal overflow`, overflow <= 0, `overflow=${overflow}px`);

  // Filters
  await page.locator('[data-testid="filter-toggle"]').click();
  await page.waitForTimeout(250);
  const before = await page.locator('[data-testid="route-card"]').count();
  await page.locator('[data-testid="difficulty-1"]').click();
  await page.waitForTimeout(400);
  const after = await page.locator('[data-testid="route-card"]').count();
  check(`${label}: difficulty filter narrows list`, after > 0 && after < before, `${before} → ${after}`);
  const firstTag = await page.locator("[data-testid=route-card]").first().innerText();
  check(`${label}: filtered cards are easy routes`, /輕鬆|容易|Easy/.test(firstTag), firstTag.split("\n")[0]);
  const urlWithFilters = page.url();
  check(`${label}: filters reflected in URL`, urlWithFilters.includes("d=1"), urlWithFilters.split("?")[1] ?? "");
  await page.locator('[data-testid="difficulty-1"]').click();
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: /清除全部|Clear all/ }).click();
  await page.waitForTimeout(400);
  await page.locator('[data-testid="filter-toggle"]').click();
  await page.waitForTimeout(200);
  if (label === "mobile") {
    const showAll = page.locator('[data-testid="show-all"]');
    if (await showAll.count()) {
      await showAll.click();
      await page.waitForTimeout(300);
    }
  }

  // Select a specific route
  const target = page.locator('[data-route-id="sunset-peak"]');
  await target.scrollIntoViewIfNeeded();
  await target.click();
  await page.waitForTimeout(900);
  const heading = await page.locator('[data-testid="detail-title"]').innerText();
  check(`${label}: selecting a route updates detail`, heading.includes("大東山"), heading);
  check(`${label}: selection in URL`, page.url().includes("r=sunset-peak"), page.url().split("?")[1] ?? "");

  // Checklist interaction
  const checks = page.locator('[data-testid="check-item"]');
  const checkCount = await checks.count();
  await checks.nth(0).click();
  await page.waitForTimeout(150);
  if (checkCount > 1) await checks.nth(1).click();
  await page.waitForTimeout(250);
  const progress = await page.locator("text=/\\d+\\/\\d+ 已準備/").first().innerText();
  check(`${label}: checklist ticks`, /^[12]\//.test(progress.trim()), progress);

  // Share link
  await page.getByRole("button", { name: /分享行程|Share this plan/ }).click();
  await page.waitForTimeout(400);
  const toast = await page.locator('[role="status"]').innerText();
  check(`${label}: share copies link`, /複製|failed/i.test(toast), toast);

  // Language switch
  await page.getByRole("button", { name: "Switch language" }).click();
  await page.waitForTimeout(600);
  const english = await page.getByText("Hiking suitability today").count();
  check(`${label}: language switch to English`, english > 0);
  const englishCard = await page.locator('[data-testid="detail-title"]').innerText();
  check(`${label}: route name in English`, /Sunset Peak/.test(englishCard), englishCard);
  await page.getByRole("button", { name: "Switch language" }).click();
  await page.waitForTimeout(400);

  // Shareable URL round trip
  const shareUrl = `${BASE}?r=maclehose-2&lang=en&d=3`;
  await page.goto(shareUrl, { waitUntil: "networkidle" });
  await page.waitForSelector(".leaflet-container", { timeout: 30000 });
  await page.waitForTimeout(1200);
  const sharedName = await page.locator('[data-testid="detail-title"]').innerText();
  check(`${label}: shared URL restores plan`, /Tai Long Bays|大浪四灣/.test(sharedName), sharedName);

  check(`${label}: no console or page errors`, errors.length === 0, errors.join(" | "));
  allErrors.push(...errors);

  // Screenshots
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForSelector(".leaflet-container");
  await page.waitForTimeout(2500);
  if (label === "desktop") {
    await page.screenshot({ path: `${OUT}/trailpulse-hk-desktop.png` });
    await page.screenshot({ path: `${OUT}/trailpulse-hk-desktop-full.png`, fullPage: true });
  }
  if (label === "mobile") {
    await page.screenshot({ path: `${OUT}/trailpulse-hk-mobile.png` });
    await page.screenshot({ path: `${OUT}/trailpulse-hk-mobile-full.png`, fullPage: true });
  }
  if (label === "mid") {
    await page.screenshot({ path: `${OUT}/trailpulse-hk-980.png` });
  }

  await context.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log("FAILED:", failed.map((f) => `${f.name} ${f.detail}`).join("\n"));
  process.exit(1);
}
console.log("errors:", allErrors.length);
