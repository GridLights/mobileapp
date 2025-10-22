#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUT_DIR = path.join(__dirname, 'out', 'settings');
fs.mkdirSync(OUT_DIR, { recursive: true });

const BASE_URL = process.env.BASE_URL || 'http://localhost:9001/#/';
const START_URL = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;

function nowTs() { return new Date().toISOString().replace(/[:.]/g, '-'); }

async function run() {
  const launchArgs = [];
  if (process.platform === 'darwin') {
    launchArgs.push('--use-mock-keychain', '--no-first-run', '--no-default-browser-check');
  }
  const browser = await chromium.launch({ headless: true, args: launchArgs });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const events = { console: [], pageErrors: [], failedRequests: [], badResponses: [] };
  page.on('console', (msg) => {
    events.console.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', (err) => {
    events.pageErrors.push({ message: err.message, stack: err.stack });
  });
  page.on('requestfailed', (req) => {
    events.failedRequests.push({ url: req.url(), method: req.method(), failure: req.failure() });
  });
  page.on('response', (res) => {
    const status = res.status();
    if (status >= 400) events.badResponses.push({ url: res.url(), status });
  });

  try {
    console.log(`[navigate] opening ${START_URL}`);
    await page.goto(START_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Wait for the Index header and gear to appear
    await page.waitForSelector('.header-title', { timeout: 20000 });

    // Attempt to click settings using multiple strategies
    const clickAttempts = [
      async () => page.locator('.header-icon.right-icon').first().click({ timeout: 3000 }),
      async () => page.getByAltText('Settings').first().click({ timeout: 3000 }),
      async () => page.locator('img[alt="Settings"]').first().click({ timeout: 3000 }),
    ];

    let clicked = false;
    for (const attempt of clickAttempts) {
      try { await attempt(); clicked = true; break; } catch { /* try next */ }
    }
    if (!clicked) throw new Error('Could not find Settings gear to click');

    // Wait for Settings page to load (header with text or content class)
    await page.waitForSelector('.header-title:has-text("SETTINGS"), .content-area-settings', { timeout: 20000 });

    // Small settle
    await page.waitForTimeout(400);

    // Capture artifacts
    const ts = nowTs();
    const screenshotPath = path.join(OUT_DIR, `settings-${ts}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    fs.writeFileSync(path.join(OUT_DIR, `dom-${ts}.html`), await page.content(), 'utf8');
    fs.writeFileSync(path.join(OUT_DIR, `events-${ts}.json`), JSON.stringify(events, null, 2), 'utf8');

    const summary = {
      url: START_URL,
      screenshot: path.relative(process.cwd(), screenshotPath),
      consoleErrors: events.console.filter(e => e.type === 'error').length,
      pageErrors: events.pageErrors.length,
      failedRequests: events.failedRequests.length,
      badResponses: events.badResponses.length,
    };
    fs.writeFileSync(path.join(OUT_DIR, `summary-${ts}.json`), JSON.stringify(summary, null, 2), 'utf8');

    console.log('[navigate] summary:', summary);
    if (summary.pageErrors || summary.failedRequests || summary.badResponses) {
      process.exitCode = 2; // indicate issues found
    }
  } catch (e) {
    console.error('[navigate] failed:', e.message);
    // Dump last-known events for debugging
    fs.writeFileSync(path.join(OUT_DIR, `events-error-${nowTs()}.json`), JSON.stringify(events, null, 2), 'utf8');
    process.exitCode = 1;
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}

run();

