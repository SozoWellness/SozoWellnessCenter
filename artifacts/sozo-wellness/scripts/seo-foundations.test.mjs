import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const built = route => readFile(path.join(root, 'dist/public', route, 'index.html'), 'utf8');
function graph(html) {
  const scripts = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 1, 'one authoritative graph per page');
  return JSON.parse(scripts[0][1])['@graph'];
}

test('local business and website identities are accurate and linked', async () => {
  const nodes = graph(await built(''));
  const business = nodes.find(n => n['@type'] === 'HealthAndBeautyBusiness');
  assert.equal(business.address.addressLocality, 'Wildwood');
  assert.equal(business.telephone, '+1-352-802-2248');
  assert.equal(nodes.find(n => n['@type'] === 'WebSite').publisher['@id'], business['@id']);
  for (const key of ['aggregateRating', 'review', 'openingHoursSpecification', 'geo', 'priceRange']) assert.equal(business[key], undefined);
});

test('therapy pages include readable service headings, service and breadcrumb data', async () => {
  for (const slug of ['hyperbaric-oxygen', 'core-restore', 'ozone-therapy', 'rife', 'assessments']) {
    const html = await built(`services/${slug}`);
    const nodes = graph(html);
    const service = nodes.find(n => n['@type'] === 'Service');
    assert.ok(service?.name);
    assert.ok(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1].includes('near The Villages'));
    assert.equal(service.url, `https://sozorootedwellness.com/services/${slug}/`);
    assert.equal(nodes.find(n => n['@type'] === 'BreadcrumbList').itemListElement[0].name, 'Home');
  }
});

test('independent physician and chiropractic pages do not claim SOZO provides their services', async () => {
  for (const route of ['independent-physicians', 'chiropractic-care']) {
    assert.equal(graph(await built(route)).some(n => n['@type'] === 'Service'), false);
  }
});

test('campaign and review drafts stay out of sitemap and service schema; missing pages remain noindex', async () => {
  const sitemap = await readFile(path.join(root, 'dist/public/sitemap.xml'), 'utf8');
  for (const route of ['resources', 'resources/review', 'enter-to-win', 'giveaway-admin']) {
    // Resource drafts are intentionally absent from narrow production releases.
    if (route.startsWith('resources') && !existsSync(path.join(root, 'dist/public', route, 'index.html'))) continue;
    const html = await built(route);
    assert.match(html, /name="robots" content="noindex, follow"/);
    assert.equal(graph(html).some(n => n['@type'] === 'Service'), false);
    assert.ok(!sitemap.includes(`.com/${route}/</loc>`));
  }
  const missing = await readFile(path.join(root, 'dist/public/404.html'), 'utf8');
  assert.match(missing, /name="robots" content="noindex, follow"/);
  assert.doesNotMatch(missing, /application\/ld\+json|rel="canonical"/);
});

test('permanent legacy redirects are specific, do not chain, and target real canonical pages', async () => {
  const file = await readFile(path.join(root, 'public/_redirects'), 'utf8');
  const rules = file.split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('#')).map(s => s.split(/\s+/));
  const sources = new Set(rules.map(([source]) => source));
  assert.equal(sources.size, rules.length);
  assert.ok(rules.some(([from, to]) => from === '/therapies/hyperbaric-oxygen-therapy/' && to === '/services/hyperbaric-oxygen/'));
  for (const [from, to, code, extra] of rules) {
    assert.equal(code, '301');
    assert.equal(extra, undefined);
    assert.ok(!from.includes('*'), 'do not hide unrelated 404s');
    assert.ok(to.endsWith('/'));
    assert.ok(!sources.has(to), 'no redirect chains');
    const html = await built(to.replace(/^\/|\/$/g, ''));
    assert.ok(html.includes(`rel="canonical" href="https://sozorootedwellness.com${to}"`));
  }
});
