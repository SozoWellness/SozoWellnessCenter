import { Link } from 'wouter';
import { ArrowRight, Phone, Check, Clock } from 'lucide-react';
import { packageGroups } from '../data/packages';
import { ASSESSMENT_CTA } from '../lib/inquiry';
import './packages.css';

const PHONE_LABEL = 'Text or Call 352-802-2248';
const PHONE_HREF = 'tel:+13528022248';

export function PackagesPage() {
  return <>
    <section className="page-hero pk-hero">
      <div className="container">
        <span className="crumb"><Link href="/" data-testid="link-breadcrumb-home">Home</Link> / Packages</span>
        <div className="pk-eyebrow-row"><span className="eyebrow">Services</span></div>
        <h1 className="serif fade-up">Wellness <em>packages.</em></h1>
        <p className="fade-up delay-1">Every SOZO package in one place: what is included, the package price, and the listed retail value. Read at your own pace, then talk it through with our team.</p>
        <div className="pk-hero-actions fade-up delay-2">
          <Link href="/request-assessment" className="btn btn-primary" data-testid="link-hero-assessment">{ASSESSMENT_CTA} <ArrowRight size={17} aria-hidden="true" /></Link>
          <a href={PHONE_HREF} className="btn btn-outline" data-testid="link-hero-phone"><Phone size={17} aria-hidden="true" /> {PHONE_LABEL}</a>
        </div>
      </div>
    </section>

    <nav className="pk-jump" aria-label="Package groups">
      <div className="container">
        <span className="pk-jump-label">Jump to</span>
        <ul>
          {packageGroups.map((g, i) => (
            <li key={g.id}>
              <a href={`#${g.id}`} data-testid={`link-jump-${g.id}`}>
                <span className="pk-jump-no">{String(i + 1).padStart(2, '0')}</span>{g.title}
                {g.comingSoon && <span className="pk-soon-mini">Coming soon</span>}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>

    <div className="pk-body">
      <div className="container">
        <aside className="pk-guide" aria-labelledby="pk-guide-heading">
          <h2 id="pk-guide-heading" className="serif">How to read each package</h2>
          <dl>
            <div><dt>Package price</dt><dd>What you pay for the full package.</dd></div>
            <div><dt>Retail value</dt><dd>The listed value of the same services when booked individually.</dd></div>
            <div><dt>Session frequency</dt><dd>The visit frequency listed for that package, where one is given.</dd></div>
          </dl>
          <p>Not sure which fits? That is exactly what the assessment conversation is for. Our team can talk through suitability and confirm final package details with you.</p>
        </aside>

        {packageGroups.map((g, gi) => {
          const custom = g.id === 'customize-your-care';
          return (
            <section key={g.id} id={g.id} className={`pk-group${g.comingSoon ? ' is-soon' : ''}${custom ? ' is-custom' : ''}`} aria-labelledby={`${g.id}-heading`} data-testid={`section-group-${g.id}`}>
              <header className="pk-group-head">
                <span className="pk-group-no" aria-hidden="true">{String(gi + 1).padStart(2, '0')}</span>
                <div>
                  <p className="pk-group-sub">{g.subtitle}</p>
                  <h2 id={`${g.id}-heading`} className="serif">{g.title}</h2>
                  {g.comingSoon && <p className="pk-soon" data-testid="status-brain-health"><Clock size={16} aria-hidden="true" /> Coming soon</p>}
                  {g.description && <p className="pk-group-desc">{g.description}</p>}
                </div>
                {g.service && (
                  <Link href={g.service.href} className="btn btn-text pk-service-link" data-testid={`link-service-${g.id}`}>{g.service.label} <ArrowRight size={16} aria-hidden="true" /></Link>
                )}
              </header>

              <div className={`pk-grid pk-count-${g.packages.length}`}>
                {g.packages.map(p => (
                  <article key={p.id} className="pk-card" aria-labelledby={`${p.id}-name`} data-testid={`card-package-${p.id}`}>
                    <h3 id={`${p.id}-name`} className="serif">{p.name}</h3>
                    <dl className="pk-price">
                      <div className="pk-price-main"><dt>Package price</dt><dd data-testid={`text-price-${p.id}`}>{p.price}</dd></div>
                      <div className="pk-price-retail"><dt>Retail value</dt><dd data-testid={`text-retail-${p.id}`}>{p.retailValue}</dd></div>
                    </dl>
                    {p.offer && <p className="pk-offer" data-testid={`text-offer-${p.id}`}>{p.offer}</p>}
                    <h4 className="pk-includes-label">{custom ? 'May include' : 'Included'}</h4>
                    <ul className="pk-items">
                      {p.items.map(item => <li key={item}><Check size={17} aria-hidden="true" /><span>{item}</span></li>)}
                    </ul>
                    {p.frequency && <p className="pk-freq" data-testid={`text-frequency-${p.id}`}><span>Session frequency</span>{p.frequency}</p>}
                    <div className="pk-card-foot">
                      {g.comingSoon ? (
                        <p className="pk-soon-note">Coming soon. Text or call our team for availability updates.</p>
                      ) : (
                        <Link href="/request-assessment" className="pk-card-cta" data-testid={`link-assessment-${p.id}`}>
                          {custom ? 'Discuss a custom package' : 'Ask about this package'} <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>

    <section className="pk-close" aria-labelledby="pk-close-heading">
      <div className="container">
        <div>
          <span className="eyebrow light">Next step</span>
          <h2 id="pk-close-heading" className="serif">Start with a conversation, <em>not a commitment.</em></h2>
          <p>Text or call our team to arrange your assessment, talk through your goals, and confirm which package fits your needs. We’ll explain the options and final details before you decide.</p>
        </div>
        <div className="pk-close-actions">
          <Link href="/request-assessment" className="btn btn-light" data-testid="link-close-assessment">{ASSESSMENT_CTA} <ArrowRight size={17} aria-hidden="true" /></Link>
          <a href={PHONE_HREF} className="pk-close-phone" data-testid="link-close-phone"><Phone size={17} aria-hidden="true" /> {PHONE_LABEL}</a>
        </div>
      </div>
    </section>
  </>;
}

export default PackagesPage;
