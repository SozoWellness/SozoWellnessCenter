import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Gift, Phone, ArrowDown, Leaf } from 'lucide-react';
import { AssessmentTurnstile } from '@/components/assessment-turnstile';
import {
  HOLIDAY_ERROR, HOLIDAY_MARKETING_CONSENT, HOLIDAY_OFFERS, HOLIDAY_PACKAGES, RESERVATION_CONSENT,
  validateHolidayClaim, type HolidayAvailability, type HolidayClaim, type HolidayFieldErrors, type HolidayResult,
} from '@/lib/holiday-offers';
import './holiday-offers.css';

const BASE = import.meta.env.BASE_URL;
// /api belongs to the shared API artifact in Replit. Production uses Pages.
const CLAIM_API = `${BASE}${import.meta.env.DEV ? '__holiday-preview/claim' : 'api/claim'}`;
const PHONE_HREF = 'tel:+13528022248';
const money = (n: number) => `$${n.toLocaleString('en-US')}`;

type FormState = Omit<HolidayClaim, 'turnstileToken'>;
const EMPTY: FormState = {
  firstName: '', lastName: '', email: '', phone: '', offers: [], packageId: '',
  reservationConsent: false, marketingConsent: false, website: '',
};

function availabilityMessage(a: HolidayAvailability | null, failed: boolean): { tone: '' | 'warn' | 'error'; text: string } | null {
  if (failed) return { tone: 'error', text: `We couldn't confirm reservation availability right now. ${HOLIDAY_ERROR}.` };
  if (!a) return null;
  if (a.testMode) return {
    tone: 'warn',
    text: 'Controlled test only: use the approved test email and leave promotional emails unchecked. This submission saves a real Mailchimp contact; it does not purchase or reserve a live offer.',
  };
  switch (a.reason) {
    case 'open': return a.accepting ? null : { tone: 'warn', text: 'Reservations are not being accepted at the moment. Please call 352-802-2248.' };
    case 'upcoming': return { tone: 'warn', text: 'Reservations open Friday, November 27, 2026. Please come back then, or call 352-802-2248 with questions.' };
    case 'closed': return { tone: 'warn', text: 'This holiday offer has ended and reservations are closed. Call 352-802-2248 to ask about current offers.' };
    case 'disabled': return { tone: 'warn', text: 'This page is a draft preview and is not accepting reservations yet.' };
    default: return { tone: 'error', text: `Reservations are temporarily unavailable. ${HOLIDAY_ERROR}.` };
  }
}

export function HolidayOffersPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<HolidayFieldErrors>({});
  const [availability, setAvailability] = useState<HolidayAvailability | null>(null);
  const [availFailed, setAvailFailed] = useState(false);
  const [token, setToken] = useState('');
  const [revision, setRevision] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);
  const successHeading = useRef<HTMLHeadingElement>(null);
  const onToken = useCallback((t: string) => setToken(t), []);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(CLAIM_API, { signal: ctrl.signal, credentials: 'same-origin', headers: { Accept: 'application/json' } })
      .then(async r => {
        const body = await r.json() as HolidayAvailability;
        if (!r.ok || typeof body?.accepting !== 'boolean') throw new Error('bad');
        setAvailability(body);
      })
      .catch(err => { if (!ctrl.signal.aborted && (err as Error).name !== 'AbortError') setAvailFailed(true); });
    return () => ctrl.abort();
  }, []);

  useEffect(() => { if (success) successHeading.current?.focus(); }, [success]);

  const accepting = availability?.accepting === true;
  const loading = !availability && !availFailed;
  const status = availabilityMessage(availability, availFailed);
  const bogo = form.offers.includes('bogo');

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => (e[key] ? { ...e, [key]: undefined } : e));
  };
  const toggleOffer = (id: string, checked: boolean) => {
    setForm(f => {
      const offers = checked ? [...f.offers, id] : f.offers.filter(o => o !== id);
      return { ...f, offers, packageId: offers.includes('bogo') ? f.packageId : '' };
    });
    setErrors(e => ({ ...e, offers: undefined, packageId: undefined }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accepting || !token || submitting) return;
    setFormError('');
    const { errors: found } = validateHolidayClaim({ ...form, turnstileToken: token });
    const clientErrors = { ...found };
    delete clientErrors.turnstileToken;
    if (Object.values(clientErrors).some(Boolean)) {
      setErrors(clientErrors);
      const first = (['firstName', 'lastName', 'email', 'phone', 'offers', 'packageId', 'reservationConsent'] as const).find(k => clientErrors[k]);
      if (first) document.getElementById(`ho-${first}`)?.focus();
      return;
    }
    const payload: HolidayClaim = { ...form, packageId: bogo ? form.packageId : '', turnstileToken: token };
    setSubmitting(true);
    try {
      const r = await fetch(CLAIM_API, {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      let body: HolidayResult | null = null;
      try { body = await r.json() as HolidayResult; } catch { body = null; }
      if (r.ok && body?.ok === true) { setSuccess(true); return; }
      if (body?.fieldErrors) setErrors(body.fieldErrors);
      setFormError(body?.error || HOLIDAY_ERROR);
    } catch {
      setFormError(HOLIDAY_ERROR);
    } finally {
      setSubmitting(false);
      setRevision(v => v + 1);
    }
  };

  const fieldProps = (key: keyof FormState) => ({
    id: `ho-${key}`, 'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `ho-${key}-err` : undefined,
  });
  const Err = ({ k }: { k: keyof HolidayClaim }) => errors[k]
    ? <p className="ho-err" id={`ho-${k}-err`} data-testid={`error-${k}`}>{errors[k]}</p> : null;

  const scrollToClaim = () => {
    const el = document.getElementById('claim');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    window.setTimeout(() => document.getElementById('ho-firstName')?.focus({ preventScroll: true }), reduce ? 0 : 600);
  };

  return <div className="ho">
    <a className="ho-skip" href="#claim">Skip to reservation form</a>
    <header className="ho-header">
      <div className="ho-wrap">
        <span className="ho-logo"><img src={`${BASE}images/sozo-logo.png`} alt="SOZO Wellness Center" width={64} height={64} /></span>
        <a className="ho-phone" href={PHONE_HREF} data-testid="link-header-phone"><Phone size={18} aria-hidden="true" />352-802-2248</a>
      </div>
    </header>
    <div className="ho-ribbon-bar" aria-hidden="true" />

    <main>
      <section className="ho-hero" aria-labelledby="ho-title">
        <Leaf className="ho-leaf" size={260} style={{ right: -60, bottom: -60 }} aria-hidden="true" />
        <div className="ho-wrap ho-hero-grid">
          <div>
            <span className="ho-eyebrow ho-fade">Black Friday – Cyber Monday</span>
            <h1 id="ho-title" className="ho-fade ho-d1">Give the Gift of <em>Wellness</em></h1>
            <p className="ho-sub ho-fade ho-d1">Two limited-time holiday offers. Reserve yours now — no payment needed.</p>
            <div className="ho-badge ho-fade ho-d2"><small>Reservation dates</small><strong>Nov 27 – 30, 2026</strong></div>
            <button type="button" className="ho-cta ho-fade ho-d2" onClick={scrollToClaim} data-testid="button-claim-offer">
              Claim My Offer <ArrowDown size={20} aria-hidden="true" />
            </button>
          </div>
          <div className="ho-hero-art ho-fade ho-d1">
            <img src={`${BASE}images/holiday-2026/bf-bogo-hero.webp`} alt="SOZO Wellness Center holiday Buy One, Gift One campaign artwork" width={1200} height={800} />
          </div>
        </div>
      </section>

      <section className="ho-section" aria-labelledby="ho-offers-title">
        <div className="ho-wrap">
          <div className="ho-section-head">
            <span className="ho-eyebrow">Two holiday offers</span>
            <h2 id="ho-offers-title">Something for you, something to give.</h2>
          </div>

          <article className="ho-offer" aria-labelledby="ho-offer1" data-testid="card-offer-bogo">
            <span className="ho-offer-tag">Offer 1</span>
            <h3 id="ho-offer1">Buy One, Gift One: Wellness Credit Packages</h3>
            <div className="ho-offer-split">
              <div>
                <p>Buy any Wellness Credit package and gift the same package, or one of equal or lesser value, to anyone you love — new to Sozo or already part of the family.</p>
                <ul className="ho-packages">
                  {HOLIDAY_PACKAGES.map(p => <li key={p.id} className="ho-pkg" data-testid={`card-package-${p.id}`}>
                    <h4>{p.name}</h4>
                    <div className="meta"><span>{p.credits} credits</span><span className="price">{money(p.price)}</span></div>
                  </li>)}
                </ul>
                <p className="ho-fine">Valid for reservations made 11/27/2026–11/30/2026. One gift per package purchased. Gift credits expire March 31, 2027.</p>
              </div>
              <div className="ho-packages-art">
                <img src={`${BASE}images/holiday-2026/bf-bogo-packages.webp`} alt="Wellness Credit package options for the Buy One, Gift One offer" width={1200} height={1500} loading="lazy" />
              </div>
            </div>
          </article>

          <article className="ho-offer" aria-labelledby="ho-offer2" data-testid="card-offer-gift-card">
            <span className="ho-offer-tag">Offer 2</span>
            <h3 id="ho-offer2">Bonus Gift Card Offer</h3>
            <div className="ho-giftcard">
              <div className="ho-card-visual" aria-hidden="true"><small>SOZO Gift Card</small><span>$500 + $100</span></div>
              <div>
                <p className="ho-copy-lead">Looking for the perfect holiday gift?</p>
                <p>Purchase a $500 SOZO Gift Card and receive a BONUS $100 Gift Card FREE.</p>
                <p>Give the gift of wellness while receiving a little extra for yourself or someone special.</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section id="claim" className="ho-section ho-claim" aria-labelledby="ho-claim-title">
        <div className="ho-wrap ho-claim-grid">
          <div className="ho-claim-aside">
            <span className="ho-eyebrow">Reserve your offer</span>
            <div className="ho-section-head"><h2 id="ho-claim-title">Hold your holiday gift.</h2></div>
            <p>Share a few details and we will set your offer aside. Nothing is charged here — our team will reach out after the holiday to complete your reservation.</p>
            <p>Prefer to talk it through? <a href={PHONE_HREF} data-testid="link-claim-phone">Call 352-802-2248</a>.</p>
          </div>

          <div className="ho-form" aria-live="polite">
            {success ? <div className="ho-success" data-testid="status-success">
              <Gift className="ho-bow" size={54} aria-hidden="true" />
              <h2 ref={successHeading} tabIndex={-1}>You're on the list!</h2>
              <p>Thank you for reserving your Sozo holiday offer. Our team will contact you after the office re-opens following the holiday to finish everything up.</p>
              <p>Questions? Call <a href={PHONE_HREF} data-testid="link-success-phone">352-802-2248</a>.</p>
            </div> : <form noValidate onSubmit={onSubmit} aria-labelledby="ho-claim-title">
              {loading && <div className="ho-status" data-testid="status-availability-loading" aria-label="Checking reservation availability"><div className="ho-skel" /></div>}
              {status && <div className={`ho-status ${status.tone}`} role="status" data-testid="status-availability">{status.text}</div>}

              <div className="ho-grid">
                <div className="ho-field">
                  <label htmlFor="ho-firstName">First name <span className="ho-req">(required)</span></label>
                  <input {...fieldProps('firstName')} autoComplete="given-name" value={form.firstName} onChange={e => set('firstName', e.target.value)} required data-testid="input-first-name" />
                  <Err k="firstName" />
                </div>
                <div className="ho-field">
                  <label htmlFor="ho-lastName">Last name <span className="ho-req">(required)</span></label>
                  <input {...fieldProps('lastName')} autoComplete="family-name" value={form.lastName} onChange={e => set('lastName', e.target.value)} required data-testid="input-last-name" />
                  <Err k="lastName" />
                </div>
                <div className="ho-field">
                  <label htmlFor="ho-email">Email address <span className="ho-req">(required)</span></label>
                  <input {...fieldProps('email')} type="email" inputMode="email" autoComplete="email" value={form.email} onChange={e => set('email', e.target.value)} required data-testid="input-email" />
                  <Err k="email" />
                </div>
                <div className="ho-field">
                  <label htmlFor="ho-phone">Phone number <span className="ho-req">(required)</span></label>
                  <input {...fieldProps('phone')} type="tel" inputMode="tel" autoComplete="tel" placeholder="352-555-0123" value={form.phone} onChange={e => set('phone', e.target.value)} required data-testid="input-phone" />
                  <Err k="phone" />
                </div>
              </div>

              <fieldset className="ho-fieldset" aria-describedby={errors.offers ? 'ho-offers-err' : undefined}>
                <legend className="ho-legend">Offer(s) I'm interested in <span className="ho-req">(choose at least one)</span></legend>
                {HOLIDAY_OFFERS.map((o, i) => <label key={o.id} className="ho-check">
                  <input type="checkbox" id={i === 0 ? 'ho-offers' : undefined} checked={form.offers.includes(o.id)}
                    onChange={e => toggleOffer(o.id, e.target.checked)} aria-invalid={errors.offers ? true : undefined}
                    data-testid={`checkbox-offer-${o.id}`} />
                  <span>{o.label}</span>
                </label>)}
                <Err k="offers" />
              </fieldset>

              {bogo && <div className="ho-field ho-reveal">
                <label htmlFor="ho-packageId">Package I'm interested in <span className="ho-req">(optional)</span></label>
                <select {...fieldProps('packageId')} value={form.packageId} onChange={e => set('packageId', e.target.value)} data-testid="select-package">
                  <option value="">Choose a package</option>
                  {HOLIDAY_PACKAGES.map(p => <option key={p.id} value={p.id}>{p.name} — {p.credits} credits — {money(p.price)}</option>)}
                  <option value="not-sure">Not sure yet</option>
                </select>
                <Err k="packageId" />
              </div>}

              <div className="ho-fieldset">
                <label className="ho-check">
                  <input type="checkbox" id="ho-reservationConsent" checked={form.reservationConsent}
                    onChange={e => set('reservationConsent', e.target.checked)} required
                    aria-invalid={errors.reservationConsent ? true : undefined}
                    aria-describedby={errors.reservationConsent ? 'ho-reservationConsent-err' : undefined}
                    data-testid="checkbox-reservation-consent" />
                  <span>{RESERVATION_CONSENT} <span className="ho-req">(required)</span></span>
                </label>
                <Err k="reservationConsent" />
                <label className="ho-check">
                  <input type="checkbox" id="ho-marketingConsent" checked={form.marketingConsent}
                    onChange={e => set('marketingConsent', e.target.checked)} data-testid="checkbox-marketing-consent" />
                  <span>{HOLIDAY_MARKETING_CONSENT} <span className="ho-req">(optional)</span></span>
                </label>
                <Err k="marketingConsent" />
              </div>

              <div className="ho-hp" aria-hidden="true">
                <label htmlFor="ho-website">Website</label>
                <input id="ho-website" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={e => set('website', e.target.value)} data-testid="input-website" />
              </div>

              {accepting && <AssessmentTurnstile siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY} revision={revision}
                onToken={onToken} action="holiday_claim" testId="holiday-turnstile" />}

              {formError && <div className="ho-status error" role="alert" data-testid="status-form-error">
                {formError} <a href={PHONE_HREF}>Call 352-802-2248</a>. Your details are still filled in.
              </div>}

              <button type="submit" className="ho-submit" disabled={!accepting || !token || submitting} aria-busy={submitting} data-testid="button-submit">
                {submitting ? 'Reserving…' : 'Reserve My Offer'}
              </button>
              <p className="ho-note">No payment or credit card required. Our team will reach out after the holiday to complete your reservation.</p>
            </form>}
          </div>
        </div>
      </section>
    </main>

    <footer className="ho-footer">
      <div className="ho-wrap">
        <p className="lead">These special offers are available for a limited time during our Black Friday promotion.</p>
        <address>
          <strong>Sozo Wellness Center of The Villages</strong><br />
          5029 CR 159, Wildwood, FL 34785<br />
          <a href={PHONE_HREF} data-testid="link-footer-phone">352-802-2248</a><br />
          <a href={BASE} data-testid="link-footer-website">SozoRootedWellness.com</a>
        </address>
      </div>
    </footer>
  </div>;
}
