import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { JANE_BOOKING_URL } from '../src/lib/booking.ts';
import { getInquiryHref, getInquiryInterest } from '../src/lib/inquiry.ts';

test('Jane uses the exact public booking destination without visitor data', () => {
  assert.equal(JANE_BOOKING_URL, 'https://sozowellnesscenter.janeapp.com');
  const url = new URL(JANE_BOOKING_URL);
  assert.equal(url.protocol, 'https:');
  assert.equal(url.search, '');
  assert.equal(url.hash, '');
});

test('Jane links use native external navigation and disclose the new tab', () => {
  const component = readFileSync(new URL('../src/components/jane-booking-link.tsx', import.meta.url), 'utf8');
  assert.match(component, /<a\s/);
  assert.match(component, /href=\{JANE_BOOKING_URL\}/);
  assert.match(component, /target="_blank"/);
  assert.match(component, /rel="noopener noreferrer"/);
  assert.match(component, /opens in a new tab/);
  assert.doesNotMatch(component, /<iframe|URLSearchParams/);
});

test('booking is available on desktop, mobile, footer and the existing enquiry page', () => {
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  for (const id of ['link-header-request', 'link-mobile-request', 'link-footer-request', 'link-form-jane']) {
    assert.match(app, new RegExp(`<JaneBookingLink[^>]*testId="${id}"`));
  }
  assert.match(app, /data-testid="link-mobile-enquiry"/);
  assert.match(app, /data-testid="link-footer-enquiry"/);
  assert.match(app, /The enquiry form below does not reserve an appointment/);
  assert.match(app, /form\.handleSubmit\(onSubmit\)/);
  const url = new URL(getInquiryHref('Vitalyzer'), 'https://example.com');
  assert.equal(url.pathname, '/request-assessment');
  assert.equal(getInquiryInterest(url.search), 'Vitalyzer');
});
