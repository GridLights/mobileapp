#!/usr/bin/env node
import { spawn } from 'node:child_process';
import http from 'node:http';
import { setTimeout as delay } from 'node:timers/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function waitForServer(port, tries = 120, intervalMs = 500) {
  return new Promise(async (resolve, reject) => {
    for (let i = 0; i < tries; i++) {
      try {
        const ok = await new Promise((res) => {
          const req = http.get({ hostname: 'localhost', port, path: '/', timeout: 2000 }, (resp) => {
            resp.resume();
            res(true);
          });
          req.on('error', () => res(false));
          req.on('timeout', () => { req.destroy(); res(false); });
        });
        if (ok) return resolve(true);
      } catch {}
      await delay(intervalMs);
    }
    reject(new Error(`Server did not become ready on port ${port} in time`));
  });
}

async function run() {
  console.log(`[run-settings] starting dev server...`);
  const dev = spawn(process.cwd() + '/node_modules/.bin/quasar', ['dev'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  });

  let chosenPort = null;
  let buffered = '';

  const parsePortFromLine = (line) => {
    // Try to find http://localhost:PORT or 127.0.0.1 / 127.*.*/
    const m = line.match(/https?:\/\/(?:localhost|127(?:\.\d+){0,3}|\d+\.\d+\.\d+\.\d+):(\d+)\//);
    if (m && m[1]) {
      const p = parseInt(m[1], 10);
      if (!isNaN(p)) return p;
    }
    return null;
  };

  const onData = (chunk, isErr = false) => {
    const text = chunk.toString();
    (isErr ? process.stderr : process.stdout).write(text);
    buffered += text;
    const lines = buffered.split(/\r?\n/);
    buffered = lines.pop() || '';
    for (const line of lines) {
      const p = parsePortFromLine(line);
      if (p && !chosenPort) {
        chosenPort = p;
        // no need to remove listeners; keep streaming output
      }
    }
  };

  dev.stdout.on('data', (c) => onData(c, false));
  dev.stderr.on('data', (c) => onData(c, true));

  try {
    // Wait until we detect a port from Quasar output
    const maxWaitMs = 60000;
    const start = Date.now();
    while (!chosenPort && Date.now() - start < maxWaitMs) {
      await delay(200);
    }
    if (!chosenPort) throw new Error('Could not detect dev server port from Quasar output');

    await waitForServer(chosenPort);
    const BASE_URL = `http://localhost:${chosenPort}/#/`;
    console.log(`[run-settings] server is up at ${BASE_URL}`);

    const navigate = spawn(process.execPath, [path.join(__dirname, 'navigate.mjs')], {
      stdio: 'inherit',
      env: { ...process.env, BASE_URL },
    });

    const code = await new Promise((res) => navigate.on('close', res));
    console.log(`[run-settings] navigate exited with code ${code}`);
  } catch (e) {
    console.error('[run-settings] failed:', e.message);
    process.exitCode = 1;
  } finally {
    console.log('[run-settings] shutting down dev server...');
    dev.kill('SIGINT');
  }
}

run();
