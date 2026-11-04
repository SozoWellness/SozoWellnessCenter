import { Link } from 'wouter';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { discoveryServices, excerpts, goalCards } from '@/data/discovery';
import { ASSESSMENT_CTA, getInquiryHref } from '@/lib/inquiry';
import { PerfectDayInvitation } from '@/components/perfect-day-book';
import './home-discovery.css';

export function ServiceDiscovery() {
  return <section className="hd-services section" id="home-services" data-testid="section-discovery"><div className="container">
    <div className="hd-head"><div><span className="eyebrow">Our services</span><h2 className="section-title serif">Find your place to <em>begin.</em></h2></div><p className="section-intro">Our whole life wellness coaches help you connect your goals with our assessments and therapies, including Cardio MedBed for heart and circulatory wellness.</p></div>
    <div className="hd-grid">{discoveryServices.map((s, i) => <Link key={s.href} href={s.href} className="hd-card" data-testid={`link-discover-${i}`}>
      <span className="hd-img"><img src={s.image} alt={s.alt} loading="lazy" width={600} height={420} style={{ objectPosition: s.position }}/></span>
      <span className="hd-body"><span className="hd-no">0{i + 1}</span>{s.status && <span className="hd-soon hd-service-status">{s.status}</span>}<h3>{s.title}</h3><p>{s.text}</p><span className="hd-more">Learn more <ArrowUpRight size={16} aria-hidden="true"/></span></span>
    </Link>)}</div>
  </div></section>;
}

export function AssessmentFeature() {
  const items = [
    { n: 'Vitalyzer', img: '/images/clinic/vitalyzer-assessment.webp', alt: 'A visitor holding a Vitalyzer sensor with guidance from a practitioner', t: 'A visual bio-energetic report to review with our team.', href: '/services/assessments#vitalyzer' },
    { n: 'NeuralChek', img: '/images/clinic/neuralchek-assessment.webp', alt: 'A practitioner checking a seated visitor’s NeuralChek sensors', t: 'Heart rate variability readings on stress and recovery.', href: '/services/assessments#neuralchek' },
    { n: 'Live blood analysis', img: '/images/clinic/live-blood-session.webp', alt: 'A visitor and practitioner seated beside a live-blood microscope and monitor', t: 'A close-up microscope view of a blood sample.', href: '/services/assessments#live-blood' },
  ];
  return <section className="hd-assess section" data-testid="section-assessment-feature"><div className="container">
    <div className="hd-head"><div><span className="eyebrow light">Wellness assessments</span><h2 className="section-title serif">Three assessments. <em>Three different questions.</em></h2></div><Link href="/services/assessments#compare" className="btn btn-light" data-testid="link-feature-compare">Compare all three <ArrowRight size={16} aria-hidden="true"/></Link></div>
    <div className="hd-trio">{items.map((a, i) => <Link key={a.n} href={a.href} className="hd-assess-card" data-testid={`link-feature-assessment-${i}`}>
      <span className="hd-img"><img src={a.img} alt={a.alt} loading="lazy" width={1200} height={896}/></span>
      <h3>{a.n}</h3><p>{a.t}</p><span className="hd-more">Read about {a.n} <ArrowRight size={15} aria-hidden="true"/></span>
    </Link>)}</div>
  </div></section>;
}

export function GuideComingSoon() {
  return <PerfectDayInvitation/>;
}

export function GoalCards() {
  return <section className="section pathways" id="how-we-help" aria-labelledby="how-we-help-title"><div className="container"><div className="section-header"><div><span className="eyebrow">How We Help</span><h2 id="how-we-help-title" className="section-title serif">What would you like to feel <em>more of?</em></h2></div><p className="section-intro">Choose what resonates, or simply reach out and let’s talk it through.</p></div>
    <div className="hd-goals">{goalCards.map((g, i) => <Link href={g.href} className="hd-goal" key={g.title} data-testid={`link-goal-${i}`}><span className="hd-goal-tag">{g.service}</span><h3>{g.title}</h3><p>{g.text}</p><span className="hd-more">Explore {g.service} <ArrowRight size={15} aria-hidden="true"/></span></Link>)}</div>
    <p className="hd-goal-foot">Not sure where to start? An assessment can help.</p>
    <p className="hd-goal-foot"><Link href={getInquiryHref('Wellness assessments')} className="btn btn-primary" data-testid="link-goals-assessment">{ASSESSMENT_CTA} <ArrowRight size={15} aria-hidden="true"/></Link></p>
  </div></section>;
}

export function PatientExcerpts() {
  return <section className="hd-quotes section" id="patient-stories" data-testid="section-excerpts"><div className="container">
    <div className="hd-head"><div><span className="eyebrow">Patient stories</span><h2 className="section-title serif">In their own words.</h2></div><Link href="/testimonials" className="btn btn-outline" data-testid="link-excerpts-all">Read the full stories <ArrowRight size={16} aria-hidden="true"/></Link></div>
    <div className="hd-quote-row">{excerpts.map(e => <figure key={e.name}><blockquote>“{e.quote}”</blockquote><figcaption>{e.name}<span className="hd-quote-context">{e.context}</span></figcaption></figure>)}</div>
  </div></section>;
}
