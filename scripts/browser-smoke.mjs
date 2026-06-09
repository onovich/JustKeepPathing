import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '..');
const smokeTimeoutMs = Number(process.env.JKP_SMOKE_TIMEOUT_MS || 18000);

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
      }, smokeTimeoutMs);
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
  const userDataDir = await mkdtemp(join(tmpdir(), 'jkp-browser-smoke-'));
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

async function runSmoke() {
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
      const stack = details?.stackTrace?.callFrames
        ?.slice(0, 4)
        ?.map((frame) => `${frame.functionName || '<anonymous>'}@${frame.url}:${frame.lineNumber + 1}:${frame.columnNumber + 1}`)
        ?.join(' <- ');
      const location = details?.url ? `${details.url}:${(details.lineNumber ?? 0) + 1}:${(details.columnNumber ?? 0) + 1}` : '';
      errors.push([
        `Runtime exception: ${details?.exception?.description || details?.text || 'unknown exception'}`,
        location ? `at ${location}` : '',
        stack ? `stack ${stack}` : ''
      ].filter(Boolean).join(' '));
    });
    cdp.on('Runtime.consoleAPICalled', (message) => {
      if (message.params?.type !== 'error') return;
      const text = (message.params.args || [])
        .map((arg) => arg.value || arg.description || '')
        .filter(Boolean)
        .join(' ');
      errors.push(`Console error: ${text || 'unknown console error'}`);
    });
    cdp.on('Log.entryAdded', (message) => {
      const entry = message.params?.entry;
      if (entry?.level === 'error') errors.push(`Log error: ${entry.text}`);
    });

    const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
    await cdp.send('Runtime.enable', {}, sessionId);
    await cdp.send('Page.enable', {}, sessionId);
    await cdp.send('Log.enable', {}, sessionId);

    await cdp.send('Page.navigate', { url }, sessionId);
    await delay(1500);

    const expression = `(${async function browserSmoke() {
      const waitFor = (predicate, timeoutMs = 12000, label = 'app readiness') => new Promise((resolve, reject) => {
        const started = performance.now();
        const tick = () => {
          try {
            if (predicate()) {
              resolve();
              return;
            }
          } catch {}
          if (performance.now() - started > timeoutMs) {
            reject(new Error(`Timed out waiting for ${label}.`));
            return;
          }
          setTimeout(tick, 100);
        };
        tick();
      });

      await waitFor(() => window.gameController && window.engine && window.GameState && document.querySelector('#webgl-canvas'), 12000, 'app readiness');
      await new Promise((resolve) => setTimeout(resolve, 900));

      const overlay = document.getElementById('app-loading-overlay');
      const overlayStyle = overlay ? getComputedStyle(overlay) : null;
      const overlayHidden = !!overlay && (
        overlay.classList.contains('hidden-overlay')
        || overlay.classList.contains('hidden')
        || overlayStyle.pointerEvents === 'none'
        || Number(overlayStyle.opacity) === 0
      );

      const canvas = document.getElementById('webgl-canvas');
      const collectionButton = document.getElementById('btn-collection');
      const collectionModal = document.getElementById('collection-modal');
      const collectionBadge = document.getElementById('collection-count-badge');
      const settingsButton = document.getElementById('btn-settings');
      const settingsPanel = document.getElementById('settings-panel');
      const settingsHint = document.getElementById('settings-strategy-hint');
      const riskSelect = document.getElementById('select-strategy-risk');
      const modelEditorButton = document.getElementById('btn-editor');
      const soundEditorButton = document.getElementById('btn-sound-editor');
      const modelEditorModal = document.getElementById('editor-modal');
      const soundEditorModal = document.getElementById('sound-editor-modal');
      const hudSupplyMode = document.getElementById('ui-supply-mode');
      const hudRelicCard = document.getElementById('ui-relic-card');
      const hudThemePill = document.getElementById('ui-theme-pill');
      const hudSupplyPill = document.getElementById('ui-supply-pill');
      const speedUpgradeButton = document.getElementById('btn-up-speed');

      if (!collectionButton || !collectionModal) throw new Error('Collection controls are missing.');
      collectionButton.click();
      await waitFor(() => !collectionModal.classList.contains('hidden'), 4000, 'collection modal');
      document.getElementById('btn-collection-close')?.click();

      if (!settingsButton || !settingsPanel || !settingsHint || !riskSelect) throw new Error('Settings controls are missing.');
      const result = {
        phase: window.GameState.phase,
        level: window.GameState.level,
        scoreText: document.getElementById('ui-score')?.innerText || '',
        collectionBadge: collectionBadge?.innerText || '',
        collectionSummaryCards: document.querySelectorAll('#collection-summary > *').length,
        eventCards: document.querySelectorAll('#collection-event-list article').length,
        trialCards: document.querySelectorAll('#collection-trial-list article').length,
        relicCards: document.querySelectorAll('#collection-relic-list article').length,
        bossCards: document.querySelectorAll('#collection-boss-list article').length,
        settingsPanelHidden: settingsPanel.classList.contains('hidden'),
        settingsRiskValue: riskSelect.value,
        settingsHintText: settingsHint.innerText || '',
        hasModelEditorButton: !!modelEditorButton,
        hasSoundEditorButton: !!soundEditorButton,
        modelEditorClosed: modelEditorModal?.classList.contains('hidden') || false,
        soundEditorClosed: soundEditorModal?.classList.contains('hidden') || false,
        hudSupplyModeText: hudSupplyMode?.innerText || '',
        hasHudRelicCard: !!hudRelicCard,
        hasHudThemePill: !!hudThemePill,
        hasHudSupplyPill: !!hudSupplyPill,
        hasSpeedUpgradeButton: !!speedUpgradeButton,
        overlayHidden,
        canvasWidth: canvas?.clientWidth || 0,
        canvasHeight: canvas?.clientHeight || 0,
        hasController: !!window.gameController,
        hasEngine: !!window.engine
      };

      if (!result.overlayHidden) throw new Error('Loading overlay is visible after startup.');
      if (result.canvasWidth <= 0 || result.canvasHeight <= 0) throw new Error('Canvas has no visible size.');
      if (result.collectionSummaryCards < 4) throw new Error('Collection summary cards did not render.');
      if (!result.collectionBadge.includes('/')) throw new Error('Collection badge did not render progress.');
      if (!result.settingsPanelHidden) throw new Error('Settings panel should start hidden.');
      if (result.settingsHintText.length < 8) throw new Error('Settings strategy hint did not render.');
      if (!result.settingsRiskValue) throw new Error('Settings risk select did not sync.');
      if (!result.hasModelEditorButton || !result.hasSoundEditorButton) throw new Error('Header editor buttons did not render.');
      if (!result.modelEditorClosed || !result.soundEditorClosed) throw new Error('Editor modals should start closed.');
      if (!result.hudSupplyModeText) throw new Error('HUD supply card did not render.');
      if (!result.hasHudRelicCard) throw new Error('HUD relic card did not render.');
      if (!result.hasHudThemePill || !result.hasHudSupplyPill) throw new Error('HUD status pills did not render.');
      if (!result.hasSpeedUpgradeButton) throw new Error('HUD upgrade strip did not render.');
      return result;
    }})()`;

    const evaluation = await cdp.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true
    }, sessionId);

    if (evaluation.exceptionDetails) {
      throw new Error(evaluation.exceptionDetails.exception?.description || evaluation.exceptionDetails.text);
    }
    if (errors.length > 0) {
      throw new Error(`Browser smoke saw page errors:\n${errors.join('\n')}`);
    }

    const result = evaluation.result?.value || {};
    console.log(JSON.stringify({
      ok: true,
      url,
      browser: browserPath,
      result
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

runSmoke().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
