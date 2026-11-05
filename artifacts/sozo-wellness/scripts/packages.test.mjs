import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import {
  freedomPackages, painPackage, circulationProgram, packagePolicy,
  wellnessServices, wellnessPathways, formatPrice,
} from '../src/data/packages.ts';

test('Freedom packages match the owner-approved public sessions and prices', () => {
  assert.deepEqual(freedomPackages.map(p => [p.name, p.sessions, p.price]), [
    ['Freedom Package — 6 Sessions', 6, 600],
    ['Freedom Package — 12 Sessions', 12, 1000],
    ['Freedom Package — 22 Sessions', 22, 1800],
    ['Freedom Package — 36 Sessions', 36, 2800],
  ]);
  assert.equal(new Set(freedomPackages.map(p => p.id)).size, 4);
  assert.equal(formatPrice(1700), '$1,700');
  assert.equal(formatPrice(85), '$85');
  assert.equal(formatPrice(85.5), '$85.50');
});

test('Pain Package exposes only its approved five sessions and $400 price', () => {
  assert.equal(painPackage.name, 'Pain Package');
  assert.equal(painPackage.sessions, 5);
  assert.equal(painPackage.price, 400);
  assert.doesNotMatch(JSON.stringify(painPackage), /expire|buy 8|free|shockwave|cellsonic/i);
});

test('Circulation program keeps the separate approved price and session schedule', () => {
  assert.equal(circulationProgram.price, 5000);
  assert.equal(circulationProgram.regularPrice, 6000);
  assert.equal(circulationProgram.regularPrice - circulationProgram.price, 1000);
  assert.equal(circulationProgram.visits, 30);
  assert.equal(circulationProgram.visitsPerWeek * circulationProgram.weeks, 30);
  assert.equal(circulationProgram.sessionMinutes, 60);
  assert.deepEqual(circulationProgram.therapies, ['Hyperbaric Oxygen Chamber', 'Cardio MedBed']);
  assert.match(circulationProgram.schedule, /weekends excluded/i);
});

test('all ten example pathways and the ten listed services are retained', () => {
  assert.equal(wellnessServices.length, 10);
  assert.equal(wellnessPathways.length, 10);
  assert.equal(new Set(wellnessPathways.map(p => p.id)).size, 10);
  assert.deepEqual(wellnessPathways.map(p => p.title), [
    'Sexual Health & Hormone Balance', 'Brain Health & Mental Clarity',
    'Cancer Support & Immune Strength', 'Pain & Recovery',
    'Cardiovascular Health & Circulation', 'Detox & Lymphatic Support',
    'Energetic Balancing & Stress Relief', 'Athletic Performance & Recovery',
    'Beauty, Anti-Aging & Cellular Health', 'Whole-Body Wellness & Longevity',
  ]);
  for (const pathway of wellnessPathways) assert.equal(pathway.services.length, 6);
});

test('package policy does not turn unknown terms or credit equivalence into promises', () => {
  assert.match(packagePolicy.summary, /session package/);
  assert.match(packagePolicy.termsNote, /team will confirm/i);
  assert.doesNotMatch(JSON.stringify(packagePolicy), /never expire|no expiration|unlimited|all services|shareable|one.*credit/i);
  assert.doesNotMatch(circulationProgram.pricingNote, /not purchased with|cannot use|credit.?ineligible/i);
});

test('the obsolete package catalog and metadata are removed', () => {
  const data = readFileSync(new URL('../src/data/packages.ts', import.meta.url), 'utf8');
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(data, /Pain Package [ABC]|HBOT Package [ABC]|Brain Mapping Package|TheraWellness Standard Package|TheraWellness Boost Package|Custom Package/);
  const metadata = app.split('\n').find(line => line.includes("'/services/packages':"));
  assert.match(metadata, /Freedom & Pain Session Packages/);
  assert.doesNotMatch(metadata, /Brain Mapping is coming soon/);
});

test('public package UI does not expose old credit rules or internal offers', () => {
  const data = readFileSync(new URL('../src/data/packages.ts', import.meta.url), 'utf8');
  const component = readFileSync(new URL('../src/components/packages.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(data + component, /Pain Solutions Package [ABC]|Warrior|Signature Membership|Maintenance Membership|Holiday Special|Starter Freedom|Freedom Plus|Per credit|one Freedom Wellness Credit/i);
  assert.doesNotMatch(component, /p\.credits|how-credits-work|text-per-credit/);
  assert.match(component, /painPackage\.price/);
  assert.match(component, /not a list of package inclusions/);
});
