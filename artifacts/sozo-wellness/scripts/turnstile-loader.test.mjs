import assert from 'node:assert/strict';
import { test } from 'node:test';

let moduleId = 0;
async function setup(t) {
  const scripts = [];
  const timeouts = [];
  const oldWindow = globalThis.window;
  const oldDocument = globalThis.document;
  const window = {
    setTimeout(callback) { timeouts.push(callback); return timeouts.length; },
    clearTimeout() {},
  };
  globalThis.window = window;
  globalThis.document = {
    createElement() {
      return { removed: false, remove() { this.removed = true; } };
    },
    head: { appendChild(script) { scripts.push(script); } },
  };
  t.after(() => {
    if (oldWindow === undefined) delete globalThis.window;
    else globalThis.window = oldWindow;
    if (oldDocument === undefined) delete globalThis.document;
    else globalThis.document = oldDocument;
  });
  const { loadTurnstile } = await import(`../src/lib/turnstile-loader.ts?test=${++moduleId}`);
  // Model the real vendor restriction that the original UI mock did not model.
  const api = {
    ready() { throw new Error('Turnstile error 3857: ready is invalid for async loading'); },
    render() { return 'mock-widget'; },
    remove() {},
  };
  return { loadTurnstile, window, api, scripts, timeouts };
}

test('async script resolves on load without invoking the forbidden ready method', async t => {
  const { loadTurnstile, window, api, scripts } = await setup(t);
  const first = loadTurnstile();
  assert.equal(loadTurnstile(), first);
  assert.equal(scripts.length, 1);
  assert.equal(scripts[0].async, true);
  assert.equal(scripts[0].src, 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit');
  window.turnstile = api;
  scripts[0].onload();
  assert.equal(await first, api);
  assert.equal(await loadTurnstile(), api);
  assert.equal(scripts.length, 1);
});

test('an already loaded vendor API is reused without calling ready', async t => {
  const { loadTurnstile, window, api, scripts } = await setup(t);
  window.turnstile = api;
  assert.equal(await loadTurnstile(), api);
  assert.equal(scripts.length, 0);
});

test('a failed script is removed and a new script can be loaded on retry', async t => {
  const { loadTurnstile, window, api, scripts } = await setup(t);
  const first = loadTurnstile();
  const rejected = assert.rejects(first, /Verification script unavailable/);
  scripts[0].onerror();
  await rejected;
  assert.equal(scripts[0].removed, true);
  const retry = loadTurnstile();
  assert.equal(scripts.length, 2);
  window.turnstile = api;
  scripts[1].onload();
  assert.equal(await retry, api);
});

test('timeouts and missing vendor APIs reject rather than leaving the form waiting forever', async t => {
  const { loadTurnstile, scripts, timeouts } = await setup(t);
  const timedOut = loadTurnstile();
  const rejected = assert.rejects(timedOut, /Verification script unavailable/);
  timeouts[0]();
  await rejected;
  assert.equal(scripts[0].removed, true);
  const missingApi = loadTurnstile();
  const missingRejected = assert.rejects(missingApi, /Verification script unavailable/);
  scripts[1].onload();
  await missingRejected;
  assert.equal(scripts[1].removed, true);
});
