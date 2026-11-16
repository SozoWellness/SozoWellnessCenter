import { Link } from 'wouter';
import { useGiveawayAvailability } from '@/lib/giveaway-client';
import { formatEastern, formatMoney } from './format';
import './giveaway.css';

const PENDING = 'To be confirmed by Sponsor';

export function GiveawayRulesPage() {
  const q = useGiveawayAvailability();
  const c = q.data?.campaign;
  const approved = c?.rulesApproved === true;
  const start = formatEastern(c?.startsAt) || PENDING;
  const end = formatEastern(c?.endsAt) || PENDING;
  const value = c && c.prizeValue > 0 ? formatMoney(c.prizeValue) : PENDING;

  return (
    <div className="gw">
      <section className="page-hero">
        <div className="container">
          <p className="crumb"><Link href="/enter-to-win">Giveaway</Link> / Official Rules</p>
          <h1 className="serif">Official Rules</h1>
          <p>SOZO Wellness Center Hyperbaric Oxygen Therapy Giveaway{c?.rulesVersion ? ` · Version ${c.rulesVersion}` : ''}</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 60 }}>
        <div className="container gw-rules">
          {q.isLoading && <div className="gw-skel" style={{ height: 120, marginBottom: 24 }} />}
          {q.isError && <div className="gw-alert" role="alert" style={{ marginBottom: 24 }}>Campaign details could not be loaded. <button type="button" className="gw-mini" onClick={() => q.refetch()} data-testid="button-retry-rules">Try again</button></div>}
          {!approved && !q.isLoading && (
            <div className="notice" role="note" style={{ marginTop: 0, marginBottom: 28 }} data-testid="status-rules-draft">
              <strong>Draft, pending Sponsor approval.</strong> These rules are not final. Dates and prize value shown as "{PENDING}" have not been set.
            </div>
          )}
          <p className="gw-npn">NO PURCHASE NECESSARY TO ENTER OR WIN. A purchase or payment of any kind will not increase your chances of winning.</p>
          <dl className="gw-facts" data-testid="list-rule-facts">
            <div><dt>Entry period opens</dt><dd className={start === PENDING ? 'gw-pending' : ''}>{start}</dd></div>
            <div><dt>Entry period closes</dt><dd className={end === PENDING ? 'gw-pending' : ''}>{end}</dd></div>
            <div><dt>Prize</dt><dd>Ten (10) complimentary Hyperbaric Oxygen Therapy sessions</dd></div>
            <div><dt>Approximate retail value</dt><dd className={value === PENDING ? 'gw-pending' : ''}>{value}</dd></div>
          </dl>
          <ol>
            <li><h2>Sponsor</h2><p>SOZO Wellness Center, 5029 County Road 159, Wildwood, FL 34785 ("Sponsor").</p></li>
            <li><h2>Eligibility</h2><p>Open only to legal residents of Florida who are 18 years of age or older at the time of entry. Void where prohibited.</p></li>
            <li><h2>Entry period</h2><p>Entries are accepted from {start} through {end}. All times are Eastern Time. Entries received outside this period will not be accepted.</p></li>
            <li><h2>How to enter</h2><p>Complete the online entry form at <Link href="/enter-to-win">the giveaway page</Link> with your first name, email address, and mobile phone number, and accept these Official Rules. Limit one (1) entry per person. Duplicate entries may be disregarded.</p></li>
            <li><h2>Prize</h2><p>One (1) prize will be awarded: ten (10) complimentary Hyperbaric Oxygen Therapy sessions at SOZO Wellness Center. Approximate retail value: {value}.</p></li>
            <li><h2>Winner selection</h2><p>After the entry period closes, one winner will be selected in a random drawing from all eligible entries received. Odds of winning depend on the number of eligible entries received.</p></li>
            <li><h2>Winner notification</h2><p>The potential winner will be contacted by email and/or phone using the information provided at entry. If the potential winner does not respond within seven (7) days of notification, the prize may be forfeited and an alternate winner selected at random from the remaining eligible entries.</p></li>
            <li><h2>Communications and privacy</h2><p>Your mobile number is used to contact the winner about the giveaway. Entering does not enroll you in marketing text messages. Entry includes agreement to receive wellness information, educational resources, and occasional promotional emails from SOZO Wellness Center; you may unsubscribe at any time. See our <Link href="/privacy-policy">Privacy Policy</Link>.</p></li>
            <li><h2>Acceptance of rules</h2><p>By entering, participants agree to be bound by these Official Rules and by the decisions of the Sponsor, which are final on all matters relating to this giveaway.</p></li>
          </ol>
          <p className="gw-fine">Questions? Call or text SOZO at 352-802-2248. <Link href="/enter-to-win">Back to the giveaway</Link></p>
        </div>
      </section>
    </div>
  );
}
