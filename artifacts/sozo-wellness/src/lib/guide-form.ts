import { perfectDayBook } from '../data/perfect-day.ts';

export type GuideFailure = { message: string; locked: boolean };

export type GuideReceipt = { message: string; downloadUrl: string; requestId: string };

/** Only accept a receipt that is explicitly successful and points at the approved book link. */
export function validateGuideReceipt(value: unknown, requestId: string): GuideReceipt | null {
  if (!value || typeof value !== 'object') return null;
  const r = value as Record<string, unknown>;
  if (r.success !== true) return null;
  if (r.downloadUrl !== perfectDayBook.downloadUrl) return null;
  if (r.requestId !== requestId) return null;
  const message = typeof r.message === 'string' && r.message.trim() ? r.message.trim().slice(0, 400) : '';
  return { message, downloadUrl: perfectDayBook.downloadUrl, requestId };
}

function serverText(data: unknown): { text?: string; unconfirmed: boolean } {
  if (!data || typeof data !== 'object') return { unconfirmed: false };
  const d = data as Record<string, unknown>;
  const text = typeof d.error === 'string' && d.error.trim() ? d.error.trim().slice(0, 400) : undefined;
  return { text, unconfirmed: d.deliveryUnconfirmed === true };
}

const CHECK_FIRST = 'Please don’t send it again yet. We can’t confirm whether your request went through. Check your inbox and spam folder, or call or text 352-802-2248 so we can check for you.';

/** Map any mutation failure to a safe message. `locked` means resubmitting must be blocked. */
export function describeGuideError(error: unknown): GuideFailure {
  const e = error as { status?: unknown; data?: unknown } | null;
  const status = e && typeof e.status === 'number' ? e.status : undefined;
  if (status === undefined) {
    return { locked: true, message: `We couldn’t reach our server, or the reply was unclear. ${CHECK_FIRST}` };
  }
  const { text, unconfirmed } = serverText(e?.data);
  // Only our endpoint's explicit JSON rejections prove no forwarding occurred.
  // A 2xx parse failure or a proxy's HTML error may follow an accepted request.
  const retryable = text !== undefined && [400, 403, 413, 415, 429, 503].includes(status);
  if (unconfirmed || !retryable) {
    return { locked: true, message: `${text ? `${text} ` : ''}${CHECK_FIRST}` };
  }
  return { locked: false, message: text };
}
