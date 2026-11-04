import assert from "node:assert/strict";
import { test } from "node:test";
import { describeGuideError, validateGuideReceipt } from "../src/lib/guide-form.ts";
import { perfectDayBook } from "../src/data/perfect-day.ts";

const id = "ed147422-1b3b-4ba4-aa00-e8499ba8b6a0";
const receipt = { success: true, message: "Accepted for processing", requestId: id, downloadUrl: perfectDayBook.downloadUrl };

test("only a matching successful receipt reveals the approved PDF link", () => {
  assert.equal(validateGuideReceipt(receipt, id)?.downloadUrl, perfectDayBook.downloadUrl);
  for (const bad of [null, {}, { ...receipt, success: false }, { ...receipt, requestId: undefined },
    { ...receipt, requestId: "different" }, { ...receipt, downloadUrl: "javascript:alert(1)" },
    { ...receipt, downloadUrl: "https://untrusted.example/" }]) {
    assert.equal(validateGuideReceipt(bad, id), null);
  }
});

test("network, ambiguous responses and upstream failures lock resubmission", () => {
  for (const error of [new TypeError("network"), { status: 502 }, { status: 500 }, { status: 504 },
    { status: 201 }, { status: 503, data: "Proxy error" }, { status: 400 },
    { status: 400, data: { error: "Uncertain", deliveryUnconfirmed: true } }]) {
    assert.equal(describeGuideError(error).locked, true);
  }
});

test("definite not-forwarded errors preserve safe retry with a new security check", () => {
  for (const status of [400, 403, 413, 415, 429, 503]) {
    assert.deepEqual(describeGuideError({ status, data: { error: "Not forwarded" } }), {
      locked: false, message: "Not forwarded",
    });
  }
});
