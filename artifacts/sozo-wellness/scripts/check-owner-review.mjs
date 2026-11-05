// Read-only site/resource audit. No HTTP calls, API submissions or account access.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir, stat, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workspace = path.resolve(web, '../..');
const output = path.join(web, 'dist/public');
const reports = path.join(workspace, 'generated-artifacts/owner-review');
const posix = value => value.split(path.sep).join('/');
async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const groups = await Promise.all(entries.map(entry => entry.isDirectory()
    ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)]));
  return groups.flat().sort();
}
const decode = value => value.replace(/&amp;/g, '&').replace(/&#39;/g, "'");
const attributes = html => Object.fromEntries([...html.matchAll(/([\w-]+)="([^"]*)"/g)].map(m => [m[1], decode(m[2])]));
const built = await files(output);
const pages = built.filter(file => file.endsWith('.html'));
const issues = [];
let localLinks = 0, localAssets = 0, fragments = 0, decorativeImages = 0;
const imagePaths = new Set();
const externalLinks = new Set();
const getHtml = async file => readFile(file, 'utf8');
const htmlCache = new Map(await Promise.all(pages.map(async file => [file, await getHtml(file)])));
for (const [file, html] of htmlCache) {
  const relative = posix(path.relative(output, file));
  const route = relative === 'index.html' ? '/' : `/${relative.replace(/\/?index\.html$/, '')}`;
  const fail = message => issues.push(`${route}: ${message}`);
  for (const match of html.matchAll(/<(a|img|script|link)\b[^>]*>/g)) {
    const tag = match[1], attrs = attributes(match[0]);
    const value = tag === 'a' || tag === 'link' ? attrs.href : attrs.src;
    if (!value || /^(data:|mailto:|tel:|javascript:)/i.test(value)) continue;
    const url = new URL(value, `https://example.test${route}`);
    if (url.origin !== 'https://example.test') {
      if (tag === 'a') externalLinks.add(value);
      continue;
    }
    if (url.pathname.startsWith('/api/')) continue;
    const target = path.join(output, decodeURIComponent(url.pathname));
    let targetFile = target;
    try {
      if ((await stat(target)).isDirectory()) targetFile = path.join(target, 'index.html');
      await stat(targetFile);
    } catch {
      fail(`missing ${tag === 'a' ? 'link target' : 'asset'} ${value}`);
      continue;
    }
    if (tag === 'a') localLinks++;
    else localAssets++;
    if (tag === 'img') {
      imagePaths.add(posix(path.relative(output, targetFile)));
      // Explicit alt="" is valid for a decorative/redundant image (e.g. a
      // thumbnail next to the same provider's visible name). Missing alt is not.
      if (!Object.hasOwn(attrs, 'alt')) fail(`image without alt attribute: ${value}`);
      else if (!attrs.alt.trim()) decorativeImages++;
    }
    if (tag === 'a' && url.hash && targetFile.endsWith('.html')) {
      fragments++;
      const targetHtml = htmlCache.get(targetFile) ?? await getHtml(targetFile);
      const id = decodeURIComponent(url.hash.slice(1));
      const ids = new Set([...targetHtml.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
      if (!ids.has(id)) fail(`missing anchor ${value}`);
    }
  }
  const h1s = [...html.matchAll(/<h1\b/g)].length;
  if (h1s !== 1) fail(`expected one h1, found ${h1s}`);
}
const packageHtml = htmlCache.get(path.join(output, 'services/packages/index.html'));
assert(packageHtml, 'Build the website before running this audit.');
for (const [id, sessions, price] of [
  ['freedom-6', 6, '$600'], ['freedom-12', 12, '$1,000'],
  ['freedom-22', 22, '$1,800'], ['freedom-36', 36, '$2,800'],
]) {
  assert(packageHtml.includes(`data-testid="text-session-count-${id}">${sessions}`));
  assert(packageHtml.includes(`data-testid="text-price-${id}">${price}`));
}
assert(packageHtml.includes('data-testid="text-pain-session-count">5'));
assert(packageHtml.includes('data-testid="text-pain-price">$400'));
assert(packageHtml.includes('data-testid="text-circulation-price">$5,000'));
const forbidden = /Pain Solutions Package [ABC]|Starter Freedom|Freedom Plus|wellness credits|Per credit|Warrior Package|Half Warrior|Signature Membership|Holiday Special/i;
for (const [file, html] of htmlCache) assert(!forbidden.test(html), `Obsolete/internal package wording in ${file}`);

const inventory = [];
for (const dir of ['attached_assets', 'artifacts/sozo-wellness/public']) {
  for (const file of await files(path.join(workspace, dir))) {
    const bytes = await readFile(file);
    inventory.push({
      path: posix(path.relative(workspace, file)), bytes: bytes.length,
      sha256: createHash('sha256').update(bytes).digest('hex'),
      visibility: dir === 'attached_assets' ? 'source-upload; not a runtime public folder' : 'public-runtime',
    });
  }
}
const hashes = new Map();
for (const entry of inventory) hashes.set(entry.sha256, [...(hashes.get(entry.sha256) ?? []), entry.path]);
const duplicates = [...hashes.values()].filter(group => group.length > 1);
const qrCandidates = inventory.filter(entry => /(?:qr[-_ ]?code|qrcode|\/qr[-_/])/i.test(entry.path));
const summary = {
  scope: 'Local built HTML and uploaded/public resource files; no live submissions or HTTP calls',
  publicRoutes: pages.length - (pages.some(f => f.endsWith('/404.html')) ? 1 : 0),
  htmlFiles: pages.length, localLinks, localAssets, fragments,
  distinctReferencedImages: imagePaths.size, decorativeImages,
  externalLinks: [...externalLinks].sort(), issues,
  resourceFiles: inventory.length,
  uploadFiles: inventory.filter(e => e.path.startsWith('attached_assets/')).length,
  publicFiles: inventory.filter(e => e.visibility === 'public-runtime').length,
  exactDuplicateGroups: duplicates, qrFilenameCandidates: qrCandidates.map(e => e.path),
};
await mkdir(reports, { recursive: true });
await writeFile(path.join(reports, 'local-qa.json'), JSON.stringify(summary, null, 2) + '\n');
const csv = value => `"${String(value).replaceAll('"', '""')}"`;
await writeFile(path.join(reports, 'resource-inventory.csv'), [
  'path,bytes,sha256,visibility',
  ...inventory.map(e => [e.path, e.bytes, e.sha256, e.visibility].map(csv).join(',')),
].join('\n') + '\n');
console.log(JSON.stringify(summary, null, 2));
assert.equal(issues.length, 0, 'Resolve local HTML link/asset/anchor issues.');
