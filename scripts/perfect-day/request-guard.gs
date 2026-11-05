/**
 * SOZO book-request ledger. Bind this project to the dedicated Requests sheet.
 * No Gmail, Mailchimp, HTTP fetching or message-sending services are used.
 * One script project must own all claims for this ledger.
 */
var BOOK_HEADERS = [
  "request_id", "submitted_at", "first_name", "email", "marketing_consent",
  "consent_version", "is_test", "delivery_status", "gmail_message_id",
  "marketing_status", "updated_at"
];

/** Run once from the bound Sheets editor, not from the web endpoint. */
function setupBookRequestLog() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  if (!book) throw new Error("Run setup from the script opened through the request spreadsheet.");
  var sheet = book.getSheetByName("Requests");
  if (!sheet || !bookHeadersMatch_(sheet)) {
    throw new Error("The Requests tab must have the eleven approved headings in row 1.");
  }
  var properties = PropertiesService.getScriptProperties();
  var oldId = properties.getProperty("BOOK_SHEET_ID");
  if (oldId && oldId !== book.getId()) throw new Error("This project is already bound to a different ledger.");
  properties.setProperty("BOOK_SHEET_ID", book.getId());
  if (!properties.getProperty("BOOK_REQUEST_KEY")) {
    properties.setProperty("BOOK_REQUEST_KEY",
      (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, ""));
  }
  // Rerunning setup never rotates a key or silently enables requests/live mode.
  var defaults = {
    BOOK_ENABLED: "false",
    BOOK_MODE: "test",
    BOOK_TEST_EMAIL: "book-workflow-test@example.com"
  };
  Object.keys(defaults).forEach(function (key) {
    if (properties.getProperty(key) === null) properties.setProperty(key, defaults[key]);
  });
  return "Setup complete. Review script properties. Requests remain disabled until explicitly enabled.";
}

function doGet() {
  return bookReply_({ ok: false, decision: "post_required" });
}

function doPost(event) {
  var input;
  try {
    if (!event || !event.postData ||
        event.postData.type.split(";")[0].trim().toLowerCase() !== "application/json" ||
        typeof event.postData.contents !== "string" || event.postData.contents.length > 8192) {
      return bookReply_({ ok: false, decision: "invalid_request", invalid_fields: "payload_type_or_size" });
    }
    input = JSON.parse(event.postData.contents);
    if (!input || Array.isArray(input) || typeof input !== "object") {
      return bookReply_({ ok: false, decision: "invalid_request", invalid_fields: "payload_object" });
    }
    var properties = PropertiesService.getScriptProperties();
    var key = properties.getProperty("BOOK_REQUEST_KEY");
    if (!key || !/^[a-f0-9]{64}$/i.test(key) || !bookKeyMatches_(key, input.auth_key)) {
      return bookReply_({ ok: false, decision: "unauthorized" });
    }
    var mode = properties.getProperty("BOOK_MODE");
    var sheetId = properties.getProperty("BOOK_SHEET_ID");
    if (properties.getProperty("BOOK_ENABLED") !== "true" ||
        (mode !== "test" && mode !== "live") || !sheetId) {
      return bookReply_({ ok: false, decision: "disabled" });
    }
    var validation = bookValidate_(input);
    if (validation.invalidFields.length) {
      return bookReply_({
        ok: false, decision: "invalid_request",
        invalid_fields: validation.invalidFields.join(", ")
      });
    }
    var request = validation.request;
    var testEmail = (properties.getProperty("BOOK_TEST_EMAIL") || "").trim().toLowerCase();
    if ((mode === "test" && (!request.isTest || request.email !== testEmail)) ||
        (mode === "live" && request.isTest)) {
      return bookReply_({ ok: false, decision: "restricted" });
    }
  } catch (_) {
    return bookReply_({ ok: false, decision: "unavailable" });
  }

  var lock = LockService.getScriptLock();
  var locked = false;
  try {
    locked = lock.tryLock(10000);
    if (!locked) return bookReply_({ ok: false, decision: "busy" });
    var sheet = SpreadsheetApp.openById(sheetId).getSheetByName("Requests");
    if (!sheet || !bookHeadersMatch_(sheet)) {
      return bookReply_({ ok: false, decision: "ledger_unavailable" });
    }
    var lastRow = sheet.getLastRow();
    // Keep the authoritative ledger intact; do not silently truncate a search.
    if (lastRow > 50000) return bookReply_({ ok: false, decision: "ledger_capacity" });
    if (lastRow > 1) {
      var match = sheet.getRange(2, 1, lastRow - 1, 1)
        .createTextFinder(request.id).matchEntireCell(true).matchCase(false).findNext();
      if (match) {
        return bookReply_({
          ok: true, decision: "duplicate", request_id: request.id, row_number: match.getRow()
        });
      }
    }
    var row = lastRow + 1;
    var values = [
      request.id, request.submittedAt, bookText_(request.firstName), bookText_(request.email),
      String(request.marketing), "perfect-day-request-v1", String(request.isTest),
      "pending", "", request.marketing ? "pending" : "not_requested", new Date().toISOString()
    ];
    sheet.getRange(row, 1, 1, BOOK_HEADERS.length).setNumberFormat("@").setValues([values]);
    // Commit before releasing the lock or granting permission to send.
    SpreadsheetApp.flush();
    return bookReply_({
      ok: true, decision: "claimed", request_id: request.id, row_number: row
    });
  } catch (_) {
    // A partial write or lost response never grants permission to send.
    return bookReply_({ ok: false, decision: "ledger_unavailable" });
  } finally {
    if (locked) lock.releaseLock();
  }
}

function bookValidate_(input) {
  var invalid = [];
  var id = typeof input.request_id === "string" ? input.request_id.toLowerCase() : "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id)) invalid.push("request_id");
  var firstName = typeof input.first_name === "string" ? input.first_name.trim() : "";
  var email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  var submittedAt = typeof input.submitted_at === "string" ? input.submitted_at : "";
  var marketing = bookBoolean_(input.marketing_consent);
  var isTest = bookBoolean_(input.is_test);
  if (!firstName || firstName.length > 80 || /[\u0000-\u001f\u007f]/.test(firstName)) invalid.push("first_name");
  if (email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) invalid.push("email");
  if (!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(submittedAt) ||
      !Number.isFinite(Date.parse(submittedAt))) invalid.push("submitted_at");
  if (input.source !== "sozo_website_book") invalid.push("source");
  if (input.form_type !== "perfect_day_book") invalid.push("form_type");
  if (input.consent_version !== "perfect-day-request-v1") invalid.push("consent_version");
  if (bookBoolean_(input.book_request_consent) !== true) invalid.push("book_request_consent");
  if (bookBoolean_(input.sms_consent) !== false) invalid.push("sms_consent");
  if (marketing === undefined) invalid.push("marketing_consent");
  if (isTest === undefined) invalid.push("is_test");
  return {
    invalidFields: invalid,
    request: invalid.length ? null : {
      id: id, firstName: firstName, email: email, submittedAt: submittedAt, marketing: marketing, isTest: isTest
    }
  };
}

function bookBoolean_(value) {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return;
  var normalized = value.trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
}

function bookHeadersMatch_(sheet) {
  var headers = sheet.getRange(1, 1, 1, BOOK_HEADERS.length).getValues()[0];
  return BOOK_HEADERS.every(function (name, index) { return headers[index] === name; });
}

function bookText_(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function bookKeyMatches_(expected, actual) {
  if (typeof actual !== "string" || actual.length !== expected.length) return false;
  var difference = 0;
  for (var i = 0; i < expected.length; i++) difference |= expected.charCodeAt(i) ^ actual.charCodeAt(i);
  return difference === 0;
}

function bookReply_(body) {
  // Google ContentService does not expose arbitrary HTTP status codes.
  // Zapier MUST filter on both ok=true and decision=claimed, not HTTP 200.
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
