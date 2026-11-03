import { useEffect, useRef, useState } from 'react';

interface TurnstileApi {
  ready(callback: () => void): void;
  render(container: HTMLElement, options: Record<string, unknown>): string;
  remove(id: string): void;
}
declare global {
  interface Window { turnstile?: TurnstileApi }
}

let scriptPromise: Promise<TurnstileApi> | null = null;
function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) {
    const api = window.turnstile;
    return new Promise(resolve => api.ready(() => resolve(api)));
  }
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    const timeout = window.setTimeout(failed, 15000);
    function failed() {
      clearTimeout(timeout);
      script.remove();
      reject(new Error('Verification script unavailable'));
    }
    script.onerror = failed;
    script.onload = () => {
      const api = window.turnstile;
      if (!api) { failed(); return; }
      api.ready(() => { clearTimeout(timeout); resolve(api); });
    };
    document.head.appendChild(script);
  }).catch(error => { scriptPromise = null; throw error; });
  return scriptPromise;
}

export function AssessmentTurnstile({ siteKey, revision, onToken }: {
  siteKey?: string; revision: number; onToken: (token: string) => void;
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
          action: 'assessment_request',
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
  }, [siteKey, revision, retry, onToken]);

  return <div data-testid="assessment-turnstile" style={{ margin: '20px 0', minWidth: 0 }}>
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
