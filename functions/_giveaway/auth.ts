import type { GiveawayEnv } from './types.ts';

function decode(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(padded), c => c.charCodeAt(0));
}
function parse(value: string): Record<string, unknown> {
  return JSON.parse(new TextDecoder().decode(decode(value)));
}
/** Cloudflare Access signs sessions; an email header alone never grants access. */
export async function administrator(request: Request, env: GiveawayEnv): Promise<string | null> {
  const team = env.GIVEAWAY_ACCESS_TEAM?.trim();
  const audience = env.GIVEAWAY_ACCESS_AUD?.trim();
  const allowed = env.GIVEAWAY_ADMIN_EMAILS?.split(',').map(v => v.trim().toLowerCase()).filter(Boolean);
  if (!team || !/^[a-z0-9-]+$/.test(team) || !audience || !allowed?.length) return null;
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token || token.length > 16384) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const header = parse(parts[0]);
    const claims = parse(parts[1]);
    const issuer = `https://${team}.cloudflareaccess.com`;
    const now = Date.now() / 1000;
    if (header.alg !== 'RS256' || typeof header.kid !== 'string' ||
      claims.iss !== issuer || !Array.isArray(claims.aud) || !claims.aud.includes(audience) ||
      typeof claims.exp !== 'number' || claims.exp <= now ||
      typeof claims.iat !== 'number' || claims.iat > now + 30 ||
      (claims.nbf !== undefined && (typeof claims.nbf !== 'number' || claims.nbf > now + 30)) ||
      typeof claims.email !== 'string' || !allowed.includes(claims.email.toLowerCase())) return null;
    // Fixed issuer endpoint, never a URL supplied by a token. No redirects.
    const response = await fetch(`${issuer}/cdn-cgi/access/certs`, {
      redirect: 'manual', signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    const { keys } = await response.json() as { keys?: (JsonWebKey & { kid?: string })[] };
    const jwk = keys?.find(key => key.kid === header.kid && key.kty === 'RSA' && key.alg === 'RS256');
    if (!jwk) return null;
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, decode(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
    return valid ? claims.email.toLowerCase() : null;
  } catch { return null; }
}
