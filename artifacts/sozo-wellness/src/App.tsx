import { useEffect, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, Route, Switch, useLocation, useSearch, Router as WouterRouter } from 'wouter';
import { ArrowRight, ArrowUpRight, BadgeCheck, Check, ChevronDown, Compass, Heart, Mail, MapPin, Menu, Phone, ShieldCheck, Sparkles, Waves, Wind, X } from 'lucide-react';
import { useSubmitAssessmentRequest } from '@workspace/api-client-react';
import { Form } from '@/components/ui/form';
import { ErrorBoundary } from '@/components/error-boundary';
import { ServiceBenefits } from '@/components/service-benefits';
import { ShockwaveComparison } from '@/components/shockwave-comparison';
import { WellnessDisclaimer } from '@/components/wellness-disclaimer';
import { TestimonialsStories } from '@/components/testimonials-stories';
import { ServiceHero } from '@/components/service-hero';
import { ServiceDiscovery, AssessmentFeature, GuideComingSoon, GoalCards, PatientExcerpts } from '@/components/home-discovery';
import { ASSESSMENT_CTA, getInquiryHref, type InquiryInterest } from '@/lib/inquiry';
import { serviceHeroes } from '@/data/discovery';
import { AssessmentsContent } from '@/components/assessments-content';
import { assessmentDetails } from '@/data/assessments';
import { getInquiryInterest, inquiryInterests } from '@/lib/inquiry';
import { assessmentErrorMessage, normalizeAssessmentMobile } from '@/lib/assessment-form';
import { AssessmentTurnstile } from '@/components/assessment-turnstile';
import { hyperbaricDetails } from '@/data/hyperbaric';
import { shockwaveDetails } from '@/data/shockwave';
import { cardioMedBedDetails } from '@/data/cardio-medbed';
import { wolfeBodyworkDetails } from '@/data/wolfe-bodywork';
import { rifeDetails } from '@/data/rife';
import { theraWellnessDetails } from '@/data/therawellness';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { PrivacyPolicy } from '@/components/privacy-policy';
import { ResearchListing, ResearchArticlePage, ResearchHighlights } from '@/components/research';
import { ProductsPartners } from '@/components/products-partners';
import { IndependentPhysicians, IndependentPhysicianPreview } from '@/components/independent-physicians';
import { AboutTeam } from '@/components/about-team';
import { PackagesPage } from '@/components/packages';
import { DODPowerPackClinic } from '@/components/dodpowerpack-clinic';
import { ChiropracticPage } from '@/components/chiropractic';
import { WholePersonWellness } from '@/components/whole-person-wellness';
import { WholeLifeCoachingPage, WholeLifeCoachingPreview } from '@/components/whole-life-coaching';
import { JaneBookingLink } from '@/components/jane-booking-link';

const queryClient = new QueryClient();
const SHOP = 'https://dod.live/darcelleburandt';
const services: { title: string; href: string; short: string; number: string; status?: string }[] = [
  { title: 'Wellness assessments', href: '/services/assessments', short: 'Compare bio-energetic reports, heart rate variability readings and live blood microscopy.', number: '01' },
  { title: 'Hyperbaric oxygen', href: '/services/hyperbaric-oxygen', short: 'Put recovery first with oxygen-focused chamber sessions for your whole-person wellness routine.', number: '02' },
  { title: 'Shockwave therapy', href: '/services/shockwave', short: 'Radial ESWT and CellSonic ESWT for comfort, movement and deeper pain concerns.', number: '03' },
  { title: 'Rife frequency', href: '/services/rife', short: 'Guided, mat-based electromagnetic frequency sessions offered as complementary wellness.', number: '04' },
  { title: 'TheraWellness', href: '/services/therawellness', short: 'Personalized, noninvasive wellness sessions focused on relaxation, balance and a calmer mind.', number: '05' },
  { title: 'Cardio MedBed', href: '/services/cardio-medbed', short: 'Noninvasive EECP designed to support heart health, circulation and oxygen delivery.', number: '06' },
  { title: 'Wolfe Non-Surgical Bodywork', href: '/services/wolfe-non-surgical-bodywork', short: 'Focused hands-on bodywork for deep tissue restrictions, flexibility and more comfortable movement.', number: '07' },
  { title: 'Chiropractic', href: '/chiropractic-care', short: 'Meet JT Anderson, DC and Lauren Alvarez Schmitz, DC, and explore personalized care for pain, mobility and everyday movement.', number: '08' },
  { title: 'Whole Life Wellness Coaching', href: '/services/whole-life-coaching', short: 'Wellness from the root: personal guidance for your mental, emotional, physical and spiritual well-being.', number: '09' },
];

const serviceMenu: { title: string; href: string; number: string; status?: string }[] = [
  ...services,
  { title: 'Independent Physician', href: '/independent-physicians', number: 'independent-physicians' },
  { title: 'Packages', href: '/services/packages', number: 'packages' },
  { title: 'DODPowerPack Clinic', href: '/dodpowerpack-clinic', number: 'dodpowerpack' },
];

export const SITE_URL = 'https://sozorootedwellness.com';
export const meta: Record<string, [string, string]> = {
  '/chiropractic-care': ['Chiropractic Care near The Villages, FL | SOZO', 'Meet JT Anderson, DC and Lauren Alvarez Schmitz, DC. Explore chiropractic care for neck and back pain, sports recovery and mobility at SOZO near The Villages.'],
  '/independent-physicians': ['Regenerative Medicine near The Villages | Kevin Stasney, MD', 'Explore EBOO, stem cell therapy, PRP, hormone replacement therapy and wellness optimization near The Villages with Kevin Stasney, MD at independent Years Younger MD.'],
  '/products-and-partners': ['Products & Partners | SOZO Wellness Center', 'Explore SOZO’s recommended wellness products and affiliate partners, from nutrition and sleep to frequency technology, plus H-Wave available through our clinic.'],
  '/research/brain-health-neuralchek': ['Brain Health, Stress and NeuralChek | SOZO Articles & Resources', 'Explore the brain–body connection, habits for mental clarity and how NeuralChek adds context to stress and recovery conversations.'],
  '/research/are-you-giving-yourself-time-to-recover': ['Are You Giving Yourself Time to Recover? | SOZO Articles & Resources', 'Make room for recovery without giving up what you love. Explore daily patterns, rest and the role of a NeuralChek assessment at SOZO.'],
  '/research/vitalyzer-assessment-first-look': ['A First Look at the Vitalyzer Assessment | SOZO Articles & Resources', 'Discover the Vitalyzer experience, its visual energetic report and the questions to bring to a personalized wellness conversation.'],
  '/research/live-blood-analysis-up-close': ['Live Blood Analysis: What to Expect | SOZO Articles & Resources', 'Learn what happens during Live Blood Analysis, what you see on screen and how the experience differs from a conventional laboratory test.'],
  '/research/your-first-rife-session': ['Your First Rife Session Explained | SOZO Articles & Resources', 'Explore frequency therapy at SOZO: the guided mat-based experience, questions to ask and how to consider your personal wellness goals.'],
  '/research/make-room-to-recharge-therawellness': ['Make Room to Recharge: Exploring TheraWellness | SOZO', 'Explore personalized TheraWellness sessions at SOZO and make room for relaxation, balance and your own well-being.'],
  '/research/energy-medicine-where-to-start': ['Interested in Energy Medicine? Where to Start | SOZO', 'Compare SOZO assessments and therapies, understand their different approaches and find a clear starting point for your wellness.'],
  '/research/cardio-medbed-heart-failure': ['Cardio MedBed and Heart Failure | SOZO Articles & Resources', 'Explore EECP research and heart-failure outcomes. Learn about Cardio MedBed, available at SOZO, and questions to discuss with your cardiologist.'],
  '/research/how-cardio-medbed-works': ['How Cardio MedBed Works | SOZO Articles & Resources', 'Learn the science behind external counterpulsation and what to ask before treatment. Cardio MedBed is available at SOZO.'],
  '/research/cellsonic-treatments': ['Cellsonic Treatments: A Patient’s Guide | SOZO Articles & Resources', 'Explore Cellsonic applications, the treatment experience and questions to ask about your care at SOZO Wellness Center.'],
  '/research/the-technology-behind-cellsonic': ['The Technology Behind Cellsonic | SOZO Articles & Resources', 'Learn about Cellsonic pressure pulses, tissue repair and what patients can expect when considering treatment at SOZO.'],
  '/': ['Whole-Life Wellness near The Villages, FL | SOZO', 'Wellness from the root near The Villages. Our whole life wellness coaches connect mental, emotional, physical and spiritual well-being with SOZO’s assessments and therapies.'],
  '/services': ['Wellness Services near The Villages, FL | SOZO', 'Explore Whole Life Wellness Coaching, assessments, hyperbaric oxygen, shockwave, Rife, TheraWellness and Cardio MedBed EECP near The Villages.'],
  '/services/whole-life-coaching': ['Whole Life Wellness Coaching near The Villages | SOZO', 'Wellness from the root: explore mental, emotional, physical and spiritual well-being with SOZO’s whole life wellness coaches in Wildwood near The Villages.'],
  '/services/assessments': ['Wellness Assessments near The Villages | SOZO', 'Explore Vitalyzer, NeuralChek and live blood analysis assessments near The Villages. We’ll help you find a starting point for your wellness goals.'],
  '/services/rife': ['Rife Frequency Therapy near The Villages | SOZO', 'Explore guided Rife frequency sessions near The Villages, Florida. We’ll explain the equipment, answer your questions and help you settle in.'],
  '/services/shockwave': ['Shockwave Therapy near The Villages | SOZO', 'Explore Radial ESWT and CellSonic ESWT for deeper pain concerns near The Villages. Learn about potential support for pain relief, tissue recovery and movement.'],
  '/services/hyperbaric-oxygen': ['Hyperbaric Oxygen near The Villages | SOZO', 'Recovery starts at the cellular level. Discover oxygen-focused chamber sessions near The Villages, with personal guidance at SOZO Wellness Center.'],
  '/services/therawellness': ['TheraWellness near The Villages | SOZO Wellness Center', 'Explore guided TheraWellness sessions near The Villages, with intended wellness benefits for relaxation, calm, personal balance and restorative rest.'],
  '/services/cardio-medbed': ['Cardio MedBed EECP near The Villages | SOZO', 'Available at SOZO: explore Cardio MedBed EECP for heart and circulatory wellness. Learn how it works, potential benefits and what a session involves.'],
  '/services/packages': ['Freedom Wellness Credits & Packages near The Villages | SOZO', 'Explore SOZO Freedom Wellness Credit packages, ten example wellness pathways and our Circulation & Vitality Program near The Villages, Florida.'],
  '/dodpowerpack-clinic': ['DODPowerPack Clinic near The Villages | SOZO', 'Explore Wolfe Non-Surgical Bodywork, Cellsonic and Cardio MedBed at SOZO, a Certified DODPowerPack Clinic serving The Villages.'],
  '/services/wolfe-non-surgical-bodywork': ['Wolfe Non-Surgical Bodywork near The Villages | SOZO', 'Explore targeted hands-on bodywork for deep tissue restrictions, flexibility and comfortable movement. Learn what a Wolfe Non-Surgical Bodywork session involves.'],
  '/about': ['About SOZO & Our Team | Serving The Villages, FL', 'Meet our whole life wellness coaches and discover wellness from the root: mental, emotional, physical and spiritual well-being near The Villages, Florida.'],
  '/testimonials': ['Patient Stories | SOZO Wellness Center', 'Read the personal stories people have shared with us, with each full testimonial told in their own words.'],
  '/request-assessment': ['Book Your Assessment | SOZO Wellness Center', 'Book online with SOZO through Jane, or contact our team about your wellness assessment near The Villages, Florida. Do not share medical history in the enquiry form.'],
  '/blog': ['Articles & Resources | SOZO Wellness Center', 'Explore articles and resources from SOZO Wellness Center about wellness assessments, therapies and whole-person care.'],
  '/research/hyperbaric-oxygen-therapy-a-comprehensive-guide': ['Hyperbaric Oxygen Therapy: A Comprehensive Guide | SOZO Articles & Resources', 'A SOZO Wellness Center guide to what hyperbaric oxygen therapy is, how it works and why residents of The Villages choose it.'],
  '/research/unlock-your-potential-with-the-energy-for-life-assessment': ['Unlock Your Potential with the Energy for Life Assessment | SOZO Articles & Resources', 'Learn how the Energy for Life Assessment at SOZO Wellness Center uses bioenergetics to look at the flow of energy in your body.'],
  '/research/benefits-of-hyperbaric-oxygen-therapy': ['The A-Z Guide to the Benefits of Hyperbaric Oxygen Therapy | SOZO Articles & Resources', 'An A-Z guide from SOZO Wellness Center exploring the benefits of hyperbaric oxygen therapy across a wide range of topics.'],
  '/research/the-revolutionary-anti-aging-benefits-of-hyperbaric-chambers': ['The Revolutionary Anti-Aging Benefits of Hyperbaric Oxygen Therapy | SOZO Articles & Resources', 'SOZO Wellness Center explores hyperbaric anti-aging therapy, the science behind it and real-life case studies.'],
  '/privacy-policy': ['Privacy Policy | SOZO Wellness Center', 'Learn how we handle website enquiries and personal information, our retention and email practices, and how to contact our privacy team or make a request.'],
};

function SEO() {
  const [location] = useLocation();
  useEffect(() => {
    const isKnownPage = Boolean(meta[location]);
    const [title, description] = meta[location] || ['Page not found | SOZO Wellness Center', 'Return to SOZO Wellness Center to explore our wellness services near The Villages, Florida.'];
    document.title = title;
    for (const [selector, attribute, name, value] of [
      ['meta[name="description"]', 'name', 'description', description],
      ['meta[property="og:title"]', 'property', 'og:title', title],
      ['meta[property="og:description"]', 'property', 'og:description', description],
      ['meta[name="twitter:title"]', 'name', 'twitter:title', title],
      ['meta[name="twitter:description"]', 'name', 'twitter:description', description],
      ['meta[name="robots"]', 'name', 'robots', isKnownPage ? 'index, follow' : 'noindex, follow'],
    ]) {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', value);
    }
    if (isKnownPage) {
      const url = `${SITE_URL}${location}`;
      let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = url;
      let ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
      if (!ogUrl) {
        ogUrl = document.createElement('meta');
        ogUrl.setAttribute('property', 'og:url');
        document.head.appendChild(ogUrl);
      }
      ogUrl.content = url;
    } else {
      document.querySelector('link[rel="canonical"]')?.remove();
      document.querySelector('meta[property="og:url"]')?.remove();
    }
    // Honour assessment links from the homepage, including initial page loads.
    const frame = window.requestAnimationFrame(() => {
      let target: HTMLElement | null = null;
      try {
        target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
      } catch {
        // A malformed fragment should not prevent normal page navigation.
      }
      if (target) target.scrollIntoView({ block: 'start', behavior: 'instant' });
      else window.scrollTo({ top: 0, behavior: 'instant' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location]);
  return null;
}

function Header() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  useEffect(() => { setOpen(false); setServicesOpen(false); }, [location]);
  const nav = [
    ['Home', '/'], ['About', '/about'], ['Testimonials', '/testimonials'], ['Articles & Resources', '/blog'], ['Products & Partners', '/products-and-partners']
  ];
  return <>
    <div className="topline"><div className="container"><span className="location">WHOLE-LIFE WELLNESS · SERVING THE VILLAGES, FL</span><a href="tel:+13528022248" data-testid="link-top-phone">Text or Call 352-802-2248</a></div></div>
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="SOZO Wellness Center home" data-testid="link-logo"><img src="/images/sozo-logo.png" width="76" height="76" alt="SOZO Wellness Center logo" /><span className="brand-type">Rooted in care<br />Serving The Villages</span></Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/" className={`nav-link ${location === '/' ? 'active' : ''}`} data-testid="link-nav-home">Home</Link>
          <div className="nav-services" onMouseEnter={() => setServicesOpen(true)} onMouseLeave={() => setServicesOpen(false)} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setServicesOpen(false); }} onKeyDown={e => { if (e.key === 'Escape') { setServicesOpen(false); e.currentTarget.querySelector('button')?.focus(); } }}>
            <button type="button" className={`nav-link nav-services-trigger ${location.startsWith('/services') ? 'active' : ''}`} aria-expanded={servicesOpen} aria-controls="services-dropdown" onClick={() => setServicesOpen(true)} data-testid="button-nav-services">Services <ChevronDown size={17} aria-hidden="true"/></button>
            {servicesOpen && <div id="services-dropdown" className="services-dropdown">
              <Link href="/services" onClick={() => setServicesOpen(false)} data-testid="link-nav-services">All services <ArrowRight size={17} aria-hidden="true"/></Link>
              {serviceMenu.map(s => <Link href={s.href} key={s.href} onClick={() => setServicesOpen(false)} data-testid={`link-nav-service-${s.number}`}><span>{s.title}{s.status && <small className="service-menu-status">{s.status}</small>}</span><ArrowRight size={17} aria-hidden="true"/></Link>)}
            </div>}
          </div>
          {nav.slice(1).map(([label, href]) => <Link href={href} key={href} className={`nav-link ${location === href ? 'active' : ''}`} data-testid={`link-nav-${label.toLowerCase()}`}>{label}</Link>)}
        </nav>
        <div className="header-actions"><a className="btn btn-outline shop-link" href={SHOP} target="_blank" rel="noopener noreferrer" data-testid="link-header-shop">Shop Now <ArrowUpRight size={15}/></a><JaneBookingLink className="btn btn-primary booking-link" testId="link-header-request"/><button type="button" className="menu-toggle" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-navigation" data-testid="button-mobile-menu">{open ? <X size={22}/> : <Menu size={22}/>}</button></div>
      </div>
      {open && <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation"><Link href="/" data-testid="link-mobile-home">Home <ArrowUpRight size={17}/></Link><Link href="/services" data-testid="link-mobile-services">All services <ArrowUpRight size={17}/></Link>{serviceMenu.map(s => <Link href={s.href} key={s.href} className="mobile-sub" data-testid={`link-mobile-${s.number}`}><span>{s.title}{s.status && <small className="service-menu-status">{s.status}</small>}</span><ArrowRight size={17}/></Link>)}{nav.slice(1).map(([label, href]) => <Link href={href} key={href} data-testid={`link-mobile-${label.toLowerCase()}`}>{label}<ArrowUpRight size={17}/></Link>)}<JaneBookingLink testId="link-mobile-request" onClick={() => setOpen(false)}/><Link href="/request-assessment" data-testid="link-mobile-enquiry">Contact / request information <ArrowRight size={16}/></Link><a href={SHOP} target="_blank" rel="noopener noreferrer" data-testid="link-mobile-shop">Shop Now <ArrowUpRight size={15}/></a></nav>}
    </header>
  </>;
}

function Footer() {
  return <footer className="site-footer"><div className="container">
    <div className="footer-grid">
      <div><Link href="/" data-testid="link-footer-logo"><img className="footer-logo" src="/images/sozo-logo.png" width="120" height="120" alt="SOZO Wellness Center logo" /></Link><p className="footer-blurb">Wellness from the root—for the whole you. We are whole life wellness coaches, bringing mental, emotional, physical and spiritual well-being into the conversation alongside our assessments and therapies.</p></div>
      <div className="footer-col"><h3>Explore</h3><Link href="/services" data-testid="link-footer-services">All services</Link><Link href="/services/whole-life-coaching" data-testid="link-footer-coaching">Whole Life Wellness Coaching</Link><Link href="/services/assessments" data-testid="link-footer-assessments">Assessments</Link><Link href="/services/hyperbaric-oxygen" data-testid="link-footer-hyperbaric">Hyperbaric oxygen</Link><Link href="/about" data-testid="link-footer-about">Our story</Link><Link href="/blog" data-testid="link-footer-research">Articles &amp; Resources</Link><Link href="/products-and-partners" data-testid="link-footer-partners">Products &amp; Partners</Link></div>
      <div className="footer-col"><h3>Connect</h3><JaneBookingLink className="" testId="link-footer-request"/><Link href="/request-assessment" data-testid="link-footer-enquiry">Contact / request information</Link><Link href="/testimonials" data-testid="link-footer-testimonials">Patient stories</Link><a href={SHOP} target="_blank" rel="noopener noreferrer" data-testid="link-footer-shop">Shop Now ↗</a><a href="tel:+13528022248" data-testid="link-footer-phone">Text or Call 352-802-2248</a><a href="mailto:info@sozorootedwellness.com" data-testid="link-footer-email">info@sozorootedwellness.com</a></div>
      <div className="footer-col"><h3>Visit us</h3><p>5029 Co Rd 159<br/>Wildwood, FL 34785</p><a href="https://maps.google.com/?q=5029+Co+Rd+159+Wildwood+FL+34785" target="_blank" rel="noopener noreferrer" data-testid="link-footer-directions">Get directions ↗</a><p>Serving The Villages and surrounding communities.</p></div>
    </div>
    <p className="footer-policy"><Link href="/privacy-policy" data-testid="link-footer-privacy">Privacy Policy</Link></p>
    <WellnessDisclaimer/>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} SOZO Wellness Center. All rights reserved.</span><span>Thoughtful care. Clear conversations. A path that feels like yours.</span></div>
  </div></footer>;
}

function Shell({ children }: { children: ReactNode }) { return <><SEO/><Header/><main id="main-content">{children}</main><Footer/></>; }
function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) { return <span className={`eyebrow ${light ? 'light' : ''}`}>{children}</span>; }
function CTA({ title = 'You don’t have to know where to begin.', text = 'Tell us what you’re hoping to understand or explore. We’ll help you find a thoughtful starting point.', href = '/request-assessment', label = ASSESSMENT_CTA }: { title?: string; text?: string; href?: string; label?: string }) {
  return <section className="contact-strip"><div className="container"><div><Eyebrow>A conversation first</Eyebrow><h2>{title}</h2><p className="section-intro">{text}</p></div><Link href={href} className="btn btn-primary" data-testid="link-cta-request">{label} <ArrowRight size={17}/></Link></div></section>;
}
function PageHero({ eyebrow, title, text, action = false }: { eyebrow: string; title: string; text: string; action?: boolean }) {
  return <section className="page-hero"><div className="container"><span className="crumb"><Link href="/" data-testid="link-breadcrumb-home">Home</Link> / {eyebrow}</span><div style={{ marginTop: 32 }}><Eyebrow>{eyebrow}</Eyebrow></div><h1 className="serif fade-up">{title}</h1><p className="fade-up delay-1">{text}</p>{action && <Link href="/request-assessment" className="btn btn-primary fade-up delay-2" data-testid="link-page-hero-request">{ASSESSMENT_CTA} <ArrowRight size={17}/></Link>}</div></section>;
}
function BadgeBand() { return <div className="badge-band"><div className="container badge-band-inner"><div className="badge-lockup"><span className="badge-seal"><BadgeCheck size={25} strokeWidth={1.3}/></span><div><strong>Certified DODPowerPack Clinic</strong><span>A commitment to supportive, whole-person wellness.</span></div></div><Link href="/dodpowerpack-clinic" data-testid="link-home-dodpowerpack">Explore our DODPowerPack Clinic <ArrowRight size={17} aria-hidden="true"/></Link></div></div>; }
function ServicesList({ limit }: { limit?: number }) {
  return <>
    <div className="service-list">{services.slice(0, limit).map(s => <Link className="service-row" href={s.href} key={s.href} data-testid={`link-service-${s.number}`}><span className="index">{s.number}</span><h3>{s.title}</h3><p>{s.short}</p><ArrowUpRight size={21}/></Link>)}</div>
    <IndependentPhysicianPreview/>
  </>;
}

function Home() {
  return <>
    <section className="hero"><div className="hero-grid"><div className="hero-copy"><Eyebrow>Whole Life Wellness Coaching · Serving The Villages</Eyebrow><h1 className="serif fade-up">Wellness from the root. <em>For the whole you.</em></h1><p className="fade-up delay-1">We are whole life wellness coaches. Your mental, emotional, physical and spiritual well-being are connected. At SOZO near The Villages, we bring personal guidance, holistic principles, assessments and advanced wellness therapies together—with you at the center.</p><div className="hero-actions fade-up delay-2"><Link href="/request-assessment" className="btn btn-primary" data-testid="link-hero-request">{ASSESSMENT_CTA} <ArrowRight size={17}/></Link><a href="#home-services" className="btn btn-outline" data-testid="link-hero-services">Explore our services <ArrowUpRight size={17}/></a></div></div><div className="hero-photo"><img src="/images/hyperbaric-chamber.png" width="1200" height="896" alt="Two visitors seated inside SOZO Wellness Center’s hyperbaric oxygen chamber" fetchPriority="high"/><div className="hero-photo-label"><strong>Step inside SOZO</strong>Our hyperbaric chamber at SOZO.</div></div></div><span className="hero-index">SOZO WELLNESS CENTER / 01</span></section>
    <BadgeBand/>
    <WholeLifeCoachingPreview/>
    <ServiceDiscovery/>
    <AssessmentFeature/>
    <GuideComingSoon/>
    <GoalCards/>
    <PatientExcerpts/>
    <section id="home-about" className="split-feature">
      <div className="split-visual"><img src="/images/inside-sozo.jpg" width="1024" height="705" loading="lazy" alt="Interior view of SOZO Wellness Center and its hyperbaric chamber"/><span className="image-caption">A look inside SOZO Wellness Center</span></div>
      <div className="split-content">
        <Eyebrow>Rooted in health and wellness</Eyebrow>
        <h2 className="serif">More than a service. Care for the whole you.</h2>
        <p>“Sozo” means “to save, heal or make whole.” That purpose guides our whole life wellness coaching: seeing your mind, body and spirit as connected, and making room for what matters most to you.</p>
        <dl className="home-wellness-dimensions">
          <div><dt>Mental wellness</dt><dd>Space to explore your thoughts, perspectives and the daily choices that reflect your goals.</dd></div>
          <div><dt>Emotional wellness</dt><dd>A compassionate space to feel heard and acknowledge the stresses and experiences you bring.</dd></div>
          <div><dt>Physical wellness</dt><dd>Movement, energy, rest and recovery for the life you want to live.</dd></div>
          <div><dt>Spiritual wellness</dt><dd>Respect for your beliefs, your sense of purpose and the connections that help you feel whole.</dd></div>
        </dl>
        <p>Our integrative care approach combines holistic principles with modern wellness technology and personal attention—not a one-size-fits-all plan.</p>
        <div className="home-philosophy-actions"><Link href="/about#whole-person-wellness" className="btn btn-text" data-testid="link-home-philosophy">Our whole-person approach <ArrowRight size={17}/></Link><Link href="/about#team" className="btn btn-outline" data-testid="link-home-team">Meet the Team <ArrowRight size={17}/></Link></div>
      </div>
    </section>
    <CTA/>
  </>;
}

function Services() { return <><PageHero eyebrow="Our services" title="The right starting point is yours to discover." text="You bring the questions. We’ll bring the time to listen, explain and explore. Browse our offerings by what interests you, without needing to know exactly what you need." action/><section className="section"><div className="container"><div className="section-header"><div><Eyebrow>Explore the possibilities</Eyebrow><h2 className="section-title serif">Explore your next step.</h2><p className="section-intro">Discover our assessments and therapies, including Cardio MedBed for heart and circulatory wellness. We’ll help you choose a starting point that reflects your goals and interests.</p></div></div><ServicesList/><Link href="/blog" className="btn btn-outline" style={{ marginTop: 32 }} data-testid="link-services-research">Articles &amp; Resources <ArrowRight size={16}/></Link></div></section><section className="section approach"><div className="container"><div className="quiet-card"><Eyebrow>Not sure where to start?</Eyebrow><h3>That’s completely okay.</h3><p>Begin with a conversation about what you hope to understand. We can help you navigate the options without asking you to self-select a protocol.</p><Link href="/request-assessment" className="btn btn-primary" data-testid="link-services-request">{ASSESSMENT_CTA} <ArrowRight size={16}/></Link></div></div></section></>; }

type Detail = { eyebrow: string; title: string; intro: string; availability?: string; heading: string; paragraphs: string[]; overview?: { title: string; text: string }; information?: { title: string; text: string }[]; blocks: { title: string; text: string; image?: string; imageAlt?: string; details?: { title: string; text: string }[] }[]; image?: string; imageAlt?: string; imageCaption?: string; imageFit?: 'cover' | 'contain'; imageAspectRatio?: string; imageLoading?: 'lazy' | 'eager' };
const details: Record<string, Detail> = {
  '/services/assessments': assessmentDetails,
  '/services/rife': rifeDetails,
  '/services/shockwave': shockwaveDetails,
  '/services/hyperbaric-oxygen': hyperbaricDetails,
  '/services/therawellness': theraWellnessDetails,
  '/services/cardio-medbed': cardioMedBedDetails,
  '/services/wolfe-non-surgical-bodywork': wolfeBodyworkDetails,
};
function ServiceDetail({ path }: { path: string }) {
  const d = details[path];
  const hero = serviceHeroes[path];
  const ctaProps = { href: getInquiryHref(hero.interest as InquiryInterest), label: hero.cta };
  if (path === '/services/assessments') return <><ServiceHero path={path} d={d} image="/images/clinic/live-blood-review.webp" imageAlt="A practitioner explaining live-blood images to a visitor beside a microscope" fit="cover"/><AssessmentsContent detail={d}/><ResearchHighlights topic="assessment"/><CTA title="There’s no one-size-fits-all next step." {...ctaProps}/></>;
  return <>
    <ServiceHero path={path} d={d}/>
    {path === '/services/shockwave' && <ShockwaveComparison/>}
    <section className="section">
      <div className="container detail-grid">
        <div className="detail-main">
          {d.overview && <div className="treat-overview" data-testid="service-overview"><Eyebrow>Why consider this service</Eyebrow><h3>{d.overview.title}</h3><p>{d.overview.text}</p></div>}
          <Eyebrow>A closer look</Eyebrow>
          <h2 style={{ marginTop: 20 }}>{d.heading}</h2>
          {d.paragraphs.map((p,i) => <p key={i}>{p}</p>)}
          {d.information?.map((item, i) => <section className="treatment-information" key={item.title} data-testid={`service-information-${i}`}>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </section>)}
          <ServiceBenefits path={path} blocks={d.blocks}/>
        </div>
        <aside className="detail-aside">
          <Eyebrow>Start here</Eyebrow>
          <h3>Curious if this fits your goals?</h3>
          <p>{d.availability || 'Explore your options here, or text or call us with questions.'}</p>
          <Link href={ctaProps.href} className="btn btn-primary" data-testid="link-detail-request">{hero.cta} <ArrowRight size={16}/></Link>
          <p><a href="tel:+13528022248" data-testid="link-detail-phone">Text or Call <strong>352-802-2248</strong></a></p>
          <p><Link href="/about#team">Meet the team</Link> · <Link href="/testimonials">Read patient stories</Link></p>
        </aside>
      </div>
    </section>
    {path === '/services/hyperbaric-oxygen' && <ResearchHighlights topic="hyperbaric"/>}
    {path === '/services/shockwave' && <ResearchHighlights topic="cellsonic"/>}
    {path === '/services/cardio-medbed' && <ResearchHighlights topic="cardio"/>}
    {path === '/services/wolfe-non-surgical-bodywork' && <section className="section"><div className="container"><Link href="/dodpowerpack-clinic" className="btn btn-outline" data-testid="link-bodywork-dodpowerpack">Explore our DODPowerPack Clinic <ArrowRight size={17}/></Link></div></section>}
    <CTA title="There’s no one-size-fits-all next step." text={d.availability} {...ctaProps}/>
  </>;
}

function About() {
  return <>
    <PageHero eyebrow="Our story" title="Wellness from the root. Mind, body and spirit." text="We are whole life wellness coaches. Mental, emotional, physical and spiritual well-being belong together. At SOZO, personal guidance, holistic principles and modern wellness technology support a whole-person approach to your daily life." action/>
    <section className="split-feature"><div className="split-visual"><img src="/images/waiting-area.jpg" width="1024" height="768" alt="The welcoming waiting area at SOZO Wellness Center" loading="lazy"/><span className="image-caption">Welcome to SOZO · Serving The Villages</span></div><div className="split-content"><Eyebrow>Our name. Our purpose.</Eyebrow><h2 className="serif">To save, heal or make whole.</h2><p>Our name, SOZO, comes from an ancient Greek word. Its biblical roots speak to restoration of the whole person—not only physical healing, but emotional and spiritual renewal. That meaning shapes the way we welcome and listen to you.</p><p>Serving The Villages and nearby communities, we see wellness as more than the service you choose. Your experiences, relationships, beliefs and everyday life belong in the conversation. We bring warmth, honesty and respect to helping you explore your next step.</p></div></section>
    <WholePersonWellness/>
    <AboutTeam/>
    <section className="section"><div className="container"><Eyebrow>What guides us</Eyebrow><h2 className="section-title serif">Four values. One human approach.</h2><div className="path-grid" style={{marginTop:45}}>{[{name:'Compassion',text:'We make space for questions, concerns and the whole person behind them.',icon:Heart},{name:'Integrity',text:'We speak honestly about what our tools can and cannot do.',icon:ShieldCheck},{name:'Innovation',text:'We stay curious about thoughtful ways to support wellness.',icon:Sparkles},{name:'Empowerment',text:'We help you understand your options so your decisions remain yours.',icon:Compass}].map((v,i)=><div className="path-card" key={v.name}><span className="path-no">0{i+1} / OUR VALUES</span><v.icon className="path-icon" size={31} strokeWidth={1.3}/><h3>{v.name}</h3><p>{v.text}</p></div>)}</div></div></section>
    <section id="inside-sozo" className="section approach"><div className="container"><div className="section-header"><div><Eyebrow>Inside our space</Eyebrow><h2 className="section-title serif">Come as you are.</h2></div><p className="section-intro">A closer look at our welcoming space and the guided wellness experiences you can explore at SOZO.</p></div><div className="clinic-gallery">{[
      { src: '/images/clinic/braintap-session.webp', alt: 'A visitor resting in a recliner while wearing a BrainTap headset', caption: 'A moment to relax with BrainTap' },
      { src: '/images/inside-sozo.jpg', alt: 'SOZO Wellness Center interior and hyperbaric chamber', caption: 'Inside SOZO Wellness Center' },
      { src: '/images/clinic/h-wave-session.webp', alt: 'A visitor reclining during an H-Wave session with the device beside the chair', caption: 'A guided H-Wave session' },
    ].map(photo => <figure key={photo.src}><img src={photo.src} alt={photo.alt} loading="lazy" width="1200" height="896"/><figcaption>{photo.caption}</figcaption></figure>)}</div></div></section>
    <CTA/>
  </>;
}

function Testimonials() { return <><PageHero eyebrow="Patient stories" title="Real experiences deserve their own words." text="Read the personal stories people have shared with us. Lightly edited for spelling, punctuation and readability, with each speaker’s experience and meaning preserved." action/><TestimonialsStories/><div className="container"><p className="section-intro" style={{marginBottom:60}}>These testimonials describe individual experiences, not medical advice or a guarantee of results. Some stories include other treatments and care settings; they do not describe a standard SOZO treatment plan. Services and experiences may vary.</p></div><CTA title="Your story starts with a conversation."/></>; }


type AssessmentForm = { name: string; email: string; phone: string; interest: string; message: string; consent: boolean; smsConsent: boolean; marketingConsent: boolean; website: string };
const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim();
// The Replit dev server is save-only; production builds always require verification.
const requiresTurnstile = import.meta.env.PROD || Boolean(turnstileSiteKey);
function RequestAssessment() {
  const mutation = useSubmitAssessmentRequest();
  const search = useSearch();
  const initialInterest = getInquiryInterest(search);
  const form = useForm<AssessmentForm>({ defaultValues: { name:'', email:'', phone:'', interest:initialInterest, message:'', consent:false, smsConsent:false, marketingConsent:false, website:'' } });
  const [success, setSuccess] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [challengeRevision, setChallengeRevision] = useState(0);
  useEffect(() => {
    // Update the selection on another service link without erasing entered details.
    form.setValue('interest', initialInterest);
    setSuccess(false);
  }, [initialInterest, form.setValue]);
  const onSubmit = (values: AssessmentForm) => {
    if (requiresTurnstile && !turnstileToken) return;
    const phone = normalizeAssessmentMobile(values.phone);
    if (!phone) {
      form.setError('phone', { type: 'validate', message: 'Please enter a valid mobile number, including the country code if outside the U.S.' });
      return;
    }
    mutation.mutate({ data: { name: values.name.trim(), email: values.email.trim(), phone, interest: values.interest, message: values.message.trim() || undefined, consent: values.consent as true, smsConsent: values.smsConsent, marketingConsent: values.marketingConsent, website: values.website, ...(requiresTurnstile ? { turnstileToken } : {}) } }, { onSuccess: receipt => { if (receipt.success) { setSuccess(true); form.reset({ name:'', email:'', phone:'', interest:initialInterest, message:'', consent:false, smsConsent:false, marketingConsent:false, website:'' }); } }, onError: () => {}, onSettled: () => { setTurnstileToken(''); setChallengeRevision(value => value + 1); } });
  };
  return <>
    <PageHero eyebrow={initialInterest ? `Your interest: ${initialInterest}` : 'Start with SOZO'} title={ASSESSMENT_CTA} text="Book online through Jane, or contact our team if you’d like help choosing a starting point. The enquiry form below does not reserve an appointment."/>
    <section className="section"><div className="container assessment-wrap">
      <div className="assessment-copy">
        <Eyebrow>Arrange your visit</Eyebrow><h2>A simple next step.</h2>
        <ol className="booking-steps">
          <li><strong>Book online with Jane.</strong> View available appointments and follow Jane’s steps to complete your booking.</li>
          <li><strong>Need help choosing?</strong> Text or call us at 352-802-2248, or use the enquiry form to tell us what interests you.</li>
          <li><strong>Check your confirmation.</strong> Your enquiry is not a booking; follow the confirmation details provided by Jane or our team.</li>
        </ol>
        {initialInterest && <p data-testid="booking-selected-interest">You’re interested in <strong>{initialInterest}</strong>. We can help you explore whether it fits your goals.</p>}
        <div className="contact-details">
          <JaneBookingLink className="btn btn-primary booking-phone" label="Book online with Jane" testId="link-form-jane"/>
          <span>Online booking opens securely on Jane in a new tab.</span>
          <a href="tel:+13528022248" className="btn btn-primary booking-phone" data-testid="link-form-phone"><Phone size={18} aria-hidden="true"/>Text or Call 352-802-2248</a>
          <a href="mailto:info@sozorootedwellness.com" data-testid="link-form-email"><Mail size={18}/>info@sozorootedwellness.com</a>
          <a href="https://maps.google.com/?q=5029+Co+Rd+159+Wildwood+FL+34785" target="_blank" rel="noopener noreferrer" data-testid="link-form-address"><MapPin size={18}/>5029 Co Rd 159, Wildwood, FL 34785</a>
        </div>
        <div className="notice">Please do not include medical history, symptoms or other sensitive health information in this form. For urgent medical needs, contact an appropriate healthcare provider.</div>
      </div>
      <div className="form-panel">{success ? (
        <div className="success-panel" role="status" data-testid="status-request-success">
          <Check size={43} strokeWidth={1.5}/><h2>Thank you—your request was submitted.</h2>
          <p data-testid="request-receipt-message">{mutation.data?.message || 'Your request was submitted for processing.'}</p>
          <p>An appointment is not booked until the details are confirmed with our team. To arrange your visit or follow up, please <a href="tel:+13528022248" data-testid="link-success-phone">text or call 352-802-2248</a> or email <a href="mailto:info@sozorootedwellness.com" data-testid="link-success-email">info@sozorootedwellness.com</a>.</p>
          <button type="button" className="btn btn-outline" onClick={() => { setSuccess(false); mutation.reset(); }} data-testid="button-send-another">Send another request <ArrowRight size={16}/></button>
        </div>
      ) : (
        <><h2>Prefer to write down your interest?</h2><p className="notice" data-testid="notice-booking-status">Use this form to submit an enquiry. Submitting a request does not book an appointment. You can also text or call us to arrange your visit.</p><Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div className="form-grid">
            <div className="form-field"><label htmlFor="name">Your name *</label><input id="name" autoComplete="name" placeholder="First and last name" maxLength={120} aria-invalid={!!form.formState.errors.name} data-testid="input-name" {...form.register('name',{required:'Please enter your name.',minLength:{value:2,message:'Please enter at least 2 characters.'}})}/>{form.formState.errors.name && <span className="form-error">{form.formState.errors.name.message}</span>}</div>
            <div className="form-field"><label htmlFor="email">Email address *</label><input id="email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={254} aria-invalid={!!form.formState.errors.email} data-testid="input-email" {...form.register('email',{required:'Please enter your email.',pattern:{value:/^[^\s@]+@[^\s@]+\.[^\s@]+$/,message:'Please enter a valid email.'}})}/>{form.formState.errors.email && <span className="form-error">{form.formState.errors.email.message}</span>}</div>
            <div className="form-field"><label htmlFor="phone">Mobile number *</label><input id="phone" type="tel" autoComplete="tel" placeholder="(352) 555-0123" maxLength={30} aria-required="true" aria-invalid={!!form.formState.errors.phone} aria-describedby={form.formState.errors.phone ? 'phone-error' : undefined} data-testid="input-phone" {...form.register('phone',{required:'Please enter your mobile number.',validate:value => normalizeAssessmentMobile(value) !== null || 'Please enter a valid mobile number, including the country code if outside the U.S.'})}/>{form.formState.errors.phone && <span className="form-error" id="phone-error">{form.formState.errors.phone.message}</span>}</div>
            <div className="form-field"><label htmlFor="interest">What interests you? *</label><select id="interest" defaultValue={initialInterest} aria-invalid={!!form.formState.errors.interest} data-testid="select-interest" {...form.register('interest',{required:'Please select an interest.'})}><option value="" disabled>Choose a starting point</option><option value="Not sure yet">I’m not sure yet</option>{inquiryInterests.map(interest => <option key={interest} value={interest}>{interest}</option>)}<option value="General question">General question</option></select>{form.formState.errors.interest && <span className="form-error">{form.formState.errors.interest.message}</span>}</div>
            <div className="form-field full"><label htmlFor="message">Anything else you’d like us to know? <span style={{fontWeight:400}}>(optional)</span></label><textarea id="message" maxLength={1500} placeholder="Share your general goals or questions. Please do not include medical history." data-testid="textarea-message" {...form.register('message')}/></div>
            <div className="form-field full" style={{position:'absolute',left:'-9999px'}} aria-hidden="true"><label htmlFor="website">Website</label><input id="website" tabIndex={-1} autoComplete="off" {...form.register('website')}/></div>
            <div className="form-field full"><label className="form-check" htmlFor="consent"><input id="consent" type="checkbox" data-testid="checkbox-consent" {...form.register('consent',{required:'Please confirm before sending.'})}/><span>I agree that SOZO Wellness Center may contact me about my request by email or phone. I understand this form is not for medical information. *</span></label>{form.formState.errors.consent && <span className="form-error">{form.formState.errors.consent.message}</span>}</div>
            <div className="form-field full"><label className="form-check" htmlFor="sms-consent"><input id="sms-consent" type="checkbox" data-testid="checkbox-sms-consent" {...form.register('smsConsent')}/><span>I’d like to receive automated text messages from SOZO Wellness Center about my assessment request, including an acknowledgement and follow-up. This is optional and not a condition of booking or purchase. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help.</span></label></div>
            <div className="form-field full"><label className="form-check" htmlFor="marketing-consent"><input id="marketing-consent" type="checkbox" data-testid="checkbox-marketing-consent" {...form.register('marketingConsent')}/><span>I’d also like to receive SOZO Wellness Center news, updates and promotional emails. This is optional, and I can unsubscribe at any time.</span></label></div>
          </div>
          <p style={{color:'#31564f',fontSize:16,lineHeight:1.65,marginTop:20}}>Text messages and marketing emails are optional and depend on your choices above. Do not submit sensitive health details. Submitting this form does not establish a patient-provider relationship or reserve an appointment.</p>
          {requiresTurnstile ? <AssessmentTurnstile siteKey={turnstileSiteKey} revision={challengeRevision} onToken={setTurnstileToken}/> : <p className="notice">Development preview: this form saves locally and does not test Cloudflare spam protection or send messages.</p>}
          {mutation.isError && <div role="alert" className="form-status error" data-testid="status-request-error">{assessmentErrorMessage(mutation.error)}<a href="tel:+13528022248" data-testid="link-error-phone">text or call us at 352-802-2248</a>.</div>}
          {mutation.data && !mutation.data.success && <div role="alert" className="form-status error" data-testid="status-request-rejected">{mutation.data.message || 'We could not process your request. Please try again.'}</div>}
          <button type="submit" className="btn btn-primary form-submit" disabled={mutation.isPending || (requiresTurnstile && !turnstileToken)} data-testid="button-submit-request">{mutation.isPending ? 'Submitting your request…' : 'Submit my request'} {!mutation.isPending && <ArrowRight size={17}/>}</button>
        </form></Form></>
      )}</div>
    </div></section>
  </>;
}

function NotFound() { return <><PageHero eyebrow="Page not found" title="Looks like this path took a turn." text="The page you’re looking for isn’t here. Let’s get you back to a place where we can help."/><section className="section"><div className="container"><Link href="/" className="btn btn-primary" data-testid="link-404-home">Return home <ArrowRight size={17}/></Link></div></section></>; }
function RoutedErrorBoundary({ children }: { children: ReactNode }) { const [location] = useLocation(); return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>; }
function Router() {
  return <Shell><RoutedErrorBoundary>
    <Switch>
      <Route path="/" component={Home}/>
      <Route path="/services" component={Services}/>
      <Route path="/services/assessments">{() => <ServiceDetail path="/services/assessments"/>}</Route>
      <Route path="/services/rife">{() => <ServiceDetail path="/services/rife"/>}</Route>
      <Route path="/services/shockwave">{() => <ServiceDetail path="/services/shockwave"/>}</Route>
      <Route path="/services/hyperbaric-oxygen">{() => <ServiceDetail path="/services/hyperbaric-oxygen"/>}</Route>
      <Route path="/services/therawellness">{() => <ServiceDetail path="/services/therawellness"/>}</Route>
      <Route path="/services/cardio-medbed">{() => <ServiceDetail path="/services/cardio-medbed"/>}</Route>
      <Route path="/services/wolfe-non-surgical-bodywork">{() => <ServiceDetail path="/services/wolfe-non-surgical-bodywork"/>}</Route>
      <Route path="/services/packages" component={PackagesPage}/>
      <Route path="/services/whole-life-coaching" component={WholeLifeCoachingPage}/>
      <Route path="/dodpowerpack-clinic" component={DODPowerPackClinic}/>
      <Route path="/about" component={About}/>
      <Route path="/testimonials" component={Testimonials}/>
      <Route path="/request-assessment" component={RequestAssessment}/>
      <Route path="/blog" component={ResearchListing}/>
      <Route path="/products-and-partners" component={ProductsPartners}/>
      <Route path="/independent-physicians" component={IndependentPhysicians}/>
      <Route path="/chiropractic-care" component={ChiropracticPage}/>
      <Route path="/research/brain-health-neuralchek">{() => <ResearchArticlePage slug="brain-health-neuralchek"/>}</Route>
      <Route path="/research/are-you-giving-yourself-time-to-recover">{() => <ResearchArticlePage slug="are-you-giving-yourself-time-to-recover"/>}</Route>
      <Route path="/research/vitalyzer-assessment-first-look">{() => <ResearchArticlePage slug="vitalyzer-assessment-first-look"/>}</Route>
      <Route path="/research/live-blood-analysis-up-close">{() => <ResearchArticlePage slug="live-blood-analysis-up-close"/>}</Route>
      <Route path="/research/your-first-rife-session">{() => <ResearchArticlePage slug="your-first-rife-session"/>}</Route>
      <Route path="/research/make-room-to-recharge-therawellness">{() => <ResearchArticlePage slug="make-room-to-recharge-therawellness"/>}</Route>
      <Route path="/research/energy-medicine-where-to-start">{() => <ResearchArticlePage slug="energy-medicine-where-to-start"/>}</Route>
      <Route path="/research/cardio-medbed-heart-failure">{() => <ResearchArticlePage slug="cardio-medbed-heart-failure"/>}</Route>
      <Route path="/research/how-cardio-medbed-works">{() => <ResearchArticlePage slug="how-cardio-medbed-works"/>}</Route>
      <Route path="/research/cellsonic-treatments">{() => <ResearchArticlePage slug="cellsonic-treatments"/>}</Route>
      <Route path="/research/the-technology-behind-cellsonic">{() => <ResearchArticlePage slug="the-technology-behind-cellsonic"/>}</Route>
      <Route path="/research/hyperbaric-oxygen-therapy-a-comprehensive-guide">{() => <ResearchArticlePage slug="hyperbaric-oxygen-therapy-a-comprehensive-guide"/>}</Route>
      <Route path="/research/unlock-your-potential-with-the-energy-for-life-assessment">{() => <ResearchArticlePage slug="unlock-your-potential-with-the-energy-for-life-assessment"/>}</Route>
      <Route path="/research/benefits-of-hyperbaric-oxygen-therapy">{() => <ResearchArticlePage slug="benefits-of-hyperbaric-oxygen-therapy"/>}</Route>
      <Route path="/research/the-revolutionary-anti-aging-benefits-of-hyperbaric-chambers">{() => <ResearchArticlePage slug="the-revolutionary-anti-aging-benefits-of-hyperbaric-chambers"/>}</Route>
      <Route path="/privacy-policy" component={PrivacyPolicy}/>
      <Route component={NotFound}/>
    </Switch>
  </RoutedErrorBoundary></Shell>;
}
function App({ ssrPath }: { ssrPath?: string }) { return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')} ssrPath={ssrPath}><Router/></WouterRouter><Toaster/></TooltipProvider></QueryClientProvider>; }
export default App;
