import { Link } from 'wouter';
import { ArrowUpRight, ArrowRight, Info } from 'lucide-react';
import { independentPhysicianServices } from '@/data/independent-physician-services';
import './independent-physicians.css';

const YYMD_URL = 'https://yearsyoungermd.com';

function ExternalButton({ testId }: { testId: string }) {
  return (
    <a className="btn btn-primary ip-ext" href={YYMD_URL} target="_blank" rel="noopener noreferrer" data-testid={testId}>
      Visit Years Younger MD<span className="sr-only"> (opens in a new tab)</span> <ArrowUpRight size={17} aria-hidden="true" />
    </a>
  );
}

export function IndependentPhysicians() {
  return <>
    <section className="page-hero ip-hero">
      <div className="container">
        <span className="crumb"><Link href="/" data-testid="link-breadcrumb-home">Home</Link> / Independent Physician</span>
        <div style={{ marginTop: 32 }}><span className="eyebrow">Independent Physician</span></div>
        <h1 className="serif fade-up">Independent physician care <em>near The Villages.</em></h1>
        <p className="fade-up delay-1">Explore regenerative medicine, hormone replacement therapy and wellness optimization with Kevin Stasney, MD. His practice, Years Younger MD, operates independently of SOZO Wellness Center.</p>
        <a href="#physician-services" className="btn btn-outline ip-services-jump" data-testid="link-physician-services">Explore physician services <ArrowRight size={17} aria-hidden="true" /></a>
      </div>
    </section>

    <section className="section ip-section" aria-labelledby="ip-profile-name">
      <div className="container ip-profile">
        <figure className="ip-photo">
          <img src="/images/kevin-stasney-md.jpg" alt="Kevin Stasney, MD" width="600" height="837" />
        </figure>
        <div className="ip-body">
          <span className="ip-label">Independent Physician</span>
          <h2 id="ip-profile-name" className="serif">Kevin Stasney, MD</h2>
          <dl className="ip-facts">
            <div><dt>Role</dt><dd>Independent Physician</dd></div>
            <div><dt>Practice</dt><dd>Years Younger MD</dd></div>
          </dl>
          <p>Kevin Stasney, MD offers personalized medical care for adults in The Villages, Wildwood and surrounding communities through Years Younger MD. His independent office is located inside SOZO Wellness Center in Wildwood, Florida.</p>
          <p>Whether you are exploring support for joint concerns, changes in energy or hormonal health, a medical consultation connects your symptoms and goals with an individualized treatment discussion.</p>
          <div className="ip-actions"><ExternalButton testId="link-yearsyoungermd" /></div>
          <aside className="ip-notice" role="note" data-testid="text-independent-notice">
            <Info size={20} aria-hidden="true" />
            <div>
              <strong>A separate medical practice</strong>
              <p>Years Younger MD is a separate medical practice operating independently of SOZO Wellness Center. Kevin Stasney, MD provides his medical services through that independent practice, not through SOZO.</p>
            </div>
          </aside>
          <h3 className="serif">Appointments and medical enquiries</h3>
          <p>Please contact Years Younger MD directly for appointments or questions about medical services. SOZO assessment requests and forms are not used for Years Younger MD appointments.</p>
        </div>
      </div>
    </section>

    <section id="physician-services" className="section ip-services" aria-labelledby="ip-services-heading">
      <div className="container">
        <header className="ip-services-header">
          <span className="eyebrow">Services through Years Younger MD</span>
          <h2 id="ip-services-heading" className="serif">Regenerative medicine &amp; whole-person medical care.</h2>
          <p>Looking for EBOO therapy, stem cell therapy, PRP or hormone replacement therapy near The Villages? Explore these services with Kevin Stasney, MD through his independent medical practice. Treatment recommendations follow a medical evaluation of your needs.</p>
        </header>
        <div className="ip-services-grid">
          {independentPhysicianServices.map((service, index) => (
            <article key={service.id} id={service.id} className="ip-service" aria-labelledby={`${service.id}-heading`} data-testid={`physician-service-${service.id}`}>
              <span className="ip-service-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <h3 id={`${service.id}-heading`} className="serif">{service.title}</h3>
              <p className="ip-service-focus">{service.focus}</p>
              <p>{service.description}</p>
              <p>{service.consultation}</p>
            </article>
          ))}
        </div>
        <div className="ip-services-contact">
          <div>
            <h2 className="serif">Discuss your next step with Years Younger MD.</h2>
            <p>For service details, availability and medical appointments, contact the independent practice directly. SOZO’s assessment form does not schedule appointments with Kevin Stasney, MD.</p>
          </div>
          <a href={`${YYMD_URL}/contact`} className="btn btn-primary ip-ext" target="_blank" rel="noopener noreferrer" data-testid="link-physician-contact">Contact Years Younger MD<span className="sr-only"> (opens in a new tab)</span> <ArrowUpRight size={17} aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  </>;
}

export function IndependentPhysicianPreview() {
  return (
    <section className="ip-preview" aria-labelledby="ip-preview-heading" data-testid="section-independent-preview">
      <div className="ip-preview-inner">
        <Link href="/independent-physicians" aria-label="Meet Kevin Stasney, MD" data-testid="link-preview-physician-photo">
          <img src="/images/kevin-stasney-md.jpg" alt="Kevin Stasney, MD" width="600" height="837" loading="lazy" />
        </Link>
        <div>
          <span className="eyebrow">Independent Physician</span>
          <h2 id="ip-preview-heading" className="serif">Independent medical care</h2>
          <h3 className="serif"><Link href="/independent-physicians" data-testid="link-preview-physician-name">Kevin Stasney, MD</Link> <span>Independent Physician, Years Younger MD</span></h3>
          <p>Years Younger MD is a separate medical practice operating independently of SOZO Wellness Center. Medical services are provided through that independent practice, not SOZO.</p>
          <p>Explore regenerative medicine, EBOO therapy, stem cell therapy, PRP, wellness optimization and hormone replacement therapy with Kevin Stasney, MD, serving The Villages area.</p>
          <div className="ip-preview-actions">
            <ExternalButton testId="link-preview-yearsyoungermd" />
            <Link href="/independent-physicians" className="btn btn-outline" data-testid="link-independent-physicians">Explore physician services <ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default IndependentPhysicians;
