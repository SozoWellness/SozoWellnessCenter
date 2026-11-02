import assert from 'node:assert/strict';
import { cp, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { checkSearchPages } from './check-search-pages.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// The source sitemap is maintained alongside the route declarations. Let the
// checker verify parity rather than keeping a second, stale page-count constant.
const expectedPageCount = [...(await readFile(path.join(root, 'public/sitemap.xml'), 'utf8')).matchAll(/<loc>/g)].length;
assert.ok(expectedPageCount > 0, 'The source sitemap must contain public pages');

async function fixture(t) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'sozo-search-pages-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const output = path.join(dir, 'dist/public');
  const app = path.join(dir, 'App.tsx');
  const toml = path.join(dir, 'artifact.toml');
  const sourceSitemap = path.join(dir, 'public/sitemap.xml');
  await mkdir(path.dirname(sourceSitemap), { recursive: true });
  await Promise.all([
    cp(path.join(root, 'dist/public'), output, { recursive: true }),
    cp(path.join(root, 'src/App.tsx'), app),
    cp(path.join(root, '.replit-artifact/artifact.toml'), toml),
    cp(path.join(root, 'public/sitemap.xml'), sourceSitemap),
  ]);
  return { app, output, toml, sourceSitemap };
}

async function change(file, before, after) {
  const original = await readFile(file, 'utf8');
  assert.ok(original.includes(before), `Fixture did not contain ${before}`);
  await writeFile(file, original.replace(before, after));
}

async function addLink(file, href) {
  await change(file, '<main id="main-content">', `<main id="main-content"><a href="${href}">Test link</a>`);
}

test('accepts the complete generated site', async t => {
  assert.equal(await checkSearchPages(await fixture(t)), expectedPageCount);
});

test('publishes the approved policy with original privacy contacts and no review notices', async t => {
  const paths = await fixture(t);
  const policy = await readFile(path.join(paths.output, 'privacy-policy/index.html'), 'utf8');
  for (const text of [
    '<title>Privacy Policy | SOZO Wellness Center</title>',
    'dateTime="2026-10-06"', 'October 6, 2026',
    '7330 Powell Road, Wildwood, FL 34785', '352-488-9200',
    'mailto:info@sozorootedwellness.com',
    'Meta Pixel is not currently installed', 'We do not sell or rent your personal information',
    'Automated enquiry routing and email subscriptions are not currently enabled',
  ]) assert.ok(policy.includes(text), `Privacy policy missing ${text}`);
  assert.doesNotMatch(policy, /For clinic review|Review draft|Before this policy goes live|awaiting final approval|privacy-policy-draft/);
  const home = await readFile(path.join(paths.output, 'index.html'), 'utf8');
  assert.ok(/<a\b(?=[^>]*\bhref="\/privacy-policy")(?=[^>]*\bdata-testid="link-footer-privacy")[^>]*>Privacy Policy<\/a>/.test(home),
    'The public footer must link to the privacy policy');
  assert.ok(home.includes('352-802-2248'), 'General clinic phone must remain separate');
});

test('rejects a missing production privacy-policy rewrite', async t => {
  const paths = await fixture(t);
  await change(paths.toml, '[[services.production.rewrites]]\nfrom = "/privacy-policy"\nto = "/privacy-policy/index.html"', '');
  await assert.rejects(checkSearchPages(paths), /exact production rewrites: missing \[\/privacy-policy\]/);
});

test('rejects broken local page links, including links with queries or fragments', async t => {
  const paths = await fixture(t);
  await addLink(path.join(paths.output, 'services/index.html'), '/services/missing/?source=nav#details');
  await assert.rejects(checkSearchPages(paths), /\/services: broken internal page link "\/services\/missing\/\?source=nav#details" \(target \/services\/missing\)/);
});

test('resolves relative links from the published URL without an assumed trailing slash', async t => {
  const paths = await fixture(t);
  const file = path.join(paths.output, 'services/index.html');
  await addLink(file, 'assessments');
  await assert.rejects(checkSearchPages(paths), /\/services: broken internal page link "assessments" \(target \/assessments\)/);

  await change(file, 'href="assessments"', 'href="services/assessments"');
  assert.equal(await checkSearchPages(paths), expectedPageCount);
});

test('accepts valid relative pages and ignores fragments, assets and external destinations', async t => {
  const paths = await fixture(t);
  const file = path.join(paths.output, 'services/index.html');
  for (const href of ['../about/#team', '#details', '?view=all', '/images/photo.jpg', '/documents/guide.pdf',
    'https://example.com/elsewhere', '//example.com/elsewhere', 'mailto:hello@example.com']) {
    await addLink(file, href);
  }
  assert.equal(await checkSearchPages(paths), expectedPageCount);
});

test('rejects a newly declared route missing from prerender and sitemap', async t => {
  const paths = await fixture(t);
  await change(paths.app, '<Route component={NotFound}/>', '<Route path="/services/new" component={Blog}/><Route component={NotFound}/>');
  await assert.rejects(checkSearchPages(paths), /sitemap\.xml: missing \[https:\/\/sozorootedwellness\.com\/services\/new\]/);
});

test('rejects outbound clinic-site links even when their path is a valid local route', async t => {
  for (const href of [
    'https://sozorootedwellness.com/about-sozo-wellness-center-the-villages-florida/testimonials/',
    'https://sozorootedwellness.com/testimonials',
    '//www.sozorootedwellness.com/team/',
    'http://sozowellness.com/',
  ]) {
    const paths = await fixture(t);
    await addLink(path.join(paths.output, 'testimonials/index.html'), href);
    await assert.rejects(checkSearchPages(paths), /outbound clinic-site link.*must use a local page instead/);
  }
});

test('rejects a missing or home-directed exact rewrite', async t => {
  const paths = await fixture(t);
  await change(paths.toml, 'to = "/services/rife/index.html"', 'to = "/index.html"');
  await assert.rejects(checkSearchPages(paths), /rewrite must target its own prerendered HTML/);
});

test('rejects a wildcard fallback that makes unknown URLs serve a page with HTTP 200', async t => {
  const paths = await fixture(t);
  const config = await readFile(paths.toml, 'utf8');
  await writeFile(paths.toml, config.replace('[services.env]', '[[services.production.rewrites]]\nfrom = "/*"\nto = "/index.html"\n\n[services.env]'));
  await assert.rejects(checkSearchPages(paths), /exact production rewrites:.*unexpected \[\/\*\]/);
});

test('rejects missing or indexable not-found output', async t => {
  const paths = await fixture(t);
  const file = path.join(paths.output, '404.html');
  await change(file, 'content="noindex, follow"', 'content="index, follow"');
  await assert.rejects(checkSearchPages(paths), /404.html: must be noindex/);
  await rm(file);
  await assert.rejects(checkSearchPages(paths), /ENOENT/);
});

test('rejects a route serving the home page instead of unique content', async t => {
  const paths = await fixture(t);
  await cp(path.join(paths.output, 'index.html'), path.join(paths.output, 'services/rife/index.html'));
  await assert.rejects(checkSearchPages(paths), /incorrect canonical URL|duplicate title|identical to another page/);
});

test('rejects missing main content and duplicate metadata', async t => {
  const paths = await fixture(t);
  const file = path.join(paths.output, 'services/rife/index.html');
  await change(file, '<main id="main-content">', '<div id="main-content">');
  await assert.rejects(checkSearchPages(paths), /expected exactly one main element/);

  const original = await readFile(path.join(paths.output, 'services/assessments/index.html'), 'utf8');
  const title = original.match(/<title>(.*?)<\/title>/)[1];
  const rife = await readFile(file, 'utf8');
  await writeFile(file, rife.replace(/<title>.*?<\/title>/, `<title>${title}</title>`).replace('<div id="main-content">', '<main id="main-content">'));
  await assert.rejects(checkSearchPages(paths), /duplicate title/);
});

test('rejects sitemap drift and wrong social URL', async t => {
  const paths = await fixture(t);
  await change(paths.sourceSitemap, '<loc>https://sozorootedwellness.com/blog</loc>', '<loc>https://sozorootedwellness.com/other</loc>');
  await assert.rejects(checkSearchPages(paths), /public\/sitemap\.xml: missing/);
  await cp(path.join(root, 'public/sitemap.xml'), paths.sourceSitemap);
  await change(path.join(paths.output, 'services/rife/index.html'),
    'property="og:url" content="https://sozorootedwellness.com/services/rife"',
    'property="og:url" content="https://sozorootedwellness.com/"');
  await assert.rejects(checkSearchPages(paths), /incorrect og:url/);
});