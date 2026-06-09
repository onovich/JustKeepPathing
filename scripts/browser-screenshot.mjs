import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '..');
const screenshotTimeoutMs = Number(process.env.JKP_SCREENSHOT_TIMEOUT_MS || 18000);
const viewportWidth = Number(process.env.JKP_SCREENSHOT_WIDTH || 1366);
const viewportHeight = Number(process.env.JKP_SCREENSHOT_HEIGHT || 768);
const outputPath = resolve(repoRoot, process.env.JKP_SCREENSHOT_OUTPUT || 'artifacts/screenshots/latest.png');

function delay(ms) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}

function onceReady(processHandle, matcher, timeoutMs, label) {
  return new Promise((resolveReady, rejectReady) => {
    let output = '';
    const timer = setTimeout(() => {
      cleanup();
      rejectReady(new Error(`Timed out waiting for ${label}.\n${output}`));
    }, timeoutMs);
    const onData = (chunk) => {
      output += chunk.toString();
      const match = matcher(output);
      if (match) {
        cleanup();
        resolveReady(match);
      }
    };
    const onExit = (code) => {
      cleanup();
      rejectReady(new Error(`${label} exited before becoming ready with code ${code}.\n${output}`));
    };
    const cleanup = () => {
      clearTimeout(timer);
      processHandle.stdout?.off('data', onData);
      processHandle.stderr?.off('data', onData);
      processHandle.off('exit', onExit);
    };

    processHandle.stdout?.on('data', onData);
    processHandle.stderr?.on('data', onData);
    processHandle.once('exit', onExit);
  });
}

function findBrowserExecutable() {
  const envPath = process.env.JKP_BROWSER_PATH || process.env.BROWSER_PATH || process.env.CHROME_PATH;
  const candidates = [
    envPath,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser'
  ].filter(Boolean);
  return candidates.find((candidate) => existsSync(candidate)) || null;
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
  }

  async connect() {
    this.socket = new WebSocket(this.wsUrl);
    this.socket.addEventListener('message', (event) => this.handleMessage(event.data));
    await new Promise((resolveConnect, rejectConnect) => {
      const timer = setTimeout(() => rejectConnect(new Error('Timed out connecting to browser CDP.')), 8000);
      this.socket.addEventListener('open', () => {
        clearTimeout(timer);
        resolveConnect();
      }, { once: true });
      this.socket.addEventListener('error', () => {
        clearTimeout(timer);
        rejectConnect(new Error('Browser CDP WebSocket failed to open.'));
      }, { once: true });
    });
  }

  close() {
    try {
      this.socket?.close();
    } catch {}
  }

  on(method, listener) {
    if (!this.listeners.has(method)) this.listeners.set(method, new Set());
    this.listeners.get(method).add(listener);
  }

  handleMessage(raw) {
    const message = JSON.parse(raw);
    if (message.id && this.pending.has(message.id)) {
      const { resolveCommand, rejectCommand } = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) rejectCommand(new Error(message.error.message || JSON.stringify(message.error)));
      else resolveCommand(message.result || {});
      return;
    }
    if (message.method && this.listeners.has(message.method)) {
      for (const listener of this.listeners.get(message.method)) {
        listener(message);
      }
    }
  }

  send(method, params = {}, sessionId = null) {
    const id = this.nextId++;
    const payload = sessionId ? { id, method, params, sessionId } : { id, method, params };
    this.socket.send(JSON.stringify(payload));
    return new Promise((resolveCommand, rejectCommand) => {
      this.pending.set(id, { resolveCommand, rejectCommand });
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          rejectCommand(new Error(`CDP command timed out: ${method}`));
        }
      }, screenshotTimeoutMs);
    });
  }
}

async function startServer() {
  const server = spawn(process.execPath, ['scripts/local-static-server.mjs', '--root=.', '--port=0', '--host=127.0.0.1'], {
    cwd: repoRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true
  });
  const url = await onceReady(
    server,
    (output) => output.match(/Local URL:\s*(http:\/\/127\.0\.0\.1:\d+\/)/)?.[1],
    8000,
    'local static server'
  );
  return { server, url };
}

async function startBrowser(browserPath) {
  const userDataDir = await mkdtemp(join(tmpdir(), 'jkp-browser-screenshot-'));
  const browser = spawn(browserPath, [
    '--headless=new',
    '--remote-debugging-port=0',
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-extensions',
    '--disable-gpu',
    'about:blank'
  ], {
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true
  });
  const wsUrl = await onceReady(
    browser,
    (output) => output.match(/DevTools listening on (ws:\/\/[^\s]+)/)?.[1],
    10000,
    'headless browser'
  );
  return { browser, userDataDir, wsUrl };
}

async function runScreenshot() {
  const browserPath = findBrowserExecutable();
  if (!browserPath) {
    throw new Error('No Chrome-compatible browser found. Set JKP_BROWSER_PATH to a Chrome or Edge executable.');
  }

  const { server, url } = await startServer();
  let browser = null;
  let userDataDir = null;
  let cdp = null;

  try {
    const browserStart = await startBrowser(browserPath);
    browser = browserStart.browser;
    userDataDir = browserStart.userDataDir;
    cdp = new CdpClient(browserStart.wsUrl);
    await cdp.connect();

    const errors = [];
    cdp.on('Runtime.exceptionThrown', (message) => {
      const details = message.params?.exceptionDetails;
      errors.push(details?.exception?.description || details?.text || 'runtime exception');
    });
    cdp.on('Runtime.consoleAPICalled', (message) => {
      if (message.params?.type === 'error') errors.push('console error');
    });

    const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
    await cdp.send('Runtime.enable', {}, sessionId);
    await cdp.send('Page.enable', {}, sessionId);
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: viewportWidth,
      height: viewportHeight,
      deviceScaleFactor: 1,
      mobile: false
    }, sessionId);
    await cdp.send('Page.navigate', { url }, sessionId);
    await delay(1500);

    const readiness = await cdp.send('Runtime.evaluate', {
      expression: `(${async function waitForApp() {
        const waitFor = (predicate, timeoutMs = 12000) => new Promise((resolve, reject) => {
          const started = performance.now();
          const tick = () => {
            try {
              if (predicate()) {
                resolve();
                return;
              }
            } catch {}
            if (performance.now() - started > timeoutMs) {
              reject(new Error('Timed out waiting for app readiness.'));
              return;
            }
            setTimeout(tick, 100);
          };
          tick();
        });

        await waitFor(() => window.gameController && window.engine && window.GameState && document.querySelector('#webgl-canvas'));
        await waitFor(() => window.GameState.phase !== 'GENERATING');
        await new Promise((resolve) => setTimeout(resolve, 900));
        const canvas = document.getElementById('webgl-canvas');
        return {
          phase: window.GameState.phase,
          level: window.GameState.level,
          canvasWidth: canvas?.clientWidth || 0,
          canvasHeight: canvas?.clientHeight || 0,
          overlayHidden: document.getElementById('app-loading-overlay')?.classList.contains('hidden-overlay') || false
        };
      }})()`,
      awaitPromise: true,
      returnByValue: true
    }, sessionId);

    if (readiness.exceptionDetails) {
      throw new Error(readiness.exceptionDetails.exception?.description || readiness.exceptionDetails.text);
    }
    if (errors.length > 0) {
      throw new Error(`Browser screenshot saw page errors:\n${errors.join('\n')}`);
    }

    mkdirSync(dirname(outputPath), { recursive: true });
    const screenshot = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
      fromSurface: true
    }, sessionId);
    writeFileSync(outputPath, Buffer.from(screenshot.data, 'base64'));

    console.log(JSON.stringify({
      ok: true,
      url,
      browser: browserPath,
      outputPath,
      viewport: { width: viewportWidth, height: viewportHeight },
      result: readiness.result?.value || {}
    }, null, 2));
  } finally {
    cdp?.close();
    if (browser && !browser.killed) browser.kill();
    if (server && !server.killed) server.kill();
    if (userDataDir) {
      await delay(250);
      await rm(userDataDir, { recursive: true, force: true });
    }
  }
}

runScreenshot().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
