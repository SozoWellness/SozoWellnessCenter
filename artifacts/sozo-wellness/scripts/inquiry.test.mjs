import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getInquiryHref, getInquiryInterest, inquiryInterests } from '../src/lib/inquiry.ts';

test('every supported service and individual assessment survives an enquiry link round trip', () => {
  for (const interest of inquiryInterests) {
    const href = getInquiryHref(interest);
    const url = new URL(href, 'https://example.com');
    assert.equal(url.pathname, '/request-assessment');
    assert.equal(getInquiryInterest(url.search), interest);
  }
});

test('direct or unrecognized enquiry URLs leave the interest unselected', () => {
  for (const search of ['', '?other=value', '?interest=', '?interest=Unrecognized', '?interest=%3Cscript%3E']) {
    assert.equal(getInquiryInterest(search), '');
  }
});

test('URL decoding accepts normal encoded spaces without accepting partial matches', () => {
  assert.equal(getInquiryInterest('?interest=Shockwave+therapy'), 'Shockwave therapy');
  assert.equal(getInquiryInterest('?interest=Shockwave'), '');
  assert.equal(getInquiryInterest('?interest=Vitalyzer&source=homepage'), 'Vitalyzer');
});
