import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist/public');
const cases = [
  ['/services/foot-detox', /Foot Detox/i, /AO Infinity/i],
  ['/services/red-light-therapy', /Red Light/i, /Neurocare Pro Platinum/i],
];
const page = route => readFile(path.join(root, route.slice(1), 'index.html'), 'utf8');
const services = await page('/services');
const packages = await page('/services/packages');
const sitemap = await readFile(path.join(root, 'sitemap.xml'), 'utf8');
for (const [route, name, equipment] of cases) {
  const html = await page(route);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${route}: expected one page heading`);
  assert.match(html, name);
  assert.match(html, equipment);
  assert.match(html, /class="detail-main"/);
  assert.match(html, /data-testid="link-detail-request"/);
  assert.match(html, /href="\/request-assessment\?interest=Wellness%20assessments"/);
  assert.match(html, /href="https:\/\/sozowellnesscenter\.janeapp\.com"/);
  assert(html.includes(`rel="canonical" href="https://sozorootedwellness.com${route}"`));
  assert(sitemap.includes(`https://sozorootedwellness.com${route}</loc>`));
  assert(services.includes(`href="${route}"`), `${route}: missing Services link`);
  const photo = html.match(/<figure class="sh-photo"[^>]*><img[^>]*src="([^"]+)"[^>]*alt="([^"]+)"/);
  assert(photo, `${route}: missing service photo with alternative text`);
  assert(photo[1].startsWith('/images/'), `${route}: photo must be locally hosted`);
  await access(path.join(root, photo[1].slice(1)));
  assert.doesNotMatch(html, /treats diabetes|supports over 20|deep detoxification|safe and effective detoxification|promote hair growth|regulate blood sugar/i);
}
assert(packages.includes('href="/services/red-light-therapy"'), 'Red Light package-directory link missing');
assert.match(await page('/services/red-light-therapy'), /Pulse/i);
assert(!services.includes('href="/services/cryogenics'), 'Cryogenics must remain excluded');
console.log('New therapy pages passed: content, equipment, local photos, discovery, CTAs and search metadata.');
