import { Link } from 'wouter';
import { ArrowRight, Brain, Heart, Sparkles, Wind } from 'lucide-react';
import { JaneBookingLink } from './jane-booking-link';
import {
  coachingIntro,
  coachingSections,
  coachingGoals,
  coachingProcess,
  coachingTherapies,
  coachingInvitation,
  coachingPreview,
} from '../data/whole-life-coaching';
import './whole-life-coaching.css';

const dimensions = [
  { label: 'Mental', icon: Brain },
  { label: 'Emotional', icon: Heart },
  { label: 'Physical', icon: Wind },
  { label: 'Spiritual', icon: Sparkles },
];

function DimensionRow() {
  return (
    <ul className="wlc-dimensions" aria-label="Four dimensions of wellness">
      {dimensions.map(({ label, icon: Icon }) => (
        <li key={label}><Icon size={22} strokeWidth={1.5} aria-hidden="true" />{label}</li>
      ))}
    </ul>
  );
}

export function WholeLifeCoachingPreview() {
  return (
    <section className="section wlc-preview" data-testid="section-coaching-preview" aria-labelledby="wlc-preview-heading">
      <div className="container wlc-preview-inner">
        <div>
          <span className="eyebrow">Whole Life Wellness Coaching</span>
          <h2 id="wlc-preview-heading" className="serif">{coachingPreview.title}</h2>
        </div>
        <div>
          <p>{coachingPreview.text}</p>
          <DimensionRow />
          <Link href="/services/whole-life-coaching" className="btn btn-primary" data-testid="link-home-coaching">
            Explore whole life coaching <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function WholeLifeCoachingPage() {
  return (
    <div data-testid="page-whole-life-coaching">
      <section className="page-hero wlc-hero">
        <div className="container">
          <span className="crumb"><Link href="/" data-testid="link-breadcrumb-home">Home</Link> / Whole Life Coaching</span>
          <span className="eyebrow wlc-hero-eyebrow fade-up">{coachingIntro.eyebrow}</span>
          <h1 className="serif fade-up delay-1">{coachingIntro.title}</h1>
          <p className="fade-up delay-2">{coachingIntro.summary}</p>
          <DimensionRow />
          <div className="wlc-actions fade-up delay-3">
            <JaneBookingLink testId="link-coaching-booking" />
            <Link href="/request-assessment" className="btn btn-outline" data-testid="link-coaching-enquiry">
              Ask us a question <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="section wlc-sections" aria-label="About whole life coaching">
        <div className="container">
          {coachingSections.map((s, i) => (
            <article key={s.id} id={s.id} className="wlc-section" data-testid={`section-coaching-${s.id}`}>
              <span className="wlc-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <h2 className="serif">{s.title}</h2>
              <div>{s.paragraphs.map(p => <p key={p.slice(0, 32)}>{p}</p>)}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="section wlc-benefits" data-testid="section-coaching-benefits" aria-labelledby="wlc-benefits-heading">
        <div className="container">
          <span className="eyebrow">Benefits of whole life coaching</span>
          <h2 id="wlc-benefits-heading" className="section-title serif">Benefits you can work toward with us</h2>
          <ul className="wlc-benefit-grid">
            {coachingGoals.map(g => (
              <li key={g.title}>
                <h3 className="serif">{g.title}</h3>
                <p>{g.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section wlc-process" data-testid="section-coaching-process" aria-labelledby="wlc-process-heading">
        <div className="container">
          <span className="eyebrow">What to expect</span>
          <h2 id="wlc-process-heading" className="section-title serif">How coaching works at SOZO</h2>
          <ol className="wlc-steps">
            {coachingProcess.map((step, i) => (
              <li key={step.title}>
                <span className="wlc-step-no" aria-hidden="true">{i + 1}</span>
                <div>
                  <h3 className="serif">{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section wlc-therapies" data-testid="section-coaching-therapies" aria-labelledby="wlc-therapies-heading">
        <div className="container">
          <span className="eyebrow">Coaching alongside our therapies</span>
          <h2 id="wlc-therapies-heading" className="section-title serif">Explore our services with the whole you in mind</h2>
          <ul className="wlc-therapy-list">
            {coachingTherapies.map(t => {
              const slug = t.href.split('/').pop();
              return (
                <li key={t.href}>
                  <Link href={t.href} data-testid={`link-coaching-therapy-${slug}`}>
                    <span className="wlc-therapy-name serif">{t.name}</span>
                    <span className="wlc-therapy-text">{t.text}</span>
                    <ArrowRight size={20} aria-hidden="true" className="wlc-therapy-arrow" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="wlc-close" aria-labelledby="wlc-close-heading">
        <div className="container">
          <div>
            <span className="eyebrow light">Your next step</span>
            <h2 id="wlc-close-heading" className="serif">{coachingInvitation.title}</h2>
            <p>{coachingInvitation.text}</p>
          </div>
          <div className="wlc-close-actions">
            <JaneBookingLink className="btn btn-light" testId="link-coaching-booking-close" />
            <Link href="/request-assessment" className="wlc-close-link" data-testid="link-coaching-enquiry-close">
              Send us a question <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default WholeLifeCoachingPage;
