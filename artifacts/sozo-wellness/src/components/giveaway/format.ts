export const RECEIPT_KEY = 'sozo-giveaway-receipt';
export const SOZO_PHONE_HREF = 'tel:+13528022248';
export const SOZO_PHONE = '352-802-2248';

export function formatEastern(iso: string | null | undefined, withTime = true): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', dateStyle: 'long', ...(withTime ? { timeStyle: 'short' } : {}),
  }).format(d) + (withTime ? ' ET' : '');
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);
}

export function readReceipt(): string | null {
  try { return window.sessionStorage.getItem(RECEIPT_KEY); } catch { return null; }
}
