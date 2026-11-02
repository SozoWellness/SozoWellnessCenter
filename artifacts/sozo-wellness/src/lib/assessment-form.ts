/**
 * Normalize US national numbers or explicitly international numbers for the API.
 * This checks formatting, not whether a number belongs to a mobile device.
 */
export function normalizeAssessmentMobile(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || !/^\+?[\d\s().-]+$/.test(trimmed)) return null;
  const digits = trimmed.replace(/\D/g, '');
  if (trimmed.startsWith('+')) {
    return /^[1-9]\d{7,14}$/.test(digits) ? `+${digits}` : null;
  }
  if (/^\d{10}$/.test(digits)) return `+1${digits}`;
  if (/^1\d{10}$/.test(digits)) return `+${digits}`;
  return null;
}
