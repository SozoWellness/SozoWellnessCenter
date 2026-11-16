import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Download, Lock, RefreshCw, Search } from 'lucide-react';
import {
  giveawayExportHref, useGiveawayAdmin, useGiveawayAdminCommand,
  type CampaignSettings, type GiveawayAdminCommand, type GiveawayAdminData, type GiveawayDraw,
} from '@/lib/giveaway-client';
import { TrackedLinkBuilder } from './TrackedLinkBuilder';
import { formatEastern, formatMoney } from './format';
import './giveaway.css';

const PER_PAGE = 25;
const WEEK = 7 * 24 * 60 * 60 * 1000;
const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

function toLocalInput(iso: string) {
  if (!iso) return '';
  const d = new Date(iso); if (Number.isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : '');

type Feedback = { kind: 'ok' | 'error'; text: string } | null;

export function GiveawayAdminPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const q = useGiveawayAdmin(search, page);
  const cmd = useGiveawayAdminCommand();
  const [feedback, setFeedback] = useState<Feedback>(null);

  function run(command: GiveawayAdminCommand, success: string) {
    setFeedback(null);
    cmd.mutate(command, {
      onSuccess: () => setFeedback({ kind: 'ok', text: success }),
      onError: (e) => setFeedback({ kind: 'error', text: e instanceof Error ? e.message : 'The action failed.' }),
    });
  }

  if (q.isLoading) return <section className="gw gw-admin"><div className="container"><div className="gw-skel" style={{ height: 60, maxWidth: 420 }} /><div className="gw-skel" style={{ height: 110, marginTop: 24 }} /><div className="gw-skel" style={{ height: 320, marginTop: 22 }} /></div></section>;
  if (q.isError || !q.data) return (
    <section className="gw gw-admin"><div className="container" style={{ maxWidth: 640 }}>
      <div className="gw-panel" style={{ textAlign: 'center' }} role="alert" data-testid="status-admin-unavailable">
        <Lock size={34} aria-hidden="true" style={{ color: '#2a7771' }} />
        <h1 style={{ fontSize: 36 }}>Private access unavailable</h1>
        <p className="gw-admin-lede" style={{ margin: '0 auto' }}>This area is restricted to authorized SOZO staff. {q.error instanceof Error ? q.error.message : ''}</p>
        <p>Entry contact details, exports, and winner records are never available through public sign-up. Please contact the site administrator if you need staff access.</p>
        <button type="button" className="btn btn-primary gw-sm" style={{ marginTop: 20 }} onClick={() => q.refetch()} disabled={q.isFetching} data-testid="button-retry-admin">
          <RefreshCw size={15} aria-hidden="true" />{q.isFetching ? 'Checking…' : 'Try again'}
        </button>
      </div>
    </div></section>
  );

  const d = q.data;
  const pages = Math.max(1, Math.ceil(d.total / PER_PAGE));
  const onSearch = (e: FormEvent) => { e.preventDefault(); setPage(1); setSearch(searchInput.trim()); };

  return (
    <section className="gw gw-admin"><div className="container">
      <span className="eyebrow">Private · Staff only</span>
      <h1>Hyperbaric giveaway</h1>
      <p className="gw-admin-lede">Campaign status: <strong data-testid="text-campaign-status">{d.campaign.status}</strong>{d.campaign.rulesApproved ? ' · rules approved' : ' · rules pending approval'} · version {d.campaign.rulesVersion}</p>

      <div aria-live="polite">
        {feedback && <div className={feedback.kind === 'ok' ? 'gw-ok' : 'gw-alert'} role={feedback.kind === 'error' ? 'alert' : 'status'} data-testid="status-admin-feedback">{feedback.text}</div>}
      </div>

      <div className="gw-stats">
        <div className="gw-stat"><span>Total entries</span><strong data-testid="text-total-entries">{d.totalEntries}</strong></div>
        <div className="gw-stat"><span>Matching search</span><strong>{d.total}</strong></div>
        <div className="gw-stat"><span>Draws</span><strong>{d.draws.length}</strong></div>
        <div className="gw-stat"><span>Prize value</span><strong>{d.campaign.prizeValue > 0 ? formatMoney(d.campaign.prizeValue) : 'Unset'}</strong></div>
      </div>

      <div className="gw-panel">
        <h2>Connections</h2>
        <div className="gw-conn" data-testid="list-connections">
          {([['Database', d.connections.database], ['Mailchimp', d.connections.mailchimp], ['Turnstile', d.connections.turnstile], ['Public entry switch', d.connections.publicEnabled]] as const).map(([l, ok]) => (
            <span key={l} className={`gw-pill ${ok ? 'on' : 'off'}`}><i aria-hidden="true" />{l}: {ok ? 'configured' : 'not configured'}</span>
          ))}
        </div>
        <p className="gw-hint">Configuration indicators do not verify provider credentials or activate a Mailchimp automation. Check one approved test entry before opening the campaign.</p>
      </div>

      <SettingsPanel data={d} busy={cmd.isPending} onSave={(s) => run({ action: 'settings', settings: s }, 'Campaign settings saved.')} />
      <DrawPanel draws={d.draws} busy={cmd.isPending} status={d.campaign.status} run={run} />

      <div className="gw-panel">
        <h2>Entries</h2>
        <form className="gw-row" onSubmit={onSearch} role="search">
          <div className="form-field"><label htmlFor="gw-search">Search name, email, phone or source</label>
            <input id="gw-search" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} data-testid="input-admin-search" /></div>
          <button className="btn btn-primary gw-sm" type="submit" data-testid="button-admin-search"><Search size={15} aria-hidden="true" />Search</button>
        </form>
        <div className="gw-row" style={{ margin: '14px 0' }}>
          <a className="btn btn-outline gw-sm" href={giveawayExportHref('entries')} data-testid="link-export-entries"><Download size={15} aria-hidden="true" />All entries CSV</a>
          <a className="btn btn-outline gw-sm" href={giveawayExportHref('emails')} data-testid="link-export-emails"><Download size={15} aria-hidden="true" />Opted-in emails CSV</a>
          <a className="btn btn-outline gw-sm" href={giveawayExportHref('winners')} data-testid="link-export-winners"><Download size={15} aria-hidden="true" />Winners CSV</a>
        </div>
        {d.entries.length === 0 ? <p className="gw-hint" data-testid="text-no-entries">{search ? 'No entries match that search.' : 'No entries yet. They will appear here as soon as someone enters.'}</p> : (
          <div className="gw-table-wrap" tabIndex={0} aria-label="Entries table, scrollable">
            <table className="gw-table">
              <thead><tr><th>Entrant</th><th>Contact</th><th>Entered (ET)</th><th>Wellness goal</th><th>Source</th><th>Email sync</th></tr></thead>
              <tbody>{d.entries.map((e) => (
                <tr key={e.id} data-testid={`row-entry-${e.id}`}>
                  <td>{e.first_name}<small>{e.id}</small></td>
                  <td>{e.email}<small>{e.phone}</small></td>
                  <td>{formatEastern(e.created_at)}</td>
                  <td>{e.wellness_interest || '—'}</td>
                  <td>{e.qr_source || e.utm_source || 'direct'}<small>{e.utm_campaign}</small></td>
                  <td><span className={`gw-sync ${e.sync_status}`}>{e.sync_status}</span>
                    {e.sync_error && <small>{e.sync_error}</small>}
                    {(e.sync_status === 'failed' || e.sync_status === 'pending' || e.sync_status === 'processing') && (
                      <button type="button" className="gw-mini" style={{ marginTop: 6 }} disabled={cmd.isPending}
                        onClick={() => run({ action: 'retry', entryId: e.id }, `Sync retry requested for ${e.first_name}.`)} data-testid={`button-retry-sync-${e.id}`}>Retry sync</button>
                    )}</td>
                </tr>))}</tbody>
            </table>
          </div>
        )}
        <div className="gw-pager">
          <button type="button" className="gw-mini" disabled={page <= 1 || q.isFetching} onClick={() => setPage(page - 1)} data-testid="button-prev-page">Previous</button>
          <span>Page {d.page} of {pages}</span>
          <button type="button" className="gw-mini" disabled={page >= pages || q.isFetching} onClick={() => setPage(page + 1)} data-testid="button-next-page">Next</button>
        </div>
      </div>

      <div className="gw-panel">
        <h2>Summary</h2>
        <div className="gw-three">
          {([['Entries per day', d.days], ['Wellness goals', d.goals], ['Sources', d.sources]] as const).map(([title, rows]) => (
            <div className="gw-list" key={title}><h3>{title}</h3>
              {rows.length ? <ul className="gw-list">{rows.map((r) => <li key={r.label}><span>{r.label || '—'}</span><b>{r.count}</b></li>)}</ul> : <p className="gw-hint">Nothing yet.</p>}
            </div>
          ))}
        </div>
      </div>

      <TrackedLinkBuilder />
    </div></section>
  );
}

function SettingsPanel({ data, busy, onSave }: { data: GiveawayAdminData; busy: boolean; onSave: (s: CampaignSettings) => void }) {
  const c = data.campaign;
  const [form, setForm] = useState({ ...c, startsLocal: toLocalInput(c.startsAt), endsLocal: toLocalInput(c.endsAt), value: String(c.prizeValue || '') });
  const [err, setErr] = useState('');
  const initFor = useRef('');
  const sig = JSON.stringify(c);
  useEffect(() => {
    if (initFor.current === sig) return;
    initFor.current = sig;
    setForm({ ...c, startsLocal: toLocalInput(c.startsAt), endsLocal: toLocalInput(c.endsAt), value: String(c.prizeValue || '') });
  }, [sig]); // eslint-disable-line react-hooks/exhaustive-deps
  const locked = data.totalEntries > 0;
  const drawn = data.draws.length > 0;

  function submit(e: FormEvent) {
    e.preventDefault(); setErr('');
    const startsAt = fromLocalInput(form.startsLocal); const endsAt = fromLocalInput(form.endsLocal);
    const prizeValue = Number(form.value || 0);
    if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) return setErr('End must be after start.');
    if (!Number.isFinite(prizeValue) || prizeValue < 0) return setErr('Prize value must be a positive number.');
    if (form.status === 'active' && (!startsAt || !endsAt || !form.rulesApproved || prizeValue <= 0)) return setErr('To go active, set both dates, a prize value, and approve the rules.');
    onSave({ id: c.id, status: form.status, startsAt, endsAt, prizeValue, rulesApproved: form.rulesApproved, rulesVersion: form.rulesVersion.trim() || '1' });
  }

  return (
    <form className="gw-panel" onSubmit={submit} data-testid="form-settings">
      <h2>Campaign settings</h2>
      <p>Times use your browser's time zone (<strong>{browserTz}</strong>) and are saved as exact instants. The public site displays them in Eastern Time.</p>
      {locked && <div className="gw-locked"><Lock size={16} aria-hidden="true" />Entries exist, so dates, prize value and rules version are locked by the server to protect entrants.{drawn ? ' A drawing has occurred; the campaign cannot be reopened.' : ''}</div>}
      <div className="form-grid">
        <div className="form-field"><label htmlFor="gw-start">Entries open ({browserTz})</label>
          <input id="gw-start" type="datetime-local" value={form.startsLocal} disabled={locked} onChange={(e) => setForm({ ...form, startsLocal: e.target.value })} data-testid="input-starts-at" />
          <span className="gw-hint">{formatEastern(fromLocalInput(form.startsLocal)) || 'Not set'}</span></div>
        <div className="form-field"><label htmlFor="gw-end">Entries close ({browserTz})</label>
          <input id="gw-end" type="datetime-local" value={form.endsLocal} disabled={locked} onChange={(e) => setForm({ ...form, endsLocal: e.target.value })} data-testid="input-ends-at" />
          <span className="gw-hint">{formatEastern(fromLocalInput(form.endsLocal)) || 'Not set'}</span></div>
        <div className="form-field"><label htmlFor="gw-value">Approximate retail value (USD)</label>
          <input id="gw-value" type="number" min="0" step="0.01" inputMode="decimal" value={form.value} disabled={locked} onChange={(e) => setForm({ ...form, value: e.target.value })} data-testid="input-prize-value" /></div>
        <div className="form-field"><label htmlFor="gw-version">Rules version</label>
          <input id="gw-version" value={form.rulesVersion} disabled={locked} onChange={(e) => setForm({ ...form, rulesVersion: e.target.value })} data-testid="input-rules-version" /></div>
        <div className="form-field"><label htmlFor="gw-status">Status</label>
          <select id="gw-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as CampaignSettings['status'] })} data-testid="select-status">
            <option value="draft">Draft (not accepting)</option>
            <option value="active" disabled={drawn}>Active (accepting during dates)</option>
            <option value="closed">Closed</option>
          </select></div>
        <label className="form-check" style={{ alignSelf: 'end' }}>
          <input type="checkbox" checked={form.rulesApproved} onChange={(e) => setForm({ ...form, rulesApproved: e.target.checked })} data-testid="checkbox-rules-approved" />
          Sponsor has approved the Official Rules
        </label>
      </div>
      {err && <p className="gw-err" role="alert" style={{ marginTop: 12 }}>{err}</p>}
      <button className="btn btn-primary gw-sm" style={{ marginTop: 18 }} disabled={busy} data-testid="button-save-settings">{busy ? 'Saving…' : 'Save settings'}</button>
    </form>
  );
}

function DrawPanel({ draws, busy, status, run }: { draws: GiveawayDraw[]; busy: boolean; status: CampaignSettings['status']; run: (c: GiveawayAdminCommand, s: string) => void }) {
  const pending = draws.find((x) => x.status === 'pending');
  const active = draws.find((x) => x.status === 'confirmed');
  const canDraw = status === 'closed' && !pending && !active;
  const now = Date.now();
  return (
    <div className="gw-panel">
      <h2>Winner drawing</h2>
      <p>Drawing picks one random eligible entry and saves it as pending. Review it, then confirm separately. Contact the winner yourself by email and phone, then mark notified. An alternate can be drawn only after releasing an unresponsive winner, 7 days after notification.</p>
      <button type="button" className="btn btn-primary gw-sm" disabled={busy || !canDraw} onClick={() => run({ action: 'draw' }, 'Pending draw saved. Review it below before confirming.')} data-testid="button-draw">
        Draw {draws.length ? 'alternate' : 'winner'}
      </button>
      {!canDraw && <p className="gw-hint" style={{ marginTop: 8 }}>{pending ? 'A pending draw awaits confirmation.' : active ? 'A confirmed winner is in progress.' : 'Close the campaign before drawing.'}</p>}
      {draws.length === 0 ? <p className="gw-hint" style={{ marginTop: 12 }}>No draws yet.</p> : draws.map((x) => {
        const releaseAt = x.notified_at ? new Date(x.notified_at).getTime() + WEEK : 0;
        return (
          <div key={x.id} className={`gw-draw ${x.status}`} data-testid={`card-draw-${x.id}`}>
            <h3>{x.first_name} <span className={`gw-sync ${x.status === 'confirmed' ? 'synced' : x.status === 'pending' ? 'pending' : ''}`}>{x.status}</span></h3>
            <dl>
              <div><dt>Contact</dt><dd>{x.email}<br />{x.phone}</dd></div>
              <div><dt>Selected</dt><dd>{formatEastern(x.selected_at)}</dd></div>
              <div><dt>Eligible entries</dt><dd>{x.eligible_count}</dd></div>
              <div><dt>Confirmed</dt><dd>{formatEastern(x.confirmed_at) || '—'}</dd></div>
              <div><dt>Notified</dt><dd>{formatEastern(x.notified_at) || '—'}</dd></div>
              <div><dt>Released</dt><dd>{formatEastern(x.released_at) || '—'}</dd></div>
            </dl>
            <div className="gw-row">
              {x.status === 'pending' && <button type="button" className="btn btn-primary gw-sm" disabled={busy} onClick={() => run({ action: 'confirm', drawId: x.id }, 'Winner confirmed.')} data-testid={`button-confirm-${x.id}`}>Confirm this winner</button>}
              {x.status === 'confirmed' && !x.notified_at && <button type="button" className="btn btn-outline gw-sm" disabled={busy}
                onClick={() => { if (window.confirm('Mark notified only after you have actually contacted this winner. Continue?')) run({ action: 'notified', drawId: x.id }, 'Marked as notified.'); }} data-testid={`button-notified-${x.id}`}>Mark notified</button>}
              {x.status === 'confirmed' && x.notified_at && (now >= releaseAt
                ? <button type="button" className="btn btn-outline gw-sm" disabled={busy}
                    onClick={() => { if (window.confirm('Release this winner as unclaimed? This allows an alternate draw and cannot be undone.')) run({ action: 'release', drawId: x.id }, 'Winner released as unclaimed.'); }} data-testid={`button-release-${x.id}`}>Release as unclaimed</button>
                : <span className="gw-hint">Release available {formatEastern(new Date(releaseAt).toISOString())}</span>)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
