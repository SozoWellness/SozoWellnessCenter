import { useEffect, useMemo, useState } from 'react';
import { Copy, Download } from 'lucide-react';

const slug = (v: string) => v.toLowerCase().trim().replace(/[^a-z0-9_.-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

export function TrackedLinkBuilder() {
  const [source, setSource] = useState('');
  const [campaign, setCampaign] = useState('');
  const [copied, setCopied] = useState('');
  const [svg, setSvg] = useState('');
  const [qrError, setQrError] = useState('');

  const link = useMemo(() => {
    const s = slug(source); const c = slug(campaign);
    if (!s) return '';
    const p = new URLSearchParams({ qr_source: s, utm_medium: 'qr', utm_source: s });
    if (c) p.set('utm_campaign', c);
    return `${window.location.origin}/enter-to-win?${p.toString()}`;
  }, [source, campaign]);

  useEffect(() => {
    let active = true;
    setSvg(''); setQrError('');
    if (!link) return;
    import('qrcode').then(({ default: QRCode }) => QRCode.toString(link, { type: 'svg', errorCorrectionLevel: 'M', margin: 4 }))
      .then((out) => { if (active) setSvg(out); })
      .catch(() => { if (active) setQrError('The QR code could not be generated. The link above still works.'); });
    return () => { active = false; };
  }, [link]);

  async function copy() {
    try { await navigator.clipboard.writeText(link); setCopied('Link copied.'); }
    catch { setCopied('Copy failed. Select the link text and copy it manually.'); }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    const a = document.createElement('a');
    a.href = url; a.download = `sozo-giveaway-qr-${slug(source)}${campaign ? `-${slug(campaign)}` : ''}.svg`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="gw-panel">
      <h2>Tracked QR link</h2>
      <p>Sources are names you choose (for example, an event or booth). Never put names, emails, or phone numbers in a link. The QR code is generated in this browser; no outside service is used.</p>
      <div className="gw-row">
        <div className="form-field"><label htmlFor="gw-qr-source">QR source slug</label>
          <input id="gw-qr-source" value={source} onChange={(e) => setSource(e.target.value)} placeholder="villages-health-fair" data-testid="input-qr-source" /></div>
        <div className="form-field"><label htmlFor="gw-qr-campaign">Event campaign</label>
          <input id="gw-qr-campaign" value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="spring-vendor-events" data-testid="input-qr-campaign" /></div>
      </div>
      {link ? (
        <>
          <code className="gw-code" data-testid="text-tracked-link">{link}</code>
          <div className="gw-row" style={{ marginTop: 12 }}>
            <button type="button" className="btn btn-outline gw-sm" onClick={copy} data-testid="button-copy-link"><Copy size={15} aria-hidden="true" />Copy link</button>
            <button type="button" className="btn btn-primary gw-sm" onClick={download} disabled={!svg} data-testid="button-download-qr"><Download size={15} aria-hidden="true" />Download QR (SVG)</button>
          </div>
          <p role="status" className="gw-hint" style={{ marginTop: 8 }}>{copied}</p>
          {qrError && <p className="gw-err" role="alert">{qrError}</p>}
          {svg && <div style={{ width: 180, marginTop: 10, background: '#fff', border: '1px solid #d3ded5' }} role="img" aria-label="QR code preview for the tracked link" dangerouslySetInnerHTML={{ __html: svg }} data-testid="img-qr-preview" />}
        </>
      ) : <p className="gw-hint" style={{ marginTop: 12 }}>Enter a source slug to build the link.</p>}
    </div>
  );
}
