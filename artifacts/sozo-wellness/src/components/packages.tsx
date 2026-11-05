import { Link } from 'wouter';
import { ArrowRight, Phone, Check, Info, CalendarDays } from 'lucide-react';
import { freedomPackages, painPackage, packagePolicy, circulationProgram, wellnessServices, wellnessPathways, formatPrice } from '../data/packages';
import { getInquiryHref } from '../lib/inquiry';
import { JaneBookingLink } from './jane-booking-link';
import './packages.css';

const PHONE_LABEL = 'Text or Call 352-802-2248';
const PHONE_HREF = 'tel:+13528022248';
const ENQUIRY_HREF = getInquiryHref('Wellness assessments');

const jumpLinks = [
  { id: 'packages', label: 'Freedom Packages' },
  { id: 'pain-package', label: 'Pain Package' },
  { id: 'package-details', label: 'Package details' },
  { id: 'special-program', label: 'Circulation & Vitality Program' },
  { id: 'pathways', label: 'Wellness Pathways' },
];

function serviceHref(name: string) {
  return wellnessServices.find(s => s.name === name || s.aliases?.includes(name))?.href;
}

export function PackagesPage() {
  const c = circulationProgram;
  return <>
    <section className="page-hero pk-hero">
      <div className="container">
        <span className="crumb"><Link href="/" data-testid="link-breadcrumb-home">Home</Link> / Packages</span>
        <div className="pk-eyebrow-row"><span className="eyebrow">Wellness Packages</span></div>
        <h1 className="serif fade-up">Your wellness. <em>Your next step.</em></h1>
        <p className="fade-up delay-1">Explore our Freedom session packages, Pain Package and Circulation &amp; Vitality Program. Read at your own pace, then talk with our team about the services and package that fit your goals.</p>
        <div className="pk-hero-actions fade-up delay-2">
          <JaneBookingLink testId="link-hero-booking" />
          <a href={PHONE_HREF} className="btn btn-outline" data-testid="link-hero-phone"><Phone size={17} aria-hidden="true" /> {PHONE_LABEL}</a>
        </div>
      </div>
    </section>

    <nav className="pk-jump" aria-label="On this page">
      <div className="container">
        <span className="pk-jump-label">Jump to</span>
        <ul>
          {jumpLinks.map((j, i) => (
            <li key={j.id}>
              <a href={`#${j.id}`} data-testid={`link-jump-${j.id}`}>
                <span className="pk-jump-no">{String(i + 1).padStart(2, '0')}</span>{j.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>

    <div className="pk-body">
      <div className="container">
        <section id="packages" className="pk-group" aria-labelledby="packages-heading" data-testid="section-packages">
          <header className="pk-group-head">
            <span className="pk-group-no" aria-hidden="true">01</span>
            <div>
              <p className="pk-group-sub">Your wellness routine</p>
              <h2 id="packages-heading" className="serif">Freedom Packages</h2>
              <p className="pk-group-desc">Choose from four session packages. We’ll help you explore your options and confirm the included services before you decide.</p>
            </div>
          </header>
          <div className={`pk-grid pk-count-${freedomPackages.length}`}>
            {freedomPackages.map(p => (
              <article key={p.id} className="pk-card" aria-labelledby={`${p.id}-name`} data-testid={`card-package-${p.id}`}>
                <h3 id={`${p.id}-name`} className="serif">{p.name}</h3>
                <p className="pk-sessions"><strong data-testid={`text-session-count-${p.id}`}>{p.sessions}</strong> sessions</p>
                <dl className="pk-price">
                  <div className="pk-price-main"><dt>Package price</dt><dd data-testid={`text-price-${p.id}`}>{formatPrice(p.price)}</dd></div>
                </dl>
                <p className="pk-card-desc">{p.description}</p>
                <div className="pk-card-foot">
                  <Link href={ENQUIRY_HREF} className="pk-card-cta" data-testid={`link-enquire-${p.id}`}>
                    Enquire about the {p.name} <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="pain-package" className="pk-guide" aria-labelledby="pain-package-heading" data-testid="section-pain-package">
          <div>
            <p className="pk-group-sub">A focused starting point</p>
            <h2 id="pain-package-heading" className="serif">{painPackage.name}</h2>
          </div>
          <div>
            <p className="pk-sessions"><strong data-testid="text-pain-session-count">{painPackage.sessions}</strong> sessions</p>
            <dl className="pk-price">
              <div className="pk-price-main"><dt>Package price</dt><dd data-testid="text-pain-price">{formatPrice(painPackage.price)}</dd></div>
            </dl>
            <p>{painPackage.description}</p>
            <Link href={ENQUIRY_HREF} className="btn btn-text" data-testid="link-enquire-pain">Enquire about the Pain Package <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
        </section>

        <section id="package-details" className="pk-guide" aria-labelledby="package-details-heading" data-testid="section-package-policy">
          <h2 id="package-details-heading" className="serif">Find your package</h2>
          <div>
            <p className="pk-policy-summary"><Info size={20} aria-hidden="true" /><span>{packagePolicy.summary}</span></p>
            <p className="pk-policy-note">{packagePolicy.termsNote}</p>
            <a href={PHONE_HREF} className="btn btn-text" data-testid="link-package-details-phone"><Phone size={16} aria-hidden="true" /> Ask our team: 352-802-2248</a>
          </div>
        </section>

        <section className="pk-service-directory" aria-labelledby="wellness-services-heading" data-testid="section-wellness-services">
          <h2 id="wellness-services-heading" className="serif">Explore our wellness services</h2>
          <p>Explore these services with our team. This directory is not a list of package inclusions; we’ll confirm which sessions apply to your selected package.</p>
          <ul className="pk-service-list">
            {wellnessServices.map(service => (
              <li key={service.id} data-testid={`service-${service.id}`}>
                {service.href ? <Link href={service.href}>{service.name} <ArrowRight size={15} aria-hidden="true" /></Link> : <span>{service.name}</span>}
              </li>
            ))}
          </ul>
        </section>

        <section id="special-program" className="pk-group pk-special" aria-labelledby="special-heading" data-testid="section-circulation-program">
          <header className="pk-group-head">
            <span className="pk-group-no" aria-hidden="true">02</span>
            <div>
              <p className="pk-group-sub">Special program</p>
              <h2 id="special-heading" className="serif">{c.name}</h2>
              <p className="pk-group-desc">{c.subtitle}</p>
            </div>
          </header>
          <div className="pk-special-card">
            <div>
              <ul className="pk-facts">
                <li><strong>{c.visits}</strong><span>visits</span></li>
                <li><strong>{c.weeks}</strong><span>weeks</span></li>
                <li><strong>{c.visitsPerWeek}</strong><span>visits per week</span></li>
                <li><strong>{c.sessionMinutes}</strong><span>minute sessions</span></li>
              </ul>
              <h3 className="pk-includes-label">Program includes</h3>
              <ul className="pk-items">
                {c.therapies.map(t => <li key={t}><Check size={17} aria-hidden="true" /><span>{c.visits} {t} sessions ({c.sessionMinutes} minutes each)</span></li>)}
              </ul>
              <p className="pk-freq"><span><CalendarDays size={14} aria-hidden="true" /> Schedule</span>{c.visitsPerWeek} days per week for {c.weeks} weeks. {c.schedule}</p>
            </div>
            <div className="pk-special-price">
              <dl>
                <div><dt>Program price</dt><dd className="pk-big" data-testid="text-circulation-price">{formatPrice(c.price)}</dd></div>
                <div><dt>Regular price</dt><dd><s data-testid="text-circulation-regular-price">{formatPrice(c.regularPrice)}</s></dd></div>
                <div><dt>You save</dt><dd className="pk-save" data-testid="text-circulation-savings">{formatPrice(c.regularPrice - c.price)}</dd></div>
              </dl>
              <p className="pk-sep-note">{c.pricingNote}</p>
              <Link href={ENQUIRY_HREF} className="btn btn-primary" data-testid="link-enquire-circulation">Enquire about this program <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
          </div>
        </section>

        <section id="pathways" className="pk-group" aria-labelledby="pathways-heading" data-testid="section-pathways">
          <header className="pk-group-head">
            <span className="pk-group-no" aria-hidden="true">03</span>
            <div>
              <p className="pk-group-sub">Example combinations</p>
              <h2 id="pathways-heading" className="serif">Wellness Pathways</h2>
              <p className="pk-group-desc">These are example service combinations grouped by wellness goal. They are not fixed treatment plans and do not promise outcomes. Our team will talk through what may suit you.</p>
            </div>
          </header>
          <div className="pk-path-grid">
            {wellnessPathways.map((w, i) => (
              <article key={w.id} className="pk-path" aria-labelledby={`${w.id}-title`} data-testid={`card-pathway-${w.id}`}>
                <span className="pk-path-no" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3 id={`${w.id}-title`} className="serif">{w.title}</h3>
                <ul>
                  {w.services.map(s => {
                    const href = serviceHref(s);
                    return <li key={s}>{href ? <Link href={href} data-testid={`link-pathway-service-${w.id}-${s.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>{s}</Link> : s}</li>;
                  })}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>

    <section className="pk-close" aria-labelledby="pk-close-heading">
      <div className="container">
        <div>
          <span className="eyebrow light">Next step</span>
          <h2 id="pk-close-heading" className="serif">Start with a conversation, <em>not a commitment.</em></h2>
          <p>Text or call our team to talk through your goals, confirm which sessions are included in your selected package, and review terms before you decide.</p>
        </div>
        <div className="pk-close-actions">
          <JaneBookingLink className="btn btn-light" testId="link-close-booking" />
          <Link href={ENQUIRY_HREF} className="pk-close-phone" data-testid="link-close-enquiry">Send a package enquiry <ArrowRight size={17} aria-hidden="true" /></Link>
          <a href={PHONE_HREF} className="pk-close-phone" data-testid="link-close-phone"><Phone size={17} aria-hidden="true" /> {PHONE_LABEL}</a>
        </div>
      </div>
    </section>
  </>;
}

export default PackagesPage;
