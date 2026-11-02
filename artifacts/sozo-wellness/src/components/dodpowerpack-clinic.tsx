import { Link } from 'wouter';
import { ArrowRight, Phone, Hand, Waves, HeartPulse } from 'lucide-react';
import { ASSESSMENT_CTA } from '../lib/inquiry';
import './dodpowerpack-clinic.css';

const PHONE_HREF = 'tel:+13528022248';
const PHONE_LABEL = 'Text or Call 352-802-2248';

type Treatment = {
  key: string;
  no: string;
  name: string;
  kicker: string;
  icon: typeof Hand;
  summary: string;
  points: string[];
  href: string;
  linkLabel: string;
  testId: string;
  visual: { src: string; alt: string; note?: string; aspectRatio?: string };
};

const treatments: Treatment[] = [
  {
    key: 'wolfe', no: '01', name: 'Wolfe Non-Surgical Bodywork', kicker: 'Hands-on', icon: Hand,
    summary: 'A focused, hands-on technique designed to address deep tissue restrictions, along with the tightness and stiffness that can come with scar tissue.',
    points: ['Targeted manual pressure, including elbow techniques', 'Works with muscles and fascia', 'Goals: improved comfort, flexibility and range of motion'],
    href: '/services/wolfe-non-surgical-bodywork', linkLabel: 'Learn more about Wolfe Bodywork', testId: 'link-dod-wolfe',
    visual: { src: '/images/clinic/wolfe-bodywork-spine.jpg', alt: 'Illustration highlighting the spine, knee, shoulder and ankle alongside a person holding their lower back', aspectRatio: '800 / 465' },
  },
  {
    key: 'cellsonic', no: '02', name: 'Cellsonic', kicker: 'Pressure-pulse', icon: Waves,
    summary: 'Targeted pressure-pulse technology applied from outside the body. We offer CellSonic ESWT for deeper pain concerns.',
    points: ['Non-invasive, applied over the area of concern', 'Goals: tissue recovery and more comfortable movement', 'Intended to support the body’s natural repair'],
    href: '/services/shockwave', linkLabel: 'Learn more on our Shockwave & CellSonic page', testId: 'link-dod-cellsonic',
    visual: { src: '/images/clinic/cellsonic-session.webp', alt: 'SOZO practitioner applying CellSonic to a visitor’s upper back', note: 'A CellSonic session at SOZO' },
  },
  {
    key: 'cardio', no: '03', name: 'Cardio MedBed', kicker: 'Circulation', icon: HeartPulse,
    summary: 'Based on EECP: noninvasive inflatable cuffs inflate in time with the heartbeat to help return blood toward the heart.',
    points: ['Potential support for circulation', 'May aid oxygen and nutrient delivery', 'May help the heart work more efficiently'],
    href: '/services/cardio-medbed', linkLabel: 'Learn more about Cardio MedBed', testId: 'link-dod-cardio',
    visual: { src: '/images/clinic/cardio-medbed-lifestyle.webp', alt: 'A person resting on a Cardio MedBed with leg cuffs while a practitioner adjusts the controls', note: 'Cardio MedBed · noninvasive EECP' },
  },
];

export function DODPowerPackClinic() {
  return <>
    <section className="page-hero dod-hero">
      <div className="container">
        <span className="crumb"><Link href="/" data-testid="link-breadcrumb-home">Home</Link> / DODPowerPack Clinic</span>
        <div className="dod-badge fade-up"><span className="dod-seal" aria-hidden="true">D</span>Certified DODPowerPack Clinic</div>
        <h1 className="serif fade-up delay-1">DODPowerPack Clinic <em>at SOZO.</em></h1>
        <p className="fade-up delay-2">Hands-on bodywork. Targeted pressure pulses. Support for circulation. Explore three approaches to movement and recovery, with personal guidance from our SOZO team.</p>
        <nav className="dod-index fade-up delay-3" aria-label="The three approaches">
          {treatments.map(t => (
            <a key={t.key} href={`#dod-${t.key}`} data-testid={`link-jump-${t.key}`}>
              <span>{t.no}</span>{t.name}
            </a>
          ))}
        </nav>
      </div>
    </section>

    <section id="dod-treatments" className="dod-treatments" aria-labelledby="dod-treatments-heading">
      <div className="container">
        <div className="dod-intro">
          <span className="eyebrow">Three approaches</span>
          <h2 id="dod-treatments-heading" className="serif">Different tools, <em>one person at the center.</em></h2>
          <p>Your goals guide the next step. We’ll help you understand the differences between hands-on bodywork, targeted pressure pulses and external counterpulsation so you can explore the approach that fits you.</p>
        </div>

        <ol className="dod-list">
          {treatments.map((t, i) => {
            const Icon = t.icon;
            return (
              <li key={t.key} id={`dod-${t.key}`} className={`dod-item${i % 2 ? ' is-flip' : ''}`} data-testid={`card-dod-${t.key}`}>
                <figure className="dod-visual" style={t.visual.aspectRatio ? { aspectRatio: t.visual.aspectRatio } : undefined}>
                  <img src={t.visual.src} alt={t.visual.alt} loading="lazy" />
                  {t.visual.note && <figcaption>{t.visual.note}</figcaption>}
                </figure>
                <div className="dod-copy">
                  <div className="dod-meta">
                    <span className="dod-no" aria-hidden="true">{t.no}</span>
                    <span className="dod-kicker"><Icon size={18} aria-hidden="true" />{t.kicker}</span>
                  </div>
                  <h3 className="serif">{t.name}</h3>
                  <p className="dod-summary">{t.summary}</p>
                  <ul className="dod-points">{t.points.map(p => <li key={p}>{p}</li>)}</ul>
                  <Link href={t.href} className="btn btn-outline dod-learn" data-testid={t.testId}>{t.linkLabel} <ArrowRight size={17} aria-hidden="true" /></Link>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>

    <section className="dod-close" aria-labelledby="dod-close-heading">
      <div className="container">
        <div>
          <span className="eyebrow light">Not sure where to begin?</span>
          <h2 id="dod-close-heading" className="serif">Start with a <em>wellness assessment.</em></h2>
          <p>Send us an assessment request, or text or call us to talk through which approach might suit you.</p>
        </div>
        <div className="dod-close-actions">
          <Link href="/request-assessment" className="btn btn-light" data-testid="link-dod-assessment">{ASSESSMENT_CTA} <ArrowRight size={17} aria-hidden="true" /></Link>
          <a href={PHONE_HREF} className="dod-phone" data-testid="link-dod-phone"><Phone size={17} aria-hidden="true" />{PHONE_LABEL}</a>
        </div>
      </div>
    </section>
  </>;
}

export default DODPowerPackClinic;
