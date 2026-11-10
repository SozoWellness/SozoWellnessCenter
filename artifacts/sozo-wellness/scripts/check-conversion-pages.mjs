import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist/public');
const label = 'Book Your Assessment';
const clean = (html) => html.replace(/<!--.*?-->/gs, '').replace(/<[^>]*>/g, '').trim();
const page = async (route) => readFile(path.join(root, route, 'index.html'), 'utf8');
const anchor = (html, testId) => {
  const match = html.match(new RegExp(`<a\\b[^>]*data-testid="${testId}"[^>]*>[\\s\\S]*?<\\/a>`));
  assert(match, `Missing link: ${testId}`);
  return match[0];
};
const href = (html) => html.match(/href="([^"]+)"/)?.[1].replace(/&amp;/g, '&');

const files = await readdir(root, { recursive: true });
const pages = files.filter(file => file === 'index.html' || file.endsWith('/index.html'));
for (const file of pages) {
  const html = await readFile(path.join(root, file), 'utf8');
  for (const id of ['link-header-request', 'link-footer-request']) {
    const link = anchor(html, id);
    assert.equal(clean(link), label, `${file}: inconsistent booking label`);
    assert.equal(href(link), 'https://sozowellnesscenter.janeapp.com', `${file}: incorrect booking destination`);
  }
  assert.match(anchor(html, 'link-header-request'), /btn-primary/);
  for (const id of ['link-top-phone', 'link-footer-phone']) {
    const link = anchor(html, id);
    assert.equal(href(link), 'tel:+13528022248', `${file}: incorrect clinic phone`);
    assert.match(clean(link), /Text or Call 352-802-2248/);
    assert(!link.includes('target="_blank"'), 'Phone links must open the device handler directly');
  }
}

const home = await page('');
assert.match(anchor(home, 'link-hero-request'), /btn-primary/);
assert.equal(clean(anchor(home, 'link-hero-request')), label);
assert.match(anchor(home, 'link-hero-services'), /btn-outline/);
assert.match(home, /id="how-we-help"/);
assert.match(home, /class="hero-photo"><img src="\/images\/hyperbaric-chamber.png"/);

const pathways = [
  ['services/assessments', 'Wellness assessments'],
  ['services/shockwave', 'Shockwave therapy'],
  ['services/therawellness', 'TheraWellness'],
  ['services/hyperbaric-oxygen', 'Hyperbaric oxygen'],
];
assert.equal((home.match(/data-testid="link-goal-\d+"/g) || []).length, 4);
for (const [i, [route, interest]] of pathways.entries()) {
  assert.equal(href(anchor(home, `link-goal-${i}`)), `/${route}`);
  const html = await page(route);
  assert.match(html, /<h1\b/);
  assert(
    html.includes('data-testid="section-assessments"') || html.includes('class="detail-main"'),
    `Missing treatment information: ${route}`,
  );
  const cta = anchor(html, 'link-page-hero-request');
  assert.equal(clean(cta), label);
  const url = new URL(href(cta), 'https://example.test');
  assert.equal(url.pathname, '/request-assessment');
  assert.equal(url.searchParams.get('interest'), interest);
}

const form = await page('request-assessment');
assert.match(form, /data-testid="notice-booking-status"/);
assert.match(clean(form), /Submitting a request does not book an appointment/);
assert.match(anchor(form, 'link-form-phone'), /btn-primary/);
assert.match(clean(form), /Submit my request/);
const assessmentPage = await page('services/assessments');
for (const [i, interest] of ['Vitalyzer', 'NeuralChek', 'Live blood analysis'].entries()) {
  const cta = anchor(assessmentPage, `link-assessment-request-${i}`);
  assert.equal(clean(cta), label);
  const selected = new URL(href(cta), 'https://example.test').searchParams.get('interest');
  assert.equal(selected, interest);
  assert(form.includes(`<option value="${interest}">`), `Missing form option: ${interest}`);
}

const stories = await page('testimonials');
assert.equal((stories.match(/data-testid="story-/g) || []).length, 5);
for (const id of ['melody-w', 'alexander-k', 'tyler-s', 'logan-g', 'logans-mom']) {
  assert(stories.includes(`data-testid="story-${id}"`), `Missing testimonial: ${id}`);
}
for (const figure of home.matchAll(/<figure[^>]*>([\s\S]*?)<\/figure>/g)) {
  const quote = figure[1].match(/<blockquote>([\s\S]*?)<\/blockquote>/)?.[1];
  if (!quote) continue;
  const text = clean(quote).replace(/^“|”$/g, '');
  assert(clean(stories).includes(text), `Homepage excerpt differs from full testimonial: ${text}`);
}
assert.match(clean(stories), /Treatment Centers of America/);
assert.match(clean(stories), /Lightly edited for spelling, punctuation and readability/);
assert.equal(href(anchor(home, 'link-home-team')), '/about#team');
const about = await page('about');
assert.match(about, /id="team"/);
assert.equal(href(anchor(home, 'link-home-philosophy')), '/about#whole-person-wellness');
assert.match(about, /id="whole-person-wellness"/);
for (const html of [home, about]) {
  for (const theme of ['Physical wellness', 'Emotional wellness', 'Spiritual wellness', 'integrative care approach']) {
    assert(clean(html).includes(theme), `Missing whole-person wellness theme: ${theme}`);
  }
}
assert.equal(href(anchor(about, 'link-whole-person-assessments')), '/services/assessments');
assert.match(about, /data-testid="card-team-darcelle-burandt"/);
const darcelleCard = about.match(/<li[^>]*data-testid="card-team-darcelle-burandt"[^>]*>([\s\S]*?)<\/li>/)?.[1];
assert(darcelleCard, 'Missing Darcelle team card');
assert.match(clean(darcelleCard), /Darcelle Burandt/);
assert.match(clean(darcelleCard), /Certified Whole Life Health Coach/);
assert.doesNotMatch(clean(darcelleCard), /\bLPC\b|\bTherapist\b/);
assert(about.indexOf('card-team-darcelle-burandt') < about.indexOf('card-team-gary-cupo'), 'Darcelle must remain first');
for (const [id, destination] of [
  ['jt-anderson', '/chiropractic-care#jt-anderson'],
  ['lauren-alvarez-schmitz', '/chiropractic-care#lauren-alvarez-schmitz'],
  ['kevin-stasney', '/independent-physicians'],
]) {
  assert.equal(href(anchor(about, `link-team-photo-${id}`)), destination);
  assert.equal(href(anchor(about, `link-team-name-${id}`)), destination);
  const image = anchor(about, `link-team-photo-${id}`).match(/src="([^"]+)"/)?.[1];
  assert(image, `Missing provider photo: ${id}`);
  await readFile(path.join(root, image));
}
const chiropractic = await page('chiropractic-care');
assert.match(chiropractic, /id="jt-anderson"/);
assert.match(chiropractic, /id="lauren-alvarez-schmitz"/);
assert.match(clean(chiropractic), /JT Anderson, DC/);
assert.match(clean(chiropractic), /Lauren Alvarez Schmitz, DC/);
assert(!chiropractic.includes('Kevin Stasney'), 'The medical physician must not appear as a chiropractor');
const physician = await page('independent-physicians');
assert.match(clean(physician), /Kevin Stasney, MD/);
assert.match(clean(physician), /operating independently of SOZO Wellness Center/);
assert(!physician.includes('JT Anderson') && !physician.includes('Lauren Alvarez Schmitz'), 'The independent physician page must feature Kevin only');
assert.equal(href(anchor(physician, 'link-yearsyoungermd')), 'https://yearsyoungermd.com');
assert.equal(href(anchor(physician, 'link-physician-contact')), 'https://yearsyoungermd.com/contact');
for (const [id, name] of [
  ['eboo-therapy', 'EBOO Therapy'],
  ['stem-cell-therapy', 'Stem Cell Therapy'],
  ['prp-therapy', 'PRP (Platelet-Rich Plasma)'],
  ['regenerative-medicine', 'Regenerative Medicine'],
  ['wellness-optimization', 'Wellness Optimization'],
  ['hormone-replacement-therapy', 'Hormone Replacement Therapy'],
]) {
  assert(physician.includes(`data-testid="physician-service-${id}"`), `Missing physician service: ${name}`);
  assert(clean(physician).includes(name), `Missing service name: ${name}`);
}
assert.match(physician, /<h1[^>]*>Independent physician care <em>near The Villages\.<\/em><\/h1>/);
const servicesPage = await page('services');
assert.equal(href(anchor(servicesPage, 'link-service-07')), '/services/red-light-therapy');
assert.equal(href(anchor(servicesPage, 'link-service-08')), '/services/foot-detox');
assert.equal(href(anchor(servicesPage, 'link-service-10')), '/chiropractic-care');
console.log(`Conversion checks passed: ${pages.length} pages, four pathways, three assessment selections, five testimonials and separate provider destinations.`);
