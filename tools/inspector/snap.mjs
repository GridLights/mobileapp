#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUT_DIR = path.join(__dirname, 'out');
fs.mkdirSync(OUT_DIR, { recursive: true });

const DEFAULT_URL = process.env.INSPECTOR_URL || 'http://localhost:9001/#/settings';
const WAIT_MS = Number(process.env.INSPECTOR_WAIT || 1200);

const SELECTORS = (() => {
  if (process.env.INSPECTOR_SELECTORS) {
    try {
      const raw = process.env.INSPECTOR_SELECTORS.trim();
      return raw.startsWith('[')
        ? JSON.parse(raw)
        : raw.split(',').map(s => s.trim()).filter(Boolean);
    } catch (e) {
      console.warn('INSPECTOR_SELECTORS parse failed, using defaults:', e);
    }
  }
  return [
    '.q-page',
    '.header-container',
    '.header-title',
    '.content-area-settings',
    '.settings-section',
    '.section-header',
    '.wled-device-item',
    '.network-item',
    '.device-actions',
    '.device-info',
  ];
})();

const STYLE_PROPS = [
  'color',
  'background-color',
  'font-size',
  'font-weight',
  'line-height',
  'display',
  'position',
  'flex',
  'flex-direction',
  'align-items',
  'justify-content',
  'gap',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'border', 'border-radius', 'box-shadow',
  'width', 'height', 'max-width',
];

function makeKey(r) {
  return `${r.selector}#${r.index}`;
}

function diffSnapshots(prev, curr) {
  if (!prev || !prev.results) return { added: curr.count, removed: 0, changed: [] };
  const p = new Map(prev.results.map(r => [makeKey(r), r]));
  const c = new Map(curr.results.map(r => [makeKey(r), r]));
  const changed = [];
  for (const [key, now] of c) {
    const was = p.get(key);
    if (!was) continue;
    const propChanges = [];
    for (const k of STYLE_PROPS) {
      const a = (was.styles?.[k] ?? '').trim();
      const b = (now.styles?.[k] ?? '').trim();
      if (a !== b) propChanges.push({ prop: k, from: a, to: b });
    }
    for (const vk of Object.keys(now.cssVars || {})) {
      const a = (was.cssVars?.[vk] ?? '').trim();
      const b = (now.cssVars?.[vk] ?? '').trim();
      if (a !== b) propChanges.push({ prop: vk, from: a, to: b });
    }
    if (propChanges.length) changed.push({ key, selector: now.selector, index: now.index, rect: now.rect, props: propChanges.slice(0, 10) });
  }
  const added = [...c.keys()].filter(k => !p.has(k)).length;
  const removed = [...p.keys()].filter(k => !c.has(k)).length;
  return { added, removed, changed };
}

async function run() {
  const launchArgs = [];
  if (process.platform === 'darwin') {
    launchArgs.push('--use-mock-keychain', '--no-first-run', '--no-default-browser-check');
  }
  const browser = await chromium.launch({ headless: true, args: launchArgs });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  try {
    console.log(`[inspector] navigating to ${DEFAULT_URL}`);
    const resp = await page.goto(DEFAULT_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    if (!resp) console.warn('[inspector] No initial response (maybe cached SPA).');

    await page.waitForSelector('.header-title', { timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(WAIT_MS);

    if (!DEFAULT_URL.includes('/#/settings') && !DEFAULT_URL.includes('#/settings')) {
      await page.evaluate(() => { try { window.location.hash = '#/settings'; } catch (e) {} });
      await page.waitForTimeout(600);
    }

    const screenshotPath = path.join(OUT_DIR, 'screenshot.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const domHtml = await page.content();
    fs.writeFileSync(path.join(OUT_DIR, 'dom.html'), domHtml, 'utf8');

    const audit = await page.evaluate(({ selectors, STYLE_PROPS }) => {
      const results = [];
      const vp = { width: window.innerWidth, height: window.innerHeight };
      for (const sel of selectors) {
        const nodes = Array.from(document.querySelectorAll(sel)).slice(0, 6);
        nodes.forEach((el, idx) => {
          const cs = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          const vars = {
            '--controls-bg-color': cs.getPropertyValue('--controls-bg-color'),
            '--controls-label-color': cs.getPropertyValue('--controls-label-color'),
            '--controls-icon-color': cs.getPropertyValue('--controls-icon-color'),
            '--controls-button--color': cs.getPropertyValue('--controls-button--color'),
            '--controls-input-field-bg-color': cs.getPropertyValue('--controls-input-field-bg-color'),
            '--controls-dropdown-menu--color': cs.getPropertyValue('--controls-dropdown-menu--color'),
          };
          results.push({
            selector: sel,
            index: idx,
            tag: el.tagName.toLowerCase(),
            classes: el.className,
            textSample: (el.textContent || '').trim().slice(0, 80),
            rect: {
              x: Math.round(rect.x), y: Math.round(rect.y),
              width: Math.round(rect.width), height: Math.round(rect.height)
            },
            styles: STYLE_PROPS.reduce((acc, p) => { acc[p] = cs.getPropertyValue(p); return acc; }, {}),
            cssVars: vars,
          });
        });
      }
      return { viewport: vp, count: results.length, results };
    }, { selectors: SELECTORS, STYLE_PROPS });

    const stylesPath = path.join(OUT_DIR, 'styles.json');

    // Diff with previous if available
    const prevPath = path.join(OUT_DIR, 'styles.prev.json');
    let prev = null;
    if (fs.existsSync(stylesPath)) {
      try { prev = JSON.parse(fs.readFileSync(stylesPath, 'utf8')); } catch {}
      // rotate previous
      fs.copyFileSync(stylesPath, prevPath);
    }

    fs.writeFileSync(stylesPath, JSON.stringify(audit, null, 2), 'utf8');

    const diffs = diffSnapshots(prev, audit);
    const summary = {
      url: DEFAULT_URL,
      elementsCaptured: audit.count,
      added: diffs.added,
      removed: diffs.removed,
      changedCount: diffs.changed.length,
      firstChanges: diffs.changed.slice(0, 5),
      firstItems: audit.results.slice(0, 5).map(r => ({ selector: r.selector, rect: r.rect, text: r.textSample }))
    };

    fs.writeFileSync(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2), 'utf8');
    if (diffs.changed.length || diffs.added || diffs.removed) {
      const lines = [];
      lines.push(`Added: ${diffs.added}, Removed: ${diffs.removed}, Changed nodes: ${diffs.changed.length}`);
      for (const ch of diffs.changed.slice(0, 20)) {
        lines.push(`- ${ch.selector}[${ch.index}] @ ${JSON.stringify(ch.rect)}:`);
        for (const p of ch.props) lines.push(`    ${p.prop}: '${p.from}' -> '${p.to}'`);
      }
      fs.writeFileSync(path.join(OUT_DIR, 'diff.txt'), lines.join('\n'), 'utf8');
    }

    console.log('[inspector] wrote:', {
      screenshot: path.relative(process.cwd(), screenshotPath),
      dom: path.relative(process.cwd(), path.join(OUT_DIR, 'dom.html')),
      styles: path.relative(process.cwd(), stylesPath),
      summary: path.relative(process.cwd(), path.join(OUT_DIR, 'summary.json')),
      diff: path.relative(process.cwd(), path.join(OUT_DIR, 'diff.txt')),
    });
  } catch (e) {
    console.error('[inspector] failed:', e.message);
    process.exitCode = 1;
  } finally {
    await page.close().catch(() => {});
    await ctx.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}

run();
