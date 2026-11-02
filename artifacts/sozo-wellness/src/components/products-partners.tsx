import { Link } from 'wouter';
import { ArrowUpRight, Mail, Phone, Info, ArrowRight } from 'lucide-react';
import { partners } from '@/data/partners';
import './products-partners.css';

const PHONE = '+13528022248';
const PHONE_LABEL = '352-802-2248';
const EMAIL = 'info@sozorootedwellness.com';

export function ProductsPartners() {
  const hwaveSubject = encodeURIComponent('H-WAVE purchase enquiry');
  return <>
    <section className="page-hero pp-hero">
      <div className="container">
        <span className="crumb"><Link href="/" data-testid="link-breadcrumb-home">Home</Link> / Products &amp; Partners</span>
        <div style={{ marginTop: 32 }}><span className="eyebrow">Products &amp; Partners</span></div>
        <h1 className="serif fade-up">Tools we trust to <em>extend your care</em> at home.</h1>
        <p className="fade-up delay-1">Wellness does not stop when you leave the clinic. These are the products and partners we recommend to clients who want to keep building on their care between visits, from rest and recovery to everyday nutrition.</p>
        <p className="fade-up delay-2">Not sure where to start? Ask us during your visit and we will help you consider what fits your goals.</p>
      </div>
    </section>

    <section className="section pp-section" aria-labelledby="pp-list-heading">
      <div className="container">
        <aside className="pp-disclosure" role="note" aria-label="Affiliate disclosure" data-testid="text-affiliate-disclosure">
          <Info size={22} aria-hidden="true" />
          <div>
            <strong>Affiliate disclosure</strong>
            <p>We may earn a commission when you purchase through links on this page.</p>
          </div>
        </aside>

        <div className="pp-head">
          <h2 id="pp-list-heading" className="section-title serif">Eleven partners, one whole-person approach.</h2>
          <nav className="pp-index" aria-label="Jump to a partner">
            {partners.map(p => <a key={p.id} href={`#partner-${p.id}`} data-testid={`link-jump-${p.id}`}>{p.name}</a>)}
          </nav>
        </div>

        <ol className="pp-list">
          {partners.map((p, i) => (
            <li key={p.id} id={`partner-${p.id}`} className={`pp-card${p.clinicOnly ? ' is-clinic' : ''}`} data-testid={`card-partner-${p.id}`}>
              <div className="pp-media">
                <img src={p.image} alt={p.imageAlt} loading={i < 2 ? 'eager' : 'lazy'} width="800" height="600" />
                {p.clinicOnly && <span className="pp-flag">Sold exclusively at SOZO</span>}
              </div>
              <div className="pp-body">
                <div className="pp-meta"><span>{String(i + 1).padStart(2, '0')}</span><span>{p.category}</span></div>
                <h3 className="serif" data-testid={`text-partner-name-${p.id}`}>{p.name}</h3>
                <p className="pp-desc">{p.description}</p>
                <div className="pp-why">
                  <span className="pp-why-label">Why we recommend it</span>
                  <p>{p.recommendation}</p>
                </div>
                <div className="pp-actions">
                  {p.href ? (
                    <a className="btn btn-primary" href={p.href} target="_blank" rel="sponsored noopener noreferrer" data-testid={`link-partner-${p.id}`}>
                      Visit {p.name}<span className="sr-only"> (opens in a new tab, affiliate link)</span> <ArrowUpRight size={17} aria-hidden="true" />
                    </a>
                  ) : (
                    <>
                      <p className="pp-exclusive"><strong>Sold exclusively at SOZO.</strong> Contact us to ask about purchasing.</p>
                      <a className="btn btn-primary" href={`tel:${PHONE}`} data-testid={`link-partner-phone-${p.id}`}><Phone size={17} aria-hidden="true" /><span>Text or Call {PHONE_LABEL}</span></a>
                      <a className="btn btn-outline" href={`mailto:${EMAIL}?subject=${hwaveSubject}`} data-testid={`link-partner-email-${p.id}`}><Mail size={17} aria-hidden="true" /> Email about H-WAVE</a>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>

    <section className="contact-strip">
      <div className="container">
        <div>
          <span className="eyebrow">Talk it through</span>
          <h2>Questions about a product?</h2>
          <p className="section-intro">Our team is happy to talk through any of these options with you and how they might fit alongside your care.</p>
        </div>
        <div className="pp-contact">
          <a className="btn btn-primary" href={`tel:${PHONE}`} data-testid="link-contact-phone"><Phone size={17} aria-hidden="true" /><span>Text or Call {PHONE_LABEL}</span></a>
          <Link href="/request-assessment" className="btn btn-outline" data-testid="link-contact-page">Contact SOZO <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  </>;
}

export default ProductsPartners;
