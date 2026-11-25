import { Link } from 'wouter';
import { CalendarDays, Check, Clock, Download, MapPin, Navigation, Phone } from 'lucide-react';
import './asea-learning-session.css';

const TEL = 'tel:+13528022248';
const MAPS = 'https://www.google.com/maps/search/?api=1&query=5029+CR+159+Wildwood+FL+34785';
const FLYER = 'https://drive.google.com/uc?export=download&id=1G3ymCY0jNBRfAW-o4XRBpiMxlGF2HDqi';

const topics = [
  ['Real-life ways to use ASEA', 'Practical, everyday conversation about how people fit ASEA into ordinary routines.'],
  ['Answers to your questions', 'Bring what you have been wondering about since September 30, or since you first heard the name.'],
  ['Sharing it simply', 'How to talk about ASEA with others clearly and comfortably, without overcomplicating it.'],
];

const guests = [
  'Everyone who joined us on September 30',
  'Existing ASEA clients at SOZO',
  'Anyone curious to learn more',
  'Friends are welcome, too',
];

export function AseaLearningSessionPage() {
  return <div className="asea-invite" data-testid="page-asea-learning-session">
    <section className="ai-hero">
      <div className="ai-wrap ai-hero-grid">
        <div className="ai-hero-copy">
        <span className="ai-crumb"><Link href="/" data-testid="link-breadcrumb-home">Home</Link> / Events</span>
        <div className="ai-kicker ai-rise">You’re invited</div>
        <h1 className="ai-rise ai-d1" data-testid="text-event-title">An ASEA <em>Learning Session</em></h1>
        <p className="ai-lede ai-rise ai-d2">A relaxed, practical evening at SOZO. Real life. Real questions. Simple answers.</p>
        <span className="ai-friend ai-rise ai-d2">Bring a friend — guests are welcome</span>
        <div className="ai-actions ai-rise ai-d3">
          <a className="ai-btn ai-btn-copper" href={TEL} data-testid="link-rsvp-hero"><Phone size={18} aria-hidden="true" /> RSVP: 352-802-2248</a>
          <a className="ai-btn ai-btn-ghost" href={MAPS} target="_blank" rel="noopener noreferrer" data-testid="link-directions-hero"><Navigation size={18} aria-hidden="true" /> Get directions</a>
          <a className="ai-btn ai-btn-ghost" href={FLYER} target="_blank" rel="noopener noreferrer" data-testid="link-flyer-hero"><Download size={18} aria-hidden="true" /> Download flyer (PNG)</a>
        </div>
        </div>
        <figure className="ai-hero-visual ai-rise ai-d2">
          <img src={`${import.meta.env.BASE_URL}images/partners/asea.jpg`} width={546} height={547} alt="A bottle of ASEA with a splash of water and ASEA branding" loading="eager" data-testid="img-asea-product" />
        </figure>
      </div>
    </section>

    <div className="ai-wrap ai-card-zone">
      <div className="ai-ticket" data-testid="card-event-details">
        <div>
          <span className="ai-label"><CalendarDays size={17} aria-hidden="true" /> Date</span>
          <p className="ai-big" data-testid="text-event-date"><time dateTime="2026-12-02">Wednesday, December 2, 2026</time></p>
        </div>
        <div>
          <span className="ai-label"><Clock size={17} aria-hidden="true" /> Time</span>
          <p className="ai-big" data-testid="text-event-time"><time dateTime="2026-12-02T17:30-05:00">5:30</time>–<time dateTime="2026-12-02T19:00-05:00">7:00 PM</time></p>
          <p className="ai-small">Eastern Time</p>
        </div>
        <div>
          <span className="ai-label"><MapPin size={17} aria-hidden="true" /> Location</span>
          <p className="ai-big">SOZO Wellness Center</p>
          <address className="ai-small" style={{ fontStyle: 'normal' }} data-testid="text-event-address">5029 CR 159, Wildwood, FL 34785<br /><a href={MAPS} target="_blank" rel="noopener noreferrer" data-testid="link-directions-card">Open in Google Maps</a></address>
        </div>
      </div>
    </div>

    <section className="ai-section">
      <div className="ai-wrap ai-split">
        <div>
          <span className="ai-eyebrow">A follow-up evening</span>
          <h2 className="ai-h2">Real life. Real questions. <em>Simple answers.</em></h2>
          <p className="ai-p">Join us for a relaxed, practical follow-up learning session, with helpful conversation and time for your questions.</p>
        </div>
        <ol className="ai-three">
          {topics.map(([t, d], i) => <li key={t} data-testid={`item-topic-${i + 1}`}><span className="ai-num">0{i + 1}</span><div><h3>{t}</h3><p>{d}</p></div></li>)}
        </ol>
      </div>
    </section>

    <section className="ai-section ai-guests">
      <div className="ai-wrap">
        <span className="ai-eyebrow">Who’s invited</span>
        <h2 className="ai-h2">There’s a seat for you <em>and</em> someone you know.</h2>
        <ul className="ai-guest-list">
          {guests.map((g, i) => <li key={g} data-testid={`item-guest-${i + 1}`}><Check size={20} aria-hidden="true" />{g}</li>)}
        </ul>
      </div>
    </section>

    <section className="ai-section">
      <div className="ai-wrap ai-hosts">
        <div>
          <span className="ai-eyebrow">Your hosts</span>
          <h2 className="ai-h2">Friendly faces to <em>guide the evening.</em></h2>
          <p className="ai-p">Hosted by Leisa Bodway, with Linda and Don Chaney helping present and answer questions.</p>
        </div>
        <div className="ai-host-cards">
          <div className="ai-host" data-testid="card-host-leisa"><img className="ai-portrait" src={`${import.meta.env.BASE_URL}images/team/leisa-bodway-fall-2026.jpg`} width={848} height={1024} alt="Portrait of Leisa Bodway" loading="lazy" data-testid="img-host-leisa" /><div><strong>Leisa Bodway</strong><span>Host</span></div></div>
          <div className="ai-host" data-testid="card-host-chaney"><span className="ai-mono" aria-hidden="true">LD</span><div><strong>Linda &amp; Don Chaney</strong><span>Helping present and answer questions</span></div></div>
        </div>
      </div>
    </section>

    <section className="ai-quote" aria-label="A word from our host">
      <div className="ai-wrap">
        <blockquote data-testid="text-host-quote">
          <p>“I can’t control everything in my life, but I can control how I take care of my body and what I put in it!”</p>
          <footer>— Leisa Bodway</footer>
        </blockquote>
      </div>
    </section>

    <section className="ai-section ai-rsvp" id="rsvp">
      <div className="ai-wrap">
        <div className="ai-rsvp-box" data-testid="section-rsvp">
          <span className="ai-eyebrow">Save your seat</span>
          <h2 className="ai-h2">RSVP the easy way.</h2>
          <ol className="ai-steps">
            <li>Call <strong>352-802-2248</strong>, or stop by the SOZO front desk.</li>
            <li>Let our team know <strong>how many guests</strong> you’re bringing.</li>
            <li>Join us Wednesday, December 2 at 5:30 PM.</li>
          </ol>
          <div className="ai-actions">
            <a className="ai-btn ai-btn-teal" href={TEL} data-testid="link-rsvp-call"><Phone size={18} aria-hidden="true" /> Call to RSVP</a>
            <a className="ai-btn ai-btn-outline" href={MAPS} target="_blank" rel="noopener noreferrer" data-testid="link-directions-rsvp"><Navigation size={18} aria-hidden="true" /> Directions to SOZO</a>
            <a className="ai-btn ai-btn-outline" href={FLYER} target="_blank" rel="noopener noreferrer" data-testid="link-flyer-rsvp"><Download size={18} aria-hidden="true" /> Download flyer (PNG)</a>
          </div>
          <p className="ai-note">This is an educational gathering. It is not medical advice; please talk with your healthcare provider about your personal health decisions.</p>
        </div>
      </div>
    </section>
  </div>;
}
