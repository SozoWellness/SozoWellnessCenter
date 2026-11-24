/** This campaign is separate from the general package catalog and giveaway. */
export const HOLIDAY_PACKAGES = [
  { id: 'pain-5', name: 'Pain 5', credits: 5, price: 400 },
  { id: 'pain-10', name: 'Pain 10', credits: 10, price: 800 },
  { id: 'freedom-7', name: 'Freedom 7', credits: 7, price: 600 },
  { id: 'starter-freedom-12', name: 'Starter Freedom 12', credits: 12, price: 1000 },
  { id: 'freedom-22', name: 'Freedom 22', credits: 22, price: 1800 },
  { id: 'freedom-36', name: 'Freedom 36', credits: 36, price: 2800 },
] as const;

export const HOLIDAY_OFFERS = [
  { id: 'bogo', label: 'Buy One, Gift One – Wellness Credit Package', tag: 'BOGO Package' },
  { id: 'gift-card', label: 'Bonus Gift Card – $500 + $100 Bonus', tag: 'Gift Card Bonus' },
] as const;

export const RESERVATION_CONSENT = 'Yes, SOZO Wellness Center may contact me by email, phone, or text about my holiday offer reservation.';
export const HOLIDAY_MARKETING_CONSENT = 'I’d also like to receive promotional emails from SOZO Wellness Center.';
export const HOLIDAY_START = '2026-11-25T05:00:00.000Z';
export const HOLIDAY_END = '2026-12-01T05:00:00.000Z';
export const HOLIDAY_ERROR = 'Something went wrong — please call us at 352-802-2248';

export type HolidayClaim = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  offers: string[];
  packageId: string;
  reservationConsent: boolean;
  marketingConsent: boolean;
  website: string;
  turnstileToken: string;
};
export type HolidayFieldErrors = Partial<Record<keyof HolidayClaim, string>>;
export type HolidayAvailability = {
  accepting: boolean;
  reason: 'disabled' | 'upcoming' | 'closed' | 'unavailable' | 'open';
  testMode?: boolean;
};
export type HolidayResult = {
  ok: boolean;
  error?: string;
  fieldErrors?: HolidayFieldErrors;
};

export function normalizeHolidayPhone(value: string): string | null {
  if (!/^\+?[\d\s().-]+$/.test(value.trim())) return null;
  let digits = value.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1);
  return /^[2-9]\d{2}[2-9]\d{6}$/.test(digits) ? `+1${digits}` : null;
}

/** Pure validator shared by client and server. Never trust browser validation alone. */
export function validateHolidayClaim(input: unknown):
  { value: HolidayClaim; errors: HolidayFieldErrors } {
  const data = input && typeof input === 'object' && !Array.isArray(input)
    ? input as Record<string, unknown> : {};
  const text = (key: string) => typeof data[key] === 'string' ? data[key].trim() : '';
  const value: HolidayClaim = {
    firstName: text('firstName'), lastName: text('lastName'),
    email: text('email').toLowerCase(), phone: normalizeHolidayPhone(text('phone')) || '',
    offers: Array.isArray(data.offers) ? [...new Set(data.offers.filter((v): v is string => typeof v === 'string'))] : [],
    packageId: text('packageId'), reservationConsent: data.reservationConsent === true,
    marketingConsent: data.marketingConsent === true, website: text('website'),
    turnstileToken: text('turnstileToken'),
  };
  const errors: HolidayFieldErrors = {};
  for (const key of ['firstName', 'lastName'] as const) {
    if (!value[key] || value[key].length > 80 || /[\u0000-\u001f\u007f]/.test(value[key])) {
      errors[key] = `Please enter your ${key === 'firstName' ? 'first' : 'last'} name (up to 80 characters).`;
    }
  }
  if (value.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) errors.email = 'Please enter a valid email address.';
  if (!value.phone) errors.phone = 'Please enter a valid 10-digit US phone number.';
  if (!value.offers.length || value.offers.some(id => !HOLIDAY_OFFERS.some(offer => offer.id === id))) errors.offers = 'Please select at least one offer.';
  if (!value.offers.includes('bogo')) value.packageId = '';
  if (value.packageId && value.packageId !== 'not-sure' && !HOLIDAY_PACKAGES.some(pkg => pkg.id === value.packageId)) errors.packageId = 'Please select one of the listed packages.';
  if (!value.reservationConsent) errors.reservationConsent = 'Please allow our team to follow up about your reservation.';
  if (typeof data.marketingConsent !== 'boolean') errors.marketingConsent = 'Please confirm your email preference.';
  if (value.website) errors.website = 'Unable to accept this submission.';
  return { value, errors };
}
