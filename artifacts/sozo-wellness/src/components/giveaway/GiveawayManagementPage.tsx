import { GIVEAWAY_ENTRY_TAG } from '@/lib/giveaway-contract';
import { TrackedLinkBuilder } from './TrackedLinkBuilder';
import './giveaway.css';

/** No entrant records, authentication tokens, or private API calls on this page. */
export function GiveawayManagementPage() {
  return (
    <main className="gw gw-admin">
      <div className="container" style={{ maxWidth: 900 }}>
        <p className="gw-eyebrow">SOZO / Giveaway resources</p>
        <h1>Giveaway entries live in Mailchimp.</h1>
        <div className="gw-panel">
          <p>Authorized staff can use their existing Mailchimp account to view and export contacts with the tag <strong>{GIVEAWAY_ENTRY_TAG}</strong>.</p>
          <p>Winner selection and notification are handled manually after entries close. This page does not display entrant information or select a winner.</p>
          <a className="gw-btn" href="https://login.mailchimp.com/" target="_blank" rel="noopener noreferrer">Open Mailchimp</a>
        </div>
        <h2 style={{ marginTop: 40 }}>Create a source-tracked QR link</h2>
        <p>This link builder contains no entrant data. Use different source labels for event posters, cards, and handouts.</p>
        <p>Generate final printed QR codes on the live SOZO website after launch approval. Links generated in this preview point to this preview, not the live website.</p>
        <TrackedLinkBuilder />
      </div>
    </main>
  );
}
