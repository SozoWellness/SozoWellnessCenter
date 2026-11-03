export interface TurnstileApi {
  render(container: HTMLElement, options: Record<string, unknown>): string;
  remove(id: string): void;
}
declare global {
  interface Window { turnstile?: TurnstileApi }
}

let scriptPromise: Promise<TurnstileApi> | null = null;
export function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    const timeout = window.setTimeout(failed, 15000);
    function failed() {
      window.clearTimeout(timeout);
      script.remove();
      reject(new Error('Verification script unavailable'));
    }
    script.onerror = failed;
    script.onload = () => {
      const api = window.turnstile;
      if (!api) { failed(); return; }
      // The load event is the readiness signal for this async script.
      // Turnstile.ready() explicitly throws error 3857 for async/defer loading.
      window.clearTimeout(timeout);
      resolve(api);
    };
    document.head.appendChild(script);
  }).catch(error => { scriptPromise = null; throw error; });
  return scriptPromise;
}
