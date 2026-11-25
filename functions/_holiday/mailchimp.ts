import { md5 } from '@noble/hashes/legacy.js';
import { HOLIDAY_OFFERS, HOLIDAY_PACKAGES, type HolidayClaim } from '../../artifacts/sozo-wellness/src/lib/holiday-offers.ts';

export type HolidayEnv = {
  HOLIDAY_CLAIMS_ENABLED?: string;
  MAILCHIMP_API_KEY?: string;
  MAILCHIMP_SERVER_PREFIX?: string;
  MAILCHIMP_AUDIENCE_ID?: string;
  TURNSTILE_SECRET_KEY?: string;
  HOLIDAY_PREVIEW_TEST?: string;
  HOLIDAY_TEST_EMAIL?: string;
  CF_PAGES_BRANCH?: string;
  CF_PAGES_URL?: string;
};

export function holidayConfigured(env: HolidayEnv) {
  return Boolean(env.MAILCHIMP_API_KEY?.trim() &&
    /^us\d+$/.test(env.MAILCHIMP_SERVER_PREFIX || '') &&
    /^[a-zA-Z0-9]+$/.test(env.MAILCHIMP_AUDIENCE_ID || '') &&
    env.TURNSTILE_SECRET_KEY?.trim());
}

export class HolidayProviderError extends Error {
  constructor(stage: string, status: number, diagnostic = '') {
    // Never log provider bodies, addresses, names, phone numbers or credentials.
    super(`Holiday reservation provider failure: ${stage} (${status})${diagnostic ? ` ${diagnostic}` : ''}`);
  }
}

/** Return static categories and allowlisted field names, never provider text. */
export function holidayErrorDiagnostic(body: unknown): string {
  if (!body || typeof body !== 'object') return 'reason=unclassified';
  const error = body as Record<string, unknown>;
  const detail = typeof error.detail === 'string' ? error.detail.toLowerCase() : '';
  const titles: Record<string, string> = {
    'Invalid Resource': 'invalid-resource',
    'Member Exists': 'member-exists',
    'Forgotten Email Not Subscribed': 'previously-deleted',
    'Member In Compliance State': 'compliance-state',
    'Invalid Action': 'invalid-action',
    'API Key Invalid': 'invalid-key',
  };
  let reason = typeof error.title === 'string' && Object.hasOwn(titles, error.title)
    ? titles[error.title] : 'unclassified';
  if (detail.includes('looks fake or invalid')) reason = 'email-rejected';
  else if (detail.includes('permanently deleted')) reason = 'previously-deleted';
  else if (detail.includes('compliance state')) reason = 'compliance-state';
  else if (detail.includes('too many recent signup requests')) reason = 'signup-limit';
  const allowedFields = new Set([
    'email_address', 'status_if_new', 'timestamp_opt', 'merge_fields',
    'FNAME', 'LNAME', 'PHONE', 'BFRESAT', 'PACKAGE',
    'merge_fields.FNAME', 'merge_fields.LNAME', 'merge_fields.PHONE',
    'merge_fields.BFRESAT', 'merge_fields.PACKAGE',
  ]);
  const fields = Array.isArray(error.errors)
    ? [...new Set(error.errors.flatMap(item =>
      item && typeof item === 'object' && typeof item.field === 'string' && allowedFields.has(item.field)
        ? [item.field] : []))].sort()
    : [];
  return `reason=${reason}${fields.length ? ` fields=${fields.join(',')}` : ''}`;
}

/** Member PUT and tag state updates are repeatable, with no email send operation. */
export async function saveHolidayClaim(env: HolidayEnv, claim: HolidayClaim) {
  const hash = Array.from(md5(new TextEncoder().encode(claim.email)))
    .map(byte => byte.toString(16).padStart(2, '0')).join('');
  const audience = `https://${env.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${env.MAILCHIMP_AUDIENCE_ID}`;
  const memberUrl = `${audience}/members/${hash}`;
  const call = async (url: string, method = 'GET', payload?: unknown) => {
    try {
      return await fetch(url, {
        method,
        headers: {
          Authorization: `Basic ${btoa(`sozo:${env.MAILCHIMP_API_KEY!.trim()}`)}`,
          'Content-Type': 'application/json',
        },
        ...(payload === undefined ? {} : { body: JSON.stringify(payload) }),
        redirect: 'manual',
        signal: AbortSignal.timeout(8000),
      });
    } catch { throw new HolidayProviderError('connection', 0); }
  };
  const checked = async (response: Response, stage: string) => {
    if (!response.ok) {
      let diagnostic = 'reason=unclassified';
      try { diagnostic = holidayErrorDiagnostic(await response.json()); } catch { /* No raw fallback. */ }
      throw new HolidayProviderError(stage, response.status, diagnostic);
    }
    try { return await response.json() as Record<string, unknown>; }
    catch { throw new HolidayProviderError(stage, response.status); }
  };
  const lookup = await call(memberUrl);
  if (!lookup.ok && lookup.status !== 404) throw new HolidayProviderError('lookup', lookup.status);
  // Establish whether the member exists before writing, but do not change any
  // existing subscribed/unsubscribed/cleaned/pending status.
  if (lookup.ok) await checked(lookup, 'lookup');

  const fields = await checked(await call(`${audience}/merge-fields?count=1000`), 'fields');
  if (!Array.isArray(fields.merge_fields)) throw new HolidayProviderError('fields', 0);
  const available = new Set(fields.merge_fields.map((field: { tag?: string }) => field?.tag));
  for (const required of ['FNAME', 'LNAME', 'PHONE', 'BFRESAT']) {
    if (!available.has(required)) throw new HolidayProviderError('required-fields', 0);
  }
  const reservationTime = new Date().toISOString();
  const selected = HOLIDAY_PACKAGES.find(pkg => pkg.id === claim.packageId);
  const packageLabel = selected
    ? `${selected.name} — ${selected.credits} credits — $${selected.price.toLocaleString('en-US')}`
    : claim.offers.includes('bogo') ? 'Not sure yet' : '';
  const member = await checked(await call(memberUrl, 'PUT', {
    email_address: claim.email,
    status_if_new: claim.marketingConsent ? 'subscribed' : 'transactional',
    // No "status": never silently resubscribe an existing audience member.
    merge_fields: {
      FNAME: claim.firstName, LNAME: claim.lastName, PHONE: claim.phone,
      // Present in the initial member write so the signup welcome journey can
      // exclude holiday reservations before the later tag request arrives.
      BFRESAT: reservationTime,
      ...(available.has('PACKAGE') ? { PACKAGE: packageLabel } : {}),
    },
    ...(!lookup.ok && claim.marketingConsent ? { timestamp_opt: reservationTime } : {}),
  }), 'member');
  const marketingAllowed = claim.marketingConsent && member.status === 'subscribed';
  const tags = [
    { name: 'Black Friday 2026', status: 'active' },
    { name: 'BF 2026 - Reservation follow-up approved', status: 'active' },
    { name: 'BF 2026 - Email Opt-in', status: marketingAllowed ? 'active' : 'inactive' },
    ...HOLIDAY_OFFERS.map(offer => ({
      name: offer.tag, status: claim.offers.includes(offer.id) ? 'active' : 'inactive',
    })),
    // Keep the package selection available even if the optional PACKAGE merge
    // field has not been created. Latest submission determines campaign tags.
    ...HOLIDAY_PACKAGES.map(pkg => ({
      name: `BF 2026 Package - ${pkg.name}`,
      status: claim.offers.includes('bogo') && claim.packageId === pkg.id ? 'active' : 'inactive',
    })),
    {
      name: 'BF 2026 Package - Not sure yet',
      status: claim.offers.includes('bogo') && !selected ? 'active' : 'inactive',
    },
  ];
  const tagged = await call(`${memberUrl}/tags`, 'POST', { tags });
  if (!tagged.ok) throw new HolidayProviderError('tags', tagged.status);
}
