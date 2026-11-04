import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { parseInlineMarkup } from '../src/lib/inline-markup.ts';

const doi = 'https://www.jacc.org/doi/10.1016/S0735-1097(03)00428-5';

test('DOI links retain the entire URL and surrounding text', () => {
  assert.deepEqual(parseInlineMarkup(`Read [JACC](${doi}) for details.`), [
    { text: 'Read ' }, { text: 'JACC', href: doi }, { text: ' for details.' },
  ]);
});

test('all existing Cardio MedBed JACC references retain their complete destinations', () => {
  let count = 0;
  for (const file of ['cardio-medbed-science.md', 'cardio-medbed-chf.md']) {
    const markdown = readFileSync(new URL(`../src/data/${file}`, import.meta.url), 'utf8');
    const links = parseInlineMarkup(markdown).filter(item => item.href?.includes('jacc.org'));
    for (const link of links) assert.equal(link.href, doi);
    count += links.length;
  }
  assert.equal(count, 3);
});

test('emphasis, optional link titles and local-link rewriting still work', () => {
  assert.deepEqual(parseInlineMarkup(
    '**[Contact](https://example.test/contact "Contact us")**',
    href => href.replace('https://example.test/contact', '/request-assessment'),
  ), [{ text: 'Contact', href: '/request-assessment', bold: true }]);
});

test('ordinary links, encoded parentheses and escaped text are preserved', () => {
  const href = 'https://example.test/article%28study%29';
  assert.deepEqual(parseInlineMarkup(`\\[Note\\] [Study](${href})`), [
    { text: '[Note] ' }, { text: 'Study', href },
  ]);
});
