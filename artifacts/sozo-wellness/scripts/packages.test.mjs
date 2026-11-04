import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import {
  freedomPackages, circulationProgram, creditPolicy,
  wellnessServices, wellnessPathways, formatPrice,
} from '../src/data/packages.ts';

test('Freedom packages match the approved quantities, prices and unit costs', () => {
  assert.deepEqual(freedomPackages.map(p => [p.name, p.credits, p.price, p.price / p.credits]), [
    ['Starter Freedom Package', 10, 1000, 100],
    ['Freedom Package', 20, 1700, 85],
    ['Freedom Plus Package', 35, 2800, 80],
  ]);
  assert.equal(new Set(freedomPackages.map(p => p.id)).size, 3);
  assert.equal(formatPrice(1700), '$1,700');
  assert.equal(formatPrice(85), '$85');
  assert.equal(formatPrice(85.5), '$85.50');
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

test('credit policy does not turn unknown terms into promises', () => {
  assert.match(creditPolicy.summary, /^Most services may/);
  assert.match(creditPolicy.termsNote, /team will confirm/i);
  assert.doesNotMatch(JSON.stringify(creditPolicy), /never expire|no expiration|unlimited|all services|shareable/i);
  assert.doesNotMatch(circulationProgram.pricingNote, /not purchased with|cannot use|credit.?ineligible/i);
});

test('the obsolete package catalog and metadata are removed', () => {
  const data = readFileSync(new URL('../src/data/packages.ts', import.meta.url), 'utf8');
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(data, /Pain Package [ABC]|HBOT Package [ABC]|Brain Mapping Package|TheraWellness Standard Package|TheraWellness Boost Package|Custom Package/);
  const metadata = app.split('\n').find(line => line.includes("'/services/packages':"));
  assert.match(metadata, /Freedom Wellness Credit/);
  assert.doesNotMatch(metadata, /Brain Mapping is coming soon/);
});
