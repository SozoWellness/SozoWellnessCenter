import { useEffect, useRef, useState } from 'react';
import { loadTurnstile, type TurnstileApi } from '@/lib/turnstile-loader';

export function AssessmentTurnstile({ siteKey, revision, onToken, action = 'assessment_request', testId = 'assessment-turnstile' }: {
  siteKey?: string; revision: number; onToken: (token: string) => void;
  action?: 'assessment_request' | 'guide_request'; testId?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [retry, setRetry] = useState(0);
  const [status, setStatus] = useState<'waiting' | 'verified' | 'error'>('waiting');
  useEffect(() => {
    let active = true;
    let api: TurnstileApi | undefined;
    let widgetId: string | undefined;
    onToken('');
    setStatus(siteKey ? 'waiting' : 'error');
    const invalidate = () => {
      if (!active) return;
      onToken('');
      setStatus('error');
    };
    if (siteKey) {
      void loadTurnstile().then(loaded => {
        if (!active || !container.current) return;
        api = loaded;
        widgetId = api.render(container.current, {
          sitekey: siteKey,
          action,
          theme: 'light',
          size: 'flexible',
          'response-field': false,
          callback: (token: string) => {
            if (!active) return;
            onToken(token);
            setStatus('verified');
          },
          'expired-callback': invalidate,
          'timeout-callback': invalidate,
          'error-callback': () => { invalidate(); return true; },
        });
      }).catch(invalidate);
    }
    return () => {
      active = false;
      if (api && widgetId !== undefined) api.remove(widgetId);
    };
  }, [siteKey, revision, retry, onToken, action]);

  return <div data-testid={testId} style={{ margin: '20px 0', minWidth: 0 }}>
    <div ref={container} style={{ minHeight: siteKey ? 65 : 0, maxWidth: '100%' }} />
    <p aria-live="polite" style={{ fontSize: 14, margin: '8px 0' }}>
      {status === 'verified' ? 'Security check complete.' :
        status === 'waiting' ? 'Please wait for the security check before submitting.' :
        'The security check is unavailable or has expired. Please retry the check.'}
    </p>
    {status === 'error' && <>
      {siteKey && <button type="button" className="btn btn-secondary" onClick={() => setRetry(value => value + 1)}>Retry security check</button>}
      <p style={{ fontSize: 14 }}>If it won’t load, <a href="tel:+13528022248">text or call 352-802-2248</a>. Your entered details stay on this page.</p>
    </>}
  </div>;
}
