import { useCallback, useState, type FormEvent } from 'react';
import { Link } from 'wouter';
import { AlertTriangle, ArrowRight, BookOpen, Check, Clock, Download, Phone, RefreshCw } from 'lucide-react';
import { useGetGuideAvailability, useSubmitGuideRequest } from '@workspace/api-client-react';
import { perfectDayBook } from '@/data/perfect-day';
import { AssessmentTurnstile } from '@/components/assessment-turnstile';
import { describeGuideError, validateGuideReceipt, type GuideFailure, type GuideReceipt } from '@/lib/guide-form';
import './perfect-day-book.css';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
const PHONE_HREF = 'tel:+13528022248';

export function PerfectDayInvitation() {
  const { data, isLoading, isError } = useGetGuideAvailability({ query: { retry: false, queryKey: ['/api/guide-requests'] } });
  const mode = !isLoading && !isError && data?.enabled ? data.mode : 'disabled';
  const label = mode === 'live' ? 'Free PDF' : mode === 'test' ? 'Restricted test' : 'Coming soon';
  return <section className="hd-guide" data-testid="section-guide"><div className="container"><div className="hd-guide-box pd-teaser">
    <img src={perfectDayBook.cover} alt={`Cover of ${perfectDayBook.title} by ${perfectDayBook.author}`} width={240} height={320} loading="lazy"/>
    <div>
      <span className="hd-soon">{label}</span>
      <h2 className="serif">{perfectDayBook.title}</h2>
      <p>A free reading resource by {perfectDayBook.author}, with ideas on mindset, daily routines and self-care to bring into a conversation with our team.{mode === 'live' ? ' Ask for your copy and we’ll show the link right away.' : ' You can read about the book now; online requests open once setup is finished.'}</p>
      <div className="hd-guide-actions"><Link href="/perfect-day-lifestyle" className="btn btn-primary" data-testid="link-guide-page">{mode === 'live' ? 'Get the free book' : 'About the book'} <ArrowRight size={16} aria-hidden="true"/></Link></div>
    </div>
  </div></div></section>;
}

function GuideRequestForm() {
  const availability = useGetGuideAvailability({ query: { retry: false, queryKey: ['/api/guide-requests'] } });
  const mutation = useSubmitGuideRequest({ mutation: { retry: false } });
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [marketing, setMarketing] = useState(false);
  const [website, setWebsite] = useState('');
  const [token, setToken] = useState('');
  const onToken = useCallback((t: string) => setToken(t), []);
  const [revision, setRevision] = useState(0);
  const [failure, setFailure] = useState<GuideFailure | null>(null);
  const [receipt, setReceipt] = useState<GuideReceipt | null>(null);
  const [sending, setSending] = useState(false);

  const mode = availability.data?.enabled ? availability.data.mode : 'disabled';
  const open = !availability.isLoading && !availability.isError && (mode === 'live' || mode === 'test');
  const locked = failure?.locked === true;
  const fieldsDisabled = !open || sending || locked;
  const canSubmit = open && !sending && !locked && !!token && !!TURNSTILE_SITE_KEY;

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    const requestId = crypto.randomUUID();
    setSending(true); setFailure(null);
    try {
      const result = await mutation.mutateAsync({ data: { firstName: firstName.trim(), email: email.trim(), marketingConsent: marketing, requestId, turnstileToken: token, website } });
      const ok = validateGuideReceipt(result, requestId);
      if (ok) setReceipt(ok);
      else setFailure({ locked: true, message: 'We received an unexpected reply and can’t confirm your request. Please don’t send it again yet; call or text 352-802-2248 and we’ll check for you.' });
    } catch (err) {
      setFailure(describeGuideError(err));
    } finally {
      setSending(false);
      setToken('');
      setRevision(r => r + 1);
    }
  }

  if (receipt) return <div className="pd-success" data-testid="guide-success" role="status">
    <h3>Your book is ready to open.</h3>
    <p>{receipt.message || 'Thank you, your request was accepted for processing. An email with the same link has been requested; please check your inbox and spam folder.'}</p>
    <p><a href={receipt.downloadUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" data-testid="link-guide-download"><Download size={17} aria-hidden="true"/> Open or download the PDF</a></p>
    <p className="pd-notice">The file is about {perfectDayBook.sizeLabel.replace(/^About /i, '').toLowerCase()} and opens in Google Drive.</p>
  </div>;

  return <form className="pd-card" onSubmit={submit} noValidate={false} aria-busy={sending}>
    {availability.isLoading && <div aria-label="Checking availability"><div className="pd-skel" style={{ width: '70%' }}/><div className="pd-skel" style={{ width: '45%' }}/></div>}
    {availability.isError && <div className="pd-status is-error" data-testid="guide-unavailable" role="alert"><AlertTriangle size={18} aria-hidden="true"/><div>We couldn’t check whether book requests are open. Nothing has been sent.<br/><button type="button" className="btn btn-secondary" onClick={() => void availability.refetch()} disabled={availability.isFetching}><RefreshCw size={15} aria-hidden="true"/> Retry availability</button></div></div>}
    {!availability.isLoading && !availability.isError && !open && <div className="pd-status is-soon" data-testid="guide-unavailable" role="status"><Clock size={18} aria-hidden="true"/><div><strong>Coming soon.</strong> Setup for online book requests is still in progress, so this form is paused and no email addresses are being saved.</div></div>}
    {open && mode === 'test' && <div className="pd-status is-test" role="status"><AlertTriangle size={18} aria-hidden="true"/><div><strong>Restricted test.</strong> Requests are limited to approved test addresses while we finish setup. Other addresses will not be accepted.</div></div>}

    <div className="pd-field"><label htmlFor="guide-first-name">First name</label>
      <input id="guide-first-name" name="firstName" autoComplete="given-name" required maxLength={80} value={firstName} onChange={e => setFirstName(e.target.value)} disabled={fieldsDisabled} data-testid="input-guide-first-name"/></div>
    <div className="pd-field"><label htmlFor="guide-email">Email address</label>
      <input id="guide-email" name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} disabled={fieldsDisabled} data-testid="input-guide-email"/></div>
    <div className="pd-hp" aria-hidden="true"><label htmlFor="guide-website">Website</label><input id="guide-website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)}/></div>

    <p className="pd-notice">Requesting the book lets us send you one email with your link. That’s all. Please don’t include any health details. See our <Link href="/privacy-policy">Privacy Policy</Link>.</p>
    <label className="pd-check"><input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)} disabled={fieldsDisabled} data-testid="checkbox-guide-marketing"/>
      <span>Optional: I’d also like occasional SOZO news and offers by email. I can unsubscribe at any time.</span></label>

    {open && !locked && <AssessmentTurnstile siteKey={TURNSTILE_SITE_KEY} revision={revision} onToken={onToken} action="guide_request" testId="guide-turnstile"/>}

    {failure && <div className="pd-status is-error" data-testid="guide-error" role="alert"><AlertTriangle size={18} aria-hidden="true"/><div>{failure.message}{failure.locked && <><br/><a href={PHONE_HREF} className="btn btn-secondary"><Phone size={15} aria-hidden="true"/> Call 352-802-2248</a></>}</div></div>}

    <button type="submit" className="btn btn-primary pd-submit" disabled={!canSubmit} data-testid="button-guide-submit">
      {sending ? 'Sending your request…' : open ? 'Request the free book' : 'Coming soon'}
    </button>
  </form>;
}

export function PerfectDayBookPage() {
  const b = perfectDayBook;
  return <div className="pd-page" data-testid="page-perfect-day-book">
    <section className="pd-hero"><div className="container pd-hero-grid">
      <div className="pd-cover"><img src={b.cover} alt={`Cover of ${b.title} by ${b.author}`} width={720} height={960}/></div>
      <div>
        <span className="eyebrow">Free reading resource</span>
        <h1>{b.title}</h1>
        <p className="pd-author">by {b.author}</p>
        <p className="pd-lede">{b.description}</p>
        <ul className="pd-highlights">{b.highlights.map(h => <li key={h}><Check size={18} aria-hidden="true"/>{h}</li>)}</ul>
        <p className="pd-note">{b.note}</p>
        <ul className="pd-meta"><li>{b.edition}</li><li>{b.pages} pages</li><li>PDF, {b.sizeLabel.toLowerCase()}</li></ul>
      </div>
    </div></section>

    <section className="pd-form-wrap" id="request"><div className="container pd-form-grid">
      <div>
        <span className="eyebrow">Ask for your copy</span>
        <h2>Tell us where to send it.</h2>
        <p>Share your first name and email. Once your request is accepted, the link appears right here so you can start reading straight away, and we queue an email with the same link for later.</p>
        <p><BookOpen size={18} aria-hidden="true" style={{ verticalAlign: '-3px', marginRight: 8 }}/>No phone number, no health questions.</p>
      </div>
      <GuideRequestForm/>
    </div></section>

    <section className="pd-next"><div className="container">
      <span className="eyebrow">After you read</span>
      <h2>Bring your questions to a conversation.</h2>
      <p>If something in the book sparks a question about your own goals, our whole life wellness coaches are happy to talk it through and show you what we offer here at SOZO.</p>
      <div className="pd-next-row">
        <Link href="/services/whole-life-coaching" className="btn btn-primary" data-testid="link-guide-coaching">Explore whole life coaching <ArrowRight size={16} aria-hidden="true"/></Link>
        <a href={PHONE_HREF} className="btn btn-outline" data-testid="link-guide-phone"><Phone size={16} aria-hidden="true"/> Call 352-802-2248</a>
      </div>
    </div></section>
  </div>;
}
