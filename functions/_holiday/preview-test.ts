import type { HolidayEnv } from './mailchimp.ts';
import { HOLIDAY_START } from '../../artifacts/sozo-wellness/src/lib/holiday-offers.ts';

/** Never infer preview status from a client-supplied header or query parameter. */
export function holidayPreviewTestAllowed(env: HolidayEnv, requestUrl?: string, now = Date.now()): boolean {
  if (env.HOLIDAY_PREVIEW_TEST !== 'true' || env.CF_PAGES_BRANCH !== 'holiday-test') return false;
  // Old immutable deployment URLs must not remain test endpoints indefinitely.
  if (now >= Date.parse(HOLIDAY_START)) return false;
  const email = env.HOLIDAY_TEST_EMAIL?.trim();
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
  try {
    const deployment = new URL(env.CF_PAGES_URL || '');
    const request = new URL(requestUrl || '');
    // Only the unique deployment URL, not custom domains or branch aliases.
    return deployment.protocol === 'https:' &&
      /^[a-f0-9]{8}\.sozowellnesscenter\.pages\.dev$/.test(deployment.hostname) &&
      deployment.origin === request.origin;
  } catch { return false; }
}
