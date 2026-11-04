// Run after the production build to check real prerendered content and links.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { coachingSections, coachingGoals, coachingProcess, coachingTherapies } from '../src/data/whole-life-coaching.ts';

const page = route => readFileSync(new URL(`../dist/public/${route ? `${route}/` : ''}index.html`, import.meta.url), 'utf8');
const main = html => html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? '';
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#x27;');
const coaching = main(page('services/whole-life-coaching'));
assert.ok(coaching.includes('data-testid="page-whole-life-coaching"'));
for (const section of coachingSections) {
  assert.ok(coaching.includes(`id="${section.id}"`));
  for (const paragraph of section.paragraphs) assert.ok(coaching.includes(escape(paragraph)), `Missing paragraph in ${section.id}`);
}
for (const item of [...coachingGoals, ...coachingProcess]) {
  assert.ok(coaching.includes(escape(item.title)), item.title);
  assert.ok(coaching.includes(escape(item.text)), item.title);
}
for (const therapy of coachingTherapies) assert.ok(coaching.includes(`href="${therapy.href}"`), therapy.name);
for (const [route, id] of [['', 'link-home-coaching'], ['about', 'link-about-coaching'], ['dodpowerpack-clinic', 'link-dod-coaching']]) {
  const html = main(page(route));
  assert.match(html, new RegExp(`<a[^>]*data-testid="${id}"[^>]*href="/services/whole-life-coaching"|<a[^>]*href="/services/whole-life-coaching"[^>]*data-testid="${id}"`));
}
const about = main(page('about'));
for (const label of ['Mental wellness', 'Emotional wellness', 'Physical wellness', 'Spiritual wellness']) assert.ok(about.includes(label));
const home = main(page(''));
assert.match(home, /<h1\b[^>]*>Wellness from the root/);
assert.match(coaching, /href="https:\/\/sozowellnesscenter\.janeapp\.com"/);
assert.match(coaching, /href="\/request-assessment"/);
assert.doesNotMatch(coaching, /interest=Whole|totalbodyrestoration\.ca|stored in the tissues/i);
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
assert.match(app, /serviceMenu\.map\(s => <Link href=\{s\.href\}[^]*?data-testid=\{`link-nav-service-/);
assert.match(app, /serviceMenu\.map\(s => <Link href=\{s\.href\}[^]*?data-testid=\{`link-mobile-/);
console.log('Coaching-page checks passed: all adapted content, seven therapy destinations, Jane/enquiry links, four dimensions, and home/About/DOD discovery.');
