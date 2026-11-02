import { Link } from 'wouter';
import { ArrowRight, Phone, Info } from 'lucide-react';
import { ASSESSMENT_CTA } from '../lib/inquiry';
import './chiropractic.css';

const PHONE_LABEL = 'Text or Call 352-802-2248';
const PHONE_HREF = 'tel:+13528022248';

const reasons = [
  { t: 'Neck and back pain', d: 'Chiropractic care is widely sought to relieve neck and back pain, whether it has crept up over time or followed a specific strain.' },
  { t: 'Mobility and function', d: 'Care focuses on helping joints move well, so everyday motion like turning, bending and reaching can feel easier.' },
  { t: 'Sport and active life', d: 'From pickleball courts to golf courses, active people often look for support recovering from injury and staying in the game.' },
  { t: 'After an accident', d: 'Post-accident rehabilitation is a focus area for our chiropractors, with care tailored to your recovery.' },
];

export function ChiropracticPage() {
  return <>
    <section className="page-hero cx-hero">
      <div className="container">
        <span className="crumb"><Link href="/" data-testid="link-breadcrumb-home">Home</Link> / Chiropractic Care</span>
        <div style={{ marginTop: 32 }}><span className="eyebrow">Chiropractic Care</span></div>
        <h1 className="serif fade-up">Move with more ease, <em>meet your chiropractors.</em></h1>
        <p className="fade-up delay-1">Chiropractic care helps relieve neck and back pain and improve mobility and function. At SOZO, two experienced chiropractors offer hands-on care in a calm, patient-first setting.</p>
        <div className="cx-hero-actions fade-up delay-2">
          <a href={PHONE_HREF} className="btn btn-primary" data-testid="link-hero-phone"><Phone size={17} aria-hidden="true" /> {PHONE_LABEL}</a>
          <a href="#chiropractors" className="btn btn-outline" data-testid="link-hero-team">Meet the chiropractors <ArrowRight size={17} aria-hidden="true" /></a>
        </div>
        <nav className="cx-jump fade-up delay-3" aria-label="Chiropractors">
          <a href="#jt-anderson" data-testid="link-jump-jt-anderson"><img src="/images/team/jt-anderson.jpg" alt="" />JT Anderson, DC</a>
          <a href="#lauren-alvarez-schmitz" data-testid="link-jump-lauren-alvarez-schmitz"><img src="/images/team/lauren-alvarez-schmitz.jpg" alt="" />Lauren Alvarez Schmitz, DC</a>
        </nav>
      </div>
    </section>

    <section className="section" aria-labelledby="cx-why-heading">
      <div className="container cx-why">
        <div>
          <span className="eyebrow">Understanding care</span>
          <h2 id="cx-why-heading" className="serif">Why people seek chiropractic care</h2>
          <p>Chiropractic care is a hands-on approach centered on the spine and joints. Adjustments and related techniques aim to restore healthy movement, relieve pain, and help your body function the way it should.</p>
          <p>Your chiropractor will listen first, then talk through what they find and the care they recommend. Chiropractic care can work alongside the other care you receive, so keep your physician informed about your health decisions.</p>
        </div>
        <ol className="cx-reasons">
          {reasons.map((r, i) => (
            <li key={r.t}>
              <span className="cx-no" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <div><h3>{r.t}</h3><p>{r.d}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>

    <section id="chiropractors" className="section cx-team" aria-labelledby="cx-team-heading">
      <div className="container">
        <div className="cx-team-head">
          <span className="eyebrow">Our chiropractors</span>
          <h2 id="cx-team-heading" className="serif">Two chiropractors, two distinct strengths.</h2>
          <p>One brings decades of sports and injury experience; the other brings a family-centered approach and a broad toolkit of techniques. Both are Certified Shockwave Practitioners.</p>
        </div>

        <article id="jt-anderson" className="cx-provider" aria-labelledby="jt-anderson-name" data-testid="card-provider-jt-anderson">
          <figure className="cx-photo"><img src="/images/team/jt-anderson.jpg" alt="JT Anderson, DC" loading="lazy" /></figure>
          <div className="cx-body">
            <span className="cx-label">Independent Chiropractor</span>
            <h3 id="jt-anderson-name">JT Anderson, DC</h3>
            <p className="cx-tagline">Sports chiropractic, injury recovery and post-accident rehabilitation</p>
            <p>JT Anderson spent 30 years running a successful chiropractic practice in Colorado, including serving as a chiropractor for The Denver Broncos. Now a Florida resident, he was drawn here by the outdoor lifestyle and the coast.</p>
            <p>His work centers on sports chiropractic, injury recovery and post-accident rehabilitation, with particular attention to the injuries that come with an active life on the pickleball court and golf course.</p>
            <dl className="cx-facts">
              <div><dt>Experience</dt><dd>30 years in practice in Colorado</dd></div>
              <div><dt>Specialties</dt><dd><ul className="cx-chips"><li>Sports Chiropractic</li><li>Injury recovery</li><li>Post-accident rehabilitation</li></ul></dd></div>
              <div><dt>Credentials</dt><dd><ul className="cx-chips"><li>Certified Shockwave Practitioner</li><li>Pickleball and Golf Injury Specialist</li></ul></dd></div>
              <div><dt>Sports</dt><dd>Former chiropractor for The Denver Broncos</dd></div>
            </dl>
            <aside className="cx-notice" role="note" data-testid="text-jt-independent">
              <Info size={20} aria-hidden="true" />
              <div><strong>Independent practitioner</strong><p>JT Anderson, DC is an independent practitioner with an office inside SOZO Wellness Center.</p></div>
            </aside>
          </div>
        </article>

        <article id="lauren-alvarez-schmitz" className="cx-provider" aria-labelledby="lauren-name" data-testid="card-provider-lauren-alvarez-schmitz">
          <figure className="cx-photo"><img src="/images/team/lauren-alvarez-schmitz.jpg" alt="Lauren Alvarez Schmitz, DC" loading="lazy" /></figure>
          <div className="cx-body">
            <span className="cx-label">Chiropractor</span>
            <h3 id="lauren-name">Lauren Alvarez Schmitz, DC</h3>
            <p className="cx-tagline">Family-centered chiropractic care</p>
            <p>Lauren Alvarez Schmitz earned her Bachelor of Science before completing her chiropractic education at Palmer College of Chiropractic. While there she was involved in the PX Pediatrics Club and the MoPal Club, and founded and served as president of the Applied Kinesiology Club.</p>
            <p>Her care is family-centered, drawing on a range of techniques so treatment can be matched to each person.</p>
            <dl className="cx-facts">
              <div><dt>Education</dt><dd>Bachelor of Science; Palmer College of Chiropractic</dd></div>
              <div><dt>Techniques</dt><dd><ul className="cx-chips"><li>Diversified</li><li>Thompson</li><li>Gonstead</li><li>Activator</li><li>TRT</li><li>Webster</li></ul></dd></div>
              <div><dt>Credentials</dt><dd><ul className="cx-chips"><li>Certified Shockwave Practitioner</li></ul></dd></div>
              <div><dt>Leadership</dt><dd>Founder and president, Applied Kinesiology Club; member, PX Pediatrics Club and MoPal Club</dd></div>
            </dl>
            <p className="cx-personal">A wife and mother, Lauren enjoys gardening, paddleboarding, her chickens and time with family.</p>
          </div>
        </article>
      </div>
    </section>

    <section className="section" aria-labelledby="cx-related-heading">
      <div className="container">
        <div className="cx-related">
          <div>
            <span className="eyebrow">Related treatment</span>
            <h2 id="cx-related-heading">ReGen RCT shockwave</h2>
            <p>Both chiropractors are Certified Shockwave Practitioners. Learn how ReGen RCT compares with other shockwave options on our shockwave page.</p>
          </div>
          <Link href="/services/shockwave" className="btn btn-outline" data-testid="link-related-shockwave">Explore shockwave <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
      </div>
    </section>

    <section className="cx-close" aria-labelledby="cx-close-heading">
      <div className="container">
        <div>
          <span className="eyebrow light">Next step</span>
          <h2 id="cx-close-heading">Questions about a <em>chiropractic appointment?</em></h2>
          <p>For chiropractic appointments and questions, please text or call our front desk. Interested in a broader SOZO wellness assessment? You can request one online.</p>
        </div>
        <div className="cx-close-actions">
          <a href={PHONE_HREF} className="btn btn-light" data-testid="link-close-phone"><Phone size={17} aria-hidden="true" /> {PHONE_LABEL}</a>
          <Link href="/request-assessment" className="cx-close-phone" data-testid="link-close-assessment">{ASSESSMENT_CTA} <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  </>;
}

export default ChiropracticPage;
