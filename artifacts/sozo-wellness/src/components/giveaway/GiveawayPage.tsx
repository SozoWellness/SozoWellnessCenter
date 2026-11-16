import { useCallback, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { CalendarClock, CheckCircle2, Info, Lock, Phone, ShieldCheck } from 'lucide-react';
import { AssessmentTurnstile } from '@/components/assessment-turnstile';
import { WELLNESS_GOALS, giveawayAttribution, useEnterGiveaway, useGiveawayAvailability } from '@/lib/giveaway-client';
import { RECEIPT_KEY, formatEastern } from './format';
import './giveaway.css';

type Errors = Partial<Record<'firstName' | 'email' | 'phone' | 'marketingConsent' | 'rulesAccepted' | 'eligible' | 'turnstile', string>>;
const CONSENT = 'I agree to receive wellness information, educational resources, and occasional promotional emails from SOZO Wellness Center. I understand I can unsubscribe at any time.';

export function GiveawayPage() {
  const availability = useGiveawayAvailability();
  const enter = useEnterGiveaway();
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ firstName: '', email: '', phone: '', wellnessInterest: '', website: '' });
  const [checks, setChecks] = useState({ marketingConsent: false, rulesAccepted: false, eligible: false });
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState('');
  const [savedId, setSavedId] = useState('');
  const [token, setToken] = useState('');
  const [revision, setRevision] = useState(0);
  const alertRef = useRef<HTMLDivElement>(null);
  const onToken = useCallback((t: string) => setToken(t), []);

  const accepting = availability.data?.acceptingEntries === true;
  const campaign = availability.data?.campaign;
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

  function validate(): Errors {
    const e: Errors = {};
    if (!form.firstName.trim()) e.firstName = 'Please enter your first name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Please enter a valid email address.';
    if (!/^(?:1)?[2-9]\d{9}$/.test(form.phone.replace(/[\s().+-]/g, ''))) e.phone = 'Please enter a valid US mobile number, including its area code.';
    if (!checks.marketingConsent) e.marketingConsent = 'Please check the email agreement to enter.';
    if (!checks.rulesAccepted) e.rulesAccepted = 'Please accept the Official Rules.';
    if (!checks.eligible) e.eligible = 'Please confirm you are a Florida legal resident age 18 or older.';
    if (!token) e.turnstile = 'Please wait for the security check to finish.';
    return e;
  }

  function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!accepting || enter.isPending) return;
    setServerError('');
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) { requestAnimationFrame(() => alertRef.current?.focus()); return; }
    enter.mutate({
      firstName: form.firstName.trim(), email: form.email.trim(), phone: form.phone.trim(),
      wellnessInterest: form.wellnessInterest || undefined, website: form.website,
      ...checks, turnstileToken: token, attribution: giveawayAttribution(),
    }, {
      onSuccess: (res) => {
        setSavedId(res.entryId);
        try { window.sessionStorage.setItem(RECEIPT_KEY, res.entryId); } catch { /* storage unavailable; inline receipt shown */ }
        try { navigate('/giveaway/thank-you'); } catch { /* inline receipt remains visible */ }
      },
      onError: (err) => {
        setServerError(err instanceof Error ? err.message : 'Your entry could not be submitted.');
        setToken(''); setRevision((r) => r + 1);
        requestAnimationFrame(() => alertRef.current?.focus());
      },
    });
  }

  const field = (key: 'firstName' | 'email' | 'phone', label: string, type: string, auto: string, hint?: string) => (
    <div className="form-field gw-field full">
      <label htmlFor={`gw-${key}`}>{label} <span aria-hidden="true">*</span></label>
      <input id={`gw-${key}`} type={type} autoComplete={auto} inputMode={type === 'tel' ? 'tel' : undefined} required
        maxLength={key === 'firstName' ? 80 : key === 'email' ? 254 : 30}
        value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        aria-invalid={errors[key] ? 'true' : undefined}
        aria-describedby={[hint ? `gw-${key}-hint` : '', errors[key] ? `gw-${key}-err` : ''].join(' ').trim() || undefined}
        data-testid={`input-${key}`} />
      {hint && <p className="gw-hint" id={`gw-${key}-hint`}>{hint}</p>}
      {errors[key] && <p className="gw-err" id={`gw-${key}-err`}>{errors[key]}</p>}
    </div>
  );
  const check = (key: keyof typeof checks, children: ReactNode) => (
    <div>
      <label className="gw-check" data-invalid={errors[key] ? 'true' : undefined}>
        <input type="checkbox" checked={checks[key]} onChange={(e) => setChecks({ ...checks, [key]: e.target.checked })}
          aria-invalid={errors[key] ? 'true' : undefined} aria-describedby={errors[key] ? `gw-${key}-err` : undefined} required data-testid={`checkbox-${key}`} />
        <span>{children}</span>
      </label>
      {errors[key] && <p className="gw-err" id={`gw-${key}-err`} style={{ marginTop: 6 }}>{errors[key]}</p>}
    </div>
  );
  const errorList = Object.values(errors).filter(Boolean);

  return (
    <div className="gw">
      <section className="gw-hero">
        <div className="gw-hero-grid">
          <div className="gw-hero-copy fade-up">
            <span className="eyebrow">SOZO Wellness Center · Giveaway</span>
            <h1 data-testid="text-giveaway-headline"><span className="gw-kicker">ENTER TO WIN</span>10 FREE HYPERBARIC <em>OXYGEN THERAPY SESSIONS</em></h1>
            <p className="gw-hero-sub">Discover one of SOZO’s most popular wellness services and enter for a chance to win ten complimentary Hyperbaric Oxygen Therapy sessions.</p>
            <AvailabilityNote loading={availability.isLoading} error={availability.isError} onRetry={() => availability.refetch()}
              accepting={accepting} message={availability.data?.message} endsAt={campaign?.endsAt} />
            <div className="gw-hero-actions">
              <a href="#enter" className="btn btn-primary" data-testid="link-jump-entry">{accepting ? 'Start my entry' : 'Preview the entry form'}</a>
              <Link href="/official-rules" className="btn btn-outline" data-testid="link-hero-rules">Official Rules</Link>
            </div>
          </div>
          <div className="gw-hero-photo">
            <img src="/images/hyperbaric-chamber.png" alt="The hyperbaric oxygen chamber at SOZO Wellness Center" data-testid="img-chamber" />
            <div className="gw-ticket"><strong>10 sessions</strong>One winner. No purchase necessary.</div>
          </div>
        </div>
      </section>

      <section className="gw-band">
        <div className="container gw-band-grid">
          <div><span className="eyebrow light">About the prize</span><h2>Recovery starts at the cellular level.</h2></div>
          <p>Hyperbaric Oxygen Therapy supports oxygen delivery throughout the body and is a cornerstone of many wellness journeys. Our team will talk with the winner about scheduling and whether sessions are a good fit before getting started.</p>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 30 }}>
        <div className="container">
          <ol className="gw-steps">
            <li><span>01</span><h3>Share a few details</h3><p>First name, email, and mobile number. That is all. No health history needed.</p></li>
            <li><span>02</span><h3>We draw after close</h3><p>One winner is selected at random from all eligible entries after the giveaway ends.</p></li>
            <li><span>03</span><h3>We reach out directly</h3><p>The winner is contacted by email and/or phone by our SOZO team.</p></li>
          </ol>
        </div>
      </section>

      <section className="section" id="enter" style={{ paddingTop: 50, scrollMarginTop: 100 }}>
        <div className="container gw-entry">
          <div className="gw-aside">
            <span className="eyebrow">Your entry</span>
            <h2>Comfortable, quick, and private.</h2>
            <p>Share your details for a chance to experience ten complimentary sessions with our team.</p>
            <ul>
              <li><Phone size={18} aria-hidden="true" />Your phone number is used only to contact the giveaway winner. Entering does not sign you up for marketing text messages.</li>
              <li><ShieldCheck size={18} aria-hidden="true" />One entry per person. A purchase or payment will not improve your chances.</li>
              <li><Lock size={18} aria-hidden="true" />See our <Link href="/privacy-policy" style={{ textDecoration: 'underline', display: 'contents' }} data-testid="link-aside-privacy">Privacy Policy</Link> for how we handle your information.</li>
            </ul>
          </div>

          <form className="gw-form" onSubmit={onSubmit} noValidate aria-describedby="gw-req" data-testid="form-giveaway">
            <h2>Enter the giveaway</h2>
            <p className="gw-req" id="gw-req">Fields marked * are required.</p>
            {!accepting && !availability.isLoading && (
              <div className="gw-status closed" role="status" style={{ marginTop: 0, marginBottom: 22 }}>
                <Info size={18} aria-hidden="true" />
                <span><strong>Entries are not open right now.</strong>{availability.data?.message || 'This form is shown as a preview. Please check back soon or call our team.'}</span>
              </div>
            )}
            <fieldset disabled={!accepting || enter.isPending}>
              <div className="form-grid">
                {field('firstName', 'First name', 'text', 'given-name')}
                {field('email', 'Email address', 'email', 'email')}
                {field('phone', 'Mobile phone', 'tel', 'tel', 'Used only to contact the winner. No marketing texts.')}
                <div className="form-field full">
                  <label htmlFor="gw-goals">What wellness goal interests you most? <span style={{ fontWeight: 500 }}>(optional)</span></label>
                  <select id="gw-goals" value={form.wellnessInterest} onChange={e => setForm({ ...form, wellnessInterest: e.target.value })} data-testid="select-wellness-goal">
                    <option value="">Select a goal</option>
                    {WELLNESS_GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div className="gw-hp" aria-hidden="true">
                <label htmlFor="gw-website">Website</label>
                <input id="gw-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              </div>
              <div className="gw-checks">
                {check('marketingConsent', <>{CONSENT} <em style={{ fontStyle: 'normal', fontWeight: 600 }}>(Email only.)</em></>)}
                {check('rulesAccepted', <>I have read and agree to the <Link href="/official-rules" target="_blank" rel="noopener noreferrer" aria-label="Official Rules (opens in a new tab)" data-testid="link-form-rules">Official Rules</Link>.</>)}
                {check('eligible', <>I am a legal resident of Florida and 18 years of age or older.</>)}
              </div>
              <div style={{ marginTop: 22 }}>
                {accepting ? (
                  <AssessmentTurnstile siteKey={siteKey} revision={revision} onToken={onToken} action="giveaway_entry" testId="turnstile-giveaway" />
                ) : <p className="gw-hint">A brief security check appears here when entries open.</p>}
                {errors.turnstile && <p className="gw-err" style={{ marginTop: 6 }}>{errors.turnstile}</p>}
              </div>
            </fieldset>

            <div ref={alertRef} tabIndex={-1} aria-live="assertive" style={{ outline: 'none' }}>
              {errorList.length > 0 && (
                <div className="gw-alert" role="alert" data-testid="status-validation">
                  <strong>Please check {errorList.length === 1 ? 'one item' : `${errorList.length} items`}:</strong>
                  <ul>{errorList.map((m) => <li key={m}>{m}</li>)}</ul>
                </div>
              )}
              {serverError && <div className="gw-alert" role="alert" data-testid="status-server-error"><strong>We couldn’t confirm this submission.</strong> {serverError}</div>}
            </div>
            {savedId && (
              <div className="gw-ok" role="status" data-testid="status-entry-saved">
                <strong>Your entry was received.</strong> Receipt ID <code>{savedId}</code>. <Link href="/giveaway/thank-you" style={{ textDecoration: 'underline' }}>Continue</Link>
              </div>
            )}

            <button type="submit" className="btn btn-primary gw-submit" disabled={!accepting || enter.isPending || !!savedId} data-testid="button-submit-entry">
              {enter.isPending ? 'Submitting your entry…' : accepting ? 'ENTER TO WIN' : 'Entries not open yet'}
            </button>
            <p className="gw-fine">No purchase necessary. Void where prohibited. See <Link href="/official-rules">Official Rules</Link> and <Link href="/privacy-policy">Privacy Policy</Link>.</p>
          </form>
        </div>
      </section>
    </div>
  );
}

function AvailabilityNote({ loading, error, onRetry, accepting, message, endsAt }: {
  loading: boolean; error: boolean; onRetry: () => void; accepting: boolean; message?: string; endsAt?: string;
}) {
  if (loading) return <div className="gw-skel" style={{ height: 76, maxWidth: 560, marginTop: 26 }} aria-label="Checking giveaway status" />;
  if (error) return (
    <div className="gw-status closed" role="alert" data-testid="status-availability-error">
      <Info size={18} aria-hidden="true" />
      <span><strong>We could not check the giveaway status.</strong>Please try again in a moment. <button type="button" className="btn-text" onClick={onRetry} style={{ background: 'none', border: 0, borderBottom: '1px solid', padding: 0 }} data-testid="button-retry-availability">Try again</button></span>
    </div>
  );
  return (
    <div className={`gw-status${accepting ? '' : ' closed'}`} role="status" data-testid="status-availability">
      {accepting ? <CheckCircle2 size={18} aria-hidden="true" /> : <CalendarClock size={18} aria-hidden="true" />}
      <span><strong>{accepting ? 'Entries are open' : 'Entries are not open yet'}</strong>
        {accepting && endsAt ? `Enter by ${formatEastern(endsAt)}.` : message}</span>
    </div>
  );
}
