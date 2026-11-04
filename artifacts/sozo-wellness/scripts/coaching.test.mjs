import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import {
  coachingIntro, coachingSections, coachingGoals, coachingProcess,
  coachingTherapies, coachingPreview,
} from '../src/data/whole-life-coaching.ts';

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const content = JSON.stringify({ coachingIntro, coachingSections, coachingGoals, coachingProcess, coachingTherapies, coachingPreview });

test('SOZO coaching identity explicitly includes all four dimensions', () => {
  assert.match(coachingIntro.title, /Wellness from the root/);
  assert.match(coachingIntro.summary, /We are whole life wellness coaches/);
  for (const dimension of ['mental', 'emotional', 'physical', 'spiritual']) {
    assert.ok(coachingIntro.summary.includes(dimension));
    assert.ok(coachingPreview.text.includes(dimension));
  }
});

test('the adapted source retains substantive themes and practical process', () => {
  assert.deepEqual(coachingSections.map(s => s.id), [
    'a-fresh-perspective', 'wellness-from-the-root', 'beliefs-and-perspective',
    'relationships-and-self-care', 'your-ideal-day',
  ]);
  const prose = coachingSections.flatMap(s => s.paragraphs).join(' ');
  assert.match(prose, /broken or damaged/);
  assert.match(prose, /emotional consultation/);
  assert.match(prose, /listen without judgment/);
  assert.match(prose, /beliefs|expectations/);
  assert.match(prose, /relationships/);
  assert.match(prose, /realistic actions/);
  assert.equal(coachingSections.flatMap(s => s.paragraphs).length, 12);
  for (const section of coachingSections) assert.ok(section.paragraphs.length >= 2, `Preserve the full explanation of ${section.id}`);
  assert.equal(coachingGoals.length, 8);
  assert.equal(coachingProcess.length, 4);
  assert.doesNotMatch(content, /stored in the tissues|erase.*belief|guaranteed|manifest your|totalbodyrestoration\.ca|certified life coach/i);
});

test('coaching connects only to existing SOZO service routes', () => {
  assert.equal(coachingTherapies.length, 7);
  for (const service of coachingTherapies) {
    assert.ok(app.includes(`path="${service.href}"`), service.href);
  }
  assert.match(app, /<Route path="\/services\/whole-life-coaching" component=\{WholeLifeCoachingPage\}/);
  assert.match(app, /<WholeLifeCoachingPreview\/>/);
  assert.match(app, /title: 'Whole Life Wellness Coaching', href: '\/services\/whole-life-coaching'/);
});
