import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Check, Phone } from 'lucide-react';
import { JaneBookingLink } from '@/components/jane-booking-link';
import { SOZO_PHONE, SOZO_PHONE_HREF, readReceipt } from './format';
import './giveaway.css';

export function GiveawayThanksPage() {
  const [receipt, setReceipt] = useState<string | null>(null);
  useEffect(() => { setReceipt(readReceipt()); }, []);

  return (
    <div className="gw">
      <section className="page-hero">
        <div className="container gw-thanks gw-reveal">
          {receipt ? (
            <>
              <div className="gw-seal"><Check size={40} aria-hidden="true" /></div>
              <h1 data-testid="text-thanks-title">YOU'RE ENTERED!</h1>
              <p>Thank you for entering to win 10 free Hyperbaric Oxygen Therapy sessions. The winner will be selected randomly from all eligible entries after the giveaway closes, and we will contact the winner directly by email and/or phone.</p>
              <div className="gw-receipt" data-testid="text-receipt">Entry receipt<code>{receipt}</code></div>
              <p style={{ fontSize: 15 }}>Keep this receipt ID if you contact us about your entry. Promotional emails depend on your Mailchimp subscription status; you can unsubscribe at any time.</p>
            </>
          ) : (
            <>
              <span className="eyebrow">Hyperbaric giveaway</span>
              <h1 data-testid="text-thanks-generic">Thank you for your interest.</h1>
              <p>We can't find an entry from this browser session, so we can't confirm an entry here. If you have not entered yet, you can do so from the giveaway page while entries are open.</p>
              <Link href="/enter-to-win" className="btn btn-primary" data-testid="link-back-entry">Go to the giveaway</Link>
            </>
          )}
        </div>
      </section>
      <section className="section" style={{ paddingTop: 60 }}>
        <div className="container gw-thanks">
          <span className="eyebrow">While you wait</span>
          <h2 className="serif" style={{ fontSize: 'clamp(30px,4vw,46px)', margin: '18px 0 10px' }}>Get to know SOZO.</h2>
          <p>Explore our services, book an assessment, or simply call our team with any questions.</p>
          <div className="gw-next">
            <Link href="/services" className="btn btn-outline" data-testid="link-explore-services">Explore Services</Link>
            <JaneBookingLink label="Book An Assessment" testId="link-book-assessment" />
            <a href={SOZO_PHONE_HREF} className="btn btn-light" data-testid="link-call-sozo"><Phone size={17} aria-hidden="true" />Call SOZO · {SOZO_PHONE}</a>
          </div>
          <p className="gw-fine"><Link href="/official-rules">Official Rules</Link> · <Link href="/privacy-policy">Privacy Policy</Link></p>
        </div>
      </section>
    </div>
  );
}
